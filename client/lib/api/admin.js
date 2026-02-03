// adminLogin(username, password)
// createCharacter(formData)
// getAllCharacters()

// This adminAPI is an object containing asynchronous functions for admin operations

import axios from './axios.js'

export const adminAPI = {
  async login(data) {
    const response = await axios.post('/api/admin/login', data)
    return response.data
  },

  async getProfile() {
    const response = await axios.get('/api/admin/profile')
    return response.data
  },

  async getStats() {
    const response = await axios.get('/api/admin/stats')
    return response.data
  }

}
