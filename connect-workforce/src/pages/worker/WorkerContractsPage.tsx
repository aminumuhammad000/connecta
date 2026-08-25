import React, { useEffect, useState } from 'react';
import { workforceAPI } from '../../api/workforce';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../contexts/ToastContext';
import { FileText, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WorkerContractsPage: React.FC = () => {
  const { showToast } = useToast();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkerData();
  }, []);

  const fetchWorkerData = async () => {
    setLoading(true);
    try {
      const res = await workforceAPI.getWorkerMe();
      if (res?.data?.contracts) {
        setContracts(res.data.contracts);
      }
    } catch (err) {
      console.error('Failed to fetch contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (contractId: string) => {
    try {
      const res = await workforceAPI.acceptContract(contractId);
      showToast(res.message || 'Contract accepted!', 'success');
      fetchWorkerData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to accept contract', 'error');
    }
  };

  const handleDecline = async (contractId: string) => {
    if (!window.confirm('Are you sure you want to decline this contract invitation?')) return;
    try {
      const res = await workforceAPI.declineContract(contractId);
      showToast(res.message || 'Contract declined', 'info');
      fetchWorkerData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to decline contract', 'error');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link to="/workforce/me" className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> Back to My Work
      </Link>

      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Work Contracts & Agreements</h1>
        <p className="text-xs text-gray-500 font-medium">Review and accept employment contract offers.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
            <p className="text-xs font-semibold">Loading contracts...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
            <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="font-bold text-sm text-gray-800">No contract offers yet</p>
            <p className="text-xs text-gray-500 mt-0.5">When your employer issues a contract, it will appear here.</p>
          </div>
        ) : (
          contracts.map((c) => (
            <div key={c._id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{c.jobTitle}</h3>
                  <div className="text-xs text-primary font-bold mt-0.5">
                    {c.currency} {c.paymentAmount?.toLocaleString()} / {c.paymentType}
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>

              {c.terms && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-600 font-medium">
                  <div className="font-bold text-gray-800 mb-1">Contract Terms & Duties</div>
                  <p>{c.terms}</p>
                </div>
              )}

              {c.status === 'sent' && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleAccept(c._id)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Accept Contract
                  </button>
                  <button
                    onClick={() => handleDecline(c._id)}
                    className="py-2.5 px-4 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-4 h-4 text-red-500" /> Decline
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
