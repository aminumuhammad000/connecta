import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'
import { notificationsAPI } from '../services/api'

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationsAPI.getAll()
      console.log('Notifications response:', response)
      const notificationsData = Array.isArray(response) ? response : (response?.data || [])
      setNotifications(notificationsData)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, { name: string; color: string }> = {
      payment: { name: 'payments', color: 'text-green-500' },
      payment_received: { name: 'account_balance_wallet', color: 'text-green-500' },
      proposal_accepted: { name: 'assignment_turned_in', color: 'text-blue-500' },
      project_completed: { name: 'task_alt', color: 'text-primary' },
      review_received: { name: 'star', color: 'text-yellow-500' },
      message: { name: 'chat', color: 'text-primary' },
      dispute: { name: 'report', color: 'text-red-500' },
      user_registered: { name: 'person_add', color: 'text-blue-500' },
    }
    return icons[type] || { name: 'notifications', color: 'text-text-light-secondary dark:text-dark-secondary' }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMins = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMs / 3600000)
    const diffInDays = Math.floor(diffInMs / 86400000)

    if (diffInMins < 1) return 'Just now'
    if (diffInMins < 60) return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      searchQuery === '' ||
      notif.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.userId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.userId?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'read' && notif.read) ||
      (statusFilter === 'unread' && !notif.read)

    return matchesSearch && matchesStatus
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <AppLayout>
      {/* Main Content */}
      <main className="flex-1 flex-col p-4 md:p-6 lg:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <p className="text-text-light-primary dark:text-dark-primary text-3xl font-black leading-tight tracking-tighter">Notifications</p>
            <p className="text-text-light-secondary dark:text-dark-secondary text-base font-normal leading-normal">Manage all platform notifications.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
              <Icon name="notifications" size={20} className="text-primary" />
              <span className="text-sm font-medium text-primary">{unreadCount} Unread</span>
            </div>
          </div>
        </header>

        <div className="bg-card-light dark:bg-card-dark rounded-xl">
          <div className="p-4 md:p-6 border-b border-border-light dark:border-border-dark">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <label className="flex flex-col min-w-40 h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                    <div className="text-text-light-secondary dark:text-dark-secondary flex bg-background-light dark:bg-background-dark items-center justify-center pl-4 rounded-l-lg">
                      <Icon name="search" />
                    </div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-light-primary dark:text-dark-primary focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-inset border-none bg-background-light dark:bg-background-dark h-full placeholder:text-text-light-secondary placeholder:dark:text-dark-secondary px-4 pl-2 text-base font-normal leading-normal"
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </label>
              </div>
              <button className="flex h-12 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4">
                <p className="text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal">Status: All</p>
                <Icon name="expand_more" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
              </button>
              <button className="flex h-12 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4">
                <p className="text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal">Notification Type</p>
                <Icon name="expand_more" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-border-light dark:divide-border-dark">
            {loading ? (
              <div className="flex justify-center p-8">
                <Icon name="progress_activity" size={32} className="animate-spin text-primary" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 gap-3">
                <Icon name="notifications_off" size={48} className="text-text-light-secondary dark:text-dark-secondary" />
                <p className="text-text-light-secondary dark:text-dark-secondary">No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const icon = getNotificationIcon(notif.type)
                const isUnread = !notif.read
                return (
                  <div
                    key={notif._id}
                    className={`flex items-start gap-4 p-4 md:p-6 relative transition-colors ${
                      isUnread ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-background-light dark:hover:bg-background-dark/50'
                    }`}
                  >
                    {isUnread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />}
                    
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      isUnread ? 'bg-white dark:bg-background-dark' : 'bg-background-light dark:bg-background-dark'
                    }`}>
                      <Icon name={icon.name} className={icon.color} size={24} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h4 className="text-sm font-semibold text-text-light-primary dark:text-dark-primary leading-tight">
                          {notif.title}
                        </h4>
                        {isUnread && (
                          <span className="flex-shrink-0 px-2 py-0.5 bg-primary text-white rounded-full text-xs font-medium">
                            New
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-text-light-secondary dark:text-dark-secondary leading-relaxed mb-2">
                        {notif.message}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-text-light-secondary dark:text-dark-secondary flex items-center gap-1">
                          <Icon name="schedule" size={14} />
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                        {notif.userId && (
                          <>
                            <span className="text-text-light-secondary dark:text-dark-secondary">•</span>
                            <span className="text-primary font-medium flex items-center gap-1">
                              <Icon name="person" size={14} />
                              {notif.userId.firstName} {notif.userId.lastName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="flex items-center justify-between p-4 md:p-6 border-t border-border-light dark:border-border-dark">
            <p className="text-sm text-text-light-secondary dark:text-dark-secondary">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </p>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
