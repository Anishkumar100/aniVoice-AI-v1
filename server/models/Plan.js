import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Free', 'Pro'],
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true  // in INR (0 for Free,  for Pro = ₹99.99/month)
    },
    currency: {
        type: String,
        default: 'INR'
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly'
    },
    features: {
        canAccessPremiumCharacters: {
            type: Boolean,
            required: true,
            default: false  // Free: false, Pro: true
        },
        unlimitedConversations: {
            type: Boolean,
            default: true
        },
        prioritySupport: {
            type: Boolean,
            default: false
        }
    },
    razorpayPlanId: {
        type: String,
        unique: true,
        sparse: true  // Only Pro plan has this
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model('Plan', planSchema);
