import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'

export default function Projects() {
  return (
    <AppLayout>
      {/* Main Content */}
      <main className="flex-1 flex-col p-4 md:p-6 lg:p-8">
        {/* PageHeading */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <p className="text-text-light-primary dark:text-dark-primary text-2xl md:text-3xl font-black leading-tight tracking-tighter">Project Management</p>
            <p className="text-text-light-secondary dark:text-dark-secondary text-base font-normal leading-normal">View and manage all active and completed projects.</p>
          </div>
          <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2">
            <Icon name="add" size={20} />
            <span className="truncate">Add New Project</span>
          </button>
        </header>

        <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 md:p-6">
          {/* Search & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* SearchBar */}
            <div className="lg:col-span-2">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-text-light-secondary dark:text-dark-secondary flex bg-background-light dark:bg-background-dark items-center justify-center pl-4 rounded-l-lg">
                    <Icon name="search" />
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-light-primary dark:text-dark-primary focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-inset border-none bg-background-light dark:bg-background-dark h-full placeholder:text-text-light-secondary placeholder:dark:text-dark-secondary px-4 pl-2 text-base font-normal leading-normal"
                    placeholder="Search by project name or keyword..."
                  />
                </div>
              </label>
            </div>
            {/* Chips/Filters */}
            <button className="flex h-12 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4">
              <p className="text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal">Status: All</p>
              <Icon name="expand_more" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
            </button>
            <button className="flex h-12 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4">
              <p className="text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal">Date Range</p>
              <Icon name="calendar_today" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
            </button>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Project Name</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Client</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Freelancer</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Dates</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary">E-commerce Platform Redesign</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Global Mart Inc.</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Alicia Keys</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">In-Progress</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Aug 15 - Dec 20, 2023</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary">Mobile App Development</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Innovate Solutions</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">John Legend</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">May 01 - Oct 30, 2023</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary">Brand Identity & Logo Design</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Startup Hub</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Mariah Carey</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Sep 01 - Sep 30, 2023</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-border-light dark:border-border-dark">
                  <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary">SEO & Content Strategy</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Digital Growth Agency</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Bruno Mars</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">In-Progress</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Oct 05, 2023 - Jan 05, 2024</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-4 text-sm font-medium text-text-light-primary dark:text-dark-primary">Cloud Infrastructure Setup</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Tech Forward Ltd.</td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Christina Aguilera</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">Nov 20, 2023 - Feb 28, 2024</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-text-light-secondary dark:text-dark-secondary hover:text-primary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-border-light dark:border-border-dark gap-3">
            <p className="text-sm text-text-light-secondary dark:text-dark-secondary text-center sm:text-left">Showing 1 to 5 of 20 results</p>
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
