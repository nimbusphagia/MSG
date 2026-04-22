import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/config/express";
import prisma from "../src/config/prisma";

describe("Contact Controller Integration Tests", () => {
  const aliceAgent = request.agent(app);
  const bobAgent = request.agent(app);
  const charlieAgent = request.agent(app);

  let aliceId: string;
  let bobId: string;
  let contactId: string;

  beforeAll(async () => {
    const s1 = await request(app).post("/auth/signup").send({
      username: "alice_contact", name: "Alice", password: "Password1!"
    });
    aliceId = s1.body.id;
    await aliceAgent.post("/auth/login").send({ username: "alice_contact", password: "Password1!" });

    const s2 = await request(app).post("/auth/signup").send({
      username: "bob_contact", name: "Bob", password: "Password1!"
    });
    bobId = s2.body.id;
    await bobAgent.post("/auth/login").send({ username: "bob_contact", password: "Password1!" });

    await request(app).post("/auth/signup").send({
      username: "charlie_contact", name: "Charlie", password: "Password1!"
    });
    await charlieAgent.post("/auth/login").send({ username: "charlie_contact", password: "Password1!" });
  });

  describe("POST /api/user/contact", () => {
    it("should allow Alice to add Bob as a contact (201)", async () => {
      const res = await aliceAgent
        .post("/api/user/contact")
        .send({ userId: bobId });

      expect(res.status).toBe(201);
      expect(res.body.userId).toBe(bobId);
      expect(res.body.ownerId).toBe(aliceId);
      contactId = res.body.id;
    });

    it("should return 400 if Alice tries to add herself", async () => {
      const res = await aliceAgent
        .post("/api/user/contact")
        .send({ userId: aliceId });

      expect(res.status).toBe(400);
    });

    it("should return 409 if Alice tries to add Bob again", async () => {
      const res = await aliceAgent
        .post("/api/user/contact")
        .send({ userId: bobId });

      expect(res.status).toBe(409);
    });
  });

  describe("GET /api/user/contact", () => {
    it("should return Alice's contact list with Bob included", async () => {
      const res = await aliceAgent.get("/api/user/contact");
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body[0].userId).toBe(bobId);

      expect(res.body[0].user).toBeDefined();
      expect(res.body[0].user.username).toBe("bob_contact");
    });
  });

  describe("PATCH /api/user/contact/:id (Nickname)", () => {
    it("should allow Alice to edit Bob's nickname", async () => {
      const res = await aliceAgent
        .patch(`/api/user/contact/${contactId}`)
        .send({ nickname: "Bob the Builder" });

      expect(res.status).toBe(200);
      expect(res.body.nickname).toBe("Bob the Builder");
    });

    it("should return 404/403 if Charlie tries to edit Alice's contact nickname", async () => {
      const res = await charlieAgent
        .patch(`/api/user/contact/${contactId}`)
        .send({ nickname: "Hacker" });

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/user/contact/block/:id", () => {
    it("should toggle the blocked status for Alice", async () => {
      const res = await aliceAgent.patch(`/api/user/contact/block/${contactId}`);
      expect(res.status).toBe(200);
      expect(res.body.isBlocked).toBe(true);

      const res2 = await aliceAgent.patch(`/api/user/contact/block/${contactId}`);
      expect(res2.body.isBlocked).toBe(false);
    });
  });

  describe("DELETE /api/user/contact/:id", () => {
    it("should return 404 if Charlie tries to delete Alice's contact", async () => {
      const res = await charlieAgent.delete(`/api/user/contact/${contactId}`);
      expect(res.status).toBe(404);
    });

    it("should return 204 when Alice removes Bob", async () => {
      const res = await aliceAgent.delete(`/api/user/contact/${contactId}`);
      expect(res.status).toBe(204);

      const check = await prisma.contact.findUnique({ where: { id: contactId } });
      expect(check).toBeNull();
    });
  });
});
