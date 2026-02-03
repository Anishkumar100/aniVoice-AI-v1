'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Loader2, Sparkles, Crown, CheckCircle2 } from 'lucide-react'
import CharacterCard from '@/components/characters/CharacterCard'
import { Button } from '@/components/ui/button'
import { characterAPI } from '@/lib/api/characters'
import { paymentAPI } from '@/lib/api/payment'
import { onSubscriptionUpdate } from '@/lib/utils/subscriptionEvents'
import Image from 'next/image'

const categories = ['All', 'Anime', 'Game', 'Movie', 'Celebrity', 'Original']

export default function CharactersPage() {
  const [characters, setCharacters] = useState([])
  const [filteredCharacters, setFilteredCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [subscription, setSubscription] = useState(null)

  // Fetch subscription and characters on mount
  useEffect(() => {
    fetchData()
    
    // Listen for subscription updates
    const unsubscribe = onSubscriptionUpdate(() => {
      console.log('🔄 Subscription updated, refreshing characters...')
      fetchData()
    })
    
    return unsubscribe
  }, [])

  // Filter characters when search or category changes
  useEffect(() => {
    filterCharacters()
  }, [searchQuery, selectedCategory, characters])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [charactersData, subData] = await Promise.all([
        characterAPI.getAllCharacters(),
        paymentAPI.getSubscription().catch(() => null)
      ])
      
      setCharacters(charactersData)
      setFilteredCharacters(charactersData)
      setSubscription(subData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCharacters = () => {
    let filtered = characters

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(char => 
        char.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(char =>
        char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredCharacters(filtered)
  }

  const isPro = subscription?.hasPremiumAccess || false
  const premiumCount = characters.filter(c => c.isPremium).length
  const freeCount = characters.length - premiumCount

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with Pro Badge */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Discover Characters
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse our collection of AI-powered voice characters
            </p>
          </div>
          
          {/* Pro Status Badge */}
          {isPro && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30">
              <Crown size={18} className="text-purple-600 dark:text-purple-400" fill="currentColor" />
              <div>
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Pro Access</p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">All Unlocked</p>
              </div>
            </div>
          )}
        </div>

        {/* Pro Banner - Mobile */}
        {isPro && (
          <div className="md:hidden p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Crown size={20} className="text-white" fill="white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Pro Member</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Access to all {characters.length} characters</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search characters by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const isActive = selectedCategory === category
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all
                  ${isActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                    : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                {category === 'All' && <Filter size={16} />}
                {category}
              </button>
            )
          })}
        </div>

        {/* Results Count with Stats */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? (
              'Loading characters...'
            ) : (
              <>
                Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredCharacters.length}</span> character{filteredCharacters.length !== 1 ? 's' : ''}
                {selectedCategory !== 'All' && (
                  <> in <span className="font-semibold text-gray-900 dark:text-white">{selectedCategory}</span></>
                )}
              </>
            )}
          </p>
          
          {!loading && characters.length > 0 && (
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-900">
                <span className="font-semibold text-gray-900 dark:text-white">{freeCount}</span>
                <span className="text-gray-600 dark:text-gray-400">Free</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <Crown size={12} className="text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-gray-900 dark:text-white">{premiumCount}</span>
                <span className="text-gray-600 dark:text-gray-400">Premium</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-rose-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading characters...</p>
        </div>
      )}

      {/* Empty State - No Results */}
      {!loading && filteredCharacters.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-64 h-64 mb-6 opacity-50">
            <Image
              src="/illustrations/empty-chat.webp"
              alt="No results"
              fill
              sizes="256px"
              className="object-contain"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No characters found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
            We couldn't find any characters matching "{searchQuery}". Try adjusting your search.
          </p>
          <Button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
            }}
            variant="outline"
          >
            Clear Search
          </Button>
        </div>
      )}

      {/* Empty State - No Characters Exist */}
      {!loading && characters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-64 h-64 mb-6 opacity-50">
            <Image
              src="/illustrations/empty-chat.webp"
              alt="No characters"
              fill
              sizes="256px"
              className="object-contain"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No characters yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
            Characters haven't been added yet. Check back soon!
          </p>
        </div>
      )}

      {/* Characters Grid */}
      {!loading && filteredCharacters.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCharacters.map((character) => (
            <CharacterCard 
              key={character._id} 
              character={character}
              isPro={isPro}
            />
          ))}
        </div>
      )}

      {/* Bottom Banner - Conditional */}
      {!loading && filteredCharacters.length > 0 && (
        <div className="mt-12">
          {isPro ? (
            // Pro User Success Banner
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500 via-pink-600 to-purple-600 p-[2px]">
              <div className="relative bg-white dark:bg-black rounded-3xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  You're a Pro Member! 🎉
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Enjoy unlimited access to all {characters.length} characters with premium voice responses
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                    <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Unlimited Chats</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                    <Crown size={16} className="text-purple-600 dark:text-purple-400" fill="currentColor" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">All Premium Characters</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
                    <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Priority Support</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Free User Upgrade Banner
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-purple-600 to-blue-600 p-[2px]">
              <div className="relative bg-white dark:bg-black rounded-3xl p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-rose-600 dark:text-rose-400" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Want unlimited access?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Upgrade to Pro and chat with all {premiumCount} premium characters with unlimited voice messages
                </p>
                <Button asChild size="lg" className="bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700">
                  <a href="/dashboard/pricing">
                    <Crown size={20} className="mr-2" />
                    Upgrade to Pro
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
