import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'

export default function Notifications() {
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
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal gap-2 border border-border-light dark:border-border-dark hover:bg-primary/10 hover:text-primary">
              <Icon name="done_all" size={20} />
              <span className="truncate">Mark all as read</span>
            </button>
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal gap-2 border border-border-light dark:border-border-dark hover:bg-primary/10 hover:text-primary">
              <Icon name="delete" size={20} />
              <span className="truncate">Clear read</span>
            </button>
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
            <div className="flex items-center gap-4 p-4 md:p-6 hover:bg-primary/5 relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              <Icon name="chat" className="text-primary" size={32} />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">New message from Alicia Keys</p>
                <p className="text-sm text-text-light-secondary dark:text-dark-secondary">"Hey, just wanted to check in on the project progress..."</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs text-text-light-secondary dark:text-dark-secondary">
                <p>2 minutes ago</p>
                <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center size-8 rounded-lg hover:bg-primary/10 text-text-light-secondary dark:text-dark-secondary hover:text-primary" title="Mark as read">
                    <Icon name="drafts" size={20} />
                  </button>
                  <button className="flex items-center justify-center size-8 rounded-lg hover:bg-primary/10 text-text-light-secondary dark:text-dark-secondary hover:text-primary" title="Delete">
                    <Icon name="delete" size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 md:p-6 hover:bg-primary/5 relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              <Icon name="assignment_turned_in" className="text-primary" size={32} />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">Project 'Mobile App Development' marked as completed</p>
                <p className="text-sm text-text-light-secondary dark:text-dark-secondary">Client Innovate Solutions has approved the final delivery.</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs text-text-light-secondary dark:text-dark-secondary">
                <p>1 hour ago</p>
                <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center size-8 rounded-lg hover:bg-primary/10 text-text-light-secondary dark:text-dark-secondary hover:text-primary" title="Mark as read">
                    <Icon name="drafts" size={20} />
                  </button>
                  <button className="flex items-center justify-center size-8 rounded-lg hover:bg-primary/10 text-text-light-secondary dark:text-dark-secondary hover:text-primary" title="Delete">
                    <Icon name="delete" size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 md:p-6 hover:bg-black/5 dark:hover:bg-white/5">
              <Icon name="payments" className="text-green-500" size={32} />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">Payment of $2,500 received</p>
                <p className="text-sm text-text-light-secondary dark:text-dark-secondary">From Global Mart Inc. for 'E-commerce Platform Redesign'.</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs text-text-light-secondary dark:text-dark-secondary">
                <p>3 hours ago</p>
                <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center size-8 rounded-lg hover:bg-primary/10 text-text-light-secondary dark:text-dark-secondary hover:text-primary" title="Delete">
                    <Icon name="delete" size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 md:p-6 hover:bg-black/5 dark:hover:bg-white/5">
              <Icon name="person_add" className="text-blue-500" size={32} />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">New freelancer account created</p>
                <p className="text-sm text-text-light-secondary dark:text-dark-secondary">Bruno Mars has joined the platform. Review profile.</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs text-text-light-secondary dark:text-dark-secondary">
                <p>Yesterday</p>
                <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center size-8 rounded-lg hover:bg-primary/10 text-text-light-secondary dark:text-dark-secondary hover:text-primary" title="Delete">
                    <Icon name="delete" size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 md:p-6 hover:bg-black/5 dark:hover:bg-white/5">
              <Icon name="report" className="text-red-500" size={32} />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">Dispute filed for project 'SEO & Content Strategy'</p>
                <p className="text-sm text-text-light-secondary dark:text-dark-secondary">Client Digital Growth Agency has raised an issue.</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs text-text-light-secondary dark:text-dark-secondary">
                <p>2 days ago</p>
                <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center size-8 rounded-lg hover:bg-primary/10 text-text-light-secondary dark:text-dark-secondary hover:text-primary" title="Delete">
                    <Icon name="delete" size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 md:p-6 border-t border-border-light dark:border-border-dark">
            <p className="text-sm text-text-light-secondary dark:text-dark-secondary">Showing 1 to 5 of 42 results</p>
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
