'use client'

import LoginForm from '@/components/auth/LoginForm'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [user, isAuthenticated, router])

  if (user && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-800"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-purple-600 animate-spin"></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    )
  }

  return <LoginForm />
}
