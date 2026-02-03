// Mock Razorpay Service for Testing
// Simulates Razorpay API without making real API calls

export const createCustomer = async (name, email, contact) => {
    console.log('🎭 MOCK: Creating customer', { name, email, contact });
    
    // Return fake customer object
    return {
        id: `cust_mock_${Date.now()}`,
        entity: 'customer',
        name,
        email,
        contact,
        created_at: Math.floor(Date.now() / 1000)
    };
};

export const createSubscription = async (planId, customerId, totalCount = 12) => {
    console.log('🎭 MOCK: Creating subscription', { planId, customerId, totalCount });
    
    const now = Math.floor(Date.now() / 1000);
    const thirtyDays = 30 * 24 * 60 * 60;
    
    // Return fake subscription object
    return {
        id: `sub_mock_${Date.now()}`,
        entity: 'subscription',
        status: 'created',
        current_start: now,
        current_end: now + thirtyDays,
        ended_at: null,
        quantity: 1,
        customer_id: customerId,
        plan_id: planId,
        total_count: totalCount,
        paid_count: 0,
        remaining_count: totalCount,
        created_at: now
    };
};

export const verifySubscriptionSignature = (subscriptionId, paymentId, signature) => {
    console.log('🎭 MOCK: Verifying signature', { subscriptionId, paymentId, signature });
    
    // Always return true in mock mode
    return true;
};

export const fetchSubscription = async (subscriptionId) => {
    console.log('🎭 MOCK: Fetching subscription', { subscriptionId });
    
    const now = Math.floor(Date.now() / 1000);
    const thirtyDays = 30 * 24 * 60 * 60;
    
    // Return fake subscription details
    return {
        id: subscriptionId,
        entity: 'subscription',
        status: 'active',
        current_start: now,
        current_end: now + thirtyDays,
        start_at: now,
        end_at: now + (365 * 24 * 60 * 60), // 1 year
        customer_id: `cust_mock_${Date.now()}`,
        plan_id: 'plan_mock_12345',
        quantity: 1,
        paid_count: 1,
        remaining_count: 11,
        total_count: 12,
        created_at: now
    };
};

export const cancelSubscription = async (subscriptionId) => {
    console.log('🎭 MOCK: Cancelling subscription', { subscriptionId });
    
    // Return fake cancellation response
    return {
        id: subscriptionId,
        entity: 'subscription',
        status: 'cancelled',
        ended_at: Math.floor(Date.now() / 1000)
    };
};

export const verifyWebhookSignature = (body, signature) => {
    console.log('🎭 MOCK: Verifying webhook signature');
    
    // Always return true in mock mode
    return true;
};
