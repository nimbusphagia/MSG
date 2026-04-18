import { Router } from "express";
import { createGroupChat, deleteChat, editGroupInfo, getGroup } from "../controllers/chat.controller";

const groupRouter = Router();
groupRouter.get("/:id", getGroup);
groupRouter.post("/", createGroupChat);
groupRouter.delete("/:id", deleteChat);
groupRouter.put("/:id", editGroupInfo);

export default groupRouter;
