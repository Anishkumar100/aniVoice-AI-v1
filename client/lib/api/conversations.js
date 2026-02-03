import axiosInstance from './axios';

const conversationAPI = {
  // Get all user conversations
  getAllConversations: async () => {
    const response = await axiosInstance.get('/api/conversations');
    return response.data;
  },

  // Get single conversation by ID
  getConversationById: async (id) => {
    const response = await axiosInstance.get(`/api/conversations/${id}`);
    return response.data;
  },

  // Get conversations by character
  getConversationsByCharacter: async (characterId) => {
    const response = await axiosInstance.get(`/api/conversations/character/${characterId}`);
    return response.data;
  },

  // Save conversation (create or update)
  saveConversation: async (data) => {
    const response = await axiosInstance.post('/api/conversations/save', data);
    return response.data;
  },

  // Delete conversation
  deleteConversation: async (id) => {
    const response = await axiosInstance.delete(`/api/conversations/${id}`);
    return response.data;
  }
};

export default conversationAPI;
