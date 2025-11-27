import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
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
    <AppLayout>
      {/* Main Content */}
      <main className="flex-1 flex-col p-4 md:p-6 lg:p-8">
        {/* Page Heading */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <p className="text-text-light-primary dark:text-dark-primary text-2xl md:text-3xl font-black leading-tight tracking-tighter">
              Project Management
            </p>
            <p className="text-text-light-secondary dark:text-dark-secondary text-base font-normal leading-normal">
              View and manage all active and completed projects
            </p>
          </div>
          <button 
            onClick={() => toast('Create project feature coming soon', { icon: '🚀' })}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 transition-all"
          >
            <Icon name="add" size={20} />
            <span className="truncate">New Project</span>
          </button>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Projects</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Icon name="folder" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Ongoing</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.ongoing}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Icon name="pending" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Icon name="check_circle" size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Cancelled</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.cancelled}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Icon name="cancel" size={24} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-700">
          {/* Search & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-text-light-secondary dark:text-dark-secondary flex bg-slate-50 dark:bg-slate-900 items-center justify-center pl-4 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-700">
                    <Icon name="search" />
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-light-primary dark:text-dark-primary focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-inset border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 h-full placeholder:text-text-light-secondary placeholder:dark:text-dark-secondary px-4 pl-2 text-base font-normal leading-normal"
                    placeholder="Search projects by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </label>
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-text-light-primary dark:text-dark-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
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
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <Icon name="refresh" size={20} className={`text-text-light-primary dark:text-dark-primary ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium text-text-light-primary dark:text-dark-primary">Refresh</span>
            </button>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Project Name</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Client</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Budget</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Start Date</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-slate-600 dark:text-slate-400">
                        <Icon name="progress_activity" className="animate-spin" size={32} />
                        <span className="text-base font-medium">Loading projects...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                          <Icon name="folder_open" size={32} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-base font-medium text-slate-900 dark:text-white">No projects found</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {searchTerm ? 'Try adjusting your search terms' : 'No projects available yet'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr 
                      key={project._id} 
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {project.title}
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {project.summary || project.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-900 dark:text-white font-medium">
                            {project.clientName}
                          </span>
                          {project.clientVerified && (
                            <Icon name="verified" size={16} className="text-blue-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(project.budget.amount)}
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                            {project.budget.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                          {project.statusLabel || project.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
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
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Icon name="edit" size={18} />
                          </button>
                          <button 
                            onClick={() => toast('Delete feature coming soon', { icon: '🗑️' })}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Icon name="delete" size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Results Info */}
          {!loading && filteredProjects.length > 0 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredProjects.length}</span> of{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{projects.length}</span> projects
              </p>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Project Details</h2>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Icon name="close" size={24} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Project Info */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {selectedProject.title}
                  </h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.statusLabel || selectedProject.status}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Client</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      {selectedProject.clientName}
                      {selectedProject.clientVerified && (
                        <Icon name="verified" size={16} className="text-blue-500" />
                      )}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Budget</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(selectedProject.budget.amount)}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                      {selectedProject.budget.type} project
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Start Date</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {new Date(selectedProject.dateRange.startDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">End Date</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
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
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Deliverables</h4>
                    <ul className="space-y-2">
                      {selectedProject.deliverables.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
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
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Milestones</h4>
                    <div className="space-y-2">
                      {selectedProject.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Icon 
                              name={milestone.status === 'completed' ? 'check_circle' : milestone.status === 'in-progress' ? 'pending' : 'radio_button_unchecked'} 
                              size={20} 
                              className={
                                milestone.status === 'completed' ? 'text-green-500' :
                                milestone.status === 'in-progress' ? 'text-blue-500' : 
                                'text-slate-400'
                              }
                            />
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{milestone.title}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                Due: {new Date(milestone.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {milestone.amount && (
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(milestone.amount)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Type */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Project Type</p>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    {selectedProject.projectType}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => toast('Edit feature coming soon', { icon: '✏️' })}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                >
                  Edit Project
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  )
}
