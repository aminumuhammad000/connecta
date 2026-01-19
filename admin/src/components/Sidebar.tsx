import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Icon from './Icon'

interface NavItemProps {
  to: string
  icon: string
  label: string
  collapsed: boolean
  badge?: number
}

function NavItem({ to, icon, label, collapsed, badge }: NavItemProps) {
  const { pathname } = useLocation()
  const active = pathname === to

  return (
    <Link
      to={to}
      className={`group relative flex items-center rounded-xl transition-all duration-300 ${active
        ? 'bg-gradient-to-r from-primary to-amber-500 text-white shadow-lg shadow-primary/25'
        : 'text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark/70 hover:shadow-md'
        } ${collapsed ? 'justify-center px-2 py-3' : 'px-3 py-3 gap-3'}`}
      title={collapsed ? label : undefined}
    >
      <Icon
        name={icon}
        size={22}
        className={`shrink-0 transition-transform duration-200 ${active ? 'text-white scale-110' : 'text-text-light-secondary dark:text-dark-secondary group-hover:scale-105'
          }`}
      />
      <span className={`text-sm font-semibold tracking-wide text-left transition-all duration-300 ${collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100 flex-1'
        }`}>
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <>
          {!collapsed && (
            <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-bold text-white bg-red-500 rounded-full transition-all duration-300 shrink-0">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
          {collapsed && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-[16px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-card-dark">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
}

export default function Sidebar({
  variant = 'desktop',
  onClose,
}: {
  variant?: 'desktop' | 'mobile'
  onClose?: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const isMobile = variant === 'mobile'
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const toggleCollapse = () => {
    if (!isMobile) {
      setCollapsed(!collapsed)
    }
  }

  const isCollapsed = collapsed && !isMobile

  return (
    <aside
      className={`flex h-screen flex-col border-r border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shadow-xl transition-all duration-300 ease-in-out shrink-0 ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-60 md:hidden' : `sticky top-0 hidden md:flex ${isCollapsed ? 'w-20' : 'w-60'}`
        }`}
    >
      {/* Header */}
      <div className={`flex items-center border-b border-border-light dark:border-border-dark transition-all duration-300 ${isCollapsed ? 'justify-center px-2 py-5' : 'justify-between px-4 py-5 gap-3'
        }`}>
        {!isCollapsed && !isMobile && (
          <div className="flex items-center justify-between w-full">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center">
                <img src="/favicon.png" alt="Connecta" className="h-8 w-8 object-contain" />
              </div>
              <div className="flex flex-col overflow-hidden transition-all duration-300">
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent whitespace-nowrap">
                  Connecta
                </h2>
              </div>
            </Link>
            {!isMobile && (
              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark transition-colors"
              >
                <Icon name="chevron_left" size={20} />
              </button>
            )}
          </div>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center gap-4">
            <Link to="/dashboard" className="flex items-center justify-center group">
              <div className="relative flex items-center justify-center">
                <img src="/favicon.png" alt="Connecta" className="h-8 w-8 object-contain" />
              </div>
            </Link>
            {!isMobile && (
              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark transition-colors"
              >
                <Icon name="chevron_right" size={20} />
              </button>
            )}
          </div>
        )}

        {isMobile && (
          <div className="flex items-center justify-between w-full">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center">
                <img src="/favicon.png" alt="Connecta" className="h-8 w-8 object-contain" />
              </div>
              <div className="flex flex-col overflow-hidden transition-all duration-300">
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent whitespace-nowrap">
                  Connecta
                </h2>
              </div>
            </Link>
            <button
              aria-label="Close menu"
              className="flex items-center justify-center rounded-lg bg-background-light dark:bg-background-dark text-text-light-secondary dark:text-dark-secondary h-9 w-9 hover:bg-border-light dark:hover:bg-border-dark transition-colors"
              onClick={onClose}
            >
              <Icon name="close" size={22} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-border-light dark:scrollbar-thumb-border-dark scrollbar-track-transparent">
        <NavItem to="/dashboard" icon="dashboard" label="Dashboard" collapsed={isCollapsed} />
        <NavItem to="/users" icon="group" label="Users" collapsed={isCollapsed} />
        <NavItem to="/projects" icon="work" label="Projects" collapsed={isCollapsed} />
        <NavItem to="/applications" icon="assignment" label="Gig Applications" collapsed={isCollapsed} />
        <NavItem to="/contracts" icon="description" label="Contracts" collapsed={isCollapsed} />
        <NavItem to="/payments" icon="payments" label="Payments" collapsed={isCollapsed} />
        <NavItem to="/subscriptions" icon="verified" label="Subscriptions" collapsed={isCollapsed} />
        <NavItem to="/proposals" icon="mail" label="Proposals" collapsed={isCollapsed} />
        <NavItem to="/reviews" icon="star" label="Reviews" collapsed={isCollapsed} />
        <NavItem to="/analytics" icon="bar_chart" label="Analytics" collapsed={isCollapsed} />
        <NavItem to="/notifications" icon="notifications" label="Notifications" collapsed={isCollapsed} />
        <NavItem to="/broadcast" icon="send" label="Email Broadcast" collapsed={isCollapsed} />
        <NavItem to="/settings" icon="settings" label="Settings" collapsed={isCollapsed} />
      </div>

      {/* Footer */}
      <div className="border-t border-border-light dark:border-border-dark p-3 space-y-3">
        {/* Collapse Toggle (Desktop Only) */}
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center rounded-xl bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all duration-300 group ${isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
            }`}
          title="Sign Out"
        >
          <Icon
            name="logout"
            size={20}
            className="shrink-0"
          />
          <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
            }`}>
            Sign Out
          </span>
        </button>

        {/* User Profile */}
        {/* <Link
          to="/profile"
          className={`flex items-center rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-800/50 transition-all duration-300 group ${
            isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-3'
          }`}
          title={isCollapsed ? 'Admin User' : undefined}
        >
          <div className="relative shrink-0">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10 ring-2 ring-primary/30 group-hover:ring-primary/50 transition-all"
              style={{
                backgroundImage: 'url("https://ui-avatars.com/api/?name=Admin&background=fd6730&color=fff&size=256")',
              }}
            />
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>
          <div className={`flex-1 min-w-0 transition-all duration-300 ${
            isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
          }`}>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-white truncate whitespace-nowrap">Admin User</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate whitespace-nowrap">admin@connecta.com</p>
          </div>
          <Icon
            name="more_vert"
            size={18}
            className={`text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-all duration-300 ${
              isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
            }`}
          />
        </Link> */}
      </div>
    </aside>
  )
}
