import { Router } from "express";
import contactRouter from "./contact.router";
import { create, deleteUser, edit, getAll, getById } from "../controllers/user.controller";

const userRouter = Router();

userRouter.use("/contact", contactRouter);

userRouter.get("/", getAll);
userRouter.get("/:id", getById);
userRouter.post("/", create);
userRouter.patch("/:id", edit);
userRouter.delete("/:id", deleteUser);

export default userRouter;
