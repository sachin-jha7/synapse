import express from "express";
import { deleteChat, saveUserHistory, showChat } from "../controllers/chat-history-controller.js";
const router = express.Router();

router.post("/claim", saveUserHistory);

router.get("/:id", showChat);

router.delete("/:id", deleteChat);

export default router;