import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'

export default function Proposals() {
  return (
    <AppLayout>
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <p className="text-neutral-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight tracking-tight">Proposal Management</p>
              <p className="text-neutral-600 dark:text-neutral-200/60 text-base font-normal leading-normal">Review and manage all submitted proposals.</p>
            </div>
            <button className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark">
              <Icon name="add" size={16} />
              <span className="truncate">Add New Job</span>
            </button>
          </div>

          {/* Filter & Search Section */}
          <div className="mb-6 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-900/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              {/* SearchBar */}
              <div className="lg:col-span-2">
                <label className="flex flex-col h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                    <div className="text-neutral-600 dark:text-neutral-200/60 flex bg-neutral-100 dark:bg-background-dark items-center justify-center pl-4 rounded-l-lg border border-r-0 border-neutral-200 dark:border-neutral-900/50">
                      <Icon name="search" />
                    </div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary border border-l-0 border-neutral-200 dark:border-neutral-900/50 bg-neutral-100 dark:bg-background-dark h-full placeholder:text-neutral-600 dark:placeholder:text-neutral-200/60 pl-2 text-sm font-normal leading-normal"
                      placeholder="Search by freelancer or job..."
                    />
                  </div>
                </label>
              </div>
              {/* Chips / Filters */}
              <div className="lg:col-span-2 flex flex-wrap items-center gap-3">
                <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-neutral-100 dark:bg-neutral-900/50 pl-4 pr-2 border border-neutral-200 dark:border-neutral-900/50 hover:border-neutral-600/50 dark:hover:border-neutral-200/20">
                  <p className="text-neutral-900 dark:text-neutral-100 text-sm font-medium leading-normal">Status: All</p>
                  <Icon name="expand_more" className="text-neutral-600 dark:text-neutral-200/60" />
                </button>
                <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-neutral-100 dark:bg-neutral-900/50 pl-4 pr-2 border border-neutral-200 dark:border-neutral-900/50 hover:border-neutral-600/50 dark:hover:border-neutral-200/20">
                  <p className="text-neutral-900 dark:text-neutral-100 text-sm font-medium leading-normal">Job: All</p>
                  <Icon name="expand_more" className="text-neutral-600 dark:text-neutral-200/60" />
                </button>
                <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-neutral-100 dark:bg-neutral-900/50 pl-4 pr-2 border border-neutral-200 dark:border-neutral-900/50 hover:border-neutral-600/50 dark:hover:border-neutral-200/20">
                  <p className="text-neutral-900 dark:text-neutral-100 text-sm font-medium leading-normal">Date Range</p>
                  <Icon name="expand_more" className="text-neutral-600 dark:text-neutral-200/60" />
                </button>
                <button className="text-primary text-sm font-medium hover:underline ml-auto">Clear Filters</button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-900/50 bg-white dark:bg-neutral-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-neutral-100/50 dark:bg-background-dark">
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-200/60 uppercase tracking-wider">Freelancer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-200/60 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-200/60 uppercase tracking-wider">Submitted On</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-200/60 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 dark:text-neutral-200/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-900/50">
                  <tr className="hover:bg-neutral-100/30 dark:hover:bg-background-dark/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                          data-alt="Avatar of Emily Carter"
                          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCObUpU3nzRdpXe3h-lwFlsOCCORh3nU1PmG2UTwmCyMICjbc7WD2hqQscYeNlvriwyQpNIvTCBgg1umQZsAOdFVlGe7PCiNxjBqX6sD11VVjiAmqluM6iSkLqDKNctr2TbxU-NpZxzw4Ok-XwdKpshVqYh2c4k1hm5V3k-_RPWrh5H8TRproUqltS7RHcgaZyl4wd_eWGOJI961wXRifIHztZhqRK30Y6Y5W8dEVbl64h1lwjOWPNIqz5bEpLMuwPfQ72zfRalB4c")' }}
                        />
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Emily Carter</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">UI/UX Design for Mobile App</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-200/60">Oct 26, 2023</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">Approved</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a className="text-primary hover:text-primary/80" href="#">View Details</a>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-100/30 dark:hover:bg-background-dark/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                          data-alt="Avatar of Michael Chen"
                          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB5rpkGZzGT-41Fl7oy_q5W7svw88uqUphoHrScs7gd4kD1DGW3IDxXnNNqcyG24r_F75Ldm-KTGQmSHvua7n31M46RiNSCZNb2HgMUs1_A-7crgNA91h1zX6Cvkxb1Cba8EfcZHnagPIYzotCr_CvwzIm0qtC2Zb47m3kTPaq41WNeaHvkMSGg0wNINhRgqas3d1-NWzl0keHqoGSxM6qd9BmlTMJu2fVT-qV1IHKon4fdt6kXPIdTjzhPZw6Qr-JzxnbdyWzhx84")' }}
                        />
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Michael Chen</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">Brand Identity & Logo Design</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-200/60">Oct 25, 2023</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning">Pending</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <a className="text-primary hover:text-primary/80" href="#">Approve</a>
                      <a className="text-danger hover:text-danger/80" href="#">Reject</a>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-100/30 dark:hover:bg-background-dark/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                          data-alt="Avatar of Sarah Johnson"
                          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA9YIPYcLKJwThZaczq8EsGeUKNfPo62EMYBKVHxtekTBzEsgy1TU12wPgbXYxBXBUmm0bDzMCr8YNj6WgN8BgIF3A_QCkX53ohfh6Fkub3EueCHfg3SgpxgYXXoSKfu-gcx2MrR9MowRQJY8UaG3KL29vKtJewadYDf2gBCQBtV2lHkRxKJzWERqqM9ThpsNxN5pafE5qPBLUrRPnJE0mlx5EQOh3XfPeSIdC7kpPZiMuif-D9C13wYi3HwL0-6o9TXMRGPhi1aPc")' }}
                        />
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Sarah Johnson</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">E-commerce Website Development</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-200/60">Oct 24, 2023</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger/20 text-danger">Rejected</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a className="text-primary hover:text-primary/80" href="#">View Details</a>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-100/30 dark:hover:bg-background-dark/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                          data-alt="Avatar of David Lee"
                          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDhiPkTWrtQLBzWfakVyWIbSr2RgfNxnVmFMrlJ7cUQrrBBaHwwLlt5PRTpm6hOWnrPpSLTlN1wvCYHu4L50stuzAcPhN333ajzmHQQ4crcNK-LyyhdMK5hsNXGCGbdSXC2S-efDCyFcTXW82qUlIcplz7Qnq-M9hIb883jo03h4Xh_R53MprFhTYYOoXnx2S-hImyhkumOWXV3Sh3W9eBtd-uOaVJ5W93pwsblZoHPMufkNAAUA2aE4we10AVPTnzm22x2DxLYPyY")' }}
                        />
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">David Lee</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">Social Media Marketing Campaign</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-200/60">Oct 23, 2023</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">Approved</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a className="text-primary hover:text-primary/80" href="#">View Details</a>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-100/30 dark:hover:bg-background-dark/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                          data-alt="Avatar of Maria Garcia"
                          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAHGHDRx_KgPTiQjbmn7L7rgOb4XvwjCeF9RvQeVgihVPo2jiUPU3pP2WqZUI194ZQG8Ldl14MMVh7b2i1m7Q_AcrA0I0mIh2JUE4oiITf4RUxMOAwwUzh3qBCP9JTpoB9rdl9fSr_Gfkx5S8I0uS7XCZwEiLmB3dY-lQ6RShZbHQGYIn_xdMUbWlMXpm6HzjyCEiCkgljlUqBfC2KcAJIPNMy4qKA6m6X-Ek4OZi3wxpHbal5VFGUTzRrEigC17CeWyghnxwcdjEg")' }}
                        />
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Maria Garcia</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">Copywriting for Product Launch</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-200/60">Oct 22, 2023</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning">Pending</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <a className="text-primary hover:text-primary/80" href="#">Approve</a>
                      <a className="text-danger hover:text-danger/80" href="#">Reject</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-900/50 px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <a className="relative inline-flex items-center rounded-md border border-neutral-200 dark:border-neutral-900/50 bg-white dark:bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-200/60 hover:bg-neutral-100/50 dark:hover:bg-background-dark" href="#">Previous</a>
                <a className="relative ml-3 inline-flex items-center rounded-md border border-neutral-200 dark:border-neutral-900/50 bg-white dark:bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-200/60 hover:bg-neutral-100/50 dark:hover:bg-background-dark" href="#">Next</a>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-200/60">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">23</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <a className="relative inline-flex items-center rounded-l-md px-2 py-2 text-neutral-600 dark:text-neutral-200/60 ring-1 ring-inset ring-neutral-200 dark:ring-neutral-900/50 hover:bg-neutral-100/50 dark:hover:bg-background-dark/50 focus:z-20 focus:outline-offset-0" href="#">
                      <Icon name="chevron_left" size={16} />
                    </a>
                    <a className="relative z-10 inline-flex items-center bg-primary/20 text-primary px-4 py-2 text-sm font-semibold focus:z-20" href="#" aria-current="page">1</a>
                    <a className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 ring-1 ring-inset ring-neutral-200 dark:ring-neutral-900/50 hover:bg-neutral-100/50 dark:hover:bg-background-dark/50 focus:z-20" href="#">2</a>
                    <a className="relative hidden items-center px-4 py-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 ring-1 ring-inset ring-neutral-200 dark:ring-neutral-900/50 hover:bg-neutral-100/50 dark:hover:bg-background-dark/50 focus:z-20 md:inline-flex" href="#">3</a>
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-neutral-600 dark:text-neutral-200/60 ring-1 ring-inset ring-neutral-200 dark:ring-neutral-900/50">...</span>
                    <a className="relative hidden items-center px-4 py-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 ring-1 ring-inset ring-neutral-200 dark:ring-neutral-900/50 hover:bg-neutral-100/50 dark:hover:bg-background-dark/50 focus:z-20 md:inline-flex" href="#">5</a>
                    <a className="relative inline-flex items-center rounded-r-md px-2 py-2 text-neutral-600 dark:text-neutral-200/60 ring-1 ring-inset ring-neutral-200 dark:ring-neutral-900/50 hover:bg-neutral-100/50 dark:hover:bg-background-dark/50 focus:z-20 focus:outline-offset-0" href="#">
                      <Icon name="chevron_right" size={16} />
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
