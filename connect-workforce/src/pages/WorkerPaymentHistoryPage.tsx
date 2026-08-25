import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workforceAPI } from '../api/workforce';
import { StatusBadge } from '../components/common/StatusBadge';
import { RecordPaymentModal } from '../components/modals/RecordPaymentModal';
import { EmptyState } from '../components/common/EmptyState';
import { EmployerHeader } from '../components/employer/EmployerHeader';
import { EmployerSidebar } from '../components/employer/EmployerSidebar';
import { useToast } from '../contexts/ToastContext';
import {
  CreditCard,
  Loader2,
  Lock,
  Unlock,
  ArrowLeft,
  CheckCircle2,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export const WorkerPaymentHistoryPage: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [worker, setWorker] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (workerId) {
      fetchWorkerHistory();
    }
  }, [workerId]);

  const fetchWorkerHistory = async () => {
    setLoading(true);
    try {
      const [workerRes, paymentsRes] = await Promise.allSettled([
        workforceAPI.getWorkerById(workerId!),
        workforceAPI.getPayments(),
      ]);

      if (workerRes.status === 'fulfilled' && workerRes.value?.data) {
        setWorker(workerRes.value.data);
      }
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.data) {
        const allPayments: any[] = paymentsRes.value.data;
        const workerPayments = allPayments.filter(
          (p) =>
            String(p.workforceMemberId?._id || p.workforceMemberId) === String(workerId) ||
            String(p.workerId) === String(workerId)
        );
        setPayments(workerPayments);
      }
    } catch (err) {
      console.error('Failed to fetch worker payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePayoutFreeze = async () => {
    if (!worker) return;
    const currentStatus = worker.payoutStatus;
    const newStatus = currentStatus === 'frozen' || currentStatus === 'paused' ? 'active' : 'frozen';
    setActionLoading(true);
    try {
      await workforceAPI.updateWorkerPayoutStatus(worker._id, newStatus);
      showToast(
        newStatus === 'frozen'
          ? `Payouts paused for ${worker.fullName}.`
          : `Payouts active for ${worker.fullName}.`,
        newStatus === 'frozen' ? 'info' : 'success'
      );
      setWorker((prev: any) => ({ ...prev, payoutStatus: newStatus }));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update payout status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const totalWorkerPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const isFrozen = worker?.payoutStatus === 'frozen' || worker?.payoutStatus === 'paused';

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
          {/* MINIMALIST BACK LINK */}
          <button
            onClick={() => navigate('/employer/payments')}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Payroll</span>
          </button>

          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-xs font-semibold">Loading worker details...</p>
            </div>
          ) : !worker ? (
            <EmptyState
              icon={CreditCard}
              title="Worker not found"
              description="The requested employee record could not be found."
            />
          ) : (
            <>
              {/* MINIMALIST WORKER HEADER CARD */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-orange-100 text-primary font-bold flex items-center justify-center text-xl overflow-hidden shrink-0">
                      {worker.profileImage ? (
                        <img src={worker.profileImage} alt={worker.fullName} className="w-full h-full object-cover" />
                      ) : (
                        (worker.fullName || 'W')[0]
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl font-black text-gray-900 leading-tight">{worker.fullName}</h1>
                        {isFrozen ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold text-[11px] inline-flex items-center gap-1 border border-rose-200">
                            <Lock className="w-3 h-3" /> Frozen
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[11px] inline-flex items-center gap-1 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-gray-500">{worker.role}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 font-medium pt-0.5">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {worker.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {worker.phone}</span>
                        {worker.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {worker.location}</span>}
                      </div>
                    </div>
                  </div>

                  {/* MINIMALIST ACTION CONTROLS */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={handleTogglePayoutFreeze}
                      disabled={actionLoading}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all inline-flex items-center gap-1.5 disabled:opacity-50 ${
                        isFrozen
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {actionLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isFrozen ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unfreeze</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Freeze</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (isFrozen) {
                          showToast(`${worker.fullName}'s payouts are frozen. Unfreeze first.`, 'error');
                          return;
                        }
                        setPaymentModalOpen(true);
                      }}
                      disabled={isFrozen}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Disburse</span>
                    </button>
                  </div>
                </div>

                {/* MINIMALIST STAT CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-100 space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Lifetime Paid</span>
                    <div className="text-xl font-black text-gray-900">
                      ₦ {totalWorkerPaid.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-100 space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Salary Rate</span>
                    <div className="text-xl font-black text-emerald-600">
                      ₦ {(worker.paymentAmount || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-100 space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Transactions</span>
                    <div className="text-xl font-black text-gray-900">
                      {payments.length} Payouts
                    </div>
                  </div>
                </div>
              </div>

              {/* MINIMALIST PAYOUT HISTORY TABLE */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-extrabold text-base text-gray-900">Payout History</h3>
                  <p className="text-xs text-gray-500 font-medium">Recorded payment settlements for {worker.fullName}.</p>
                </div>

                {payments.length === 0 ? (
                  <EmptyState
                    icon={CreditCard}
                    title="No payment history"
                    description={`No salary disbursements recorded for ${worker.fullName}.`}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                          <th className="py-3 px-3">Date</th>
                          <th className="py-3 px-3">Description</th>
                          <th className="py-3 px-3">Reference Code</th>
                          <th className="py-3 px-3">Amount</th>
                          <th className="py-3 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-700">
                        {payments.map((p) => (
                          <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3.5 px-3 text-gray-500 font-medium">
                              {new Date(p.paymentDate || p.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-3 font-bold text-gray-900">{p.description || 'Payroll Settlement'}</td>
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
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* DISBURSE PAYOUT MODAL */}
      {worker && (
        <RecordPaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          workforceMemberId={worker._id}
          workerName={worker.fullName}
          defaultAmount={worker.paymentAmount || 150000}
          onSuccess={fetchWorkerHistory}
        />
      )}
    </div>
  );
};
