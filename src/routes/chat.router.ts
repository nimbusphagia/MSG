import { Router } from "express";

const chatRouter = Router();

chatRouter.get("/");
chatRouter.get("/:id");
chatRouter.post("/");
chatRouter.delete("/:id");

export default chatRouter;

