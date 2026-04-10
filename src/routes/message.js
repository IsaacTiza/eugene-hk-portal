import { Router } from "express";
import { getConversations, getUnreadCount } from "../controllers/message.js";
import { protect } from "../middlewares/auth.js";

export const messageRouter = Router();

messageRouter.get("/:matchId/messages", protect, getConversations);
messageRouter.get("/unread", protect, getUnreadCount)