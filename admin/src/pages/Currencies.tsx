import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { currenciesAPI } from '../services/api'

interface CurrencyItem {
  _id: string
  code: string
  name: string
  symbol: string
  flag: string
  rateToUSD: number
  isActive: boolean
  createdAt?: string
}

export default function Currencies() {
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState<CurrencyItem | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '',
    flag: '🌐',
    rateToUSD: 1.0,
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete Confirm Modal
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean
    id: string | null
    code: string
  }>({
    isOpen: false,
    id: null,
    code: '',
  })

  useEffect(() => {
    fetchCurrencies()
  }, [])

  const fetchCurrencies = async () => {
    try {
      setLoading(true)
      const res: any = await currenciesAPI.getAll(false)
      const list = res.data || res || []
      setCurrencies(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('Error fetching currencies:', error)
      toast.error('Failed to load currencies')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code || !formData.name || !formData.symbol) {
      toast.error('Please fill out all required fields')
      return
    }
    try {
      setIsSubmitting(true)
      await currenciesAPI.create(formData)
      toast.success(`Currency ${formData.code.toUpperCase()} added successfully`)
      setShowAddModal(false)
      resetForm()
      fetchCurrencies()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create currency')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCurrency) return
    try {
      setIsSubmitting(true)
      await currenciesAPI.update(editingCurrency._id, {
        name: formData.name,
        symbol: formData.symbol,
        flag: formData.flag,
        rateToUSD: formData.rateToUSD,
        isActive: formData.isActive,
      })
      toast.success(`Currency ${editingCurrency.code} updated successfully`)
      setEditingCurrency(null)
      resetForm()
      fetchCurrencies()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update currency')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (item: CurrencyItem) => {
    try {
      const res = await currenciesAPI.toggleStatus(item._id)
      toast.success(res.message || `Currency ${item.code} status updated`)
      fetchCurrencies()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle status')
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete.id) return
    try {
      await currenciesAPI.delete(confirmDelete.id)
      toast.success(`Currency ${confirmDelete.code} deleted successfully`)
      setConfirmDelete({ isOpen: false, id: null, code: '' })
      fetchCurrencies()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete currency')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      symbol: '',
      flag: '🌐',
      rateToUSD: 1.0,
      isActive: true,
    })
  }

  const startEdit = (item: CurrencyItem) => {
    setEditingCurrency(item)
    setFormData({
      code: item.code,
      name: item.name,
      symbol: item.symbol,
      flag: item.flag || '🌐',
      rateToUSD: item.rateToUSD,
      isActive: item.isActive,
    })
  }

  return (
    <main className="flex-1 flex-col p-4 md:p-6 lg:p-8 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-text-light-primary dark:text-dark-primary">
            Currency Management
          </h1>
          <p className="text-text-light-secondary dark:text-dark-secondary">
            Manage platform currencies, exchange rates, and active/inactive status across web and mobile apps.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Icon name="add" size={20} />
          <span>Add New Currency</span>
        </button>
      </header>

      {/* Content Table */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
            <Icon name="sync" className="animate-spin text-primary mx-auto mb-3" size={32} />
            <p>Loading currencies...</p>
          </div>
        ) : currencies.length === 0 ? (
          <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
            <Icon name="attach_money" size={48} className="mx-auto mb-3 opacity-40 text-primary" />
            <p className="font-semibold">No currencies configured yet.</p>
            <p className="text-sm mt-1">Click "Add New Currency" above to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 text-xs font-bold uppercase tracking-wider text-text-light-secondary dark:text-dark-secondary">
                  <th className="py-4 px-6">Flag & Code</th>
                  <th className="py-4 px-6">Currency Name</th>
                  <th className="py-4 px-6">Symbol</th>
                  <th className="py-4 px-6">Exchange Rate (1 USD =)</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
                {currencies.map((c) => (
                  <tr key={c._id} className="hover:bg-background-light/30 dark:hover:bg-background-dark/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-text-light-primary dark:text-dark-primary flex items-center gap-3">
                      <span className="text-2xl">{c.flag || '🌐'}</span>
                      <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-extrabold">{c.code}</span>
                    </td>
                    <td className="py-4 px-6 text-text-light-primary dark:text-dark-primary font-semibold">
                      {c.name}
                    </td>
                    <td className="py-4 px-6 font-bold text-lg text-primary">
                      {c.symbol}
                    </td>
                    <td className="py-4 px-6 text-text-light-primary dark:text-dark-primary font-mono">
                      {c.symbol}{c.rateToUSD.toLocaleString()} {c.code}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold cursor-pointer transition-all ${
                          c.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20'
                        }`}
                        title="Click to toggle Active / Inactive"
                      >
                        <span className={`h-2 w-2 rounded-full ${c.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {c.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => startEdit(c)}
                        className="p-2 text-text-light-secondary dark:text-dark-secondary hover:text-primary hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
                        title="Edit Currency"
                      >
                        <Icon name="edit" size={18} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ isOpen: true, id: c._id, code: c.code })}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Currency"
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

      {/* Add Currency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-border-light dark:border-border-dark shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-text-light-primary dark:text-dark-primary">
                Add New Currency
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-light-secondary dark:text-dark-secondary hover:text-primary"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-light-secondary dark:text-dark-secondary mb-1">
                  Currency Code (ISO 3-Letter Code) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="e.g. NGN, USD, EUR, CAD"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-bold tracking-wider"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-light-secondary dark:text-dark-secondary mb-1">
                  Full Currency Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Canadian Dollar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-light-secondary dark:text-dark-secondary mb-1">
                    Symbol *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $, ₦, €, CA$"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-light-secondary dark:text-dark-secondary mb-1">
                    Country Flag Emoji
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 🇨🇦"
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-light-secondary dark:text-dark-secondary mb-1">
                  Exchange Rate to USD (1 USD = X Local) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min="0.00001"
                  placeholder="1.0"
                  value={formData.rateToUSD}
                  onChange={(e) => setFormData({ ...formData, rateToUSD: parseFloat(e.target.value) || 1.0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-bold"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-text-light-primary dark:text-dark-primary cursor-pointer">
                  Mark Currency as Active (Available to Users)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-text-light-secondary dark:text-dark-secondary font-bold hover:bg-background-light dark:hover:bg-background-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  {isSubmitting ? <Icon name="sync" className="animate-spin" size={18} /> : <Icon name="check" size={18} />}
                  <span>Save Currency</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Currency Modal */}
      {editingCurrency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-border-light dark:border-border-dark shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-text-light-primary dark:text-dark-primary">
                Edit Currency ({editingCurrency.code})
              </h3>
              <button
                onClick={() => setEditingCurrency(null)}
                className="text-text-light-secondary dark:text-dark-secondary hover:text-primary"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-light-secondary dark:text-dark-secondary mb-1">
                  Full Currency Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-light-secondary dark:text-dark-secondary mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-light-secondary dark:text-dark-secondary mb-1">
                    Flag Emoji
                  </label>
                  <input
                    type="text"
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-light-secondary dark:text-dark-secondary mb-1">
                  Exchange Rate to USD (1 USD = X Local)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min="0.00001"
                  value={formData.rateToUSD}
                  onChange={(e) => setFormData({ ...formData, rateToUSD: parseFloat(e.target.value) || 1.0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-bold"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
                <label htmlFor="editIsActive" className="text-sm font-bold text-text-light-primary dark:text-dark-primary cursor-pointer">
                  Currency Active & Available to Users
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                <button
                  type="button"
                  onClick={() => setEditingCurrency(null)}
                  className="px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-text-light-secondary dark:text-dark-secondary font-bold hover:bg-background-light dark:hover:bg-background-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  {isSubmitting ? <Icon name="sync" className="animate-spin" size={18} /> : <Icon name="check" size={18} />}
                  <span>Update Currency</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-border-light dark:border-border-dark shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Icon name="delete" size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-text-light-primary dark:text-dark-primary mb-2">
              Delete Currency ({confirmDelete.code})?
            </h3>
            <p className="text-xs text-text-light-secondary dark:text-dark-secondary mb-6">
              Are you sure you want to delete this currency configuration? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmDelete({ isOpen: false, id: null, code: '' })}
                className="px-4 py-2 rounded-xl border border-border-light dark:border-border-dark font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-all shadow-md shadow-red-500/20"
              >
                Delete Currency
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
