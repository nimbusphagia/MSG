import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ValidationError } from "../errors";
import { UuidSchema } from "../schemas/util.schema";
import {
  createMessage,
  deleteMessageServ,
  editMessage,
} from "../services/message.service";
import { MessageCreateSchema } from "../schemas/message.schema";
import { uploadImage } from "../utils/uploadImage";

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Not authenticated");
    }

    const currentUserId = req.user.id;

    const data = MessageCreateSchema.parse({
      ...req.body,
    });

    if (data.type === "IMAGE") {
      if (!req.file) {
        throw new ValidationError("Image file required");
      }

      const result: any = await uploadImage(req.file.buffer, "msg");

      data.metadata = {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      };
    }

    const chat = await createMessage(data, currentUserId);

    res.status(201).json(chat);
  } catch (err) {
    next(err);
  }
}
export async function edit(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const messageId = UuidSchema.parse(req.params.messageId);
    const data = MessageCreateSchema.parse(req.body);
    const chat = await editMessage(messageId, data, currentUserId);
    res.status(200).json(chat);
  } catch (err) {
    next(err);
  }
}
export async function deleteMessage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const messageId = UuidSchema.parse(req.params.messageId);
    await deleteMessageServ(messageId, currentUserId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
