'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  Users,
  Bot,
  Crown,
  DollarSign,
  ArrowUpRight,
  Plus,
  LayoutGrid,
  TrendingUp,
  Lock
} from 'lucide-react'
import { adminAPI } from '@/lib/api/admin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Animated Counter Component
function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value
    if (isNaN(numValue)) return

    let start = 0
    const duration = 1000
    const increment = numValue / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= numValue) {
        setCount(numValue)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value])

  return <>{prefix}{typeof value === 'string' && value.includes('₹') ? count.toLocaleString() : count}{suffix}</>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalCharacters: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    loading: true
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats()

      if (response.success) {
        setStats({
          totalCharacters: response.stats.totalCharacters,
          totalUsers: response.stats.totalUsers,
          activeSubscriptions: response.stats.activeSubscriptions,
          totalRevenue: response.stats.totalRevenue,
          loading: false
        })
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      change: '+12.5%',
      trend: 'up',
      href: '/admin/users',
      available: true, // ✅ Route exists
      color: 'blue'
    },
    {
      title: 'AI Characters',
      value: stats.totalCharacters,
      icon: Bot,
      change: '+3',
      trend: 'up',
      href: '/admin/characters',
      available: true, // ✅ Route exists
      color: 'purple'
    },
    {
      title: 'Premium Members',
      value: stats.activeSubscriptions,
      icon: Crown,
      change: '+2',
      trend: 'up',
      href: '/admin/subscriptions',
      available: true, // ✅ Route exists
      color: 'green'
    },
    {
      title: 'Revenue',
      value: stats.totalRevenue / 100,
      prefix: '₹',
      icon: DollarSign,
      change: stats.activeSubscriptions > 0 ? '+' + stats.activeSubscriptions : '—',
      trend: stats.activeSubscriptions > 0 ? 'up' : 'neutral',
      href: '/admin/revenue',
      available: true,
      color: 'orange'
    }
  ]

  const colorClasses = {
    blue: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      hover: 'hover:border-blue-200 dark:hover:border-blue-900'
    },
    purple: {
      iconBg: 'bg-purple-100 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      hover: 'hover:border-purple-200 dark:hover:border-purple-900'
    },
    green: {
      iconBg: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      hover: 'hover:border-green-200 dark:hover:border-green-900'
    },
    orange: {
      iconBg: 'bg-orange-100 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      hover: 'hover:border-orange-200 dark:hover:border-orange-900'
    }
  }

  if (stats.loading) {
    return (
      <div className="space-y-8 max-w-7xl animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded mt-2"></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 border border-gray-200 dark:border-gray-800">
              <div className="space-y-3">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

return (
  <div className="space-y-8 max-w-7xl">
    {/* Header */}
    <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          AniVoice AI Platform Overview
        </p>
      </div>

      <Button asChild className="gap-2 group">
        <Link href="/admin/characters/create">
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
          Create Character
        </Link>
      </Button>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        const colors = colorClasses[stat.color]

        const cardContent = (
          <Card
            className={`relative p-6 border-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
              stat.available
                ? `border-gray-200 dark:border-gray-800 ${colors.hover} hover:shadow-xl hover:-translate-y-2 cursor-pointer bg-white dark:bg-black`
                : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Lock Badge for unavailable */}
            {!stat.available && (
              <div className="absolute top-3 right-3">
                <div className="p-1.5 rounded-md bg-gray-200 dark:bg-gray-800">
                  <Lock size={12} className="text-gray-500" />
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center transition-transform ${stat.available ? 'group-hover:scale-110 group-hover:rotate-6' : ''}`}>
                <Icon size={22} className={colors.iconColor} />
              </div>

              {/* Value */}
              <div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight tabular-nums">
                  {stat.prefix && stat.prefix}
                  <AnimatedNumber value={stat.value} />
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                  {stat.title}
                </p>
              </div>

              {/* Change Indicator */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                {stat.change && stat.trend === 'up' && (
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-green-600 dark:text-green-500" />
                    <span className="text-xs font-semibold text-green-600 dark:text-green-500">
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500">vs last month</span>
                  </div>
                )}
                {stat.trend === 'neutral' && (
                  <span className="text-xs text-gray-400 font-medium">
                    No revenue yet
                  </span>
                )}

                {stat.available && (
                  <ArrowUpRight size={16} className="ml-auto text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                )}
              </div>
            </div>
          </Card>
        )

        return stat.available ? (
          <Link key={index} href={stat.href} className="group">
            {cardContent}
          </Link>
        ) : (
          <div key={index}>
            {cardContent}
          </div>
        )
      })}
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '400ms' }}>
      <Link
        href="/admin/characters"
        className="group relative p-8 border-2 border-gray-200 dark:border-gray-800 rounded-2xl hover:border-purple-200 dark:hover:border-purple-900 transition-all bg-white dark:bg-black hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <LayoutGrid size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <ArrowUpRight size={20} className="text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Manage Characters
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and edit all AI personalities
          </p>
        </div>
      </Link>

      <Link
        href="/admin/analytics"
        className="group relative p-8 border-2 border-gray-200 dark:border-gray-800 rounded-2xl hover:border-blue-200 dark:hover:border-blue-900 transition-all bg-white dark:bg-black hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <ArrowUpRight size={20} className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Platform insights and metrics
          </p>
        </div>
      </Link>
    </div>

    {/* Insights */}
    <Card className="p-8 border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-black hover:border-gray-300 dark:hover:border-gray-700 transition-all animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '500ms' }}>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
        Platform Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2 group cursor-pointer">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
            Conversion Rate
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums group-hover:scale-105 transition-transform inline-block">
            <AnimatedNumber
              value={stats.totalUsers > 0 ? (stats.activeSubscriptions / stats.totalUsers) * 100 : 0}
              suffix="%"
            />
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Users upgrading to premium
          </p>
        </div>
        <div className="space-y-2 group cursor-pointer">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
            Avg Revenue/User
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums group-hover:scale-105 transition-transform inline-block">
            ₹<AnimatedNumber
              value={stats.totalUsers > 0 ? Math.round(stats.totalRevenue / 100 / stats.totalUsers) : 0}
            />
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Average revenue per user
          </p>
        </div>
        <div className="space-y-2 group cursor-pointer">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
            Characters/User
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums group-hover:scale-105 transition-transform inline-block">
            <AnimatedNumber
              value={stats.totalUsers > 0 ? parseFloat((stats.totalCharacters / stats.totalUsers).toFixed(1)) : stats.totalCharacters}
            />
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Engagement metric
          </p>
        </div>
      </div>
    </Card>
  </div>
)

}
