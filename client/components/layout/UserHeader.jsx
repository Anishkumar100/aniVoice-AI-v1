'use client'

import { useState, useEffect } from 'react' // ✅ Add this line
import { useTheme } from '@/lib/hooks/useTheme'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Moon,
  Sun,
  ChevronDown,
  User,
  Crown,
  Menu
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'
import { paymentAPI } from '@/lib/api/payment' // ✅ Add this line
import { onSubscriptionUpdate } from '@/lib/utils/subscriptionEvents' // ✅ Add import

export default function UserHeader({ user, onMenuToggle }) {
  const { isDark, toggleTheme } = useTheme()
  const router = useRouter()
  const { logoutUser } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const sub = await paymentAPI.getSubscription()
        setSubscription(sub)
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  const handleLogout = () => {
    logoutUser()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const getUserName = () => {
    if (user?.name) return user.name
    if (user?.email) {
      return user.email.split('@')[0]
        .split('.')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    return 'User'
  }

  const getInitials = () => {
    const name = getUserName()
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()
  }

  const isPro = subscription?.hasPremiumAccess || false
  const planName = subscription?.plan?.name || 'Free'

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const sub = await paymentAPI.getSubscription()
        setSubscription(sub)
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()

    // ✅ Listen for subscription updates
    const unsubscribe = onSubscriptionUpdate(() => {
      console.log('🔄 Subscription updated, refreshing header...')
      fetchSubscription()
    })

    return unsubscribe // Cleanup listener
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm lg:left-64">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">

        {/* Left Section - Mobile Menu + Logo/Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden flex-shrink-0"
          >
            <Menu size={20} />
          </Button>

          {/* Logo (Mobile Only) */}
          <Link href="/dashboard" className="lg:hidden flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <Image
                src="/logo-icon.webp"
                alt="AniVoice AI"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>

            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              AniVoice AI
            </p>
          </Link>

          {/* Welcome Text (Desktop) */}
          <div className="hidden lg:block flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              Welcome back, {getUserName()}! 👋
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Continue your AI conversations
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Pro Badge or Upgrade Button */}
          {!loading && (
            <>
              {isPro ? (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500/10 to-purple-500/10 border border-rose-500/20">
                  <Crown size={14} className="text-rose-500" />
                  <span className="text-xs font-semibold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
                    Pro
                  </span>
                </div>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="hidden md:flex gap-2 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                >
                  <Link href="/dashboard/pricing">
                    <Crown size={16} />
                    <span>Upgrade</span>
                  </Link>
                </Button>
              )}
            </>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative flex-shrink-0"
          >
            <Sun size={18} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon size={18} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 pr-2 sm:pr-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 flex items-center justify-center shadow-md ring-2 ring-rose-100 dark:ring-rose-900">
                  <span className="text-white text-xs font-bold">
                    {getInitials()}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {getUserName()}
                </span>
                <ChevronDown size={16} className="hidden sm:block text-gray-400" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">
                      {getInitials()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {getUserName()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  {isPro ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-rose-500/10 to-purple-500/10 border border-rose-500/20">
                      <Crown size={12} className="text-rose-500" />
                      <span className="bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
                        {planName} Plan
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                      {planName} Plan
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <User size={16} className="mr-2" />
                Profile
              </DropdownMenuItem>

              {!isPro && (
                <DropdownMenuItem onClick={() => router.push('/dashboard/pricing')}>
                  <Crown size={16} className="mr-2 text-rose-600" />
                  Upgrade to Pro
                </DropdownMenuItem>
              )}

              {isPro && (
                <DropdownMenuItem onClick={() => router.push('/dashboard/subscription')}>
                  <Crown size={16} className="mr-2 text-rose-600" />
                  Manage Subscription
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:text-red-400 dark:focus:text-red-300 dark:focus:bg-red-900/20 cursor-pointer"
              >
                <User size={16} className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
