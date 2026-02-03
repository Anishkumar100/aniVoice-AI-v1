import express from 'express';
import { adminLogin, adminProfile, getStats } from '../controllers/adminAuthController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';
import { 
  createCharacter, 
  getAllCharacters, 
  getCharacterById, 
  updateCharacter, 
  deleteCharacter 
} from '../controllers/characterController.js';
import { getAllUsers, getUserById } from '../controllers/userManagementController.js';
import { 
  getAllSubscriptions, 
  getActiveSubscriptions, 
  getSubscriptionById 
} from '../controllers/subscriptionManagementController.js';
import { getRevenueStats, getMonthlyRevenue } from '../controllers/revenueController.js';
import upload from '../config/multerConfig.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

const router = express.Router();

// ==========================================
// ADMIN AUTH ROUTES
// ==========================================

router.post('/login', adminLogin);
router.get('/profile', adminAuthMiddleware, adminProfile);
router.get('/stats', adminAuthMiddleware, getStats);

// ==========================================
// CHARACTER CRUD ROUTES
// ==========================================

router.post('/characters/create', adminAuthMiddleware, upload.single('avatar'), createCharacter);
router.get('/characters/all', adminAuthMiddleware, getAllCharacters);
router.get('/characters/:id', adminAuthMiddleware, getCharacterById);
router.put('/characters/:id', adminAuthMiddleware, upload.single('avatar'), updateCharacter);
router.delete('/characters/:id', adminAuthMiddleware, deleteCharacter);

// ==========================================
// USER MANAGEMENT ROUTES
// ==========================================

router.get('/users', adminAuthMiddleware, getAllUsers);
router.get('/users/:id', adminAuthMiddleware, getUserById);

// ==========================================
// SUBSCRIPTION MANAGEMENT ROUTES
// ==========================================

// ✅ IMPORTANT: Specific routes BEFORE dynamic :id routes

// Cleanup route (with better logging)
router.post('/subscriptions/cleanup', adminAuthMiddleware, async (req, res) => {
  try {
    const subscriptions = await Subscription.find().lean()
    let deletedCount = 0
    
    for (const sub of subscriptions) {
      // ✅ FIXED: Use userId
      if (sub.userId) {
        const userExists = await User.findById(sub.userId)
        if (!userExists) {
          await Subscription.findByIdAndDelete(sub._id)
          deletedCount++
        }
      }
    }
    
    res.json({ success: true, message: `Cleaned up ${deletedCount} orphaned subscriptions`, deletedCount })
  } catch (error) {
    console.error('Cleanup error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})


// Get all subscriptions
router.get('/subscriptions', adminAuthMiddleware, getAllSubscriptions);

// Get active subscriptions
router.get('/subscriptions/active', adminAuthMiddleware, getActiveSubscriptions);

// Delete single subscription (must come before GET /:id)
router.delete('/subscriptions/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id)
    
    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      })
    }
    
    res.json({ 
      success: true, 
      message: 'Subscription deleted successfully' 
    })
  } catch (error) {
    console.error('Delete subscription error:', error)
    res.status(500).json({ 
      success: false, 
      message: error.message 
    })
  }
})

// Get subscription by ID (must come LAST)
router.get('/subscriptions/:id', adminAuthMiddleware, getSubscriptionById);

// ==========================================
// REVENUE ROUTES
// ==========================================

// DEBUG: Check plans and subscriptions
router.get('/debug/check-data', adminAuthMiddleware, async (req, res) => {
  try {
    const Plan = (await import('../models/Plan.js')).default
    const plans = await Plan.find()
    const subscriptions = await Subscription.find()
    
    console.log('\n📋 PLANS IN DATABASE:')
    plans.forEach(plan => {
      console.log(`  - ${plan.name}: ₹${plan.price} (ID: ${plan._id})`)
    })
    
    console.log('\n📋 SUBSCRIPTIONS IN DATABASE:')
    subscriptions.forEach(sub => {
      console.log(`  - User: ${sub.user}, Plan: ${sub.plan || 'NONE'}, Status: ${sub.status}`)
    })
    
    res.json({
      plans: plans.map(p => ({ id: p._id, name: p.name, price: p.price })),
      subscriptions: subscriptions.map(s => ({ id: s._id, user: s.user, plan: s.plan, status: s.status }))
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/revenue', adminAuthMiddleware, getRevenueStats);
router.get('/revenue/monthly', adminAuthMiddleware, getMonthlyRevenue);

export default router;
