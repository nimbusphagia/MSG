import z from "zod";

export const ChatMemberModelSchema = z.object({
  id: z.string(),
  chat: z.unknown(),
  chatId: z.string(),
  user: z.unknown().nullable(),
  userId: z.string().nullable(),
  role: z.enum(["MEMBER", "ADMIN", "OWNER"]),
});

export type ChatMemberPureType = z.infer<typeof ChatMemberModelSchema>;
