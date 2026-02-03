import express from 'express';
import * as conversationController from '../controllers/conversationController.js';
import userAuthMiddleware from '../middlewares/userAuthMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(userAuthMiddleware);

// Get all user conversations
router.get('/', conversationController.getUserConversations);

// Get single conversation
router.get('/:id', conversationController.getConversationById);

// Get conversations by character
router.get('/character/:characterId', conversationController.getConversationsByCharacter);

// Save conversation (create or update)
router.post('/save', conversationController.saveConversation);

// Delete conversation
router.delete('/:id', conversationController.deleteConversation);

export default router;
