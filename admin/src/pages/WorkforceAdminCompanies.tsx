import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { usersAPI } from '../services/api'

export default function WorkforceAdminCompanies() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const res: any = await usersAPI.getAll({ userType: 'client' })
      const list = res?.data || res || []
      setCompanies(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('Error fetching companies:', error)
      toast.error('Failed to load company workforces')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 flex-col p-4 md:p-6 lg:p-8 bg-background-light dark:bg-background-dark">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-light-primary dark:text-dark-primary">
            Manage Company Workforces
          </h1>
          <p className="text-text-light-secondary dark:text-dark-secondary">
            Provision company workforce setups, configure permissions, and monitor active employers.
          </p>
        </div>
      </header>

      {/* Companies List */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
            <Icon name="sync" className="animate-spin text-primary mx-auto mb-3" size={32} />
            <p>Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
            <Icon name="business" size={48} className="mx-auto mb-3 opacity-40 text-primary" />
            <p className="font-semibold">No employer companies registered on the platform yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 text-xs font-bold uppercase text-text-light-secondary dark:text-dark-secondary">
                  <th className="py-4 px-6">Company / Employer</th>
                  <th className="py-4 px-6">Contact Email</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Workforce Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm font-medium">
                {companies.map((c: any) => (
                  <tr key={c._id} className="hover:bg-background-light/30 dark:hover:bg-background-dark/30">
                    <td className="py-4 px-6 font-bold text-text-light-primary dark:text-dark-primary">
                      {c.companyName || `${c.firstName} ${c.lastName}`}
                      <div className="text-xs font-normal text-text-light-secondary dark:text-dark-secondary">{c.jobTitle || 'Employer Company'}</div>
                    </td>
                    <td className="py-4 px-6 text-xs text-text-light-secondary dark:text-dark-secondary">
                      {c.email}
                    </td>
                    <td className="py-4 px-6 text-text-light-primary dark:text-dark-primary">
                      {c.location || 'Default Site'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Active Workforce
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => toast.success(`Workforce setup active for ${c.companyName || c.firstName}`)}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20"
                      >
                        Manage Setup
                      </button>
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
