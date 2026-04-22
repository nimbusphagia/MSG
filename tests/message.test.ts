import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/config/express";
import prisma from "../src/config/prisma";

describe("Message Controller Integration Tests", () => {
  const aliceAgent = request.agent(app);
  const bobAgent = request.agent(app);
  const charlieAgent = request.agent(app);

  let aliceId: string;
  let bobId: string;
  let chatId: string;

  beforeAll(async () => {
    const users = await Promise.all([
      request(app).post("/auth/signup").send({ username: "alice_m", name: "Alice", password: "Password1!" }),
      request(app).post("/auth/signup").send({ username: "bob_m", name: "Bob", password: "Password1!" }),
      request(app).post("/auth/signup").send({ username: "charlie_m", name: "Charlie", password: "Password1!" }),
    ]);

    aliceId = users[0].body.id;
    bobId = users[1].body.id;

    await aliceAgent.post("/auth/login").send({ username: "alice_m", password: "Password1!" });
    await bobAgent.post("/auth/login").send({ username: "bob_m", password: "Password1!" });
    await charlieAgent.post("/auth/login").send({ username: "charlie_m", password: "Password1!" });

    const chatRes = await aliceAgent.post("/api/chat").send({ contactId: bobId });
    chatId = chatRes.body.id;
  });


  describe("Unauthenticated requests", () => {
    it("should reject unauthenticated POST to /api/chat/message with 401", async () => {
      const res = await request(app)
        .post("/api/chat/message")
        .send({ chatId, content: "ghost message", type: "TEXT" });
      expect(res.status).toBe(401);
    });

    it("should reject unauthenticated PUT to /api/chat/message/:id with 401", async () => {
      const res = await request(app)
        .put("/api/chat/message/00000000-0000-0000-0000-000000000000")
        .send({ chatId, content: "ghost edit", type: "TEXT" });
      expect(res.status).toBe(401);
    });

    it("should reject unauthenticated DELETE to /api/chat/message/:id with 401", async () => {
      const res = await request(app)
        .delete("/api/chat/message/00000000-0000-0000-0000-000000000000");
      expect(res.status).toBe(401);
    });
  });


  describe("Input validation", () => {
    it("should reject a message with an invalid type with 400", async () => {
      const res = await aliceAgent
        .post("/api/chat/message")
        .send({ chatId, content: "hello", type: "INVALID_TYPE" });
      expect(res.status).toBe(400);
    });

    it("should allow sending a message with no content (e.g. image upload)", async () => {
      const res = await aliceAgent
        .post("/api/chat/message")
        .send({ chatId, type: "IMAGE", metadata: { url: "https://picsum.photos/200" } });
      expect(res.status).toBe(201);
      expect(res.body.content).toBeNull();
    });

    it("should reject a message with missing type with 400", async () => {
      const res = await aliceAgent
        .post("/api/chat/message")
        .send({ chatId, content: "no type here" });
      expect(res.status).toBe(400);
    });

    it("should reject a message with an invalid chatId with 400", async () => {
      const res = await aliceAgent
        .post("/api/chat/message")
        .send({ chatId: "not-a-uuid", content: "hello", type: "TEXT" });
      expect(res.status).toBe(400);
    });
  });


  describe("POST /api/chat/message", () => {
    it("should allow Alice to send a message", async () => {
      const res = await aliceAgent
        .post("/api/chat/message")
        .send({ chatId, content: "Hello Bob!", type: "TEXT" });
      expect(res.status).toBe(201);
      expect(res.body.content).toBe("Hello Bob!");
      expect(res.body.id).toBeDefined();
    });

    it("should allow Bob (the other member) to send a message", async () => {
      const res = await bobAgent
        .post("/api/chat/message")
        .send({ chatId, content: "Hey Alice!", type: "TEXT" });
      expect(res.status).toBe(201);
      expect(res.body.content).toBe("Hey Alice!");
      expect(res.body.id).toBeDefined();
    });

    it("should prevent Charlie (non-member) from sending a message", async () => {
      const res = await charlieAgent
        .post("/api/chat/message")
        .send({ chatId, content: "I am crashing this chat", type: "TEXT" });
      expect(res.status).toBe(404);
    });
  });


  describe("PUT /api/chat/message/:messageId", () => {
    let aliceMessageId: string;

    beforeAll(async () => {
      const res = await aliceAgent
        .post("/api/chat/message")
        .send({ chatId, content: "Alice's editable message", type: "TEXT" });
      aliceMessageId = res.body.id;
    });

    it("should allow Alice to edit her own message", async () => {
      const res = await aliceAgent
        .put(`/api/chat/message/${aliceMessageId}`)
        .send({ chatId, content: "Alice's editable message (updated)", type: "TEXT" });
      expect(res.status).toBe(200);
      expect(res.body.content).toBe("Alice's editable message (updated)");
    });

    it("should prevent Bob from editing Alice's message", async () => {
      const res = await bobAgent
        .put(`/api/chat/message/${aliceMessageId}`)
        .send({ chatId, content: "Bob trying to edit", type: "TEXT" });
      expect(res.status).toBe(404);
    });
  });


  describe("DELETE /api/chat/message/:messageId", () => {
    let aliceMessageId: string;
    let bobMessageId: string;

    beforeAll(async () => {
      const [aliceRes, bobRes] = await Promise.all([
        aliceAgent.post("/api/chat/message").send({ chatId, content: "Alice delete test", type: "TEXT" }),
        bobAgent.post("/api/chat/message").send({ chatId, content: "Bob delete test", type: "TEXT" }),
      ]);
      aliceMessageId = aliceRes.body.id;
      bobMessageId = bobRes.body.id;
    });

    it("should prevent Bob from deleting Alice's message", async () => {
      const res = await bobAgent.delete(`/api/chat/message/${aliceMessageId}`);
      expect(res.status).toBe(404);
    });

    it("should allow Bob to delete his own message", async () => {
      const res = await bobAgent.delete(`/api/chat/message/${bobMessageId}`);
      expect(res.status).toBe(204);
      const check = await prisma.chatMessage.findUnique({ where: { id: bobMessageId } });
      expect(check).toBeNull();
    });

    it("should allow Alice to delete her own message", async () => {
      const res = await aliceAgent.delete(`/api/chat/message/${aliceMessageId}`);
      expect(res.status).toBe(204);
      const check = await prisma.chatMessage.findUnique({ where: { id: aliceMessageId } });
      expect(check).toBeNull();
    });

    it("should return 404 when editing a deleted message", async () => {
      const res = await aliceAgent
        .put(`/api/chat/message/${aliceMessageId}`)
        .send({ chatId, content: "editing a ghost", type: "TEXT" });
      expect(res.status).toBe(404);
    });

    it("should return 404 when deleting an already-deleted message", async () => {
      const res = await aliceAgent.delete(`/api/chat/message/${aliceMessageId}`);
      expect(res.status).toBe(404);
    });
  });
});
