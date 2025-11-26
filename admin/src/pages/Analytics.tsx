import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'
import { analyticsAPI } from '../services/api'

export default function Analytics() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await analyticsAPI.getStats()
      console.log('Analytics response:', response)
      setStats(response?.data || response)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <Icon name="progress_activity" size={48} className="animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  const overview = stats?.overview || {}
  const userGrowth = stats?.userGrowth || []
  const proposalStats = stats?.proposalStats || {}
  const weeklyRevenue = stats?.weeklyRevenue || []

  return (
    <AppLayout>
      <main className="flex-1 flex-col p-4 md:p-6 lg:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <p className="text-text-light-primary dark:text-dark-primary text-3xl font-black leading-tight tracking-tighter">Analytics & Reporting</p>
            <p className="text-text-light-secondary dark:text-dark-secondary text-base font-normal leading-normal">Insights into platform performance and user activity.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex h-10 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-card-light dark:bg-card-dark px-4 border border-border-light dark:border-border-dark">
              <p className="text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal">Last 30 Days</p>
              <Icon name="calendar_today" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
            </button>
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2">
              <Icon name="download" size={20} />
              <span className="truncate">Export Data</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Total Users</p>
                  <Icon name="trending_up" className="text-green-500" />
                </div>
                <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary mt-2">{overview.totalUsers || 0}</p>
                <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">
                  {overview.clientsCount || 0} clients, {overview.freelancersCount || 0} freelancers
                </p>
              </div>
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Active Jobs</p>
                  <Icon name="work" className="text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary mt-2">{overview.totalJobs || 0}</p>
                <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">
                  {overview.activeProjects || 0} active projects
                </p>
              </div>
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Proposals</p>
                  <Icon name="description" className="text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary mt-2">{overview.totalProposals || 0}</p>
                <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">
                  {proposalStats.successRate || 0}% success rate
                </p>
              </div>
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Total Revenue</p>
                  <Icon name="trending_up" className="text-green-500" />
                </div>
                <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary mt-2">
                  {formatCurrency(overview.totalRevenue || 0)}
                </p>
                <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">
                  Subscriptions: {formatCurrency(overview.subscriptionRevenue || 0)}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {overview.activeSubscriptions || 0} active premium members
                </p>
              </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-light-primary dark:text-dark-primary">User Growth</h3>
              <p className="text-sm text-text-light-secondary dark:text-dark-secondary mb-4">New user registrations over time</p>
              <div className="h-64 flex flex-col">
                <div className="flex-1 flex items-end justify-between gap-3 px-2">
                  {[
                    { month: 'Jan', users: 450, height: 45 },
                    { month: 'Feb', users: 520, height: 52 },
                    { month: 'Mar', users: 480, height: 48 },
                    { month: 'Apr', users: 650, height: 65 },
                    { month: 'May', users: 580, height: 58 },
                    { month: 'Jun', users: 720, height: 72 },
                    { month: 'Jul', users: 680, height: 68 },
                    { month: 'Aug', users: 800, height: 80 },
                    { month: 'Sep', users: 750, height: 75 },
                    { month: 'Oct', users: 880, height: 88 },
                    { month: 'Nov', users: 920, height: 92 },
                    { month: 'Dec', users: 1000, height: 100 },
                  ].map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="relative w-full">
                        <div 
                          className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all duration-300 group-hover:from-primary/90 group-hover:to-primary/70 cursor-pointer"
                          style={{ height: `${data.height * 2}px` }}
                        />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                          {data.users} users
                        </div>
                      </div>
                      <span className="text-xs text-text-light-secondary dark:text-dark-secondary font-medium">
                        {data.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-light-primary dark:text-dark-primary">Gig Performance</h3>
              <p className="text-sm text-text-light-secondary dark:text-dark-secondary mb-4">Posted vs Filled Gigs</p>
              <div className="h-64 flex flex-col justify-center gap-6 px-4">
                {[
                  { label: 'Week 1', posted: 85, filled: 72 },
                  { label: 'Week 2', posted: 92, filled: 78 },
                  { label: 'Week 3', posted: 78, filled: 65 },
                  { label: 'Week 4', posted: 95, filled: 88 },
                ].map((week, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-text-light-secondary dark:text-dark-secondary">
                      <span className="font-medium">{week.label}</span>
                      <span>{week.filled}/{week.posted}</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-8 bg-blue-500/20 rounded" style={{ width: `${week.posted}%` }} />
                      <div className="h-8 bg-green-500 rounded" style={{ width: `${week.filled}%` }} />
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500/20 rounded" />
                    <span className="text-text-light-secondary dark:text-dark-secondary">Posted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-text-light-secondary dark:text-dark-secondary">Filled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-light-primary dark:text-dark-primary">Proposal Success Rate</h3>
              <div className="flex items-center justify-center my-4">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-background-light dark:text-background-dark"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(proposalStats.successRate || 0) * 4.4} 440`}
                      className="text-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-text-light-primary dark:text-dark-primary">
                      {proposalStats.successRate || 0}%
                    </p>
                    <p className="text-sm text-text-light-secondary dark:text-dark-secondary">Success Rate</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <p className="font-bold text-green-600 dark:text-green-400">{proposalStats.accepted || 0}</p>
                  <p className="text-xs text-text-light-secondary dark:text-dark-secondary">Accepted</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-red-600 dark:text-red-400">{proposalStats.rejected || 0}</p>
                  <p className="text-xs text-text-light-secondary dark:text-dark-secondary">Rejected</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-yellow-600 dark:text-yellow-400">{proposalStats.pending || 0}</p>
                  <p className="text-xs text-text-light-secondary dark:text-dark-secondary">Pending</p>
                </div>
              </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-light-primary dark:text-dark-primary">Weekly Subscription Revenue</h3>
              <p className="text-sm text-text-light-secondary dark:text-dark-secondary mb-4">Premium subscriptions for the past 7 days</p>
              <div className="h-48">
                <div className="w-full h-full flex items-end justify-between gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - day));
                    const dayData = stats?.weeklySubscriptionRevenue?.find((item: any) => {
                      const itemDate = new Date(item.date);
                      return itemDate.toDateString() === date.toDateString();
                    });
                    const amount = dayData?.amount || 0;
                    const subscriptions = dayData?.subscriptions || 0;
                    const maxRevenue = Math.max(
                      ...(stats?.weeklySubscriptionRevenue?.map((item: any) => item.amount) || [5000]),
                      5000
                    );
                    const height = amount > 0 ? (amount / maxRevenue) * 100 : 5;
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative group">
                          <div 
                            className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                            style={{ height: `${Math.max(height * 1.5, 8)}px`, minWidth: '32px' }}
                          />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {subscriptions} subscription{subscriptions !== 1 ? 's' : ''} - {formatCurrency(amount)}
                          </div>
                        </div>
                        <span className="text-xs text-text-light-secondary dark:text-dark-secondary font-medium">
                          {dayName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-light-secondary dark:text-dark-secondary">
                    Total ({stats?.weeklySubscriptionRevenue?.reduce((sum: number, item: any) => sum + item.subscriptions, 0) || 0} subscriptions)
                  </span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(stats?.weeklySubscriptionRevenue?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-light-primary dark:text-dark-primary">Recent Reports</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg"><Icon name="description" className="text-primary" size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">Weekly User Report</p>
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary">Generated on Oct 26, 2023</p>
                    </div>
                  </div>
                  <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary"><Icon name="download" /></button>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg"><Icon name="description" className="text-primary" size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">Monthly Financials</p>
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary">Generated on Oct 01, 2023</p>
                    </div>
                  </div>
                  <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary"><Icon name="download" /></button>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg"><Icon name="description" className="text-primary" size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">Q3 Performance Review</p>
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary">Generated on Sep 30, 2023</p>
                    </div>
                  </div>
                  <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary"><Icon name="download" /></button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
