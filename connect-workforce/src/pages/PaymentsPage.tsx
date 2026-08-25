import React, { useEffect, useState } from 'react';
import { workforceAPI } from '../api/workforce';
import { StatusBadge } from '../components/common/StatusBadge';
import { RecordPaymentModal } from '../components/modals/RecordPaymentModal';
import { FundWalletModal } from '../components/modals/FundWalletModal';
import { EmptyState } from '../components/common/EmptyState';
import { EmployerHeader } from '../components/employer/EmployerHeader';
import { EmployerSidebar } from '../components/employer/EmployerSidebar';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Loader2,
  Lock,
  Search,
  CheckCircle2,
  Users,
  Download,
  PlayCircle,
  ArrowRight,
  Wallet
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [fundWalletOpen, setFundWalletOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roster_controls' | 'history'>('roster_controls');
  const [searchQuery, setSearchQuery] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);

  // Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const [payrollWalletBalance, setPayrollWalletBalance] = useState<number>(2500000);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, workersRes, statsRes] = await Promise.allSettled([
        workforceAPI.getPayments(),
        workforceAPI.getWorkers(),
        workforceAPI.getDashboardStats(),
      ]);

      if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.data) {
        setPayments(paymentsRes.value.data);
      }
      if (workersRes.status === 'fulfilled' && workersRes.value?.data) {
        setWorkers(workersRes.value.data);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.payrollWalletBalance !== undefined) {
        setPayrollWalletBalance(statsRes.value.data.payrollWalletBalance);
      }
    } catch (err) {
      console.error('Failed to fetch payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBatchPayroll = async () => {
    const eligibleWorkers = workers.filter(
      (w) => (w.payoutStatus !== 'frozen' && w.payoutStatus !== 'paused') && (w.paymentAmount || 0) > 0
    );

    if (eligibleWorkers.length === 0) {
      showToast('No active workers available for batch disbursement.', 'error');
      return;
    }

    const totalBatchAmount = eligibleWorkers.reduce((sum, w) => sum + (w.paymentAmount || 0), 0);

    if (
      !window.confirm(
        `Run monthly payroll for ${eligibleWorkers.length} workers?\nTotal: NGN ${totalBatchAmount.toLocaleString()}`
      )
    ) {
      return;
    }

    setBatchLoading(true);
    let successCount = 0;

    for (const w of eligibleWorkers) {
      try {
        await workforceAPI.processPayment({
          workforceMemberId: w._id,
          amount: w.paymentAmount || 150000,
          paymentType: w.paymentType || 'monthly',
          description: `Batch Payroll Settlement - ${w.fullName}`,
          currency: w.currency || 'NGN',
        });
        successCount++;
      } catch (err) {
        console.error(`Batch payout error for ${w.fullName}:`, err);
      }
    }

    setBatchLoading(false);
    showToast(`Processed monthly payroll for ${successCount} workers.`, 'success');
    fetchPayrollData();
  };

  const exportPayrollCSV = () => {
    if (payments.length === 0) {
      showToast('No payout logs available to export.', 'info');
      return;
    }

    const headers = ['Date', 'Employee Name', 'Description', 'Reference Code', 'Amount (NGN)', 'Status'];
    const rows = payments.map((p) => [
      new Date(p.paymentDate || p.createdAt).toLocaleDateString(),
      `"${p.workforceMemberId?.fullName || 'Worker'}"`,
      `"${p.description || 'Payroll Settlement'}"`,
      `"${p.reference || 'N/A'}"`,
      p.amount || 0,
      p.status || 'completed',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Connecta_Payroll_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Payroll CSV Report.', 'success');
  };

  const totalPayrollSettled = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const monthlySalaryCommitment = workers.reduce((acc, w) => acc + (w.paymentAmount || 0), 0);
  const frozenWorkersCount = workers.filter((w) => w.payoutStatus === 'frozen' || w.payoutStatus === 'paused').length;

  const filteredWorkers = workers.filter((w) =>
    (w.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.phone || '').includes(searchQuery)
  );

  const filteredPayments = payments.filter((p) =>
    (p.workforceMemberId?.fullName || p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.reference || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-gray-800 font-sans p-4 md:p-6">
      {/* TOP BRAND NAVBAR */}
      <EmployerHeader />

      {/* MAIN CONTENT GRID CONTAINER */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDEBAR */}
        <EmployerSidebar />

        {/* CENTER CONTENT */}
        <main className="lg:col-span-9 space-y-6">
          {/* MINIMALIST SUMMARY STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Payroll Balance</span>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xl font-black text-emerald-600">
                  ₦ {payrollWalletBalance.toLocaleString()}
                </span>
                <button
                  onClick={() => setFundWalletOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-all shrink-0"
                >
                  + Fund
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Settled</span>
              <div className="text-xl font-black text-gray-900 pt-0.5">
                ₦ {totalPayrollSettled.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Monthly Commitment</span>
              <div className="text-xl font-black text-purple-600 pt-0.5">
                ₦ {monthlySalaryCommitment.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">On-Hold Payouts</span>
              <div className="text-xl font-black text-rose-600 pt-0.5">
                {frozenWorkersCount} Workers
              </div>
            </div>
          </div>

          {/* MAIN PAYROLL PANEL */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Payroll</h1>
                <p className="text-xs text-gray-400 font-medium">Worker payments & payout logs.</p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-2">
                <button
                  onClick={exportPayrollCSV}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs transition-all"
                >
                  <Download className="w-4 h-4 text-gray-500" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleRunBatchPayroll}
                  disabled={batchLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
                >
                  {batchLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlayCircle className="w-4 h-4" />
                  )}
                  <span>Run Batch Payroll</span>
                </button>
              </div>
            </div>

            {/* TAB SELECTOR & SEARCH BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-gray-100/70 p-1 rounded-2xl w-fit">
                <button
                  onClick={() => setActiveTab('roster_controls')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'roster_controls' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Users className="w-4 h-4 text-primary" />
                  <span>Worker Payroll ({workers.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'history' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Payout Logs ({payments.length})</span>
                </button>
              </div>

              {/* SEARCH INPUT */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search employee or ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-1.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs font-semibold">Loading payroll data...</p>
              </div>
            ) : activeTab === 'roster_controls' ? (
              /* TAB 1: MINIMALIST WORKER PAYROLL TABLE */
              filteredWorkers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No workers found"
                  description="Hire workers to disburse salary payments."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                        <th className="py-3 px-3">Employee</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Salary</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                      {filteredWorkers.map((w) => {
                        const isFrozen = w.payoutStatus === 'frozen' || w.payoutStatus === 'paused';

                        return (
                          <tr key={w._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3.5 px-3 font-bold text-gray-900">
                              <Link to={`/employer/payments/worker/${w._id}`} className="flex items-center gap-3 hover:text-primary transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-orange-100 text-primary font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                                  {w.profileImage ? (
                                    <img src={w.profileImage} alt={w.fullName} className="w-full h-full object-cover" />
                                  ) : (
                                    (w.fullName || 'W')[0]
                                  )}
                                </div>
                                <div>
                                  <div className="font-extrabold text-gray-900 text-sm group-hover:text-primary transition-colors">{w.fullName}</div>
                                  <div className="text-[11px] text-gray-400 font-normal">{w.phone || w.email}</div>
                                </div>
                              </Link>
                            </td>

                            <td className="py-3.5 px-3 font-bold text-gray-700">{w.role}</td>

                            <td className="py-3.5 px-3 font-black text-gray-900 text-sm">
                              ₦ {(w.paymentAmount || 0).toLocaleString()}
                            </td>

                            <td className="py-3.5 px-3">
                              {isFrozen ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold text-[11px] inline-flex items-center gap-1 border border-rose-200">
                                  <Lock className="w-3 h-3" /> Frozen
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[11px] inline-flex items-center gap-1 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" /> Active
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-3 text-right">
                              <Link
                                to={`/employer/payments/worker/${w._id}`}
                                className="px-3 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200 transition-all inline-flex items-center gap-1"
                              >
                                <span>Details</span>
                                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* TAB 2: MINIMALIST PAYOUT LOGS TABLE */
              filteredPayments.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="No payout history"
                  description="Disburse salary payments to see logs here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Employee</th>
                        <th className="py-3 px-3">Description</th>
                        <th className="py-3 px-3">Ref</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                      {filteredPayments.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-3 text-gray-500 font-medium">
                            {new Date(p.paymentDate || p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-3 font-bold text-gray-900">
                            {p.workforceMemberId?.fullName || 'Worker'}
                          </td>
                          <td className="py-3.5 px-3 text-gray-600 font-medium">{p.description || 'Payroll Settlement'}</td>
                          <td className="py-3.5 px-3 font-mono text-[11px] text-gray-400">{p.reference || 'N/A'}</td>
                          <td className="py-3.5 px-3 font-black text-gray-900 text-sm">
                            ₦ {(p.amount || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-3">
                            <StatusBadge status={p.status || 'completed'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </main>
      </div>

      {/* DISBURSE PAYOUT MODAL */}
      {selectedWorker && (
        <RecordPaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedWorker(null);
          }}
          workforceMemberId={selectedWorker._id}
          workerName={selectedWorker.fullName}
          defaultAmount={selectedWorker.paymentAmount || 150000}
          onSuccess={fetchPayrollData}
        />
      )}

      {/* FUND PAYROLL WALLET MODAL */}
      <FundWalletModal
        isOpen={fundWalletOpen}
        onClose={() => setFundWalletOpen(false)}
        onSuccess={(newBal) => {
          setPayrollWalletBalance(newBal);
          fetchPayrollData();
        }}
      />
    </div>
  );
};
