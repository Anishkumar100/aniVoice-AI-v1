import axios from "axios"
import {storage} from "@/lib/utils/storage"

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const url = config.url || ''
    const method = config.method?.toUpperCase()
    
    // ✅ Admin routes detection
    const isAdminRoute = 
      url.includes('/api/admin') || 
      url.includes('/characters/admin') ||
      url.includes('/voice/options') ||  // ← ADD THIS LINE
      (url.includes('/api/characters') && ['POST', 'PUT', 'DELETE'].includes(method))
    
    const token = isAdminRoute ? storage.getAdminToken() : storage.getToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config.url || ''
      const method = error.config.method?.toUpperCase()
      
      // Same logic for error handling
      const isAdminRoute = 
        url.includes('/api/admin') || 
        url.includes('/characters/admin') ||
        url.includes('/voice/options') ||  // ← ADD THIS LINE
        (url.includes('/api/characters') && ['POST', 'PUT', 'DELETE'].includes(method))

      if (isAdminRoute) {
        storage.removeAdminToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login'
        }
      } else {
        storage.removeToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
