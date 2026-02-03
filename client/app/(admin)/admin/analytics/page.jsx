'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  TrendingUp,
  Users,
  Crown,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react'
import axiosInstance from '@/lib/api/axios'

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    monthlyRevenue: [],
    loading: true
  })

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/revenue/monthly')
      setAnalytics({
        monthlyRevenue: response.data.months || [],
        loading: false
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
      setAnalytics(prev => ({ ...prev, loading: false }))
    }
  }

  if (analytics.loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <Card key={i} className="p-6">
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(...analytics.monthlyRevenue.map(m => m.revenue), 1)

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Platform performance insights
        </p>
      </div>

      {/* Monthly Revenue Chart */}
      <Card className="p-6 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Revenue Trend
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last 6 months
            </p>
          </div>
        </div>

        {analytics.monthlyRevenue.length > 0 ? (
          <div className="space-y-4">
            {/* Chart */}
            <div className="h-64 flex items-end justify-between gap-2 md:gap-4">
              {analytics.monthlyRevenue.map((month, index) => {
                const heightPercent = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0

                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                    {/* Bar */}
                    <div className="w-full relative">
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none z-10">
                        ₹{month.revenue.toLocaleString('en-IN')}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
                      </div>

                      <div
                        className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all duration-500 hover:from-green-600 hover:to-emerald-500 cursor-pointer"
                        style={{
                          height: `${heightPercent}%`,
                          minHeight: month.revenue > 0 ? '8px' : '0px'
                        }}
                      />
                    </div>

                    {/* Month Label */}
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        {month.month.split(' ')[0]}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {month.count}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-400"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Revenue (INR)</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown size={12} className="text-amber-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Subscriptions</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 dark:text-gray-400">No revenue data yet</p>
            </div>
          </div>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Revenue (6 months) */}
        <Card className="p-6 hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            ₹{(analytics.monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0) / 100).toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Revenue (6 months)
          </p>
        </Card>

        {/* Avg Monthly Revenue */}
        <Card className="p-6 hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            ₹{(Math.round((analytics.monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0) / (analytics.monthlyRevenue.length || 1))) / 100).toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Avg Monthly Revenue
          </p>
        </Card>

        {/* Total Subscriptions (6 months) */}
        <Card className="p-6 hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '400ms' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {analytics.monthlyRevenue.reduce((sum, m) => sum + m.count, 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Subscriptions (6 months)
          </p>
        </Card>
      </div>

      {/* Monthly Breakdown Table */}
      <Card className="p-6 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '500ms' }}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Monthly Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Month
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Revenue
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Subscriptions
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase hidden md:table-cell">
                  Avg/Sub
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.monthlyRevenue.map((month, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {month.month}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{(month.revenue / 100).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-semibold">
                      <Crown size={12} />
                      {month.count}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400 hidden md:table-cell">
                    ₹{month.count > 0 ? (Math.round(month.revenue / month.count) / 100).toLocaleString('en-IN') : '0'}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
