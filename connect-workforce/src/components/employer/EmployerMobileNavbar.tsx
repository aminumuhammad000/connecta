import React from 'react';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  CreditCard,
  User
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const EmployerMobileNavbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-4 py-2.5 flex items-center justify-around shadow-2xl">
      <Link
        to="/employer/dashboard"
        className={`flex flex-col items-center gap-1 text-[11px] font-extrabold transition-all ${
          location.pathname === '/employer/dashboard' || location.pathname === '/dashboard'
            ? 'text-primary'
            : 'text-gray-400 hover:text-gray-800'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>

      <Link
        to="/employer/workforce"
        className={`flex flex-col items-center gap-1 text-[11px] font-extrabold transition-all ${
          location.pathname === '/employer/workforce' || location.pathname === '/workforce'
            ? 'text-primary'
            : 'text-gray-400 hover:text-gray-800'
        }`}
      >
        <Users className="w-5 h-5" />
        <span>Employees</span>
      </Link>

      <Link
        to="/employer/jobs"
        className={`flex flex-col items-center gap-1 text-[11px] font-extrabold transition-all ${
          location.pathname === '/employer/jobs' || location.pathname === '/jobs'
            ? 'text-primary'
            : 'text-gray-400 hover:text-gray-800'
        }`}
      >
        <BarChart3 className="w-5 h-5" />
        <span>Jobs</span>
      </Link>

      <Link
        to="/employer/payments"
        className={`flex flex-col items-center gap-1 text-[11px] font-extrabold transition-all ${
          location.pathname === '/employer/payments' || location.pathname === '/payments'
            ? 'text-emerald-600 font-black'
            : 'text-gray-400 hover:text-gray-800'
        }`}
      >
        <CreditCard className="w-5 h-5" />
        <span>Payroll</span>
      </Link>

      <Link
        to="/employer/settings"
        className={`flex flex-col items-center gap-1 text-[11px] font-extrabold transition-all ${
          location.pathname === '/employer/settings'
            ? 'text-primary'
            : 'text-gray-400 hover:text-gray-800'
        }`}
      >
        <User className="w-5 h-5" />
        <span>Profile</span>
      </Link>
    </nav>
  );
};
