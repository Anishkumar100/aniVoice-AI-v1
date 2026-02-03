import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';

export const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().sort({ createdAt: -1 }).lean()
    
    const populatedSubscriptions = await Promise.all(
      subscriptions.map(async (sub) => {
        let user = { name: 'Deleted User', email: 'N/A' }
        let plan = { name: 'Unknown Plan', price: 0, duration: 'N/A' }
        
        // ✅ FIXED: Use userId and planId
        if (sub.userId) {
          const foundUser = await User.findById(sub.userId).select('name email').lean()
          if (foundUser) user = foundUser
        }
        
        if (sub.planId) {
          const foundPlan = await Plan.findById(sub.planId).lean()
          if (foundPlan) plan = foundPlan
        }
        
        return { ...sub, user, plan }
      })
    )
    
    res.json({ success: true, subscriptions: populatedSubscriptions })
  } catch (error) {
    console.error('Get all subscriptions error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getActiveSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ status: 'active' }).sort({ createdAt: -1 }).lean()
    
    const populatedSubscriptions = await Promise.all(
      subscriptions.map(async (sub) => {
        let user = { name: 'Deleted User', email: 'N/A' }
        let plan = { name: 'Unknown Plan', price: 0, duration: 'N/A' }
        
        if (sub.userId) {
          const foundUser = await User.findById(sub.userId).select('name email').lean()
          if (foundUser) user = foundUser
        }
        
        if (sub.planId) {
          const foundPlan = await Plan.findById(sub.planId).lean()
          if (foundPlan) plan = foundPlan
        }
        
        return { ...sub, user, plan }
      })
    )
    
    res.json({ success: true, subscriptions: populatedSubscriptions })
  } catch (error) {
    console.error('Get active subscriptions error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id).lean()
    
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' })
    }
    
    let user = { name: 'Deleted User', email: 'N/A' }
    let plan = { name: 'Unknown Plan', price: 0, duration: 'N/A' }
    
    if (subscription.userId) {
      const foundUser = await User.findById(subscription.userId).select('name email').lean()
      if (foundUser) user = foundUser
    }
    
    if (subscription.planId) {
      const foundPlan = await Plan.findById(subscription.planId).lean()
      if (foundPlan) plan = foundPlan
    }
    
    res.json({ success: true, subscription: { ...subscription, user, plan } })
  } catch (error) {
    console.error('Get subscription by ID error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
