import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors";
import { GroupChatInputSchema } from "../schemas/chat.schema";
import { createGroupChatServ, editGroupInfoServ, getGroupChatById } from "../services/group.service";
import { UuidSchema } from "../schemas/util.schema";

export async function createGroupChat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const data = GroupChatInputSchema.parse(req.body);
    const groupChat = await createGroupChatServ(data, currentUserId);
    res.status(201).json(groupChat);
  } catch (err) {
    next(err);
  }
}

export async function editGroupInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id
    const data = GroupChatInputSchema.parse({ id: req.params.id, ...req.body })
    const contact = await editGroupInfoServ(data, currentUserId);
    res.status(200).json(contact);
  } catch (err) {
    next(err);
  }
}
export async function getGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id
    const chatId = UuidSchema.parse(req.params.id);
    const chat = await getGroupChatById(chatId, currentUserId);
    res.status(200).json(chat);
  } catch (err) {
    next(err);
  }
}
