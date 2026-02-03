import express from 'express';
import {
  // Auth functions
  getSecurityQuestions,
  registerUser,
  loginUser,
  
  // Forgot password functions
  getSecurityQuestion,
  verifySecurityAnswer,
  resetPassword,
  
  // Profile functions
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateSecurityQuestion,
  deleteAccount
} from '../controllers/userAuthController.js';
import userAuthMiddleware from '../middlewares/userAuthMiddleware.js';

const router = express.Router();

// ✅ Public routes - Security Questions
router.get('/security-questions', getSecurityQuestions);

// ✅ Public routes - Authentication
router.post('/register', registerUser);
router.post('/login', loginUser);

// ✅ Public routes - Forgot Password Flow
router.post('/forgot-password/question', getSecurityQuestion);
router.post('/forgot-password/verify', verifySecurityAnswer);
router.post('/forgot-password/reset', resetPassword);

// ✅ Protected Routes - Profile Management
router.get('/profile', userAuthMiddleware, getUserProfile);
router.put('/profile', userAuthMiddleware, updateUserProfile);
router.put('/password', userAuthMiddleware, changePassword);
router.put('/security-question', userAuthMiddleware, updateSecurityQuestion);
router.delete('/account', userAuthMiddleware, deleteAccount);

export default router;
