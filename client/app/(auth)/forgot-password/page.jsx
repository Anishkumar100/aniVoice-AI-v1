'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { Mail, Lock, HelpCircle, Loader2, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const router = useRouter()
  
  const [step, setStep] = useState(1) // 1: Email, 2: Security Question, 3: New Password
  const [loading, setLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    securityQuestion: '',
    securityAnswer: '',
    newPassword: '',
    confirmPassword: '',
    resetToken: '',
    userId: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Step 1: Submit Email
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email.trim()) {
      toast.error('Email is required')
      return
    }

    try {
      setLoading(true)
      const response = await authAPI.getSecurityQuestion(formData.email)
      setFormData({...formData, securityQuestion: response.securityQuestion})
      setStep(2)
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.response?.data?.message || 'User not found')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify Security Answer
  const handleSecuritySubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.securityAnswer.trim()) {
      toast.error('Answer is required')
      return
    }

    try {
      setLoading(true)
      const response = await authAPI.verifySecurityAnswer({
        email: formData.email,
        securityAnswer: formData.securityAnswer
      })
      
      setFormData({
        ...formData, 
        resetToken: response.resetToken,
        userId: response.userId
      })
      setStep(3)
      toast.success('Answer verified!', { icon: '✅' })
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.response?.data?.message || 'Incorrect answer')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  const handlePasswordReset = async (e) => {
    e.preventDefault()
    
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      await authAPI.resetPassword({
        userId: formData.userId,
        newPassword: formData.newPassword
      })
      
      toast.success('Password reset successfully!', { icon: '🎉' })
      router.push('/login')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
                Reset Your Password
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step === 1 && 'Enter your email to continue'}
                {step === 2 && 'Answer your security question'}
                {step === 3 && 'Create a new password'}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    s <= step ? 'w-16 bg-red-600' : 'w-8 bg-gray-200 dark:bg-gray-800'
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {/* Step 1: Email */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-white">
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
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      autoFocus
                      className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-800 focus:border-red-500 dark:focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>

                <div className="text-center">
                  <a 
                    href="/login" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors inline-flex items-center gap-1"
                  >
                    <ArrowLeft size={14} />
                    Back to login
                  </a>
                </div>
              </form>
            )}

            {/* Step 2: Security Question */}
            {step === 2 && (
              <form onSubmit={handleSecuritySubmit} className="space-y-5">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {formData.securityQuestion}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="securityAnswer" className="block text-sm font-semibold text-gray-900 dark:text-white">
                    Your Answer
                  </label>
                  <Input
                    id="securityAnswer"
                    name="securityAnswer"
                    type="text"
                    placeholder="Type your answer"
                    value={formData.securityAnswer}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    autoFocus
                    className="h-11 border-2 border-gray-200 dark:border-gray-800 focus:border-red-500 dark:focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 h-11 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <ArrowLeft size={18} className="mr-2" />
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify'
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handlePasswordReset} className="space-y-5">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Identity verified! Create your new password
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-900 dark:text-white">
                    New Password
                  </label>
                  <div className="relative group">
                    <Lock 
                      size={18} 
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" 
                    />
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={formData.newPassword}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      autoFocus
                      minLength={6}
                      className="pl-10 pr-12 h-11 border-2 border-gray-200 dark:border-gray-800 focus:border-red-500 dark:focus:border-red-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 dark:text-white">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock 
                      size={18} 
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" 
                    />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      className="pl-10 pr-12 h-11 border-2 border-gray-200 dark:border-gray-800 focus:border-red-500 dark:focus:border-red-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
