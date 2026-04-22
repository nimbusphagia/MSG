import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/config/express";
import prisma from "../src/config/prisma";

describe("User Controller Integration Tests", () => {
  const user1Agent = request.agent(app);
  const user2Agent = request.agent(app);

  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    // Setup User 1 (Alice)
    const s1 = await request(app).post("/auth/signup").send({
      username: "alice",
      name: "Alice",
      password: "Password1!",
    });
    user1Id = s1.body.id;
    await user1Agent.post("/auth/login").send({ username: "alice", password: "Password1!" });

    // Setup User 2 (Bob)
    const s2 = await request(app).post("/auth/signup").send({
      username: "bob",
      name: "Bob",
      password: "Password1!",
    });
    user2Id = s2.body.id;
    await user2Agent.post("/auth/login").send({ username: "bob", password: "Password1!" });
  });

  describe("GET /api/user", () => {
    it("should return 200 and list of users", async () => {
      const res = await user1Agent.get("/api/user");
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it("should return 401 if not logged in", async () => {
      const res = await request(app).get("/api/user");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/user/:id", () => {
    it("should return user data for valid ID", async () => {
      const res = await user1Agent.get(`/api/user/${user2Id}`);
      expect(res.status).toBe(200);
      expect(res.body.username).toBe("bob");
    });

    it("should return 404 for non-existent UUID", async () => {
      const validUuidV7 = "018f0a12-3456-7890-abcd-ef1234567890";
      const res = await user1Agent.get(`/api/user/${validUuidV7}`);

      expect(res.status).toBe(404);
    });

    it("should return 400 for invalid UUID format", async () => {
      const res = await user1Agent.get("/api/user/123-not-uuid");
      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /api/user/:id", () => {
    it("should allow a user to edit their own profile", async () => {
      const res = await user1Agent
        .patch(`/api/user/${user1Id}`)
        .send({ name: "Alice Updated" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Alice Updated");
    });

    it("should return 409 if changing username to one already taken", async () => {
      const res = await user1Agent
        .patch(`/api/user/${user1Id}`)
        .send({ username: "bob" });

      expect(res.status).toBe(409);
    });

    it("should return 403 if trying to edit another user", async () => {
      const res = await user1Agent
        .patch(`/api/user/${user2Id}`)
        .send({ name: "Hacker Alice" });

      expect(res.status).toBe(403);
    });

    it("should return 400 if no fields are provided", async () => {
      const res = await user1Agent.patch(`/api/user/${user1Id}`).send({});
      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /api/user/password/:id", () => {
    it("should return 401 for incorrect old password", async () => {
      const res = await user1Agent
        .patch(`/api/user/password/${user1Id}`)
        .send({
          oldPassword: "WrongPassword123!",
          newPassword: "NewPassword123!"
        });

      expect(res.status).toBe(401);
    });

    it("should return 200 on successful password change", async () => {
      const res = await user1Agent
        .patch(`/api/user/password/${user1Id}`)
        .send({ oldPassword: "Password1!", newPassword: "NewPassword1!" });

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/user/:id", () => {
    it("should return 401 if password is wrong during deletion", async () => {
      const res = await user2Agent
        .delete(`/api/user/${user2Id}`)
        .send({ password: "WrongPassword123!" });

      expect(res.status).toBe(401);
    });

    it("should return 204 on successful self-deletion", async () => {
      const res = await user2Agent
        .delete(`/api/user/${user2Id}`)
        .send({ password: "Password1!" });

      expect(res.status).toBe(204);

      const check = await prisma.user.findUnique({ where: { id: user2Id } });
      expect(check).toBeNull();
    });
  });
});
