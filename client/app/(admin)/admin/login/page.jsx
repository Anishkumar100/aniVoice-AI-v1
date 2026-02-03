'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/lib/hooks/useAdmin'
import AdminLoginForm from '@/components/auth/AdminLoginForm'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const { isAdminAuthenticated } = useAdmin()

  // Redirect if already logged in
  useEffect(() => {
    if (isAdminAuthenticated) {
      router.push('/admin/dashboard')
    }
  }, [isAdminAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
           
              <Image 
                src="/logo-icon.webp" 
                alt="AniVoice AI Logo" 
                width={32}
                height={32}
                className="object-contain"
              />
            
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AniVoice AI
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Admin Portal
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in to manage your AI platform
          </p>
        </div>

        {/* Login Form */}
        <AdminLoginForm />

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2026 AniVoice AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
