'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ThemeProvider } from '@/lib/hooks/useTheme'
import UserSidebar from '@/components/layout/UserSidebar'
import UserHeader from '@/components/layout/UserHeader'

export default function DashboardLayout({ children }) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Check if admin route
  const isAdminRoute = pathname?.startsWith('/admin')

  // Return early for admin routes
  if (!pathname || isAdminRoute) {
    return null
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-800"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-rose-600 animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <UserSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <div className="pt-16 lg:pl-64 transition-all duration-300">
          <UserHeader 
            user={user} 
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          />
          
          <main className="p-4 lg:p-8 animate-in fade-in duration-500">
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
