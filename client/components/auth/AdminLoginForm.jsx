'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useAdmin } from '@/lib/hooks/useAdmin'
import { toast } from 'react-hot-toast'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function AdminLoginForm() {
  const router = useRouter()
  const { adminLogin } = useAdmin()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await adminLogin(formData)
      toast.success('Welcome back, Admin!')
      router.push('/admin/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-xl p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Login
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your credentials to access the dashboard
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label 
            htmlFor="email" 
            className="block text-sm font-semibold text-gray-900 dark:text-white"
          >
            Email Address
          </label>
          <div className="relative group">
            <Mail 
              size={18} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" 
            />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@voicebox.ai"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label 
            htmlFor="password" 
            className="block text-sm font-semibold text-gray-900 dark:text-white"
          >
            Password
          </label>
          <div className="relative group">
            <Lock 
              size={18} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" 
            />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-11 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold transition-all hover:scale-105 active:scale-95 group"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>

      {/* Info Banner */}
      <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          🔒 Secure admin access only. All activities are logged.
        </p>
      </div>
    </Card>
  )
}
