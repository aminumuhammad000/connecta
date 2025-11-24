import { Link, useLocation } from 'react-router-dom'
import Icon from './Icon'

function NavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  const { pathname } = useLocation()
  const active = pathname === to
  const base = 'flex items-center gap-3 px-3 py-2.5 rounded-lg'
  const activeCls = 'bg-primary/10 dark:bg-primary/20 text-primary'
  const inactiveCls = 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
  return (
    <Link to={to} className={`${base} ${active ? activeCls : inactiveCls}`}>
      <Icon name={icon} size={24} className={`${active ? 'text-primary' : 'text-stone-900 dark:text-stone-100'}`} />
      <p className="text-sm font-medium leading-normal">{label}</p>
    </Link>
  )
}

export default function Sidebar({ variant = 'desktop', onClose }: { variant?: 'desktop' | 'mobile'; onClose?: () => void }) {
  const isMobile = variant === 'mobile'
  const base = 'flex h-screen w-64 flex-col border-r border-stone-200 dark:border-stone-700 bg-white dark:bg-background-dark py-6 px-4 shrink-0'
  const desktopCls = 'sticky top-0 hidden md:flex'
  const mobileCls = 'fixed inset-y-0 left-0 z-50 md:hidden shadow-xl'
  return (
    <aside className={`${base} ${isMobile ? mobileCls : desktopCls}`}>
      <div className="flex items-center justify-between gap-2 px-3 mb-6">
        <div className="flex items-center gap-2">
          <Icon name="hub" size={30} className="text-primary" />
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Connecta</h2>
        </div>
        {isMobile && (
          <button
            aria-label="Close menu"
            className="inline-flex items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 size-9"
            onClick={onClose}
          >
            <Icon name="close" size={24} />
          </button>
        )}
      </div>
      <div className="flex flex-col justify-between grow">
        <div className="flex flex-col gap-2">
          <NavItem to="/dashboard" icon="dashboard" label="Dashboard" />
          <NavItem to="/jobs" icon="group" label="Users" />
          <NavItem to="/projects" icon="work" label="Projects" />
          <NavItem to="/applications" icon="assignment_turned_in" label="Gig Applications" />
          <NavItem to="/contracts" icon="assignment" label="Contracts" />
          <NavItem to="/payments" icon="payments" label="Payments" />
          <NavItem to="/proposals" icon="mail" label="Proposals" />
          <NavItem to="/reviews" icon="reviews" label="Reviews" />
          <NavItem to="/analytics" icon="bar_chart" label="Analytics" />
          <NavItem to="/notifications" icon="settings" label="Settings" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="border-t border-stone-200 dark:border-stone-700 my-2" />
          <div className="flex items-center justify-between gap-3 px-3">
            <div className="flex items-center gap-3">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                data-alt="Admin avatar"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuChEFxUT-lxdnG5y37ylrt-_XX_F6fXbMNMy6DRBSv08FcjVx0M9NeISZrui8-RYd4lcHU5wV29M8HsKvGuKDMW4DMsz-eTPrrH961x3XsZMjEKIE7LeB4GVFofGTjuZArMEplL2YPEI7-n_R-cgcyaKzTr2LFh3BqsESTGWpGvyZPMDk_hF1d7oSscbPD9byJCWbycOAnDIRWgo5Kc6Uh0bW_L5Abx7DJACPKffZOxczL58ZD4axLylIiOA3BY4QnWp0-x8kPs06E")',
                }}
              />
              <div className="flex flex-col">
                <h1 className="text-stone-900 dark:text-white text-sm font-medium leading-normal">Admin Name</h1>
                <p className="text-stone-500 dark:text-stone-400 text-xs font-normal leading-normal">admin@connecta.com</p>
              </div>
            </div>
            <Link to="/login" className="text-stone-500 dark:text-stone-400">
              <Icon name="logout" size={24} />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
