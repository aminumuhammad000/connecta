import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { workforceAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';
import {
  LayoutDashboard,
  Briefcase,
  CreditCard,
  Bell,
  Loader2,
  CheckCircle2,
  Building2,
  UserCheck,
  User,
  Inbox,
  Clock3,
  Megaphone,
  CalendarDays
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { WorkerHeader } from '../../components/worker/WorkerHeader';
import { WorkerSidebar } from '../../components/worker/WorkerSidebar';
import { WorkerMobileNavbar } from '../../components/worker/WorkerMobileNavbar';

export const WorkerHomePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    fetchWorkerMeData();
  }, []);

  const fetchWorkerMeData = async () => {
    setLoading(true);
    try {
      const res = await workforceAPI.getWorkerMe();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch worker home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInToggle = () => {
    setCheckedIn(!checkedIn);
    showToast(
      !checkedIn ? 'Successfully checked in for today!' : 'Successfully checked out!',
      'success'
    );
  };

  const member = data?.member;
  const employer = data?.employer;
  const contracts = data?.contracts || [];

  const firstName = user?.firstName || 'Worker';
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Worker';
  const userContact = (user?.email && !user.email.includes('@worker.myconnecta'))
    ? user.email
    : ((user as any)?.phoneNumber || (user as any)?.phone || (user?.email ? user.email.split('@')[0] : ''));

  const employerName = employer
    ? (employer.companyName || employer.title || `${employer.firstName || ''} ${employer.lastName || ''}`.trim())
    : '';

  const isHired = (member?.status === 'active' && !!employerName) || contracts.length > 0;
  const workLabel = isHired ? 'My Work' : 'Apply Job';
  const currencySymbol = '₦';
  const monthlyEarnings = isHired ? (data?.monthlyEarnings || member?.paymentAmount || 0) : 0;

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-gray-800 font-sans p-4 md:p-6 pb-24 lg:pb-6">
      {/* TOP BRAND NAVBAR */}
      <WorkerHeader />

      {/* MAIN DASHBOARD GRID CONTAINER */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT STICKY SIDEBAR */}
        <WorkerSidebar isHired={isHired} />

        {/* CENTER CONTENT AREA */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* SUMMARY STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Card 1: My Salary */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-primary flex items-center justify-center font-bold">
                  <CreditCard className="w-4.5 h-4.5" />
                </div>
                <span className="font-extrabold text-sm text-gray-700">My Salary</span>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-3xl font-black text-gray-900">
                  {currencySymbol} {monthlyEarnings.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-primary flex items-center gap-0.5 bg-orange-50 px-3 py-1 rounded-full">
                  {isHired ? 'Monthly Rate' : 'Not Set'}
                </span>
              </div>
            </div>

            {/* Card 2: Employment Status */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${isHired ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  <UserCheck className="w-4.5 h-4.5" />
                </div>
                <span className="font-extrabold text-sm text-gray-700">Workforce Status</span>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-2xl font-black text-gray-900">
                  {isHired ? 'Active Member' : 'Seeking Jobs'}
                </span>
                <span className={`text-xs font-bold flex items-center gap-0.5 px-3 py-1 rounded-full ${isHired ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                  {isHired ? 'Hired' : 'Open'}
                </span>
              </div>
            </div>
          </div>



          {/* BOTTOM: WORKER CONTRACTS & ASSIGNMENTS TABLE */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900">My Employer & Active Company</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Your current workforce company assignment.</p>
              </div>
              
              <Link to="/workforce/me/jobs" className="text-xs font-bold text-primary hover:underline">
                Browse Available Jobs →
              </Link>
            </div>

            {!isHired ? (
              <div className="py-12 px-4 text-center space-y-3 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-primary flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h4 className="font-extrabold text-gray-900 text-base">No Employer Assigned Yet</h4>
                  <p className="text-xs text-gray-500">You are currently not assigned to an active workforce company. Apply to available jobs to get hired!</p>
                </div>
                <Link
                  to="/workforce/me/jobs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white font-extrabold text-xs shadow-md shadow-primary/20"
                >
                  Browse Available Jobs →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                      <th className="py-3 px-2">Employer / Company</th>
                      <th className="py-3 px-2">My Role</th>
                      <th className="py-3 px-2">Pay Arrangement</th>
                      <th className="py-3 px-2">Salary Rate</th>
                      <th className="py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    <tr>
                      <td className="py-4 px-2 font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-orange-100 text-primary font-black flex items-center justify-center text-sm">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-black text-gray-900 text-sm">{employerName}</div>
                          <div className="text-[10px] text-gray-400 font-normal">Active Company</div>
                        </div>
                      </td>

                      <td className="py-4 px-2 font-extrabold text-gray-800">
                        {member?.role || 'Site Operations Specialist'}
                      </td>

                      <td className="py-4 px-2 capitalize font-semibold text-gray-600">
                        {member?.paymentType || 'Monthly'}
                      </td>

                      <td className="py-4 px-2 font-black text-gray-900 text-sm">
                        {currencySymbol} {monthlyEarnings.toLocaleString()}
                      </td>

                      <td className="py-4 px-2">
                        <span className="px-3.5 py-1.5 rounded-full bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active Member
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <WorkerMobileNavbar isHired={isHired} />
    </div>
  );
};
