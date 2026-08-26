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
        
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col justify-between space-y-8 pr-2">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-orange-100 border-2 border-white shadow-sm flex items-center justify-center text-primary font-extrabold text-lg overflow-hidden">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    (firstName || 'W')[0]
                  )}
                </div>
                <span className={`w-3.5 h-3.5 rounded-full border-2 border-white absolute bottom-0 right-0 ${isHired ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              </div>

              <div>
                <h2 className="font-extrabold text-gray-900 text-base leading-tight">Hello, {firstName}</h2>
                <p className="text-xs text-gray-500 font-medium truncate max-w-[170px]">{userContact}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Link
                to="/workforce/me"
                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-white text-gray-900 font-extrabold text-sm shadow-xs border border-gray-100"
              >
                <LayoutDashboard className="w-5 h-5 text-primary" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/workforce/me/jobs"
                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-white/60 font-semibold text-sm transition-all"
              >
                <Briefcase className="w-5 h-5 text-primary" />
                <span>{workLabel}</span>
              </Link>

              <Link
                to="/workforce/me/payments"
                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-white/60 font-semibold text-sm transition-all"
              >
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>My Salary</span>
              </Link>

              <Link
                to="/messages"
                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-white/60 font-semibold text-sm transition-all"
              >
                <Inbox className="w-5 h-5 text-blue-600" />
                <span>Employer Messages</span>
              </Link>

              <Link
                to="/workforce/me/profile"
                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-white/60 font-semibold text-sm transition-all"
              >
                <User className="w-5 h-5 text-primary" />
                <span>Profile</span>
              </Link>
            </nav>
          </div>

          <div className="space-y-2 pt-6 border-t border-gray-200/60">
            <Link
              to="/workforce/me/profile"
              className="flex items-center gap-3.5 px-4 py-2.5 text-gray-500 hover:text-gray-900 hover:bg-white/60 font-semibold text-sm transition-all"
            >
              <User className="w-5 h-5 text-primary" />
              <span>Profile</span>
            </Link>
          </div>
        </aside>

        {/* CENTER CONTENT AREA */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* SUMMARY STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
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

            {/* Card 2: Work Roster Status */}
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
                  {isHired ? 'Active Roster' : 'Open'}
                </span>
              </div>
            </div>

            {/* Card 3: 1-Tap Daily Check-In */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-2 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Clock3 className="w-4.5 h-4.5" />
                </div>
                <span className="font-extrabold text-sm text-gray-700">Daily Attendance</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCheckInToggle}
                  className={`w-full py-2.5 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${
                    checkedIn
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-primary hover:bg-primary-hover text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{checkedIn ? 'Checked In Today (Tap to Out)' : '1-Tap Check-In Today'}</span>
                </button>
              </div>
            </div>
          </div>



          {/* BOTTOM: WORKER CONTRACTS & ASSIGNMENTS TABLE */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900">My Employer & Work Roster</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Your active workforce company assignment.</p>
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
                  <p className="text-xs text-gray-500">You are currently not on an active workforce company roster. Apply to available jobs to get hired!</p>
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
                          <div className="text-[10px] text-gray-400 font-normal">Active Company Roster</div>
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-4 py-2.5 flex items-center justify-around shadow-2xl">
        <Link
          to="/workforce/me"
          className={`flex flex-col items-center gap-1 text-[11px] font-extrabold transition-all ${
            location.pathname === '/workforce/me' ? 'text-primary' : 'text-gray-400 hover:text-gray-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/workforce/me/jobs"
          className={`flex flex-col items-center gap-1 text-[11px] font-extrabold transition-all ${
            location.pathname.startsWith('/workforce/me/jobs') ? 'text-primary' : 'text-gray-400 hover:text-gray-800'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span>{workLabel}</span>
        </Link>

        <Link
          to="/workforce/me/payments"
          className={`flex flex-col items-center gap-1 text-[11px] font-extrabold transition-all ${
            location.pathname.startsWith('/workforce/me/payments') ? 'text-primary' : 'text-gray-400 hover:text-gray-800'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>My Salary</span>
        </Link>

        <Link
          to="/workforce/me/profile"
          className={`flex flex-col items-center gap-1 text-[11px] font-extrabold transition-all ${
            location.pathname.startsWith('/workforce/me/profile') ? 'text-primary' : 'text-gray-400 hover:text-gray-800'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
};
