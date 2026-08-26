import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { workforceAPI } from '../api/workforce';
import { useToast } from '../contexts/ToastContext';
import { CreateJobModal } from '../components/modals/CreateJobModal';
import { FundWalletModal } from '../components/modals/FundWalletModal';
import { EmployerHeader } from '../components/employer/EmployerHeader';
import { EmployerSidebar } from '../components/employer/EmployerSidebar';
import { EmployerMobileNavbar } from '../components/employer/EmployerMobileNavbar';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Users,
  CreditCard,
  Briefcase,
  Loader2,
  Inbox,
  Wallet,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [fundWalletOpen, setFundWalletOpen] = useState(false);

  const companyName = user?.companyName || user?.title || `${user?.firstName || ''} ${user?.lastName || ''}'s Org`.trim() || 'Workforce Employer';
  const firstName = user?.firstName || 'Employer';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, workersRes] = await Promise.allSettled([
        workforceAPI.getDashboardStats(),
        workforceAPI.getWorkers(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }
      if (workersRes.status === 'fulfilled' && workersRes.value?.data) {
        setWorkers(workersRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeWorkersCount = workers.filter((w) => w.status === 'active').length;
  const totalPayrollAmount = workers.reduce((sum, w) => sum + (w.paymentAmount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f8] flex items-center justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-gray-800 font-sans p-4 md:p-6 pb-24 lg:pb-6">
      {/* TOP BRAND NAVBAR */}
      <EmployerHeader
        onCreateJob={() => setCreateJobOpen(true)}
      />

      {/* MAIN DASHBOARD GRID CONTAINER */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDEBAR */}
        <EmployerSidebar />

        {/* CENTER CONTENT */}
        <main className="lg:col-span-9 space-y-6">
          {/* PENDING ACTIONS ALERT BANNER */}
          <div className="bg-orange-50/80 rounded-3xl p-4 sm:p-5 border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-primary font-bold flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm leading-tight">Worker Proposals Pending Review</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">You have active job openings with applicant proposals ready for hiring.</p>
              </div>
            </div>

            <Link
              to="/employer/jobs"
              className="px-4 py-2 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <span>Review Proposals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* TOP SUMMARY KPI STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <Wallet className="w-4.5 h-4.5" />
                </div>
                <span>Payroll Wallet Balance</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xl font-black text-emerald-600">
                  ₦ {(stats?.payrollWalletBalance || 2500000).toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Available
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-primary flex items-center justify-center font-bold">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <span>Total Employees Roster</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xl font-black text-gray-900">{workers.length}</span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {activeWorkersCount} Active
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-4.5 h-4.5" />
                </div>
                <span>Monthly Payroll Budget</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xl font-black text-gray-900">
                  ₦ {totalPayrollAmount.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-primary bg-orange-50 px-2 py-0.5 rounded-full">
                  Monthly
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Briefcase className="w-4.5 h-4.5" />
                </div>
                <span>Active Job Postings</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xl font-black text-gray-900">{stats?.activeJobsCount || 0}</span>
                <Link to="/employer/jobs" className="text-xs font-extrabold text-blue-600 hover:underline">
                  View Jobs →
                </Link>
              </div>
            </div>
          </div>

          {/* EMPLOYEES ROSTER TABLE */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900">Company Roster Overview</h3>
                <p className="text-xs text-gray-500 font-medium">Active employees and assigned workforce members.</p>
              </div>

              <Link to="/employer/workforce" className="text-xs font-extrabold text-primary hover:underline">
                Manage All Workers →
              </Link>
            </div>

            {workers.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-primary flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h4 className="font-extrabold text-gray-900 text-sm">No Hired Workers On Roster Yet</h4>
                  <p className="text-xs text-gray-500">Post jobs for applicants to apply, then accept applications to hire workers onto your roster.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                      <th className="py-3 px-3">Employee Name</th>
                      <th className="py-3 px-3">Role / Job Title</th>
                      <th className="py-3 px-3">Contact</th>
                      <th className="py-3 px-3">Monthly Pay</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {workers.map((w) => (
                      <tr key={w._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-gray-900 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-primary font-bold flex items-center justify-center overflow-hidden shrink-0">
                            {w.profileImage ? (
                              <img src={w.profileImage} alt={w.fullName} className="w-full h-full object-cover" />
                            ) : (
                              (w.fullName || 'W')[0]
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900 text-sm">{w.fullName}</div>
                            <div className="text-[10px] text-gray-400 font-normal">{w.location || 'Site Worker'}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-extrabold text-gray-800">{w.role}</td>
                        <td className="py-3.5 px-3 font-semibold text-gray-500">{w.phone || w.email}</td>
                        <td className="py-3.5 px-3 font-bold text-gray-900">
                          ₦ {(w.paymentAmount || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3">
                          <StatusBadge status={w.status || 'active'} />
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
        onSuccess={fetchDashboardData}
      />

      <FundWalletModal
        isOpen={fundWalletOpen}
        onClose={() => setFundWalletOpen(false)}
        onSuccess={(newBal) => {
          setStats((prev: any) => ({ ...prev, payrollWalletBalance: newBal }));
          fetchDashboardData();
        }}
      />
      <EmployerMobileNavbar />
    </div>
  );
};
