import z from "zod";
import { JsonValueSchema, UuidSchema } from "./util.schema";

export const ChatMessageModelSchema = z.object({
  id: z.string(),
  chat: z.unknown(),
  chatId: z.string(),
  sender: z.unknown().nullable(),
  senderId: z.string().nullable(),
  content: z.string().nullable(),
  type: z.enum(["TEXT", "IMAGE", "SYSTEM_EVENT"]),
  metadata: z.unknown().nullable(),
  createdAt: z.date(),
  replyTo: z.unknown().nullable(),
  replyToId: z.string().nullable(),
  replies: z.array(z.unknown())
});

export type ChatMessagePureType = z.infer<typeof ChatMessageModelSchema>;

export const ChatMessageSchema = z.object({
  id: UuidSchema,
  chatId: UuidSchema,
  senderId: UuidSchema.nullable(),
  content: z.string().nullable(),
  type: z.enum(["TEXT", "IMAGE", "SYSTEM_EVENT"]),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.date(),
  replyToId: UuidSchema.nullable(),
});

export type ChatMessageType = z.infer<typeof ChatMessageSchema>;
