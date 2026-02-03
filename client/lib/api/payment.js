// getPlans()
// createSubscription(planId)
// verifyPayment(paymentData)
// cancelSubscription()

// paymentAPI is an object that provides methods to interact with the payment-related API endpoints.

import axios from './axios'

export const paymentAPI = {
  async getPlans() {
    const response = await axios.get('/api/payments/plans')
    return response.data
  },

  async createSubscription(planId) {
    const response = await axios.post('/api/payments/create-subscription', {
      planId,
    })
    return response.data
  },

  async verifyPayment(data) {
    const response = await axios.post('/api/payments/verify-payment', data)
    return response.data
  },

  async getSubscription() {
    const response = await axios.get('/api/payments/subscription')
    return response.data
  },

  async cancelSubscription() {
    const response = await axios.post('/api/payments/cancel-subscription')
    return response.data
  },
}
