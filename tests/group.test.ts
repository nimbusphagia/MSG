import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/config/express";
import prisma from "../src/config/prisma";

describe("Group Controller Integration Tests", () => {
  const aliceAgent = request.agent(app);
  const bobAgent = request.agent(app);
  const charlieAgent = request.agent(app);

  let aliceId: string, bobId: string, charlieId: string;
  let groupId: string;
  let bobMemberId: string;
  let charlieMemberId: string;

  beforeAll(async () => {
    const users = await Promise.all([
      request(app).post("/auth/signup").send({ username: "alice_g", name: "Alice", password: "Password1!" }),
      request(app).post("/auth/signup").send({ username: "bob_g", name: "Bob", password: "Password1!" }),
      request(app).post("/auth/signup").send({ username: "charlie_g", name: "Charlie", password: "Password1!" })
    ]);

    aliceId = users[0].body.id;
    bobId = users[1].body.id;
    charlieId = users[2].body.id;

    await aliceAgent.post("/auth/login").send({ username: "alice_g", password: "Password1!" });
    await bobAgent.post("/auth/login").send({ username: "bob_g", password: "Password1!" });
    await charlieAgent.post("/auth/login").send({ username: "charlie_g", password: "Password1!" });
  });

  describe("Group Lifecycle", () => {
    it("should allow Alice to create a group", async () => {
      const res = await aliceAgent
        .post("/api/group")
        .send({ name: "Testing Squad", imgUrl: "https://picsum.photos/200" });

      expect(res.status).toBe(201);
      groupId = res.body.id;
    });

    it("should allow Alice to add Bob", async () => {
      const res = await aliceAgent
        .post("/api/group/member")
        .send({ chatId: groupId, userId: bobId });

      expect(res.status).toBe(201);
      bobMemberId = res.body.id;
    });

    it("should allow Alice (OWNER) to promote Bob to ADMIN", async () => {
      const res = await aliceAgent
        .patch(`/api/group/member/role/${bobMemberId}`)
        .send({ chatId: groupId, role: "ADMIN" });

      expect(res.status).toBe(200);
      expect(res.body.role).toBe("ADMIN");
    });

    it("should allow Bob (now ADMIN) to add Charlie", async () => {
      const res = await bobAgent
        .post("/api/group/member")
        .send({ chatId: groupId, userId: charlieId });

      expect(res.status).toBe(201);
      charlieMemberId = res.body.id;
    });

    it("should prevent Charlie from editing group info", async () => {
      const res = await charlieAgent
        .put(`/api/group/${groupId}`)
        .send({
          name: "Hacked Name",
          imgUrl: "https://picsum.photos/200"
        });

      expect(res.status).toBe(404);
    });

    it("should prevent Bob (ADMIN) from changing Charlie's role (OWNER only)", async () => {
      const res = await bobAgent
        .patch(`/api/group/member/role/${charlieMemberId}`)
        .send({ chatId: groupId, role: "ADMIN" });

      expect(res.status).toBe(404);
    });

    it("should prevent Alice (OWNER) from deleting herself", async () => {
      const aliceMember = await prisma.chatMember.findFirst({
        where: { chatId: groupId, userId: aliceId }
      });

      const res = await aliceAgent
        .delete(`/api/group/member/${aliceMember?.id}`)
        .send({ chatId: groupId });

      expect(res.status).toBe(403);
    });

    it("should allow Alice to delete Charlie", async () => {
      const res = await aliceAgent
        .delete(`/api/group/member/${charlieMemberId}`)
        .send({ chatId: groupId });

      expect(res.status).toBe(204);
    });

    it("should allow Alice to delete the entire group", async () => {
      const res = await aliceAgent.delete(`/api/group/${groupId}`);
      expect(res.status).toBe(204);
    });
  });
});
