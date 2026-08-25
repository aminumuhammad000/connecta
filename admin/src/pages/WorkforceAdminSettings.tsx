import { useState } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'

export default function WorkforceAdminSettings() {
  const [requireLocation, setRequireLocation] = useState(true)
  const [allowSelfCheckIn, setAllowSelfCheckIn] = useState(true)
  const [defaultCurrency, setDefaultCurrency] = useState('NGN')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Global Workforce platform settings updated successfully!')
    }, 500)
  }

  return (
    <main className="flex-1 flex-col p-4 md:p-6 lg:p-8 bg-background-light dark:bg-background-dark max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-text-light-primary dark:text-dark-primary">
          Global Workforce Platform Settings
        </h1>
        <p className="text-text-light-secondary dark:text-dark-secondary mt-1">
          Configure default platform rules for shift check-ins, GPS location verification, and currency controls.
        </p>
      </header>

      <form onSubmit={handleSave} className="bg-card-light dark:bg-card-dark rounded-3xl p-6 md:p-8 border border-border-light dark:border-border-dark shadow-sm space-y-6">
        {/* Setting 1: GPS Verification */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-border-light dark:border-border-dark">
          <div>
            <h3 className="font-extrabold text-base text-text-light-primary dark:text-dark-primary">
              GPS Location Verification Rule
            </h3>
            <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1 max-w-md">
              Require workers to transmit their GPS location when checking in or checking out of a job site.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRequireLocation(!requireLocation)}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${requireLocation ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${requireLocation ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Setting 2: Self Check-In */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-border-light dark:border-border-dark">
          <div>
            <h3 className="font-extrabold text-base text-text-light-primary dark:text-dark-primary">
              Allow Worker Self Check-In
            </h3>
            <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1 max-w-md">
              Permit workers to start and end shift check-ins directly from their mobile web space.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAllowSelfCheckIn(!allowSelfCheckIn)}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${allowSelfCheckIn ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${allowSelfCheckIn ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Setting 3: Default Currency */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-border-light dark:border-border-dark">
          <div>
            <h3 className="font-extrabold text-base text-text-light-primary dark:text-dark-primary">
              Default Platform Currency
            </h3>
            <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">
              Standard fallback currency for new workforce agreements and payouts.
            </p>
          </div>
          <select
            value={defaultCurrency}
            onChange={(e) => setDefaultCurrency(e.target.value)}
            className="px-4 py-2 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-bold text-xs"
          >
            <option value="NGN">NGN (₦)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="GHS">GHS (₵)</option>
            <option value="KES">KES (KSh)</option>
          </select>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-primary text-white font-extrabold text-xs shadow-md hover:bg-primary-hover flex items-center gap-2"
          >
            <Icon name="save" size={16} />
            <span>{saving ? 'Saving...' : 'Save Global Settings'}</span>
          </button>
        </div>
      </form>
    </main>
  )
}
