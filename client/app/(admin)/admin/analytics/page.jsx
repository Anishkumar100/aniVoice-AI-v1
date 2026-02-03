export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default function AdminAnalyticsPage() {
  if (typeof window === 'undefined') {
    return <div>Loading...</div>
  }
  
  const AnalyticsContent = require('@/components/admin/AdminAnalytics').default
  return <AnalyticsContent />
}
