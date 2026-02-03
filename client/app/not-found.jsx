'use client';

import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Animated Background Gradient Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-rose-500/30 dark:bg-rose-500/20 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-500/30 dark:bg-purple-500/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                           linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>
      
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Icon Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="mb-8"
        >
          <div className="relative w-full max-w-xs mx-auto mb-8">
            <div className="relative mx-auto w-48 h-48 flex items-center justify-center">
              {/* Glowing Circle Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-purple-500/20 to-blue-500/20 dark:from-rose-500/30 dark:via-purple-500/30 dark:to-blue-500/30 rounded-full blur-2xl animate-pulse"></div>
              
              {/* Search Icon with Effect */}
              <div className="relative z-10 p-8 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-2xl">
                <Search className="w-24 h-24 text-gray-400 dark:text-gray-600" strokeWidth={1.5} />
              </div>
              
              {/* Floating Sparkles */}
              <motion.div
                animate={{ 
                  y: [-10, 10, -10],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-6 -right-6"
              >
                <Sparkles className="w-8 h-8 text-rose-500" />
              </motion.div>
              
              <motion.div
                animate={{ 
                  y: [10, -10, 10],
                  rotate: [360, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -bottom-6 -left-6"
              >
                <Sparkles className="w-6 h-6 text-purple-500" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* 404 Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-8xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            404
          </h1>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Page Not Found
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-md mx-auto leading-relaxed">
            Oops! The page you're looking for seems to have wandered off into the digital void.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-105 transition-all duration-300"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="p-8 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl"
        >
          <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 mb-6">
            <Search className="w-5 h-5" />
            <span className="font-semibold">Looking for something specific?</span>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { href: '/dashboard/dashboard', label: 'Dashboard' },
              { href: '/dashboard/characters', label: 'Characters' },
              { href: '/dashboard/pricing', label: 'Pricing' },
              { href: '/dashboard/subscription', label: 'Subscription' }
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-200 text-sm font-medium shadow-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Optional: Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 text-sm text-gray-500 dark:text-gray-500"
        >
          Need help? Contact our{' '}
          <Link href="/" className="text-rose-500 hover:text-rose-600 font-medium underline-offset-4 hover:underline">
            support team
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
