import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'

export default function Dashboard() {
  return (
    <AppLayout>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* TopNavBar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between whitespace-nowrap border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-background-dark px-4 md:px-8">
          <div className="flex items-center gap-8">
            <h2 className="text-slate-900 dark:text-slate-100 text-lg md:text-xl font-bold leading-tight tracking-[-0.015em]">Dashboard</h2>
          </div>
          <div className="flex flex-1 justify-end items-center gap-2 md:gap-4">
            <label className="relative hidden md:flex flex-col w-full max-w-sm">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-10">
                <div className="text-slate-500 dark:text-slate-400 flex items-center justify-center pl-3">
                  <Icon name="search" size={20} className="text-slate-500 dark:text-slate-400" />
                </div>
                <input
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-background-light dark:bg-slate-800 h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 px-4 pl-2 text-sm font-normal leading-normal"
                  placeholder="Search users, jobs, projects..."
                />
              </div>
            </label>
            <div className="flex gap-2">
              <button className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                <Icon name="notifications" size={20} className="text-slate-700 dark:text-slate-300" />
              </button>
              <button className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-light dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                <Icon name="help_outline" size={20} className="text-slate-700 dark:text-slate-300" />
              </button>
            </div>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              data-alt="Admin user avatar"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDdfSq9rY9d-IraFKyuZubheJD5nmfm_t1imjYLLieEnL9DQb06TTjnCEZoje3mFttPErj7q7F2-FtWrYCC2bHcGPC_L-LLH-qgSc_2bf7RPUnLXu1lSBfM5O5H-PJ0cJLOHA5vAZoDEOOzzTQAPzZqLUwBKH2H1oBAhD5fd-Vd5abPsdBcPwo1fEQyE0UP-SsQWCZdAybC5oe7HIJUTQLck7BsiLFXy-0sminJsvsl3Gd0BqWP3biXU7Vm_Txu7PwuDUishYx9TKU")',
              }}
            />
          </div>
        </header>


        {/* Page Content */}
        <div className="p-4 md:p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-1 flex-col gap-2 rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm">
              <p className="text-slate-600 dark:text-slate-300 text-base font-medium leading-normal">Total Users</p>
              <p className="text-slate-900 dark:text-slate-100 tracking-tight text-3xl font-bold leading-tight">12,450</p>
              <p className="text-green-600 dark:text-green-500 text-sm font-medium leading-normal">+5.2% this month</p>
            </div>
            <div className="flex flex-1 flex-col gap-2 rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm">
              <p className="text-slate-600 dark:text-slate-300 text-base font-medium leading-normal">Total Jobs Posted</p>
              <p className="text-slate-900 dark:text-slate-100 tracking-tight text-3xl font-bold leading-tight">8,720</p>
              <p className="text-green-600 dark:text-green-500 text-sm font-medium leading-normal">+2.1% this month</p>
            </div>
            <div className="flex flex-1 flex-col gap-2 rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm">
              <p className="text-slate-600 dark:text-slate-300 text-base font-medium leading-normal">Active Projects</p>
              <p className="text-slate-900 dark:text-slate-100 tracking-tight text-3xl font-bold leading-tight">3,150</p>
              <p className="text-red-600 dark:text-red-500 text-sm font-medium leading-normal">-1.5% this month</p>
            </div>
            <div className="flex flex-1 flex-col gap-2 rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm">
              <p className="text-slate-600 dark:text-slate-300 text-base font-medium leading-normal">Total Proposals</p>
              <p className="text-slate-900 dark:text-slate-100 tracking-tight text-3xl font-bold leading-tight">25,600</p>
              <p className="text-green-600 dark:text-green-500 text-sm font-medium leading-normal">+8.0% this month</p>
            </div>
          </div>

          {/* Main Grid Area */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column */}
            <div className="flex flex-col gap-8 lg:col-span-2">
              {/* Data Visualization Chart */}
              <div className="rounded-xl bg-white dark:bg-slate-800 p-4 md:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Platform Growth</h3>
                  <div className="flex gap-2 flex-wrap">
                    <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary text-white pl-4 pr-4">
                      <p className="text-sm font-medium leading-normal">Last 7 days</p>
                    </button>
                    <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 pl-4 pr-4">
                      <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal">Last 30 days</p>
                    </button>
                    <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 pl-4 pr-4">
                      <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal">Last 90 days</p>
                    </button>
                  </div>
                </div>
                <div className="mt-6 h-80 w-full rounded-lg bg-background-light dark:bg-slate-700/50 flex items-center justify-center">
                  {/* <img
                    alt="A line chart showing platform user growth over the last seven months."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlJVkOpG5MYCRR-Iq1D8GVahRgw9HTY52cr165NgHkt1YMfjYPmfEiQuC3p3Ii5rKz6WQKR-KpeLdgKGilHqI1gI6UpmFGdew5UnvDYJ9dnUoSql1-zQ3NB1s9pEqWixzYOCHpk__744zwDqmpAzrXD6To-P5R0heAxjOv2vWA9XeM4VVx6nwDT8oCLzNxfTb36c3f0fcqgYSZ1bokyV9BpSR7GnPWQq4jywYiKXlYVPb-qWP1T77ohG5zx9LcdmY-HHT8-yJMNho"
                  /> */}
                </div>
              </div>

              {/* Recent Activities Table */}
              <div className="rounded-xl bg-white dark:bg-slate-800 p-4 md:p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h3>
                <div className="mt-4 flow-root">
                  <div className="-mx-4 md:-mx-6 -my-2 overflow-x-auto">
                    <div className="inline-block min-w-full py-2 align-middle px-4 md:px-6">
                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                              <div className="flex items-center">
                                <div className="size-10 flex-shrink-0">
                                  <img
                                    className="size-10 rounded-full"
                                    data-alt="User avatar for Olivia Rhye"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9UtF7F1D-TAQr4WsE8wJ7VEmGLfXBx-25a402Fa7YIrx_k3fjKWPfGGw2HAbpTV3aKpBTZ6DfigKFiiM-vuBW6NMKwGqgP6COsHe3ioQ6PP8LniU_Nc2cB8AkK_FW25e9jLpI8UcQ9RwiSTSPmB3bsNLPFHniXhbxl5EDrR1kHt7KUcKgfE8nF5VB-yhv3wSdsfK0y78KfmDTNdOE-H4Yb560_EqNDWsGH5Bu_rRp7DPoHJAH7QqYvgQTSzyCfx_vrS5PCS171cg"
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium text-slate-900 dark:text-slate-100">Olivia Rhye registered as a new freelancer.</div>
                                  <div className="text-slate-500 dark:text-slate-400">Design</div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">2 min ago</td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                              <a className="text-primary hover:text-primary/80" href="#">View profile</a>
                            </td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                              <div className="flex items-center">
                                <div className="size-10 flex-shrink-0">
                                  <img
                                    className="size-10 rounded-full"
                                    data-alt="User avatar for Lana Steiner"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWmhyYUSJpFcYgkyKVll1v_xSBeJ-QU81Nkw5-jTrVgwq5kcvqqvPxa86YcbpG0loOUoJXha07rhPzkQ6wfcv_NrghByD9chLzdKlmsrsbPvogrdgKUZorBEFh-oo8jPjpTl53X1XstuhQ8os18Be2Jv1-WTnthmkEJ3Nz2rOvOSu1VOtHVkZIVnAqILEkY_fMeO4VXp14XYVj5rcfRccGQ9tpx8GjO2A7sRXsNLs-2JO2RkE5b2whdrRFN-7PlkPtuKbTab6H9IA"
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium text-slate-900 dark:text-slate-100">Lana Steiner completed the project "E-commerce Website Redesign".</div>
                                  <div className="text-slate-500 dark:text-slate-400">Development</div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">1 hour ago</td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                              <a className="text-primary hover:text-primary/80" href="#">View project</a>
                            </td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                              <div className="flex items-center">
                                <div className="size-10 flex-shrink-0">
                                  <img
                                    className="size-10 rounded-full"
                                    data-alt="User avatar for Drew Cano"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVSj52d19Sit8-LQ_v0hbUOm6Akjtp-xy9n6ievg4Rey43BIMHwXWgWf8fLOKvetPzTbCRC3l-AeUeoVJ6LXZzXxh_c2b2_zUZhsDZyJmLWQauFM_l3a1XrRvT-IyNhM6db0jdRt9CwFrU2gFGYoU_o0medapKc_jUpLm5KJpsUbsBnvy1HG1e-os3bIHI39hq3X8vIbU3qsT_pwW4ZrqV_7IYQjtws30T5oMZ9YFGRd6Dv-ktrSfpo1Em-RBVI7ozQ8fspk5yjOI"
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium text-slate-900 dark:text-slate-100">Drew Cano posted a new job: "Mobile App UI/UX Designer".</div>
                                  <div className="text-slate-500 dark:text-slate-400">Marketing</div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">3 hours ago</td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                              <a className="text-primary hover:text-primary/80" href="#">Review job</a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1">
              <div className="rounded-xl bg-white dark:bg-slate-800 p-4 md:p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h3>
                <div className="mt-4 flex flex-col gap-3">
                  <a className="flex w-full items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700" href="#">Manage Users</a>
                  <a className="flex w-full items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700" href="#">Review Job Posts</a>
                  <a className="flex w-full items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700" href="#">View Support Tickets</a>
                  <a className="flex w-full items-center justify-center rounded-lg border border-transparent bg-primary px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-primary/90" href="#">Create Announcement</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
