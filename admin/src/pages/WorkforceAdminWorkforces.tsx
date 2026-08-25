import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { workforceAdminAPI } from '../services/api'

export default function WorkforceAdminWorkforces() {
  const [workforces, setWorkforces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    location: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Selected Company Detail Modal
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null)
  const [companyWorkers, setCompanyWorkers] = useState<any[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Delete Confirm Modal
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null; name: string }>({
    isOpen: false,
    id: null,
    name: '',
  })

  useEffect(() => {
    fetchWorkforces()
  }, [])

  const fetchWorkforces = async () => {
    setLoading(true)
    try {
      const res: any = await workforceAdminAPI.getWorkforces()
      const list = res?.data || res || []
      setWorkforces(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('Error fetching workforces:', error)
      toast.error('Failed to load company workforces')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.companyName || !createForm.email || !createForm.firstName) {
      toast.error('Please fill required fields (*)')
      return
    }
    setIsSubmitting(true)
    try {
      await workforceAdminAPI.createWorkforce(createForm)
      toast.success(`Workforce created for ${createForm.companyName}!`)
      setIsCreateOpen(false)
      setCreateForm({ companyName: '', firstName: '', lastName: '', email: '', location: '' })
      fetchWorkforces()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create workforce')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectCompany = async (company: any) => {
    setSelectedCompany(company)
    setLoadingDetails(true)
    try {
      const res: any = await workforceAdminAPI.getWorkers({ companyId: company._id })
      const list = res?.data || res || []
      setCompanyWorkers(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('Error loading company details:', error)
      setCompanyWorkers([])
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete.id) return
    try {
      await workforceAdminAPI.deleteWorkforce(confirmDelete.id)
      toast.success(`Deleted workforce: ${confirmDelete.name}`)
      setConfirmDelete({ isOpen: false, id: null, name: '' })
      if (selectedCompany?._id === confirmDelete.id) {
        setSelectedCompany(null)
      }
      fetchWorkforces()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete workforce')
    }
  }

  const filteredWorkforces = workforces.filter((w) => {
    const term = search.toLowerCase()
    return (
      (w.companyName || '').toLowerCase().includes(term) ||
      (w.firstName || '').toLowerCase().includes(term) ||
      (w.email || '').toLowerCase().includes(term)
    )
  })

  return (
    <main className="flex-1 flex-col p-4 md:p-6 lg:p-8 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-light-primary dark:text-dark-primary">
            Company Workforces Management
          </h1>
          <p className="text-text-light-secondary dark:text-dark-secondary">
            Provision, manage, inspect, or delete company workforces on the platform.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-md hover:bg-primary-hover transition-all flex items-center gap-2"
        >
          <Icon name="add" size={18} />
          <span>Provision New Workforce</span>
        </button>
      </header>

      {/* Search Bar */}
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-border-light dark:border-border-dark mb-6 shadow-sm">
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search workforces by company name, owner, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-xs font-semibold"
          />
        </div>
      </div>

      {/* Workforces Grid / Table */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
            <Icon name="sync" className="animate-spin text-primary mx-auto mb-3" size={32} />
            <p>Loading company workforces...</p>
          </div>
        ) : filteredWorkforces.length === 0 ? (
          <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
            <Icon name="business" size={48} className="mx-auto mb-3 opacity-40 text-primary" />
            <p className="font-semibold">No company workforces found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 text-xs font-bold uppercase text-text-light-secondary dark:text-dark-secondary">
                  <th className="py-4 px-6">Company Workforce Name</th>
                  <th className="py-4 px-6">Employer / Owner</th>
                  <th className="py-4 px-6">Contact Email</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm font-medium">
                {filteredWorkforces.map((w: any) => (
                  <tr
                    key={w._id}
                    onClick={() => handleSelectCompany(w)}
                    className="cursor-pointer hover:bg-background-light/50 dark:hover:bg-background-dark/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-bold text-text-light-primary dark:text-dark-primary flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-base shrink-0">
                        {(w.companyName || w.firstName || 'C')[0]}
                      </div>
                      <div>
                        <div className="font-extrabold text-base text-text-light-primary dark:text-dark-primary">
                          {w.companyName || `${w.firstName} ${w.lastName}`}
                        </div>
                        <div className="text-xs text-text-light-secondary dark:text-dark-secondary font-normal">
                          Workforce ID: {w._id?.substring(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-text-light-primary dark:text-dark-primary">
                      {w.firstName} {w.lastName}
                    </td>
                    <td className="py-4 px-6 text-xs text-text-light-secondary dark:text-dark-secondary font-mono">
                      {w.email}
                    </td>
                    <td className="py-4 px-6 text-xs text-text-light-primary dark:text-dark-primary">
                      {w.location || 'Headquarters'}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          const url = `http://localhost:5176/signup?workforceId=${w._id}`;
                          navigator.clipboard.writeText(url);
                          toast.success(`Copied Signup Link for ${w.companyName || w.firstName}!`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-bold hover:bg-emerald-500/20"
                        title="Copy Shareable Worker Signup Link"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => handleSelectCompany(w)}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20"
                      >
                        Inspect Overview
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ isOpen: true, id: w._id, name: w.companyName || `${w.firstName} ${w.lastName}` })}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                        title="Delete Workforce"
                      >
                        <Icon name="delete" size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision New Workforce Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-border-light dark:border-border-dark shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-text-light-primary dark:text-dark-primary">
                Provision New Workforce Company
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-text-light-secondary hover:text-primary">
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Company Workforce Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Apex Construction Ltd"
                  value={createForm.companyName}
                  onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-semibold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Owner First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="David"
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-semibold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Owner Last Name</label>
                  <input
                    type="text"
                    placeholder="Okafor"
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-semibold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Employer Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="employer@company.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-semibold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Location / Site</label>
                <input
                  type="text"
                  placeholder="Lagos, Nigeria"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-semibold text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border-light font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs"
                >
                  {isSubmitting ? 'Provisioning...' : 'Provision Workforce'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Company Workforce Overview Drawer / Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-card-light dark:bg-card-dark rounded-3xl p-6 border border-border-light dark:border-border-dark shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border-light dark:border-border-dark pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white font-black text-xl flex items-center justify-center">
                  {(selectedCompany.companyName || selectedCompany.firstName || 'C')[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-text-light-primary dark:text-dark-primary">
                    {selectedCompany.companyName || `${selectedCompany.firstName} ${selectedCompany.lastName}`}
                  </h2>
                  <p className="text-xs text-text-light-secondary dark:text-dark-secondary font-semibold">
                    Employer: {selectedCompany.firstName} {selectedCompany.lastName} • {selectedCompany.email}
                  </p>
                </div>
              </div>

              <button onClick={() => setSelectedCompany(null)} className="text-text-light-secondary hover:text-primary p-2">
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* Quick Overview Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background-light dark:bg-background-dark p-4 rounded-2xl border border-border-light dark:border-border-dark">
                <span className="text-[10px] font-bold uppercase text-text-light-secondary dark:text-dark-secondary">Location</span>
                <div className="font-bold text-sm text-text-light-primary dark:text-dark-primary mt-0.5">
                  {selectedCompany.location || 'Headquarters'}
                </div>
              </div>

              <div className="bg-background-light dark:bg-background-dark p-4 rounded-2xl border border-border-light dark:border-border-dark">
                <span className="text-[10px] font-bold uppercase text-text-light-secondary dark:text-dark-secondary">Assigned Workers</span>
                <div className="font-black text-lg text-primary mt-0.5">
                  {companyWorkers.length}
                </div>
              </div>

              <div className="bg-background-light dark:bg-background-dark p-4 rounded-2xl border border-border-light dark:border-border-dark">
                <span className="text-[10px] font-bold uppercase text-text-light-secondary dark:text-dark-secondary">Account Status</span>
                <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5 capitalize">
                  {selectedCompany.isActive ? 'Active Workforce' : 'Suspended'}
                </div>
              </div>
            </div>

            {/* Shareable Worker Signup Link Box */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                  Shareable Worker Signup Link
                </div>
                <div className="text-xs font-mono text-text-light-primary dark:text-dark-primary mt-0.5 select-all">
                  http://localhost:5176/signup?workforceId={selectedCompany._id}
                </div>
              </div>

              <button
                onClick={() => {
                  const url = `http://localhost:5176/signup?workforceId=${selectedCompany._id}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Worker Signup Link copied to clipboard!');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-sm"
              >
                Copy Link
              </button>
            </div>

            {/* Company Workers Roster */}
            <div>
              <h4 className="font-black text-base text-text-light-primary dark:text-dark-primary mb-3">
                Assigned Company Roster ({companyWorkers.length})
              </h4>

              {loadingDetails ? (
                <div className="p-8 text-center text-text-light-secondary dark:text-dark-secondary">
                  <Icon name="sync" className="animate-spin text-primary mx-auto mb-2" size={24} />
                  <p className="text-xs">Loading company roster...</p>
                </div>
              ) : companyWorkers.length === 0 ? (
                <div className="p-8 text-center bg-background-light dark:bg-background-dark rounded-2xl text-xs text-text-light-secondary dark:text-dark-secondary">
                  No workers assigned to this workforce company yet.
                </div>
              ) : (
                <div className="bg-background-light dark:bg-background-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden divide-y divide-border-light dark:divide-border-dark">
                  {companyWorkers.map((cw: any) => (
                    <div key={cw._id} className="p-3.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-text-light-primary dark:text-dark-primary">{cw.fullName}</div>
                        <div className="text-xs text-text-light-secondary dark:text-dark-secondary">🔨 {cw.role} • {cw.email}</div>
                      </div>
                      <div className="text-xs font-bold text-primary">
                        {cw.currency || 'NGN'} {cw.paymentAmount?.toLocaleString()} / {cw.paymentType}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center pt-4 border-t border-border-light dark:border-border-dark">
              <button
                onClick={() => setConfirmDelete({ isOpen: true, id: selectedCompany._id, name: selectedCompany.companyName || selectedCompany.firstName })}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold text-xs flex items-center gap-1.5"
              >
                <Icon name="delete" size={16} /> Delete Workforce
              </button>

              <button
                onClick={() => setSelectedCompany(null)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs"
              >
                Close Overview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-border-light dark:border-border-dark shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <Icon name="delete" size={24} />
            </div>
            <h3 className="text-lg font-bold text-text-light-primary dark:text-dark-primary">
              Delete {confirmDelete.name}?
            </h3>
            <p className="text-xs text-text-light-secondary dark:text-dark-secondary">
              This will permanently delete this company workforce setup and remove access for its employer.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmDelete({ isOpen: false, id: null, name: '' })}
                className="flex-1 py-2.5 rounded-xl border border-border-light font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
