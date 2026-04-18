import { Router } from "express";
import { createChat, deleteChat, getAll, getChat } from "../controllers/chat.controller";

const chatRouter = Router();

chatRouter.get("/", getAll);
chatRouter.get("/:id", getChat);
chatRouter.post("/", createChat);
chatRouter.delete("/:id", deleteChat);

export default chatRouter;

