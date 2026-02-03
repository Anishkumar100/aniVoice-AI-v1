'use client'

import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ChatInput({ 
  input, 
  setInput, 
  sending, 
  handleSubmit, 
  characterName,
  inputRef 
}) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${characterName}...`}
            disabled={sending}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:border-gray-300 dark:focus:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none transition-colors disabled:opacity-50 text-sm"
          />
          
          <Button
            type="submit"
            disabled={!input.trim() || sending}
            className="px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-all hover:scale-105"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
