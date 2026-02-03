import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import subscriptionReducer from './slices/subscriptionSlice'
import adminReducer from './slices/adminSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    subscription: subscriptionReducer,
  },
})
