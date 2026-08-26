import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { workforceAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';
import { ApplyJobModal } from '../../components/modals/ApplyJobModal';
import {
  LayoutDashboard,
  Briefcase,
  CreditCard,
  LogOut,
  Send,
  Loader2,
  MapPin,
  CheckCircle2,
  Building2,
  User,
  Clock3,
  XCircle,
  Inbox,
  Search,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { WorkerHeader } from '../../components/worker/WorkerHeader';

export const WorkerJobDetailsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [proposalStatus, setProposalStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const [meRes, jobsRes] = await Promise.allSettled([
        workforceAPI.getWorkerMe(),
        workforceAPI.getJobs(),
      ]);

      if (meRes.status === 'fulfilled' && meRes.value?.data) {
        setData(meRes.value.data);
        const proposals = meRes.value.data.proposals || [];
        const matchProp = proposals.find((p: any) => {
          const jId = typeof p.jobId === 'object' ? p.jobId?._id : p.jobId;
          return String(jId) === String(jobId);
        });
        if (matchProp) {
          setProposalStatus(matchProp.status || 'pending');
        }
      }

      if (jobsRes.status === 'fulfilled' && jobsRes.value?.data) {
        const found = jobsRes.value.data.find((j: any) => String(j._id) === String(jobId));
        setJob(found || null);
      }
    } catch (err) {
      console.error('Failed to fetch job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const member = data?.member;
  const employer = data?.employer;
  const contracts = data?.contracts || [];
  const isHired = (member?.status === 'active' && !!employer) || contracts.length > 0;
  const workLabel = isHired ? 'My Work' : 'Apply Job';

  const firstName = user?.firstName || 'Worker';
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Worker';
  const userContact = (user?.email && !user.email.includes('@worker.myconnecta'))
    ? user.email
    : ((user as any)?.phoneNumber || (user as any)?.phone || (user?.email ? user.email.split('@')[0] : ''));

  const companyName = job?.companyName || job?.clientId?.companyName || job?.clientId?.title || 'Verified Employer';
  const jobLocation = job?.location || 'Site Base (Nigeria)';
  const budget = job?.budget || 0;
  const duration = job?.duration || 30;

  const isAccepted = proposalStatus === 'accepted' || proposalStatus === 'hired';
  const isDeclined = proposalStatus === 'declined' || proposalStatus === 'rejected';
  const isPending = proposalStatus === 'pending' || proposalStatus === 'under_review';

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-gray-800 font-sans p-4 md:p-6 pb-24 lg:pb-6">
      <WorkerHeader />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDEBAR (Desktop Only) */}
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
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                  location.pathname === '/workforce/me' ? 'bg-white text-gray-900 font-extrabold shadow-xs border border-gray-100' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/workforce/me/jobs"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                  location.pathname.includes('/jobs') ? 'bg-white text-gray-900 font-extrabold shadow-xs border border-gray-100' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Briefcase className="w-5 h-5 text-primary" />
                <span>{workLabel}</span>
              </Link>

              <Link
                to="/workforce/me/payments"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                  location.pathname.includes('/payments') ? 'bg-white text-gray-900 font-extrabold shadow-xs border border-gray-100' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>My Salary</span>
              </Link>

              <Link
                to="/workforce/me/profile"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                  location.pathname.includes('/profile') ? 'bg-white text-gray-900 font-extrabold shadow-xs border border-gray-100' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <User className="w-5 h-5 text-primary" />
                <span>My Profile</span>
              </Link>
            </nav>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 text-gray-500 hover:text-rose-600 font-semibold text-sm transition-all text-left border-t border-gray-200/60 pt-6"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </aside>

        {/* MAIN CENTER PANEL */}
        <main className="lg:col-span-9 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-gray-100 space-y-6">
            
            {/* BACK BUTTON */}
            <button
              onClick={() => navigate('/workforce/me/jobs')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Job Openings</span>
            </button>

            {loading ? (
              <div className="p-16 text-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs font-semibold">Loading job details...</p>
              </div>
            ) : !job ? (
              <div className="p-16 text-center text-gray-400 space-y-3">
                <Inbox className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <h3 className="font-extrabold text-base text-gray-900">Job Posting Not Found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">This job listing may have been closed or filled by the employer.</p>
              </div>
            ) : (
              <div className="space-y-6 text-xs">
                
                {/* HEADER & SALARY BANNER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold text-primary bg-orange-50 px-3 py-1 rounded-full border border-orange-100 uppercase tracking-wider inline-block">
                      {job.category || 'Workforce Role'}
                    </span>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">{job.title}</h1>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium pt-1">
                      <span className="flex items-center gap-1.5 font-bold text-gray-800">
                        <Building2 className="w-4 h-4 text-primary" /> {companyName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" /> {jobLocation}
                      </span>
                    </div>
                  </div>

                  <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100 text-left md:text-right shrink-0">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Offered Compensation</span>
                    <div className="text-2xl font-black text-emerald-600 mt-0.5">
                      ₦ {budget.toLocaleString()} <span className="text-xs font-normal text-gray-500">/ mo</span>
                    </div>
                  </div>
                </div>

                {/* DETAILS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Contract Type</span>
                    <span className="font-extrabold text-gray-900 text-sm capitalize">{job.jobType?.replace('_', ' ') || 'Full-Time Contract'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Contract Duration</span>
                    <span className="font-extrabold text-gray-900 text-sm">{duration} Days / Ongoing Roster</span>
                  </div>
                </div>

                {/* OVERVIEW */}
                <div className="space-y-2 pt-2">
                  <h3 className="font-extrabold text-sm text-gray-900">Job Description & Responsibilities</h3>
                  <div className="p-5 rounded-2xl bg-white border border-gray-200 text-gray-700 font-medium leading-relaxed text-sm whitespace-pre-line shadow-2xs">
                    {job.description || 'No detailed description provided.'}
                  </div>
                </div>

                {/* SKILLS */}
                {job.skills && job.skills.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((s: string, idx: number) => (
                        <span key={idx} className="px-3.5 py-1.5 rounded-xl bg-gray-100 text-gray-800 font-extrabold text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* BOTTOM APPLY ACTION */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
                  <div className="text-xs text-gray-400 font-medium">
                    Verified position posted by {companyName}.
                  </div>

                  {isAccepted ? (
                    <span className="px-5 py-2.5 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold text-xs inline-flex items-center gap-2 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" /> Hired for this Position
                    </span>
                  ) : isDeclined ? (
                    <span className="px-5 py-2.5 rounded-2xl bg-rose-50 text-rose-600 font-extrabold text-xs inline-flex items-center gap-2 border border-rose-200">
                      <XCircle className="w-4 h-4" /> Proposal Declined
                    </span>
                  ) : isPending ? (
                    <span className="px-5 py-2.5 rounded-2xl bg-amber-50 text-amber-600 font-extrabold text-xs inline-flex items-center gap-2 border border-amber-200">
                      <Clock3 className="w-4 h-4" /> Proposal Submitted & Under Review
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs shadow-md shadow-primary/20 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Apply Now for ₦{budget.toLocaleString()}</span>
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>
        </main>
      </div>

      {showApplyModal && job && (
        <ApplyJobModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          job={job}
          onSuccess={() => {
            setShowApplyModal(false);
            fetchJobDetails();
          }}
        />
      )}
    </div>
  );
};
