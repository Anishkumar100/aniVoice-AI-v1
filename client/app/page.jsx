'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useTheme } from '@/lib/hooks/useTheme'
import { useSelector } from 'react-redux'
import Link from 'next/link'
import Image from 'next/image'
import {
  MessageSquare, Volume2, Crown, Zap, Shield, Sparkles, Users, Check,
  ArrowRight, Play, Star, Globe, Sun, Moon, Menu, X, Mic2, Bot,
  Headphones, ChevronRight, Award, Lock, LayoutDashboard, Rocket, Heart
} from 'lucide-react'

// Floating animation component
const FloatingElement = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [0, -20, 0] }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
  >
    {children}
  </motion.div>
)

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState([])
  const { theme, toggleTheme } = useTheme()
  const { scrollYProgress } = useScroll()
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true })

  const { isAuthenticated } = useSelector((state) => state.auth)

  // Fix hydration issue - generate particles only on client
  useEffect(() => {
    setMounted(true)
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
      }))
    )
  }, [])

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  }

  const glassStyle = "backdrop-blur-xl bg-white/70 dark:bg-gray-950/70 border border-white/20 dark:border-gray-800/50 shadow-xl"

  const handleNavClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-rose-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-red-950/20 overflow-x-hidden">
      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-red-500/10 via-rose-500/5 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-red-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* ENHANCED NAVIGATION */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-[100] ${glassStyle}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className="relative w-9 h-9"
              >
                <Image src="/logo-icon.webp" alt="AniVoice AI" fill className="object-contain drop-shadow-lg" />
                {mounted && (
                  <motion.div
                    className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                <span className="text-red-600 dark:text-red-500">AniVoice</span> AI
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {['Features', 'How It Works', 'Pricing', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-200 relative group"
                >
                  {item}
                  <span className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-red-600 to-rose-600 scale-x-0 group-hover:scale-x-100 transition-transform" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors relative group"
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun size={20} className="text-rose-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon size={20} className="text-gray-700" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <div className="hidden sm:flex items-center gap-2">
                {isAuthenticated ? (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button asChild size="sm" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg shadow-red-600/30 border-0">
                      <Link href="/dashboard">
                        <LayoutDashboard size={16} className="mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <Button asChild variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 hover:bg-white/50 dark:hover:bg-gray-800/50">
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button asChild size="sm" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg shadow-red-600/30 border-0 relative overflow-hidden">
                        <Link href="/register">
                          {mounted && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                          )}
                          <span className="relative">Get Started</span>
                          <ArrowRight size={14} className="ml-1.5 relative" />
                        </Link>
                      </Button>
                    </motion.div>
                  </>
                )}
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ?
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <X size={24} className="text-gray-900 dark:text-white" />
                    </motion.div>
                    :
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <Menu size={24} className="text-gray-900 dark:text-white" />
                    </motion.div>
                  }
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        
      </motion.nav>

      {/* FULL-SCREEN MOBILE MENU - FIXED */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop overlay - below navbar but above content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleNavClick}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-[90]"
                style={{ top: '96px' }}
              />

              {/* Mobile Menu Panel - same level as navbar */}
              <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-24 right-4 bottom-4 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-white/20 dark:border-gray-800/50 shadow-2xl md:hidden overflow-y-auto backdrop-blur-2xl bg-white dark:bg-gray-950 z-[95]"
              >
                <div className="p-6 space-y-6">
                  <div className="space-y-1">
                    {['Features', 'How It Works', 'Pricing', 'FAQ'].map((item, i) => (
                      <motion.a
                        key={item}
                        href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={handleNavClick}
                        className="block px-4 py-3 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-500 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all relative group"
                      >
                        <span className="relative z-10">{item}</span>
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.a>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                    {isAuthenticated ? (
                      <Button asChild className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg" size="lg">
                        <Link href="/dashboard" onClick={handleNavClick}>
                          <LayoutDashboard size={18} className="mr-2" />
                          Go to Dashboard
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button asChild variant="outline" className="w-full border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-white/80 dark:hover:bg-gray-800/50" size="lg">
                          <Link href="/login" onClick={handleNavClick}>Sign In</Link>
                        </Button>
                        <Button asChild className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg" size="lg">
                          <Link href="/register" onClick={handleNavClick}>
                            Get Started Free
                            <ArrowRight size={16} className="ml-2" />
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-xl p-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-medium">10,000+ users</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      {/* HERO SECTION */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-24">
        {/* Animated Particles - Client-side only */}
        {mounted && particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-red-500/30 dark:bg-red-400/30 rounded-full pointer-events-none"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}

        <motion.div
          style={{ opacity, scale }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isHeroInView ? "visible" : "hidden"}
            className="text-center space-y-8"
          >
            <motion.div variants={itemVariants}>
              <div className="relative inline-block">
                <Badge className={`px-5 py-2.5 text-base font-medium ${glassStyle} text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 relative overflow-hidden`}>
                  {mounted && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  <Sparkles size={16} className="inline mr-2 relative z-10" />
                  <span className="relative z-10">AI-Powered Voice Conversations</span>
                </Badge>
                {mounted && (
                  <motion.div
                    className="absolute -inset-4 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-2xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}
              </div>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.1] tracking-tight">
              <span className="block text-gray-900 dark:text-white mb-2">Chat with AI</span>
              <span className="block bg-gradient-to-r from-red-600 via-red-500 to-rose-500 dark:from-red-500 dark:via-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                That Speaks Back
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
            >
              Experience conversations with AI characters that don't just type—they <span className="font-bold text-red-600 dark:text-red-500">actually talk</span>.
              Choose from 50+ personalities and hear them speak in realistic voices.
            </motion.p>

            <motion.div variants={itemVariants} className="flex justify-center gap-3 flex-wrap max-w-4xl mx-auto">
              {[
                { icon: MessageSquare, text: 'Natural Chats' },
                { icon: Volume2, text: 'Real Voices' },
                { icon: Zap, text: 'Instant Replies' }
              ].map((feature, i) => {
                const Icon = feature.icon
                return (
                  <FloatingElement key={i} delay={i * 0.2}>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className={`flex items-center gap-2.5 px-5 py-3 rounded-full ${glassStyle} shadow-lg hover:shadow-xl transition-all group cursor-pointer`}
                    >
                      <div className="p-2 rounded-full bg-gradient-to-br from-red-500 to-rose-500 group-hover:from-red-600 group-hover:to-rose-600 transition-all">
                        <Icon size={18} className="text-white" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{feature.text}</span>
                    </motion.div>
                  </FloatingElement>
                )
              })}
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative">
                <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-2xl shadow-red-600/40 border-0 relative overflow-hidden">
                  <Link href="/register">
                    {mounted && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    <Mic2 size={20} className="mr-2 relative z-10" />
                    <span className="relative z-10">Start Chatting Free</span>
                    <ChevronRight size={20} className="ml-1 relative z-10" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button asChild size="lg" variant="outline" className={`w-full sm:w-auto font-bold text-lg px-8 py-6 rounded-xl ${glassStyle} border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white`}>
                  <Link href="#how-it-works">
                    <Play size={20} className="mr-2" />
                    Watch Demo
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: 20 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                    whileHover={{ scale: 1.15, zIndex: 10 }}
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-red-400 to-rose-400 border-3 border-white dark:border-gray-950 shadow-lg"
                  />
                ))}
              </div>
              <div className={`text-sm font-medium px-4 py-2 rounded-full ${glassStyle}`}>
                Join <span className="text-red-600 dark:text-red-500 font-bold">10,000+</span> users •
                <span className="inline-flex items-center gap-1 ml-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400 inline" />
                  <span className="font-bold text-gray-900 dark:text-white">4.9/5</span>
                </span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
        >
          <span className="text-xs font-medium text-gray-500 dark:text-gray-500">Scroll to explore</span>
          <div className={`w-6 h-9 rounded-full border-2 flex items-start justify-center p-1.5 ${glassStyle}`}>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 rounded-full bg-gradient-to-b from-red-600 to-rose-600"
            />
          </div>
        </motion.div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-red-50/30 to-white/50 dark:from-gray-950/50 dark:via-red-950/10 dark:to-gray-950/50" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '10K+', label: 'Active Users', icon: Users, color: 'from-red-500 to-rose-500' },
              { value: '1M+', label: 'Conversations', icon: MessageSquare, color: 'from-rose-500 to-red-500' },
              { value: '50+', label: 'AI Characters', icon: Bot, color: 'from-red-500 to-pink-500' },
              { value: '30+', label: 'Voice Options', icon: Volume2, color: 'from-pink-500 to-red-500' }
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="text-center group"
                >
                  <div className={`${glassStyle} p-6 rounded-2xl`}>
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-4 shadow-lg`}
                    >
                      <Icon size={26} />
                    </motion.div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-4 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className={`mb-4 ${glassStyle} text-red-700 dark:text-red-400`}>
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need for
              <br />
              <span className="bg-gradient-to-r from-red-600 via-red-500 to-rose-500 dark:from-red-500 dark:via-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                immersive conversations
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powered by cutting-edge AI and realistic voice synthesis
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MessageSquare, title: 'Natural Conversations', desc: 'Advanced AI powers human-like dialogue', badge: 'Popular', color: 'from-red-500 to-rose-500' },
              { icon: Volume2, title: 'Voice Synthesis', desc: 'Realistic text-to-speech with 30+ voices', badge: null, color: 'from-rose-500 to-red-500' },
              { icon: Users, title: '50+ Characters', desc: 'Diverse personalities across all genres', badge: 'New', color: 'from-red-500 to-pink-500' },
              { icon: Crown, title: 'Premium Content', desc: 'Exclusive characters and unlimited chats', badge: null, color: 'from-pink-500 to-red-500' },
              { icon: Shield, title: 'Privacy First', desc: 'Your conversations stay completely private', badge: null, color: 'from-red-500 to-rose-500' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Instant responses with Gemini AI', badge: null, color: 'from-rose-500 to-red-500' }
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="relative group"
                >
                  <div className={`h-full ${glassStyle} p-6 rounded-2xl hover:shadow-2xl transition-all relative overflow-hidden`}>
                    {mounted && (
                      <motion.div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    {feature.badge && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white border-0 text-xs shadow-lg">
                          {feature.badge}
                        </Badge>
                      </div>
                    )}
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg relative z-10`}
                    >
                      <Icon size={24} className="text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 relative z-10">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 px-4 relative scroll-mt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-red-50/30 to-white/50 dark:from-gray-950/50 dark:via-red-950/10 dark:to-gray-950/50" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className={`mb-4 ${glassStyle} text-red-700 dark:text-red-400`}>
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Start chatting in <span className="text-red-600 dark:text-red-500">3 steps</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-8 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-500 rounded-full opacity-30" />

            {[
              { step: '01', title: 'Browse Characters', desc: 'Explore 50+ AI personalities', image: '/features/step-1.webp' },
              { step: '02', title: 'Start Chatting', desc: 'Get instant AI responses', image: '/features/step-2.webp' },
              { step: '03', title: 'Hear Them Speak', desc: 'Realistic voice with every reply', image: '/features/step-3.webp' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, type: 'spring' }}
                className="text-center space-y-6 group relative"
              >
                <FloatingElement delay={i * 0.3}>
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 text-white text-2xl font-bold shadow-2xl relative z-10"
                  >
                    {item.step}
                    {mounted && (
                      <motion.div
                        className="absolute inset-0 bg-white/30 rounded-xl"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </FloatingElement>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`relative aspect-square rounded-2xl overflow-hidden shadow-2xl ${glassStyle} p-2`}
                >
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-16 space-y-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button asChild size="lg" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-lg px-10 py-7 rounded-xl shadow-2xl shadow-red-600/40 border-0 relative overflow-hidden">
                <Link href="/register">
                  {mounted && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  <span className="relative z-10">Get Started Free</span>
                  <Rocket size={20} className="ml-2 relative z-10" />
                </Link>
              </Button>
            </motion.div>
            <p className={`text-sm font-medium flex items-center justify-center gap-2 ${glassStyle} px-4 py-2 rounded-full inline-flex`}>
              <Lock size={14} /> No credit card required • Free forever
            </p>
          </motion.div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 px-4 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className={`mb-4 ${glassStyle} text-red-700 dark:text-red-400`}>
              Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start free, upgrade when you're ready
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className={`h-full ${glassStyle} p-8 rounded-3xl hover:shadow-2xl transition-all relative overflow-hidden`}>
                {mounted && (
                  <motion.div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-600/5 opacity-0 hover:opacity-100 transition-opacity" />
                )}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Perfect for trying AniVoice AI</p>
                  <div className="mb-8">
                    <span className="text-6xl font-bold text-gray-900 dark:text-white">₹0</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">/ forever</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {['50 messages/month', 'Free characters', 'Voice generation', 'Basic support'].map((f, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check size={14} className="text-green-600 dark:text-green-500" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{f}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className={`w-full ${glassStyle} border-gray-300 dark:border-gray-700 font-semibold`} size="lg">
                    <Link href="/register">Get Started Free</Link>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.03 }}
            >
              <div className={`h-full ${glassStyle} p-8 rounded-3xl relative overflow-hidden border-2 border-red-500/50 dark:border-red-600/50 shadow-2xl`}>
                {mounted && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-rose-500/10 to-red-500/10"
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                  />
                )}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-2 text-sm font-bold border-0 shadow-xl">
                    <Award size={14} className="inline mr-1" /> MOST POPULAR
                  </Badge>
                </div>
                <div className="relative z-10 pt-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Unlimited access for power users</p>
                  <div className="mb-8">
                    <span className="text-6xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">₹99</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">/ month</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {['Unlimited messages', 'All premium characters', 'Priority voice', 'No ads', 'Early access', 'Priority support'].map((f, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check size={14} className="text-green-600 dark:text-green-500" />
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium">{f}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <Button asChild className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold shadow-xl border-0 relative overflow-hidden" size="lg">
                    <Link href="/login">
                      {mounted && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                      <span className="relative z-10">Upgrade to Pro</span>
                      <Crown size={18} className="ml-2 relative z-10" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-4 relative scroll-mt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-red-50/30 to-white/50 dark:from-gray-950/50 dark:via-red-950/10 dark:to-gray-950/50" />
        <div className="max-w-3xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className={`mb-4 ${glassStyle} text-red-700 dark:text-red-400`}>
              FAQ
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently asked questions
            </h2>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: 'How does AniVoice AI work?', a: 'AniVoice AI uses Google Gemini for natural conversations and Kokoro TTS for realistic voice synthesis.' },
              { q: 'Is my data private?', a: 'Yes! Your conversations are encrypted and never shared. You can delete them anytime.' },
              { q: 'What characters are available?', a: 'We have 50+ characters from anime, games, and more. Free users get access to a curated selection.' },
              { q: 'Can I cancel anytime?', a: 'Absolutely! Cancel your Pro subscription anytime. Access continues until the period ends.' },
              { q: 'What makes it different?', a: 'Every AI response comes with realistic voice - no other platform offers this experience!' },
              { q: 'Need a credit card for free?', a: 'No! Start completely free without any payment info. Upgrade only when you\'re ready.' }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <AccordionItem value={`item-${i}`} className={`${glassStyle} rounded-2xl px-6 hover:shadow-lg transition-all`}>
                  <AccordionTrigger className="text-left font-bold hover:no-underline py-5 hover:text-red-600 dark:hover:text-red-500 text-gray-900 dark:text-white transition-colors">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-400 pb-5 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 rounded-3xl blur-xl opacity-30 animate-pulse" />
            <div className="relative border-0 bg-gradient-to-br from-red-600 via-red-500 to-rose-500 dark:from-red-700 dark:via-red-600 dark:to-rose-600 text-white overflow-hidden rounded-3xl shadow-2xl">
              {mounted && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              )}
              <div className="relative p-16 text-center space-y-8">
                <FloatingElement>
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 shadow-xl"
                  >
                    <Headphones size={40} />
                  </motion.div>
                </FloatingElement>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
                  Ready to experience the future?
                </h2>

                <p className="text-xl text-white/95 max-w-2xl mx-auto font-medium">
                  Join 10,000+ users chatting with AI that speaks back
                </p>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild size="lg" className="bg-white text-red-600 hover:bg-gray-50 font-bold text-lg px-10 py-7 rounded-xl shadow-2xl border-0 relative overflow-hidden">
                    <Link href="/register">
                      {mounted && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      <span className="relative z-10">Start Free Now</span>
                      <ArrowRight size={20} className="ml-2 relative z-10" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`py-16 px-4 mt-12 ${glassStyle}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo-icon.webp" alt="AniVoice AI" width={36} height={36} />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Ani<span className="text-red-600 dark:text-red-500">Voice</span> AI
                </span>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                AI conversations with realistic voice synthesis
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard/characters" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">Characters</Link></li>
                <li><a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">Pricing</a></li>
                <li><a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">Contact</Link></li>
                <li><Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Connect</h3>
              <div className="flex gap-2">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-white hover:from-red-600 hover:to-rose-600 transition-all shadow-lg"
                >
                  <Globe size={18} />
                </motion.a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200/50 dark:border-gray-800/50 pt-8">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              © 2026 AniVoice AI. Crafted with <Heart size={14} className="inline text-red-500 fill-red-500 mx-1" /> in India
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
