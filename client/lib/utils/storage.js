/*
storage.js

Saves/gets/deletes tokens from browser localStorage. Uses typeof window !== 'undefined' to check if code is running in browser (not on server) before accessing localStorage.


And what is SSR?
SSR stands for Server-Side Rendering. It is a technique used in web development where the server generates the full HTML for a page on each request, rather than relying on client-side JavaScript to build the page in the browser. This can improve performance and SEO for web applications.

but what is SSR safety checks?
SSR safety checks ensure that the code accessing browser-specific APIs (like localStorage) only runs in the browser environment, preventing errors during server-side rendering.
*/


// Token management for both user and admin
/*
storage.js

Saves/gets/deletes tokens and user data from browser localStorage. 
Uses typeof window !== 'undefined' to check if code is running in browser (not on server) before accessing localStorage.
*/

// Token and data management for both user and admin
export const storage = {
  // User token methods
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  },

  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  // User data methods
  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    }
    return null
  },

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
  },

  // Admin token methods
  getAdminToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken')
    }
    return null
  },

  setAdminToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminToken', token)
    }
  },

  removeAdminToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin')
    }
  },

  // Admin data methods
  getAdmin: () => {
    if (typeof window !== 'undefined') {
      const admin = localStorage.getItem('admin')
      return admin ? JSON.parse(admin) : null
    }
    return null
  },

  setAdmin: (admin) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin', JSON.stringify(admin))
    }
  },

  // Clear all tokens and data
  clearAll: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin')
    }
  },
}
