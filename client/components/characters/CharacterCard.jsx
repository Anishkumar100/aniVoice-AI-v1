'use client'

import { Crown, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function CharacterCard({ character, isPro = false }) {
  const router = useRouter()

  const handleClick = (e) => {
    // If character is premium and user is not pro, prevent navigation
    if (character.isPremium && !isPro) {
      e.preventDefault()
      
      toast.error('This is a Premium Character!', {
        icon: '👑',
        duration: 3000,
      })
      
      // Add a small delay before redirect for better UX
      setTimeout(() => {
        router.push('/dashboard/pricing')
      }, 500)
    }
  }

  return (
    <Link 
      href={`/dashboard/characters/${character._id}`}
      onClick={handleClick}
      className="group relative block"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
        {/* Character Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={character.avatar}
            alt={character.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Premium Badge - Only show for non-Pro users */}
          {character.isPremium && !isPro && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-lg">
              <Crown size={14} fill="white" />
              Premium
            </div>
          )}

          {/* Pro Access Badge - Show for Pro users on premium characters */}
          {character.isPremium && isPro && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold shadow-lg">
              <Crown size={14} fill="white" />
              Unlocked
            </div>
          )}

          {/* Character Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white mb-1">
              {character.name}
            </h3>
            <p className="text-sm text-gray-200 line-clamp-2 mb-3">
              {character.description}
            </p>
            
            {/* Category Badge */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                {character.category}
              </span>
              <span className="flex items-center gap-1 text-white/80 text-xs">
                <MessageCircle size={12} />
                Chat now
              </span>
            </div>
          </div>
        </div>

        {/* Premium Lock Overlay (for non-pro users) */}
        {character.isPremium && !isPro && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-center">
              <Crown className="w-12 h-12 text-amber-400 mx-auto mb-2" fill="currentColor" />
              <p className="text-white font-semibold mb-1">Premium Character</p>
              <p className="text-white/80 text-sm">Upgrade to unlock</p>
            </div>
          </div>
        )}

        {/* Success Indicator for Pro Users on Premium Characters */}
        {character.isPremium && isPro && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}

        {/* Bottom Gradient Border (animated on hover) */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
    </Link>
  )
}
