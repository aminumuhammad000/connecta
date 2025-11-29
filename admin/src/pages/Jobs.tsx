import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { usersAPI } from '../services/api'
import type { User } from '../types'

export default function Jobs() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response: any = await usersAPI.getAll({ limit: 100 })
        if (response.success && response.data) {
          setUsers(response.data)
        } else if (Array.isArray(response)) {
          setUsers(response)
        } else {
          setUsers([])
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        toast.error('Failed to load users')
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])
  return (
    <main className="flex-1 p-4 md:p-8 overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        {/* PageHeading */}
        <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
          <p className="text-gray-900 dark:text-white text-2xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Users Management</p>
          <button className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em]">
            <Icon name="add_circle" size={20} />
            <span className="truncate">Add New User</span>
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-[#181210] p-3 md:p-4 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 items-end">
            {/* SearchBar */}
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block" htmlFor="search">Search</label>
              <div className="flex w-full flex-1 items-stretch rounded-lg h-12">
                <div className="text-gray-500 dark:text-gray-400 flex border-none bg-background-light dark:bg-background-dark items-center justify-center pl-4 rounded-l-lg border-r-0">
                  <Icon name="search" />
                </div>
                <input
                  id="search"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-background-light dark:bg-background-dark h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                  placeholder="Search by name, email, user type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {/* Chips */}
            <div className="flex items-end gap-2 flex-wrap">
              <div className="flex-1 min-w-[150px]">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block" htmlFor="status-filter">Status</label>
                <button
                  id="status-filter"
                  className="flex w-full h-12 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-3 text-left border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="tune" className="text-gray-600 dark:text-gray-300" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-normal">All Statuses</p>
                  </div>
                  <Icon name="expand_more" className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block" htmlFor="date-filter">Date Posted</label>
                <button
                  id="date-filter"
                  className="flex w-full h-12 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-3 text-left border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="calendar_today" className="text-gray-600 dark:text-gray-300" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-normal">Any Date</p>
                  </div>
                  <Icon name="expand_more" className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
            {/* SingleButton */}
            <div className="flex items-end h-12">
              <button className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em]">
                <span className="truncate">Apply Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-[#181210] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 min-w-[640px]">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="p-4 w-4">
                    <input type="checkbox" className="form-checkbox h-4 w-4 rounded text-primary bg-gray-100 border-gray-300 focus:ring-primary dark:focus:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold">Name</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Email</th>
                  <th scope="col" className="px-6 py-3 font-semibold">User Type</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Created At</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                        <Icon name="progress_activity" className="animate-spin" size={24} />
                        <span>Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users
                    .filter((user) =>
                      searchTerm.trim()
                        ? `${user.name} ${user.email} ${user.userType}`.toLowerCase().includes(searchTerm.toLowerCase())
                        : true
                    )
                    .map((user) => (
                      <tr key={user._id} className="bg-white dark:bg-[#181210] border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <td className="p-4 w-4">
                          <input type="checkbox" className="form-checkbox h-4 w-4 rounded text-primary bg-gray-100 border-gray-300 focus:ring-primary dark:focus:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{user.name || 'N/A'}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.userType === 'freelancer'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            }`}>
                            {user.userType}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                            <Icon name="more_horiz" />
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-3 md:p-4 border-t border-gray-200 dark:border-gray-800 gap-3">
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 text-center sm:text-left">
              Showing <span className="font-semibold text-gray-900 dark:text-white">1-5</span> of <span className="font-semibold text-gray-900 dark:text-white">100</span>
            </span>
            <div className="inline-flex items-center -space-x-px">
              <a className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" href="#">Previous</a>
              <a className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" href="#">Next</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
