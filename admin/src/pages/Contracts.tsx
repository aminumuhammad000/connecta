import { useMemo, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { contractsAPI } from '../services/api'
import type { Contract, ContractStatus } from '../types'

const statusStyle: Record<ContractStatus, { bg: string; dot: string; text: string }> = {
  Active: { bg: 'bg-green-100 dark:bg-green-900/50', dot: 'bg-green-500', text: 'text-green-700 dark:text-green-300' },
  'Pending Signature': { bg: 'bg-yellow-100 dark:bg-yellow-900/50', dot: 'bg-yellow-500', text: 'text-yellow-800 dark:text-yellow-300' },
  Completed: { bg: 'bg-blue-100 dark:bg-blue-900/50', dot: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300' },
  Terminated: { bg: 'bg-gray-200 dark:bg-gray-700', dot: 'bg-gray-500', text: 'text-gray-700 dark:text-gray-200' },
}

interface ContractDisplay extends Contract {
  jobTitle?: string
  clientName?: string
  freelancerName?: string
}

export default function Contracts() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | ContractStatus>('all')
  const [dateRange, setDateRange] = useState('all')
  const [contracts, setContracts] = useState<ContractDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [showActionSheet, setShowActionSheet] = useState<string | null>(null)
  const [selectedContract, setSelectedContract] = useState<ContractDisplay | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const fetchContracts = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (status !== 'all') params.status = status
      if (search.trim()) params.search = search.trim()

      const response = await contractsAPI.getAll(params)
      console.log('Contracts response:', response)

      // Handle both response formats: direct array, {data: []}, or {success, data}
      let contractsData = []
      if (Array.isArray(response)) {
        contractsData = response
      } else if (response?.success && response?.data) {
        contractsData = response.data
      } else if (response?.data) {
        contractsData = response.data
      }

      // Transform API data to display format with proper status mapping
      const transformedContracts: ContractDisplay[] = contractsData.map((contract: any) => {
        // Map database status to display status
        let displayStatus: ContractStatus = 'Active'
        if (contract.status === 'completed') displayStatus = 'Completed'
        else if (contract.status === 'pending_signature' || contract.status === 'pending_signatures') displayStatus = 'Pending Signature'
        else if (contract.status === 'terminated') displayStatus = 'Terminated'
        else if (contract.status === 'active') displayStatus = 'Active'

        return {
          ...contract,
          status: displayStatus,
          jobTitle: contract.projectId?.title || contract.title || 'N/A',
          clientName: contract.clientId?.firstName && contract.clientId?.lastName
            ? `${contract.clientId.firstName} ${contract.clientId.lastName}`
            : 'Unknown Client',
          freelancerName: contract.freelancerId?.firstName && contract.freelancerId?.lastName
            ? `${contract.freelancerId.firstName} ${contract.freelancerId.lastName}`
            : 'Unknown Freelancer',
        }
      })

      setContracts(transformedContracts)
      setTotalCount(transformedContracts.length)
    } catch (error) {
      console.error('Error fetching contracts:', error)
      toast.error('Failed to load contracts')
      setContracts([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  // Fetch contracts from API
  useEffect(() => {
    fetchContracts()
  }, [status, search])

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchesSearch = search.trim()
        ? `${c.clientName} ${c.freelancerName} ${c.jobTitle}`.toLowerCase().includes(search.trim().toLowerCase())
        : true
      const matchesStatus = status === 'all' ? true : c.status === status
      const matchesDate = dateRange === 'all' ? true : true // Date filtering can be implemented later
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [contracts, search, status, dateRange])

  const handleViewDetails = (contract: ContractDisplay) => {
    setSelectedContract(contract)
    setShowDetailsModal(true)
    setShowActionSheet(null)
  }

  const summary = useMemo(() => {
    const totals = filteredContracts.reduce(
      (acc: Record<string, number>, c: ContractDisplay) => {
        acc.total += c.amount ?? 0
        acc.count += 1
        acc[c.status] = (acc[c.status] ?? 0) + 1
        return acc
      },
      { total: 0, count: 0, Active: 0, Completed: 0, 'Pending Signature': 0, Terminated: 0 },
    )
    return totals
  }, [filteredContracts])

  return (
    <main className="flex-1 flex-col p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-text-light-primary dark:text-dark-primary text-2xl md:text-3xl font-black leading-tight tracking-tighter">Contract Management</p>
          <p className="text-text-light-secondary dark:text-dark-secondary text-sm sm:text-base font-normal leading-normal">Track signatures, status, and payouts in one place.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchContracts}
            className="flex items-center justify-center gap-2 h-12 sm:h-10 min-h-[44px] sm:min-h-0 rounded-lg px-4 border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary text-sm font-medium hover:bg-primary/10 transition-colors"
          >
            <Icon name="refresh" size={18} />
            Refresh
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Active" value={summary.Active} subtitle="Currently in progress" tone="green" />
        <SummaryCard title="Pending Signatures" value={summary['Pending Signature']} subtitle="Awaiting actions" tone="yellow" />
        <SummaryCard title="Completed" value={summary.Completed} subtitle="Closed & paid" tone="blue" />
        <SummaryCard title="Total Value" value={`₦${summary.total.toLocaleString('en-NG')}`} subtitle="Across filtered contracts" tone="primary" />
      </section>


      <section className="bg-card-light dark:bg-card-dark rounded-xl p-4 md:p-6 border border-border-light dark:border-border-dark space-y-4">
        {/* Search & Filters */}
        <div className="space-y-3">
          {/* Search Bar - Full width */}
          <div className="relative">
            <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-dark-secondary z-10" />
            <input
              className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-lg text-text-light-primary dark:text-dark-primary focus:outline-0 focus:ring-2 focus:ring-primary border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark placeholder:text-text-light-secondary placeholder:dark:text-dark-secondary text-base font-normal leading-normal"
              placeholder="Search by client, freelancer, job..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            {/* Filter Toggle - Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex-1 px-4 py-3 min-h-[44px] bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary font-medium flex items-center justify-between hover:bg-border-light dark:hover:bg-border-dark transition-colors"
            >
              <span className="flex items-center gap-2">
                <Icon name="filter_list" size={20} />
                Filters
              </span>
              <Icon name={showFilters ? "expand_less" : "expand_more"} size={20} />
            </button>

            {/* Filters - Desktop */}
            <div className="hidden lg:flex gap-3 flex-1">
              <FilterSelect
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ContractStatus | 'all')}
                options={[
                  { value: 'all', label: 'All statuses' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Pending Signature', label: 'Pending signature' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Terminated', label: 'Terminated' },
                ]}
                icon="tune"
              />
              <FilterSelect
                label="Date Range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                options={[
                  { value: 'all', label: 'Any time' },
                  { value: '30', label: 'Last 30 days' },
                  { value: '90', label: 'Last 90 days' },
                  { value: '365', label: 'Last 12 months' },
                ]}
                icon="calendar_today"
              />
            </div>

            {/* Action Buttons */}
            <div className="hidden sm:flex gap-2">
              <button className="text-sm font-medium text-primary hover:underline whitespace-nowrap px-2">Clear filters</button>
              <button className="flex items-center gap-2 h-10 rounded-lg px-3 bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary text-sm font-medium border border-border-light dark:border-border-dark hover:bg-primary/10 transition-colors">
                <Icon name="more_horiz" size={18} />
                <span className="hidden md:inline">Saved views</span>
              </button>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-96' : 'max-h-0'}`}>
            <div className="space-y-3 pt-2">
              {/* Status Filter - Mobile */}
              <div>
                <label className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase mb-2 block">Status</label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All statuses' },
                    { value: 'Active', label: 'Active' },
                    { value: 'Pending Signature', label: 'Pending signature' },
                    { value: 'Completed', label: 'Completed' },
                    { value: 'Terminated', label: 'Terminated' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatus(option.value as any)
                        setShowFilters(false)
                      }}
                      className={`w-full px-4 py-3 min-h-[44px] rounded-lg text-left font-medium transition-colors ${status === option.value
                        ? 'bg-primary text-white'
                        : 'bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-border-light dark:hover:bg-border-dark border border-border-light dark:border-border-dark'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range - Mobile */}
              <div>
                <label className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase mb-2 block">Date Range</label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'Any time' },
                    { value: '30', label: 'Last 30 days' },
                    { value: '90', label: 'Last 90 days' },
                    { value: '365', label: 'Last 12 months' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDateRange(option.value)
                        setShowFilters(false)
                      }}
                      className={`w-full px-4 py-3 min-h-[44px] rounded-lg text-left font-medium transition-colors ${dateRange === option.value
                        ? 'bg-primary text-white'
                        : 'bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-border-light dark:hover:bg-border-dark border border-border-light dark:border-border-dark'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Actions */}
              <button
                onClick={() => {
                  setStatus('all')
                  setDateRange('all')
                  setShowFilters(false)
                }}
                className="w-full px-4 py-3 min-h-[44px] text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>


        {/* Contracts List - Mobile Cards / Desktop Table */}
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Icon name="progress_activity" className="animate-spin" size={32} />
              <span className="text-base font-medium text-text-light-secondary dark:text-dark-secondary mt-3">Loading contracts...</span>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="flex flex-col items-center py-20">
              <Icon name="description" size={48} className="text-text-light-secondary dark:text-dark-secondary opacity-50" />
              <p className="text-text-light-secondary dark:text-dark-secondary mt-3">No contracts match your filters.</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4 p-4 max-w-2xl mx-auto">
                {filteredContracts.map((c: ContractDisplay) => (
                  <div key={c._id} className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-text-light-primary dark:text-dark-primary mb-1 line-clamp-2">
                          {c.jobTitle}
                        </h3>
                        <p className="text-xs text-text-light-secondary dark:text-dark-secondary font-mono">
                          #{c._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowActionSheet(showActionSheet === c._id ? null : c._id)}
                        className="p-2 hover:bg-card-light dark:hover:bg-card-dark rounded-lg transition-colors flex-shrink-0"
                        aria-label="Contract actions"
                      >
                        <Icon name="more_vert" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
                      </button>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Icon name="person" size={16} className="text-text-light-secondary dark:text-dark-secondary" />
                        <span className="text-sm text-text-light-secondary dark:text-dark-secondary">
                          Client: <span className="font-medium text-text-light-primary dark:text-dark-primary">{c.clientName}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="work" size={16} className="text-text-light-secondary dark:text-dark-secondary" />
                        <span className="text-sm text-text-light-secondary dark:text-dark-secondary">
                          Freelancer: <span className="font-medium text-text-light-primary dark:text-dark-primary">{c.freelancerName}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <StatusPill status={c.status} />
                      <div className="flex items-center gap-1.5 text-xs text-text-light-secondary dark:text-dark-secondary">
                        <Icon name="calendar_today" size={14} />
                        <span>
                          {new Date(c.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {c.endDate && ` - ${new Date(c.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-light-secondary dark:text-dark-secondary">Amount</span>
                      <span className="text-base font-bold text-text-light-primary dark:text-dark-primary">
                        ₦{(c.amount ?? 0).toLocaleString('en-NG')}
                      </span>
                    </div>

                    {/* Mobile Action Sheet */}
                    {showActionSheet === c._id && (
                      <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark space-y-2">
                        <button
                          onClick={() => handleViewDetails(c)}
                          className="w-full px-4 py-3 min-h-[44px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
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
              <div className="hidden lg:block overflow-x-auto rounded-xl border border-border-light dark:border-border-dark">
                <table className="w-full text-left min-w-[720px]">
                  <thead className="bg-background-light dark:bg-background-dark">
                    <tr className="border-b border-border-light dark:border-border-dark">
                      <th className="px-4 py-3 text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wide">Contract</th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wide">Parties</th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wide">Dates</th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wide">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContracts.map((c: ContractDisplay) => (
                      <tr key={c._id} className="border-b border-border-light dark:border-border-dark hover:bg-primary/5 transition-colors">
                        <td className="px-4 py-4 align-top">
                          <p className="text-sm font-semibold text-text-light-primary dark:text-dark-primary">{c.jobTitle}</p>
                          <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">#{c._id.slice(-8).toUpperCase()}</p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="text-sm text-text-light-primary dark:text-dark-primary">
                            Client: <span className="font-medium">{c.clientName}</span>
                          </p>
                          <p className="text-sm text-text-light-primary dark:text-dark-primary">
                            Freelancer: <span className="font-medium">{c.freelancerName}</span>
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <StatusPill status={c.status} />
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="text-sm text-text-light-secondary dark:text-dark-secondary">
                            {new Date(c.startDate).toLocaleDateString()}
                            {c.endDate && ` - ${new Date(c.endDate).toLocaleDateString()}`}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="text-sm font-semibold text-text-light-primary dark:text-dark-primary">
                            ₦{(c.amount ?? 0).toLocaleString('en-NG')}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary text-sm font-medium bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                            onClick={() => handleViewDetails(c)}
                          >
                            <Icon name="visibility" size={18} />
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
        <div className="flex flex-col sm:flex-row items-center justify-between pt-3 gap-3">
          <p className="text-sm text-text-light-secondary dark:text-dark-secondary text-center sm:text-left">
            Showing {filteredContracts.length} of {totalCount} contracts
          </p>
          <div className="flex items-center gap-2">
            <button className="flex h-11 w-11 sm:h-9 sm:w-9 min-h-[44px] sm:min-h-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-primary/10 transition-colors border border-border-light dark:border-border-dark">
              <Icon name="chevron_left" size={20} />
            </button>
            <button className="flex h-11 min-w-11 sm:h-9 sm:min-w-9 min-h-[44px] sm:min-h-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary text-white text-sm px-2">1</button>
            <button className="flex h-11 w-11 sm:h-9 sm:w-9 min-h-[44px] sm:min-h-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-primary/10 transition-colors text-sm border border-border-light dark:border-border-dark">2</button>
            <button className="flex h-11 w-11 sm:h-9 sm:w-9 min-h-[44px] sm:min-h-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-primary/10 transition-colors border border-border-light dark:border-border-dark">
              <Icon name="chevron_right" size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Contract Details Modal */}
      {showDetailsModal && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 max-w-2xl w-full shadow-2xl border border-border-light dark:border-border-dark max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-light-primary dark:text-dark-primary">Contract Details</h2>
                <p className="text-sm text-text-light-secondary dark:text-dark-secondary mt-1 font-mono">
                  ID: #{selectedContract._id.toUpperCase()}
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
            <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-xs uppercase font-semibold text-primary mb-2">Project / Job</p>
              <p className="text-lg font-semibold text-text-light-primary dark:text-dark-primary">
                {selectedContract.jobTitle}
              </p>
            </div>

            {/* Parties Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
                <p className="text-xs uppercase font-semibold text-text-light-secondary dark:text-dark-secondary mb-3">Client</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Icon name="person" size={20} />
                  </div>
                  <p className="font-semibold text-text-light-primary dark:text-dark-primary">
                    {selectedContract.clientName}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
                <p className="text-xs uppercase font-semibold text-text-light-secondary dark:text-dark-secondary mb-3">Freelancer</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Icon name="work" size={20} />
                  </div>
                  <p className="font-semibold text-text-light-primary dark:text-dark-primary">
                    {selectedContract.freelancerName}
                  </p>
                </div>
              </div>
            </div>

            {/* Status & Amount */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
                <p className="text-xs uppercase font-semibold text-text-light-secondary dark:text-dark-secondary mb-2">Status</p>
                <StatusPill status={selectedContract.status} />
              </div>
              <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
                <p className="text-xs uppercase font-semibold text-text-light-secondary dark:text-dark-secondary mb-2">Contract Amount</p>
                <p className="text-lg font-bold text-text-light-primary dark:text-dark-primary">
                  ₦{(selectedContract.amount ?? 0).toLocaleString('en-NG')}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="mb-6 p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
              <p className="text-xs uppercase font-semibold text-text-light-secondary dark:text-dark-secondary mb-3">Duration</p>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-text-light-secondary dark:text-dark-secondary">Start Date</p>
                  <p className="font-medium text-text-light-primary dark:text-dark-primary">
                    {new Date(selectedContract.startDate).toLocaleDateString('en-US', { dateStyle: 'long' })}
                  </p>
                </div>
                {selectedContract.endDate && (
                  <div>
                    <p className="text-xs text-text-light-secondary dark:text-dark-secondary">End Date</p>
                    <p className="font-medium text-text-light-primary dark:text-dark-primary">
                      {new Date(selectedContract.endDate).toLocaleDateString('en-US', { dateStyle: 'long' })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Terms / Description */}
            <div className="mb-6">
              <p className="text-sm uppercase font-semibold text-text-light-secondary dark:text-dark-secondary mb-3">Contract Terms</p>
              <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
                <p className="text-text-light-primary dark:text-dark-primary leading-relaxed whitespace-pre-wrap">
                  {selectedContract.terms || 'No detailed terms provided for this contract.'}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
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

function StatusPill({ status }: { status: ContractStatus }) {
  const tone = statusStyle[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.bg} ${tone.text}`}>
      <span className={`size-1.5 rounded-full ${tone.dot}`} />
      {status}
    </span>
  )
}

function SummaryCard({ title, value, subtitle, tone }: { title: string; value: string | number; subtitle: string; tone: 'green' | 'yellow' | 'blue' | 'primary' }) {
  const toneMap: Record<'green' | 'yellow' | 'blue' | 'primary', { bg: string; text: string }> = {
    green: { bg: 'bg-green-100/70 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-200' },
    yellow: { bg: 'bg-yellow-100/70 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-200' },
    blue: { bg: 'bg-blue-100/70 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-200' },
    primary: { bg: 'bg-primary/10', text: 'text-primary' },
  }
  return (
    <div className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-light-secondary dark:text-dark-secondary">{title}</p>
        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${toneMap[tone].bg} ${toneMap[tone].text}`}>Now</span>
      </div>
      <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary mt-2">{value}</p>
      <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">{subtitle}</p>
    </div>
  )
}

function FilterSelect({
  value,
  onChange,
  options,
  icon,
}: {
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
  icon: string
}) {
  return (
    <label className="flex items-center gap-2 h-10 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 text-sm text-text-light-primary dark:text-dark-primary">
      <Icon name={icon} className="text-text-light-secondary dark:text-dark-secondary" size={18} />
      <select
        value={value}
        onChange={onChange}
        className="bg-transparent outline-none text-sm w-full text-text-light-primary dark:text-dark-primary"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  )
}
