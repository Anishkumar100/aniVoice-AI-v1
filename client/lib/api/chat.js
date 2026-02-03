// lib/api/chat.js
import axios from './axios'

export const chatAPI = {
  async chat(data) {
    const response = await axios.post('/api/model/chat', data)
    return response.data
  },

  async voiceChat(data) {
    const response = await axios.post('/api/voice/chat', data)
    return response.data
  },

  // ✅ FIXED: Access full response to get headers + blob
  async speak(data) {
    try {
      const response = await axios.post('/api/voice/speak', data, {
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'blob',
        validateStatus: (status) => status >= 200 && status < 500  // Don't throw on 4xx
      })
      
      // Check if it's an error (JSON response)
      const contentType = response.headers['content-type']
      if (contentType && contentType.includes('application/json')) {
        // It's a JSON error, parse it
        const text = await response.data.text()
        const errorData = JSON.parse(text)
        throw new Error(errorData.message || 'Voice generation failed')
      }
      
      // Success - return the audio blob
      return response.data
      
    } catch (error) {
      // Handle blob error responses
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text()
          const errorData = JSON.parse(text)
          console.error('❌ Server error:', errorData.message)
          throw new Error(errorData.message || 'Voice generation failed')
        } catch (parseError) {
          console.error('❌ Error parsing blob:', parseError)
          throw new Error('Voice generation failed')
        }
      }
      throw error
    }
  },
}
