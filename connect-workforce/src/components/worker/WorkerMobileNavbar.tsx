import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  CreditCard,
  User
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface WorkerMobileNavbarProps {
  isHired?: boolean;
}

export const WorkerMobileNavbar: React.FC<WorkerMobileNavbarProps> = ({ isHired }) => {
  const location = useLocation();
  const workLabel = isHired ? 'My Work' : 'Apply Job';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-4 py-2.5 flex items-center justify-around shadow-2xl">
      <Link
        to="/workforce/me"
        className={`flex flex-col items-center gap-1 text-[11px] font-extrabold transition-all ${
          location.pathname === '/workforce/me' ? 'text-primary' : 'text-gray-400 hover:text-gray-800'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>

      <Link
        to="/workforce/me/jobs"
        className={`flex flex-col items-center gap-1 text-[11px] font-extrabold transition-all ${
          location.pathname.startsWith('/workforce/me/jobs') ? 'text-primary' : 'text-gray-400 hover:text-gray-800'
        }`}
      >
        <Briefcase className="w-5 h-5" />
        <span>{workLabel}</span>
      </Link>

      <Link
        to="/workforce/me/payments"
        className={`flex flex-col items-center gap-1 text-[11px] font-extrabold transition-all ${
          location.pathname.startsWith('/workforce/me/payments') ? 'text-primary' : 'text-gray-400 hover:text-gray-800'
        }`}
      >
        <CreditCard className="w-5 h-5" />
        <span>My Salary</span>
      </Link>

      <Link
        to="/workforce/me/profile"
        className={`flex flex-col items-center gap-1 text-[11px] font-extrabold transition-all ${
          location.pathname.startsWith('/workforce/me/profile') ? 'text-primary' : 'text-gray-400 hover:text-gray-800'
        }`}
      >
        <User className="w-5 h-5" />
        <span>Profile</span>
      </Link>
    </nav>
  );
};
