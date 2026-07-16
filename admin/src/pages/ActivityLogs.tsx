import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { auditLogsAPI } from '../services/api'

interface AuditLog {
  _id: string
  adminId: string
  adminName: string
  action: string
  entityType: string
  entityId?: string
  entityName?: string
  details: any
  ipAddress?: string
  timestamp: string
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState('all')
  const [filterEntityType, setFilterEntityType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const logsPerPage = 20

  useEffect(() => {
    fetchLogs()
  }, [filterAction, filterEntityType, currentPage])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await auditLogsAPI.getAll({
        action: filterAction !== 'all' ? filterAction : undefined,
        entityType: filterEntityType !== 'all' ? filterEntityType : undefined,
        page: currentPage,
        limit: logsPerPage
      })
      setLogs(response.data || [])
    } catch (error) {
      console.error('Failed to fetch activity logs:', error)
      toast.error('Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'UPDATE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'DELETE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'BAN': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'UNBAN': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'APPROVE': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'REJECT': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return 'add'
      case 'UPDATE': return 'edit'
      case 'DELETE': return 'delete'
      case 'BAN': return 'block'
      case 'UNBAN': return 'check_circle'
      case 'APPROVE': return 'check'
      case 'REJECT': return 'close'
      case 'LOGIN': return 'login'
      case 'LOGOUT': return 'logout'
      default: return 'info'
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-light-primary dark:text-dark-primary">
            Activity Logs
          </h1>
          <p className="text-text-light-secondary dark:text-dark-secondary mt-1">
            Track all admin actions and system events
          </p>
        </div>

        <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-4 py-2 rounded-lg text-sm bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary border border-border-light dark:border-border-dark"
              >
                <option value="all">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="BAN">Ban</option>
                <option value="UNBAN">Unban</option>
                <option value="APPROVE">Approve</option>
                <option value="REJECT">Reject</option>
              </select>

              <select
                value={filterEntityType}
                onChange={(e) => setFilterEntityType(e.target.value)}
                className="px-4 py-2 rounded-lg text-sm bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary border border-border-light dark:border-border-dark"
              >
                <option value="all">All Entities</option>
                <option value="User">User</option>
                <option value="Job">Job</option>
                <option value="Project">Project</option>
                <option value="Proposal">Proposal</option>
                <option value="Payment">Payment</option>
                <option value="Review">Review</option>
                <option value="Verification">Verification</option>
                <option value="Subscription">Subscription</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : logs.length > 0 ? (
              <table className="w-full">
                <thead className="bg-background-light dark:bg-background-dark">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-background-light dark:hover:bg-background-dark">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          <Icon name={getActionIcon(log.action)} size={14} />
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light-primary dark:text-dark-primary">
                        {log.adminName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light-primary dark:text-dark-primary">
                        <div className="flex flex-col">
                          <span className="font-medium">{log.entityType}</span>
                          {log.entityName && (
                            <span className="text-xs text-text-light-secondary dark:text-dark-secondary">
                              {log.entityName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-light-secondary dark:text-dark-secondary max-w-xs truncate">
                        {typeof log.details === 'object' 
                          ? JSON.stringify(log.details).substring(0, 50) + '...'
                          : String(log.details).substring(0, 50) + '...'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light-secondary dark:text-dark-secondary">
                        {formatDate(log.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-20 text-text-light-secondary dark:text-dark-secondary">
                <Icon name="history" size={64} className="mx-auto mb-4 opacity-50" />
                <p>No activity logs found</p>
              </div>
            )}
          </div>

          {logs.length > 0 && (
            <div className="px-6 py-4 border-t border-border-light dark:border-border-dark flex items-center justify-between">
              <p className="text-sm text-text-light-secondary dark:text-dark-secondary">
                Showing {logs.length} logs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-text-light-secondary dark:text-dark-secondary">
                  Page {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={logs.length < logsPerPage}
                  className="px-3 py-1 rounded bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
