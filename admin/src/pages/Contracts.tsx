import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'

export default function Contracts() {
  return (
    <AppLayout>
      <main className="flex-1 flex-col p-4 md:p-6 lg:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <p className="text-text-light-primary dark:text-dark-primary text-2xl md:text-3xl font-black leading-tight tracking-tighter">Contract Management</p>
            <p className="text-text-light-secondary dark:text-dark-secondary text-base font-normal leading-normal">Manage all contracts between clients and freelancers.</p>
          </div>
        </header>

        <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-2">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-text-light-secondary dark:text-dark-secondary flex bg-background-light dark:bg-background-dark items-center justify-center pl-4 rounded-l-lg">
                    <Icon name="search" />
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-light-primary dark:text-dark-primary focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-inset border-none bg-background-light dark:bg-background-dark h-full placeholder:text-text-light-secondary placeholder:dark:text-dark-secondary px-4 pl-2 text-base font-normal leading-normal"
                    placeholder="Search by client, freelancer, or job..."
                    value=""
                    readOnly
                  />
                </div>
              </label>
            </div>
            <button className="flex h-12 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4">
              <p className="text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal">Status: All</p>
              <Icon name="expand_more" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
            </button>
            <button className="flex h-12 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4">
              <p className="text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal">Date Range</p>
              <Icon name="calendar_today" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
            </button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Client</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Freelancer</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Job</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Dates</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Amount</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary">Global Mart Inc.</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Alicia Keys</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Brand Identity Design</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/50 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                      <span className="size-1.5 rounded-full bg-green-500"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Dec 22, 2023 - Jan 22, 2024</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">$5,000.00</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary">Innovate Solutions</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">John Legend</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Web App Development</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                      <span className="size-1.5 rounded-full bg-gray-500"></span>
                      Terminated
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Nov 01, 2023 - Dec 01, 2023</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">$12,000.00</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary">Startup Hub</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Mariah Carey</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Social Media Campaign</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-300">
                      <span className="size-1.5 rounded-full bg-yellow-500"></span>
                      Pending Signature
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Oct 02, 2023 - Oct 31, 2023</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">$3,500.00</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary">Digital Growth Agency</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Bruno Mars</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">SEO Strategy</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                      <span className="size-1.5 rounded-full bg-blue-500"></span>
                      Completed
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Sep 28, 2023 - Oct 28, 2023</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">$4,200.00</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary">Tech Forward Ltd.</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Christina Aguilera</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Mobile App UI/UX</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/50 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                      <span className="size-1.5 rounded-full bg-green-500"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Sep 15, 2023 - Nov 15, 2023</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">$8,800.00</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-border-light dark:border-border-dark gap-3">
            <p className="text-sm text-text-light-secondary dark:text-dark-secondary text-center sm:text-left">Showing 1 to 5 of 21 contracts</p>
            <div className="flex items-center gap-2">
              <button className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-primary/10">
                <Icon name="chevron_left" size={20} />
              </button>
              <button className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary text-white text-sm">1</button>
              <button className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-primary/10 text-sm">2</button>
              <button className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-primary/10 text-sm">3</button>
              <button className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-primary/10">
                <Icon name="chevron_right" size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
