import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    
    // ✅ SECURITY QUESTION FIELDS (NEW)
    securityQuestion: {
        type: String,
        required: true
    },
    securityAnswer: {
        type: String,
        required: true // This will be hashed
    },
    
    // --- SAAS / MONETIZATION FIELDS ---
    
    // 1. The Plan: 'free' or 'pro'
    plan: { 
        type: String, 
        enum: ['free', 'pro'], 
        default: 'free' 
    },

    // 2. Expiry: When does the plan end?
    subscriptionExpiresAt: {
        type: Date,
        default: null
    },
    
    // 3. Razorpay Specifics (For managing payments later)
    razorpayCustomerId: {
        type: String,
        select: false // Hide for security
    },
    razorpaySubscriptionId: {
        type: String,
        select: false // Crucial for canceling/renewing plans
    }
}, { timestamps: true });

// Helper to check if user is PRO
userSchema.methods.isProMember = function() {
    // User is Pro if plan is 'pro' AND checking if date hasn't passed
    return this.plan === 'pro' && this.subscriptionExpiresAt > new Date();
};

const User = mongoose.model("User", userSchema);
export default User;
