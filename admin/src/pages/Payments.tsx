import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'

export default function Payments() {
  return (
    <AppLayout>
      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* PageHeading */}
          <header className="flex flex-col md:flex-row flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-gray-900 dark:text-gray-100 text-2xl md:text-4xl font-black leading-tight tracking-tighter">Payments & Withdrawals</h1>
              <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">Monitor and manage all financial transactions within the platform.</p>
            </div>
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-bold leading-normal tracking-wide hover:bg-gray-300 dark:hover:bg-gray-700 gap-2">
              <Icon name="download" size={16} />
              <span className="truncate">Export Report</span>
            </button>
          </header>

          {/* Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              <p className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal">Total Platform Revenue</p>
              <p className="text-gray-900 dark:text-gray-100 tracking-tight text-3xl font-bold leading-tight">$1,234,567</p>
              <p className="text-green-600 dark:text-green-500 text-sm font-medium leading-normal">+5.2% vs last month</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              <p className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal">Pending Withdrawals</p>
              <p className="text-gray-900 dark:text-gray-100 tracking-tight text-3xl font-bold leading-tight">$89,123</p>
              <p className="text-yellow-600 dark:text-yellow-500 text-sm font-medium leading-normal">12 requests awaiting approval</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              <p className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal">Successful Transactions</p>
              <p className="text-gray-900 dark:text-gray-100 tracking-tight text-3xl font-bold leading-tight">12,456</p>
              <p className="text-green-600 dark:text-green-500 text-sm font-medium leading-normal">+10.1% vs last month</p>
            </div>
          </section>

          {/* Tabs, Toolbar, and Table */}
          <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800">
            {/* Tabs */}
            <nav className="pb-3">
              <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 gap-4 md:gap-8">
                <a className="flex flex-col items-center justify-center border-b-[3px] border-b-primary text-primary pb-3 pt-4" href="#">
                  <p className="text-sm font-bold leading-normal">Payment History</p>
                </a>
                <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 pb-3 pt-4" href="#">
                  <p className="text-sm font-bold leading-normal">Withdrawal Requests</p>
                </a>
                <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 pb-3 pt-4" href="#">
                  <p className="text-sm font-bold leading-normal">Wallet Balances</p>
                </a>
              </div>
            </nav>

            {/* ToolBar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-6 py-4">
              <div className="relative w-full md:w-auto md:max-w-xs">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-primary focus:border-primary text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <select className="w-full md:w-auto border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:ring-primary focus:border-primary">
                  <option>Status: All</option>
                  <option>Completed</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
                <input type="date" className="w-full md:w-auto border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:ring-primary focus:border-primary" />
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 min-w-[640px]">
                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3">Transaction ID</th>
                    <th scope="col" className="px-6 py-3">Client</th>
                    <th scope="col" className="px-6 py-3">Freelancer</th>
                    <th scope="col" className="px-6 py-3">Amount</th>
                    <th scope="col" className="px-6 py-3">Date</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white dark:bg-black border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400">TXN-8A34-B2C1</td>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">Liam Johnson</th>
                    <td className="px-6 py-4">Olivia Chen</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">$2,500.00</td>
                    <td className="px-6 py-4">2023-10-26</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a href="#" className="font-medium text-primary hover:underline">View Details</a>
                    </td>
                  </tr>
                  <tr className="bg-white dark:bg-black border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400">TXN-4F67-E8D9</td>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">Sophia Rodriguez</th>
                    <td className="px-6 py-4">Noah Kim</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">$1,800.00</td>
                    <td className="px-6 py-4">2023-10-25</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        <span className="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a href="#" className="font-medium text-primary hover:underline">View Details</a>
                    </td>
                  </tr>
                  <tr className="bg-white dark:bg-black border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400">TXN-9G12-H3K4</td>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">Ava Patel</th>
                    <td className="px-6 py-4">Ethan Williams</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">$3,200.00</td>
                    <td className="px-6 py-4">2023-10-24</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
                        Failed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a href="#" className="font-medium text-primary hover:underline">View Details</a>
                    </td>
                  </tr>
                  <tr className="bg-white dark:bg-black border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400">TXN-5L56-M7N8</td>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">Isabella Garcia</th>
                    <td className="px-6 py-4">Mason Jones</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">$750.00</td>
                    <td className="px-6 py-4">2023-10-23</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a href="#" className="font-medium text-primary hover:underline">View Details</a>
                    </td>
                  </tr>
                  <tr className="bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400">TXN-1P90-Q2R3</td>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">James Brown</th>
                    <td className="px-6 py-4">Emma Davis</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">$4,500.00</td>
                    <td className="px-6 py-4">2023-10-22</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a href="#" className="font-medium text-primary hover:underline">View Details</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <nav aria-label="Table navigation" className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4">
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-white">1-5</span> of <span className="font-semibold text-gray-900 dark:text-white">100</span>
              </span>
              <ul className="inline-flex items-stretch -space-x-px">
                <li>
                  <a className="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-black dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white" href="#">
                    <span className="sr-only">Previous</span>
                    <Icon name="chevron_left" size={16} />
                  </a>
                </li>
                <li>
                  <a className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-black dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white" href="#">1</a>
                </li>
                <li>
                  <a className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-black dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white" href="#">2</a>
                </li>
                <li>
                  <a aria-current="page" className="z-10 flex items-center justify-center text-sm py-2 px-3 leading-tight text-primary bg-primary/10 border border-primary hover:bg-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-primary" href="#">3</a>
                </li>
                <li>
                  <a className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-black dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white" href="#">...</a>
                </li>
                <li>
                  <a className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-black dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white" href="#">20</a>
                </li>
                <li>
                  <a className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-black dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white" href="#">
                    <span className="sr-only">Next</span>
                    <Icon name="chevron_right" size={16} />
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
