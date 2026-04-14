import { Router } from "express";

const contactRouter = Router();

contactRouter.get("/");
contactRouter.get("/:id");
contactRouter.post("/");
contactRouter.patch("/:id");
contactRouter.delete("/:id");
contactRouter.patch("/block/:id");

export default contactRouter;
