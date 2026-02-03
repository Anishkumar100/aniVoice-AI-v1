'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { paymentAPI } from '@/lib/api/payment';
import toast from 'react-hot-toast';
import { emitSubscriptionUpdate } from '@/lib/utils/subscriptionEvents' // ✅ Add import

export default function PricingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingPlan, setProcessingPlan] = useState(null);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [plansData, subData] = await Promise.all([
                paymentAPI.getPlans(),
                paymentAPI.getSubscription().catch(() => null)
            ]);

            console.log('Plans data:', plansData); // Debug log
            setPlans(plansData);
            setSubscription(subData);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load pricing plans');
        } finally {
            setLoading(false);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async (plan) => {
        if (plan.price === 0) return;

        setProcessingPlan(plan._id);

        try {
            // Create subscription
            const response = await paymentAPI.createSubscription(plan._id);

            console.log('✅ Subscription created:', response);

            // ✅ MOCK MODE: Skip Razorpay modal and simulate successful payment
            toast.loading('Processing payment...', { duration: 2000 });

            // Simulate payment delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Verify payment with mock data
            try {
                await paymentAPI.verifyPayment({
                    razorpay_payment_id: `pay_mock_${Date.now()}`,
                    razorpay_subscription_id: response.subscriptionId,
                    razorpay_signature: `mock_signature_${Date.now()}`,
                });


                toast.success('Subscription activated successfully! 🎉');

                // Refresh subscription data
                await fetchData();


                // ✅ Emit event to update Header/Sidebar
                emitSubscriptionUpdate();

                // Navigate to subscription page
                setTimeout(() => {
                    router.push('/dashboard/subscription');
                }, 1000);
            } catch (error) {
                console.error('Payment verification error:', error);
                toast.error('Payment verification failed');
            }

            setProcessingPlan(null);

        } catch (error) {
            console.error('Upgrade error:', error);
            toast.error(error.response?.data?.message || 'Failed to create subscription');
            setProcessingPlan(null);
        }
    };

    // Helper function to get features as array
    // Helper function to get features as array
    // Helper function to get features as array
    const getFeatures = (plan) => {
        if (!plan) return [];

        // If features is already an array, return it
        if (Array.isArray(plan.features)) {
            return plan.features;
        }

        // If features is an object (boolean flags), convert to readable strings
        if (typeof plan.features === 'object' && plan.features !== null) {
            const isFree = plan.price === 0;

            // Define comprehensive features for each plan
            if (isFree) {
                return [
                    'Unlimited AI Conversations With Free Characters',
                    'Access to free characters',
                    'Standard voice quality',
                    'Basic chat features',
                    'Community support',
                    'Web access'
                ];
            } else {
                return [
                    'Unlimited AI conversations',
                    'Access to all premium characters',
                    'High-quality voice responses',
                    'Priority customer support',
                    'Ad-free experience',
                    'Advanced chat features',
                    'Conversation history',
                    'Early access to new features'
                ];
            }
        }

        // If features is a string, split by newline or comma
        if (typeof plan.features === 'string') {
            return plan.features.split(/\n|,/).map(f => f.trim()).filter(f => f.length > 0);
        }

        // Default features based on plan type
        const isFree = plan.price === 0;
        return isFree
            ? [
                'Limited AI conversations (10/day)',
                'Access to free characters',
                'Standard voice quality',
                'Basic chat features',
                'Community support',
                'Web access'
            ]
            : [
                'Unlimited AI conversations',
                'Access to all premium characters',
                'High-quality voice responses',
                'Priority customer support',
                'Ad-free experience',
                'Advanced chat features',
                'Conversation history',
                'Early access to new features'
            ];
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
        );
    }

    // Check by price instead of isPaid (price 0 = free, price > 0 = paid)
    const freePlan = plans.find(p => p.price === 0 || p.name.toLowerCase() === 'free');
    const proPlan = plans.find(p => p.price > 0 || p.name.toLowerCase() === 'pro');
    const isProUser = subscription?.hasPremiumAccess


    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500/10 to-purple-500/10 border border-rose-500/20 mb-4">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <span className="text-sm font-medium bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
                        Simple, Transparent Pricing
                    </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Choose Your Plan
                </h1>

                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                    Start free and upgrade anytime. No credit card required.
                </p>
            </motion.div>

            {/* Pricing Cards */}
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                {/* Free Plan */}
                {freePlan && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-8"
                    >
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {freePlan.name}
                                </h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                Perfect for getting started
                            </p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                                    ₹0
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                    /month
                                </span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {getFeatures(freePlan).map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            disabled
                            className="w-full py-3 px-6 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium cursor-not-allowed"
                        >
                            {!isProUser ? 'Current Plan' : 'Downgrade Available'}
                        </button>
                    </motion.div>
                )}

                {/* Pro Plan */}
                {proPlan && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative rounded-3xl border-2 border-rose-500 bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-xl p-8 shadow-2xl"
                    >
                        {/* Popular Badge */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-purple-500 text-white text-sm font-semibold shadow-lg">
                                ⭐ Most Popular
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Crown className="w-5 h-5 text-rose-500" />
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {proPlan.name}
                                </h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                Unlimited access to everything
                            </p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
                                    ₹{(proPlan.price / 100).toFixed(0)}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                    /{proPlan.billingCycle}
                                </span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {getFeatures(proPlan).map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-900 dark:text-white font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleUpgrade(proPlan)}
                            disabled={isProUser || processingPlan === proPlan._id}
                            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {processingPlan === proPlan._id ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : isProUser ? (
                                'Current Plan ✓'
                            ) : (
                                <>
                                    <Crown className="w-5 h-5" />
                                    Upgrade to Pro
                                </>
                            )}
                        </button>

                        {!isProUser && (
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                                🔒 Secure payment powered by Razorpay
                            </p>
                        )}
                    </motion.div>
                )}
            </div>

            {/* No Plans Fallback */}
            {plans.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        No pricing plans available at the moment.
                    </p>
                    <button
                        onClick={fetchData}
                        className="px-6 py-3 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* FAQ Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-3xl mx-auto mt-16"
            >
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                    Frequently Asked Questions
                </h2>

                <div className="space-y-4">
                    <details className="group rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-6">
                        <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white">
                            Can I cancel anytime?
                        </summary>
                        <p className="mt-3 text-gray-600 dark:text-gray-400">
                            Yes! You can cancel your subscription anytime from the subscription management page. No questions asked.
                        </p>
                    </details>

                    <details className="group rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-6">
                        <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white">
                            What payment methods do you accept?
                        </summary>
                        <p className="mt-3 text-gray-600 dark:text-gray-400">
                            We accept all major credit/debit cards, UPI, net banking, and wallets through Razorpay.
                        </p>
                    </details>

                    <details className="group rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-6">
                        <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white">
                            Is there a free trial?
                        </summary>
                        <p className="mt-3 text-gray-600 dark:text-gray-400">
                            Our Free plan is available forever! Try it out and upgrade when you're ready for unlimited access.
                        </p>
                    </details>
                </div>
            </motion.div>
        </div>
    );
}
