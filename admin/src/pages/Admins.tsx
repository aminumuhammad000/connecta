import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { usersAPI } from '../services/api'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  userType: 'admin'
  profileImage?: string
  phoneNumber?: string
  createdAt: string
  isActive?: boolean
}

export default function Admins() {
  const [admins, setAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    adminId: string | null
    adminName: string
  }>({
    isOpen: false,
    adminId: null,
    adminName: ''
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response: any = await usersAPI.getAll({ includeAdmins: 'true', userType: 'admin' })
      const data = response.data || response
      setAdmins(Array.isArray(data) ? data.filter((u: any) => u.userType === 'admin') : [])
    } catch (error) {
      console.error('Error fetching admins:', error)
      toast.error('Failed to load admins')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await usersAPI.createAdmin(newAdmin)
      toast.success('Admin created successfully')
      setShowAddModal(false)
      setNewAdmin({ firstName: '', lastName: '', email: '', password: '', phoneNumber: '' })
      fetchAdmins()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create admin')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAdmin = async () => {
    if (!confirmModal.adminId) return
    try {
      await usersAPI.delete(confirmModal.adminId)
      toast.success('Admin deleted successfully')
      setConfirmModal({ isOpen: false, adminId: null, adminName: '' })
      fetchAdmins()
    } catch (error) {
      toast.error('Failed to delete admin')
    }
  }

  return (
    <main className="flex-1 flex-col p-4 md:p-6 lg:p-8 bg-background-light dark:bg-background-dark">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-text-light-primary dark:text-dark-primary">Admin Management</h1>
          <p className="text-text-light-secondary dark:text-dark-secondary">Manage platform administrators and their access.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Icon name="add" size={20} />
          <span>Add New Admin</span>
        </button>
      </header>

      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-light dark:bg-background-dark/50 border-b border-border-light dark:border-border-dark">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-light-secondary dark:text-dark-secondary">Admin</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-light-secondary dark:text-dark-secondary">Contact</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-light-secondary dark:text-dark-secondary">Joined Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-light-secondary dark:text-dark-secondary">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-light-secondary dark:text-dark-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-light-secondary dark:text-dark-secondary">
                     <Icon name="progress_activity" size={32} className="animate-spin mx-auto mb-2 text-primary" />
                     Loading admins...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-light-secondary dark:text-dark-secondary">
                    No admins found.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                          {admin.profileImage ? (
                            <img src={admin.profileImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            (admin.firstName?.[0] || 'A').toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-text-light-primary dark:text-dark-primary">{admin.firstName} {admin.lastName}</p>
                          <p className="text-xs text-primary font-medium uppercase tracking-wider">Super Admin</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-light-primary dark:text-dark-primary">{admin.email}</p>
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary">{admin.phoneNumber || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setConfirmModal({ isOpen: true, adminId: admin._id, adminName: `${admin.firstName} ${admin.lastName}` })}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                        title="Delete Admin"
                      >
                        <Icon name="delete" size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card-light dark:bg-card-dark rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-light-primary dark:text-dark-primary">Add New Admin</h3>
                <button onClick={() => setShowAddModal(false)} className="text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark rounded-lg p-1">
                   <Icon name="close" size={24} />
                </button>
             </div>
             <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-sm font-bold text-text-light-primary dark:text-dark-primary">First Name</label>
                      <input
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary focus:ring-2 focus:ring-primary/50 outline-none"
                        value={newAdmin.firstName}
                        onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-sm font-bold text-text-light-primary dark:text-dark-primary">Last Name</label>
                      <input
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary focus:ring-2 focus:ring-primary/50 outline-none"
                        value={newAdmin.lastName}
                        onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                      />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-sm font-bold text-text-light-primary dark:text-dark-primary">Email Address</label>
                   <input
                     required
                     type="email"
                     className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary focus:ring-2 focus:ring-primary/50 outline-none"
                     value={newAdmin.email}
                     onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-sm font-bold text-text-light-primary dark:text-dark-primary">Password</label>
                   <input
                     required
                     type="password"
                     className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary focus:ring-2 focus:ring-primary/50 outline-none"
                     value={newAdmin.password}
                     onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-sm font-bold text-text-light-primary dark:text-dark-primary">Phone Number</label>
                   <input
                     type="tel"
                     className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary focus:ring-2 focus:ring-primary/50 outline-none"
                     value={newAdmin.phoneNumber}
                     onChange={(e) => setNewAdmin({ ...newAdmin, phoneNumber: e.target.value })}
                   />
                </div>
                <button
                  disabled={isSubmitting}
                  className="w-full h-11 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? <Icon name="progress_activity" size={20} className="animate-spin" /> : 'Create Admin Account'}
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card-light dark:bg-card-dark rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center animate-in fade-in zoom-in duration-200">
             <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="delete" size={32} className="text-red-500" />
             </div>
             <h3 className="text-xl font-bold text-text-light-primary dark:text-dark-primary mb-2">Are you sure?</h3>
             <p className="text-text-light-secondary dark:text-dark-secondary mb-6">
                You are about to delete admin <strong>{confirmModal.adminName}</strong>. This action cannot be undone.
             </p>
             <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, adminId: null, adminName: '' })}
                  className="flex-1 h-11 px-4 border border-border-light dark:border-border-dark rounded-xl font-bold text-text-light-primary dark:text-dark-primary hover:bg-background-light dark:hover:bg-background-dark transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAdmin}
                  className="flex-1 h-11 px-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Delete Admin
                </button>
             </div>
          </div>
        </div>
      )}
    </main>
  )
}
