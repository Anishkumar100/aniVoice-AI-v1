import express from "express";
import { generateSpeech, replyAndSpeak, getVoiceOptions } from "../controllers/voiceController.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.post("/speak", userAuthMiddleware, generateSpeech);
router.post("/chat", userAuthMiddleware, replyAndSpeak);
router.get("/options", adminAuthMiddleware, getVoiceOptions);
/*The voice options are for admin user only */

export default router;
