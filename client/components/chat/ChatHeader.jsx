'use client'

import { ArrowLeft, Volume2, VolumeX, MoreVertical, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function ChatHeader({ character, playingAudio, stopAudio, autoPlayVoice, toggleAutoPlay }) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Back + Character Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>

            {/* Character Avatar */}
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-800 flex-shrink-0 shadow-md">
              <Image
                src={character.avatar}
                alt={character.name}
                fill
                sizes="44px"
                className="object-cover"
                priority
              />
              {/* Online Status */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full" />
            </div>

            {/* Character Info */}
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                {character.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span>Online</span>
                </div>
                {character.category && (
                  <>
                    <span>•</span>
                    <span className="truncate">{character.category}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            {/* Voice Toggle */}
            <button
              onClick={toggleAutoPlay}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                autoPlayVoice
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/30'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
              title={autoPlayVoice ? 'Voice enabled' : 'Voice disabled'}
            >
              {autoPlayVoice ? (
                <>
                  <Volume2 size={14} />
                  <span className="hidden sm:inline">Voice On</span>
                </>
              ) : (
                <>
                  <VolumeX size={14} />
                  <span className="hidden sm:inline">Voice Off</span>
                </>
              )}
            </button>

            {/* Premium Badge (if character is premium) */}
            {character.isPremium && (
              <div className="flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg shadow-sm text-xs font-medium">
                <Sparkles size={12} />
                <span className="hidden sm:inline">Pro</span>
              </div>
            )}

            {/* More Options */}
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
              aria-label="More options"
            >
              <MoreVertical size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
