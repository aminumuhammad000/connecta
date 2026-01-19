import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { usersAPI, projectsAPI, paymentsAPI, proposalsAPI, profilesAPI } from '../services/api'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  userType: 'client' | 'freelancer' | 'admin'
  profileImage?: string
  phone?: string
  location?: string
  createdAt: string
  isVerified?: boolean
  isActive?: boolean
  isPremium?: boolean
  premiumExpiryDate?: string
  rating?: number
  totalJobs?: number
  totalProjects?: number
}

interface UserDetails {
  user: User
  profile?: any
  projects?: any[]
  payments?: any[]
  proposals?: any[]
  stats?: {
    totalProjects: number
    totalPayments: number
    totalProposals: number
    totalEarnings: number
  }
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10
  const [showFilters, setShowFilters] = useState(false)
  const [showActionSheet, setShowActionSheet] = useState<string | null>(null)

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'danger' | 'warning' | 'info'
    onConfirm: () => Promise<void>
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: async () => { },
  })

  useEffect(() => {
    fetchUsers()
  }, [filterType])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: 100 // Increase limit to ensure all users are fetched
      }

      // Only fetch non-admin users
      if (filterType === 'all') {
        // Backend will exclude admins by default
      } else if (filterType !== 'admin') {
        params.userType = filterType
      }

      const response: any = await usersAPI.getAll(params)

      // Handle different response formats
      let userData = []
      if (response.success && response.data) {
        userData = response.data
      } else if (Array.isArray(response)) {
        userData = response
      } else if (response.data && Array.isArray(response.data)) {
        userData = response.data
      }

      console.log('Users data with isPremium:', userData.map((u: any) => ({
        name: `${u.firstName} ${u.lastName}`,
        isPremium: u.isPremium,
        userType: u.userType
      })))

      setUsers(userData)

      if (userData.length === 0) {
        toast('No users found', { icon: 'ℹ️' })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load users'
      toast.error(errorMessage)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserDetails = async (userId: string) => {
    try {
      setLoadingDetails(true)
      setShowDetailModal(true)

      // Fetch user basic info
      const userResponse = await usersAPI.getById(userId)
      console.log('User response:', userResponse)
      const user = userResponse.data || userResponse

      // Fetch related data in parallel
      const [projectsRes, paymentsRes, proposalsRes, profileRes] = await Promise.allSettled([
        projectsAPI.getAll({ userId }).catch((err) => {
          console.log('Projects error:', err)
          return { data: [] }
        }),
        paymentsAPI.getAll({ userId }).catch((err) => {
          console.log('Payments error:', err)
          return { data: [] }
        }),
        proposalsAPI.getAll({ userId }).catch((err) => {
          console.log('Proposals error:', err)
          return { data: [] }
        }),
        profilesAPI.getByUserId(userId).catch((err) => {
          console.log('Profile error:', err)
          return null
        })
      ])

      const projects = projectsRes.status === 'fulfilled' ? (projectsRes.value?.data || []) : []
      const payments = paymentsRes.status === 'fulfilled' ? (paymentsRes.value?.data || []) : []
      const proposals = proposalsRes.status === 'fulfilled' ? (proposalsRes.value?.data || []) : []
      const profile = profileRes.status === 'fulfilled' ? profileRes.value : null

      // Calculate stats
      const totalEarnings = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

      console.log('User details assembled:', { user, projects, payments, proposals })

      setUserDetails({
        user,
        profile,
        projects: Array.isArray(projects) ? projects : [],
        payments: Array.isArray(payments) ? payments : [],
        proposals: Array.isArray(proposals) ? proposals : [],
        stats: {
          totalProjects: projects.length || 0,
          totalPayments: payments.length || 0,
          totalProposals: proposals.length || 0,
          totalEarnings
        }
      })
    } catch (error: any) {
      console.error('Error fetching user details:', error)
      console.error('Error response:', error.response)
      toast.error('Failed to load user details: ' + (error.message || 'Unknown error'))
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId)
    fetchUserDetails(userId)
  }

  const handleBanUser = (userId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Ban User',
      message: 'Are you sure you want to ban this user? They will not be able to log in.',
      type: 'warning',
      onConfirm: async () => {
        try {
          await usersAPI.ban(userId)
          toast.success('User banned successfully')
          fetchUsers()
          if (showDetailModal && selectedUserId === userId) {
            fetchUserDetails(userId)
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to ban user')
        }
      }
    })
  }

  const handleUnbanUser = (userId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Unban User',
      message: 'Are you sure you want to unban this user? They will regain access to the platform.',
      type: 'info',
      onConfirm: async () => {
        try {
          await usersAPI.unban(userId)
          toast.success('User unbanned successfully')
          fetchUsers()
          if (showDetailModal && selectedUserId === userId) {
            fetchUserDetails(userId)
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to unban user')
        }
      }
    })
  }

  const handleDeleteUser = (userId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone and will remove all associated data.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await usersAPI.delete(userId)
          toast.success('User deleted successfully')
          fetchUsers()
          setShowDetailModal(false)
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to delete user')
        }
      }
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterType])

  // Calculate stats (excluding admins)
  const stats = {
    total: users.length,
    clients: users.filter(u => u.userType === 'client').length,
    freelancers: users.filter(u => u.userType === 'freelancer').length,
    active: users.filter(u => u.isActive !== false).length,
    banned: users.filter(u => u.isActive === false).length,
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background-light dark:bg-background-dark">
        <div className="container mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-light-primary dark:text-dark-primary">
              User Management
            </h1>
            <p className="text-text-light-secondary dark:text-dark-secondary mt-1">
              Manage platform users (Clients & Freelancers only)
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium opacity-90 uppercase">Total Users</p>
                  <p className="text-2xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Icon name="people" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium opacity-90 uppercase">Clients</p>
                  <p className="text-2xl font-bold mt-1">{stats.clients}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Icon name="business" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium opacity-90 uppercase">Freelancers</p>
                  <p className="text-2xl font-bold mt-1">{stats.freelancers}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Icon name="person" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium opacity-90 uppercase">Active</p>
                  <p className="text-2xl font-bold mt-1">{stats.active}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Icon name="check_circle" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium opacity-90 uppercase">Banned</p>
                  <p className="text-2xl font-bold mt-1">{stats.banned}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Icon name="block" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
            <div className="p-4 sm:p-6 border-b border-border-light dark:border-border-dark">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-bold text-text-light-primary dark:text-dark-primary">All Users</h2>
                <button
                  onClick={fetchUsers}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2 min-h-[44px] bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <Icon name="refresh" size={18} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Search - Full width on mobile */}
              <div className="mt-4">
                <div className="relative">
                  <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-dark-secondary z-10" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary placeholder:text-text-light-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Filter Toggle Button - Mobile only */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden w-full mt-3 px-4 py-3 min-h-[44px] bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary font-medium flex items-center justify-between hover:bg-border-light dark:hover:bg-border-dark transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Icon name="filter_list" size={20} />
                  Filter by Type
                </span>
                <Icon name={showFilters ? "expand_less" : "expand_more"} size={20} />
              </button>

              {/* Mobile Filter Drawer */}
              <div className={`md:hidden overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-48 mt-3' : 'max-h-0'}`}>
                <div className="space-y-2">
                  {['all', 'client', 'freelancer'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setFilterType(filter)
                        setShowFilters(false)
                      }}
                      className={`w-full px-4 py-3 min-h-[44px] rounded-lg text-left font-medium transition-colors ${filterType === filter
                        ? 'bg-primary text-white'
                        : 'bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-border-light dark:hover:bg-border-dark'
                        }`}
                    >
                      {filter === 'all' ? 'All Users' : filter === 'client' ? 'Clients' : 'Freelancers'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Filter Select */}
              <div className="hidden md:block mt-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All Users</option>
                  <option value="client">Clients</option>
                  <option value="freelancer">Freelancers</option>
                </select>
              </div>
            </div>


            {/* Users Table/Cards */}
            <div className="w-full">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-text-light-secondary dark:text-dark-secondary font-medium">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20">
                  <Icon name="person_off" size={64} className="mx-auto text-text-light-secondary dark:text-dark-secondary mb-4 opacity-50" />
                  <p className="text-text-light-secondary dark:text-dark-secondary text-lg">No users found</p>
                  <p className="text-text-light-secondary dark:text-dark-secondary text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-border-light dark:divide-border-dark max-w-2xl mx-auto">
                    {currentUsers.map((user) => (
                      <div key={user._id} className="p-4 hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                        <div className="flex items-start gap-3">
                          {/* User Avatar */}
                          <div
                            className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={user.profileImage ? {
                              backgroundImage: `url(${user.profileImage})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            } : undefined}
                          >
                            {!user.profileImage && getInitials(user.firstName, user.lastName)}
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-text-light-primary dark:text-dark-primary truncate">
                                {user.firstName} {user.lastName}
                              </p>
                              {user.isPremium === true && (
                                <Icon
                                  name="verified"
                                  size={16}
                                  className={`flex-shrink-0 ${user.userType === 'freelancer'
                                    ? 'text-blue-500'
                                    : 'text-red-500'
                                    }`}
                                />
                              )}
                            </div>
                            <p className="text-sm text-text-light-secondary dark:text-dark-secondary truncate mb-2">{user.email}</p>

                            {/* Type and Status Badges */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${user.userType === 'freelancer'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                }`}>
                                <Icon name={user.userType === 'freelancer' ? 'person' : 'business'} size={12} />
                                {user.userType}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${user.isActive === false
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                }`}>
                                <Icon name={user.isActive === false ? 'block' : 'check_circle'} size={12} />
                                {user.isActive === false ? 'Banned' : 'Active'}
                              </span>
                            </div>

                            <p className="text-xs text-text-light-secondary dark:text-dark-secondary">
                              Joined {formatDate(user.createdAt)}
                            </p>
                          </div>

                          {/* Mobile Action Menu Button */}
                          <button
                            onClick={() => setShowActionSheet(showActionSheet === user._id ? null : user._id)}
                            className="p-2 hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors flex-shrink-0"
                            aria-label="User actions"
                          >
                            <Icon name="more_vert" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
                          </button>
                        </div>

                        {/* Mobile Action Sheet */}
                        {showActionSheet === user._id && (
                          <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark space-y-2">
                            <button
                              onClick={() => {
                                handleViewUser(user._id)
                                setShowActionSheet(null)
                              }}
                              className="w-full px-4 py-3 min-h-[44px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            >
                              <Icon name="visibility" size={18} />
                              View Details
                            </button>
                            {user.isActive === false ? (
                              <button
                                onClick={() => {
                                  handleUnbanUser(user._id)
                                  setShowActionSheet(null)
                                }}
                                className="w-full px-4 py-3 min-h-[44px] bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg font-medium flex items-center gap-2 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                              >
                                <Icon name="check_circle" size={18} />
                                Unban User
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  handleBanUser(user._id)
                                  setShowActionSheet(null)
                                }}
                                className="w-full px-4 py-3 min-h-[44px] bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg font-medium flex items-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                              >
                                <Icon name="block" size={18} />
                                Ban User
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleDeleteUser(user._id)
                                setShowActionSheet(null)
                              }}
                              className="w-full px-4 py-3 min-h-[44px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            >
                              <Icon name="delete" size={18} />
                              Delete User
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider whitespace-nowrap">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider whitespace-nowrap">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider whitespace-nowrap">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider whitespace-nowrap">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light dark:divide-border-dark">
                        {currentUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div
                                  className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                  style={user.profileImage ? {
                                    backgroundImage: `url(${user.profileImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                  } : undefined}
                                >
                                  {!user.profileImage && getInitials(user.firstName, user.lastName)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-text-light-primary dark:text-dark-primary truncate">
                                      {user.firstName} {user.lastName}
                                    </p>
                                    {user.isPremium === true && (
                                      <Icon
                                        name="verified"
                                        size={18}
                                        className={`flex-shrink-0 ${user.userType === 'freelancer'
                                          ? 'text-blue-500'
                                          : 'text-red-500'
                                          }`}
                                      />
                                    )}
                                  </div>
                                  <p className="text-sm text-text-light-secondary dark:text-dark-secondary truncate">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${user.userType === 'freelancer'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                }`}>
                                <Icon name={user.userType === 'freelancer' ? 'person' : 'business'} size={14} />
                                {user.userType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${user.isActive === false
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                }`}>
                                <Icon name={user.isActive === false ? 'block' : 'check_circle'} size={14} />
                                {user.isActive === false ? 'Banned' : 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-text-light-secondary dark:text-dark-secondary whitespace-nowrap">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleViewUser(user._id)}
                                  className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Icon name="visibility" size={18} className="text-blue-600 dark:text-blue-400" />
                                </button>
                                {user.isActive === false ? (
                                  <button
                                    onClick={() => handleUnbanUser(user._id)}
                                    className="p-2 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                    title="Unban User"
                                  >
                                    <Icon name="check_circle" size={18} className="text-green-600 dark:text-green-400" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleBanUser(user._id)}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="Ban User"
                                  >
                                    <Icon name="block" size={18} className="text-red-600 dark:text-red-400" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  title="Delete User"
                                >
                                  <Icon name="delete" size={18} className="text-red-600 dark:text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-border-light dark:border-border-dark">
                      <div className="text-sm text-text-light-secondary dark:text-dark-secondary text-center sm:text-left">
                        Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-2 min-h-[44px] sm:min-h-0 rounded-lg border border-border-light dark:border-border-dark text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                          Previous
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`min-w-[44px] h-11 sm:h-10 rounded-lg font-medium transition-colors ${page === currentPage
                                    ? 'bg-primary text-white'
                                    : 'text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark'
                                    }`}
                                >
                                  {page}
                                </button>
                              )
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <span key={page} className="px-2 text-text-light-secondary dark:text-dark-secondary">
                                  ...
                                </span>
                              )
                            }
                            return null
                          })}
                        </div>

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 min-h-[44px] sm:min-h-0 rounded-lg border border-border-light dark:border-border-dark text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div >
      </main >

      {/* Detailed User Modal */}
      {
        showDetailModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />

              <div className="relative bg-card-light dark:bg-card-dark rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-light dark:border-border-dark">
                  <h3 className="text-xl sm:text-2xl font-bold text-text-light-primary dark:text-dark-primary">
                    User Details
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 min-h-[44px] min-w-[44px] hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Icon name="close" size={24} className="text-text-light-secondary dark:text-dark-secondary" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {loadingDetails ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                      <p className="text-text-light-secondary dark:text-dark-secondary">Loading user details...</p>
                    </div>
                  ) : userDetails ? (
                    <div className="space-y-4 sm:space-y-6">
                      {/* User Profile Section */}
                      <div className="bg-gradient-to-br from-primary/10 to-amber-500/10 dark:from-primary/20 dark:to-amber-500/20 rounded-xl p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                          <div
                            className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl flex-shrink-0"
                            style={userDetails.user.profileImage ? {
                              backgroundImage: `url(${userDetails.user.profileImage})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            } : undefined}
                          >
                            {!userDetails.user.profileImage && getInitials(userDetails.user.firstName, userDetails.user.lastName)}
                          </div>
                          <div className="flex-1 text-center sm:text-left w-full">
                            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-2">
                              <h4 className="text-xl sm:text-2xl font-bold text-text-light-primary dark:text-dark-primary">
                                {userDetails.user.firstName} {userDetails.user.lastName}
                              </h4>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${userDetails.user.isActive === false
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                }`}>
                                <Icon name={userDetails.user.isActive === false ? 'block' : 'check_circle'} size={14} />
                                {userDetails.user.isActive === false ? 'Banned' : 'Active'}
                              </span>
                            </div>
                            <p className="text-text-light-secondary dark:text-dark-secondary mb-4">{userDetails.user.email}</p>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <p className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase mb-1">Type</p>
                                <p className="text-text-light-primary dark:text-dark-primary font-medium capitalize">{userDetails.user.userType}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase mb-1">Joined</p>
                                <p className="text-text-light-primary dark:text-dark-primary font-medium">{formatDate(userDetails.user.createdAt)}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase mb-1">Rating</p>
                                <p className="text-text-light-primary dark:text-dark-primary font-medium">
                                  {userDetails.user.rating ? `${userDetails.user.rating}/5 ⭐` : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase mb-1">Phone</p>
                                <p className="text-text-light-primary dark:text-dark-primary font-medium">{userDetails.user.phone || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Icon name="work" size={24} className="text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{userDetails.stats?.totalProjects || 0}</p>
                              <p className="text-xs text-text-light-secondary dark:text-dark-secondary">Projects</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Icon name="payments" size={24} className="text-green-600 dark:text-green-400" />
                            <div>
                              <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{userDetails.stats?.totalPayments || 0}</p>
                              <p className="text-xs text-text-light-secondary dark:text-dark-secondary">Payments</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 sm:p-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Icon name="description" size={24} className="text-purple-600 dark:text-purple-400" />
                            <div>
                              <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{userDetails.stats?.totalProposals || 0}</p>
                              <p className="text-xs text-text-light-secondary dark:text-dark-secondary">Proposals</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 sm:p-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Icon name="account_balance_wallet" size={24} className="text-amber-600 dark:text-amber-400" />
                            <div>
                              <p className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400">{formatCurrency(userDetails.stats?.totalEarnings || 0)}</p>
                              <p className="text-xs text-text-light-secondary dark:text-dark-secondary">Earnings</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Profile Information */}
                      {userDetails.profile && (
                        <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 sm:p-6 border border-border-light dark:border-border-dark">
                          <h5 className="text-base sm:text-lg font-bold text-text-light-primary dark:text-dark-primary mb-4 flex items-center gap-2">
                            <Icon name="account_circle" size={24} className="text-primary" />
                            Profile Information
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase mb-1">Bio</p>
                              <p className="text-text-light-primary dark:text-dark-primary">{userDetails.profile.bio || 'No bio provided'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase mb-1">Skills</p>
                              <p className="text-text-light-primary dark:text-dark-primary">{userDetails.profile.skills?.join(', ') || 'No skills listed'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase mb-1">Location</p>
                              <p className="text-text-light-primary dark:text-dark-primary">{userDetails.profile.location || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase mb-1">Hourly Rate</p>
                              <p className="text-text-light-primary dark:text-dark-primary">{userDetails.profile.hourlyRate ? formatCurrency(userDetails.profile.hourlyRate) : 'Not set'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {userDetails.projects && userDetails.projects.length > 0 && (
                        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                          <h5 className="text-lg font-bold text-text-light-primary dark:text-dark-primary mb-4 flex items-center gap-2">
                            <Icon name="work" size={24} className="text-primary" />
                            Projects ({userDetails.projects.length})
                          </h5>
                          <div className="space-y-3">
                            {userDetails.projects.slice(0, 5).map((project: any) => (
                              <div key={project._id} className="flex items-center justify-between p-3 bg-background-light dark:bg-background-dark rounded-lg">
                                <div className="flex-1">
                                  <p className="font-semibold text-text-light-primary dark:text-dark-primary">{project.title}</p>
                                  <p className="text-sm text-text-light-secondary dark:text-dark-secondary">Status: {project.status}</p>
                                </div>
                                <span className="text-sm font-medium text-text-light-secondary dark:text-dark-secondary">
                                  {formatCurrency(project.budget?.amount || 0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Payments */}
                      {userDetails.payments && userDetails.payments.length > 0 && (
                        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                          <h5 className="text-lg font-bold text-text-light-primary dark:text-dark-primary mb-4 flex items-center gap-2">
                            <Icon name="payments" size={24} className="text-primary" />
                            Recent Payments ({userDetails.payments.length})
                          </h5>
                          <div className="space-y-3">
                            {userDetails.payments.slice(0, 5).map((payment: any) => (
                              <div key={payment._id} className="flex items-center justify-between p-3 bg-background-light dark:bg-background-dark rounded-lg">
                                <div className="flex-1">
                                  <p className="font-semibold text-text-light-primary dark:text-dark-primary">{payment.description || 'Payment'}</p>
                                  <p className="text-sm text-text-light-secondary dark:text-dark-secondary">{formatDate(payment.createdAt)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(payment.amount || 0)}</p>
                                  <p className="text-xs text-slate-500">{payment.status}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Proposals */}
                      {userDetails.proposals && userDetails.proposals.length > 0 && (
                        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                          <h5 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Icon name="description" size={24} className="text-primary" />
                            Proposals ({userDetails.proposals.length})
                          </h5>
                          <div className="space-y-3">
                            {userDetails.proposals.slice(0, 5).map((proposal: any) => (
                              <div key={proposal._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-semibold text-slate-900 dark:text-white">{proposal.title || 'Proposal'}</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">{formatDate(proposal.createdAt)}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${proposal.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  proposal.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  }`}>
                                  {proposal.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <Icon name="error" size={64} className="mx-auto text-slate-400 mb-4 opacity-50" />
                      <p className="text-slate-600 dark:text-slate-400">Failed to load user details</p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                {userDetails && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-border-light dark:border-border-dark">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      {userDetails.user.isActive === false ? (
                        <button
                          onClick={() => handleUnbanUser(userDetails.user._id)}
                          className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium inline-flex items-center justify-center gap-2"
                        >
                          <Icon name="check_circle" size={18} />
                          Unban User
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBanUser(userDetails.user._id)}
                          className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium inline-flex items-center justify-center gap-2"
                        >
                          <Icon name="block" size={18} />
                          Ban User
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(userDetails.user._id)}
                        className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-text-light-primary dark:text-dark-primary rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors font-medium inline-flex items-center justify-center gap-2"
                      >
                        <Icon name="delete" size={18} />
                        Delete User
                      </button>
                    </div>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary rounded-lg hover:bg-border-light dark:hover:bg-border-dark transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Confirmation Modal */}
      {
        confirmModal.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 border border-border-light dark:border-border-dark animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <div className={`p-2 sm:p-3 rounded-full ${confirmModal.type === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                  confirmModal.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                  <Icon name={
                    confirmModal.type === 'danger' ? 'warning' :
                      confirmModal.type === 'warning' ? 'report_problem' :
                        'info'
                  } size={24} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-text-light-primary dark:text-dark-primary">
                  {confirmModal.title}
                </h3>
              </div>

              <p className="text-sm sm:text-base text-text-light-secondary dark:text-dark-secondary mb-6 leading-relaxed">
                {confirmModal.message}
              </p>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="w-full sm:w-auto px-4 py-3 min-h-[44px] text-sm font-medium text-text-light-primary dark:text-dark-primary hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await confirmModal.onConfirm()
                    setConfirmModal(prev => ({ ...prev, isOpen: false }))
                  }}
                  className={`w-full sm:w-auto px-4 py-3 min-h-[44px] text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${confirmModal.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                    confirmModal.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                      'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  )
}
