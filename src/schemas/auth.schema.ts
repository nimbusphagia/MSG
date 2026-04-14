import z from "zod";
import { PasswordSchema, UsernameSchema } from "./util.schema";

export const LoginSchema = z.object({
  username: UsernameSchema,
  password: PasswordSchema,
});
export type LoginInput = z.infer<typeof LoginSchema>;
