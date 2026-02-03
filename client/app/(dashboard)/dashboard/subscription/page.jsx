'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Calendar, CreditCard, AlertCircle, CheckCircle, Loader2, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { paymentAPI } from '@/lib/api/payment';
import toast from 'react-hot-toast';
import { emitSubscriptionUpdate } from '@/lib/utils/subscriptionEvents' // ✅ Add import

export default function SubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const data = await paymentAPI.getSubscription();
      console.log('Subscription data:', data);
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      return;
    }

    setCancelling(true);
    try {
      await paymentAPI.cancelSubscription();
      toast.success('Subscription cancelled successfully');
      await fetchSubscription();
      // ✅ Emit event to update Header/Sidebar
      emitSubscriptionUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'cancelled':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'expired':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  const isPro = subscription?.plan?.name === 'Pro' || subscription?.plan?.price > 0;
  const isActive = subscription?.status === 'active';

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Subscription Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your subscription and billing
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-3xl border-2 ${isPro ? 'border-rose-500 bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-blue-500/10' : 'border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50'
            } backdrop-blur-xl p-8`}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              {isPro ? (
                <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-purple-500">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                  <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subscription?.plan?.name || 'Free'} Plan
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {isPro ? 'Premium access to all features' : 'Basic features included'}
                </p>
              </div>
            </div>

            {subscription?.status && (
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border capitalize ${getStatusColor(subscription.status)}`}>
                {subscription.status}
              </span>
            )}
          </div>

          {/* Subscription Details */}
          {isPro && subscription ? (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Started On</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(subscription.startDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {subscription.status === 'cancelled' ? 'Ends On' : 'Renews On'}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(subscription.endDate)}
                  </p>
                </div>
              </div>

              {subscription.plan?.price && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                      <CreditCard className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ₹{(subscription.plan.price / 100).toFixed(0)}/month
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Billing Cycle</p>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">
                        {subscription.plan.billingCycle || 'Monthly'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    You're on the Free Plan
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upgrade to Pro to unlock unlimited conversations, premium characters, and priority support.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {!isPro ? (
              <button
                onClick={() => router.push('/dashboard/pricing')}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Upgrade to Pro
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : isActive ? (
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="px-6 py-3 rounded-xl border-2 border-red-500 text-red-500 font-semibold hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    Cancel Subscription
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => router.push('/dashboard/pricing')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Reactivate Subscription
              </button>
            )}
          </div>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-8"
        >
          <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            {isPro ? 'Your Pro Features' : 'What You Get With Pro'}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Unlimited AI conversations',
              'Access to all premium characters',
              'High-quality voice responses',
              'Priority customer support',
              'Ad-free experience',
              'Advanced chat features',
              'Conversation history',
              'Early access to new features'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className={`w-5 h-5 ${isPro ? 'text-rose-500' : 'text-gray-400'}`} />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cancellation Notice */}
        {subscription?.status === 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-6"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  Subscription Cancelled
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You will retain Pro access until {formatDate(subscription.endDate)}. After that, your account will revert to the Free plan.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
