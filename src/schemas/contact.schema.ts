import z, { uuidv7 } from "zod";
import { SafeUserSchema, UserSchema } from "./user.schema";
import { UuidSchema } from "./util.schema";
import { extend } from "zod/v4/core/util.cjs";

export const ContactModelSchema = z.object({
  id: z.string(),
  owner: z.unknown(),
  ownerId: UuidSchema,
  user: z.unknown().nullable(),
  userId: UuidSchema.nullable(),
  nickname: z.string().nullable(),
  isBlocked: z.boolean()
});

export type ContactPureType = z.infer<typeof ContactModelSchema>;

export const ContactSchema = z.object({
  id: z.string(),
  ownerId: UuidSchema,
  user: SafeUserSchema.nullable(),
  userId: UuidSchema.nullable(),
  nickname: z.string().nullable(),
  isBlocked: z.boolean()
});

export type ContactType = z.infer<typeof ContactSchema>;

export const ContactNicknameInputSchema = z.object({
  id: UuidSchema,
  nickname: z.string(),
});
export type ContactNicknameInput = z.infer<typeof ContactNicknameInputSchema>;

export const ContactOutput = ContactSchema.omit({ user: true });
export type ContactOutput = z.infer<typeof ContactOutput>;

