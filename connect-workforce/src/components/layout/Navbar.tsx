import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, Plus, UserCheck, LogOut, Building2, Globe } from 'lucide-react';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onOpenAddWorker: () => void;
  onOpenCreateJob: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, onOpenAddWorker, onOpenCreateJob }) => {
  const { user, logout } = useAuth();
  const companyName = user?.companyName || user?.title || `${user?.firstName || ''} ${user?.lastName || ''}'s Org`.trim();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-sm border border-gray-200">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">{companyName}</h1>
            <span className="text-[11px] text-gray-500 font-medium">Workforce Portal</span>
          </div>
        </div>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenAddWorker}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm"
        >
          <UserCheck className="w-4 h-4 text-primary" />
          <span>Add Worker</span>
        </button>

        <button
          onClick={onOpenCreateJob}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Job</span>
        </button>

        {/* Back to Connecta main app */}
        <a
          href="https://myconnecta.ng"
          target="_blank"
          rel="noreferrer"
          className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
          title="Back to main Connecta web application"
        >
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span>Back to Connecta</span>
        </a>

        {/* Logout User */}
        <button
          onClick={logout}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ml-1"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
