import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/config/express";
import prisma from "../src/config/prisma";

describe("Chat Controller Integration Tests", () => {
  const aliceAgent = request.agent(app);
  const bobAgent = request.agent(app);
  const charlieAgent = request.agent(app);

  let aliceId: string;
  let bobId: string;
  let chatId: string;

  beforeAll(async () => {
    const s1 = await request(app).post("/auth/signup").send({
      username: "alice_chat", name: "Alice", password: "Password1!"
    });
    aliceId = s1.body.id;
    await aliceAgent.post("/auth/login").send({ username: "alice_chat", password: "Password1!" });

    const s2 = await request(app).post("/auth/signup").send({
      username: "bob_chat", name: "Bob", password: "Password1!"
    });
    bobId = s2.body.id;
    await bobAgent.post("/auth/login").send({ username: "bob_chat", password: "Password1!" });

    await request(app).post("/auth/signup").send({
      username: "charlie_chat", name: "Charlie", password: "Password1!"
    });
    await charlieAgent.post("/auth/login").send({ username: "charlie_chat", password: "Password1!" });

  });

  describe("POST /api/chat", () => {
    it("should allow Alice to start a chat with Bob", async () => {
      const res = await aliceAgent
        .post("/api/chat")
        .send({ contactId: bobId });

      expect(res.status).toBe(201);
      expect(res.body.isGroup).toBe(false);
      expect(res.body.members).toHaveLength(2);
      chatId = res.body.id;
    });

    it("should return 409 if Alice tries to create the same chat again", async () => {
      const res = await aliceAgent
        .post("/api/chat")
        .send({ contactId: bobId });

      expect(res.status).toBe(409);
    });
  });

  describe("GET /api/chat", () => {
    it("should return the chat in Alice's list (Lazy/Omit view)", async () => {
      const res = await aliceAgent.get("/api/chat");
      expect(res.status).toBe(200);
      expect(res.body[0]).not.toHaveProperty("members");
      expect(res.body[0].id).toBe(chatId);
    });

    it("should also show the chat in Bob's list", async () => {
      const res = await bobAgent.get("/api/chat");
      expect(res.status).toBe(200);
      expect(res.body.some((c: any) => c.id === chatId)).toBe(true);
    });
  });

  describe("GET /api/chat/:id", () => {
    it("should allow Alice to get full chat details (with members/messages)", async () => {
      const res = await aliceAgent.get(`/api/chat/${chatId}`);
      expect(res.status).toBe(200);
      expect(res.body.members).toBeDefined();
      expect(res.body.messages).toBeInstanceOf(Array);
    });

    it("should return 404 if Charlie tries to access the chat", async () => {
      const res = await charlieAgent.get(`/api/chat/${chatId}`);
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/chat/:id", () => {
    it("should return 404 if Bob (not the creator) tries to delete the chat", async () => {
      const res = await bobAgent.delete(`/api/chat/${chatId}`);
      expect(res.status).toBe(404);
    });

    it("should allow Alice (the creator) to delete the chat", async () => {
      const res = await aliceAgent.delete(`/api/chat/${chatId}`);
      expect(res.status).toBe(204);

      const check = await prisma.chat.findUnique({ where: { id: chatId } });
      expect(check).toBeNull();
    });
  });
});
