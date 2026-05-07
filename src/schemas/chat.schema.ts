import z from "zod";
import { ChatMemberSchema } from "./member.schema";
import { ChatMessageSchema } from "./message.schema";
import { UuidSchema } from "./util.schema";

export const ChatSchema = z.object({
  id: UuidSchema,
  createdById: UuidSchema.nullable(),
  createdAt: z.date(),
  isGroup: z.boolean(),
  members: z.array(ChatMemberSchema),
  messages: z.array(ChatMessageSchema),
});

export type ChatType = z.infer<typeof ChatSchema>;

export const ChatLazySchema = z.object({
  id: UuidSchema,
  createdAt: z.date(),
  isGroup: z.boolean(),
  otherMember: ChatMemberSchema,
  lastMessage: ChatMessageSchema.optional(),
});
export type ChatLazy = z.infer<typeof ChatLazySchema>;

export const GroupChatSchema = z.object({
  id: UuidSchema,
  name: z.string().nullable(),
  imgUrl: z.url().nullable(),
  createdById: UuidSchema.nullable(),
  createdAt: z.date(),
  isGroup: z.boolean(),
  members: z.array(ChatMemberSchema),
  messages: z.array(ChatMessageSchema),
});

export type GroupChatType = z.infer<typeof GroupChatSchema>;

export const GroupChatInputSchema = z.object({
  id: UuidSchema.optional(),
  name: z.string().min(1),
  imgUrl: z.url(),
  createdById: UuidSchema.optional(),
});

export type GroupChatInput = z.infer<typeof GroupChatInputSchema>;
