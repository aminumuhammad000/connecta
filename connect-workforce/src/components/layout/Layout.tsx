import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { AddWorkerModal } from '../modals/AddWorkerModal';
import { CreateJobModal } from '../modals/CreateJobModal';
import { X } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addWorkerOpen, setAddWorkerOpen] = useState(false);
  const [createJobOpen, setCreateJobOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64 max-w-xs bg-white h-full z-10 shadow-2xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Navbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenAddWorker={() => setAddWorkerOpen(true)}
          onOpenCreateJob={() => setCreateJobOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global Quick Action Modals */}
      <AddWorkerModal isOpen={addWorkerOpen} onClose={() => setAddWorkerOpen(false)} />
      <CreateJobModal isOpen={createJobOpen} onClose={() => setCreateJobOpen(false)} />
    </div>
  );
};
