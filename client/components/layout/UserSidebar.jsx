'use client'

import { useState, useEffect } from 'react' // ✅ Make sure both are here
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  Crown,
  MessageSquare,
  X,
  LogOut,
  Sparkles,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { paymentAPI } from '@/lib/api/payment' // ✅ Add this line
import { onSubscriptionUpdate } from '@/lib/utils/subscriptionEvents' // ✅ Add import

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Characters',
    href: '/dashboard/characters',
    icon: Users
  },
  {
    label: 'Conversations',
    href: '/dashboard/conversations',
    icon: MessageSquare,
   
  }
]

export default function UserSidebar({ isOpen, onClose }) {
  const pathname = usePathname()
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

  // Inside the component, update the useEffect:
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
      console.log('🔄 Subscription updated, refreshing sidebar...')
      fetchSubscription()
    })

    return unsubscribe // Cleanup listener
  }, [])

  const handleLogout = () => {
    logoutUser()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const isPro = subscription?.hasPremiumAccess || false

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 top-16 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-16 lg:top-0 h-[calc(100vh-4rem)] lg:h-screen w-64 z-40
        bg-white dark:bg-black
        border-r border-gray-200 dark:border-gray-800
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo & Close */}
          <div className="hidden lg:flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden group-hover:scale-110 transition-transform">
                <Image
                  src="/logo-icon.webp"
                  alt="AniVoice AI"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">AniVoice AI</span>
            </Link>
          </div>

          {/* Mobile Close Button */}
          <div className="lg:hidden flex items-center justify-between h-12 px-4 border-b border-gray-200 dark:border-gray-800">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Menu</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const isComingSoon = item.badge === 'Soon'

              return (
                <Link
                  key={item.href}
                  href={isComingSoon ? '#' : item.href}
                  onClick={(e) => {
                    if (isComingSoon) {
                      e.preventDefault()
                      toast('Coming soon!', { icon: '🚀' })
                    } else {
                      onClose()
                    }
                  }}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                      : isComingSoon
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon size={18} className={
                    isActive
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  } />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white animate-pulse" />
                  )}
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}

            {/* Pricing/Subscription Link */}
            {!loading && (
              <Link
                href={isPro ? '/dashboard/subscription' : '/dashboard/pricing'}
                onClick={onClose}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${pathname === '/dashboard/pricing' || pathname === '/dashboard/subscription'
                    ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : isPro
                      ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white'
                      : 'bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-700 hover:to-rose-800 shadow-lg shadow-rose-500/30'
                  }
                `}
              >
                <Crown size={18} className={
                  isPro
                    ? 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    : 'text-white'
                } />
                <span className="flex-1">{isPro ? 'Subscription' : 'Upgrade to Pro'}</span>
                {!isPro && <Sparkles size={14} className="text-white animate-pulse" />}
                {(pathname === '/dashboard/pricing' || pathname === '/dashboard/subscription') && isPro && (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white animate-pulse" />
                )}
              </Link>
            )}
          </nav>

          {/* Pro Banner or Pro Badge */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            {!loading && (
              <>
                {isPro ? (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-blue-500/10 border border-rose-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-purple-500 shadow-lg">
                        <Crown size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
                          Pro Member
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          All features unlocked
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full h-8 text-xs font-semibold"
                    >
                      <Link href="/dashboard/subscription">
                        Manage Plan
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="relative p-4 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                    <div className="relative space-y-2">
                      <div className="flex items-center gap-2 text-white">
                        <Zap size={16} fill="white" />
                        <span className="text-xs font-bold">Go Premium</span>
                      </div>
                      <p className="text-xs text-rose-100">
                        Unlimited chats & voices
                      </p>
                      <Button
                        asChild
                        variant="secondary"
                        className="w-full h-8 text-xs bg-white hover:bg-gray-100 text-rose-700 font-semibold"
                      >
                        <Link href="/dashboard/pricing">
                          Upgrade Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Logout */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
            >
              <LogOut size={18} className="mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
