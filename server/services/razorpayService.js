import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ========================================
// 🎯 SUBSCRIPTION METHODS (Primary)
// ========================================

// Create Razorpay Subscription (for monthly 99.99rs plan)
export const createSubscription = async (planId, customerId, totalCount = 12) => {
    try {
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,  // Razorpay Plan ID from Dashboard
            customer_notify: 1,
            total_count: totalCount,  // 12 months = 1 year, then auto-renews
            notes: {
                app: 'AniVoice Box AI'
            }
        });
        
        return subscription;
    } catch (error) {
        console.error('❌ Razorpay Subscription Error:', error);
        throw error;
    }
};

// Create Razorpay Customer (needed before subscription)
export const createCustomer = async (name, email, contact) => {
    try {
        const customer = await razorpay.customers.create({
            name,
            email,
            contact,
            notes: {
                app: 'AniVoice Box AI'
            }
        });
        
        return customer;
    } catch (error) {
        console.error('❌ Razorpay Customer Creation Error:', error);
        throw error;
    }
};

// Cancel Subscription
export const cancelSubscription = async (subscriptionId) => {
    try {
        const subscription = await razorpay.subscriptions.cancel(subscriptionId, {
            cancel_at_cycle_end: 0  // Cancel immediately (set to 1 for end of cycle)
        });
        return subscription;
    } catch (error) {
        console.error('❌ Cancel Subscription Error:', error);
        throw error;
    }
};

// Fetch Subscription Details
export const fetchSubscription = async (subscriptionId) => {
    try {
        const subscription = await razorpay.subscriptions.fetch(subscriptionId);
        return subscription;
    } catch (error) {
        console.error('❌ Fetch Subscription Error:', error);
        throw error;
    }
};

// ========================================
// 🔐 VERIFICATION METHODS
// ========================================

// Verify Subscription Payment Signature
export const verifySubscriptionSignature = (subscriptionId, paymentId, signature) => {
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${subscriptionId}|${paymentId}`)
        .digest('hex');
    
    return generatedSignature === signature;
};

// Verify Webhook Signature
export const verifyWebhookSignature = (webhookBody, webhookSignature) => {
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(webhookBody))
        .digest('hex');
    
    return generatedSignature === webhookSignature;
};

// ========================================
// 📦 ONE-TIME PAYMENT (Optional - for future use)
// ========================================

// Create Razorpay Order (for one-time payments - NOT used for subscriptions)
export const createOrder = async (amount, currency = 'INR', receipt) => {
    try {
        const options = {
            amount: amount * 100,  // Convert to paise
            currency,
            receipt,
            notes: {
                description: 'AniVoice Box AI One-Time Payment'
            }
        };
        
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('❌ Razorpay Order Creation Error:', error);
        throw error;
    }
};

// Verify Order Payment Signature
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
    
    return generatedSignature === signature;
};

// Fetch Payment Details
export const fetchPayment = async (paymentId) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error('❌ Fetch Payment Error:', error);
        throw error;
    }
};

export default razorpay;
