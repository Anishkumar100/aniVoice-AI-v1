'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react'
import axiosInstance from '@/lib/api/axios'

export default function AdminRevenuePage() {
  const [revenue, setRevenue] = useState({
    total: 0,
    monthly: 0,
    transactions: [],
    loading: true
  })

  useEffect(() => {
    loadRevenue()
  }, [])

  const loadRevenue = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/revenue')
      setRevenue({
        total: response.data.total || 0,
        monthly: response.data.monthly || 0,
        transactions: response.data.transactions || [],
        loading: false
      })
    } catch (error) {
      console.error('Failed to load revenue:', error)
      setRevenue(prev => ({ ...prev, loading: false }))
    }
  }

  if (revenue.loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <Card key={i} className="p-6">
              <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Revenue
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Platform earnings overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Total Revenue */}
        <Card className="p-6 hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Total Revenue
              </p>
              <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                ₹{revenue.total/100?.toLocaleString('en-IN') || '0'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                All-time earnings
              </p>
            </div>
            <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
          </div>
        </Card>

        {/* Monthly Revenue */}
        <Card className="p-6 hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Monthly Revenue
              </p>
              <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                ₹{revenue.monthly/100?.toLocaleString('en-IN') || '0'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <TrendingUp size={12} className="text-green-600" />
                This month
              </p>
            </div>
            <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">
          Recent Transactions
        </h3>
        
        {revenue.transactions.length > 0 ? (
          <div className="space-y-3">
            {revenue.transactions.map((txn, index) => (
              <div 
                key={txn._id || index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                {/* Left: User Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {txn.user?.name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {txn.plan?.name || 'Premium Plan'}
                    </p>
                  </div>
                </div>
                
                {/* Right: Amount & Date */}
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{txn.amount/100 || txn.plan?.price/100 || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 whitespace-nowrap">
                    <Calendar size={12} />
                    {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
          </div>
        )}
      </Card>
    </div>
  )
}
