import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { jobsAPI } from '../services/api'

interface Job {
  _id: string
  title: string
  company: string
  location: string
  jobType: string
  status: string
  isExternal: boolean
  source?: string
  createdAt: string
  budget?: string
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'internal' | 'external'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const jobsPerPage = 10

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    jobId: string | null
    title: string
  }>({
    isOpen: false,
    jobId: null,
    title: ''
  })

  useEffect(() => {
    fetchJobs()
  }, [filterType])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: 100,
        status: 'active' // Fetch active jobs by default
      }

      if (filterType === 'external') {
        params.isExternal = 'true'
      } else if (filterType === 'internal') {
        params.isExternal = 'false'
      }

      const response: any = await jobsAPI.getAll(params)

      let jobData = []
      if (response.success && response.data) {
        jobData = response.data
      } else if (Array.isArray(response)) {
        jobData = response
      } else if (response.data && Array.isArray(response.data)) {
        jobData = response.data
      }

      setJobs(jobData)
    } catch (error: any) {
      toast.error('Failed to load jobs')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async () => {
    if (!confirmModal.jobId) return

    try {
      await jobsAPI.delete(confirmModal.jobId)
      toast.success('Job deleted successfully')
      setJobs(jobs.filter(j => j._id !== confirmModal.jobId))
      setConfirmModal({ isOpen: false, jobId: null, title: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete job')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage)
  const currentJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage)

  return (
    <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Job Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage all jobs and external gigs on the platform
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search jobs by title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Gigs</option>
                <option value="internal">Internal Only</option>
                <option value="external">External Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">Loading jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-20">
                <Icon name="work_off" size={64} className="mx-auto text-slate-400 mb-4 opacity-50" />
                <p className="text-slate-600 dark:text-slate-400 text-lg">No jobs found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Posted</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {currentJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">{job.title}</p>
                        <p className="text-xs text-slate-500">{job.location}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{job.company}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.isExternal ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {job.isExternal ? 'External' : 'Internal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{job.source || 'Connecta'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(job.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setConfirmModal({ isOpen: true, jobId: job._id, title: job.title })}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
                          title="Delete Job"
                        >
                          <Icon name="delete" size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Showing {(currentPage - 1) * jobsPerPage + 1} to {Math.min(currentPage * jobsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Job?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">"{confirmModal.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, jobId: null, title: '' })}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteJob}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
