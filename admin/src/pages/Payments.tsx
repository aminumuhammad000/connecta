import { useEffect, useState, useMemo } from 'react'
import Icon from '../components/Icon'
import { paymentsAPI } from '../services/api'
import type { Payment } from '../types'
import toast from 'react-hot-toast'

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingWithdrawals: 0,
    successfulTransactions: 0
  })

  useEffect(() => {
    fetchPayments()
    fetchStats()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await paymentsAPI.getAll()
      console.log('Payments response:', response)

      // Handle response format
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

  const filteredPayments = useMemo(() => {
    return payments.filter((payment: any) => {
      const matchesSearch =
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.amount?.toString().includes(searchTerm) ||
        payment.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [payments, searchTerm, statusFilter])

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400',
      pending: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400',
      failed: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400'
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
          {/* PageHeading */}
          <header className="flex flex-col md:flex-row flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-gray-900 dark:text-gray-100 text-2xl md:text-4xl font-black leading-tight tracking-tighter">Payments & Withdrawals</h1>
              <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">Monitor and manage all financial transactions within the platform.</p>
            </div>
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-bold leading-normal tracking-wide hover:bg-gray-300 dark:hover:bg-gray-700 gap-2">
              <Icon name="download" size={16} />
              <span className="truncate">Export Report</span>
            </button>
          </header>

          {/* Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              <p className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal">Total Platform Revenue</p>
              <p className="text-gray-900 dark:text-gray-100 tracking-tight text-3xl font-bold leading-tight">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-green-600 dark:text-green-500 text-sm font-medium leading-normal">+5.2% vs last month</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              <p className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal">Pending Withdrawals</p>
              <p className="text-gray-900 dark:text-gray-100 tracking-tight text-3xl font-bold leading-tight">
                {formatCurrency(stats.pendingWithdrawals)}
              </p>
              <p className="text-yellow-600 dark:text-yellow-500 text-sm font-medium leading-normal">Awaiting approval</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              <p className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal">Successful Transactions</p>
              <p className="text-gray-900 dark:text-gray-100 tracking-tight text-3xl font-bold leading-tight">
                {stats.successfulTransactions.toLocaleString()}
              </p>
              <p className="text-green-600 dark:text-green-500 text-sm font-medium leading-normal">+10.1% vs last month</p>
            </div>
          </section>

          {/* Tabs, Toolbar, and Table */}
          <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800">
            {/* Tabs */}
            <nav className="pb-3">
              <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 gap-4 md:gap-8">
                <a className="flex flex-col items-center justify-center border-b-[3px] border-b-primary text-primary pb-3 pt-4" href="#">
                  <p className="text-sm font-bold leading-normal">Payment History</p>
                </a>
                <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 pb-3 pt-4" href="#">
                  <p className="text-sm font-bold leading-normal">Withdrawal Requests</p>
                </a>
                <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 pb-3 pt-4" href="#">
                  <p className="text-sm font-bold leading-normal">Wallet Balances</p>
                </a>
              </div>
            </nav>

            {/* ToolBar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-6 py-4">
              <div className="relative w-full md:w-auto md:max-w-xs">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by transaction ID or amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-primary focus:border-primary text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-auto border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:ring-primary focus:border-primary"
                >
                  <option value="all">Status: All</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <input type="date" className="w-full md:w-auto border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:ring-primary focus:border-primary" />
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Icon name="credit_card" size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No payments found</p>
                  <p className="text-sm mt-2">Try adjusting your search or filters</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 min-w-[640px]">
                  <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th scope="col" className="px-6 py-3">Transaction ID</th>
                      <th scope="col" className="px-6 py-3">From</th>
                      <th scope="col" className="px-6 py-3">To</th>
                      <th scope="col" className="px-6 py-3">Amount</th>
                      <th scope="col" className="px-6 py-3">Date</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                      <th scope="col" className="px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment: any) => (
                      <tr key={payment._id} className="bg-white dark:bg-black border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400">{payment.transactionId || 'N/A'}</td>
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {payment.payerId?.firstName && payment.payerId?.lastName
                            ? `${payment.payerId.firstName} ${payment.payerId.lastName}`
                            : payment.payerId?.email || 'N/A'}
                        </th>
                        <td className="px-6 py-4">
                          {payment.payeeId?.firstName && payment.payeeId?.lastName
                            ? `${payment.payeeId.firstName} ${payment.payeeId.lastName}`
                            : payment.payeeId?.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</td>
                        <td className="px-6 py-4">{formatDate(payment.createdAt)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusBadge(payment.status)}`}>
                            <span className="w-2 h-2 mr-1 bg-current rounded-full"></span>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleViewDetails(payment)}
                            className="font-medium text-primary hover:underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <nav aria-label="Table navigation" className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{Math.min(filteredPayments.length, 1)}-{Math.min(filteredPayments.length, 10)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredPayments.length}</span>
              </span>
              <ul className="inline-flex items-stretch -space-x-px">
                <li>
                  <button className="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-black dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
                    <span className="sr-only">Previous</span>
                    <Icon name="chevron_left" size={16} />
                  </button>
                </li>
                <li>
                  <button className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-black dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">1</button>
                </li>
                <li>
                  <button className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-black dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
                    <span className="sr-only">Next</span>
                    <Icon name="chevron_right" size={16} />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </main>

      {/* Payment Details Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75"
              onClick={() => setShowModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              {/* Header */}
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment Details</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Transaction ID: {selectedPayment.transactionId}</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <Icon name="close" size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center text-sm font-medium px-4 py-2 rounded-full ${getStatusBadge(selectedPayment.status)}`}>
                    <span className="w-2 h-2 mr-2 bg-current rounded-full"></span>
                    {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                </div>

                {/* Payment Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payer Information */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Payer (From)</h4>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                          {selectedPayment.payerId?.firstName?.[0]}{selectedPayment.payerId?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedPayment.payerId?.firstName} {selectedPayment.payerId?.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPayment.payerId?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payee Information */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Payee (To)</h4>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                          {selectedPayment.payeeId?.firstName?.[0]}{selectedPayment.payeeId?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedPayment.payeeId?.firstName} {selectedPayment.payeeId?.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPayment.payeeId?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Information */}
                {selectedPayment.projectId && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Project</h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Icon name="work" className="text-blue-600 dark:text-blue-400 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedPayment.projectId.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Project ID: {selectedPayment.projectId._id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transaction Details */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Transaction Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Payment Type</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {selectedPayment.paymentType?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Currency</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedPayment.currency || 'NGN'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Platform Fee</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {selectedPayment.platformFee ? formatCurrency(selectedPayment.platformFee) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Net Amount</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {selectedPayment.netAmount ? formatCurrency(selectedPayment.netAmount) : formatCurrency(selectedPayment.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedPayment.description && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Description</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      {selectedPayment.description}
                    </p>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDateTime(selectedPayment.createdAt)}</span>
                    </div>
                    {selectedPayment.paidAt && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Paid</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDateTime(selectedPayment.paidAt)}</span>
                      </div>
                    )}
                    {selectedPayment.releasedAt && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Released</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDateTime(selectedPayment.releasedAt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDateTime(selectedPayment.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  onClick={() => toast.success('Receipt downloaded!')}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 flex items-center gap-2"
                >
                  <Icon name="download" size={16} />
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
