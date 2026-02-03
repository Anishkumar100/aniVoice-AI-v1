'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  Users,
  Crown,
  ArrowUpRight,
  Sparkles,
  Zap,
  Loader2,
  CheckCircle2,
  Star,
  ArrowRight,
  Rocket,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { characterAPI } from '@/lib/api/characters'
import { paymentAPI } from '@/lib/api/payment'
import { onSubscriptionUpdate } from '@/lib/utils/subscriptionEvents'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState(null)
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalCharacters: 0,
    userPlan: 'Free'
  })
  const [recommendedCharacters, setRecommendedCharacters] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [characters, sub] = await Promise.all([
          characterAPI.getPublicCharacters(),
          paymentAPI.getSubscription().catch(() => null)
        ])

        if (characters) {
          setStats(prev => ({
            ...prev,
            totalCharacters: characters.length,
            userPlan: sub?.plan?.name || 'Free'
          }))
          setRecommendedCharacters(characters.slice(0, 3))
        }

        setSubscription(sub)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()

    // Listen for subscription updates
    const unsubscribe = onSubscriptionUpdate(() => {
      console.log('🔄 Subscription updated, refreshing dashboard...')
      fetchDashboardData()
    })

    return unsubscribe
  }, [])

  const isPro = subscription?.hasPremiumAccess || false
  const planName = subscription?.plan?.name || 'Free'

  const statCards = [
    {
      title: 'Conversations',
      value: stats.totalConversations,
      icon: MessageSquare,
      color: 'rose',
      href: '#',
      disabled: true
    },
    {
      title: 'Characters',
      value: stats.totalCharacters,
      subtitle: 'Available',
      icon: Users,
      color: 'blue',
      href: '/dashboard/characters'
    },
    {
      title: 'Your Plan',
      value: planName,
      subtitle: isPro ? 'All unlocked' : 'Upgrade for more',
      icon: Crown,
      color: isPro ? 'purple' : 'amber',
      href: isPro ? '/dashboard/subscription' : '/dashboard/pricing',
      highlight: !isPro,
      isPro: isPro
    }
  ]

  const colorClasses = {
    rose: {
      iconBg: 'bg-rose-100 dark:bg-rose-900/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
      hover: 'hover:border-rose-200 dark:hover:border-rose-900'
    },
    blue: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      hover: 'hover:border-blue-200 dark:hover:border-blue-900'
    },
    amber: {
      iconBg: 'bg-amber-100 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      hover: 'hover:border-amber-200 dark:hover:border-amber-900'
    },
    purple: {
      iconBg: 'bg-purple-100 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      hover: 'hover:border-purple-200 dark:hover:border-purple-900'
    }
  }

  // Updated Quick Start Steps - conditionally show upgrade step
  const quickStartSteps = [
    {
      image: '/features/step-1.webp',
      title: 'Browse Characters',
      description: 'Explore our diverse collection of AI personalities',
      href: '/dashboard/characters',
      action: 'Start Browsing',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      image: '/features/step-2.webp',
      title: 'Start Chatting',
      description: 'Engage in conversations with realistic voice responses',
      href: '/dashboard/characters',
      action: 'Start Chat',
      color: 'from-purple-500 to-pink-500'
    },
    // Only show upgrade step for non-Pro users
    ...(!isPro ? [{
      image: '/features/step-3.webp',
      title: 'Upgrade to Pro',
      description: 'Unlock unlimited access and premium features',
      href: '/dashboard/pricing',
      action: 'Go Premium',
      color: 'from-amber-500 to-orange-500'
    }] : [{
      image: '/features/step-3.webp',
      title: 'Explore Premium',
      description: 'Access all premium characters and unlimited conversations',
      href: '/dashboard/characters',
      action: 'Explore Now',
      color: 'from-purple-500 to-pink-500'
    }])
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-rose-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-purple-600 to-blue-600 p-1 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="relative bg-white dark:bg-black rounded-3xl p-8 md:p-12">
          {/* Decorative Blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl translate-y-32 -translate-x-32" />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                Welcome {user?.name || 'there'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Ready to have amazing conversations with AI characters?
              </p>
            </div>

            {/* Pro Badge */}
            {isPro && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30">
                <Crown size={20} className="text-purple-600 dark:text-purple-400" fill="currentColor" />
                <span className="font-bold text-purple-600 dark:text-purple-400">Pro Member</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '100ms' }}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const colors = colorClasses[stat.color]

          const cardContent = (
            <Card
              className={`relative p-6 border-2 transition-all duration-300 ${stat.highlight
                ? 'border-rose-200 dark:border-rose-900 bg-gradient-to-br from-rose-50 to-white dark:from-rose-900/20 dark:to-black'
                : stat.isPro
                  ? 'border-purple-200 dark:border-purple-900 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-black'
                  : `border-gray-200 dark:border-gray-800 ${colors.hover} bg-white dark:bg-black`
                } ${stat.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-2 cursor-pointer'}`}
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center transition-transform ${!stat.disabled && 'group-hover:scale-110 group-hover:rotate-6'}`}>
                  <Icon size={22} className={colors.iconColor} />
                </div>

                <div>
                  <p className={`text-4xl font-bold tracking-tight ${stat.isPro ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600' : 'text-gray-900 dark:text-white'}`}>
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                    {stat.title}
                  </p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </div>

                {!stat.disabled && (
                  <div className="flex items-center justify-end pt-2">
                    <ArrowUpRight size={16} className="text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                )}
              </div>

              {stat.highlight && (
                <div className="absolute top-3 right-3">
                  <Sparkles size={16} className="text-rose-600 dark:text-rose-400 animate-pulse" />
                </div>
              )}

              {stat.isPro && (
                <div className="absolute top-3 right-3">
                  <Crown size={16} className="text-purple-600 dark:text-purple-400 animate-pulse" fill="currentColor" />
                </div>
              )}

              {stat.disabled && (
                <div className="absolute top-3 right-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
                    Soon
                  </span>
                </div>
              )}
            </Card>
          )

          return stat.disabled ? (
            <div key={index}>{cardContent}</div>
          ) : (
            <Link key={index} href={stat.href} className="group">
              {cardContent}
            </Link>
          )
        })}
      </div>

      {/* Quick Start Guide - Only show if no conversations */}
      {stats.totalConversations === 0 && (
        <Card className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-black animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
          {/* Header Design */}
          <div className="relative p-8 pb-6 border-b-2 border-gray-100 dark:border-gray-800">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mb-4 shadow-xl">
                <Rocket size={32} className="text-white" />
              </div>

              <h3 className="text-4xl font-bold mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  Quick Start Guide
                </span>
              </h3>

              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Get started with AniVoice AI in {isPro ? '2' : '3'} simple steps
              </p>

              <div className="mt-6 flex items-center justify-between gap-2">
                <div className="h-1 w-full rounded-full bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                <div className="h-1 w-full rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                {!isPro && <div className="h-1 w-full rounded-full bg-gradient-to-r from-transparent via-pink-500 to-transparent" />}
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="p-8">
            <div className={`grid grid-cols-1 ${isPro ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-8`}>
              {quickStartSteps.map((step, index) => (
                <Link key={index} href={step.href} className="group">
                  <div className="relative h-full">
                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 flex items-center justify-center z-10 shadow-xl">
                      <span className="text-xl font-bold text-white dark:text-gray-900">{index + 1}</span>
                    </div>

                    <Card className="relative border-2 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all overflow-hidden group-hover:shadow-2xl group-hover:-translate-y-2 duration-300 h-full">
                      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
                        <Image
                          src={step.image}
                          alt={step.title}
                          fill
                          loading='eager'
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                      </div>

                      <div className="p-6">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-rose-600 group-hover:to-purple-600 transition-all">
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                          {step.description}
                        </p>

                        <Button className={`w-full bg-gradient-to-r ${step.color} hover:shadow-lg hover:shadow-purple-500/50 text-white font-semibold transition-all duration-300 group-hover:scale-105`}>
                          {step.action}
                          <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>

                      <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
                        <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${step.color} opacity-20 blur-xl`} />
                      </div>
                    </Card>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-full shadow-sm">
                <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {isPro ? 'Pro Member - All Features Unlocked' : 'No credit card required • Free to start'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recommended Characters */}
      {recommendedCharacters.length > 0 ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Star size={24} className="text-amber-500 fill-amber-500" />
                Recommended Characters
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Popular AI personalities ready to chat with you
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="group">
              <Link href="/dashboard/characters" className="gap-2">
                View All
                <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedCharacters.map((character) => (
              <Link
                key={character._id}
                href={`/dashboard/characters/${character._id}`}
                className="group"
              >
                <Card className="relative border-2 border-gray-200 dark:border-gray-800 hover:border-rose-300 dark:hover:border-rose-800 transition-all bg-white dark:bg-black hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden duration-300">
                  <div className="relative h-96 bg-white dark:bg-gray-900">
                    {character.avatar ? (
                      <Image
                        src={character.avatar}
                        alt={character.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="relative object-cover scale-110 group-hover:scale-120 transition-transform duration-500"
                        priority={false}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-400 to-rose-600">
                        <span className="text-8xl font-bold text-white">
                          {character.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    {/* Premium Badge - Only show if user is not Pro */}
                    {character.isPremium && !isPro && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                          <Crown size={14} fill="white" />
                          PRO
                        </div>

                      </div>
                    )}

                    {/* Pro Access Badge - Show for Pro users on premium characters */}
                    {character.isPremium && isPro && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold shadow-lg">
                        <Crown size={14} fill="white" />
                        Unlocked
                      </div>
                    )}


                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                      <h4 className="text-2xl font-bold text-white mb-1 truncate">
                        {character.name}
                      </h4>
                      <p className="text-sm text-gray-200 line-clamp-2 leading-relaxed">
                        {character.description || 'An AI character ready to chat with you'}
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <Card className="relative p-16 border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden" style={{ animationDelay: '300ms' }}>
          <div className="absolute inset-0 opacity-5">
            <Image
              src="/illustrations/empty-chat.webp"
              alt=""
              fill
              sizes='100vh'
              className="object-contain"
            />
          </div>

          <div className="relative max-w-md mx-auto">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <Image
                src="/illustrations/empty-chat.webp"
                alt="No characters"
                fill
                className="object-contain opacity-60"
              />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No Characters Available
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              The admin hasn't created any characters yet. Check back soon to discover amazing AI personalities!
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
              <span className="text-3xl">🎭</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Coming Soon</span>
            </div>
          </div>
        </Card>
      )}

      {/* Upgrade Banner - Only show for non-Pro users */}
      {!isPro && (
        <Card className="relative overflow-hidden border-2 border-transparent bg-gradient-to-r from-rose-500 via-purple-600 to-blue-600 p-1 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '400ms' }}>
          <div className="relative bg-gradient-to-r from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700 rounded-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 opacity-10">
              <Image
                src="/features/featured-icon-premium.webp"
                alt=""
                fill
                sizes="100"
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-32 -translate-x-32" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />

            <div className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left flex-1">
                  <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Crown size={28} className="text-white" fill="white" />
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold text-white">
                      Unlock Premium Features
                    </h3>
                  </div>
                  <p className="text-rose-100 mb-6 text-lg">
                    Get unlimited chats, premium voices, and exclusive characters
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
                    {[
                      { icon: '/features/feature-icon-chat.webp', text: 'Unlimited conversations' },
                      { icon: '/features/featured-icon-voice.webp', text: 'Premium voice options' },
                      { icon: '/features/featured-icon-characters.webp', text: 'Exclusive characters' }
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="relative w-5 h-5 md:w-8 md:h-8 flex-shrink-0">
                          <Image
                            src={feature.icon}
                            alt=""
                            fill
                            sizes='5'
                            className="object-contain"
                          />
                        </div>
                        <span className="text-sm font-medium text-white">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button asChild size="lg" className="bg-white hover:bg-gray-100 text-rose-700 font-bold shadow-2xl flex-shrink-0 group px-8 py-6 text-lg">
                  <Link href="/dashboard/pricing" className="flex items-center gap-3">
                    <Zap size={24} fill="currentColor" />
                    Upgrade Now
                    <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
