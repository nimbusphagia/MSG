import { NextFunction, Request, Response } from "express";
import { UuidSchema } from "../schemas/util.schema";
import { UnauthorizedError } from "../errors";
import { createContact, deleteContactServ, editNicknameServ, getContactById, getContactsById, toggleBlock } from "../services/contact.service";
import { ContactNicknameInputSchema } from "../schemas/contact.schema";
import { getChatById, getChatsById } from "../services/chat.service";

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
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const userId = UuidSchema.parse(req.body.userId);
    const contact = await createContact(userId, currentUserId);
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
}
export async function editNickname(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id
    const data = ContactNicknameInputSchema.parse({ id: req.params.id, ...req.body })
    const contact = await editNicknameServ(data, currentUserId);
    res.status(200).json(contact);
  } catch (err) {
    next(err);
  }
}
export async function deleteContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id
    const contactId = UuidSchema.parse(req.params.id);
    await deleteContactServ(contactId, currentUserId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
export async function toggleIsBlocked(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id
    const contactId = UuidSchema.parse(req.params.id);
    const contact = await toggleBlock(contactId, currentUserId);
    res.status(200).json(contact);
  } catch (err) {
    next(err)
  }
}
