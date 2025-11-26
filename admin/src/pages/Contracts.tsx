import { useMemo, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
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

  // Fetch contracts from API
  useEffect(() => {
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

  const summary = useMemo(() => {
    const totals = filteredContracts.reduce(
      (acc: Record<string, number>, c: ContractDisplay) => {
        acc.total += c.amount
        acc.count += 1
        acc[c.status] = (acc[c.status] ?? 0) + 1
        return acc
      },
      { total: 0, count: 0, Active: 0, Completed: 0, 'Pending Signature': 0, Terminated: 0 },
    )
    return totals
  }, [filteredContracts])

  return (
    <AppLayout>
      <main className="flex-1 flex-col p-4 md:p-6 lg:p-8 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-text-light-primary dark:text-dark-primary text-2xl md:text-3xl font-black leading-tight tracking-tighter">Contract Management</p>
            <p className="text-text-light-secondary dark:text-dark-secondary text-base font-normal leading-normal">Track signatures, status, and payouts in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 h-10 rounded-lg px-4 border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary text-sm font-medium hover:bg-primary/10">
              <Icon name="description" size={18} />
              Export CSV
            </button>
            <button className="flex items-center gap-2 h-10 rounded-lg px-4 bg-primary text-white text-sm font-bold">
              <Icon name="add_circle" size={18} />
              New Contract
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard title="Active" value={summary.Active} subtitle="Currently in progress" tone="green" />
          <SummaryCard title="Pending Signatures" value={summary['Pending Signature']} subtitle="Awaiting actions" tone="yellow" />
          <SummaryCard title="Completed" value={summary.Completed} subtitle="Closed & paid" tone="blue" />
          <SummaryCard title="Total Value" value={`₦${summary.total.toLocaleString('en-NG')}`} subtitle="Across filtered contracts" tone="primary" />
        </section>

        <section className="bg-card-light dark:bg-card-dark rounded-xl p-4 md:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="flex w-full sm:w-72 items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3">
                <Icon name="search" className="text-text-light-secondary dark:text-dark-secondary" />
                <input
                  className="w-full bg-transparent h-10 text-sm text-text-light-primary dark:text-dark-primary outline-none"
                  placeholder="Search by client, freelancer, job..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
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
            <div className="flex gap-2">
              <button className="text-sm font-medium text-primary hover:underline">Clear filters</button>
              <button className="flex items-center gap-2 h-10 rounded-lg px-3 bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary text-sm font-medium border border-border-light dark:border-border-dark hover:bg-primary/10">
                <Icon name="more_horiz" />
                Saved views
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto rounded-xl border border-border-light dark:border-border-dark">
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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-text-light-secondary dark:text-dark-secondary">
                        <Icon name="progress_activity" className="animate-spin" size={24} />
                        <span>Loading contracts...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-sm text-text-light-secondary dark:text-dark-secondary">
                      No contracts match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map((c: ContractDisplay) => (
                    <tr key={c._id} className="border-b border-border-light dark:border-border-dark hover:bg-primary/5">
                      <td className="px-4 py-4 align-top">
                        <p className="text-sm font-semibold text-text-light-primary dark:text-dark-primary">{c.jobTitle}</p>
                        <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">{c._id.slice(-8).toUpperCase()}</p>
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
                          ₦{c.amount.toLocaleString('en-NG')}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top text-right">
                        <div className="inline-flex items-center gap-2">
                          <button 
                            className="flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                            onClick={() => toast('View contract details', { icon: '👁️' })}
                          >
                            <Icon name="visibility" size={18} />
                            View
                          </button>
                          <button 
                            className="flex items-center gap-1 text-text-light-secondary dark:text-dark-secondary text-sm font-medium hover:text-primary"
                            onClick={() => toast('Sign contract feature', { icon: '✍️' })}
                          >
                            <Icon name="assignment_turned_in" size={18} />
                            Sign
                          </button>
                          <button className="flex items-center justify-center size-9 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark hover:bg-primary/10">
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

          <div className="flex flex-col sm:flex-row items-center justify-between pt-3 gap-3">
            <p className="text-sm text-text-light-secondary dark:text-dark-secondary text-center sm:text-left">
              Showing {filteredContracts.length} of {totalCount} contracts
            </p>
            <div className="flex items-center gap-2">
              <button className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-primary/10">
                <Icon name="chevron_left" size={20} />
              </button>
              <button className="flex h-9 min-w-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary text-white text-sm">1</button>
              <button className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-primary/10 text-sm">2</button>
              <button className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-primary/10">
                <Icon name="chevron_right" size={20} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </AppLayout>
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
