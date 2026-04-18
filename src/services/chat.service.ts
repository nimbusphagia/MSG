import prisma from "../config/prisma";
import type { UuidType } from "../schemas/util.schema";
import { ConflictError, NotFoundError } from "../errors";
import { ChatLazy, ChatType } from "../schemas/chat.schema";
import { safeUserInclude } from "./utils";



export async function getChatsById(currentUserId: UuidType): Promise<ChatLazy[]> {
  return prisma.chat.findMany({
    where: {
      members: {
        some: {
          userId: currentUserId,
        }
      }
    },
    select: {
      id: true,
      createdById: true,
      createdAt: true,
      isGroup: true
    }
  });
}
export async function getChatById(id: UuidType, currentUserId: UuidType): Promise<ChatType> {
  const chat = await prisma.chat.findUnique({
    where: {
      isGroup: false,
      id,
      members: {
        some: {
          userId: currentUserId,
        }
      }
    },
    include: {
      members: {
        include: safeUserInclude
      },
      messages: true,
    },
    omit: {
      name: true,
      imgUrl: true,
    }
  });
  if (!chat) throw new NotFoundError("Chat doesn't exist");
  return chat;
}

export async function createChatServ(contactId: UuidType, currentUserId: UuidType): Promise<ChatType> {
  const existingChat = await prisma.chat.findFirst({
    where: {
      isGroup: false,
      AND: [
        { members: { some: { userId: currentUserId } } },
        { members: { some: { userId: contactId } } },
      ]
    }
  });
  if (existingChat) throw new ConflictError("Chat already exists");
  return prisma.chat.create({
    data: {
      isGroup: false,
      createdById: currentUserId,
      members: {
        create: [
          { userId: currentUserId },
          { userId: contactId },
        ]
      }
    },
    include: {
      members: {
        include: safeUserInclude
      },
      messages: true,
    },
    omit: {
      name: true,
      imgUrl: true,
    }
  });
}
export async function deleteChatServ(id: UuidType, currentUserId: UuidType): Promise<void> {
  const existingChat = await prisma.chat.findUnique({
    where: {
      id,
      createdById: currentUserId
    }
  });
  if (!existingChat) throw new NotFoundError("Chat not found");

  await prisma.chat.delete({ where: { id } });
}

