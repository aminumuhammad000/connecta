import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Icon from './Icon'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [darkMode, setDarkMode] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get admin user from localStorage
    const user = localStorage.getItem('admin_user')
    if (user) {
      try {
        setAdminUser(JSON.parse(user))
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }

    // Check dark mode preference
    const isDark = document.documentElement.classList.contains('dark')
    setDarkMode(isDark)
  }, [])

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const toggleDarkMode = () => {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setDarkMode(false)
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setDarkMode(true)
    }
  }

  const mockNotifications = [
    { id: 1, type: 'payment', message: 'New payment received: ₦250,000', time: '5 min ago', unread: true },
    { id: 2, type: 'user', message: 'New user registered: John Doe', time: '1 hour ago', unread: true },
    { id: 3, type: 'contract', message: 'Contract signed by client', time: '2 hours ago', unread: false },
  ]

  return (
    <header className="sticky top-0 z-20 flex h-16 md:h-18 items-center justify-between whitespace-nowrap border-b border-border-light dark:border-border-dark bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-lg shadow-sm px-4 md:px-8">
      {/* Page Title */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Icon name="menu" size={24} />
        </button>
        <div className="flex flex-col">
          {/* <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1> */}
          <p className="text-xs sm:text-sm text-text-light-secondary dark:text-dark-secondary">

          </p>
        </div>
      </div>

      {/* Search Bar (Desktop) */}
      <div className="hidden md:flex flex-1 justify-center px-6 lg:px-12 max-w-3xl">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon name="search" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
          </div>
          <input
            type="text"
            className="w-full h-11 pl-10 pr-4 text-sm bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl text-text-light-primary dark:text-dark-primary placeholder:text-text-light-secondary dark:placeholder:text-dark-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
            placeholder="Search users, projects, contracts..."
          />
          <kbd className="hidden lg:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 px-2 py-1 text-xs font-semibold text-text-light-secondary dark:text-dark-secondary bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-background-light dark:bg-background-dark text-text-light-secondary dark:text-dark-secondary hover:bg-border-light dark:hover:bg-border-dark hover:text-primary transition-all"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Icon name={darkMode ? 'light_mode' : 'dark_mode'} size={20} />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-background-light dark:bg-background-dark text-text-light-secondary dark:text-dark-secondary hover:bg-border-light dark:hover:bg-border-dark hover:text-primary transition-all"
          >
            <Icon name="notifications" size={20} />
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-card-light dark:ring-card-dark"></span>
            </span>
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-card-light dark:bg-card-dark shadow-xl border border-border-light dark:border-border-dark overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                <h3 className="text-sm font-semibold text-text-light-primary dark:text-dark-primary">Notifications</h3>
                <button className="text-xs font-medium text-primary hover:text-primary/80">
                  Mark all read
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-background-light dark:hover:bg-background-dark cursor-pointer transition-colors ${notif.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                  >
                    <div className={`p-2 rounded-lg ${notif.type === 'payment' ? 'bg-green-100 dark:bg-green-900/30' :
                      notif.type === 'user' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                      <Icon
                        name={notif.type === 'payment' ? 'payments' : notif.type === 'user' ? 'person_add' : 'description'}
                        size={18}
                        className={
                          notif.type === 'payment' ? 'text-green-600 dark:text-green-400' :
                            notif.type === 'user' ? 'text-blue-600 dark:text-blue-400' :
                              'text-purple-600 dark:text-purple-400'
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-light-primary dark:text-dark-primary font-medium">{notif.message}</p>
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-0.5">{notif.time}</p>
                    </div>
                    {notif.unread && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                ))}
              </div>
              <Link
                to="/notifications"
                className="block px-4 py-3 text-center text-sm font-medium text-primary hover:bg-background-light dark:hover:bg-background-dark border-t border-border-light dark:border-border-dark transition-colors"
                onClick={() => setNotificationsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-background-light dark:bg-background-dark text-text-light-secondary dark:text-dark-secondary hover:bg-border-light dark:hover:bg-border-dark hover:text-primary transition-all">
          <Icon name="apps" size={20} />
        </button>

        {/* Divider */}
        <div className="hidden sm:block h-8 w-px bg-border-light dark:bg-border-dark mx-1" />

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl hover:bg-background-light dark:hover:bg-background-dark px-2 py-1.5 transition-all group"
          >
            <div className="relative">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-9 w-9 ring-2 ring-border-light dark:ring-border-dark group-hover:ring-primary/50 transition-all"
                style={{
                  backgroundImage: adminUser?.profileImage
                    ? `url(${adminUser.profileImage})`
                    : 'url("https://ui-avatars.com/api/?name=Admin&background=fd6730&color=fff&size=128")',
                }}
              />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-card-light dark:border-card-dark rounded-full" />
            </div>
            <div className="hidden lg:flex flex-col items-start">
              <span className="text-sm font-semibold text-text-light-primary dark:text-dark-primary">
                {adminUser?.firstName || 'Admin'}
              </span>
              <span className="text-xs text-text-light-secondary dark:text-dark-secondary">Administrator</span>
            </div>
            <Icon
              name="expand_more"
              size={20}
              className={`hidden lg:block text-text-light-secondary dark:text-dark-secondary transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-card-light dark:bg-card-dark shadow-xl border border-border-light dark:border-border-dark overflow-hidden z-50">
              {/* User Info Header */}
              <div className="px-4 py-4 bg-gradient-to-r from-primary/10 to-amber-500/10 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center gap-3">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12 ring-2 ring-card-light dark:ring-card-dark shadow-md"
                    style={{
                      backgroundImage: adminUser?.profileImage
                        ? `url(${adminUser.profileImage})`
                        : 'url("https://ui-avatars.com/api/?name=Admin&background=fd6730&color=fff&size=128")',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-light-primary dark:text-dark-primary truncate">
                      {adminUser?.firstName} {adminUser?.lastName || 'User'}
                    </p>
                    <p className="text-xs text-text-light-secondary dark:text-dark-secondary truncate">
                      {adminUser?.email || 'admin@connecta.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Icon name="person" size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">My Profile</span>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Icon name="settings" size={18} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-medium">Settings</span>
                </Link>

                <Link
                  to="/analytics"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Icon name="bar_chart" size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-medium">Analytics</span>
                </Link>

                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    toast('Help & Documentation', { icon: '📚' })
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                >
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Icon name="help" size={18} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="font-medium">Help & Support</span>
                </button>
              </div>

              <div className="border-t border-border-light dark:border-border-dark" />

              <div className="py-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                >
                  <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Icon name="logout" size={18} className="text-red-600 dark:text-red-400" />
                  </div>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
