import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';

// Get revenue statistics
export const getRevenueStats = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ status: 'active' }).lean()
    
    let total = 0
    let monthly = 0
    const transactions = []
    
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    for (const sub of subscriptions) {
      // ✅ FIXED: Use planId and userId from schema
      let plan = { name: 'Unknown Plan', price: 0, duration: 'N/A' }
      if (sub.planId) {
        const foundPlan = await Plan.findById(sub.planId).lean()
        if (foundPlan) {
          plan = foundPlan
          total += foundPlan.price || 0
          
          if (new Date(sub.createdAt) >= thisMonth) {
            monthly += foundPlan.price || 0
          }
        }
      }
      
      let user = { name: 'Unknown User', email: 'N/A' }
      if (sub.userId) {
        const foundUser = await User.findById(sub.userId).select('name email').lean()
        if (foundUser) {
          user = foundUser
        }
      }
      
      transactions.push({
        _id: sub._id,
        user,
        plan,
        amount: plan.price,
        createdAt: sub.createdAt
      })
    }
    
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const recentTransactions = transactions.slice(0, 10)
    
    res.json({ 
      success: true, 
      total, 
      monthly,
      transactions: recentTransactions
    })
  } catch (error) {
    console.error('Get revenue stats error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getMonthlyRevenue = async (req, res) => {
  try {
    const months = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0)
      
      const subscriptions = await Subscription.find({
        status: 'active',
        createdAt: { $gte: monthStart, $lte: monthEnd }
      }).lean()
      
      let revenue = 0
      for (const sub of subscriptions) {
        if (sub.planId) {
          const plan = await Plan.findById(sub.planId).lean()
          if (plan) revenue += plan.price || 0
        }
      }
      
      months.push({
        month: monthStart.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        revenue,
        count: subscriptions.length
      })
    }
    
    res.json({ success: true, months })
  } catch (error) {
    console.error('Get monthly revenue error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
