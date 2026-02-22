import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { jobsAPI, profilesAPI } from '../services/api'

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
  clientId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string
    profileImage?: string
  }
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

  const [viewModal, setViewModal] = useState<{
    isOpen: boolean
    job: Job | null
  }>({
    isOpen: false,
    job: null
  })

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed' | 'draft' | 'pending'>('all')
  const [clientProfile, setClientProfile] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [filterType, statusFilter])

  useEffect(() => {
    if (viewModal.isOpen && viewModal.job && viewModal.job.clientId && typeof viewModal.job.clientId !== 'string') {
      fetchClientProfile(viewModal.job.clientId._id)
    } else {
      setClientProfile(null)
    }
  }, [viewModal.isOpen, viewModal.job])

  const fetchClientProfile = async (userId: string) => {
    try {
      setLoadingProfile(true)
      const response: any = await profilesAPI.getByUserId(userId)
      if (response.success && response.data) {
        setClientProfile(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch client profile:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: 100,
        status: statusFilter // Fetch based on filter, default 'all'
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

  const handleUpdateStatus = async (jobId: string, status: string) => {
    try {
      await jobsAPI.updateStatus(jobId, status)
      toast.success(`Job ${status === 'active' ? 'approved' : 'updated'} successfully`)
      setJobs(jobs.map(j => j._id === jobId ? { ...j, status } : j))
      if (viewModal.job?._id === jobId) {
        setViewModal({ ...viewModal, job: { ...viewModal.job, status } })
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update job status')
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
          <h1 className="text-2xl sm:text-3xl font-bold text-text-light-primary dark:text-dark-primary">
            Job Management
          </h1>
          <p className="text-text-light-secondary dark:text-dark-secondary mt-1">
            Manage all jobs and external gigs on the platform
          </p>
        </div>

        <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
          <div className="p-4 sm:p-6 border-b border-border-light dark:border-border-dark">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-dark-secondary" />
                <input
                  type="text"
                  placeholder="Search jobs by title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Approval</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                <p className="text-text-light-secondary dark:text-dark-secondary font-medium">Loading jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-20">
                <Icon name="work_off" size={64} className="mx-auto text-text-light-secondary dark:text-dark-secondary mb-4 opacity-50" />
                <p className="text-text-light-secondary dark:text-dark-secondary text-lg">No jobs found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">Posted</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {currentJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-text-light-primary dark:text-dark-primary truncate max-w-xs">{job.title}</p>
                        <p className="text-xs text-text-light-secondary dark:text-dark-secondary">{job.location}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">{job.company}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.isExternal ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {job.isExternal ? 'External' : 'Internal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">{job.source || 'Connecta'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          job.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">{formatDate(job.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {job.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(job._id, 'active')}
                                className="p-2 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors text-green-600 dark:text-green-400"
                                title="Approve Job"
                              >
                                <Icon name="check_circle" size={18} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(job._id, 'closed')}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
                                title="Reject Job"
                              >
                                <Icon name="cancel" size={18} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setViewModal({ isOpen: true, job })}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                            title="View Details"
                          >
                            <Icon name="visibility" size={18} />
                          </button>
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, jobId: job._id, title: job.title })}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
                            title="Delete Job"
                          >
                            <Icon name="delete" size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border-light dark:border-border-dark">
              <div className="text-sm text-text-light-secondary dark:text-dark-secondary">
                Showing {(currentPage - 1) * jobsPerPage + 1} to {Math.min(currentPage * jobsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Job Modal */}
      {viewModal.isOpen && viewModal.job && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-light-primary dark:text-dark-primary">Job Details</h3>
              <button
                onClick={() => setViewModal({ isOpen: false, job: null })}
                className="text-text-light-secondary dark:text-dark-secondary hover:text-text-light-primary dark:hover:text-dark-primary"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-text-light-primary dark:text-dark-primary">{viewModal.job.title}</h2>
                  <div className="flex items-center gap-2 mt-2 text-text-light-secondary dark:text-dark-secondary">
                    <Icon name="business" size={18} />
                    <span>{viewModal.job.company}</span>
                    <span>•</span>
                    <Icon name="location_on" size={18} />
                    <span>{viewModal.job.location}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${viewModal.job.isExternal ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                  {viewModal.job.isExternal ? 'External' : 'Internal'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                  <p className="text-sm text-text-light-secondary dark:text-dark-secondary mb-1">Job Type</p>
                  <p className="font-medium text-text-light-primary dark:text-dark-primary capitalize">{viewModal.job.jobType}</p>
                </div>
                <div className="p-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                  <p className="text-sm text-text-light-secondary dark:text-dark-secondary mb-1">Posted Date</p>
                  <p className="font-medium text-text-light-primary dark:text-dark-primary">{formatDate(viewModal.job.createdAt)}</p>
                </div>
                <div className="p-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                  <p className="text-sm text-text-light-secondary dark:text-dark-secondary mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${viewModal.job.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    viewModal.job.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                    {viewModal.job.status}
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                  <p className="text-sm text-text-light-secondary dark:text-dark-secondary mb-1">Source</p>
                  <p className="font-medium text-text-light-primary dark:text-dark-primary">{viewModal.job.source || 'Connecta'}</p>
                </div>
                {viewModal.job.budget && (
                  <div className="p-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark sm:col-span-2">
                    <p className="text-sm text-text-light-secondary dark:text-dark-secondary mb-1">Budget</p>
                    <p className="font-medium text-text-light-primary dark:text-dark-primary">{viewModal.job.budget}</p>
                  </div>
                )}
              </div>

              {viewModal.job.isExternal && (viewModal.job as any).applyUrl && (
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300 mb-2 font-medium">External Application Link</p>
                  <a
                    href={(viewModal.job as any).applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {(viewModal.job as any).applyUrl}
                  </a>
                </div>
              )}

              {!viewModal.job.isExternal && viewModal.job.clientId && (
                <div className="pt-6 border-t border-border-light dark:border-border-dark">
                  <h4 className="text-lg font-bold text-text-light-primary dark:text-dark-primary mb-4 flex items-center gap-2">
                    <Icon name="person" size={20} className="text-primary" />
                    Client Information
                  </h4>

                  <div className="bg-background-light dark:bg-background-dark/50 rounded-xl p-4 border border-border-light dark:border-border-dark">
                    <div className="flex items-center gap-4 mb-4">
                      {viewModal.job.clientId.profileImage ? (
                        <img
                          src={viewModal.job.clientId.profileImage}
                          alt="Client"
                          className="w-12 h-12 rounded-full object-cover border border-border-light dark:border-border-dark"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Icon name="person" size={24} />
                        </div>
                      )}
                      <div>
                        <h5 className="font-bold text-text-light-primary dark:text-dark-primary">
                          {viewModal.job.clientId.firstName} {viewModal.job.clientId.lastName}
                        </h5>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-text-light-secondary dark:text-dark-secondary">
                          <div className="flex items-center gap-1">
                            <Icon name="mail" size={14} />
                            <span>{viewModal.job.clientId.email}</span>
                          </div>
                          {viewModal.job.clientId.phoneNumber && (
                            <div className="flex items-center gap-1">
                              <Icon name="call" size={14} />
                              <span>{viewModal.job.clientId.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {loadingProfile ? (
                      <div className="flex items-center gap-2 text-sm text-text-light-secondary dark:text-dark-secondary py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Loading full profile...</span>
                      </div>
                    ) : clientProfile ? (
                      <div className="space-y-3 pt-2">
                        {clientProfile.companyName && (
                          <div>
                            <p className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase">Company</p>
                            <p className="text-sm text-text-light-primary dark:text-dark-primary font-medium">{clientProfile.companyName}</p>
                          </div>
                        )}
                        {clientProfile.bio && (
                          <div>
                            <p className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase">Bio</p>
                            <p className="text-sm text-text-light-primary dark:text-dark-primary italic line-clamp-3">"{clientProfile.bio}"</p>
                          </div>
                        )}
                        {clientProfile.website && (
                          <div>
                            <p className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase">Website</p>
                            <a
                              href={clientProfile.website.startsWith('http') ? clientProfile.website : `https://${clientProfile.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              <Icon name="language" size={14} />
                              {clientProfile.website}
                            </a>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-4 pt-1">
                          {clientProfile.location && (
                            <div>
                              <p className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase">Location</p>
                              <p className="text-sm text-text-light-primary dark:text-dark-primary">{clientProfile.location}</p>
                            </div>
                          )}
                          {clientProfile.country && (
                            <div>
                              <p className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase">Country</p>
                              <p className="text-sm text-text-light-primary dark:text-dark-primary">{clientProfile.country}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-text-light-secondary dark:text-dark-secondary italic py-2">No additional profile details found.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                <button
                  onClick={() => setViewModal({ isOpen: false, job: null })}
                  className="px-4 py-2 text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
                >
                  Close
                </button>
                {viewModal.job.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(viewModal.job!._id, 'closed')}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(viewModal.job!._id, 'active')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve Job
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setConfirmModal({ isOpen: true, jobId: viewModal.job!._id, title: viewModal.job!.title })
                    setViewModal({ isOpen: false, job: null })
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-text-light-primary dark:text-dark-primary mb-2">Delete Job?</h3>
            <p className="text-text-light-secondary dark:text-dark-secondary mb-6">
              Are you sure you want to delete <span className="font-semibold text-text-light-primary dark:text-dark-primary">"{confirmModal.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, jobId: null, title: '' })}
                className="px-4 py-2 text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
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

