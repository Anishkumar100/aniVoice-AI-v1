'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Users, Search, Crown, Calendar, Mail } from 'lucide-react'
import axiosInstance from '@/lib/api/axios'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  const loadUsers = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/users')
      setUsers(response.data.users || response.data)
      setFilteredUsers(response.data.users || response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load users:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Total Users
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {users.length} registered users
        </p>
      </div>

      {/* Search */}
      <div className="relative animate-in fade-in slide-in-from-top-4 duration-700" style={{ animationDelay: '100ms' }}>
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user, index) => (
          <Card 
            key={user._id} 
            className="p-4 md:p-6 hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Mobile Layout */}
            <div className="flex flex-col md:hidden space-y-4">
              {/* Top Row - Avatar + Name + Badge */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white break-words">
                      {user.name || 'Unknown User'}
                    </h3>
                    {user.subscription?.status === 'active' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold whitespace-nowrap">
                        <Crown size={10} />
                        Premium
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail size={14} className="shrink-0" />
                <span className="break-all">{user.email}</span>
              </div>

              {/* Join Date */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={14} className="shrink-0" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { 
                  day: 'numeric',
                  month: 'short', 
                  year: 'numeric' 
                })}</span>
              </div>

              {/* User ID */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">User ID</p>
                <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                  {user._id.slice(-8)}
                </p>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Avatar */}
                <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.name || 'Unknown User'}
                    </h3>
                    {user.subscription?.status === 'active' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold">
                        <Crown size={10} />
                        Premium
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} className="shrink-0" />
                      <span className="break-all">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Calendar size={14} className="shrink-0" />
                      Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { 
                        day: 'numeric',
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right shrink-0 ml-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">User ID</p>
                <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  {user._id.slice(-8)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card className="p-8 md:p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No users found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {searchQuery ? 'Try a different search term' : 'No users registered yet'}
          </p>
        </Card>
      )}
    </div>
  )
}
