import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import generateTokenForAdmin from '../config/generateTokenForAdmin.js'; // Import the helper
import User from '../models/User.js';
import Character from '../models/Character.js';
import Subscription from '../models/Subscription.js';

/*
Admin Login
path: /api/admin/login
method: POST
*/
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email }); // Shorthand for { email: email }

        if (admin && (await bcrypt.compare(password, admin.password))) {
            
            // Clean & Professional: Use the helper function
            const token = generateTokenForAdmin(admin._id);

            res.status(200).json({ 
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                token: token
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Error during admin login:", error);
        res.status(500).json({ message: "Server Error" });
    }
}


export const adminProfile = async (req, res) => {
    try {

        const admin = await Admin.findById(req.admin.id).select('-password');
        
        if (admin) {
            res.json(admin);
        } else {
            res.status(404).json({ message: "Admin not found" });
        }
    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
}


// Get admin dashboard stats
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalCharacters = await Character.countDocuments()
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' })
    
    // Calculate revenue with correct field names
    let totalRevenue = 0
    const Plan = (await import('../models/Plan.js')).default
    const subs = await Subscription.find({ status: 'active' }).lean()
    
    for (const sub of subs) {
      // ✅ FIXED: Use planId
      if (sub.planId) {
        const plan = await Plan.findById(sub.planId).lean()
        if (plan && plan.price) {
          totalRevenue += plan.price
        }
      }
    }

    res.json({
      success: true,
      stats: { totalUsers, totalCharacters, activeSubscriptions, totalRevenue }
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
