import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { JWT_SECRET } from "../config/jwt";
import type { LoginInput } from "../schemas/auth.schema";
import { UnauthorizedError } from "../errors";

async function generateToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(JWT_SECRET);
}
export async function validateLogin({
  username,
  password,
}: LoginInput): Promise<string> {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new UnauthorizedError("Invalid credentials");
  }

  return generateToken(user.id);
}
