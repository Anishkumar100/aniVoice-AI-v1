import axios from "axios"
import { storage } from "@/lib/utils/storage"

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ Only add interceptors in browser environment
if (typeof window !== 'undefined') {
  axiosInstance.interceptors.request.use(
    (config) => {
      const url = config.url || ''
      const method = config.method?.toUpperCase()
      
      // Admin routes detection
      const isAdminRoute = 
        url.includes('/api/admin') || 
        url.includes('/characters/admin') ||
        url.includes('/voice/options') ||
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
        const url = error.config?.url || ''
        const method = error.config?.method?.toUpperCase()
        
        const isAdminRoute = 
          url.includes('/api/admin') || 
          url.includes('/characters/admin') ||
          url.includes('/voice/options') ||
          (url.includes('/api/characters') && ['POST', 'PUT', 'DELETE'].includes(method))

        if (isAdminRoute) {
          storage.removeAdminToken()
          window.location.href = '/admin/login'
        } else {
          storage.removeToken()
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    }
  )
}

export default axiosInstance
