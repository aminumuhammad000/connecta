// User and Authentication Types
export type UserType = 'client' | 'freelancer';

export interface User {
    _id: string;
    email: string;
    userType: UserType;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    profileImage?: string; // Added
    isPremium?: boolean;
    subscriptionTier?: 'free' | 'premium' | 'enterprise';
    subscriptionStatus?: 'active' | 'expired' | 'cancelled';
    premiumExpiryDate?: string;
    isVerified?: boolean;
    savedJobs?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
    message?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    userType: UserType;
}

// Profile Types
export interface Profile {
    _id: string;
    userId: string;
    user?: User; // Populated user data from backend
    bio?: string;
    skills?: string[];
    hourlyRate?: number;
    location?: string;
    phone?: string;
    phoneNumber?: string; // Added alias
    website?: string;
    companyName?: string; // Added
    avatar?: string; // Added
    portfolio?: PortfolioItem[];
    experience?: Experience[];
    education?: Education[];
    languages?: string[];
    availability?: string;
    rating?: number;
    reviewCount?: number;
    completedProjects?: number;
    createdAt: string;
    updatedAt: string;
}

export interface PortfolioItem {
    _id?: string;
    title: string;
    description: string;
    imageUrl?: string;
    projectUrl?: string;
    tags?: string[];
}

export interface Experience {
    _id?: string;
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
}

export interface Education {
    _id?: string;
    degree: string;
    institution: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
}

// Job Types
export type JobStatus = 'active' | 'closed' | 'draft';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance';

export interface Job {
    _id: string;
    clientId: string;
    title: string;
    description: string;
    summary?: string;
    category: string;
    skills: string[];
    budget?: string; // Backend expects String
    budgetType?: string;
    hourlyRate?: number;
    jobType: JobType;
    duration?: string;
    experienceLevel?: string;
    status: JobStatus;
    proposalCount?: number;
    location?: string;
    locationType?: 'remote' | 'onsite' | 'hybrid';
    company?: string;
    posted?: Date;
    postedTime?: string;
    createdAt: string;
    updatedAt: string;
}

// Proposal Types
export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface Proposal {
    _id: string;
    jobId: string;
    freelancerId: string;
    coverLetter: string;
    proposedRate: number;
    estimatedDuration: string;
    status: ProposalStatus;
    attachments?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ProposalStats {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
}

// Project Types
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';

export interface Project {
    _id: string;
    jobId: string;
    clientId: string;
    freelancerId: string;
    title: string;
    description: string;
    status: ProjectStatus;
    budget: number;
    startDate: string;
    endDate?: string;
    progress?: number;
    files?: ProjectFile[];
    activities?: ProjectActivity[];
    createdAt: string;
    updatedAt: string;
}

export interface ProjectFile {
    _id?: string;
    name: string;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
}

export interface ProjectActivity {
    _id?: string;
    type: string;
    description: string;
    userId: string;
    createdAt: string;
}

// Message Types
export interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    text: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Conversation {
    _id: string;
    participants: string[];
    lastMessage?: Message;
    unreadCount?: number;
    createdAt: string;
    updatedAt: string;
}

// Payment Types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type TransactionType = 'payment' | 'withdrawal' | 'refund' | 'deposit';

export interface Payment {
    _id: string;
    projectId: string;
    clientId: string;
    freelancerId: string;
    amount: number;
    status: PaymentStatus;
    reference: string;
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    _id: string;
    userId: string;
    type: TransactionType;
    amount: number;
    description: string;
    status: string;
    reference?: string;
    createdAt: string;
}

export interface WalletBalance {
    balance: number;
    currency: string;
}

export interface Bank {
    id: string;
    name: string;
    code: string;
}

// Notification Types
export type NotificationType =
    | 'proposal_received'
    | 'proposal_accepted'
    | 'proposal_rejected'
    | 'project_started'
    | 'project_completed'
    | 'milestone_completed'
    | 'payment_received'
    | 'payment_released'
    | 'message_received'
    | 'review_received'
    | 'deadline_approaching'
    | 'system'
    | 'info'
    | 'success'
    | 'warning'
    | 'error';

export interface Notification {
    _id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    isRead?: boolean; // Backend uses isRead
    relatedId?: string;
    relatedType?: 'job' | 'project' | 'proposal' | 'message' | 'review' | 'payment';
    link?: string;
    actionUrl?: string; // Legacy support
    createdAt: string;
}

// Review Types
export interface Review {
    _id: string;
    projectId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment: string;
    response?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}

// Contract Types
export type ContractStatus = 'draft' | 'pending' | 'active' | 'completed' | 'terminated';

export interface Contract {
    _id: string;
    clientId: string;
    freelancerId: string;
    projectId: string;
    title: string;
    terms: string;
    status: ContractStatus;
    signedByClient?: boolean;
    signedByFreelancer?: boolean;
    createdAt: string;
    updatedAt: string;
}

// Gig Types
export interface Gig {
    _id: string;
    title: string;
    description: string;
    category: string;
    skills: string[];
    budget: number;
    deadline: string;
    status: string;
    saved?: boolean;
    applied?: boolean;
}

// Dashboard Types
export interface DashboardStats {
    activeProjects: number;
    pendingPayments: number;
    newMessages: number;
    totalEarnings?: number;
    completedJobs?: number;
    activeProposals?: number;
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// Error Types
export interface ApiError {
    message: string;
    status?: number;
    errors?: Record<string, string[]>;
}

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

export interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, type: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}
