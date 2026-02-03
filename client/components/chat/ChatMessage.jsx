'use client'

import { Mic, Pause, Play, User as UserIcon, Volume2, Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function ChatMessage({ 
  message, 
  index, 
  character, 
  playingAudio, 
  generatingVoice,
  autoPlayVoice,
  playAudio, 
  stopAudio,
  generateVoice 
}) {
  const isUser = message.role === 'user';
  const isAI = message.role === 'assistant';

  // ✅ FIX: Only show loading when actively generating THIS message
  const isGeneratingThisMessage = generatingVoice === message.id;

  return (
    <div
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      style={{
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        animationDelay: `${Math.min(index * 50, 300)}ms`,
        animationFillMode: 'both'
      }}
    >
      {/* AI Avatar */}
      {isAI && (
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-800 flex-shrink-0 bg-gradient-to-br from-rose-100 to-purple-100 dark:from-rose-950 dark:to-purple-950 shadow-sm">
          <Image
            src={character.avatar}
            alt={character.name}
            fill
            sizes="40px"
            className="object-cover"
            priority={index < 3}
          />
        </div>
      )}

      <div className="flex flex-col gap-2 max-w-[75%] md:max-w-[65%]">
        {/* Message Bubble */}
        <div
          className={`group relative ${
            isUser
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-2xl rounded-br-md shadow-lg'
              : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl rounded-bl-md border-2 border-gray-200 dark:border-gray-800 shadow-sm'
          } px-4 py-3 transition-all hover:shadow-md`}
        >
          {/* Message Content */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          
          {/* Timestamp - Enhanced */}
          {message.timestamp && (
            <div className={`flex items-center gap-1.5 mt-2 pt-2 border-t ${
              isUser 
                ? 'border-white/10 dark:border-gray-800' 
                : 'border-gray-200 dark:border-gray-800'
            }`}>
              <span className={`text-[10px] font-medium ${
                isUser
                  ? 'text-white/60 dark:text-gray-600'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        {/* Voice Controls - Enhanced for AI messages */}
        {isAI && (
          <div className="flex items-center gap-2 pl-1">
            {/* ✅ Generating Voice Indicator - Only when actively generating */}
            {isGeneratingThisMessage && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-950/30 dark:to-purple-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium shadow-sm animate-in fade-in duration-300">
                <Loader2 size={14} className="animate-spin" />
                <span>Generating voice...</span>
              </div>
            )}

            {/* Play/Pause Button */}
            {message.voiceUrl && !isGeneratingThisMessage && (
              <button
                onClick={() => {
                  if (playingAudio === message.id) {
                    stopAudio()
                  } else {
                    playAudio(message.voiceUrl, message.id)
                  }
                }}
                className={`group/btn flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-sm ${
                  playingAudio === message.id
                    ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-r hover:from-rose-500 hover:to-purple-600 text-gray-700 dark:text-gray-300 hover:text-white hover:shadow-md hover:shadow-rose-500/30'
                }`}
              >
                {playingAudio === message.id ? (
                  <>
                    <Pause size={14} className="animate-pulse" />
                    <span>Playing</span>
                    <div className="flex gap-0.5 ml-1">
                      <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                      <div className="w-0.5 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                      <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  </>
                ) : (
                  <>
                    <Play size={14} className="group-hover/btn:scale-110 transition-transform" />
                    <span>Play Voice</span>
                  </>
                )}
              </button>
            )}

            {/* Generate Voice Button - Only show when voice is OFF and no voiceUrl */}
            {!message.voiceUrl && !isGeneratingThisMessage && !autoPlayVoice && (
              <button
                onClick={() => generateVoice(message.content, message.id)}
                className="group/btn flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-r hover:from-rose-500 hover:to-purple-600 text-gray-700 dark:text-gray-300 hover:text-white text-xs font-medium transition-all shadow-sm hover:shadow-md hover:shadow-rose-500/30"
              >
                <Volume2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                <span>Generate Voice</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-200 flex items-center justify-center flex-shrink-0 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
          <UserIcon size={20} className="text-white dark:text-gray-900" />
        </div>
      )}
    </div>
  )
}
