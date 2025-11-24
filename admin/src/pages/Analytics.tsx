import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'

export default function Analytics() {
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
                <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary mt-2">12,458</p>
                <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">+15% from last month</p>
              </div>
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Active Gigs</p>
                  <Icon name="trending_up" className="text-green-500" />
                </div>
                <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary mt-2">3,204</p>
                <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">+8% from last month</p>
              </div>
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Proposals Sent</p>
                  <Icon name="trending_down" className="text-red-500" />
                </div>
                <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary mt-2">28,941</p>
                <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">-2% from last month</p>
              </div>
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Total Revenue</p>
                  <Icon name="trending_up" className="text-green-500" />
                </div>
                <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary mt-2">$89,430</p>
                <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">+22% from last month</p>
              </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-light-primary dark:text-dark-primary">User Growth</h3>
              <p className="text-sm text-text-light-secondary dark:text-dark-secondary mb-4">New user registrations over time.</p>
              <div className="h-64">
                <div className="w-full h-full rounded-lg bg-background-light dark:bg-background-dark/50 border border-border-light dark:border-border-dark flex items-center justify-center text-text-light-secondary dark:text-dark-secondary text-sm">Chart placeholder</div>
              </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-light-primary dark:text-dark-primary">Gig Performance</h3>
              <p className="text-sm text-text-light-secondary dark:text-dark-secondary mb-4">Posted vs. Filled Gigs.</p>
              <div className="h-64">
                <div className="w-full h-full rounded-lg bg-background-light dark:bg-background-dark/50 border border-border-light dark:border-border-dark flex items-center justify-center text-text-light-secondary dark:text-dark-secondary text-sm">Chart placeholder</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-light-primary dark:text-dark-primary">Proposal Success Rate</h3>
              <div className="flex items-center justify-center my-4">
                <div className="relative w-40 h-40">
                  <div className="w-full h-full rounded-full bg-background-light dark:bg-background-dark/50 border border-border-light dark:border-border-dark" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-text-light-primary dark:text-dark-primary">42%</p>
                    <p className="text-sm text-text-light-secondary dark:text-dark-secondary">Accepted</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-around text-sm">
                <div className="text-center">
                  <p className="font-bold text-text-light-primary dark:text-dark-primary">12,155</p>
                  <p className="text-text-light-secondary dark:text-dark-secondary">Accepted</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-text-light-primary dark:text-dark-primary">16,786</p>
                  <p className="text-text-light-secondary dark:text-dark-secondary">Rejected</p>
                </div>
              </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-light-primary dark:text-dark-primary">Weekly Revenue</h3>
              <p className="text-sm text-text-light-secondary dark:text-dark-secondary mb-4">Platform revenue for the past 7 days.</p>
              <div className="h-48">
                <div className="w-full h-full rounded-lg bg-background-light dark:bg-background-dark/50 border border-border-light dark:border-border-dark flex items-center justify-center text-text-light-secondary dark:text-dark-secondary text-sm">Chart placeholder</div>
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
