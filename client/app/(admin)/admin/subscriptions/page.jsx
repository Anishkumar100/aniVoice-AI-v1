'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown, Trash2, Sparkles, User, Mail, Calendar } from 'lucide-react'
import axiosInstance from '@/lib/api/axios'

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [cleaningUp, setCleaningUp] = useState(false)

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/subscriptions')
      setSubscriptions(response.data.subscriptions || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to load subscriptions:', error)
      setLoading(false)
    }
  }

  const handleCleanup = async () => {
    if (!confirm('Delete all orphaned subscriptions?')) return
    
    setCleaningUp(true)
    try {
      const response = await axiosInstance.post('/api/admin/subscriptions/cleanup')
      alert(`✅ Cleaned up ${response.data.deletedCount} subscriptions`)
      loadSubscriptions()
    } catch (error) {
      console.error('Cleanup failed:', error)
      alert('❌ Cleanup failed')
    } finally {
      setCleaningUp(false)
    }
  }

  const handleDelete = async (id, userName) => {
    if (!confirm(`Delete subscription for ${userName}?`)) return
    
    try {
      await axiosInstance.delete(`/api/admin/subscriptions/${id}`)
      alert('✅ Subscription deleted')
      loadSubscriptions()
    } catch (error) {
      console.error('Delete failed:', error)
      alert('❌ Delete failed')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded"></div>
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6">
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </Card>
        ))}
      </div>
    )
  }

  const activeCount = subscriptions.filter(s => s.status === 'active').length
  const orphanedCount = subscriptions.filter(s => 
    s.user?.name === 'Deleted User' || s.user?.email === 'N/A'
  ).length

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Premium Members
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {activeCount} active • {subscriptions.length} total
            {orphanedCount > 0 && <span className="text-orange-600"> • {orphanedCount} orphaned</span>}
          </p>
        </div>
        
        {orphanedCount > 0 && (
          <Button 
            onClick={handleCleanup}
            disabled={cleaningUp}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Sparkles size={16} className="mr-2" />
            {cleaningUp ? 'Cleaning...' : `Clean Up (${orphanedCount})`}
          </Button>
        )}
      </div>

      {/* List */}
      {subscriptions.length === 0 ? (
        <Card className="p-12 text-center">
          <Crown className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No subscriptions yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const isOrphaned = sub.user?.email === 'N/A'
            
            return (
              <Card 
                key={sub._id}
                className={`p-6 ${isOrphaned ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/10' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {sub.user?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-500">{sub.plan?.name || 'Unknown Plan'}</p>
                      </div>
                      
                      {isOrphaned && (
                        <span className="px-2 py-1 rounded bg-orange-200 text-orange-800 text-xs font-semibold">
                          ORPHANED
                        </span>
                      )}
                      
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {sub.status?.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail size={14} />
                        <span className="break-all">{sub.user?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>
                          {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString('en-IN') : 'N/A'}
                        </span>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        ₹{sub.plan?.price || 0}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Delete */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(sub._id, sub.user?.name || 'this user')}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
