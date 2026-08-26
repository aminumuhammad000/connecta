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

  const filteredJobs = jobs.filter((j) => {
    const cName = j.companyName || j.clientId?.companyName || j.clientId?.title || '';
    const matchesCompany = selectedCompany === 'all' || cName === selectedCompany;
    const matchesSearch =
      (j.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      cName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCompany && matchesSearch;
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
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Marketplace & Job Openings</h1>
                <p className="text-xs text-gray-400 font-medium">Browse active employer openings and submit applications.</p>
              </div>

              {/* SEARCH & WORKFORCE COMPANY FILTER */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Company Filter Dropdown */}
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

                {/* Search Input */}
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
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs font-semibold">Loading available job openings...</p>
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
                            <span className="text-[10px] font-extrabold text-primary bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 uppercase tracking-wider block mb-1">
                              {j.category || 'Workforce Role'}
                            </span>
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
