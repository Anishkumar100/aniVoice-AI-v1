# Payment System Guide - Voice Box AI

## Complete Explanation of Payment Controller, Subscription Model & Plan Model

---

## 📊 Table of Contents
1. Payment Controller - Complete Breakdown
2. Subscription Model - Database Schema
3. Plan Model - Pricing Structure
4. How They Work Together
5. Data Flow Diagrams

---

## 🎯 PART 1: PAYMENT CONTROLLER - Complete Breakdown

### Overview
The Payment Controller is the **bridge between your frontend and Razorpay**. It:
- Creates subscriptions in YOUR database
- Verifies payments from Razorpay
- Updates user plan status
- Handles monthly renewal via webhooks

**Important:** It does NOT process payments directly - Razorpay does that!

---

### 1.1 CREATE SUBSCRIPTION ENDPOINT
**Endpoint:** `POST /api/payments/create-subscription`

**What It Does:**
1. User clicks "Upgrade to Pro" in frontend
2. Frontend sends planId to this endpoint
3. Backend creates subscription on Razorpay
4. Backend saves subscription record in YOUR database
5. Backend returns subscription details to frontend

**Code Flow:**
```javascript
export const createPaymentSubscription = async (req, res) => {
    // Step 1: Get planId from frontend
    const { planId } = req.body;
    const userId = req.user._id;

    // Step 2: Validate input
    if (!planId) {
        return res.status(400).json({ message: 'Plan ID is required' });
    }

    // Step 3: Query database in parallel for better performance
    // - Get Plan details (price, razorpayPlanId, etc.)
    // - Get User details (name, email, phone)
    // - Check if user already has active subscription
    const [plan, user, existingSubscription] = await Promise.all([
        Plan.findById(planId),
        User.findById(userId),
        Subscription.findOne({ userId, status: 'active', planType: 'Pro' })
    ]);

    // Step 4: Validate everything
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (plan.name === 'Free') return res.status(400).json({ message: 'Cannot create subscription for free plan' });
    if (existingSubscription) return res.status(400).json({ message: 'You already have an active subscription' });

    // Step 5: Get or create Razorpay Customer
    // - If user already paid before, reuse their Razorpay Customer ID
    // - If new user, create new Razorpay Customer
    let razorpayCustomerId;
    const previousSub = await Subscription.findOne({ userId }).select('razorpayCustomerId');
    
    if (previousSub?.razorpayCustomerId) {
        razorpayCustomerId = previousSub.razorpayCustomerId;
    } else {
        // Call Razorpay API to create customer
        const customer = await createCustomer(
            user.name || user.email,
            user.email,
            user.phone || '9999999999'
        );
        razorpayCustomerId = customer.id;
    }

    // Step 6: Call Razorpay API to CREATE subscription
    // This creates the subscription on RAZORPAY's servers, NOT in your database
    const razorpaySubscription = await createSubscription(
        plan.razorpayPlanId,      // ₹99/month plan ID from Razorpay Dashboard
        razorpayCustomerId,        // Customer ID on Razorpay
        12                         // 12 months total
    );

    // Step 7: Save subscription in YOUR database
    // Status is 'created' - will change to 'active' after payment
    const now = new Date();
    const subscription = await Subscription.create({
        userId,
        planId: plan._id,
        planType: plan.name,
        razorpaySubscriptionId: razorpaySubscription.id,  // Store Razorpay's ID
        razorpayCustomerId,
        status: 'created',  // Not active yet - waiting for payment
        startDate: now,
        currentPeriodStart: now
    });

    // Step 8: Return subscription data to frontend
    // Frontend will use this to open payment modal
    res.status(200).json({
        subscriptionId: razorpaySubscription.id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        planName: plan.displayName,
        amount: plan.price,
        currency: plan.currency,
        customerEmail: user.email,
        customerName: user.name || user.email
    });
};
```

**Database Change After This Endpoint:**
```javascript
// New record in Subscriptions collection
{
    _id: ObjectId,
    userId: ObjectId,
    planId: ObjectId,
    planType: "Pro",
    razorpaySubscriptionId: "sub_S4zzT6amH9KlHG",
    razorpayCustomerId: "cust_xxxxx",
    status: "created",              // ⚠️ Not active yet!
    startDate: "2026-01-18T08:00:00Z",
    currentPeriodStart: "2026-01-18T08:00:00Z",
    currentPeriodEnd: null,
    endDate: null,
    createdAt: "2026-01-18T08:00:00Z"
}

// User in database is STILL free
{
    _id: ObjectId,
    name: "User Name",
    email: "user@gmail.com",
    plan: "free",                   // Still free!
    subscriptionExpiresAt: null     // Still null!
}
```

---

### 1.2 VERIFY SUBSCRIPTION PAYMENT ENDPOINT
**Endpoint:** `POST /api/payments/verify-payment`

**What It Does:**
1. User completes payment in Razorpay modal
2. Razorpay returns payment details to frontend
3. Frontend sends these details to this endpoint
4. Backend verifies the payment is real
5. Backend updates subscription status to 'active'
6. User becomes Pro member

**Code Flow:**
```javascript
export const verifySubscriptionPayment = async (req, res) => {
    try {
        // Step 1: Get payment details from frontend
        // These come directly from Razorpay
        const { 
            razorpay_subscription_id,    // "sub_xxxxx"
            razorpay_payment_id,         // "pay_xxxxx"
            razorpay_signature           // "generated_signature"
        } = req.body;
        const userId = req.user._id;

        // Step 2: Validate input
        if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing required payment parameters' });
        }

        // Step 3: VERIFY SIGNATURE
        // This is CRITICAL - ensures payment came from Razorpay, not a hacker
        // How it works:
        // 1. Razorpay creates signature using: HMAC_SHA256(subscription_id|payment_id, YOUR_SECRET)
        // 2. Your backend recreates it the same way
        // 3. If they match = payment is real ✅
        // 4. If they don't match = hacker attempt ❌
        const isValid = verifySubscriptionSignature(
            razorpay_subscription_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Step 4: Get subscription from YOUR database
        // Also populate plan details
        const [subscription, razorpaySub] = await Promise.all([
            Subscription.findOne({ 
                userId,
                razorpaySubscriptionId: razorpay_subscription_id 
            }).populate('planId'),
            // Step 5: Fetch subscription details from RAZORPAY
            // This gets timestamps and current period info
            fetchSubscription(razorpay_subscription_id)
        ]);

        // Step 6: Validate subscription exists in your database
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Step 7: Calculate period dates from Razorpay response
        const startDate = new Date(razorpaySub.start_at * 1000);
        const endDate = new Date((razorpaySub.current_end || razorpaySub.end_at) * 1000);
        const currentPeriodStart = new Date(razorpaySub.current_start * 1000);
        const currentPeriodEnd = new Date(razorpaySub.current_end * 1000);

        // Step 8: Update subscription in YOUR database
        // Change status from 'created' to 'active'
        Object.assign(subscription, {
            status: 'active',                    // ✅ User is now PRO!
            razorpayPaymentId: razorpay_payment_id,
            startDate,
            endDate,
            currentPeriodStart,
            currentPeriodEnd
        });

        await subscription.save();

        // Step 9: Return success to frontend
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
```

**Database Change After This Endpoint:**
```javascript
// Updated Subscription record
{
    _id: ObjectId,
    userId: ObjectId,
    planId: ObjectId,
    planType: "Pro",
    razorpaySubscriptionId: "sub_xxxxx",
    razorpayCustomerId: "cust_xxxxx",
    razorpayPaymentId: "pay_xxxxx",      // ✅ Payment ID added
    status: "active",                     // ✅ Changed to active!
    startDate: "2026-01-18T08:00:00Z",
    currentPeriodStart: "2026-01-18T08:00:00Z",
    currentPeriodEnd: "2026-02-18T08:00:00Z",  // ✅ Next billing date
    endDate: "2026-02-18T08:00:00Z",
    createdAt: "2026-01-18T08:00:00Z"
}

// User in database is still free (but can access Pro features)
{
    _id: ObjectId,
    name: "User Name",
    email: "user@gmail.com",
    plan: "free",  // Still shows free (subscription model stores real status)
    subscriptionExpiresAt: null
}
```

**Note:** User's plan in User model doesn't change automatically. You can add a helper method or update it manually based on subscription status.

---

### 1.3 GET CURRENT SUBSCRIPTION ENDPOINT
**Endpoint:** `GET /api/payments/subscription`

**What It Does:**
1. Frontend asks "What's my current subscription status?"
2. Backend checks YOUR database
3. If user has no subscription, creates free plan automatically
4. Returns current subscription details

```javascript
export const getCurrentSubscription = async (req, res) => {
    try {
        const userId = req.user._id;

        // Step 1: Find subscription in database
        let subscription = await Subscription.findOne({ userId }).populate('planId');

        // Step 2: If no subscription exists, create free plan automatically
        // This happens for brand new users
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
            
            // Fetch again with populated plan details
            subscription = await Subscription.findById(subscription._id).populate('planId');
        }

        // Step 3: Check if subscription has expired
        // If endDate has passed and status isn't already expired, mark it expired
        if (subscription.endDate && subscription.endDate < new Date() && subscription.status !== 'expired') {
            subscription.status = 'expired';
            await subscription.save();
        }

        // Step 4: Return subscription details
        res.status(200).json({
            plan: subscription.planId,  // Full plan object with features, price, etc.
            status: subscription.status,  // 'active', 'expired', 'cancelled', etc.
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            hasPremiumAccess: subscription.hasPremiumAccess()  // Helper method
        });

    } catch (error) {
        console.error('❌ Get Subscription Error:', error);
        res.status(500).json({ 
            message: 'Failed to fetch subscription',
            error: error.message 
        });
    }
};
```

---

### 1.4 CANCEL SUBSCRIPTION ENDPOINT
**Endpoint:** `POST /api/payments/cancel-subscription`

**What It Does:**
1. User wants to cancel Pro subscription
2. Backend tells Razorpay to cancel (stops future charges)
3. Backend updates subscription status to 'cancelled'
4. User can still use Pro features until current period ends

```javascript
export const cancelUserSubscription = async (req, res) => {
    try {
        const userId = req.user._id;

        // Step 1: Find subscription
        const subscription = await Subscription.findOne({ userId });
        
        if (!subscription) {
            return res.status(404).json({ message: 'No active subscription found' });
        }

        // Step 2: Can't cancel free plan
        if (subscription.planType === 'Free') {
            return res.status(400).json({ message: 'Cannot cancel free plan' });
        }

        // Step 3: Call Razorpay API to cancel subscription
        // This stops future automatic charges
        if (subscription.razorpaySubscriptionId) {
            await cancelSubscription(subscription.razorpaySubscriptionId);
        }

        // Step 4: Update status in YOUR database
        subscription.status = 'cancelled';
        subscription.autoRenew = false;
        await subscription.save();

        // Step 5: Return success message
        res.status(200).json({ 
            message: 'Subscription cancelled successfully. Access will remain until end of billing period.',
            endDate: subscription.endDate  // Tell user when access ends
        });

    } catch (error) {
        console.error('❌ Cancel Subscription Error:', error);
        res.status(500).json({ 
            message: 'Failed to cancel subscription',
            error: error.message 
        });
    }
};
```

**Database Change:**
```javascript
{
    status: 'cancelled',    // ✅ Changed
    autoRenew: false
    // endDate stays the same - user can still use Pro until then
}
```

---

### 1.5 HANDLE WEBHOOK ENDPOINT
**Endpoint:** `POST /api/payments/webhook`

**What It Does:**
- Razorpay sends automatic notifications when:
  - Monthly charge succeeds → `subscription.charged`
  - Subscription ends → `subscription.completed`
  - Payment fails → `subscription.payment_failed`
  - User cancels from Razorpay side → `subscription.cancelled`

```javascript
export const handleWebhook = async (req, res) => {
    try {
        // Step 1: Get signature from headers
        const webhookSignature = req.headers['x-razorpay-signature'];
        const webhookBody = req.body;

        // Step 2: Validate webhook came from Razorpay
        if (!webhookSignature) {
            return res.status(400).json({ message: 'Missing webhook signature' });
        }

        const isValid = verifyWebhookSignature(webhookBody, webhookSignature);
        
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        // Step 3: Extract event type and payload
        const event = webhookBody.event;
        const payload = webhookBody.payload?.subscription?.entity;

        if (!payload) {
            return res.status(400).json({ message: 'Invalid webhook payload' });
        }

        // Step 4: Route to appropriate handler based on event type
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

        // Step 5: Always return 200 to Razorpay
        // If you return error, Razorpay will keep retrying
        res.status(200).json({ message: 'Webhook processed successfully' });

    } catch (error) {
        console.error('❌ Webhook Error:', error);
        res.status(500).json({ 
            message: 'Webhook processing failed',
            error: error.message 
        });
    }
};

// Webhook Event Handlers
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
    // Called every month when charge succeeds
    const subscription = await Subscription.findOne({ 
        razorpaySubscriptionId: payload.id 
    });
    
    if (subscription) {
        // Update the current billing period
        subscription.currentPeriodStart = new Date(payload.current_start * 1000);
        subscription.currentPeriodEnd = new Date(payload.current_end * 1000);
        await subscription.save();
        console.log(`💰 Subscription ${payload.id} charged`);
    }
}

async function handleSubscriptionCancelled(payload) {
    // Called when subscription is cancelled
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

async function handleSubscriptionCompleted(payload) {
    // Called when all 12 months are done
    const subscription = await Subscription.findOne({ 
        razorpaySubscriptionId: payload.id 
    });
    
    if (subscription) {
        subscription.status = 'expired';
        await subscription.save();
        console.log(`🏁 Subscription ${payload.id} completed`);
    }
}
```

---

## 📦 PART 2: SUBSCRIPTION MODEL - Database Schema

The Subscription model stores **the relationship between users and their subscriptions**.

```javascript
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    // === USER REFERENCE ===
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // === PLAN REFERENCE ===
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },

    // === PLAN INFO (Cached for quick lookup) ===
    planType: {
        type: String,
        enum: ['Free', 'Pro'],
        default: 'Free'
    },

    // === RAZORPAY IDs (For managing subscription on Razorpay) ===
    razorpaySubscriptionId: {
        type: String,
        // This is the subscription ID on Razorpay's servers
        // Used to cancel, fetch details, etc.
    },

    razorpayCustomerId: {
        type: String,
        // This is the customer ID on Razorpay
        // Reused if user subscribes multiple times
    },

    razorpayPaymentId: {
        type: String,
        // This is the payment ID from Razorpay
        // Proves payment happened
    },

    // === SUBSCRIPTION STATUS ===
    status: {
        type: String,
        enum: ['created', 'active', 'expired', 'cancelled', 'paused'],
        default: 'created',
        // 'created' = subscription created but not yet paid
        // 'active' = user has paid and can use Pro features
        // 'expired' = subscription period ended
        // 'cancelled' = user cancelled
        // 'paused' = temporarily paused
    },

    // === BILLING DATES ===
    startDate: {
        type: Date,
        // When the subscription starts
    },

    endDate: {
        type: Date,
        // When the subscription ends (or null for ongoing)
    },

    currentPeriodStart: {
        type: Date,
        // Start of current billing cycle
    },

    currentPeriodEnd: {
        type: Date,
        // End of current billing cycle (when next charge happens)
    },

    // === AUTO-RENEWAL ===
    autoRenew: {
        type: Boolean,
        default: true
        // Whether subscription auto-renews after current period
    }

}, { timestamps: true });

// Helper method to check if subscription is active
subscriptionSchema.methods.hasPremiumAccess = function() {
    return this.status === 'active' && 
           (!this.endDate || this.endDate > new Date());
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
```

### Subscription Model Fields Explained

| Field | Type | Purpose |
|-------|------|---------|
| `userId` | ObjectId | Which user owns this subscription |
| `planId` | ObjectId | Which plan (Free/Pro) they're subscribed to |
| `planType` | String | Cached plan name for quick lookup |
| `razorpaySubscriptionId` | String | ID on Razorpay for managing the subscription |
| `razorpayCustomerId` | String | Customer ID on Razorpay |
| `razorpayPaymentId` | String | Payment ID proof |
| `status` | String | Is subscription active, cancelled, expired? |
| `startDate` | Date | When subscription started |
| `endDate` | Date | When subscription ends |
| `currentPeriodStart` | Date | Current billing period start |
| `currentPeriodEnd` | Date | Current billing period end (next charge date) |
| `autoRenew` | Boolean | Will it auto-renew or end? |
| `timestamps` | Auto | createdAt and updatedAt |

### Example Subscription Records

**New Free User:**
```javascript
{
    userId: ObjectId("user123"),
    planId: ObjectId("plan_free"),
    planType: "Free",
    status: "active",
    startDate: "2026-01-18T08:00:00Z",
    endDate: null,
    autoRenew: true
}
```

**Pro User (Active):**
```javascript
{
    userId: ObjectId("user456"),
    planId: ObjectId("plan_pro"),
    planType: "Pro",
    razorpaySubscriptionId: "sub_xxxxx",
    razorpayCustomerId: "cust_xxxxx",
    razorpayPaymentId: "pay_xxxxx",
    status: "active",
    startDate: "2026-01-18T08:00:00Z",
    endDate: "2026-02-18T08:00:00Z",
    currentPeriodStart: "2026-01-18T08:00:00Z",
    currentPeriodEnd: "2026-02-18T08:00:00Z",
    autoRenew: true
}
```

**Pro User (Cancelled - Can Still Use Until End Date):**
```javascript
{
    userId: ObjectId("user789"),
    planId: ObjectId("plan_pro"),
    planType: "Pro",
    razorpaySubscriptionId: "sub_yyyyy",
    status: "cancelled",
    endDate: "2026-02-18T08:00:00Z",  // Access until then
    currentPeriodEnd: "2026-02-18T08:00:00Z",
    autoRenew: false  // Won't charge again
}
```

---

## 💰 PART 3: PLAN MODEL - Pricing Structure

The Plan model defines what subscriptions users can buy (Free, Pro, etc.).

```javascript
import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
    // === PLAN IDENTIFICATION ===
    name: {
        type: String,
        enum: ['Free', 'Pro'],
        required: true,
        unique: true
    },

    displayName: {
        type: String,
        // "Voice Box AI Pro" - shown to users
        required: true
    },

    description: {
        type: String,
        // "Unlimited chats with all AI characters"
        required: true
    },

    // === PRICING ===
    price: {
        type: Number,
        // In rupees: Free plan = 0, Pro plan = 99
        required: true,
        default: 0
    },

    currency: {
        type: String,
        default: 'INR',
        // Indian Rupees
    },

    // === RAZORPAY INTEGRATION ===
    razorpayPlanId: {
        type: String,
        // The Plan ID from Razorpay Dashboard
        // For Pro: "plan_S4zzT6amH9KlHG"
    },

    // === FEATURES ===
    maxChatsPerDay: {
        type: Number,
        // How many chats per day (null = unlimited)
    },

    maxCharactersPerChat: {
        type: Number,
        // Character limit per message (null = unlimited)
    },

    canUseAllCharacters: {
        type: Boolean,
        default: false
        // Can user chat with all characters?
    },

    voiceEnabled: {
        type: Boolean,
        default: false
        // Can user get voice responses?
    },

    prioritySupport: {
        type: Boolean,
        default: false
        // Faster customer support?
    },

    // === MANAGEMENT ===
    isActive: {
        type: Boolean,
        default: true
        // Is this plan available for purchase?
    }

}, { timestamps: true });

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
```

### Plan Model Fields Explained

| Field | Type | Example |
|-------|------|---------|
| `name` | String | "Free" or "Pro" |
| `displayName` | String | "Voice Box AI Pro" |
| `description` | String | "Chat with unlimited characters" |
| `price` | Number | 0 or 99 (rupees) |
| `currency` | String | "INR" |
| `razorpayPlanId` | String | "plan_S4zzT6amH9KlHG" |
| `maxChatsPerDay` | Number | null (unlimited) or 100 |
| `maxCharactersPerChat` | Number | null (unlimited) or 5000 |
| `canUseAllCharacters` | Boolean | false (Free) or true (Pro) |
| `voiceEnabled` | Boolean | false (Free) or true (Pro) |
| `prioritySupport` | Boolean | false (Free) or true (Pro) |
| `isActive` | Boolean | true |

### Example Plan Records

**Free Plan:**
```javascript
{
    _id: ObjectId("plan_free_123"),
    name: "Free",
    displayName: "Free Plan",
    description: "Chat with 3 basic characters",
    price: 0,
    currency: "INR",
    razorpayPlanId: null,  // No Razorpay for free
    maxChatsPerDay: 10,
    maxCharactersPerChat: 2000,
    canUseAllCharacters: false,  // Only 3 characters
    voiceEnabled: false,         // No voice for free
    prioritySupport: false,
    isActive: true
}
```

**Pro Plan:**
```javascript
{
    _id: ObjectId("plan_pro_456"),
    name: "Pro",
    displayName: "Voice Box AI Pro",
    description: "Unlimited chats with all characters + voice",
    price: 99,
    currency: "INR",
    razorpayPlanId: "plan_S4zzT6amH9KlHG",  // From Razorpay Dashboard
    maxChatsPerDay: null,        // Unlimited
    maxCharactersPerChat: null,  // Unlimited
    canUseAllCharacters: true,   // All characters available
    voiceEnabled: true,          // Voice responses enabled
    prioritySupport: true,       // Priority support
    isActive: true
}
```

---

## 🔄 PART 4: How They Work Together

### Data Relationship Diagram

```
USER (Model: User)
├── name, email, password
├── plan: "free"
├── subscriptionExpiresAt: null
└── (Links to subscriptions via userId)
    ↓
SUBSCRIPTION (Model: Subscription)
├── userId ─── links to User
├── planId ─── links to Plan
├── status: "active"
├── razorpaySubscriptionId: "sub_xxxxx"
├── endDate: 2026-02-18
└── currentPeriodEnd: 2026-02-18 (next charge date)
    ↓
PLAN (Model: Plan)
├── name: "Pro"
├── price: 99
├── razorpayPlanId: "plan_S4zzT6amH9KlHG"
├── canUseAllCharacters: true
├── voiceEnabled: true
└── (Defines what user can do)
```

### Complete User Journey

**1. New User Signs Up**
```
Frontend → Backend
POST /api/auth/register
{ name, email, password }

Backend creates:
✓ New User record (plan: "free")
✓ New Subscription (planId: Free plan, status: "active")
```

**2. User Wants to Upgrade**
```
Frontend → Backend
POST /api/payments/create-subscription
{ planId: "pro_plan_id" }

Backend does:
✓ Validates user & plan
✓ Calls Razorpay API → Creates subscription
✓ Saves to Subscription collection (status: "created")
✓ Returns subscriptionId to frontend
```

**3. User Pays in Modal**
```
Razorpay modal opens with:
- Subscription ID (from step 2)
- Amount: ₹99 (from Plan)
- Plan features (from Plan)

User enters card details
Razorpay processes payment
```

**4. Backend Verifies Payment**
```
Frontend → Backend
POST /api/payments/verify-payment
{ razorpay_payment_id, signature, etc }

Backend does:
✓ Verifies signature (security check)
✓ Updates Subscription (status: "active")
✓ Sets endDate (30 days from now)
✓ User is now Pro!
```

**5. Every Month**
```
Razorpay automatically:
✓ Charges card ₹99
✓ Sends webhook: subscription.charged

Backend receives webhook:
✓ Updates Subscription (currentPeriodEnd += 1 month)
```

**6. User Can Check Status Anytime**
```
Frontend → Backend
GET /api/payments/subscription

Backend returns:
{
    plan: { name: "Pro", price: 99, canUseAllCharacters: true },
    status: "active",
    endDate: 2026-02-18,
    hasPremiumAccess: true
}

Frontend shows: "You are a Pro member until Feb 18"
```

**7. User Cancels**
```
Frontend → Backend
POST /api/payments/cancel-subscription

Backend does:
✓ Calls Razorpay API → Cancels subscription
✓ Updates Subscription (status: "cancelled")
✓ User can still use Pro until endDate
```

---

## 📊 Key Concepts

### What Payment Controller Does
- ✅ Creates subscription records in YOUR database
- ✅ Verifies payments from Razorpay (signature check)
- ✅ Updates subscription status (created → active → cancelled)
- ✅ Handles webhooks from Razorpay
- ❌ Does NOT process payments directly

### What Razorpay Does
- ✅ Stores card information securely
- ✅ Processes payment transactions
- ✅ Charges customer every month automatically
- ✅ Sends webhooks to your backend
- ✅ Manages refunds & disputes
- ❌ Does NOT know about your database

### What Plan Model Does
- ✅ Defines pricing tiers (Free = ₹0, Pro = ₹99)
- ✅ Stores feature limits for each plan
- ✅ Links to Razorpay Plan ID
- ✅ Used to show pricing to users
- ❌ Does NOT store user's actual subscription

### What Subscription Model Does
- ✅ Stores user's current subscription
- ✅ Links user → plan
- ✅ Stores Razorpay IDs (for managing subscription)
- ✅ Tracks subscription status & dates
- ✅ Determines if user has Pro access
- ❌ Does NOT store user's personal details

---

## 🔐 Security Notes

1. **Signature Verification** - Always verify signatures from Razorpay
2. **Secret Keys** - Never expose RAZORPAY_KEY_SECRET in frontend
3. **Database Validation** - Always check if user owns the subscription they're modifying
4. **Idempotency** - Webhooks might fire multiple times - handle gracefully
5. **Error Logging** - Log all payment errors for debugging

---

## 🚀 Summary

The payment system is a three-part dance:

1. **Plan Model** tells you WHAT to charge (₹99/month)
2. **Subscription Model** stores the relationship (User X has Pro until Feb 18)
3. **Payment Controller** ensures everything stays in sync between your database and Razorpay

The controller doesn't process payments - it just coordinates between Razorpay and your database!

---

End of Document