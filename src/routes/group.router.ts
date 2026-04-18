import { Router } from "express";
import { deleteChat } from "../controllers/chat.controller";
import { createGroupChat, getGroup, editGroupInfo } from "../controllers/group.controller";

const groupRouter = Router();

const groupMemberRouter = Router();

groupMemberRouter.post("/",);
groupMemberRouter.delete("/:memberId",);
groupMemberRouter.patch("/role/:memberId",);
groupRouter.use("/member", groupMemberRouter);

groupRouter.get("/:id", getGroup);
groupRouter.post("/", createGroupChat);
groupRouter.delete("/:id", deleteChat);
groupRouter.put("/:id", editGroupInfo);

export default groupRouter;
