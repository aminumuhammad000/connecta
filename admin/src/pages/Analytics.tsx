import { useEffect, useState } from 'react'
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

  const generateCSVReport = (reportType: string) => {
    let csvContent = ''
    let filename = ''
    const date = new Date().toISOString().split('T')[0]

    if (reportType === 'weekly-users') {
      filename = `weekly-user-report-${date}.csv`
      csvContent = 'Month,Users\n'
      userGrowth.forEach((item: any) => {
        csvContent += `${item.month},${item.users}\n`
      })
    } else if (reportType === 'monthly-financials') {
      filename = `monthly-financials-${date}.csv`
      csvContent = 'Metric,Value\n'
      csvContent += `Total Revenue,${overview.totalRevenue || 0}\n`
      csvContent += `Payment Revenue,${overview.paymentRevenue || 0}\n`
      csvContent += `Subscription Revenue,${overview.subscriptionRevenue || 0}\n`
      csvContent += `Total Payments,${overview.totalPayments || 0}\n`
      csvContent += `Active Subscriptions,${overview.activeSubscriptions || 0}\n`
      csvContent += `Total Users,${overview.totalUsers || 0}\n`
      csvContent += `Total Projects,${overview.totalProjects || 0}\n`
      csvContent += `Total Jobs,${overview.totalJobs || 0}\n`
    } else if (reportType === 'performance') {
      filename = `performance-review-${date}.csv`
      csvContent = 'Metric,Value\n'
      csvContent += `Total Users,${overview.totalUsers || 0}\n`
      csvContent += `Clients,${overview.clientsCount || 0}\n`
      csvContent += `Freelancers,${overview.freelancersCount || 0}\n`
      csvContent += `Total Jobs,${jobStats.total || 0}\n`
      csvContent += `Open Jobs,${jobStats.open || 0}\n`
      csvContent += `In Progress Jobs,${jobStats.inProgress || 0}\n`
      csvContent += `Closed Jobs,${jobStats.closed || 0}\n`
      csvContent += `Total Proposals,${proposalStats.total || 0}\n`
      csvContent += `Accepted Proposals,${proposalStats.accepted || 0}\n`
      csvContent += `Rejected Proposals,${proposalStats.rejected || 0}\n`
      csvContent += `Success Rate,${proposalStats.successRate || 0}%\n`
    } else {
      // Full export
      filename = `analytics-full-export-${date}.csv`
      csvContent = 'Category,Metric,Value\n'
      csvContent += `Overview,Total Users,${overview.totalUsers || 0}\n`
      csvContent += `Overview,Total Projects,${overview.totalProjects || 0}\n`
      csvContent += `Overview,Total Jobs,${overview.totalJobs || 0}\n`
      csvContent += `Overview,Total Revenue,${overview.totalRevenue || 0}\n`
      csvContent += `Overview,Subscription Revenue,${overview.subscriptionRevenue || 0}\n`
      csvContent += `Overview,Active Subscriptions,${overview.activeSubscriptions || 0}\n`
      csvContent += `Jobs,Open,${jobStats.open || 0}\n`
      csvContent += `Jobs,In Progress,${jobStats.inProgress || 0}\n`
      csvContent += `Jobs,Closed,${jobStats.closed || 0}\n`
      csvContent += `Proposals,Total,${proposalStats.total || 0}\n`
      csvContent += `Proposals,Success Rate,${proposalStats.successRate || 0}%\n`
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
              <div className="flex-1 flex items-center justify-center">
          <Icon name="progress_activity" size={48} className="animate-spin text-primary" />
        </div>
    )
  }

  const overview = stats?.overview || {}
  const userGrowth = stats?.userGrowth || []
  const proposalStats = stats?.proposalStats || {}
  const jobStats = stats?.jobStats || {}
  // const weeklyRevenue = stats?.weeklyRevenue || []

  return (
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
            <button 
              onClick={() => generateCSVReport('full')}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-colors"
            >
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
                  {(() => {
                    // Get last 12 months
                    const months = [];
                    const now = new Date();
                    for (let i = 11; i >= 0; i--) {
                      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                      const userData = userGrowth?.find((item: any) => item.month === monthKey);
                      months.push({
                        month: monthName,
                        users: userData?.users || 0,
                        key: monthKey
                      });
                    }
                    const maxUsers = Math.max(...months.map(m => m.users), 1);
                    
                    return months.map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="relative w-full">
                          <div 
                            className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all duration-300 group-hover:from-primary/90 group-hover:to-primary/70 cursor-pointer"
                            style={{ height: `${Math.max((data.users / maxUsers) * 200, 8)}px` }}
                          />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
                            {data.users} user{data.users !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <span className="text-xs text-text-light-secondary dark:text-dark-secondary font-medium">
                          {data.month}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-light-primary dark:text-dark-primary">Job Status Overview</h3>
              <p className="text-sm text-text-light-secondary dark:text-dark-secondary mb-4">Current status of all jobs</p>
              <div className="h-64 flex flex-col justify-center gap-6 px-4">
                {[
                  { 
                    label: 'Open Jobs', 
                    count: jobStats?.open || 0,
                    total: jobStats?.total || 1,
                    color: 'blue'
                  },
                  { 
                    label: 'In Progress', 
                    count: jobStats?.inProgress || 0,
                    total: jobStats?.total || 1,
                    color: 'yellow'
                  },
                  { 
                    label: 'Closed/Filled', 
                    count: jobStats?.closed || 0,
                    total: jobStats?.total || 1,
                    color: 'green'
                  },
                ].map((item, index) => {
                  const percentage = (item.count / item.total) * 100;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-text-light-secondary dark:text-dark-secondary">
                        <span className="font-medium">{item.label}</span>
                        <span className="font-semibold text-text-light-primary dark:text-dark-primary">
                          {item.count} / {item.total}
                        </span>
                      </div>
                      <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <div 
                          className={`h-full rounded-lg transition-all duration-500 ${
                            item.color === 'blue' ? 'bg-blue-500' :
                            item.color === 'yellow' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                          {percentage.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-center gap-6 mt-4 text-xs border-t border-border-light dark:border-border-dark pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary">
                      {jobStats?.total || 0}
                    </p>
                    <p className="text-text-light-secondary dark:text-dark-secondary">Total Jobs</p>
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
              <h3 className="text-lg font-bold text-text-light-primary dark:text-dark-primary">New Subscriptions (7 Days)</h3>
              <p className="text-sm text-text-light-secondary dark:text-dark-secondary mb-4">Premium memberships purchased in the past week (₦5,000/month each)</p>
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
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary">User growth and registration data</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => generateCSVReport('weekly-users')}
                    className="text-text-light-secondary dark:text-dark-secondary hover:text-primary transition-colors"
                  >
                    <Icon name="download" />
                  </button>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg"><Icon name="description" className="text-primary" size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">Monthly Financials</p>
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary">Revenue and payment statistics</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => generateCSVReport('monthly-financials')}
                    className="text-text-light-secondary dark:text-dark-secondary hover:text-primary transition-colors"
                  >
                    <Icon name="download" />
                  </button>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg"><Icon name="description" className="text-primary" size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">Performance Review</p>
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary">Jobs, proposals, and success metrics</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => generateCSVReport('performance')}
                    className="text-text-light-secondary dark:text-dark-secondary hover:text-primary transition-colors"
                  >
                    <Icon name="download" />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
  )
}
