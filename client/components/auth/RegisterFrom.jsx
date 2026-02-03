'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { authAPI } from '@/lib/api/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { User, Mail, Lock, ArrowRight, Loader2, HelpCircle } from 'lucide-react'
import Image from 'next/image'

export default function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [securityQuestions, setSecurityQuestions] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    securityQuestion: '',
    securityAnswer: ''
  })

  // ✅ Fetch security questions on mount
  useEffect(() => {
    fetchSecurityQuestions()
  }, [])

  const fetchSecurityQuestions = async () => {
    try {
      const questions = await authAPI.getSecurityQuestions()
      setSecurityQuestions(questions)
      if (questions.length > 0) {
        setFormData(prev => ({ ...prev, securityQuestion: questions[0] }))
      }
    } catch (error) {
      console.error('Error fetching security questions:', error)
      toast.error('Failed to load security questions')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    // ✅ Validate security answer
    if (!formData.securityAnswer.trim()) {
      toast.error('Please answer the security question')
      return
    }

    setLoading(true)

    try {
      await register(formData)
      toast.success('Welcome to AniVoice AI! 🎉')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
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
            Create Your Account In <span className='text-red-900'>AniVoice AI</span>
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Start chatting with AI characters
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <label 
              htmlFor="name" 
              className="block text-sm font-semibold text-gray-900 dark:text-white"
            >
              Full Name
            </label>
            <div className="relative group">
              <User 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" 
              />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                required
                className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-800 focus:border-red-500 dark:focus:border-red-500 transition-colors"
              />
            </div>
          </div>

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
            <label 
              htmlFor="password" 
              className="block text-sm font-semibold text-gray-900 dark:text-white"
            >
              Password
            </label>
            <div className="relative group">
              <Lock 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" 
              />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
                minLength={6}
                className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-800 focus:border-red-500 dark:focus:border-red-500 transition-colors"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Must be at least 6 characters long
            </p>
          </div>

          {/* ✅ Security Question Section */}
          <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-red-600" />
              <label className="text-sm font-semibold text-gray-900 dark:text-white">
                Security Question
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This will help you recover your account if you forget your password
            </p>

            {/* Security Question Dropdown */}
            <div className="space-y-2">
              <select
                name="securityQuestion"
                value={formData.securityQuestion}
                onChange={handleChange}
                disabled={loading}
                required
                className="w-full px-4 h-11 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 focus:border-red-500 dark:focus:border-red-500 rounded-md transition-colors text-sm"
              >
                {securityQuestions.map((question, index) => (
                  <option key={index} value={question}>
                    {question}
                  </option>
                ))}
              </select>
            </div>

            {/* Security Answer */}
            <div className="space-y-2">
              <Input
                name="securityAnswer"
                type="text"
                placeholder="Your answer"
                value={formData.securityAnswer}
                onChange={handleChange}
                disabled={loading}
                required
                className="h-11 border-2 border-gray-200 dark:border-gray-800 focus:border-red-500 dark:focus:border-red-500 transition-colors"
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
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a 
              href="/login" 
              className="font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
