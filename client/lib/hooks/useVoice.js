import { useState, useEffect, useRef } from 'react'
import { voiceAPI } from '../api/voice'
import toast from 'react-hot-toast'

export function useVoice() {
  const [playingAudio, setPlayingAudio] = useState(null)
  const [generatingVoice, setGeneratingVoice] = useState(null)
  const [autoPlayVoice, setAutoPlayVoice] = useState(true)
  const audioRef = useRef(null)

  useEffect(() => {
    const savedPref = localStorage.getItem('autoPlayVoice')
    if (savedPref !== null) {
      setAutoPlayVoice(savedPref === 'true')
    }
  }, [])

  const toggleAutoPlay = () => {
    const newValue = !autoPlayVoice
    setAutoPlayVoice(newValue)
    localStorage.setItem('autoPlayVoice', newValue.toString())
    toast.success(newValue ? 'Voice enabled' : 'Voice disabled', {
      icon: newValue ? '🔊' : '🔇',
      duration: 2000
    })
  }

  const generateVoice = async (text, messageId, setMessages, character, saveConversation) => {
    try {
      setGeneratingVoice(messageId);

      const audioBlob = await voiceAPI.generateVoice({
        text,
        voice: character.voice,
        characterId: character._id
      });

      const audioUrl = URL.createObjectURL(audioBlob);

      // Update message with voice URL
      const updatedMessages = [];
      setMessages(prev => {
        const newMessages = prev.map(msg =>
          msg.id === messageId
            ? { ...msg, voiceUrl: audioUrl }
            : msg
        );
        updatedMessages.push(...newMessages);
        return newMessages;
      });

      // ✅ Save conversation with voice URL
      if (saveConversation) {
        await saveConversation(updatedMessages);
      }

      // Auto-play if enabled
      if (autoPlayVoice) {
        playAudio(audioUrl, messageId);
      }

    } catch (error) {
      console.error('Error generating voice:', error);
      toast.error('Failed to generate voice');
    } finally {
      setGeneratingVoice(null);
    }
  };

  const playAudio = (audioUrl, messageId) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setPlayingAudio(null)
    }

    const audio = new Audio(audioUrl)
    audioRef.current = audio

    audio.onplay = () => setPlayingAudio(messageId)
    audio.onended = () => {
      setPlayingAudio(null)
      audioRef.current = null
    }
    audio.onerror = () => {
      setPlayingAudio(null)
      audioRef.current = null
      toast.error('Failed to play audio')
    }

    audio.play()
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setPlayingAudio(null)
    }
  }

  return {
    playingAudio,
    generatingVoice,
    autoPlayVoice,
    toggleAutoPlay,
    generateVoice,
    playAudio,
    stopAudio
  }
}
