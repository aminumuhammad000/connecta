import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  CreditCard,
  User
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const EmployerSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const companyName = user?.companyName || user?.title || `${user?.firstName || ''} ${user?.lastName || ''}'s Org`.trim() || 'Workforce Employer';
  const firstName = user?.firstName || 'Employer';

  return (
    <aside className="hidden lg:flex lg:col-span-3 flex-col justify-between space-y-8 pr-2">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-orange-100 border-2 border-white shadow-sm flex items-center justify-center text-primary font-extrabold text-lg overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={companyName} className="w-full h-full object-cover" />
              ) : (
                (firstName || 'C')[0]
              )}
            </div>
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
          </div>

          <div>
            <h2 className="font-extrabold text-gray-900 text-base leading-tight">Hello, {firstName}</h2>
            <p className="text-xs text-gray-500 font-medium truncate max-w-[170px]">{companyName}</p>
          </div>
        </div>

        <nav className="space-y-2">
          <Link
            to="/employer/dashboard"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
              location.pathname === '/employer/dashboard' || location.pathname === '/dashboard'
                ? 'bg-white text-gray-900 font-extrabold shadow-xs border border-gray-100'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${location.pathname.includes('dashboard') ? 'text-primary' : ''}`} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/employer/workforce"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
              location.pathname === '/employer/workforce' || location.pathname === '/workforce'
                ? 'bg-white text-gray-900 font-extrabold shadow-xs border border-gray-100'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <Users className={`w-5 h-5 ${location.pathname.includes('workforce') ? 'text-primary' : ''}`} />
            <span>Employees</span>
          </Link>

          <Link
            to="/employer/jobs"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
              location.pathname === '/employer/jobs' || location.pathname === '/jobs'
                ? 'bg-white text-gray-900 font-extrabold shadow-xs border border-gray-100'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${location.pathname.includes('jobs') ? 'text-primary' : ''}`} />
            <span>Jobs & Roles</span>
          </Link>

          <Link
            to="/employer/payments"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
              location.pathname === '/employer/payments' || location.pathname === '/payments'
                ? 'bg-white text-gray-900 font-extrabold shadow-xs border border-gray-100'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <CreditCard className={`w-5 h-5 ${location.pathname.includes('payments') ? 'text-emerald-600' : ''}`} />
            <span>Payroll</span>
          </Link>

        </nav>
      </div>

      <div className="space-y-2 pt-6 border-t border-gray-200/60">
        <Link
          to="/employer/settings"
          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
            location.pathname === '/employer/settings'
              ? 'bg-white text-gray-900 font-extrabold shadow-xs border border-gray-100'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
          }`}
        >
          <User className={`w-5 h-5 ${location.pathname.includes('settings') ? 'text-primary' : ''}`} />
          <span>Employer Profile</span>
        </Link>
      </div>
    </aside>
  );
};
