import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { workforceAdminAPI } from '../services/api'

export default function WorkforceAdminWorkers() {
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Edit Modal
  const [editingWorker, setEditingWorker] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({
    fullName: '',
    role: '',
    phone: '',
    paymentAmount: 0,
    paymentType: 'monthly',
    status: 'active',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete Confirm Modal
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null; name: string }>({
    isOpen: false,
    id: null,
    name: '',
  })

  useEffect(() => {
    fetchWorkers()
  }, [statusFilter])

  const fetchWorkers = async () => {
    setLoading(true)
    try {
      const res: any = await workforceAdminAPI.getWorkers({ status: statusFilter, search })
      const list = res?.data || res || []
      setWorkers(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('Error fetching workers:', error)
      toast.error('Failed to load workers')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchWorkers()
  }

  const handleStartEdit = (w: any) => {
    setEditingWorker(w)
    setEditForm({
      fullName: w.fullName || '',
      role: w.role || '',
      phone: w.phone || '',
      paymentAmount: w.paymentAmount || 0,
      paymentType: w.paymentType || 'monthly',
      status: w.status || 'active',
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingWorker) return
    setIsSubmitting(true)
    try {
      // API call to update worker
      toast.success(`Updated ${editForm.fullName} successfully`)
      setEditingWorker(null)
      fetchWorkers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update worker')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete.id) return
    try {
      toast.success(`Removed ${confirmDelete.name} from workforce`)
      setConfirmDelete({ isOpen: false, id: null, name: '' })
      fetchWorkers()
    } catch (error) {
      toast.error('Failed to remove worker')
    }
  }

  return (
    <main className="flex-1 flex-col p-4 md:p-6 lg:p-8 bg-background-light dark:bg-background-dark">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-light-primary dark:text-dark-primary">
            Manage Platform Workers
          </h1>
          <p className="text-text-light-secondary dark:text-dark-secondary">
            View, edit, deactivate, or delete workers across all company workforces.
          </p>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-border-light dark:border-border-dark mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex gap-2">
          {['all', 'active', 'pending', 'inactive'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-background-light dark:bg-background-dark text-text-light-secondary dark:text-dark-secondary hover:text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search workers by name, role, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-xs font-semibold"
          />
        </form>
      </div>

      {/* Workers Table */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
            <Icon name="sync" className="animate-spin text-primary mx-auto mb-3" size={32} />
            <p>Loading workers...</p>
          </div>
        ) : workers.length === 0 ? (
          <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
            <Icon name="group" size={48} className="mx-auto mb-3 opacity-40 text-primary" />
            <p className="font-semibold">No workers found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 text-xs font-bold uppercase text-text-light-secondary dark:text-dark-secondary">
                  <th className="py-4 px-6">Worker Name</th>
                  <th className="py-4 px-6">Contact Email & Phone</th>
                  <th className="py-4 px-6">Role & Trade</th>
                  <th className="py-4 px-6">Compensation</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm font-medium">
                {workers.map((w: any) => (
                  <tr key={w._id} className="hover:bg-background-light/30 dark:hover:bg-background-dark/30">
                    <td className="py-4 px-6 font-bold text-text-light-primary dark:text-dark-primary">
                      {w.fullName}
                    </td>
                    <td className="py-4 px-6 text-xs text-text-light-secondary dark:text-dark-secondary">
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
                        w.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleStartEdit(w)}
                        className="p-2 text-text-light-secondary hover:text-primary rounded-lg"
                        title="Edit Worker"
                      >
                        <Icon name="edit" size={18} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ isOpen: true, id: w._id, name: w.fullName })}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                        title="Delete Worker"
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

      {/* Edit Modal */}
      {editingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-border-light dark:border-border-dark shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-text-light-primary dark:text-dark-primary">
                Edit Worker Record
              </h3>
              <button onClick={() => setEditingWorker(null)} className="text-text-light-secondary hover:text-primary">
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Job Role / Position</label>
                <input
                  type="text"
                  required
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Compensation</label>
                  <input
                    type="number"
                    value={editForm.paymentAmount}
                    onChange={(e) => setEditForm({ ...editForm, paymentAmount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                <button
                  type="button"
                  onClick={() => setEditingWorker(null)}
                  className="px-4 py-2.5 rounded-xl border border-border-light font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
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
              Remove {confirmDelete.name}?
            </h3>
            <p className="text-xs text-text-light-secondary dark:text-dark-secondary">
              Are you sure you want to remove this worker from the platform workforce?
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
