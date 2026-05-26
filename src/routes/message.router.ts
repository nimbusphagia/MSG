import { Router } from "express";
import { create, edit, deleteMessage } from "../controllers/message.controller";
import upload from "../middleware/upload.middleware";

const messageRouter = Router();

messageRouter.post("/", upload.single("image"), create);
messageRouter.put("/:messageId", edit);
messageRouter.delete("/:messageId", deleteMessage);

export default messageRouter;
