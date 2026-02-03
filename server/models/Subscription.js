import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    planType: {
        type: String,
        enum: ['Free', 'Pro'],
        default: 'Free'
    },
    
    // Razorpay fields (only for Pro)
    razorpaySubscriptionId: {
        type: String,
        sparse: true
    },
    razorpayCustomerId: {
        type: String,
        sparse: true
    },
    razorpayPaymentId: {
        type: String,
        sparse: true
    },
    
    status: {
        type: String,
        enum: ['active', 'cancelled', 'expired', 'paused', 'created'],
        default: 'active'
    },
    
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date  // For tracking subscription end
    },
    currentPeriodStart: {
        type: Date,
        default: Date.now
    },
    currentPeriodEnd: {
        type: Date
    },
    
    // Auto-renewal
    autoRenew: {
        type: Boolean,
        default: true
    }
    
}, { timestamps: true });

// Helper method to check if user has premium access
subscriptionSchema.methods.hasPremiumAccess = function() {
    return this.planType === 'Pro' && 
           this.status === 'active' && 
           (!this.endDate || this.endDate > new Date());
};

export default mongoose.model('Subscription', subscriptionSchema);
