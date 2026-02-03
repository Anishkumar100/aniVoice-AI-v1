import mongoose from 'mongoose';
import Plan from '../models/Plan.js';
import dotenv from 'dotenv';

dotenv.config();

const seedPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📦 Connected to MongoDB');
        
        await Plan.deleteMany({});
        console.log('🗑️  Cleared old plans');
        
        const plans = await Plan.create([
            {
                name: 'Free',
                displayName: 'Free Plan',
                price: 0,
                currency: 'INR',
                billingCycle: 'monthly',
                features: {
                    canAccessPremiumCharacters: false,
                    unlimitedConversations: true,
                    prioritySupport: false
                },
                isActive: true
            },
            {
                name: 'Pro',
                displayName: 'Pro Plan',
                price: 9900,  // ₹99
                currency: 'INR',
                billingCycle: 'monthly',
                features: {
                    canAccessPremiumCharacters: true,
                    unlimitedConversations: true,
                    prioritySupport: true
                },
                razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID || 'plan_mock_12345',
                isActive: true
            }
        ]);
        
        console.log('✅ Plans seeded successfully:');
        plans.forEach(p => {
            const priceDisplay = p.price === 0 ? 'Free' : `₹${p.price/100}`;
            console.log(`   - ${p.displayName} (${priceDisplay})`);
        });
        
        mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedPlans();
