import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { projectsAPI } from '../services/api'

interface ProjectData {
  _id: string
  title: string
  description: string
  summary: string
  dateRange: {
    startDate: string
    endDate: string
  }
  status: 'ongoing' | 'completed' | 'cancelled'
  statusLabel: string
  clientId: string
  clientName: string
  clientVerified: boolean
  freelancerId: string
  budget: {
    amount: number
    currency: string
    type: 'fixed' | 'hourly'
  }
  projectType: string
  deliverables: string[]
  milestones?: Array<{
    title: string
    status: 'pending' | 'in-progress' | 'completed'
    dueDate: string
    amount?: number
  }>
  createdAt: string
  updatedAt: string
  // Populated data
  client?: any
  freelancer?: any
}

interface Stats {
  total: number
  ongoing: number
  completed: number
  cancelled: number
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'completed' | 'cancelled'>('all')
  const [stats, setStats] = useState<Stats>({ total: 0, ongoing: 0, completed: 0, cancelled: 0 })
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showActionSheet, setShowActionSheet] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; projectId: string | null; projectTitle: string }>({ isOpen: false, projectId: null, projectTitle: '' })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await projectsAPI.getAll()
      console.log('Projects response:', response)

      // Handle both response formats: array or {data: []}
      const projectsData = Array.isArray(response) ? response : (response?.data || [])
      setProjects(projectsData)

      // Calculate stats
      const stats = {
        total: projectsData.length,
        ongoing: projectsData.filter((p: ProjectData) => p.status === 'ongoing').length,
        completed: projectsData.filter((p: ProjectData) => p.status === 'completed').length,
        cancelled: projectsData.filter((p: ProjectData) => p.status === 'cancelled').length,
      }
      setStats(stats)
    } catch (error: any) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects: ' + (error?.message || 'Unknown error'))
      setProjects([])
      setStats({ total: 0, ongoing: 0, completed: 0, cancelled: 0 })
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = searchTerm.trim()
      ? `${project.title} ${project.clientName} ${project.description}`.toLowerCase().includes(searchTerm.toLowerCase())
      : true

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewDetails = async (project: ProjectData) => {
    setSelectedProject(project)
    setShowDetailsModal(true)
  }

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    setConfirmDelete({ isOpen: true, projectId, projectTitle })
  }

  const confirmDeleteProject = async () => {
    if (!confirmDelete.projectId) return

    try {
      await projectsAPI.delete(confirmDelete.projectId)
      toast.success('Project deleted successfully')
      // Remove from local state
      setProjects(projects.filter(p => p._id !== confirmDelete.projectId))
      // Recalculate stats
      const updatedProjects = projects.filter(p => p._id !== confirmDelete.projectId)
      setStats({
        total: updatedProjects.length,
        ongoing: updatedProjects.filter(p => p.status === 'ongoing').length,
        completed: updatedProjects.filter(p => p.status === 'completed').length,
        cancelled: updatedProjects.filter(p => p.status === 'cancelled').length,
      })
      setConfirmDelete({ isOpen: false, projectId: null, projectTitle: '' })
    } catch (error: any) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project: ' + (error?.response?.data?.message || error?.message || 'Unknown error'))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
    }
  }
  return (
    <main className="flex-1 flex-col p-4 md:p-6 lg:p-8">
      {/* Page Heading */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-text-light-primary dark:text-dark-primary text-2xl md:text-3xl font-black leading-tight tracking-tighter">
            Project Management
          </p>
          <p className="text-text-light-secondary dark:text-dark-secondary text-sm sm:text-base font-normal leading-normal">
            View and manage all active and completed projects
          </p>
        </div>
        <button
          onClick={() => toast('Create project feature coming soon', { icon: '🚀' })}
          className="w-full sm:w-auto flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 sm:h-10 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 transition-all"
        >
          <Icon name="add" size={20} />
          <span className="truncate">New Project</span>
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light-secondary dark:text-dark-secondary">Total Projects</p>
              <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Icon name="folder" size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light-secondary dark:text-dark-secondary">Ongoing</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.ongoing}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Icon name="pending" size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light-secondary dark:text-dark-secondary">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Icon name="check_circle" size={24} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light-secondary dark:text-dark-secondary">Cancelled</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.cancelled}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Icon name="cancel" size={24} className="text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 md:p-6 border border-border-light dark:border-border-dark">
        {/* Search & Filters */}
        <div className="space-y-3 mb-6">
          {/* Search Bar - Full width */}
          <div className="relative">
            <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-dark-secondary z-10" />
            <input
              className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-lg text-text-light-primary dark:text-dark-primary focus:outline-0 focus:ring-2 focus:ring-primary border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark placeholder:text-text-light-secondary placeholder:dark:text-dark-secondary text-base font-normal leading-normal"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            {/* Filter Toggle - Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex-1 px-4 py-3 min-h-[44px] bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary font-medium flex items-center justify-between hover:bg-border-light dark:hover:bg-border-dark transition-colors"
            >
              <span className="flex items-center gap-2">
                <Icon name="filter_list" size={20} />
                Filter Status
              </span>
              <Icon name={showFilters ? "expand_less" : "expand_more"} size={20} />
            </button>

            {/* Status Filter - Desktop */}
            <div className="hidden md:block flex-1 relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full h-12 px-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-light-primary dark:text-dark-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Icon name="expand_more" size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-dark-secondary pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchProjects}
              disabled={loading}
              className="px-4 py-3 min-h-[44px] h-12 flex items-center justify-center gap-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark transition-colors disabled:opacity-50"
            >
              <Icon name="refresh" size={20} className={`text-text-light-primary dark:text-dark-primary ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-sm font-medium text-text-light-primary dark:text-dark-primary">Refresh</span>
            </button>
          </div>

          {/* Mobile Filter Drawer */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-64' : 'max-h-0'}`}>
            <div className="space-y-2 pt-2">
              {['all', 'ongoing', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status as any)
                    setShowFilters(false)
                  }}
                  className={`w-full px-4 py-3 min-h-[44px] rounded-lg text-left font-medium transition-colors capitalize ${statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary hover:bg-border-light dark:hover:bg-border-dark'
                    }`}
                >
                  {status === 'all' ? 'All Status' : status}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* Projects List - Mobile Cards / Desktop Table */}
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Icon name="progress_activity" className="animate-spin" size={32} />
              <span className="text-base font-medium text-text-light-secondary dark:text-dark-secondary mt-3">Loading projects...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center py-20">
              <div className="p-4 bg-background-light dark:bg-background-dark rounded-full">
                <Icon name="folder_open" size={32} className="text-text-light-secondary dark:text-dark-secondary opacity-50" />
              </div>
              <p className="text-base font-medium text-text-light-primary dark:text-dark-primary mt-3">No projects found</p>
              <p className="text-sm text-text-light-secondary dark:text-dark-secondary mt-1">
                {searchTerm ? 'Try adjusting your search terms' : 'No projects available yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4 max-w-2xl mx-auto">
                {filteredProjects.map((project) => (
                  <div key={project._id} className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-text-light-primary dark:text-dark-primary mb-1 line-clamp-2">
                          {project.title}
                        </h3>
                        <p className="text-sm text-text-light-secondary dark:text-dark-secondary line-clamp-2">
                          {project.summary || project.description}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowActionSheet(showActionSheet === project._id ? null : project._id)}
                        className="p-2 hover:bg-card-light dark:hover:bg-card-dark rounded-lg transition-colors flex-shrink-0"
                        aria-label="Project actions"
                      >
                        <Icon name="more_vert" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                        {project.statusLabel || project.status}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-card-light dark:bg-card-dark text-text-light-primary dark:text-dark-primary border border-border-light dark:border-border-dark">
                        {formatCurrency(project.budget.amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-text-light-secondary dark:text-dark-secondary">
                      <div className="flex items-center gap-1.5">
                        <Icon name="person" size={16} />
                        <span>{project.clientName}</span>
                        {project.clientVerified && (
                          <Icon name="verified" size={14} className="text-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Icon name="calendar_today" size={16} />
                        <span>{new Date(project.dateRange.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Mobile Action Sheet */}
                    {showActionSheet === project._id && (
                      <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark space-y-2">
                        <button
                          onClick={() => {
                            handleViewDetails(project)
                            setShowActionSheet(null)
                          }}
                          className="w-full px-4 py-3 min-h-[44px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <Icon name="visibility" size={18} />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            toast('Edit feature coming soon', { icon: '✏️' })
                            setShowActionSheet(null)
                          }}
                          className="w-full px-4 py-3 min-h-[44px] bg-card-light dark:bg-card-dark text-text-light-primary dark:text-dark-primary rounded-lg font-medium flex items-center gap-2 hover:bg-background-light dark:hover:bg-background-dark transition-colors border border-border-light dark:border-border-dark"
                        >
                          <Icon name="edit" size={18} />
                          Edit Project
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteProject(project._id, project.title)
                            setShowActionSheet(null)
                          }}
                          className="w-full px-4 py-3 min-h-[44px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <Icon name="delete" size={18} />
                          Delete Project
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead>
                    <tr className="border-b border-border-light dark:border-border-dark">
                      <th className="px-4 py-3 text-sm font-semibold text-text-light-secondary dark:text-dark-secondary">Project Name</th>
                      <th className="px-4 py-3 text-sm font-semibold text-text-light-secondary dark:text-dark-secondary">Client</th>
                      <th className="px-4 py-3 text-sm font-semibold text-text-light-secondary dark:text-dark-secondary">Budget</th>
                      <th className="px-4 py-3 text-sm font-semibold text-text-light-secondary dark:text-dark-secondary">Status</th>
                      <th className="px-4 py-3 text-sm font-semibold text-text-light-secondary dark:text-dark-secondary">Start Date</th>
                      <th className="px-4 py-3 text-sm font-semibold text-text-light-secondary dark:text-dark-secondary text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr
                        key={project._id}
                        className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-text-light-primary dark:text-dark-primary">
                              {project.title}
                            </span>
                            <span className="text-xs text-text-light-secondary dark:text-dark-secondary mt-0.5 line-clamp-1">
                              {project.summary || project.description}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-text-light-primary dark:text-dark-primary font-medium">
                              {project.clientName}
                            </span>
                            {project.clientVerified && (
                              <Icon name="verified" size={16} className="text-blue-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-text-light-primary dark:text-dark-primary">
                              {formatCurrency(project.budget.amount)}
                            </span>
                            <span className="text-xs text-text-light-secondary dark:text-dark-secondary capitalize">
                              {project.budget.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                            {project.statusLabel || project.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary">
                          {new Date(project.dateRange.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetails(project)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Icon name="visibility" size={18} />
                            </button>
                            <button
                              onClick={() => toast('Edit feature coming soon', { icon: '✏️' })}
                              className="p-1.5 text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Icon name="edit" size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project._id, project.title)}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Icon name="delete" size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Results Info */}
        {!loading && filteredProjects.length > 0 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-light dark:border-border-dark">
            <p className="text-sm text-text-light-secondary dark:text-dark-secondary">
              Showing <span className="font-semibold text-text-light-primary dark:text-dark-primary">{filteredProjects.length}</span> of{' '}
              <span className="font-semibold text-text-light-primary dark:text-dark-primary">{projects.length}</span> projects
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card-light dark:bg-card-dark rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border-t sm:border border-border-light dark:border-border-dark">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
              <h2 className="text-lg sm:text-xl font-bold text-text-light-primary dark:text-dark-primary">Project Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 min-h-[44px] min-w-[44px] hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors flex items-center justify-center"
              >
                <Icon name="close" size={24} className="text-text-light-secondary dark:text-dark-secondary" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Project Info */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-light-primary dark:text-dark-primary mb-2">
                  {selectedProject.title}
                </h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.statusLabel || selectedProject.status}
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-text-light-secondary dark:text-dark-secondary mb-2">Description</h4>
                <p className="text-sm text-text-light-secondary dark:text-dark-secondary leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-background-light dark:bg-background-dark rounded-lg p-3 sm:p-4">
                  <p className="text-xs text-text-light-secondary dark:text-dark-secondary mb-1">Client</p>
                  <p className="text-sm font-semibold text-text-light-primary dark:text-dark-primary flex items-center gap-2">
                    {selectedProject.clientName}
                    {selectedProject.clientVerified && (
                      <Icon name="verified" size={16} className="text-blue-500" />
                    )}
                  </p>
                </div>

                <div className="bg-background-light dark:bg-background-dark rounded-lg p-3 sm:p-4">
                  <p className="text-xs text-text-light-secondary dark:text-dark-secondary mb-1">Budget</p>
                  <p className="text-sm font-semibold text-text-light-primary dark:text-dark-primary">
                    {formatCurrency(selectedProject.budget.amount)}
                  </p>
                  <p className="text-xs text-text-light-secondary dark:text-dark-secondary capitalize">
                    {selectedProject.budget.type} project
                  </p>
                </div>

                <div className="bg-background-light dark:bg-background-dark rounded-lg p-3 sm:p-4">
                  <p className="text-xs text-text-light-secondary dark:text-dark-secondary mb-1">Start Date</p>
                  <p className="text-sm font-semibold text-text-light-primary dark:text-dark-primary">
                    {new Date(selectedProject.dateRange.startDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="bg-background-light dark:bg-background-dark rounded-lg p-3 sm:p-4">
                  <p className="text-xs text-text-light-secondary dark:text-dark-secondary mb-1">End Date</p>
                  <p className="text-sm font-semibold text-text-light-primary dark:text-dark-primary">
                    {new Date(selectedProject.dateRange.endDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Deliverables */}
              {selectedProject.deliverables && selectedProject.deliverables.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-text-light-secondary dark:text-dark-secondary mb-3">Deliverables</h4>
                  <ul className="space-y-2">
                    {selectedProject.deliverables.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-text-light-secondary dark:text-dark-secondary">
                        <Icon name="check_circle" size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Milestones */}
              {selectedProject.milestones && selectedProject.milestones.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-text-light-secondary dark:text-dark-secondary mb-3">Milestones</h4>
                  <div className="space-y-2">
                    {selectedProject.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-background-light dark:bg-background-dark rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <Icon
                            name={milestone.status === 'completed' ? 'check_circle' : milestone.status === 'in-progress' ? 'pending' : 'radio_button_unchecked'}
                            size={20}
                            className={
                              milestone.status === 'completed' ? 'text-green-500' :
                                milestone.status === 'in-progress' ? 'text-blue-500' :
                                  'text-text-light-secondary dark:text-dark-secondary opacity-50'
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary truncate">{milestone.title}</p>
                            <p className="text-xs text-text-light-secondary dark:text-dark-secondary">
                              Due: {new Date(milestone.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {milestone.amount && (
                          <p className="text-sm font-semibold text-text-light-primary dark:text-dark-primary">
                            {formatCurrency(milestone.amount)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Type */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Project Type</p>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {selectedProject.projectType}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4 sm:p-6 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full sm:w-auto px-4 py-3 min-h-[44px] text-sm font-medium text-text-light-secondary dark:text-dark-secondary hover:bg-card-light dark:hover:bg-card-dark rounded-lg transition-colors border border-border-light dark:border-border-dark"
              >
                Close
              </button>
              <button
                onClick={() => toast('Edit feature coming soon', { icon: '✏️' })}
                className="w-full sm:w-auto px-4 py-3 min-h-[44px] text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
              >
                Edit Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 max-w-md w-full shadow-2xl border border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="delete" size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-light-primary dark:text-dark-primary">Delete Project?</h3>
              </div>
            </div>
            <p className="text-text-light-secondary dark:text-dark-secondary mb-6">
              Are you sure you want to delete <span className="font-semibold text-text-light-primary dark:text-dark-primary">"{confirmDelete.projectTitle}"</span>? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setConfirmDelete({ isOpen: false, projectId: null, projectTitle: '' })}
                className="w-full sm:w-auto px-4 py-3 min-h-[44px] sm:h-11 text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProject}
                className="w-full sm:w-auto px-4 py-3 min-h-[44px] sm:h-11 bg-red-600 dark:bg-red-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-700 transition-colors font-medium"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
