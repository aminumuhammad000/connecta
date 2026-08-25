import React, { useEffect, useState } from 'react';
import { workforceAPI } from '../api/workforce';
import { CreateJobModal } from '../components/modals/CreateJobModal';
import { EditJobModal } from '../components/modals/EditJobModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { EmployerHeader } from '../components/employer/EmployerHeader';
import { EmployerSidebar } from '../components/employer/EmployerSidebar';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  MapPin,
  Loader2,
  Building2,
  Users,
  ArrowRight,
  Search,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2
} from 'lucide-react';

export const JobsPage: React.FC = () => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await workforceAPI.getJobs();
      if (res?.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: string, title: string) => {
    const newStatus = currentStatus === 'closed' ? 'active' : 'closed';
    setActionLoadingId(jobId);
    try {
      await workforceAPI.updateJobStatus(jobId, newStatus);
      showToast(
        newStatus === 'closed'
          ? `Job "${title}" closed. New applications paused.`
          : `Job "${title}" reopened and active.`,
        newStatus === 'closed' ? 'info' : 'success'
      );
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
      );
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update job status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the job opening "${title}"?\nThis action cannot be undone.`)) {
      return;
    }

    setActionLoadingId(jobId);
    try {
      await workforceAPI.deleteJob(jobId);
      showToast(`Deleted job opening "${title}".`, 'success');
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete job opening', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeJobsCount = jobs.filter((j) => j.status === 'active' || !j.status).length;
  const closedJobsCount = jobs.filter((j) => j.status === 'closed').length;

  const filteredJobs = jobs.filter((j) =>
    (j.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-gray-800 font-sans p-4 md:p-6">
      {/* TOP BRAND NAVBAR */}
      <EmployerHeader onCreateJob={() => setCreateModalOpen(true)} />

      {/* MAIN CONTENT GRID CONTAINER */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDEBAR */}
        <EmployerSidebar />

        {/* CENTER CONTENT */}
        <main className="lg:col-span-9 space-y-6">
          {/* MINIMALIST SUMMARY STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Job Openings</span>
              <div className="text-2xl font-black text-gray-900">{jobs.length} Jobs</div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Openings</span>
              <div className="text-2xl font-black text-emerald-600">{activeJobsCount} Active</div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Closed / Filled</span>
              <div className="text-2xl font-black text-gray-400">{closedJobsCount} Closed</div>
            </div>
          </div>

          {/* MAIN JOBS PANEL */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Jobs & Roles</h1>
                <p className="text-xs text-gray-400 font-medium">Create openings, edit details, and manage applicants.</p>
              </div>

              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-xs transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Job</span>
              </button>
            </div>

            {/* SEARCH INPUT */}
            <div className="flex justify-end">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search title, category, site..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-1.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Jobs Table */}
            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs font-semibold">Loading job listings...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No jobs found"
                description="Create your first job or project role to receive applications from workers on Connecta."
                actionText="Create Job"
                onAction={() => setCreateModalOpen(true)}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                      <th className="py-3 px-3">Position & Category</th>
                      <th className="py-3 px-3">Workers Needed</th>
                      <th className="py-3 px-3">Agreement</th>
                      <th className="py-3 px-3">Pay Rate</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {filteredJobs.map((j) => {
                      const isClosed = j.status === 'closed';
                      const typeLabel =
                        j.jobType === 'contract'
                          ? 'Formal Contract'
                          : j.jobType === 'daily'
                          ? 'Daily Wage'
                          : 'Milestone Job';

                      return (
                        <tr key={j._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-3 font-bold text-gray-900">
                            <div className="font-extrabold text-gray-900 text-sm">{j.title}</div>
                            <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-primary" /> {j.companyName || j.category || 'General Workforce'}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-bold text-gray-800">
                            <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-primary border border-orange-200 text-[11px] font-extrabold">
                              {j.openings || 1} Needed
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-semibold text-gray-700">
                            <span className="px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200 text-[11px] font-bold">
                              {typeLabel}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-black text-gray-900 text-sm">
                            ₦ {(j.budget || 0).toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">/ month</span>
                          </td>

                          <td className="py-3.5 px-3 font-medium text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" /> {j.location || 'Site Base'}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <StatusBadge status={j.status || 'active'} />
                          </td>

                          <td className="py-3.5 px-3 text-right space-x-1.5">
                            {/* APPLICANTS LINK */}
                            <Link
                              to={`/employer/jobs/${j._id}/applicants`}
                              className="px-3 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200 transition-all inline-flex items-center gap-1"
                              title="View Applicants"
                            >
                              <Users className="w-3.5 h-3.5 text-primary" />
                              <span>Applicants</span>
                              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                            </Link>

                            {/* EDIT BUTTON */}
                            <button
                              onClick={() => setEditingJob(j)}
                              className="p-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-all inline-flex items-center"
                              title="Edit Job Opening"
                            >
                              <Pencil className="w-3.5 h-3.5 text-gray-500" />
                            </button>

                            {/* CLOSE / REOPEN TOGGLE */}
                            <button
                              onClick={() => handleToggleJobStatus(j._id, j.status, j.title)}
                              disabled={actionLoadingId === j._id}
                              className={`p-1.5 rounded-xl font-bold text-xs transition-all inline-flex items-center gap-1 disabled:opacity-50 ${
                                isClosed
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                              title={isClosed ? 'Reopen Job' : 'Close Job Posting'}
                            >
                              {actionLoadingId === j._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isClosed ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-gray-400" />
                              )}
                            </button>

                            {/* DELETE BUTTON */}
                            <button
                              onClick={() => handleDeleteJob(j._id, j.title)}
                              disabled={actionLoadingId === j._id}
                              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all inline-flex items-center disabled:opacity-50"
                              title="Delete Job Opening"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateJobModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchJobs}
      />

      {editingJob && (
        <EditJobModal
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          job={editingJob}
          onSuccess={fetchJobs}
        />
      )}
    </div>
  );
};
