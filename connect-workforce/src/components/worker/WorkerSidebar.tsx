import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  CreditCard,
  Inbox,
  User,
  LogOut,
  Wallet
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface WorkerSidebarProps {
  isHired?: boolean;
}

export const WorkerSidebar: React.FC<WorkerSidebarProps> = ({ isHired }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const firstName = user?.firstName || 'Worker';
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Worker';
  const userContact = (user?.email && !user.email.includes('@worker.myconnecta'))
    ? user.email
    : ((user as any)?.phoneNumber || (user as any)?.phone || (user?.email ? user.email.split('@')[0] : ''));

  const workLabel = isHired ? 'My Jobs' : 'Apply Job';

  return (
    <aside className="hidden lg:block lg:col-span-3">
      <div className="sticky top-24 flex flex-col justify-between h-[calc(100vh-7rem)] pr-2">
        <div className="space-y-6">
          {/* USER PROFILE INFO HEADER */}
          <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-full bg-orange-100 border-2 border-white shadow-sm flex items-center justify-center text-primary font-extrabold text-base overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  (firstName || 'W')[0]
                )}
              </div>
              <span className={`w-3 h-3 rounded-full border-2 border-white absolute bottom-0 right-0 ${isHired ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            </div>

            <div className="overflow-hidden">
              <h2 className="font-extrabold text-gray-900 text-sm leading-tight truncate">{fullName}</h2>
              <p className="text-[11px] text-gray-400 font-medium truncate max-w-[150px]">{userContact}</p>
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="space-y-1.5">
            <Link
              to="/workforce/me"
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                location.pathname === '/workforce/me'
                  ? 'bg-white text-gray-900 font-black shadow-2xs border border-gray-200/80'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <LayoutDashboard className={`w-4.5 h-4.5 ${location.pathname === '/workforce/me' ? 'text-primary' : ''}`} />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/workforce/me/jobs"
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                location.pathname.includes('/jobs')
                  ? 'bg-white text-gray-900 font-black shadow-2xs border border-gray-200/80'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <Briefcase className={`w-4.5 h-4.5 ${location.pathname.includes('/jobs') ? 'text-primary' : ''}`} />
              <span>{workLabel}</span>
            </Link>

            <Link
              to="/workforce/me/payments"
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                location.pathname.includes('/payments')
                  ? 'bg-white text-gray-900 font-black shadow-2xs border border-gray-200/80'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <CreditCard className={`w-4.5 h-4.5 ${location.pathname.includes('/payments') ? 'text-emerald-600' : ''}`} />
              <span>My Salary</span>
            </Link>





            <Link
              to="/workforce/me/profile"
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                location.pathname.includes('/profile')
                  ? 'bg-white text-gray-900 font-black shadow-2xs border border-gray-200/80'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <User className={`w-4.5 h-4.5 ${location.pathname.includes('/profile') ? 'text-primary' : ''}`} />
              <span>My Profile</span>
            </Link>
          </nav>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={() => logout()}
          className="flex items-center gap-3.5 px-4 py-2.5 text-gray-400 hover:text-rose-600 font-bold text-xs transition-all text-left border-t border-gray-200/60 pt-4 mb-2"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
