'use client'

import { Volume2, VolumeX } from 'lucide-react'

export default function VoiceControls({ playingAudio, stopAudio, autoPlayVoice, toggleAutoPlay }) {
  return (
    <div className="flex items-center gap-2">
      {playingAudio && (
        <button
          onClick={stopAudio}
          className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors flex items-center gap-1.5"
        >
          <div className="flex items-center gap-0.5">
            <div className="w-0.5 h-2 bg-rose-600 dark:bg-rose-400 rounded-full animate-wave" />
            <div className="w-0.5 h-3 bg-rose-600 dark:bg-rose-400 rounded-full animate-wave" style={{ animationDelay: '0.1s' }} />
            <div className="w-0.5 h-2 bg-rose-600 dark:bg-rose-400 rounded-full animate-wave" style={{ animationDelay: '0.2s' }} />
          </div>
          <span className="hidden sm:inline">Stop</span>
        </button>
      )}

      <button
        onClick={toggleAutoPlay}
        className={`p-2 rounded-lg transition-colors ${
          autoPlayVoice
            ? 'bg-rose-600 text-white hover:bg-rose-700'
            : 'bg-gray-100 dark:bg-gray-900 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        title={autoPlayVoice ? 'Voice on' : 'Voice off'}
      >
        {autoPlayVoice ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </div>
  )
}
