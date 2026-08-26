import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { workforceAPI } from '../../api/workforce';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SubmitTimesheetModal } from '../../components/modals/SubmitTimesheetModal';
import { PayslipModal } from '../../components/modals/PayslipModal';
import {
  LayoutDashboard,
  Briefcase,
  CreditCard,
  LogOut,
  Loader2,
  User,
  Inbox,
  ArrowUpRight,
  ShieldCheck,
  Download,
  ClockPlus,
  Eye
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { WorkerHeader } from '../../components/worker/WorkerHeader';
import { WorkerSidebar } from '../../components/worker/WorkerSidebar';
import { WorkerMobileNavbar } from '../../components/worker/WorkerMobileNavbar';

export const WorkerPaymentsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [selectedPayslipPayment, setSelectedPayslipPayment] = useState<any>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await workforceAPI.getWorkerMe();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch worker payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayslip = (p: any) => {
    const payslipContent = `
===================================================
              CONNECTA WORKFORCE PAYSLIP           
===================================================
Disbursement Date: ${new Date(p.paymentDate || p.createdAt).toLocaleDateString()}
Worker Name:       ${fullName}
Employer Company:  ${employerName || 'Workforce Employer'}
Role / Title:      ${member?.role || 'Staff Member'}
Reference Code:    ${p.reference || `WF-${p._id}`}
---------------------------------------------------
PAYMENT BREAKDOWN:
Base Salary Amount: ₦ ${(p.amount || 0).toLocaleString()}
Status:             ${(p.status || 'completed').toUpperCase()}
Disbursement Mode:  Direct Bank Payout via Flutterwave
---------------------------------------------------
This is a computer-generated proof of payment.
Connecta Workforce Payout Engine.
===================================================
    `.trim();

    const blob = new Blob([payslipContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip-${p.reference || p._id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const member = data?.member;
  const employer = data?.employer;
  const payments = data?.paymentsHistory || [];
  const contracts = data?.contracts || [];

  const firstName = user?.firstName || 'Worker';
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Worker';
  const employerName = employer
    ? (employer.companyName || employer.title || `${employer.firstName || ''} ${employer.lastName || ''}`.trim())
    : '';

  const userContact = (user?.email && !user.email.includes('@worker.myconnecta'))
    ? user.email
    : ((user as any)?.phoneNumber || (user as any)?.phone || (user?.email ? user.email.split('@')[0] : ''));

  const isHired = (member?.status === 'active' && !!employer) || contracts.length > 0;
  const workLabel = isHired ? 'My Work' : 'Apply Job';
  const monthlyEarnings = isHired ? (data?.monthlyEarnings || member?.paymentAmount || 150000) : 0;
  const totalReceived = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-gray-800 font-sans p-4 md:p-6 pb-24 lg:pb-6">
      {/* TOP BRAND NAVBAR */}
      <WorkerHeader />

      {/* MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* STICKY SIDEBAR */}
        <WorkerSidebar isHired={isHired} />

        {/* MAIN CENTER PANEL */}
        <main className="lg:col-span-9 space-y-6">
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Monthly Salary Commitment</span>
              <div className="text-2xl font-black text-emerald-600">
                ₦ {monthlyEarnings.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Disbursed Earnings</span>
              <div className="text-2xl font-black text-gray-900">
                ₦ {totalReceived.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Salary Payout History</h1>
                <p className="text-xs text-gray-400 font-medium">Recorded salary disbursements and transaction references.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowTimesheetModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-50 hover:bg-orange-100 text-primary font-extrabold text-xs border border-orange-200 transition-all shadow-2xs"
                >
                  <ClockPlus className="w-4 h-4" />
                  <span>Submit Timesheet / OT</span>
                </button>

                <Link
                  to="/workforce/me/wallet"
                  className="text-xs font-extrabold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <span>Bank Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs font-semibold">Loading payout records...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <Inbox className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <h3 className="font-extrabold text-sm text-gray-900">No Salary Payouts Yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">When your employer processes monthly or daily payroll, disbursements will reflect here instantly.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase font-extrabold text-[10px] tracking-wider">
                      <th className="pb-3 px-3">Date</th>
                      <th className="pb-3 px-3">Description</th>
                      <th className="pb-3 px-3">Reference Code</th>
                      <th className="pb-3 px-3">Amount (₦)</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3 text-right">Payslip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((p: any) => (
                      <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-gray-500">
                          {new Date(p.paymentDate || p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3 font-extrabold text-gray-900">
                          {p.description || 'Monthly Payroll Disbursement'}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-gray-400">
                          {p.reference || `WF-${p._id?.substring(0, 8)}`}
                        </td>
                        <td className="py-3.5 px-3 font-black text-emerald-600 text-sm">
                          ₦ {(p.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3">
                          <StatusBadge status={p.status || 'completed'} />
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedPayslipPayment(p)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-primary font-extrabold text-[11px] transition-all border border-orange-200"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Payslip</span>
                            </button>

                            <button
                              onClick={() => handleDownloadPayslip(p)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] transition-all"
                              title="Download TXT Proof"
                            >
                              <Download className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <SubmitTimesheetModal
            isOpen={showTimesheetModal}
            onClose={() => setShowTimesheetModal(false)}
            onSuccess={fetchPayments}
          />

          <PayslipModal
            isOpen={!!selectedPayslipPayment}
            onClose={() => setSelectedPayslipPayment(null)}
            payment={selectedPayslipPayment}
            workerName={fullName}
            employerName={employerName}
            workerRole={member?.role}
          />
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <WorkerMobileNavbar isHired={isHired} />
    </div>
  );
};
