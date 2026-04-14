import { NextFunction, Request, Response } from "express";
import { validateLogin } from "../services/auth.service";
import { LoginSchema } from "../schemas/auth.schema";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = LoginSchema.parse(req.body);
    const token = await validateLogin(input);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    next(err);
  }
}
