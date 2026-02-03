'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamically import with SSR disabled
const AnalyticsContent = dynamic(
  () => import('@/components/admin/AnalyticsContent'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-rose-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }
)

export default function AdminAnalyticsPage() {
  return <AnalyticsContent />
}
