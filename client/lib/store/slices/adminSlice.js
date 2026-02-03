import { createSlice } from '@reduxjs/toolkit'

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    admin: null,
    adminToken: null,
    isAdminAuthenticated: false,
  },
  reducers: {
    setAdminCredentials: (state, action) => {
      state.admin = action.payload.admin
      state.adminToken = action.payload.token
      state.isAdminAuthenticated = true
    },
    adminLogout: (state) => {
      state.admin = null
      state.adminToken = null
      state.isAdminAuthenticated = false
    },
  },
})

export const { setAdminCredentials, adminLogout } = adminSlice.actions
export default adminSlice.reducer
