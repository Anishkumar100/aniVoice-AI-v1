import { createSlice } from '@reduxjs/toolkit'

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    plan: null,
    status: 'inactive',
    expiresAt: null,
  },
  reducers: {
    setSubscription: (state, action) => {
      state.plan = action.payload.plan
      state.status = action.payload.status
      state.expiresAt = action.payload.expiresAt
    },
    clearSubscription: (state) => {
      state.plan = null
      state.status = 'inactive'
      state.expiresAt = null
    },
  },
})

export const { setSubscription, clearSubscription } = subscriptionSlice.actions
export default subscriptionSlice.reducer
