import { Router } from "express";
import contactRouter from "./contact.router";
import {
  deleteUser,
  edit,
  editPassword,
  getAll,
  getById,
} from "../controllers/user.controller";
import { getCurrentUser } from "../controllers/auth.controller";

const userRouter = Router();

userRouter.use("/contact", contactRouter);

userRouter.get("/", getAll);
userRouter.get("/:id", getById);
userRouter.get("/me", getCurrentUser);
userRouter.patch("/:id", edit);
userRouter.delete("/:id", deleteUser);
userRouter.patch("/password/:id", editPassword);

export default userRouter;
