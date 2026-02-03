import axiosInstance from './axios';

export const authAPI = {
  // Get security questions list
  getSecurityQuestions: async () => {
    const response = await axiosInstance.get('/api/users/security-questions');
    return response.data;
  },

  // Register with security question
  register: async (data) => {
    const response = await axiosInstance.post('/api/users/register', data);
    return response.data;
  },

  // Login
  login: async (data) => {
    const response = await axiosInstance.post('/api/users/login', data);
    return response.data;
  },

  // Forgot password - get security question
  getSecurityQuestion: async (email) => {
    const response = await axiosInstance.post('/api/users/forgot-password/question', { email });
    return response.data;
  },

  // Forgot password - verify answer
  verifySecurityAnswer: async (data) => {
    const response = await axiosInstance.post('/api/users/forgot-password/verify', data);
    return response.data;
  },

  // Forgot password - reset password
  resetPassword: async (data) => {
    const response = await axiosInstance.post('/api/users/forgot-password/reset', data);
    return response.data;
  },

  // Get profile
  getProfile: async () => {
    const response = await axiosInstance.get('/api/users/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await axiosInstance.put('/api/users/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await axiosInstance.put('/api/users/password', data);
    return response.data;
  },

  // Update security question
  updateSecurityQuestion: async (data) => {
    const response = await axiosInstance.put('/api/users/security-question', data);
    return response.data;
  },

  // Delete account
  deleteAccount: async () => {
    const response = await axiosInstance.delete('/api/users/account');
    return response.data;
  }
};

export default authAPI;
