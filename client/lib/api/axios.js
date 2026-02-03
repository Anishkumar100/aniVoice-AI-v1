axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      const method = error.config?.method?.toUpperCase() || ''
      
      // Same logic for error handling
      const isAdminRoute = 
        url.includes('/api/admin') || 
        url.includes('/characters/admin') ||
        url.includes('/voice/options') ||
        (url.includes('/api/characters') && ['POST', 'PUT', 'DELETE'].includes(method))

      // ✅ DEBUG: Log what's happening
      console.log('=== 401 ERROR DEBUG ===')
      console.log('URL:', url)
      console.log('Method:', method)
      console.log('Is Admin Route?', isAdminRoute)
      console.log('Current Path:', window.location?.pathname)
      console.log('User Token:', storage.getToken())
      console.log('Admin Token:', storage.getAdminToken())
      console.log('=======================')

      if (isAdminRoute) {
        storage.removeAdminToken()
        if (typeof window !== 'undefined') {
          console.log('Redirecting to /admin/login')
          window.location.href = '/admin/login'
        }
      } else {
        storage.removeToken()
        if (typeof window !== 'undefined') {
          console.log('Redirecting to /login')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)
