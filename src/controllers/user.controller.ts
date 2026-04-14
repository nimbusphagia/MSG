import { NextFunction, Request, Response } from "express";
import { UuidSchema } from "../schemas/util.schema";
import { createUser, deleteUserServ, editUser, getUserById, getUsers } from "../services/user.service";
import { UserDeleteSchema, UserEditInputSchema } from "../schemas/user.schema";

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}
export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = UuidSchema.parse(req.params.id);
    const user = await getUserById(id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export async function edit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = UserEditInputSchema.parse({ ...req.body, id: req.params.id });
    const user = await editUser(data);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = UserDeleteSchema.parse({ ...req.body, id: req.params.id });
    await deleteUserServ(data);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
