import { useEffect, useState, useMemo } from 'react'
import Icon from '../components/Icon'
import { paymentsAPI } from '../services/api'
import type { Payment } from '../types'
import toast from 'react-hot-toast'

export default function Payments() {
  const [activeTab, setActiveTab] = useState<'payments' | 'withdrawals' | 'wallets'>('payments')
  const [payments, setPayments] = useState<Payment[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [wallets, setWallets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showActionSheet, setShowActionSheet] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingWithdrawals: 0,
    successfulTransactions: 0
  })

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments()
    } else if (activeTab === 'withdrawals') {
      fetchWithdrawals()
    } else if (activeTab === 'wallets') {
      fetchWallets()
    }
    fetchStats()
  }, [activeTab])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await paymentsAPI.getAll()
      const paymentsData = Array.isArray(response) ? response : response?.data || []
      setPayments(paymentsData)
    } catch (error) {
      console.error('Failed to fetch payments:', error)
      toast.error('Failed to load payments')
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      const response = await paymentsAPI.getAllWithdrawals()
      const withdrawalsData = Array.isArray(response) ? response : response?.data || []
      setWithdrawals(withdrawalsData)
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error)
      toast.error('Failed to load withdrawals')
      setWithdrawals([])
    } finally {
      setLoading(false)
    }
  }

  const fetchWallets = async () => {
    try {
      setLoading(true)
      const response = await paymentsAPI.getAllWallets()
      const walletsData = Array.isArray(response) ? response : response?.data || []
      setWallets(walletsData)
    } catch (error) {
      console.error('Failed to fetch wallets:', error)
      toast.error('Failed to load wallets')
      setWallets([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await paymentsAPI.getAll()
      const paymentsData = Array.isArray(response) ? response : response?.data || []

      const totalRevenue = paymentsData
        .filter((p: any) => p.status === 'completed')
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

      const pendingWithdrawals = paymentsData
        .filter((p: any) => p.status === 'pending')
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

      const successfulTransactions = paymentsData.filter((p: any) => p.status === 'completed').length

      setStats({ totalRevenue, pendingWithdrawals, successfulTransactions })
    } catch (error) {
      console.error('Failed to fetch payment stats:', error)
    }
  }

  const filteredData = useMemo(() => {
    if (activeTab === 'payments') {
      return payments.filter((payment: any) => {
        const matchesSearch =
          payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.amount?.toString().includes(searchTerm) ||
          payment.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
        return matchesSearch && matchesStatus
      })
    } else if (activeTab === 'withdrawals') {
      return withdrawals.filter((withdrawal: any) => {
        const matchesSearch =
          withdrawal._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          withdrawal.amount?.toString().includes(searchTerm) ||
          withdrawal.bankDetails?.bankName?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter
        return matchesSearch && matchesStatus
      })
    } else {
      return wallets.filter((wallet: any) => {
        const matchesSearch =
          wallet.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wallet.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wallet.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
      })
    }
  }, [payments, withdrawals, wallets, searchTerm, statusFilter, activeTab])

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400',
      pending: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400',
      failed: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400',
      processing: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400'
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewDetails = (payment: any) => {
    setSelectedPayment(payment)
    setShowModal(true)
  }

  return (
    <>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-text-light-primary dark:text-dark-primary text-2xl md:text-4xl font-black leading-tight tracking-tighter">Payments & Withdrawals</h1>
              <p className="text-text-light-secondary dark:text-dark-secondary text-sm sm:text-base font-normal leading-normal">Monitor and manage all financial transactions within the platform.</p>
            </div>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg h-12 sm:h-10 min-h-[44px] sm:min-h-0 px-5 bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary text-sm font-bold leading-normal hover:bg-border-light dark:hover:bg-border-dark transition-colors border border-border-light dark:border-border-dark">
              <Icon name="download" size={16} />
              <span>Export Report</span>
            </button>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col gap-2 rounded-xl p-6 border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
              <p className="text-text-light-secondary dark:text-dark-secondary text-base font-medium leading-normal">Total Platform Revenue</p>
              <p className="text-text-light-primary dark:text-dark-primary tracking-tight text-3xl font-bold leading-tight">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-green-600 dark:text-green-500 text-sm font-medium leading-normal">+5.2% vs last month</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
              <p className="text-text-light-secondary dark:text-dark-secondary text-base font-medium leading-normal">Pending Withdrawals</p>
              <p className="text-text-light-primary dark:text-dark-primary tracking-tight text-3xl font-bold leading-tight">{formatCurrency(stats.pendingWithdrawals)}</p>
              <p className="text-yellow-600 dark:text-yellow-500 text-sm font-medium leading-normal">Awaiting approval</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
              <p className="text-text-light-secondary dark:text-dark-secondary text-base font-medium leading-normal">Successful Transactions</p>
              <p className="text-text-light-primary dark:text-dark-primary tracking-tight text-3xl font-bold leading-tight">{stats.successfulTransactions.toLocaleString()}</p>
              <p className="text-green-600 dark:text-green-500 text-sm font-medium leading-normal">+10.1% vs last month</p>
            </div>
          </section>

          <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark">
            <nav className="pb-3 overflow-x-auto scrollbar-hide">
              <div className="flex min-w-max border-b border-border-light dark:border-border-dark px-4 md:px-6 gap-4 md:gap-8">
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 transition-colors ${activeTab === 'payments' ? 'border-b-primary text-primary' : 'border-b-transparent text-text-light-secondary dark:text-dark-secondary hover:text-text-light-primary dark:hover:text-dark-primary'}`}
                >
                  <p className="text-sm font-bold leading-normal">Payment History</p>
                </button>
                <button
                  onClick={() => setActiveTab('withdrawals')}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 transition-colors ${activeTab === 'withdrawals' ? 'border-b-primary text-primary' : 'border-b-transparent text-text-light-secondary dark:text-dark-secondary hover:text-text-light-primary dark:hover:text-dark-primary'}`}
                >
                  <p className="text-sm font-bold leading-normal">Withdrawal List</p>
                </button>
                <button
                  onClick={() => setActiveTab('wallets')}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 transition-colors ${activeTab === 'wallets' ? 'border-b-primary text-primary' : 'border-b-transparent text-text-light-secondary dark:text-dark-secondary hover:text-text-light-primary dark:hover:text-dark-primary'}`}
                >
                  <p className="text-sm font-bold leading-normal">Wallet Balances</p>
                </button>
              </div>
            </nav>

            <div className="space-y-3 px-4 sm:px-6 py-4">
              <div className="relative">
                <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-dark-secondary z-10" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-lg text-text-light-primary dark:text-dark-primary focus:outline-0 focus:ring-2 focus:ring-primary border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark placeholder:text-text-light-secondary placeholder:dark:text-dark-secondary text-base font-normal"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex-1 px-4 py-3 min-h-[44px] bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary font-medium flex items-center justify-between hover:bg-border-light dark:hover:bg-border-dark transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Icon name="filter_list" size={20} />
                    Filters
                  </span>
                  <Icon name={showFilters ? "expand_less" : "expand_more"} size={20} />
                </button>

                <div className="hidden md:flex gap-3 w-full">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 px-4 py-2 h-10 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-sm text-text-light-primary dark:text-dark-primary focus:ring-primary focus:border-primary"
                  >
                    <option value="all">Status: All</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                  <input type="date" className="flex-1 px-4 py-2 h-10 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-sm text-text-light-primary dark:text-dark-primary focus:ring-primary focus:border-primary" />
                </div>
              </div>

              <div className={`md:hidden overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-96' : 'max-h-0'}`}>
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase mb-2 block">Status</label>
                    <div className="space-y-2">
                      {['all', 'completed', 'pending', 'failed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status)
                            setShowFilters(false)
                          }}
                          className={`w-full px-4 py-3 min-h-[44px] rounded-lg text-left font-medium transition-colors capitalize ${statusFilter === status
                            ? 'bg-primary text-white'
                            : 'bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-border-light dark:hover:bg-border-dark border border-border-light dark:border-border-dark'
                            }`}
                        >
                          {status === 'all' ? 'Status: All' : status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-text-light-secondary dark:text-dark-secondary font-medium">Loading {activeTab}...</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="flex flex-col items-center py-20">
                  <Icon name={activeTab === 'payments' ? "credit_card" : "account_balance_wallet"} size={48} className="mx-auto mb-4 opacity-50 text-text-light-secondary dark:text-dark-secondary" />
                  <p className="text-lg font-medium text-text-light-secondary dark:text-dark-secondary">No {activeTab} found</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4 p-4 max-w-2xl mx-auto">
                    {filteredData.map((item: any) => (
                      <div key={item._id} className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                        {activeTab === 'payments' ? (
                          <>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-text-light-secondary dark:text-dark-secondary font-mono mb-1">{item.transactionId || 'N/A'}</p>
                                <p className="text-base font-bold text-text-light-primary dark:text-dark-primary">{formatCurrency(item.amount)}</p>
                              </div>
                              <button onClick={() => setShowActionSheet(showActionSheet === item._id ? null : item._id)} className="p-2 hover:bg-card-light dark:hover:bg-card-dark rounded-lg transition-colors flex-shrink-0">
                                <Icon name="more_vert" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
                              </button>
                            </div>
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Icon name="person" size={16} className="text-text-light-secondary dark:text-dark-secondary flex-shrink-0" />
                                <span className="text-text-light-secondary dark:text-dark-secondary">From: <span className="font-medium text-text-light-primary dark:text-dark-primary">{item.payerId?.firstName} {item.payerId?.lastName}</span></span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Icon name="arrow_forward" size={16} className="text-text-light-secondary dark:text-dark-secondary flex-shrink-0" />
                                <span className="text-text-light-secondary dark:text-dark-secondary">To: <span className="font-medium text-text-light-primary dark:text-dark-primary">{item.payeeId?.firstName} {item.payeeId?.lastName}</span></span>
                              </div>
                            </div>
                          </>
                        ) : activeTab === 'withdrawals' ? (
                          <>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-text-light-secondary dark:text-dark-secondary font-mono mb-1">{item._id}</p>
                                <p className="text-base font-bold text-text-light-primary dark:text-dark-primary">{formatCurrency(item.amount)}</p>
                              </div>
                              <button onClick={() => setShowActionSheet(showActionSheet === item._id ? null : item._id)} className="p-2 hover:bg-card-light dark:hover:bg-card-dark rounded-lg transition-colors flex-shrink-0">
                                <Icon name="more_vert" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
                              </button>
                            </div>
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Icon name="person" size={16} className="text-text-light-secondary dark:text-dark-secondary flex-shrink-0" />
                                <span className="text-text-light-secondary dark:text-dark-secondary">User: <span className="font-medium text-text-light-primary dark:text-dark-primary">{item.userId?.firstName} {item.userId?.lastName}</span></span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Icon name="account_balance" size={16} className="text-text-light-secondary dark:text-dark-secondary flex-shrink-0" />
                                <span className="text-text-light-secondary dark:text-dark-secondary">Bank: <span className="font-medium text-text-light-primary dark:text-dark-primary">{item.bankDetails?.bankName}</span></span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-bold text-text-light-primary dark:text-dark-primary">{item.userId?.firstName} {item.userId?.lastName}</p>
                                <p className="text-sm text-text-light-secondary dark:text-dark-secondary">{item.userId?.email}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="bg-card-light dark:bg-card-dark p-2 rounded border border-border-light dark:border-border-dark">
                                <p className="text-xs text-text-light-secondary dark:text-dark-secondary">Balance</p>
                                <p className="text-sm font-bold">{formatCurrency(item.balance)}</p>
                              </div>
                              <div className="bg-card-light dark:bg-card-dark p-2 rounded border border-border-light dark:border-border-dark">
                                <p className="text-xs text-text-light-secondary dark:text-dark-secondary">Escrow</p>
                                <p className="text-sm font-bold">{formatCurrency(item.escrowBalance)}</p>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusBadge(item.status || (item.isActive ? 'completed' : 'failed'))}`}>
                            <span className="w-2 h-2 mr-1 bg-current rounded-full"></span>
                            {item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : (item.isActive ? 'Active' : 'Inactive')}
                          </span>
                          <span className="text-xs text-text-light-secondary dark:text-dark-secondary">{formatDate(item.createdAt)}</span>
                        </div>

                        {showActionSheet === item._id && (
                          <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark space-y-2">
                            <button onClick={() => { if (activeTab === 'payments') handleViewDetails(item); setShowActionSheet(null); }} className="w-full px-4 py-3 min-h-[44px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                              <Icon name="visibility" size={18} /> View Details
                            </button>
                            {activeTab === 'withdrawals' && item.status === 'pending' && (
                              <button onClick={async () => { try { await paymentsAPI.processWithdrawal(item._id); toast.success('Withdrawal processed!'); fetchWithdrawals(); } catch (error) { toast.error('Failed to process withdrawal'); } setShowActionSheet(null); }} className="w-full px-4 py-3 min-h-[44px] bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg font-medium flex items-center gap-2 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                                <Icon name="check_circle" size={18} /> Process Withdrawal
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-light-secondary dark:text-dark-secondary min-w-[640px]">
                      <thead className="text-xs text-text-light-secondary dark:text-dark-secondary uppercase bg-background-light dark:bg-background-dark">
                        {activeTab === 'payments' ? (
                          <tr>
                            <th scope="col" className="px-6 py-3">Transaction ID</th>
                            <th scope="col" className="px-6 py-3">From</th>
                            <th scope="col" className="px-6 py-3">To</th>
                            <th scope="col" className="px-6 py-3">Amount</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        ) : activeTab === 'withdrawals' ? (
                          <tr>
                            <th scope="col" className="px-6 py-3">Withdrawal ID</th>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Bank Details</th>
                            <th scope="col" className="px-6 py-3">Amount</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        ) : (
                          <tr>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Balance</th>
                            <th scope="col" className="px-6 py-3">Escrow Balance</th>
                            <th scope="col" className="px-6 py-3">Available</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {filteredData.map((item: any) => (
                          <tr key={item._id} className="bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                            {activeTab === 'payments' ? (
                              <>
                                <td className="px-6 py-4 font-mono text-text-light-secondary dark:text-dark-secondary">{item.transactionId || 'N/A'}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-text-light-primary dark:text-dark-primary whitespace-nowrap">
                                  {item.payerId?.firstName} {item.payerId?.lastName}
                                </th>
                                <td className="px-6 py-4">{item.payeeId?.firstName} {item.payeeId?.lastName}</td>
                                <td className="px-6 py-4 font-medium text-text-light-primary dark:text-dark-primary">{formatCurrency(item.amount)}</td>
                                <td className="px-6 py-4">{formatDate(item.createdAt)}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusBadge(item.status)}`}>
                                    <span className="w-2 h-2 mr-1 bg-current rounded-full"></span>
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button onClick={() => handleViewDetails(item)} className="font-medium text-primary hover:underline">View Details</button>
                                </td>
                              </>
                            ) : activeTab === 'withdrawals' ? (
                              <>
                                <td className="px-6 py-4 font-mono text-text-light-secondary dark:text-dark-secondary">{item._id}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-text-light-primary dark:text-dark-primary whitespace-nowrap">
                                  {item.userId?.firstName} {item.userId?.lastName}
                                </th>
                                <td className="px-6 py-4">
                                  <p className="font-medium">{item.bankDetails?.bankName}</p>
                                  <p className="text-xs">{item.bankDetails?.accountNumber}</p>
                                </td>
                                <td className="px-6 py-4 font-medium text-text-light-primary dark:text-dark-primary">{formatCurrency(item.amount)}</td>
                                <td className="px-6 py-4">{formatDate(item.createdAt)}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusBadge(item.status)}`}>
                                    <span className="w-2 h-2 mr-1 bg-current rounded-full"></span>
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {item.status === 'pending' && (
                                    <button onClick={async () => { try { await paymentsAPI.processWithdrawal(item._id); toast.success('Withdrawal processed!'); fetchWithdrawals(); } catch (error) { toast.error('Failed to process withdrawal'); } }} className="font-medium text-green-600 hover:underline">Process</button>
                                  )}
                                </td>
                              </>
                            ) : (
                              <>
                                <th scope="row" className="px-6 py-4 font-medium text-text-light-primary dark:text-dark-primary whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{item.userId?.firstName?.[0]}{item.userId?.lastName?.[0]}</div>
                                    <div>
                                      <p>{item.userId?.firstName} {item.userId?.lastName}</p>
                                      <p className="text-xs font-normal text-text-light-secondary">{item.userId?.email}</p>
                                    </div>
                                  </div>
                                </th>
                                <td className="px-6 py-4 font-medium text-text-light-primary dark:text-dark-primary">{formatCurrency(item.balance)}</td>
                                <td className="px-6 py-4">{formatCurrency(item.escrowBalance)}</td>
                                <td className="px-6 py-4 font-bold text-primary">{formatCurrency(item.availableBalance)}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {item.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button className="text-primary hover:underline">View History</button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <nav aria-label="Table navigation" className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4">
              <span className="text-sm font-normal text-text-light-secondary dark:text-dark-secondary text-center sm:text-left">
                Showing <span className="font-semibold text-text-light-primary dark:text-dark-primary">{Math.min(filteredData.length, 1)}-{Math.min(filteredData.length, 10)}</span> of <span className="font-semibold text-text-light-primary dark:text-dark-primary">{filteredData.length}</span>
              </span>
              <ul className="inline-flex items-stretch -space-x-px">
                <li><button className="flex items-center justify-center h-11 w-11 sm:h-auto sm:w-auto min-h-[44px] sm:min-h-0 sm:py-1.5 sm:px-3 ml-0 text-text-light-secondary bg-card-light rounded-l-lg border border-border-light hover:bg-background-light hover:text-text-light-primary dark:bg-card-dark dark:border-border-dark dark:text-dark-secondary dark:hover:bg-background-dark dark:hover:text-dark-primary transition-colors"><Icon name="chevron_left" size={16} /></button></li>
                <li><button className="flex items-center justify-center h-11 w-11 sm:h-auto sm:w-auto min-h-[44px] sm:min-h-0 text-sm sm:py-2 sm:px-3 leading-tight text-text-light-secondary bg-card-light border border-border-light hover:bg-background-light hover:text-text-light-primary dark:bg-card-dark dark:border-border-dark dark:text-dark-secondary dark:hover:bg-background-dark dark:hover:text-dark-primary transition-colors">1</button></li>
                <li><button className="flex items-center justify-center h-11 w-11 sm:h-auto sm:w-auto min-h-[44px] sm:min-h-0 sm:py-1.5 sm:px-3 leading-tight text-text-light-secondary bg-card-light rounded-r-lg border border-border-light hover:bg-background-light hover:text-text-light-primary dark:bg-card-dark dark:border-border-dark dark:text-dark-secondary dark:hover:bg-background-dark dark:hover:text-dark-primary transition-colors"><Icon name="chevron_right" size={16} /></button></li>
              </ul>
            </nav>
          </div>
        </div>
      </main>

      {showModal && selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div className="inline-block align-bottom bg-card-light dark:bg-card-dark rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-background-light dark:bg-background-dark px-6 py-4 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-text-light-primary dark:text-dark-primary">Payment Details</h3>
                    <p className="text-sm text-text-light-secondary dark:text-dark-secondary mt-1">Transaction ID: {selectedPayment.transactionId}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-text-light-secondary hover:text-text-light-primary dark:hover:text-dark-primary"><Icon name="close" size={24} /></button>
                </div>
              </div>
              <div className="px-6 py-5 space-y-6">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center text-sm font-medium px-4 py-2 rounded-full ${getStatusBadge(selectedPayment.status)}`}>
                    <span className="w-2 h-2 mr-2 bg-current rounded-full"></span>
                    {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-text-light-secondary dark:text-dark-secondary">Amount</p>
                    <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-text-light-primary dark:text-dark-primary uppercase tracking-wide">Payer (From)</h4>
                    <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">{selectedPayment.payerId?.firstName?.[0]}{selectedPayment.payerId?.lastName?.[0]}</div>
                        <div>
                          <p className="font-medium text-text-light-primary dark:text-dark-primary">{selectedPayment.payerId?.firstName} {selectedPayment.payerId?.lastName}</p>
                          <p className="text-sm text-text-light-secondary dark:text-dark-secondary">{selectedPayment.payerId?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-text-light-primary dark:text-dark-primary uppercase tracking-wide">Payee (To)</h4>
                    <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">{selectedPayment.payeeId?.firstName?.[0]}{selectedPayment.payeeId?.lastName?.[0]}</div>
                        <div>
                          <p className="font-medium text-text-light-primary dark:text-dark-primary">{selectedPayment.payeeId?.firstName} {selectedPayment.payeeId?.lastName}</p>
                          <p className="text-sm text-text-light-secondary dark:text-dark-secondary">{selectedPayment.payeeId?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {selectedPayment.projectId && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-text-light-primary dark:text-dark-primary uppercase tracking-wide">Project</h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Icon name="work" className="text-blue-600 dark:text-blue-400 mt-1" />
                        <div>
                          <p className="font-medium text-text-light-primary dark:text-dark-primary">{selectedPayment.projectId.title}</p>
                          <p className="text-sm text-text-light-secondary dark:text-dark-secondary mt-1">Project ID: {selectedPayment.projectId._id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-text-light-primary dark:text-dark-primary uppercase tracking-wide">Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-border-light dark:border-border-dark">
                      <span className="text-sm text-text-light-secondary dark:text-dark-secondary">Created</span>
                      <span className="text-sm font-medium text-text-light-primary dark:text-dark-primary">{formatDateTime(selectedPayment.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-text-light-secondary dark:text-dark-secondary">Last Updated</span>
                      <span className="text-sm font-medium text-text-light-primary dark:text-dark-primary">{formatDateTime(selectedPayment.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-background-light dark:bg-background-dark px-6 py-4 border-t border-border-light dark:border-border-dark flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-text-light-secondary dark:text-dark-secondary bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-background-light dark:hover:bg-background-dark">Close</button>
                <button onClick={() => toast.success('Receipt downloaded!')} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 flex items-center gap-2"><Icon name="download" size={16} /> Download Receipt</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
