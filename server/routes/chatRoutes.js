import express from "express";
import { chatWithCharacter } from "../controllers/chatController.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

// User must be logged in to chat
router.post("/chat", userAuthMiddleware, chatWithCharacter);

export default router;