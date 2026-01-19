import { useState, useEffect, useMemo } from 'react'
import Icon from '../components/Icon'
import { proposalsAPI } from '../services/api'

interface Proposal {
  _id: string
  jobId: {
    _id: string
    title: string
  }
  freelancerId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    profileImage?: string
  }
  clientId: {
    _id: string
    firstName: string
    lastName: string
  }
  coverLetter: string
  proposedBudget?: number
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

export default function GigApplications() {
  const [applications, setApplications] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showActionSheet, setShowActionSheet] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Proposal | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await proposalsAPI.getAll()
      console.log('Applications response:', response)

      const data = Array.isArray(response) ? response : response?.data || []
      setApplications(data)
    } catch (error) {
      console.error('Error fetching applications:', error)
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (application: Proposal) => {
    setSelectedApplication(application)
    setShowDetailsModal(true)
    setShowActionSheet(null)
  }

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch =
        app.jobId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${app.freelancerId?.firstName} ${app.freelancerId?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [applications, searchQuery, statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <main className="flex-1 flex-col p-4 md:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-text-light-primary dark:text-dark-primary text-2xl md:text-3xl font-black leading-tight tracking-tighter">Gig Applications</p>
          <p className="text-text-light-secondary dark:text-dark-secondary text-sm sm:text-base font-normal leading-normal">Manage all freelancer applications for gigs.</p>
        </div>
      </header>

      <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 md:p-6 border border-border-light dark:border-border-dark">
        {/* Search & Filters */}
        <div className="space-y-3 mb-6">
          {/* Search Bar - Full width */}
          <div className="relative">
            <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-dark-secondary z-10" />
            <input
              className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-lg text-text-light-primary dark:text-dark-primary focus:outline-0 focus:ring-2 focus:ring-primary border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark placeholder:text-text-light-secondary placeholder:dark:text-dark-secondary text-base font-normal leading-normal"
              placeholder="Search by gig or applicant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            {/* Filter Toggle - Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex-1 px-4 py-3 min-h-[44px] bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary font-medium flex items-center justify-between hover:bg-border-light dark:hover:bg-border-dark transition-colors"
            >
              <span className="flex items-center gap-2">
                <Icon name="filter_list" size={20} />
                Filter Status
              </span>
              <Icon name={showFilters ? "expand_less" : "expand_more"} size={20} />
            </button>

            {/* Status Filter - Desktop */}
            <div className="hidden md:block flex-1 relative">
              <select
                className="w-full h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-light-primary dark:text-dark-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Status: All</option>
                <option value="pending">Status: Pending</option>
                <option value="accepted">Status: Approved</option>
                <option value="rejected">Status: Rejected</option>
              </select>
              <Icon name="expand_more" size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-dark-secondary pointer-events-none" />
            </div>

            {/* Date Range - Desktop only */}
            <button className="hidden md:flex h-12 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark px-4 hover:bg-border-light dark:hover:bg-border-dark transition-colors">
              <p className="text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal">Date Range</p>
              <Icon name="calendar_today" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
            </button>
          </div>

          {/* Mobile Filter Drawer */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-64' : 'max-h-0'}`}>
            <div className="space-y-2 pt-2">
              {['all', 'pending', 'accepted', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status as any)
                    setShowFilters(false)
                  }}
                  className={`w-full px-4 py-3 min-h-[44px] rounded-lg text-left font-medium transition-colors capitalize ${statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-border-light dark:hover:bg-border-dark'
                    }`}
                >
                  {status === 'all' ? 'Status: All' : status === 'accepted' ? 'Status: Approved' : `Status: ${status}`}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* Applications List - Mobile Cards / Desktop Table */}
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Icon name="progress_activity" className="animate-spin text-primary" size={32} />
              <span className="text-base font-medium text-text-light-secondary dark:text-dark-secondary mt-3">Loading applications...</span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center py-20">
              <Icon name="inbox" size={48} className="text-text-light-secondary dark:text-dark-secondary opacity-50" />
              <p className="text-text-light-secondary dark:text-dark-secondary mt-3">No applications found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4 max-w-2xl mx-auto">
                {filteredApplications.map((app) => (
                  <div key={app._id} className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-text-light-primary dark:text-dark-primary mb-1 line-clamp-1">
                          {app.jobId?.title || 'N/A'}
                        </h3>
                        <div className="flex items-center gap-2">
                          <img
                            src={app.freelancerId?.profileImage || `https://ui-avatars.com/api/?name=${app.freelancerId?.firstName}+${app.freelancerId?.lastName}&background=6366f1&color=fff`}
                            alt={`${app.freelancerId?.firstName} ${app.freelancerId?.lastName}`}
                            className="w-6 h-6 rounded-full flex-shrink-0"
                          />
                          <span className="text-sm text-text-light-secondary dark:text-dark-secondary truncate">
                            {app.freelancerId?.firstName} {app.freelancerId?.lastName}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowActionSheet(showActionSheet === app._id ? null : app._id)}
                        className="p-2 hover:bg-card-light dark:hover:bg-card-dark rounded-lg transition-colors flex-shrink-0"
                        aria-label="Application actions"
                      >
                        <Icon name="more_vert" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusBadge(app.status)}`}>
                        {app.status === 'accepted' ? 'Approved' : app.status}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-text-light-secondary dark:text-dark-secondary">
                        <Icon name="calendar_today" size={14} />
                        <span>{formatDate(app.createdAt)}</span>
                      </div>
                    </div>

                    {/* Mobile Action Sheet */}
                    {showActionSheet === app._id && (
                      <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark space-y-2">
                        <button
                          onClick={() => handleViewDetails(app)}
                          className="w-full px-4 py-3 min-h-[44px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <Icon name="visibility" size={18} />
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left min-w-[640px]">
                  <thead>
                    <tr className="border-b border-border-light dark:border-border-dark">
                      <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Gig Title</th>
                      <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Applicant</th>
                      <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Status</th>
                      <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Submitted</th>
                      <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app) => (
                      <tr key={app._id} className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                        <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary max-w-xs truncate">
                          {app.jobId?.title || 'N/A'}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={app.freelancerId?.profileImage || `https://ui-avatars.com/api/?name=${app.freelancerId?.firstName}+${app.freelancerId?.lastName}&background=6366f1&color=fff`}
                              alt={`${app.freelancerId?.firstName} ${app.freelancerId?.lastName}`}
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="text-sm text-text-light-secondary dark:text-dark-secondary">
                              {app.freelancerId?.firstName} {app.freelancerId?.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusBadge(app.status)}`}>
                            {app.status === 'accepted' ? 'Approved' : app.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">
                          {formatDate(app.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => handleViewDetails(app)}
                            className="px-3 py-1.5 min-h-[32px] text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors inline-flex items-center gap-1"
                          >
                            <Icon name="visibility" size={16} />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>


        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-border-light dark:border-border-dark gap-3">
          <p className="text-sm text-text-light-secondary dark:text-dark-secondary text-center sm:text-left">
            Showing {filteredApplications.length > 0 ? 1 : 0} to {filteredApplications.length} of {applications.length} applications
          </p>
          <div className="flex items-center gap-2">
            <button className="flex h-11 w-11 sm:h-8 sm:w-8 min-h-[44px] sm:min-h-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-primary/10 transition-colors border border-border-light dark:border-border-dark">
              <Icon name="chevron_left" size={20} />
            </button>
            <button className="flex h-11 w-11 sm:h-8 sm:w-8 min-h-[44px] sm:min-h-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary text-white text-sm font-medium">1</button>
            <button className="flex h-11 w-11 sm:h-8 sm:w-8 min-h-[44px] sm:min-h-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-primary/10 transition-colors border border-border-light dark:border-border-dark">
              <Icon name="chevron_right" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 max-w-2xl w-full shadow-2xl border border-border-light dark:border-border-dark max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-light-primary dark:text-dark-primary">Application Details</h2>
                <p className="text-sm text-text-light-secondary dark:text-dark-secondary mt-1">
                  Submitted on {formatDate(selectedApplication.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
              >
                <Icon name="close" size={24} className="text-text-light-secondary dark:text-dark-secondary" />
              </button>
            </div>

            {/* Job Information */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
              <p className="text-xs uppercase font-semibold text-blue-700 dark:text-blue-300 mb-2">Job</p>
              <p className="text-lg font-semibold text-text-light-primary dark:text-dark-primary">
                {selectedApplication.jobId?.title || 'N/A'}
              </p>
            </div>

            {/* Freelancer Information */}
            <div className="mb-6 p-4 bg-background-light dark:bg-background-dark rounded-lg">
              <p className="text-xs uppercase font-semibold text-text-light-secondary dark:text-dark-secondary mb-3">Freelancer</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-500 flex-shrink-0"
                  style={{
                    backgroundImage: selectedApplication.freelancerId?.profileImage
                      ? `url(${selectedApplication.freelancerId.profileImage})`
                      : `url("https://ui-avatars.com/api/?name=${selectedApplication.freelancerId?.firstName}+${selectedApplication.freelancerId?.lastName}&background=fd6730&color=fff&size=128")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div>
                  <p className="font-semibold text-text-light-primary dark:text-dark-primary">
                    {selectedApplication.freelancerId?.firstName} {selectedApplication.freelancerId?.lastName}
                  </p>
                  <p className="text-sm text-text-light-secondary dark:text-dark-secondary">
                    {selectedApplication.freelancerId?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Status & Budget */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg">
                <p className="text-xs uppercase font-semibold text-text-light-secondary dark:text-dark-secondary mb-2">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedApplication.status)}`}>
                  {selectedApplication.status === 'accepted' ? 'Approved' : selectedApplication.status}
                </span>
              </div>
              {selectedApplication.proposedBudget && (
                <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg">
                  <p className="text-xs uppercase font-semibold text-text-light-secondary dark:text-dark-secondary mb-2">Proposed Budget</p>
                  <p className="text-lg font-bold text-text-light-primary dark:text-dark-primary">
                    ${selectedApplication.proposedBudget.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div className="mb-6">
              <p className="text-sm uppercase font-semibold text-text-light-secondary dark:text-dark-secondary mb-3">Cover Letter</p>
              <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg">
                <p className="text-text-light-primary dark:text-dark-primary leading-relaxed whitespace-pre-wrap">
                  {selectedApplication.coverLetter || 'No cover letter provided.'}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-3 min-h-[44px] bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}