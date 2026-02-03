'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ChevronDown, Save } from 'lucide-react'
import Image from 'next/image'
import { useChat } from '@/lib/hooks/useChat'
import { voiceAPI } from '@/lib/api/voice'
import { useVoice } from '@/lib/hooks/useVoice'
import ChatHeader from '@/components/chat/ChatHeader'
import ChatMessage from '@/components/chat/ChatMessage'
import ChatInput from '@/components/chat/ChatInput'

export default function CharacterChatPage() {
  const params = useParams()
  const router = useRouter()
  const characterId = params.id

  const [showScrollButton, setShowScrollButton] = useState(false)

  const {
    character,
    loading,
    messages,
    setMessages,
    input,
    setInput,
    sending,
    isSaving,
    handleSendMessage,
    messagesEndRef,
    messagesContainerRef,
    inputRef,
    saveConversation
  } = useChat(characterId, router)

  const {
    playingAudio,
    generatingVoice,
    autoPlayVoice,
    toggleAutoPlay,
    generateVoice,
    playAudio,
    stopAudio
  } = useVoice()

  // Scroll detection
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200
      setShowScrollButton(!isNearBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Ping Kokoro service
  useEffect(() => {
    const pingServices = async () => {
      try {
        await fetch(process.env.NEXT_PUBLIC_KOKORO_API_URL || 'https://akcoderspark-aniVoice-kokoro-tts.hf.space/v1/audio/speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: "kokoro",
            voice: "af_bella",
            input: "ping",
            response_format: "wav"
          })
        })
      } catch (error) {
        // Silent
      }
    }
    pingServices()
    const interval = setInterval(pingServices, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerateVoice = (text, messageId) => {
    generateVoice(text, messageId, setMessages, character, saveConversation)
  }


  const onSubmit = (e) => {
    handleSendMessage(e, handleGenerateVoice, autoPlayVoice)
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-black">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-gray-200 dark:border-gray-800 rounded-full" />
          <div className="absolute inset-0 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading character...</p>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Character not found</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-black">
      <ChatHeader
        character={character}
        playingAudio={playingAudio}
        stopAudio={stopAudio}
        autoPlayVoice={autoPlayVoice}
        toggleAutoPlay={toggleAutoPlay}
      />

      {/* Save Indicator */}
      {isSaving && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Save className="w-3 h-3 animate-pulse" />
            <span>Saving conversation...</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              index={index}
              character={character}
              playingAudio={playingAudio}
              generatingVoice={generatingVoice}
              autoPlayVoice={autoPlayVoice}
              playAudio={playAudio}
              stopAudio={stopAudio}
              generateVoice={handleGenerateVoice}
            />
          ))}

          {sending && (
            <div className="flex gap-3 justify-start">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
                <Image
                  src={character.avatar}
                  alt={character.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 z-50 w-10 h-10 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <ChevronDown size={20} />
        </button>
      )}

      <ChatInput
        input={input}
        setInput={setInput}
        sending={sending}
        handleSubmit={onSubmit}
        characterName={character.name}
        inputRef={inputRef}
      />
    </div>
  )
}
