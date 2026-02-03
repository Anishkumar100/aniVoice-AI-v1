// Custom event system for subscription updates
export const SUBSCRIPTION_UPDATED_EVENT = 'subscriptionUpdated';

export const emitSubscriptionUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SUBSCRIPTION_UPDATED_EVENT));
  }
};

export const onSubscriptionUpdate = (callback) => {
  if (typeof window !== 'undefined') {
    window.addEventListener(SUBSCRIPTION_UPDATED_EVENT, callback);
    return () => window.removeEventListener(SUBSCRIPTION_UPDATED_EVENT, callback);
  }
};
