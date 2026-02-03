import express from 'express';
import { 
    createPaymentSubscription,
    verifySubscriptionPayment,
    getCurrentSubscription,
    cancelUserSubscription,
    getAllPlans,
    handleWebhook,
    deleteMySubscription
} from '../controllers/paymentController.js';
import userAuthMiddleware from '../middlewares/userAuthMiddleware.js';


const router = express.Router();

// Public routes
router.get('/plans', getAllPlans);

// Protected routes (require user authentication)
router.post('/create-subscription', userAuthMiddleware, createPaymentSubscription);
router.post('/verify-payment', userAuthMiddleware, verifySubscriptionPayment);
router.get('/subscription', userAuthMiddleware, getCurrentSubscription);
router.post('/cancel-subscription', userAuthMiddleware, cancelUserSubscription);
router.delete('/subscription', userAuthMiddleware, deleteMySubscription);


// Webhook (NO authentication - Razorpay calls this)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
