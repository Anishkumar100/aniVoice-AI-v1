import { useSelector, useDispatch } from 'react-redux'
import { setCredentials, logout } from '../store/slices/authSlice'
import { storage } from '../utils/storage'
import { authAPI } from '../api/auth'

/*
The registration feature aint needed in useAuth custom hook. Since, registration is a one time feature, u dont need redux state management for it. You can directly call the registration API where needed. But login and logout are frequent actions that benefit from centralized state management. That's why i have added login and logout in useAuth hook.
*/

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, token, isAuthenticated } = useSelector((state) => state.auth)

  const login = async (credentials) => {
    const response = await authAPI.login(credentials)
    
    const { token: authToken, ...userData } = response
    
    if (!authToken) {
      throw new Error('No token received from backend')
    }
    
    dispatch(setCredentials({ user: userData, token: authToken }))
    
    storage.setToken(authToken)
    storage.setUser(userData)
    
    return response
  }


  const register = async (userData) => {
    const response = await authAPI.register(userData)
    const { token: authToken, ...user } = response
    
    if (!authToken) {
      throw new Error('No token received from backend')
    }
    
    dispatch(setCredentials({ user, token: authToken }))
    storage.setToken(authToken)
    storage.setUser(user)
    
    return response
  }

  const logoutUser = () => {
    dispatch(logout())
    storage.removeToken()
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logoutUser,
  }
}
