import React, { useEffect, useState } from 'react';
import { workforceAPI } from '../api/workforce';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { EmployerHeader } from '../components/employer/EmployerHeader';
import { EmployerSidebar } from '../components/employer/EmployerSidebar';
import { FileText, Loader2 } from 'lucide-react';

export const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await workforceAPI.getContracts();
      if (res?.data) {
        setContracts(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch contracts:', err);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Digital Employment Contracts</h1>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Manage digital work agreements, signed contracts, and employee terms.</p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs font-semibold">Loading contracts...</p>
              </div>
            ) : contracts.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No contracts issued yet"
                description="Issue digital employment contracts to your workforce from the Employees page."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                      <th className="py-3.5 px-3">Issued Date</th>
                      <th className="py-3.5 px-3">Employee Name</th>
                      <th className="py-3.5 px-3">Job Title / Role</th>
                      <th className="py-3.5 px-3">Salary Terms</th>
                      <th className="py-3.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {contracts.map((c) => (
                      <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-3 text-gray-500 font-medium">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-3 font-bold text-gray-900">
                          {c.workforceMemberId?.fullName || 'Worker'}
                        </td>
                        <td className="py-4 px-3 font-extrabold text-gray-800">{c.jobTitle || 'Role Contract'}</td>
                        <td className="py-4 px-3 font-black text-gray-900 text-sm">
                          {c.currency || 'NGN'} {(c.paymentAmount || 0).toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">/ {c.paymentType || 'monthly'}</span>
                        </td>
                        <td className="py-4 px-3">
                          <StatusBadge status={c.status || 'sent'} />
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
    </div>
  );
};
