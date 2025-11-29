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

  const handleApprove = async (id: string) => {
    try {
      await proposalsAPI.approve(id)
      fetchApplications()
    } catch (error) {
      console.error('Error approving application:', error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await proposalsAPI.reject(id)
      fetchApplications()
    } catch (error) {
      console.error('Error rejecting application:', error)
    }
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
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <p className="text-text-light-primary dark:text-dark-primary text-2xl md:text-3xl font-black leading-tight tracking-tighter">Gig Applications</p>
            <p className="text-text-light-secondary dark:text-dark-secondary text-base font-normal leading-normal">Manage all freelancer applications for gigs.</p>
          </div>
        </header>

        <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-2">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-text-light-secondary dark:text-dark-secondary flex bg-background-light dark:bg-background-dark items-center justify-center pl-4 rounded-l-lg">
                    <Icon name="search" />
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-light-primary dark:text-dark-primary focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-inset border-none bg-background-light dark:bg-background-dark h-full placeholder:text-text-light-secondary placeholder:dark:text-dark-secondary px-4 pl-2 text-base font-normal leading-normal"
                    placeholder="Search by gig, applicant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </label>
            </div>
            <div className="relative">
              <select
                className="flex h-12 w-full items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal appearance-none cursor-pointer"
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
            <button className="flex h-12 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4">
              <p className="text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal">Date Range</p>
              <Icon name="calendar_today" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
            </button>
          </div>

          <div className="w-full overflow-x-auto">
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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Icon name="progress_activity" className="animate-spin text-primary" />
                        <span className="text-text-light-secondary dark:text-dark-secondary">Loading applications...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Icon name="inbox" size={48} className="text-text-light-secondary dark:text-dark-secondary opacity-50" />
                        <p className="text-text-light-secondary dark:text-dark-secondary">No applications found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app._id} className="border-b border-border-light dark:border-border-dark">
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
                        <div className="flex items-center justify-end gap-2">
                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(app._id)}
                                className="px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/70"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(app._id)}
                                className="px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/70"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                            <Icon name="more_vert" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-border-light dark:border-border-dark gap-3">
            <p className="text-sm text-text-light-secondary dark:text-dark-secondary text-center sm:text-left">
              Showing {filteredApplications.length > 0 ? 1 : 0} to {filteredApplications.length} of {applications.length} applications
            </p>
            <div className="flex items-center gap-2">
              <button className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-primary/10">
                <Icon name="chevron_left" size={20} />
              </button>
              <button className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary text-white text-sm">1</button>
              <button className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-primary/10">
                <Icon name="chevron_right" size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
  )
}