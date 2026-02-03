'use client'

import { useRouter } from 'next/navigation'
import { useAdmin } from '@/lib/hooks/useAdmin'
import { useTheme } from '@/lib/hooks/useTheme'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Menu
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminHeader({ admin, onMenuClick }) {
  const router = useRouter()
  const { logoutAdmin } = useAdmin()
  const { isDark, toggleTheme } = useTheme()

  const handleLogout = () => {
    logoutAdmin()
    toast.success('Logged out successfully')
    router.push('/admin/login')
  }

  const getAdminName = () => {
    if (admin?.name) return admin.name
    if (admin?.email) {
      return admin.email.split('@')[0]
        .split('.')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    return 'Admin'
  }

  const getInitials = () => {
    const name = getAdminName()
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden -ml-2"
          >
            <Menu size={20} />
          </Button>

          {/* Title */}
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              AniVoice AI
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative"
          >
            <Sun size={18} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon size={18} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 pr-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white flex items-center justify-center shadow-md ring-2 ring-gray-100 dark:ring-gray-800">
                  <span className="text-white dark:text-black text-xs font-bold">
                    {getInitials()}
                  </span>
                </div>
                
                {/* Name */}
                <span className="hidden md:block text-sm font-medium">
                  {getAdminName()}
                </span>
                
                {/* Chevron */}
                <ChevronDown size={16} className="hidden sm:block text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-64">
              {/* Profile Info */}
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white flex items-center justify-center shadow-md">
                    <span className="text-white dark:text-black text-sm font-bold">
                      {getInitials()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {getAdminName()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {admin?.email}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Administrator
                  </span>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              {/* Logout */}
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:text-red-400 dark:focus:text-red-300 dark:focus:bg-red-900/20 cursor-pointer"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
