import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarCheck,
  CreditCard,
  FileText,
  Globe,
  MessageSquare,
  Settings,
  ArrowUpRight,
  ShieldCheck,
  Home,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user } = useAuth();
  const isWorker = user?.userType === 'freelancer';

  const employerNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/workforce', label: 'My Workers', icon: Users },
    { to: '/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/attendance', label: 'Who is Working?', icon: CalendarCheck },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/contracts', label: 'Contracts', icon: FileText },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const workerNav = [
    { to: '/workforce/me', label: 'My Work', icon: Home },
    { to: '/workforce/me/attendance', label: 'Attendance Log', icon: CalendarCheck },
    { to: '/workforce/me/payments', label: 'My Earnings', icon: CreditCard },
    { to: '/workforce/me/contracts', label: 'My Contracts', icon: FileText },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  const navItems = isWorker ? workerNav : employerNav;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-primary/25">
            W
          </div>
          <div>
            <div className="font-black text-gray-900 text-lg tracking-tight leading-none flex items-center gap-1">
              Connecta <span className="text-primary font-bold text-xs uppercase px-1.5 py-0.5 bg-primary/10 rounded">Workforce</span>
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-0.5">
              {isWorker ? 'Worker Hub' : 'Team & Payroll Hub'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {isWorker ? 'My Workforce Space' : 'Management'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20 font-bold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Connecta Marketplace External Link */}
        <div className="pt-4 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Ecosystem
        </div>
        <a
          href="https://myconnecta.ng"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm text-gray-600 hover:bg-orange-50 hover:text-primary transition-all group"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-primary" />
            <span>Connecta Marketplace</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
        </a>
      </nav>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>Flutterwave Payout Ready</span>
        </div>
      </div>
    </aside>
  );
};
