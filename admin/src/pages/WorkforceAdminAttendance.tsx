import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { workforceAdminAPI } from '../services/api'

export default function WorkforceAdminAttendance() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchAttendance()
  }, [selectedDate])

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const res: any = await workforceAdminAPI.getAttendance(selectedDate)
      const list = res?.data || res || []
      setAttendance(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('Error fetching attendance logs:', error)
      toast.error('Failed to load shift attendance logs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 flex-col p-4 md:p-6 lg:p-8 bg-background-light dark:bg-background-dark">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-light-primary dark:text-dark-primary">
            Shift Attendance & Live Check-ins
          </h1>
          <p className="text-text-light-secondary dark:text-dark-secondary">
            Global monitoring of site check-ins, check-outs, and shift logs across all workforces.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-card-light dark:bg-card-dark p-2 rounded-xl border border-border-light dark:border-border-dark">
          <span className="text-xs font-bold text-text-light-secondary dark:text-dark-secondary">Select Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-xs font-bold"
          />
        </div>
      </header>

      {/* Attendance Table */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
            <Icon name="sync" className="animate-spin text-primary mx-auto mb-3" size={32} />
            <p>Loading shift check-ins...</p>
          </div>
        ) : attendance.length === 0 ? (
          <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
            <Icon name="schedule" size={48} className="mx-auto mb-3 opacity-40 text-primary" />
            <p className="font-semibold">No attendance check-ins recorded for {selectedDate}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 text-xs font-bold uppercase text-text-light-secondary dark:text-dark-secondary">
                  <th className="py-4 px-6">Worker Name</th>
                  <th className="py-4 px-6">Employer Company</th>
                  <th className="py-4 px-6">Check In Time</th>
                  <th className="py-4 px-6">Check Out Time</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm font-medium">
                {attendance.map((att: any) => (
                  <tr key={att._id} className="hover:bg-background-light/30 dark:hover:bg-background-dark/30">
                    <td className="py-4 px-6 font-bold text-text-light-primary dark:text-dark-primary">
                      {att.workforceMemberId?.fullName || 'Worker'}
                    </td>
                    <td className="py-4 px-6 text-xs text-text-light-secondary dark:text-dark-secondary">
                      {att.companyId?.companyName || 'Company Employer'}
                    </td>
                    <td className="py-4 px-6 font-semibold text-emerald-600 dark:text-emerald-400">
                      {att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-4 px-6 text-xs text-text-light-secondary dark:text-dark-secondary">
                      {att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-extrabold capitalize ${
                        att.status === 'present' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        {att.status}
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
