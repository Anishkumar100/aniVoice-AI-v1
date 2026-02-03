import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean()
    
    const usersWithSubscriptions = await Promise.all(
      users.map(async (user) => {
        // ✅ FIXED: Look for userId field
        const subscription = await Subscription.findOne({ 
          userId: user._id,
          status: 'active' 
        }).populate('planId')
        
        return {
          ...user,
          subscription: subscription || null
        }
      })
    )
    
    res.json({ success: true, users: usersWithSubscriptions })
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean()
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    const subscription = await Subscription.findOne({ 
      userId: user._id,
      status: 'active' 
    }).populate('planId')
    
    res.json({ 
      success: true, 
      user: { ...user, subscription: subscription || null }
    })
  } catch (error) {
    console.error('Get user by ID error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
