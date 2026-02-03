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
    const method = config.method?.toUpperCase() || ''
    
    // ✅ FIXED: More specific admin route detection
    const isAdminRoute = 
      url.startsWith('/api/admin') ||           // Only /api/admin/* routes
      url.includes('/api/admin/') ||            // Ensure it's /api/admin/
      url.includes('/characters/admin') ||      // Admin character routes
      url === '/api/voice/options' ||           // Voice options (admin only)
      (url.includes('/api/characters/create') || url.includes('/api/characters/update') || url.includes('/api/characters/delete'))
    
    const token = isAdminRoute ? storage.getAdminToken() : storage.getToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log(`[Axios] ${method} ${url} - Using ${isAdminRoute ? 'ADMIN' : 'USER'} token`)
    
    return config
  },
  (error) => Promise.reject(error)
)



axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      const method = error.config?.method?.toUpperCase() || ''
      
      // ✅ FIXED: Explicit admin route detection - must explicitly be admin
      const isAdminRoute = 
        url.startsWith('/api/admin') ||           // Only /api/admin/* routes
        url.includes('/api/admin/') ||            // Ensure it's /api/admin/
        url.includes('/characters/admin') ||      // Admin character routes
        url === '/api/voice/options' ||           // Voice options (admin only)
        (url.includes('/api/characters/create') || url.includes('/api/characters/update') || url.includes('/api/characters/delete'))

      // ✅ Only redirect if we're not already on an auth page
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        
        // Don't redirect if already on auth page (prevents loops)
        const isOnAuthPage = 
          currentPath === '/login' || 
          currentPath === '/register' || 
          currentPath === '/admin/login' ||
          currentPath === '/forgot-password'
        
        if (isOnAuthPage) {
          return Promise.reject(error)
        }

        // Clear tokens and redirect
        if (isAdminRoute) {
          storage.removeAdminToken()
          console.log('401 on admin route, redirecting to /admin/login')
          window.location.href = '/admin/login'
        } else {
          storage.removeToken()
          storage.removeUser()
          console.log('401 on user route, redirecting to /login')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)
