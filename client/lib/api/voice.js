import axiosInstance from './axios'

export const voiceAPI = {
  // Get all available voices
  async getVoiceOptions() {
    const response = await axiosInstance.get('/api/voice/options')
    return response.data
  },
  
  // Generate speech from text (NEW - matches the hook)
  async generateVoice({ text, voice, characterId }) {
    const response = await axiosInstance.post('/api/voice/speak', {
      text,
      voice, // ✅ Added voice parameter
      characterId
    }, {
      responseType: 'blob'
    })
    return response.data
  },
  
  // Generate speech from text (DEPRECATED - kept for compatibility)
  async generateSpeech(text, characterId) {
    const response = await axiosInstance.post('/api/voice/speak', {
      text,
      characterId
    }, {
      responseType: 'blob'
    })
    return response.data
  },
  
  // Chat with voice response
  async replyAndSpeak(text, characterId) {
    const response = await axiosInstance.post('/api/voice/chat', {
      text,
      characterId
    }, {
      responseType: 'blob'
    })
    return {
      audio: response.data,
      text: response.headers['x-ai-reply-text'] 
        ? Buffer.from(response.headers['x-ai-reply-text'], 'base64').toString('utf-8')
        : null
    }
  }
}
