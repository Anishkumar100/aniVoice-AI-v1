import { useSelector, useDispatch } from 'react-redux'
import { setAdminCredentials, adminLogout } from '../store/slices/adminSlice'
import { storage } from '../utils/storage'
import { adminAPI } from '../api/admin'

export const useAdmin = () => {
  const dispatch = useDispatch()
  const { setAdminToken, removeAdminToken, setAdmin } = storage
  const { admin, adminToken, isAdminAuthenticated } = useSelector((state) => state.admin)

  const adminLogin = async (credentials) => {
    const response = await adminAPI.login(credentials)

    // Extract token and admin data
    const { token: authToken, ...adminData } = response

    if (!authToken) {
      throw new Error('No token received from backend')
    }

    // Save to Redux
    dispatch(setAdminCredentials({ admin: adminData, adminToken: authToken }))

    // Save to localStorage
    setAdminToken(authToken)
    setAdmin(adminData)
    console.log('adminToken:', localStorage.getItem('adminToken'))
    console.log('admin:', localStorage.getItem('admin'))


    // If you want to persist admin data like user data:
    // localStorage.setItem('admin', JSON.stringify(adminData))

    return response
  }

  const logoutAdmin = () => {
    dispatch(adminLogout())
    removeAdminToken()
  }

  return {
    admin,
    adminToken,
    isAdminAuthenticated,
    adminLogin,
    logoutAdmin,
  }
}
