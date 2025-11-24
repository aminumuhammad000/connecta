import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'

export default function Reviews() {
  return (
    <AppLayout>
      <main className="flex-1 flex-col p-4 md:p-6 lg:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <p className="text-text-light-primary dark:text-dark-primary text-3xl font-black leading-tight tracking-tighter">Review Management</p>
            <p className="text-text-light-secondary dark:text-dark-secondary text-base font-normal leading-normal">View and manage all user reviews and ratings.</p>
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
                    placeholder="Search by user or keywords..."
                  />
                </div>
              </label>
            </div>
            <button className="flex h-12 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4">
              <p className="text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal">Rating: All</p>
              <Icon name="expand_more" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
            </button>
            <button className="flex h-12 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4">
              <p className="text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal">Date Range</p>
              <Icon name="calendar_today" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
            </button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Reviewer</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Reviewed User</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Rating</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Comment</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Date</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary">Global Mart Inc.</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Alicia Keys</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} />
                      <span className="ml-1 text-sm text-text-light-secondary dark:text-dark-secondary">(4.0)</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary max-w-xs truncate">Great collaboration, but there were some minor delays. Overall satisfied.</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Dec 22, 2023</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary">Innovate Solutions</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">John Legend</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <span className="ml-1 text-sm text-text-light-secondary dark:text-dark-secondary">(5.0)</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary max-w-xs truncate">Absolutely phenomenal work. Exceeded all expectations!</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Nov 01, 2023</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary">Mariah Carey</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Startup Hub</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <span className="ml-1 text-sm text-text-light-secondary dark:text-dark-secondary">(5.0)</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary max-w-xs truncate">A pleasure to work with. Very clear communication and prompt payments.</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Oct 02, 2023</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary">Digital Growth Agency</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Bruno Mars</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} />
                      <span className="ml-1 text-sm text-text-light-secondary dark:text-dark-secondary">(4.0)</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary max-w-xs truncate">The strategy was solid, but the reporting could have been more detailed.</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Sep 28, 2023</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary">Tech Forward Ltd.</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Christina Aguilera</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} className="fill-current" />
                      <Icon name="star" size={16} />
                      <Icon name="star" size={16} />
                      <span className="ml-1 text-sm text-text-light-secondary dark:text-dark-secondary">(3.0)</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary max-w-xs truncate">The project was completed, but communication was challenging.</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Sep 15, 2023</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-light dark:border-border-dark">
            <p className="text-sm text-text-light-secondary dark:text-dark-secondary">Showing 1 to 5 of 42 reviews</p>
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
