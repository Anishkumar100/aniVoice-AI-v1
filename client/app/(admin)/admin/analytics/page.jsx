'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const AnalyticsContent = dynamic(
  () => import('@/components/admin/AdminAnalytics'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={40} className="animate-spin text-rose-600" />
      </div>
    )
  }
)

export default function AdminAnalyticsPage() {
  return <AnalyticsContent />
}
