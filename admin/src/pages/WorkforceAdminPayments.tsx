import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { workforceAdminAPI } from '../services/api'

export default function WorkforceAdminPayments() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res: any = await workforceAdminAPI.getPayments()
      const list = res?.data || res || []
      setPayments(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to load workforce payments history')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 flex-col p-4 md:p-6 lg:p-8 bg-background-light dark:bg-background-dark">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-light-primary dark:text-dark-primary">
            Workforce Payroll Audit
          </h1>
          <p className="text-text-light-secondary dark:text-dark-secondary">
            Audit workforce disbursements, wallet transactions, and Flutterwave payouts across all companies.
          </p>
        </div>
      </header>

      {/* Payments Table */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
            <Icon name="sync" className="animate-spin text-primary mx-auto mb-3" size={32} />
            <p>Loading payroll transactions...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
            <Icon name="payments" size={48} className="mx-auto mb-3 opacity-40 text-emerald-500" />
            <p className="font-semibold">No platform workforce payments recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 text-xs font-bold uppercase text-text-light-secondary dark:text-dark-secondary">
                  <th className="py-4 px-6">Transaction Reference</th>
                  <th className="py-4 px-6">Worker Recipient</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Payment Date</th>
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
                      {p.currency || 'NGN'} {p.amount?.toLocaleString()}
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
        )}
      </div>
    </main>
  )
}
