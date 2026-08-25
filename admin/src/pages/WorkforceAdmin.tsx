import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { workforceAdminAPI } from '../services/api'

export default function WorkforceAdmin() {
  const [workers, setWorkers] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'workers' | 'payments'>('workers')

  useEffect(() => {
    fetchWorkforceData()
  }, [])

  const fetchWorkforceData = async () => {
    setLoading(true)
    try {
      const [statsRes, workersRes, paymentsRes] = await Promise.allSettled([
        workforceAdminAPI.getStats(),
        workforceAdminAPI.getWorkers(),
        workforceAdminAPI.getPayments(),
      ])

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data)
      }
      if (workersRes.status === 'fulfilled') {
        const wList = workersRes.value?.data || workersRes.value || []
        setWorkers(Array.isArray(wList) ? wList : [])
      }
      if (paymentsRes.status === 'fulfilled') {
        const pList = paymentsRes.value?.data || paymentsRes.value || []
        setPayments(Array.isArray(pList) ? pList : [])
      }
    } catch (error) {
      console.error('Error loading admin workforce data:', error)
      toast.error('Failed to load workforce platform oversight data')
    } fontally: {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 flex-col p-4 md:p-6 lg:p-8 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-text-light-primary dark:text-dark-primary">
            Workforce Platform Oversight
          </h1>
          <p className="text-text-light-secondary dark:text-dark-secondary">
            Global monitoring of platform workers, active rosters, site attendance, and payroll transactions.
          </p>
        </div>
      </header>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <span className="text-xs font-bold text-text-light-secondary dark:text-dark-secondary uppercase">Total Roster Workers</span>
          <div className="text-3xl font-black text-text-light-primary dark:text-dark-primary mt-1">
            {stats?.activeWorkers ?? workers.length}
          </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <span className="text-xs font-bold text-text-light-secondary dark:text-dark-secondary uppercase">Working Today</span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stats?.workingToday ?? 0}
          </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <span className="text-xs font-bold text-text-light-secondary dark:text-dark-secondary uppercase">Active Jobs</span>
          <div className="text-3xl font-black text-primary mt-1">
            {stats?.activeJobs ?? 0}
          </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <span className="text-xs font-bold text-text-light-secondary dark:text-dark-secondary uppercase">Monthly Platform Payroll</span>
          <div className="text-3xl font-black text-text-light-primary dark:text-dark-primary mt-1">
            ₦{(stats?.totalMonthlyPayroll || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-light dark:border-border-dark mb-6 font-bold text-sm">
        <button
          onClick={() => setActiveTab('workers')}
          className={`pb-3 px-4 transition-all border-b-2 ${
            activeTab === 'workers'
              ? 'border-primary text-primary font-black'
              : 'border-transparent text-text-light-secondary dark:text-dark-secondary hover:text-primary'
          }`}
        >
          Workers Roster ({workers.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-4 transition-all border-b-2 ${
            activeTab === 'payments'
              ? 'border-primary text-primary font-black'
              : 'border-transparent text-text-light-secondary dark:text-dark-secondary hover:text-primary'
          }`}
        >
          Payroll Disbursements ({payments.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
            <Icon name="sync" className="animate-spin text-primary mx-auto mb-3" size={32} />
            <p>Loading workforce oversight data...</p>
          </div>
        ) : activeTab === 'workers' ? (
          workers.length === 0 ? (
            <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
              <Icon name="group" size={48} className="mx-auto mb-3 opacity-40 text-primary" />
              <p className="font-semibold">No workforce workers registered on the platform yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 text-xs font-bold uppercase text-text-light-secondary dark:text-dark-secondary">
                    <th className="py-4 px-6">Worker Name</th>
                    <th className="py-4 px-6">Contact Email / Phone</th>
                    <th className="py-4 px-6">Role & Trade</th>
                    <th className="py-4 px-6">Arrangement</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm font-medium">
                  {workers.map((w: any) => (
                    <tr key={w._id} className="hover:bg-background-light/30 dark:hover:bg-background-dark/30">
                      <td className="py-4 px-6 font-bold text-text-light-primary dark:text-dark-primary">
                        {w.fullName}
                      </td>
                      <td className="py-4 px-6 text-text-light-secondary dark:text-dark-secondary text-xs">
                        {w.email} <br /> {w.phone || 'No Phone'}
                      </td>
                      <td className="py-4 px-6 font-semibold text-text-light-primary dark:text-dark-primary">
                        {w.role}
                        <div className="text-xs text-text-light-secondary dark:text-dark-secondary capitalize">{w.employmentType?.replace('_', ' ')}</div>
                      </td>
                      <td className="py-4 px-6 font-bold text-primary">
                        {w.currency || 'NGN'} {w.paymentAmount?.toLocaleString()} / {w.paymentType}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-extrabold capitalize ${
                          w.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          payments.length === 0 ? (
            <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
              <Icon name="payments" size={48} className="mx-auto mb-3 opacity-40 text-emerald-500" />
              <p className="font-semibold">No platform workforce payments recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 text-xs font-bold uppercase text-text-light-secondary dark:text-dark-secondary">
                    <th className="py-4 px-6">Reference</th>
                    <th className="py-4 px-6">Worker</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm font-medium">
                  {payments.map((p: any) => (
                    <tr key={p._id} className="hover:bg-background-light/30 dark:hover:bg-background-dark/30">
                      <td className="py-4 px-6 font-mono text-xs text-text-light-secondary dark:text-dark-secondary">
                        {p.reference}
                      </td>
                      <td className="py-4 px-6 font-bold text-text-light-primary dark:text-dark-primary">
                        {p.workforceMemberId?.fullName || 'Worker'}
                        <div className="text-xs font-normal text-text-light-secondary dark:text-dark-secondary">{p.description}</div>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400">
                        {p.currency} {p.amount?.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-xs text-text-light-secondary dark:text-dark-secondary">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 capitalize">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </main>
  )
}
