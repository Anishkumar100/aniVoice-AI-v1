'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { characterAPI } from '@/lib/api/characters'
import { voiceAPI } from '@/lib/api/voice'
import toast from 'react-hot-toast'
import { 
  Upload, 
  Loader2, 
  ArrowLeft, 
  Search, 
  X,
  Mic,
  CheckCircle2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const categories = ['Anime', 'Game', 'Movie', 'Celebrity', 'Original']

export default function CreateCharacterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingVoices, setLoadingVoices] = useState(true)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [voices, setVoices] = useState([])
  const [voiceSearch, setVoiceSearch] = useState('')
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    category: 'Original',
    voiceId: '',
    isPremium: false,
    avatar: null
  })

  // Fetch voices on mount
  useEffect(() => {
    fetchVoices()
  }, [])

  const fetchVoices = async () => {
    try {
      setLoadingVoices(true)
      const data = await voiceAPI.getVoiceOptions()
      
      // Transform data to ensure consistent structure
      const formattedVoices = data.map(voice => ({
        id: voice.id || voice,
        name: voice.name || voice.id || voice,
        gender: voice.gender || (voice.id?.startsWith('af_') ? 'Female' : 'Male'),
        language: voice.language || 'en'
      }))
      
      setVoices(formattedVoices)
      
      // Set first voice as default
      if (formattedVoices.length > 0 && !formData.voiceId) {
        setFormData(prev => ({ ...prev, voiceId: formattedVoices[0].id }))
      }
    } catch (error) {
      console.error('Error fetching voices:', error)
      toast.error('Failed to load voices')
      // Fallback voices if API fails
      setVoices([
        { id: 'af_bella', name: 'Bella', gender: 'Female', language: 'en' },
        { id: 'af_sarah', name: 'Sarah', gender: 'Female', language: 'en' },
        { id: 'am_adam', name: 'Adam', gender: 'Male', language: 'en' },
        { id: 'am_michael', name: 'Michael', gender: 'Male', language: 'en' }
      ])
      setFormData(prev => ({ ...prev, voiceId: 'af_bella' }))
    } finally {
      setLoadingVoices(false)
    }
  }

  // Filter voices based on search
  const filteredVoices = useMemo(() => {
    if (!voiceSearch.trim()) return voices
    const query = voiceSearch.toLowerCase()
    return voices.filter(voice => 
      voice.id.toLowerCase().includes(query) ||
      voice.name?.toLowerCase().includes(query) ||
      voice.gender?.toLowerCase().includes(query)
    )
  }, [voices, voiceSearch])

  // Get selected voice info
  const selectedVoice = voices.find(v => v.id === formData.voiceId)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      setFormData({ ...formData, avatar: file })
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.avatar) {
      toast.error('Please select an avatar image')
      return
    }

    if (!formData.name.trim() || !formData.description.trim() || !formData.systemPrompt.trim()) {
      toast.error('Please fill all required fields')
      return
    }

    if (!formData.voiceId) {
      toast.error('Please select a voice')
      return
    }

    setLoading(true)
    
    try {
      const data = new FormData()
      data.append('name', formData.name.trim())
      data.append('description', formData.description.trim())
      data.append('systemPrompt', formData.systemPrompt.trim())
      data.append('category', formData.category)
      data.append('voiceId', formData.voiceId)
      data.append('isPremium', formData.isPremium.toString())
      data.append('avatar', formData.avatar)

      await characterAPI.createCharacter(data)
      
      toast.success('Character created successfully!')
      router.push('/admin/dashboard')
      
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error(error.response?.data?.message || 'Failed to create character')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header - Vercel Style */}
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="icon" className="rounded-md">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Create Character
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Add a new AI character with voice capabilities
          </p>
        </div>
      </div>

      {/* Form - Vercel Style Card */}
      <form onSubmit={handleSubmit}>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black overflow-hidden">
          
          {/* Avatar Upload Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-4">
              Character Avatar
            </label>
            
            <div className="flex items-start gap-6">
              {/* Preview */}
              <div className="flex-shrink-0">
                {previewUrl ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, avatar: null })
                        setPreviewUrl(null)
                      }}
                      className="absolute top-2 right-2 p-1 rounded-md bg-black/60 hover:bg-black/80 text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Upload Button & Info */}
              <div className="flex-1 space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="avatar-upload"
                  required
                />
                <label htmlFor="avatar-upload">
                  <Button type="button" size="sm" variant="outline" asChild className="cursor-pointer">
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                    </span>
                  </Button>
                </label>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>PNG, JPG or WebP (max 5MB)</p>
                  <p>Recommended: 512x512px or higher</p>
                </div>
                
                {formData.avatar && (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 size={14} />
                    <span>{formData.avatar.name} ({(formData.avatar.size / 1024).toFixed(0)} KB)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-6">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Naruto Uzumaki"
                className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition-all"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the character..."
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition-all resize-none"
                required
              />
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                System Prompt
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="You are [character name]. You speak in [style]..."
                rows={5}
                className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition-all resize-none"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Defines how the AI character will behave and respond
              </p>
            </div>

            {/* Category & Voice Grid */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition-all"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Voice Selector */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Voice {loadingVoices && <span className="text-xs text-gray-400">(Loading...)</span>}
                </label>
                
                {/* Selected Voice Button */}
                <button
                  type="button"
                  onClick={() => !loadingVoices && setShowVoiceDropdown(!showVoiceDropdown)}
                  disabled={loadingVoices}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-left flex items-center justify-between text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition-all disabled:opacity-50"
                >
                  {loadingVoices ? (
                    <span className="text-gray-500">Loading...</span>
                  ) : selectedVoice ? (
                    <span className="text-gray-900 dark:text-white">{selectedVoice.name}</span>
                  ) : (
                    <span className="text-gray-500">Select voice...</span>
                  )}
                  <Search size={14} className="text-gray-400" />
                </button>

                {/* Dropdown */}
                {showVoiceDropdown && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowVoiceDropdown(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute z-50 mt-2 w-full bg-white dark:bg-black rounded-md border border-gray-200 dark:border-gray-800 shadow-lg max-h-80 overflow-hidden">
                      {/* Search */}
                      <div className="p-2 border-b border-gray-200 dark:border-gray-800">
                        <div className="relative">
                          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search voices..."
                            value={voiceSearch}
                            onChange={(e) => setVoiceSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Voice List */}
                      <div className="overflow-y-auto max-h-64">
                        {filteredVoices.length > 0 ? (
                          filteredVoices.map(voice => (
                            <button
                              key={voice.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, voiceId: voice.id })
                                setShowVoiceDropdown(false)
                                setVoiceSearch('')
                              }}
                              className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left ${
                                formData.voiceId === voice.id ? 'bg-gray-50 dark:bg-gray-900' : ''
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                                voice.gender === 'Female' 
                                  ? 'bg-pink-100 dark:bg-pink-900/20' 
                                  : 'bg-blue-100 dark:bg-blue-900/20'
                              }`}>
                                <Mic size={14} className={
                                  voice.gender === 'Female' 
                                    ? 'text-pink-600 dark:text-pink-400' 
                                    : 'text-blue-600 dark:text-blue-400'
                                } />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {voice.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {voice.gender} • {voice.id}
                                </p>
                              </div>
                              {formData.voiceId === voice.id && (
                                <CheckCircle2 size={16} className="text-gray-900 dark:text-white" />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-500">
                            <p className="text-sm">No voices found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Premium Toggle */}
            <div className="flex items-center justify-between p-4 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <div>
                <label htmlFor="isPremium" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                  Premium Character
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Requires Pro subscription to access
                </p>
              </div>
              <input
                type="checkbox"
                id="isPremium"
                checked={formData.isPremium}
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 dark:focus:ring-gray-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={loading || loadingVoices}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Character'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
