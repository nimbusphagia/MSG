import { Router } from "express";
import { create } from "../controllers/user.controller";
import { login } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.get("/login", login);
authRouter.post("/signup", create);

export default authRouter;
