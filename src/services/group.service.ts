import prisma from "../config/prisma";
import { GroupChatInput, GroupChatType } from "../schemas/chat.schema";
import { UuidType } from "../schemas/util.schema";
import { safeUserInclude } from "./utils";
import { NotFoundError, ConflictError } from "../errors";

export async function getGroupChatById(id: UuidType, currentUserId: UuidType): Promise<GroupChatType> {
  const chat = await prisma.chat.findUnique({
    where: {
      id,
      isGroup: true,
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
    }
  });
  if (!chat) throw new NotFoundError("Chat doesn't exist");
  return chat;
}

export async function createGroupChatServ({ name, imgUrl }: GroupChatInput, currentUserId: UuidType): Promise<GroupChatType> {
  const existingGroup = await prisma.chat.findFirst({
    where: {
      isGroup: true,
      createdById: currentUserId,
      name,
    },
  });
  if (existingGroup) throw new ConflictError("Chat already exists");
  return prisma.chat.create({
    data: {
      isGroup: true,
      createdById: currentUserId,
      name,
      imgUrl,
      members: {
        create: [
          { userId: currentUserId },
        ]
      }
    },
    include: {
      members: {
        include: safeUserInclude
      },
      messages: true,
    }
  });
}


export async function editGroupInfoServ({ name, imgUrl, id }: GroupChatInput, currentUserId: UuidType): Promise<GroupChatType> {
  const chat = await prisma.chat.findUnique({
    where: {
      id,
      isGroup: true,
      createdById: currentUserId,
    },
  });

  if (!chat) throw new NotFoundError("Group chat not found");

  return prisma.chat.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(imgUrl && { imgUrl }),
    },
    include: {
      members: {
        include: safeUserInclude,
      },
      messages: true,
    },
  });
}
