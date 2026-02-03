'use client'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from '../lib/store/store'
import { useEffect } from 'react'
import { setCredentials } from '../lib/store/slices/authSlice'
import { setAdminCredentials } from '../lib/store/slices/adminSlice'
import { storage } from '../lib/utils/storage'
import './globals.css'
import { ThemeProvider } from '@/lib/hooks/useTheme'

function AuthLoader({ children }) {
  useEffect(() => {
    const token = storage.getToken()
    const user = storage.getUser()
    
    if (token && user) {
      store.dispatch(setCredentials({ token, user }))
    }
    
    const adminToken = storage.getAdminToken()
    const admin = storage.getAdmin()
    
    if (adminToken && admin) {
      store.dispatch(setAdminCredentials({ adminToken, admin }))
    }
  }, [])
  
  return children
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
        <Provider store={store}>
          <AuthLoader>
            {children}
          </AuthLoader>
          <Toaster position="top-center" />
        </Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}
