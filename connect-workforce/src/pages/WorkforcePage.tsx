import React, { useEffect, useState } from 'react';
import { workforceAPI } from '../api/workforce';
import { StatusBadge } from '../components/common/StatusBadge';
import { RecordPaymentModal } from '../components/modals/RecordPaymentModal';
import { CreateContractModal } from '../components/modals/CreateContractModal';
import { CreateJobModal } from '../components/modals/CreateJobModal';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { EmployerHeader } from '../components/employer/EmployerHeader';
import { EmployerSidebar } from '../components/employer/EmployerSidebar';
import { EmployerMobileNavbar } from '../components/employer/EmployerMobileNavbar';
import {
  Users,
  Search,
  FileText,
  CreditCard,
  Trash2,
  Loader2,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const WorkforcePage: React.FC = () => {
  const { showToast } = useToast();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [statusTab, setStatusTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);

  const [selectedWorker, setSelectedWorker] = useState<any>(null);

  useEffect(() => {
    fetchWorkers();
  }, [statusTab]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await workforceAPI.getWorkers({
        status: statusTab !== 'all' ? statusTab : undefined,
        search: searchQuery || undefined,
      });
      if (res?.data) {
        setWorkers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorker = async (workerId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your roster?`)) return;
    try {
      const res = await workforceAPI.deleteWorker(workerId);
      showToast(res.message || 'Worker removed from roster', 'success');
      fetchWorkers();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to remove worker', 'error');
    }
  };

  const activeCount = workers.filter(w => w.status === 'active').length;

  const filteredWorkers = workers.filter(w =>
    (w.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.phone || w.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-gray-800 font-sans p-4 md:p-6 pb-24 lg:pb-6">
      {/* TOP BRAND NAVBAR */}
      <EmployerHeader onCreateJob={() => setCreateJobOpen(true)} />

      {/* MAIN CONTENT GRID CONTAINER */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDEBAR */}
        <EmployerSidebar />

        {/* CENTER WORKFORCE CONTENT */}
        <main className="lg:col-span-9 space-y-6">
          {/* MINIMALIST SUMMARY STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Employees</span>
              <div className="text-2xl font-black text-gray-900">{workers.length} Workers</div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Roster</span>
              <div className="text-2xl font-black text-emerald-600">{activeCount} Active</div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending / Inactive</span>
              <div className="text-2xl font-black text-gray-400">{workers.length - activeCount} Pending</div>
            </div>
          </div>

          {/* MAIN WORKFORCE PANEL */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Employees & Roster</h1>
                <p className="text-xs text-gray-400 font-medium">Manage hired employees, contractors, and site staff.</p>
              </div>

              <button
                onClick={() => setCreateJobOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-xs transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create Job to Hire</span>
              </button>
            </div>

            {/* SEARCH BAR & STATUS FILTER */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by worker, role, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-1.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-100 w-full sm:w-auto">
                {['all', 'active', 'inactive'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusTab(tab)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                      statusTab === tab
                        ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                        : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Roster Table */}
            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs font-semibold">Loading workforce roster...</p>
              </div>
            ) : filteredWorkers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No hired workers on roster"
                description="Post jobs for applicants to apply. Once accepted, hired workers automatically appear on your roster."
                actionText="Create Job"
                onAction={() => setCreateJobOpen(true)}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                      <th className="py-3 px-3">Employee Name</th>
                      <th className="py-3 px-3">Job Role</th>
                      <th className="py-3 px-3">Contact</th>
                      <th className="py-3 px-3">Salary Rate</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {filteredWorkers.map((w) => (
                      <tr key={w._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-gray-900">
                          <Link to={`/employer/workforce/${w._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-primary font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                              {w.profileImage ? (
                                <img src={w.profileImage} alt={w.fullName} className="w-full h-full object-cover" />
                              ) : (
                                (w.fullName || 'W')[0]
                              )}
                            </div>
                            <div>
                              <div className="font-extrabold text-gray-900 text-sm group-hover:text-primary transition-colors">{w.fullName}</div>
                              <div className="text-[11px] text-gray-400 font-normal">{w.location || 'Site Specialist'}</div>
                            </div>
                          </Link>
                        </td>

                        <td className="py-3.5 px-3 font-bold text-gray-800">{w.role}</td>

                        <td className="py-3.5 px-3 font-medium text-gray-500">{w.phone || w.email}</td>

                        <td className="py-3.5 px-3">
                          <span className="font-black text-gray-900 text-sm">
                            ₦ {(w.paymentAmount || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400 font-normal block capitalize">/ {w.paymentType || 'monthly'}</span>
                        </td>

                        <td className="py-3.5 px-3">
                          <StatusBadge status={w.status || 'active'} />
                        </td>

                        <td className="py-3.5 px-3 text-right space-x-1.5">
                          {/* PAYROLL HISTORY LINK */}
                          <Link
                            to={`/employer/payments/worker/${w._id}`}
                            className="px-2.5 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200 transition-all inline-flex items-center gap-1"
                            title="Payroll & History"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-primary" />
                            <span>Payroll</span>
                          </Link>

                          {/* CONTRACT MODAL */}
                          <button
                            onClick={() => {
                              setSelectedWorker(w);
                              setContractModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-all inline-flex items-center"
                            title="Issue Contract"
                          >
                            <FileText className="w-3.5 h-3.5 text-gray-500" />
                          </button>

                          {/* REMOVE WORKER */}
                          <button
                            onClick={() => handleDeleteWorker(w._id, w.fullName)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all inline-flex items-center"
                            title="Remove Worker"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <CreateJobModal
        isOpen={createJobOpen}
        onClose={() => setCreateJobOpen(false)}
        onSuccess={fetchWorkers}
      />
      {selectedWorker && (
        <>
          <RecordPaymentModal
            isOpen={paymentModalOpen}
            onClose={() => {
              setPaymentModalOpen(false);
              setSelectedWorker(null);
            }}
            workforceMemberId={selectedWorker._id}
            workerName={selectedWorker.fullName}
            defaultAmount={selectedWorker.paymentAmount || 150000}
            onSuccess={fetchWorkers}
          />
          <CreateContractModal
            isOpen={contractModalOpen}
            onClose={() => {
              setContractModalOpen(false);
              setSelectedWorker(null);
            }}
            workforceMemberId={selectedWorker._id}
            workerName={selectedWorker.fullName}
            onSuccess={fetchWorkers}
          />
        </>
      )}
      <EmployerMobileNavbar />
    </div>
  );
};
