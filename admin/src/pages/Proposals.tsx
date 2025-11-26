import { useEffect, useState, useMemo } from 'react'
import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'
import { proposalsAPI } from '../services/api'
import type { Proposal } from '../types'
import toast from 'react-hot-toast'

export default function Proposals() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

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
      const freelancerName = `${proposal.freelancerId?.firstName || ''} ${proposal.freelancerId?.lastName || ''}`.toLowerCase()
      const jobTitle = proposal.jobId?.title?.toLowerCase() || ''
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
    <AppLayout>
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <p className="text-neutral-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight tracking-tight">Proposal Management</p>
              <p className="text-neutral-600 dark:text-neutral-200/60 text-base font-normal leading-normal">Review and manage all submitted proposals.</p>
            </div>
            <button className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark">
              <Icon name="add" size={16} />
              <span className="truncate">Add New Job</span>
            </button>
          </div>

          {/* Filter & Search Section */}
          <div className="mb-6 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-900/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              {/* SearchBar */}
              <div className="lg:col-span-2">
                <label className="flex flex-col h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                    <div className="text-neutral-600 dark:text-neutral-200/60 flex bg-neutral-100 dark:bg-background-dark items-center justify-center pl-4 rounded-l-lg border border-r-0 border-neutral-200 dark:border-neutral-900/50">
                      <Icon name="search" />
                    </div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary border border-l-0 border-neutral-200 dark:border-neutral-900/50 bg-neutral-100 dark:bg-background-dark h-full placeholder:text-neutral-600 dark:placeholder:text-neutral-200/60 pl-2 text-sm font-normal leading-normal"
                      placeholder="Search by freelancer or job..."
                    />
                  </div>
                </label>
              </div>
              {/* Chips / Filters */}
              <div className="lg:col-span-2 flex flex-wrap items-center gap-3">
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
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-900/50 bg-white dark:bg-neutral-900">
            <div className="overflow-x-auto">
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
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Icon name="progress_activity" size={32} className="animate-spin text-primary" />
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading proposals...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProposals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Icon name="inbox" size={48} className="text-neutral-300 dark:text-neutral-700" />
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">No proposals found</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No proposals have been submitted yet'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProposals.map((proposal) => (
                      <tr key={proposal._id} className="hover:bg-neutral-100/30 dark:hover:bg-background-dark/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gradient-to-br from-primary to-amber-500"
                              style={{ 
                                backgroundImage: proposal.freelancerId?.profileImage 
                                  ? `url(${proposal.freelancerId.profileImage})` 
                                  : `url("https://ui-avatars.com/api/?name=${proposal.freelancerId?.firstName}+${proposal.freelancerId?.lastName}&background=fd6730&color=fff&size=128")`
                              }}
                            />
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {proposal.freelancerId?.firstName} {proposal.freelancerId?.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                          {proposal.jobId?.title || 'N/A'}
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
                          {proposal.status === 'pending' ? (
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
                              onClick={() => toast.info(`Proposal ${proposal.status}`, { icon: '📋' })}
                              className="text-primary hover:text-primary/80"
                            >
                              View Details
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
        </div>
      </main>
    </AppLayout>
  )
}
