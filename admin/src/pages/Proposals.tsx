import { useEffect, useState, useMemo } from 'react'
import Icon from '../components/Icon'
import { proposalsAPI } from '../services/api'
import type { Proposal } from '../types'
import toast from 'react-hot-toast'

export default function Proposals() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showActionSheet, setShowActionSheet] = useState<string | null>(null)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      setLoading(true)
      const response = await proposalsAPI.getAll()
      console.log('Proposals response:', response)

      // Handle different response formats
      const proposalsData = Array.isArray(response) ? response : (response?.data || [])
      setProposals(proposalsData)
      console.log('Loaded proposals:', proposalsData.length)
    } catch (error) {
      console.error('Failed to fetch proposals:', error)
      toast.error('Failed to load proposals')
      setProposals([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await proposalsAPI.approve(id)
      toast.success('Proposal approved successfully')
      fetchProposals()
    } catch (error) {
      console.error('Failed to approve proposal:', error)
      toast.error('Failed to approve proposal')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await proposalsAPI.reject(id)
      toast.success('Proposal rejected')
      fetchProposals()
    } catch (error) {
      console.error('Failed to reject proposal:', error)
      toast.error('Failed to reject proposal')
    }
  }

  const filteredProposals = useMemo(() => {
    return proposals.filter(proposal => {
      const freelancerId = proposal.freelancerId as any
      const jobId = proposal.jobId as any
      const freelancerName = `${freelancerId?.firstName || ''} ${freelancerId?.lastName || ''}`.toLowerCase()
      const jobTitle = jobId?.title?.toLowerCase() || ''
      const matchesSearch =
        freelancerName.includes(searchTerm.toLowerCase()) ||
        jobTitle.includes(searchTerm.toLowerCase()) ||
        proposal.coverLetter?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [proposals, searchTerm, statusFilter])

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400',
      approved: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400',
      rejected: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400'
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* PageHeading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <p className="text-neutral-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight tracking-tight">Proposal Management</p>
            <p className="text-neutral-600 dark:text-neutral-200/60 text-sm sm:text-base font-normal leading-normal">Review and manage all submitted proposals.</p>
          </div>
          <button
            onClick={fetchProposals}
            className="flex items-center justify-center gap-2 rounded-lg h-12 sm:h-10 min-h-[44px] sm:min-h-0 px-4 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Icon name="refresh" size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter & Search Section */}
        <div className="mb-6 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-900/50">
          <div className="space-y-3">
            {/* SearchBar - Full Width */}
            <div className="relative">
              <Icon name="search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600 dark:text-neutral-200/60 z-10" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary border border-neutral-200 dark:border-neutral-900/50 bg-neutral-100 dark:bg-background-dark placeholder:text-neutral-600 dark:placeholder:text-neutral-200/60 text-sm font-normal"
                placeholder="Search by freelancer or job..."
              />
            </div>

            {/* Filter Toggle - Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full px-4 py-3 min-h-[44px] bg-neutral-100 dark:bg-neutral-900/50 rounded-lg font-medium flex items-center justify-between hover:bg-neutral-200 dark:hover:bg-background-dark transition-colors border border-neutral-200 dark:border-neutral-900/50"
            >
              <span className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                <Icon name="filter_list" size={20} />
                Filters
              </span>
              <Icon name={showFilters ? "expand_less" : "expand_more"} size={20} className="text-neutral-600 dark:text-neutral-200/60" />
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex flex-wrap items-center gap-3">
              <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-neutral-100 dark:bg-neutral-900/50 pl-4 pr-2 border border-neutral-200 dark:border-neutral-900/50 hover:border-neutral-600/50 dark:hover:border-neutral-200/20">
                <p className="text-neutral-900 dark:text-neutral-100 text-sm font-medium leading-normal">Status: All</p>
                <Icon name="expand_more" className="text-neutral-600 dark:text-neutral-200/60" />
              </button>
              <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-neutral-100 dark:bg-neutral-900/50 pl-4 pr-2 border border-neutral-200 dark:border-neutral-900/50 hover:border-neutral-600/50 dark:hover:border-neutral-200/20">
                <p className="text-neutral-900 dark:text-neutral-100 text-sm font-medium leading-normal">Job: All</p>
                <Icon name="expand_more" className="text-neutral-600 dark:text-neutral-200/60" />
              </button>
              <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-neutral-100 dark:bg-neutral-900/50 pl-4 pr-2 border border-neutral-200 dark:border-neutral-900/50 hover:border-neutral-600/50 dark:hover:border-neutral-200/20">
                <p className="text-neutral-900 dark:text-neutral-100 text-sm font-medium leading-normal">Date Range</p>
                <Icon name="expand_more" className="text-neutral-600 dark:text-neutral-200/60" />
              </button>
              <button className="text-primary text-sm font-medium hover:underline ml-auto">Clear Filters</button>
            </div>

            {/* Mobile Filter Drawer */}
            <div className={`lg:hidden overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-96' : 'max-h-0'}`}>
              <div className="space-y-2 pt-2">
                {[
                  { label: 'Status: All', icon: 'filter_alt' },
                  { label: 'Job: All', icon: 'work' },
                  { label: 'Date Range', icon: 'calendar_today' },
                ].map((filter) => (
                  <button
                    key={filter.label}
                    onClick={() => setShowFilters(false)}
                    className="w-full px-4 py-3 min-h-[44px] bg-neutral-100 dark:bg-neutral-900/50 text-neutral-900 dark:text-neutral-100 rounded-lg font-medium flex items-center gap-2 hover:bg-neutral-200 dark:hover:bg-background-dark transition-colors border border-neutral-200 dark:border-neutral-900/50"
                  >
                    <Icon name={filter.icon} size={18} />
                    {filter.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full px-4 py-3 min-h-[44px] text-primary font-medium hover:underline"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Table / Cards */}
        <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-900/50 bg-white dark:bg-neutral-900">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Icon name="progress_activity" size={32} className="animate-spin text-primary mb-3" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading proposals...</p>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Icon name="inbox" size={48} className="text-neutral-300 dark:text-neutral-700 mb-3" />
              <p className="text-sm font-medium text-neutral-900 dark:text-white">No proposals found</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No proposals have been submitted yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4 p-4 max-w-2xl mx-auto">
                {filteredProposals.map((proposal) => {
                  const freelancer = proposal.freelancerId as any
                  const job = proposal.jobId as any
                  return (
                    <div key={proposal._id} className="bg-neutral-100/50 dark:bg-background-dark rounded-lg p-4 border border-neutral-200 dark:border-neutral-900/50">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 bg-gradient-to-br from-primary to-amber-500 flex-shrink-0"
                            style={{
                              backgroundImage: freelancer?.profileImage
                                ? `url(${freelancer.profileImage})`
                                : `url("https://ui-avatars.com/api/?name=${freelancer?.firstName}+${freelancer?.lastName}&background=fd6730&color=fff&size=128")`
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                              {freelancer?.firstName} {freelancer?.lastName}
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                              {job?.title || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowActionSheet(showActionSheet === proposal._id ? null : proposal._id)}
                          className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-900/50 rounded-lg transition-colors flex-shrink-0"
                          aria-label="Proposal actions"
                        >
                          <Icon name="more_vert" size={20} className="text-neutral-600 dark:text-neutral-400" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 uppercase mb-1">Submitted</p>
                          <p className="text-sm text-neutral-900 dark:text-neutral-100">{formatDate(proposal.createdAt)}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(proposal.status)}`}>
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </span>
                      </div>

                      {/* Mobile Action Sheet */}
                      {showActionSheet === proposal._id && (
                        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-900/50 space-y-2">
                          {proposal.status === 'Pending' ? (
                            <>
                              <button
                                onClick={() => {
                                  handleApprove(proposal._id)
                                  setShowActionSheet(null)
                                }}
                                className="w-full px-4 py-3 min-h-[44px] bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg font-medium flex items-center gap-2 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                              >
                                <Icon name="check_circle" size={18} />
                                Approve Proposal
                              </button>
                              <button
                                onClick={() => {
                                  handleReject(proposal._id)
                                  setShowActionSheet(null)
                                }}
                                className="w-full px-4 py-3 min-h-[44px] bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg font-medium flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                              >
                                <Icon name="cancel" size={18} />
                                Reject Proposal
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedProposal(proposal)
                                setShowDetailsModal(true)
                                setShowActionSheet(null)
                              }}
                              className="w-full px-4 py-3 min-h-[44px] bg-neutral-100 dark:bg-neutral-900/50 text-primary rounded-lg font-medium flex items-center gap-2 hover:bg-neutral-200 dark:hover:bg-background-dark transition-colors border border-neutral-200 dark:border-neutral-900/50"
                            >
                              <Icon name="visibility" size={18} />
                              View Details
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="bg-neutral-100/50 dark:bg-background-dark">
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-200/60 uppercase tracking-wider">Freelancer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-200/60 uppercase tracking-wider">Job Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-200/60 uppercase tracking-wider">Submitted On</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-200/60 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 dark:text-neutral-200/60 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-900/50">
                    {filteredProposals.map((proposal) => {
                      const freelancer = proposal.freelancerId as any
                      const job = proposal.jobId as any
                      return (
                        <tr key={proposal._id} className="hover:bg-neutral-100/30 dark:hover:bg-background-dark/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gradient-to-br from-primary to-amber-500"
                                style={{
                                  backgroundImage: freelancer?.profileImage
                                    ? `url(${freelancer.profileImage})`
                                    : `url("https://ui-avatars.com/api/?name=${freelancer?.firstName}+${freelancer?.lastName}&background=fd6730&color=fff&size=128")`
                                }}
                              />
                              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {freelancer?.firstName} {freelancer?.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                            {job?.title || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-200/60">
                            {formatDate(proposal.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(proposal.status)}`}>
                              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                            {proposal.status === 'Pending' ? (
                              <>
                                <button
                                  onClick={() => handleApprove(proposal._id)}
                                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(proposal._id)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedProposal(proposal)
                                  setShowDetailsModal(true)
                                }}
                                className="text-primary hover:text-primary/80"
                              >
                                View Details
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-900/50 px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <a className="relative inline-flex items-center rounded-md border border-neutral-200 dark:border-neutral-900/50 bg-white dark:bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-200/60 hover:bg-neutral-100/50 dark:hover:bg-background-dark" href="#">Previous</a>
            <a className="relative ml-3 inline-flex items-center rounded-md border border-neutral-200 dark:border-neutral-900/50 bg-white dark:bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-200/60 hover:bg-neutral-100/50 dark:hover:bg-background-dark" href="#">Next</a>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-200/60">
                Showing <span className="font-medium">{filteredProposals.length > 0 ? 1 : 0}</span> to{' '}
                <span className="font-medium">{filteredProposals.length}</span> of{' '}
                <span className="font-medium">{proposals.length}</span> results
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Details Modal */}
      {showDetailsModal && selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-2xl w-full shadow-2xl border border-neutral-200 dark:border-neutral-900/50 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Proposal Details</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-mono">
                  ID: #{selectedProposal._id.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Icon name="close" size={24} className="text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>

            {/* Job Information */}
            <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-xs uppercase font-semibold text-primary mb-2">Job Title</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {(selectedProposal.jobId as any)?.title || 'N/A'}
              </p>
            </div>

            {/* Freelancer Information */}
            <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <p className="text-xs uppercase font-semibold text-neutral-500 mb-3">Freelancer</p>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-500 bg-cover bg-center"
                  style={{
                    backgroundImage: (selectedProposal.freelancerId as any)?.profileImage
                      ? `url(${(selectedProposal.freelancerId as any).profileImage})`
                      : `url("https://ui-avatars.com/api/?name=${(selectedProposal.freelancerId as any)?.firstName}+${(selectedProposal.freelancerId as any)?.lastName}&background=fd6730&color=fff&size=128")`
                  }}
                />
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {(selectedProposal.freelancerId as any)?.firstName} {(selectedProposal.freelancerId as any)?.lastName}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {(selectedProposal.freelancerId as any)?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Proposal Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <p className="text-xs uppercase font-semibold text-neutral-500 mb-2">Proposed Rate</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-white">
                  ₦{(selectedProposal.proposedRate ?? 0).toLocaleString('en-NG')}
                </p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <p className="text-xs uppercase font-semibold text-neutral-500 mb-2">Duration</p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {selectedProposal.duration}
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <p className="text-xs uppercase font-semibold text-neutral-500 mb-2">Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedProposal.status)}`}>
                {selectedProposal.status}
              </span>
            </div>

            {/* Cover Letter */}
            <div className="mb-6">
              <p className="text-sm uppercase font-semibold text-neutral-500 mb-3">Cover Letter</p>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <p className="text-neutral-900 dark:text-neutral-100 leading-relaxed whitespace-pre-wrap">
                  {selectedProposal.coverLetter || 'No cover letter provided.'}
                </p>
              </div>
            </div>

            {/* Attachments */}
            {selectedProposal.attachments && selectedProposal.attachments.length > 0 && (
              <div className="mb-6">
                <p className="text-sm uppercase font-semibold text-neutral-500 mb-3">Attachments</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProposal.attachments.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm text-primary hover:underline"
                    >
                      <Icon name="attachment" size={16} />
                      File {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8">
              {selectedProposal.status === 'Pending' && (
                <>
                  <button
                    onClick={() => {
                      handleReject(selectedProposal._id)
                      setShowDetailsModal(false)
                    }}
                    className="px-6 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    Reject Proposal
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedProposal._id)
                      setShowDetailsModal(false)
                    }}
                    className="px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
                  >
                    Approve Proposal
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-colors font-medium"
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
