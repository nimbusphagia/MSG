import prisma from "../config/prisma";
import type { UuidType } from "../schemas/util.schema";
import { ConflictError, NotFoundError } from "../errors";
import {
  ChatLazy,
  ChatLazySchema,
  ChatResponse,
  ChatType,
} from "../schemas/chat.schema";
import { safeUserInclude } from "./utils";

export async function getChatsById(
  currentUserId: UuidType,
): Promise<ChatLazy[]> {
  const raw = await prisma.chat.findMany({
    where: {
      members: {
        some: {
          userId: currentUserId,
        },
      },
    },
    select: {
      id: true,
      createdAt: true,
      isGroup: true,
      members: {
        where: {
          userId: {
            not: currentUserId,
          },
        },
        select: safeUserInclude,
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  const mapped = raw.map((chat) =>
    ChatLazySchema.parse({
      ...chat,
      otherMember: chat.members[0].user,
      lastMessage: chat.messages[0] ?? undefined,
    }),
  );
  return mapped;
}
export async function getChatById(
  id: UuidType,
  currentUserId: UuidType,
): Promise<ChatResponse> {
  const raw = await prisma.chat.findUnique({
    where: { id, isGroup: false, members: { some: { userId: currentUserId } } },
    include: { members: { select: safeUserInclude }, messages: true },
    omit: { name: true, imgUrl: true },
  });

  if (!raw) throw new NotFoundError("Chat doesn't exist");

  const { id: chatId, isGroup, members, messages } = raw;

  const primaryMember = members.find((m) => m.user!.id === currentUserId)?.user;
  const secondaryMember = members.find(
    (m) => m.user!.id !== currentUserId,
  )?.user;

  if (!primaryMember || !secondaryMember)
    throw new NotFoundError("Chat members not found");

  return {
    id: chatId,
    isGroup,
    primaryMember,
    secondaryMember,
    messages,
  };
}

export async function createChatServ(
  contactId: UuidType,
  currentUserId: UuidType,
): Promise<ChatType> {
  const existingChat = await prisma.chat.findFirst({
    where: {
      isGroup: false,
      AND: [
        { members: { some: { userId: currentUserId } } },
        { members: { some: { userId: contactId } } },
      ],
    },
  });
  if (existingChat) throw new ConflictError("Chat already exists");
  return prisma.chat.create({
    data: {
      isGroup: false,
      createdById: currentUserId,
      members: {
        create: [{ userId: currentUserId }, { userId: contactId }],
      },
    },
    include: {
      members: {
        include: safeUserInclude,
      },
      messages: true,
    },
    omit: {
      name: true,
      imgUrl: true,
    },
  });
}
export async function deleteChatServ(
  id: UuidType,
  currentUserId: UuidType,
): Promise<void> {
  const existingChat = await prisma.chat.findUnique({
    where: {
      id,
      createdById: currentUserId,
    },
  });
  if (!existingChat) throw new NotFoundError("Chat not found");

  await prisma.chat.delete({ where: { id } });
}
