import { NextFunction, Request, Response } from "express";
import { UuidSchema } from "../schemas/util.schema";
import { UnauthorizedError } from "../errors";
import { createContact, deleteContactServ, editNicknameServ, getContactById, getContactsById, toggleBlock } from "../services/contact.service";
import { ContactNicknameInputSchema } from "../schemas/contact.schema";
import { createChatServ, createGroupChatServ, deleteChatServ, editGroupInfoServ, getChatById, getChatsById, getGroupChatById } from "../services/chat.service";
import { GroupChatInputSchema } from "../schemas/chat.schema";

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id
    const chats = await getChatsById(currentUserId);
    res.status(200).json(chats);
  } catch (err) {
    next(err);
  }
}
export async function getChat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id
    const chatId = UuidSchema.parse(req.params.id);
    const chat = await getChatById(chatId, currentUserId);
    res.status(200).json(chat);
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
export async function createChat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const contactId = UuidSchema.parse(req.body.contactId);
    const chat = await createChatServ(contactId, currentUserId);
    res.status(201).json(chat);
  } catch (err) {
    next(err);
  }
}
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

export async function deleteChat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id
    const chatId = UuidSchema.parse(req.params.id);
    await deleteChatServ(chatId, currentUserId);
    res.status(204).end();
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

