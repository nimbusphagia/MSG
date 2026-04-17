import z from "zod";
import { ChatMemberSchema } from "./member.schema";
import { ChatMessageSchema } from "./message.schema";
import { UuidSchema } from "./util.schema";

export const ChatModelSchema = z.object({
  id: UuidSchema,
  name: z.string().nullable(),
  imgUrl: z.string().nullable(),
  createdBy: z.unknown().nullable(),
  createdById: UuidSchema.nullable(),
  createdAt: z.date(),
  isGroup: z.boolean(),
  members: z.array(z.unknown()),
  messages: z.array(z.unknown())
});

export type ChatPureType = z.infer<typeof ChatModelSchema>;

export const ChatSchema = z.object({
  id: UuidSchema,
  createdById: UuidSchema.nullable(),
  createdAt: z.date(),
  isGroup: z.boolean(),
  members: z.array(ChatMemberSchema),
  messages: z.array(ChatMessageSchema)
});

export type ChatType = z.infer<typeof ChatSchema>;


export const ChatLazySchema = z.object({
  id: UuidSchema,
  createdById: UuidSchema.nullable(),
  createdAt: z.date(),
  isGroup: z.boolean(),
});

export type ChatLazy = z.infer<typeof ChatLazySchema>;


export const GroupChatSchema = z.object({
  id: UuidSchema,
  name: z.string().nullable(),
  imgUrl: z.string().nullable(),
  createdById: UuidSchema.nullable(),
  createdAt: z.date(),
  isGroup: z.boolean(),
  members: z.array(ChatMemberSchema),
  messages: z.array(ChatMessageSchema)
});

export type GroupChatType = z.infer<typeof GroupChatSchema>;

export const GroupChatInputSchema = z.object({
  name: z.string(),
  imgUrl: z.string(),
  createdById: UuidSchema,
});

export type GroupChatInput = z.infer<typeof GroupChatInputSchema>;


