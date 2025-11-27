// User Types
export interface User {
  _id: string
  email: string
  name: string
  userType: 'freelancer' | 'client'
  profilePicture?: string
  createdAt: string
  updatedAt: string
}

// Profile Types
export interface Profile {
  _id: string
  userId: string
  bio?: string
  skills?: string[]
  experience?: string
  education?: string
  portfolio?: string[]
  hourlyRate?: number
  availability?: string
  location?: string
  createdAt: string
  updatedAt: string
}

// Contract Types
export type ContractStatus = 'Active' | 'Pending Signature' | 'Completed' | 'Terminated'

export interface Contract {
  _id: string
  clientId: string
  freelancerId: string
  jobId?: string
  projectId?: string
  status: ContractStatus
  terms: string
  amount: number
  startDate: string
  endDate?: string
  signedByClient?: boolean
  signedByFreelancer?: boolean
  clientSignature?: string
  freelancerSignature?: string
  createdAt: string
  updatedAt: string
  // Populated fields
  client?: User
  freelancer?: User
  job?: Job
  project?: Project
}

// Job Types
export type JobStatus = 'Open' | 'In Progress' | 'Closed' | 'Deleted'
export type JobBudgetType = 'Fixed' | 'Hourly'

export interface Job {
  _id: string
  title: string
  description: string
  clientId: string
  category: string
  skills: string[]
  budgetType: JobBudgetType
  budget?: number
  hourlyRate?: {
    min: number
    max: number
  }
  duration?: string
  experienceLevel: 'Entry' | 'Intermediate' | 'Expert'
  status: JobStatus
  applicants?: number
  createdAt: string
  updatedAt: string
  // Populated fields
  client?: User
}

// Project Types
export type ProjectStatus = 'Pending' | 'In-Progress' | 'Completed' | 'Cancelled'

export interface Project {
  _id: string
  jobId: string
  clientId: string
  freelancerId: string
  title: string
  description: string
  status: ProjectStatus
  budget: number
  startDate: string
  endDate?: string
  milestones?: Milestone[]
  files?: ProjectFile[]
  activities?: Activity[]
  createdAt: string
  updatedAt: string
  // Populated fields
  client?: User
  freelancer?: User
  job?: Job
}

export interface Milestone {
  _id: string
  title: string
  description: string
  amount: number
  dueDate: string
  status: 'Pending' | 'In Progress' | 'Completed'
  completedAt?: string
}

export interface ProjectFile {
  _id: string
  name: string
  url: string
  type: string
  size: number
  uploadedBy: string
  uploadedAt: string
}

export interface Activity {
  _id: string
  type: string
  description: string
  userId: string
  timestamp: string
}

// Proposal Types
export type ProposalStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn'

export interface Proposal {
  _id: string
  jobId: string | Job
  freelancerId: string | User
  coverLetter: string
  proposedRate: number
  duration: string
  status: ProposalStatus
  attachments?: string[]
  createdAt: string
  updatedAt: string
  // Populated fields (when using populate)
  job?: Job
  freelancer?: User
}

// Payment Types
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded'
export type TransactionType = 'Payment' | 'Withdrawal' | 'Refund' | 'Fee'

export interface Payment {
  _id: string
  projectId: string
  clientId: string
  freelancerId: string
  amount: number
  fee: number
  netAmount: number
  status: PaymentStatus
  paymentMethod: string
  reference: string
  transactionDate: string
  createdAt: string
  updatedAt: string
  // Populated fields
  project?: Project
  client?: User
  freelancer?: User
}

export interface Transaction {
  _id: string
  userId: string
  type: TransactionType
  amount: number
  balance: number
  description: string
  reference?: string
  status: PaymentStatus
  createdAt: string
}

export interface Withdrawal {
  _id: string
  userId: string
  amount: number
  bankDetails: {
    accountName: string
    accountNumber: string
    bankName: string
    bankCode: string
  }
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed'
  processedAt?: string
  createdAt: string
}

// Notification Types
export type NotificationType = 'Message' | 'Project' | 'Payment' | 'Review' | 'System'

export interface Notification {
  _id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

// Review Types
export interface Review {
  _id: string
  reviewerId: string
  reviewedUserId: string
  projectId: string
  rating: number
  comment: string
  response?: string
  helpful: number
  notHelpful: number
  flagged: boolean
  flagReason?: string
  createdAt: string
  updatedAt: string
  // Populated fields
  reviewer?: User
  reviewedUser?: User
  project?: Project
}

// Message Types
export interface Message {
  _id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  read: boolean
  attachments?: string[]
  createdAt: string
  // Populated fields
  sender?: User
  receiver?: User
}

export interface Conversation {
  _id: string
  participants: string[]
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

// Dashboard Stats Types
export interface DashboardStats {
  totalUsers: number
  totalJobs: number
  totalProjects: number
  totalProposals: number
  activeProjects: number
  totalRevenue: number
  trends: {
    users: number
    jobs: number
    projects: number
    proposals: number
    revenue: number
  }
}

// API Response Types
export interface APIResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  count: number
  total: number
  page: number
  pages: number
}

// Gig Application Types
export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected'

export interface GigApplication {
  _id: string
  gigId: string
  applicantId: string
  status: ApplicationStatus
  submittedAt: string
  // Populated fields
  gig?: Job
  applicant?: User
}

// Analytics Types
export interface Analytics {
  userGrowth: ChartData[]
  gigPerformance: ChartData[]
  revenue: ChartData[]
  proposalSuccessRate: {
    accepted: number
    rejected: number
    pending: number
  }
}

export interface ChartData {
  label: string
  value: number
  date?: string
}
