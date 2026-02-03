'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useAdmin } from '@/lib/hooks/useAdmin'
import { setAdminCredentials } from '@/lib/store/slices/adminSlice'
import { storage } from '@/lib/utils/storage'
import { ThemeProvider } from '@/lib/hooks/useTheme'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch()
  const { isAdminAuthenticated, admin } = useAdmin()
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    const restoreSession = () => {
      const adminToken = storage.getAdminToken()
      const adminData = storage.getAdmin()

      if (adminToken && adminData) {
        dispatch(setAdminCredentials({ admin: adminData, adminToken }))
      }

      setTimeout(() => setIsLoading(false), 50)
    }

    restoreSession()
  }, [dispatch])

  useEffect(() => {
    if (!isLoading && !isAdminAuthenticated && !isLoginPage) {
      router.push('/admin/login')
    }
  }, [isLoading, isAdminAuthenticated, isLoginPage, router])

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          {/* Modern Loading Spinner */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-800"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-gray-900 dark:border-t-white animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-950">
        {children}
      </div>
    )
  }

  if (!isAdminAuthenticated) {
    return null
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <AdminSidebar />
        
        <div className="lg:pl-64 transition-all duration-300">
          <AdminHeader 
            admin={admin} 
            onMenuClick={() => {
              const btn = document.querySelector('[data-mobile-menu]')
              btn?.click()
            }} 
          />
          
          <main className="p-4 lg:p-8 animate-in fade-in duration-500">
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-800 py-6 px-4 lg:px-8">
            <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
              <p>© 2026 AniVoice AI. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Support</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  )
}
