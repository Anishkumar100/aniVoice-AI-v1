'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      await login(formData)
      toast.success('Welcome back! 👋')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-xl">
      <CardHeader className="space-y-4 pb-6">
        {/* Logo */}
        <div className="flex justify-center">
         
            <Image 
              src="/logo-icon.webp" 
              alt="AniVoice AI" 
              width={40}
              height={40}
              className="object-contain"
            />
          
        </div>

        {/* Header Text */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back To <span className=' text-red-900'>AniVoice AI</span>
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in to continue your conversations
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" 
              />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
                className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-800 focus:border-red-500 dark:focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Password
              </label>
              <a 
                href="/forgot-password" 
                className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Forgot?
              </a>
            </div>
            <div className="relative group">
              <Lock 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" 
              />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
                className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-800 focus:border-red-500 dark:focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-11 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold transition-all hover:scale-105 active:scale-95 group"
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

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a 
              href="/register" 
              className="font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Create one
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
