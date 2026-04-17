import { Router } from "express";
import { create, deleteContact, editNickname, getAll, getById, toggleIsBlocked } from "../controllers/contact.controller";

const contactRouter = Router();

contactRouter.get("/", getAll);
contactRouter.get("/:id", getById);
contactRouter.post("/", create);
contactRouter.patch("/:id", editNickname);
contactRouter.delete("/:id", deleteContact);
contactRouter.patch("/block/:id", toggleIsBlocked);

export default contactRouter;
