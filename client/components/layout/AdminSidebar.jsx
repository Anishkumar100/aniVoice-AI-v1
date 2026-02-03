'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/lib/hooks/useAdmin'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Characters',
    href: '/admin/characters',
    icon: Users
  }
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logoutAdmin } = useAdmin()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = () => {
    logoutAdmin()
    toast.success('Logged out successfully')
    router.push('/admin/login')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      >
        <Menu size={20} className="text-gray-600 dark:text-gray-400" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 z-50
        bg-white dark:bg-black
        border-r border-gray-200 dark:border-gray-800
        transform transition-transform duration-300 ease-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo & Close */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
            <Link href="/admin/dashboard" className="flex items-center gap-2 group">
             
                <Image 
                  src="/logo-icon.webp" 
                  alt="AniVoice AI Logo" 
                  width={16}
                  height={16}
                  className="object-contain"
                />
             
              <span className="font-semibold text-gray-900 dark:text-white">AniVoice AI</span>
            </Link>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white animate-pulse" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer - Logout */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
            >
              <LogOut size={18} className="mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
