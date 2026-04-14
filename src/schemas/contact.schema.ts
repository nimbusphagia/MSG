import z from "zod";

export const ContactModelSchema = z.object({
  id: z.string(),
  owner: z.unknown(),
  ownerId: z.string(),
  user: z.unknown().nullable(),
  userId: z.string().nullable(),
  nickname: z.string().nullable(),
  isBlocked: z.boolean()
});

export type ContactPureType = z.infer<typeof ContactModelSchema>;
