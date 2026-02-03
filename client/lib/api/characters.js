import axiosInstance from './axios'

export const characterAPI = {
  // Get all characters (Admin)
  async getAllCharacters() {
    const response = await axiosInstance.get('/api/admin/characters/all') // ✅ Changed to admin
    return response.data
  },

  // Get single character by ID (Admin - for editing) ✅ FIXED
  async getCharacterById(id) {
    const response = await axiosInstance.get(`/api/admin/characters/${id}`) // ✅ Changed to admin
    return response.data
  },

  // Get all characters (Public - for user selection)
  async getPublicCharacters() {
    const response = await axiosInstance.get('/api/characters/all')
    return response.data
  },

  // Get single character (Public - for chat)
  async getPublicCharacterById(id) {
    const response = await axiosInstance.get(`/api/characters/${id}`)
    return response.data
  },

  // Create character (Admin only)
  async createCharacter(formData) {
    const response = await axiosInstance.post('/api/admin/characters/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Update character (Admin only)
  async updateCharacter(id, formData) {
    const response = await axiosInstance.put(`/api/admin/characters/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Delete character (Admin only)
  async deleteCharacter(id) {
    const response = await axiosInstance.delete(`/api/admin/characters/${id}`)
    return response.data
  }
}
