import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { workforceAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';
import { ApplyJobModal } from '../../components/modals/ApplyJobModal';
import { ViewJobModal } from '../../components/modals/ViewJobModal';
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
  ArrowRight,
  Eye
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { WorkerHeader } from '../../components/worker/WorkerHeader';
import { WorkerSidebar } from '../../components/worker/WorkerSidebar';
import { WorkerMobileNavbar } from '../../components/worker/WorkerMobileNavbar';

export const WorkerJobsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [proposalsMap, setProposalsMap] = useState<{ [jobId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [selectedJobToApply, setSelectedJobToApply] = useState<any>(null);
  const [selectedJobToView, setSelectedJobToView] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWorkerJobsData();
  }, []);

  const fetchWorkerJobsData = async () => {
    setLoading(true);
    try {
      const [meRes, jobsRes] = await Promise.allSettled([
        workforceAPI.getWorkerMe(),
        workforceAPI.getJobs(),
      ]);

      let proposals: any[] = [];

      if (meRes.status === 'fulfilled' && meRes.value?.data) {
        setData(meRes.value.data);
        proposals = meRes.value.data.proposals || [];
      }

      if (jobsRes.status === 'fulfilled' && jobsRes.value?.data) {
        setJobs(jobsRes.value.data);
      } else {
        setJobs([]);
      }

      const pMap: { [jobId: string]: string } = {};
      proposals.forEach((p: any) => {
        const jId = typeof p.jobId === 'object' ? p.jobId?._id : p.jobId;
        if (jId) {
          pMap[String(jId)] = p.status || 'pending';
        }
      });
      setProposalsMap(pMap);

    } catch (err) {
      console.error('Failed to fetch live worker jobs:', err);
      setJobs([]);
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

  const [selectedCompany, setSelectedCompany] = useState('all');

  // Extract unique companies from fetched jobs list
  const companyOptions = Array.from(
    new Set(
      jobs
        .map((j) => j.companyName || j.clientId?.companyName || j.clientId?.title)
        .filter(Boolean)
    )
  );

  // Worker's specialty / job trade keyword for AI smart matching
  const workerSpecialty = (user?.title || (user as any)?.category || '').toLowerCase().trim();

  const filteredJobs = jobs.filter((j) => {
    const cName = j.companyName || j.clientId?.companyName || j.clientId?.title || '';
    const matchesCompany = selectedCompany === 'all' || cName === selectedCompany;

    // AI Keyword Matching: match title, category, description, or location against search query OR worker's specialty keyword
    const jobText = `${j.title || ''} ${j.category || ''} ${j.description || ''} ${j.location || ''} ${cName}`.toLowerCase();
    
    const matchesSearch = searchQuery
      ? jobText.includes(searchQuery.toLowerCase())
      : true;

    // AI Smart Matching: Prioritize / Match worker's specialty keyword if user hasn't typed a specific search query
    const matchesSpecialty = workerSpecialty
      ? workerSpecialty.split(/\s+/).some((kw: string) => kw.length > 2 && jobText.includes(kw))
      : true;

    return matchesCompany && matchesSearch && (searchQuery ? true : matchesSpecialty || true);
  }).sort((a, b) => {
    // AI Score Sorting: Boost jobs that match the worker's specialty keyword to the top of the list
    if (!workerSpecialty) return 0;
    const aText = `${a.title || ''} ${a.category || ''} ${a.description || ''}`.toLowerCase();
    const bText = `${b.title || ''} ${b.category || ''} ${b.description || ''}`.toLowerCase();

    const aMatch = workerSpecialty.split(/\s+/).some((kw: string) => kw.length > 2 && aText.includes(kw));
    const bMatch = workerSpecialty.split(/\s+/).some((kw: string) => kw.length > 2 && bText.includes(kw));

    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

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
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  {isHired ? 'My Active Job & Assignment' : 'Marketplace & Job Openings'}
                </h1>
                <p className="text-xs text-gray-400 font-medium">
                  {isHired
                    ? 'View your active employment details, company contract, and employer info.'
                    : 'Browse active employer openings and submit applications.'}
                </p>
              </div>

              {/* SEARCH & WORKFORCE COMPANY FILTER (Only when browsing jobs) */}
              {!isHired && (
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  {companyOptions.length > 0 && (
                    <div className="relative">
                      <select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        className="px-3.5 py-1.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="all">All Workforce Employers ({jobs.length})</option>
                        {companyOptions.map((cName: any) => (
                          <option key={cName} value={cName}>
                            {cName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search title, role or city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-1.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs font-semibold">Loading job details...</p>
              </div>
            ) : isHired ? (
              /* DEDICATED HIRED WORKER JOB DISPLAY */
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-orange-50/80 via-white to-emerald-50/50 p-6 rounded-3xl border border-orange-200/80 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-100 pb-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 font-extrabold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Currently Active & Hired
                      </div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight pt-1">
                        {member?.role || contracts[0]?.jobTitle || 'Site Operations Specialist'}
                      </h2>
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-600">
                        <span className="flex items-center gap-1 text-primary">
                          <Building2 className="w-4 h-4" /> {employer?.companyName || employer?.title || contracts[0]?.employerName || 'Assigned Employer Company'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-4 h-4" /> {member?.location || contracts[0]?.location || 'Lagos Site Base'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-2xs text-left sm:text-right shrink-0">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Agreed Monthly Salary</span>
                      <span className="text-2xl font-black text-emerald-600">
                        ₦ {(member?.paymentAmount || contracts[0]?.paymentAmount || 0).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-gray-400 font-bold block capitalize">{member?.paymentType || 'monthly'} Payout</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-1">
                      <span className="text-gray-400 font-bold block">Employment Type</span>
                      <span className="font-extrabold text-gray-900 capitalize text-sm">{member?.employmentType?.replace('_', ' ') || 'Contract / Full-time'}</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-1">
                      <span className="text-gray-400 font-bold block">Hired Start Date</span>
                      <span className="font-extrabold text-gray-900 text-sm">
                        {member?.startDate ? new Date(member.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Active Assignment'}
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-1">
                      <span className="text-gray-400 font-bold block">Contract Status</span>
                      <span className="font-extrabold text-emerald-600 text-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Active
                      </span>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link
                      to="/workforce/me/payments"
                      className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>View Salary Payslips</span>
                    </Link>

                    <Link
                      to="/workforce/me/wallet"
                      className="px-5 py-2.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 font-extrabold text-xs border border-gray-200 transition-all flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4 text-primary" />
                      <span>Manage Salary Bank Account</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <Inbox className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <h3 className="font-extrabold text-sm text-gray-900">No Job Openings Available</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">Employers post contract roles and daily gig openings regularly. Check back soon for new postings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJobs.map((j) => {
                  const propStatus = proposalsMap[String(j._id)];
                  const isAccepted = propStatus === 'accepted' || propStatus === 'hired';
                  const isDeclined = propStatus === 'declined' || propStatus === 'rejected';
                  const isPending = propStatus === 'pending' || propStatus === 'under_review';

                  return (
                    <div
                      key={j._id}
                      onClick={() => navigate(`/workforce/me/jobs/${j._id}`)}
                      className="p-5 rounded-2xl bg-gray-50/60 border border-gray-100 hover:border-orange-200 hover:shadow-xs transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-extrabold text-primary bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 uppercase tracking-wider block">
                                {j.category || 'Workforce Role'}
                              </span>
                              {workerSpecialty && `${j.title || ''} ${j.category || ''} ${j.description || ''}`.toLowerCase().includes(workerSpecialty) && (
                                <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider flex items-center gap-0.5">
                                  ✨ AI Match
                                </span>
                              )}
                            </div>
                            <h3 className="font-extrabold text-base text-gray-900 leading-snug group-hover:text-primary transition-colors">{j.title}</h3>
                          </div>
                          <span className="text-sm font-black text-emerald-600 shrink-0">
                            ₦ {(j.budget || 0).toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">/ mo</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                          <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-primary" /> {j.companyName || 'Verified Employer'}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {j.location || 'Site Base'}</span>
                        </div>

                        <p className="text-xs text-gray-600 font-medium line-clamp-2 leading-relaxed pt-1">
                          {j.description || 'Verified job opening on Connecta. Apply to submit your proposal for employer review.'}
                        </p>
                      </div>

                      {/* APPLICATION STATUS & BUTTON */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => navigate(`/workforce/me/jobs/${j._id}`)}
                          className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                          <span>View Info</span>
                        </button>

                        {isAccepted ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 font-extrabold text-xs inline-flex items-center gap-1 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hired for Role
                          </span>
                        ) : isDeclined ? (
                          <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 font-extrabold text-xs inline-flex items-center gap-1 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" /> Declined
                          </span>
                        ) : isPending ? (
                          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 font-extrabold text-xs inline-flex items-center gap-1 border border-amber-200">
                            <Clock3 className="w-3.5 h-3.5" /> Submitted
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedJobToApply(j)}
                            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Apply Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* APPLICATION MODAL */}
      {selectedJobToApply && (
        <ApplyJobModal
          isOpen={!!selectedJobToApply}
          onClose={() => setSelectedJobToApply(null)}
          job={selectedJobToApply}
          onSuccess={fetchWorkerJobsData}
        />
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <WorkerMobileNavbar isHired={isHired} />
    </div>
  );
};
