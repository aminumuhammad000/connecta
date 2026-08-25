import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workforceAPI } from '../api/workforce';
import { StatusBadge } from '../components/common/StatusBadge';
import { RecordPaymentModal } from '../components/modals/RecordPaymentModal';
import { CreateContractModal } from '../components/modals/CreateContractModal';
import { EmployerHeader } from '../components/employer/EmployerHeader';
import { EmployerSidebar } from '../components/employer/EmployerSidebar';
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  CalendarCheck,
  CreditCard,
  FileText,
  Loader2,
  CheckCircle2,
  Clock3
} from 'lucide-react';

export const WorkerProfilePage: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'payments' | 'contracts'>('overview');

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);

  useEffect(() => {
    if (workerId) fetchWorkerProfile();
  }, [workerId]);

  const fetchWorkerProfile = async () => {
    setLoading(true);
    try {
      const res = await workforceAPI.getWorkerById(workerId!);
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load worker profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const worker = data?.worker;
  const contracts = data?.contracts || [];
  const attendance = data?.attendance || [];
  const payments = data?.payments || [];

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
          <Link to="/employer/workforce" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Employees Roster</span>
          </Link>

          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-xs font-semibold">Loading worker profile...</p>
            </div>
          ) : !worker ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-100">
              <p className="text-sm font-bold">Worker record not found.</p>
            </div>
          ) : (
            <>
              {/* Header Profile Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-orange-100 text-primary font-black text-xl flex items-center justify-center overflow-hidden shrink-0">
                    {worker?.profileImage ? (
                      <img src={worker.profileImage} alt={worker.fullName} className="w-full h-full object-cover" />
                    ) : (
                      (worker?.fullName || 'W')[0]
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">{worker?.fullName}</h1>
                      <StatusBadge status={worker?.status || 'active'} />
                    </div>
                    <div className="text-xs font-medium text-gray-400 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 font-bold text-gray-700"><Briefcase className="w-3.5 h-3.5 text-primary" /> {worker?.role}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-gray-400" /> {worker?.email}</span>
                      {worker?.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-gray-400" /> {worker?.phone}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setContractModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 font-bold text-xs text-gray-700 border border-gray-200 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-gray-500" />
                    <span>Issue Contract</span>
                  </button>

                  <button
                    onClick={() => setPaymentModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-xs transition-all"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Worker</span>
                  </button>
                </div>
              </div>

              {/* Tabs Bar */}
              <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs space-y-4">
                <div className="flex border-b border-gray-100 font-bold text-xs gap-6">
                  {['overview', 'attendance', 'payments', 'contracts'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`pb-3 capitalize transition-all border-b-2 ${
                        activeTab === tab
                          ? 'border-primary text-primary font-extrabold'
                          : 'border-transparent text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-gray-50/60 rounded-2xl p-5 border border-gray-100 space-y-3">
                      <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Employment Information</h3>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Employment Type</span>
                          <span className="font-bold text-gray-900 capitalize">{worker?.employmentType?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Arrangement</span>
                          <span className="font-bold text-gray-900 capitalize">{worker?.paymentType || 'monthly'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Salary Rate</span>
                          <span className="font-black text-emerald-600">₦ {(worker?.paymentAmount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Start Date</span>
                          <span className="font-semibold text-gray-700">{worker?.startDate ? new Date(worker.startDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/60 rounded-2xl p-5 border border-gray-100 space-y-3">
                      <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Location & Emergency Contact</h3>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Site Location</span>
                          <span className="font-bold text-gray-900">{worker?.location || 'Lagos Site'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Emergency Name</span>
                          <span className="font-semibold text-gray-700">{worker?.emergencyContact?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Emergency Phone</span>
                          <span className="font-semibold text-gray-700">{worker?.emergencyContact?.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div className="space-y-3 pt-2">
                    <h3 className="font-extrabold text-sm text-gray-900">Attendance Log</h3>
                    {attendance.length === 0 ? (
                      <p className="text-xs text-gray-400 font-medium">No check-in records recorded for this worker yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-medium">
                          <thead>
                            <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3">Check-In Time</th>
                              <th className="py-2.5 px-3">Check-Out Time</th>
                              <th className="py-2.5 px-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {attendance.map((a: any) => (
                              <tr key={a._id}>
                                <td className="py-3 px-3 font-semibold text-gray-800">{new Date(a.date).toLocaleDateString()}</td>
                                <td className="py-3 px-3 font-mono text-gray-600">{a.checkIn || '--'}</td>
                                <td className="py-3 px-3 font-mono text-gray-600">{a.checkOut || '--'}</td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={a.status || 'present'} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'payments' && (
                  <div className="space-y-3 pt-2">
                    <h3 className="font-extrabold text-sm text-gray-900">Payout History</h3>
                    {payments.length === 0 ? (
                      <p className="text-xs text-gray-400 font-medium">No salary disbursements recorded yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-medium">
                          <thead>
                            <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3">Description</th>
                              <th className="py-2.5 px-3">Amount</th>
                              <th className="py-2.5 px-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {payments.map((p: any) => (
                              <tr key={p._id}>
                                <td className="py-3 px-3 font-semibold text-gray-800">{new Date(p.createdAt).toLocaleDateString()}</td>
                                <td className="py-3 px-3 text-gray-600">{p.description || 'Salary Payout'}</td>
                                <td className="py-3 px-3 font-black text-gray-900">₦ {(p.amount || 0).toLocaleString()}</td>
                                <td className="py-3 px-3">
                                  <StatusBadge status={p.status || 'completed'} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'contracts' && (
                  <div className="space-y-3 pt-2">
                    <h3 className="font-extrabold text-sm text-gray-900">Issued Contracts</h3>
                    {contracts.length === 0 ? (
                      <p className="text-xs text-gray-400 font-medium">No formal contracts issued yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {contracts.map((c: any) => (
                          <div key={c._id} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-xs text-gray-900">{c.title || 'Work Agreement'}</div>
                              <div className="text-[11px] text-gray-400">Created on {new Date(c.createdAt).toLocaleDateString()}</div>
                            </div>
                            <StatusBadge status={c.status || 'active'} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {worker && (
        <>
          <RecordPaymentModal
            isOpen={paymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            workforceMemberId={worker._id}
            workerName={worker.fullName}
            defaultAmount={worker.paymentAmount || 150000}
            onSuccess={fetchWorkerProfile}
          />
          <CreateContractModal
            isOpen={contractModalOpen}
            onClose={() => setContractModalOpen(false)}
            workforceMemberId={worker._id}
            workerName={worker.fullName}
            onSuccess={fetchWorkerProfile}
          />
        </>
      )}
    </div>
  );
};
