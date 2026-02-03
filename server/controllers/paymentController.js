import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';
import {
    createSubscription,
    createCustomer,
    verifySubscriptionSignature,
    cancelSubscription,
    fetchSubscription,
    verifyWebhookSignature
} from '../services/razorpayService.mock.js';  // ✅ Use mock service for testing

// ========================================
// 🎯 CREATE SUBSCRIPTION
// ========================================
export const createPaymentSubscription = async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!planId) {
            return res.status(400).json({ message: 'Plan ID is required' });
        }

        // Query with razorpayCustomerId explicitly selected
        const [plan, user] = await Promise.all([
            Plan.findById(planId),
            User.findById(userId).select('+razorpayCustomerId +razorpaySubscriptionId')
        ]);

        // Validation checks
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (plan.name === 'Free') {
            return res.status(400).json({ message: 'Cannot create subscription for free plan' });
        }

        // ✅ FIX: Check for existing subscription (including Free plan)
        let subscription = await Subscription.findOne({ userId });

        // Check if already has active Pro subscription
        if (subscription && subscription.planType === 'Pro' && subscription.status === 'active') {
            return res.status(400).json({ message: 'You already have an active Pro subscription' });
        }

        // Get or create Razorpay customer
        let razorpayCustomerId = user.razorpayCustomerId;

        if (!razorpayCustomerId) {
            console.log('📝 Creating new Razorpay customer...');
            const customer = await createCustomer(
                user.name || user.email,
                user.email,
                user.phone || '9999999999'
            );
            razorpayCustomerId = customer.id;

            user.razorpayCustomerId = razorpayCustomerId;
            await user.save();
            
            console.log(`✅ Created new Razorpay customer: ${razorpayCustomerId}`);
        } else {
            console.log(`✅ Reusing existing Razorpay customer: ${razorpayCustomerId}`);
        }

        // Create Razorpay subscription
        console.log('📝 Creating Razorpay subscription...');
        const razorpaySubscription = await createSubscription(
            plan.razorpayPlanId,
            razorpayCustomerId,
            12
        );

        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        // ✅ FIX: Update existing subscription or create new one
        if (subscription) {
            // Update existing subscription (upgrading from Free to Pro)
            console.log('📝 Updating existing subscription to Pro...');
            subscription.planId = plan._id;
            subscription.planType = plan.name;
            subscription.razorpaySubscriptionId = razorpaySubscription.id;
            subscription.razorpayCustomerId = razorpayCustomerId;
            subscription.status = 'created';
            subscription.startDate = startDate;
            subscription.endDate = endDate;
            subscription.currentPeriodStart = startDate;
            subscription.currentPeriodEnd = endDate;
            subscription.autoRenew = true;
            
            await subscription.save();
        } else {
            // Create new subscription (first time)
            console.log('📝 Creating new subscription...');
            subscription = await Subscription.create({
                userId,
                planId: plan._id,
                planType: plan.name,
                razorpaySubscriptionId: razorpaySubscription.id,
                razorpayCustomerId,
                status: 'created',
                startDate,
                endDate,
                currentPeriodStart: startDate,
                currentPeriodEnd: endDate
            });
        }

        // Update User model
        user.plan = 'pro';
        user.subscriptionExpiresAt = endDate;
        user.razorpaySubscriptionId = razorpaySubscription.id;
        await user.save();

        console.log('✅ Subscription created/updated successfully');

        res.status(200).json({
            subscriptionId: razorpaySubscription.id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            planName: plan.displayName,
            amount: plan.price,
            currency: plan.currency,
            customerEmail: user.email,
            customerName: user.name || user.email
        });

    } catch (error) {
        console.error('❌ Create Subscription Error:', error);
        res.status(500).json({ 
            message: 'Failed to create subscription', 
            error: error.message 
        });
    }
};


// ========================================
// 🧹 DELETE SUBSCRIPTION (Testing Only)
// ========================================
export const deleteMySubscription = async (req, res) => {
    try {
        const userId = req.user._id;
        const result = await Subscription.deleteOne({ userId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No subscription found' });
        }
        
        res.json({ message: 'Subscription deleted successfully' });
    } catch (error) {
        console.error('❌ Delete Subscription Error:', error);
        res.status(500).json({ 
            message: 'Failed to delete subscription',
            error: error.message 
        });
    }
};

// ========================================
// 🔐 VERIFY SUBSCRIPTION PAYMENT
// ========================================
export const verifySubscriptionPayment = async (req, res) => {
    try {
        const { 
            razorpay_subscription_id, 
            razorpay_payment_id, 
            razorpay_signature
        } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing required payment parameters' });
        }

        // Verify signature
        const isValid = verifySubscriptionSignature(
            razorpay_subscription_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Parallel operations for better performance
        const [subscription, razorpaySub] = await Promise.all([
            Subscription.findOne({ 
                userId,
                razorpaySubscriptionId: razorpay_subscription_id 
            }).populate('planId'),
            fetchSubscription(razorpay_subscription_id)
        ]);

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Calculate period dates
        const startDate = new Date(razorpaySub.start_at * 1000);
        const endDate = new Date((razorpaySub.current_end || razorpaySub.end_at) * 1000);
        const currentPeriodStart = new Date(razorpaySub.current_start * 1000);
        const currentPeriodEnd = new Date(razorpaySub.current_end * 1000);

        // Update subscription with all details at once
        Object.assign(subscription, {
            status: 'active',
            razorpayPaymentId: razorpay_payment_id,
            startDate,
            endDate,
            currentPeriodStart,
            currentPeriodEnd
        });

        await subscription.save();

        res.status(200).json({
            message: 'Subscription activated successfully',
            subscription: {
                plan: subscription.planId.displayName,
                status: subscription.status,
                startDate: subscription.startDate,
                endDate: subscription.endDate
            }
        });

    } catch (error) {
        console.error('❌ Verify Subscription Payment Error:', error);
        res.status(500).json({ 
            message: 'Payment verification failed', 
            error: error.message 
        });
    }
};

// ========================================
// 📊 GET CURRENT SUBSCRIPTION
// ========================================
export const getCurrentSubscription = async (req, res) => {
    try {
        const userId = req.user._id;

        let subscription = await Subscription.findOne({ userId }).populate('planId');

        // Create free plan subscription for new users
        if (!subscription) {
            const freePlan = await Plan.findOne({ name: 'Free' });
            
            if (!freePlan) {
                return res.status(404).json({ 
                    message: 'Free plan not found. Please run seeder.' 
                });
            }

            subscription = await Subscription.create({
                userId,
                planId: freePlan._id,
                planType: 'Free',
                status: 'active'
            });
            
            // Populate after creation
            subscription = await Subscription.findById(subscription._id).populate('planId');
        }

        // Check and update expired subscriptions
        if (subscription.endDate && subscription.endDate < new Date() && subscription.status !== 'expired') {
            subscription.status = 'expired';
            await subscription.save();
        }

        res.status(200).json({
            plan: subscription.planId,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            hasPremiumAccess: subscription.hasPremiumAccess()
        });

    } catch (error) {
        console.error('❌ Get Subscription Error:', error);
        res.status(500).json({ 
            message: 'Failed to fetch subscription',
            error: error.message 
        });
    }
};

// ========================================
// ❌ CANCEL SUBSCRIPTION
// ========================================
export const cancelUserSubscription = async (req, res) => {
    try {
        const userId = req.user._id;

        const subscription = await Subscription.findOne({ userId });
        
        if (!subscription) {
            return res.status(404).json({ message: 'No active subscription found' });
        }

        if (subscription.planType === 'Free') {
            return res.status(400).json({ message: 'Cannot cancel free plan' });
        }

        // Cancel on Razorpay if subscription ID exists
        if (subscription.razorpaySubscriptionId) {
            await cancelSubscription(subscription.razorpaySubscriptionId);
        }

        // Update subscription status
        subscription.status = 'cancelled';
        subscription.autoRenew = false;
        await subscription.save();

        res.status(200).json({ 
            message: 'Subscription cancelled successfully. Access will remain until end of billing period.',
            endDate: subscription.endDate
        });

    } catch (error) {
        console.error('❌ Cancel Subscription Error:', error);
        res.status(500).json({ 
            message: 'Failed to cancel subscription',
            error: error.message 
        });
    }
};

// ========================================
// 📋 GET ALL PLANS
// ========================================
export const getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.find({ isActive: true })
            .select('-__v') // Exclude version field
            .sort({ price: 1 })
            .lean(); // Better performance for read-only operations
        
        res.status(200).json(plans);
    } catch (error) {
        console.error('❌ Get Plans Error:', error);
        res.status(500).json({ 
            message: 'Failed to fetch plans',
            error: error.message 
        });
    }
};

// ========================================
// 🪝 RAZORPAY WEBHOOK HANDLER
// ========================================
export const handleWebhook = async (req, res) => {
    try {
        const webhookSignature = req.headers['x-razorpay-signature'];
        const webhookBody = req.body;

        // Validate webhook signature
        if (!webhookSignature) {
            return res.status(400).json({ message: 'Missing webhook signature' });
        }

        const isValid = verifyWebhookSignature(webhookBody, webhookSignature);
        
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        const event = webhookBody.event;
        const payload = webhookBody.payload?.subscription?.entity;

        if (!payload) {
            return res.status(400).json({ message: 'Invalid webhook payload' });
        }

        // Handle different webhook events
        const eventHandlers = {
            'subscription.activated': handleSubscriptionActivated,
            'subscription.charged': handleSubscriptionCharged,
            'subscription.cancelled': handleSubscriptionCancelled,
            'subscription.paused': handleSubscriptionPaused,
            'subscription.completed': handleSubscriptionCompleted
        };

        const handler = eventHandlers[event];
        
        if (handler) {
            await handler(payload);
        } else {
            console.log(`⚠️ Unhandled webhook event: ${event}`);
        }

        res.status(200).json({ message: 'Webhook processed successfully' });

    } catch (error) {
        console.error('❌ Webhook Error:', error);
        res.status(500).json({ 
            message: 'Webhook processing failed',
            error: error.message 
        });
    }
};

// ========================================
// 🔧 WEBHOOK EVENT HANDLERS
// ========================================
async function handleSubscriptionActivated(payload) {
    const subscription = await Subscription.findOne({ 
        razorpaySubscriptionId: payload.id 
    });
    
    if (subscription) {
        subscription.status = 'active';
        await subscription.save();
        console.log(`✅ Subscription ${payload.id} activated`);
    }
}

async function handleSubscriptionCharged(payload) {
    const subscription = await Subscription.findOne({ 
        razorpaySubscriptionId: payload.id 
    });
    
    if (subscription) {
        subscription.currentPeriodStart = new Date(payload.current_start * 1000);
        subscription.currentPeriodEnd = new Date(payload.current_end * 1000);
        await subscription.save();
        console.log(`💰 Subscription ${payload.id} charged`);
    }
}

async function handleSubscriptionCancelled(payload) {
    const subscription = await Subscription.findOne({ 
        razorpaySubscriptionId: payload.id 
    });
    
    if (subscription) {
        subscription.status = 'cancelled';
        subscription.autoRenew = false;
        await subscription.save();
        console.log(`❌ Subscription ${payload.id} cancelled`);
    }
}

async function handleSubscriptionPaused(payload) {
    const subscription = await Subscription.findOne({ 
        razorpaySubscriptionId: payload.id 
    });
    
    if (subscription) {
        subscription.status = 'paused';
        await subscription.save();
        console.log(`⏸️ Subscription ${payload.id} paused`);
    }
}

async function handleSubscriptionCompleted(payload) {
    const subscription = await Subscription.findOne({ 
        razorpaySubscriptionId: payload.id 
    });
    
    if (subscription) {
        subscription.status = 'expired';
        await subscription.save();
        console.log(`🏁 Subscription ${payload.id} completed`);
    }
}
