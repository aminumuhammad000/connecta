import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { usersAPI, jobsAPI, projectsAPI, proposalsAPI, paymentsAPI, contractsAPI } from '../services/api'

interface DashboardData {
  totalUsers: number
  totalClients: number
  totalFreelancers: number
  totalJobs: number
  activeJobs: number
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalProposals: number
  pendingProposals: number
  totalContracts: number
  activeContracts: number
  totalRevenue: number
  pendingPayments: number
  recentUsers: any[]
  recentJobs: any[]
  recentProjects: any[]
  trends: {
    users: number
    jobs: number
    projects: number
    revenue: number
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel for maximum performance
      const [
        usersResponse,
        jobsResponse,
        projectsResponse,
        proposalsResponse,
        paymentsResponse,
        contractsResponse
      ] = await Promise.allSettled([
        usersAPI.getAll(),
        jobsAPI.getAll(),
        projectsAPI.getAll(),
        proposalsAPI.getAll(),
        paymentsAPI.getHistory(),
        contractsAPI.getAll()
      ])

      // Extract data from responses and ensure arrays
      const usersData: any = usersResponse.status === 'fulfilled' ? usersResponse.value : {}
      const users = Array.isArray(usersData) ? usersData : (usersData.data || [])
      
      const jobsData: any = jobsResponse.status === 'fulfilled' ? jobsResponse.value : {}
      const jobs = Array.isArray(jobsData) ? jobsData : (jobsData.data || [])
      
      const projectsData: any = projectsResponse.status === 'fulfilled' ? projectsResponse.value : {}
      const projects = Array.isArray(projectsData) ? projectsData : (projectsData.data || [])
      
      const proposalsData: any = proposalsResponse.status === 'fulfilled' ? proposalsResponse.value : {}
      const proposals = Array.isArray(proposalsData) ? proposalsData : (proposalsData.data || [])
      
      const paymentsData: any = paymentsResponse.status === 'fulfilled' ? paymentsResponse.value : {}
      const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData.data || [])
      
      const contractsData: any = contractsResponse.status === 'fulfilled' ? contractsResponse.value : {}
      const contracts = Array.isArray(contractsData) ? contractsData : (contractsData.data || [])

      // Calculate statistics
      console.log('Dashboard Data:', { users: users.length, jobs: jobs.length, projects: projects.length, proposals: proposals.length, payments: payments.length, contracts: contracts.length });
      
      const dashboardData: DashboardData = {
        totalUsers: users.length || 0,
        totalClients: users.filter((u: any) => u.userType === 'client' || u.role === 'client').length || 0,
        totalFreelancers: users.filter((u: any) => u.userType === 'freelancer' || u.role === 'freelancer').length || 0,
        
        totalJobs: jobs.length || 0,
        activeJobs: jobs.filter((j: any) => j.status === 'Open' || j.status === 'open' || j.status === 'active').length || 0,
        
        totalProjects: projects.length || 0,
        activeProjects: projects.filter((p: any) => p.status === 'In-Progress' || p.status === 'in-progress' || p.status === 'ongoing' || p.status === 'active').length || 0,
        completedProjects: projects.filter((p: any) => p.status === 'Completed' || p.status === 'completed').length || 0,
        
        totalProposals: proposals.length || 0,
        pendingProposals: proposals.filter((p: any) => p.status === 'pending').length || 0,
        
        totalContracts: contracts.length || 0,
        activeContracts: contracts.filter((c: any) => c.status === 'active' || c.status === 'in-progress' || c.status === 'ongoing').length || 0,
        
        totalRevenue: payments.filter((p: any) => p.status === 'completed').reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
        pendingPayments: payments.filter((p: any) => p.status === 'pending').length || 0,
        
        recentUsers: users.slice(-5).reverse() || [],
        recentJobs: jobs.slice(-3).reverse() || [],
        recentProjects: projects.slice(-3).reverse() || [],
        
        trends: {
          users: 12.5,
          jobs: 8.2,
          projects: 15.3,
          revenue: 23.1
        }
      }
      
      console.log('Dashboard Stats:', dashboardData);

      setData(dashboardData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
        {/* Page Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Loading dashboard data...</p>
            </div>
          ) : data ? (
            <div className="space-y-6 sm:space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Total Users */}
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4">
                    <div className="rounded-full bg-white/20 p-8">
                      <Icon name="group" size={48} className="opacity-50" />
                    </div>
                  </div>
                  <div className="relative">
                    <p className="text-sm font-medium text-blue-100 uppercase tracking-wider">Total Users</p>
                    <p className="mt-2 text-4xl font-bold">{data.totalUsers.toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <span className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                        <Icon name="trending_up" size={16} />
                        +{data.trends.users}%
                      </span>
                      <span className="text-blue-100">this month</span>
                    </div>
                    <div className="mt-3 text-xs text-blue-100">
                      Clients: {data.totalClients} • Freelancers: {data.totalFreelancers}
                    </div>
                  </div>
                </div>

                {/* Total Jobs */}
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4">
                    <div className="rounded-full bg-white/20 p-8">
                      <Icon name="work" size={48} className="opacity-50" />
                    </div>
                  </div>
                  <div className="relative">
                    <p className="text-sm font-medium text-purple-100 uppercase tracking-wider">Total Jobs</p>
                    <p className="mt-2 text-4xl font-bold">{data.totalJobs.toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <span className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                        <Icon name="trending_up" size={16} />
                        +{data.trends.jobs}%
                      </span>
                      <span className="text-purple-100">this month</span>
                    </div>
                    <div className="mt-3 text-xs text-purple-100">
                      Active: {data.activeJobs} jobs
                    </div>
                  </div>
                </div>

                {/* Total Projects */}
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4">
                    <div className="rounded-full bg-white/20 p-8">
                      <Icon name="folder" size={48} className="opacity-50" />
                    </div>
                  </div>
                  <div className="relative">
                    <p className="text-sm font-medium text-emerald-100 uppercase tracking-wider">Total Projects</p>
                    <p className="mt-2 text-4xl font-bold">{data.totalProjects.toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <span className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                        <Icon name="trending_up" size={16} />
                        +{data.trends.projects}%
                      </span>
                      <span className="text-emerald-100">this month</span>
                    </div>
                    <div className="mt-3 text-xs text-emerald-100">
                      Active: {data.activeProjects} • Completed: {data.completedProjects}
                    </div>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4">
                    <div className="rounded-full bg-white/20 p-8">
                      <Icon name="payments" size={48} className="opacity-50" />
                    </div>
                  </div>
                  <div className="relative">
                    <p className="text-sm font-medium text-amber-100 uppercase tracking-wider">Total Revenue</p>
                    <p className="mt-2 text-4xl font-bold">{formatCurrency(data.totalRevenue)}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <span className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                        <Icon name="trending_up" size={16} />
                        +{data.trends.revenue}%
                      </span>
                      <span className="text-amber-100">this month</span>
                    </div>
                    <div className="mt-3 text-xs text-amber-100">
                      Pending: {data.pendingPayments} payments
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Proposals</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{data.totalProposals}</p>
                    </div>
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <Icon name="description" size={24} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {data.pendingProposals} pending
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Contracts</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{data.totalContracts}</p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Icon name="contract" size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {data.activeContracts} active
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Active Jobs</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{data.activeJobs}</p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Icon name="work_outline" size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    of {data.totalJobs} total
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Active Projects</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{data.activeProjects}</p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Icon name="folder_open" size={24} className="text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    of {data.totalProjects} total
                  </p>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Users */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Users</h3>
                      <Link to="/users" className="text-sm font-medium text-primary hover:text-primary/80">
                        View all →
                      </Link>
                    </div>
                  </div>
                  <div className="p-6">
                    {data.recentUsers.length > 0 ? (
                      <div className="space-y-4">
                        {data.recentUsers.map((user: any, index: number) => (
                          <div key={user._id || index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                                {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {user.firstName} {user.lastName || user.email}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                                  {user.userType || user.role || 'User'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {user.createdAt ? formatDate(user.createdAt) : 'Recently'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <Icon name="person_off" size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No users found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <Link
                      to="/users"
                      className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors group"
                    >
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                        <Icon name="group" size={20} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">Manage Users</span>
                    </Link>

                    <Link
                      to="/projects"
                      className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors group"
                    >
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:scale-110 transition-transform">
                        <Icon name="folder" size={20} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">View Projects</span>
                    </Link>

                    <Link
                      to="/contracts"
                      className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors group"
                    >
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
                        <Icon name="contract" size={20} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">Review Contracts</span>
                    </Link>

                    <Link
                      to="/payments"
                      className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors group"
                    >
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg group-hover:scale-110 transition-transform">
                        <Icon name="payments" size={20} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">View Payments</span>
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary to-amber-500 rounded-lg hover:shadow-lg transition-all group"
                    >
                      <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                        <Icon name="settings" size={20} className="text-white" />
                      </div>
                      <span className="font-medium text-white">Platform Settings</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <Icon name="error_outline" size={64} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-lg">Failed to load dashboard data</p>
              <button
                onClick={fetchDashboardData}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>
  )
}
