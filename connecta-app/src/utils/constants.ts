import Constants from 'expo-constants';
import { Platform } from 'react-native';

// API Configuration
// Resolve the API host dynamically so emulator, simulator, and devices work without edits.
const deriveExpoHostBaseUrl = () => {
    const hostUri =
        Constants.expoConfig?.hostUri ||
        (Constants as any)?.manifest?.hostUri ||
        (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ||
        '';
    if (!hostUri) return undefined;
    const host = hostUri.replace(/^https?:\/\//, '').split(':')[0];
    if (!host) return undefined;
    return `http://${host}:5000`;
};

const explicitBaseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    Constants.expoConfig?.extra?.apiBaseUrl ||
    (Constants as any)?.manifest?.extra?.apiBaseUrl;

const derivedHostBaseUrl = deriveExpoHostBaseUrl();
// const platformDefaultBaseUrl = Platform.OS === 'android' ? 'https://api.myconnecta.ng' : 'https://api.myconnecta.ng';
// const platformDefaultBaseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const platformDefaultBaseUrl = 'http://172.20.10.3:5000';

const getBaseUrl = () => {
    // let url = explicitBaseUrl || derivedHostBaseUrl || platformDefaultBaseUrl;
    // Force online server for now
    let url = explicitBaseUrl || platformDefaultBaseUrl;

    // Fix: iOS Simulator cannot reach 10.0.2.2, force localhost
    // For iOS physical device, derivedHostBaseUrl usually works (it's the LAN IP of the host)
    if (Platform.OS === 'ios' && (url?.includes('10.0.2.2'))) {
        return 'http://localhost:5000';
    }
    return url;
};

export const API_BASE_URL = getBaseUrl();

// AsyncStorage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: '@connecta/auth_token',
    USER_DATA: '@connecta/user_data',
    USER_ROLE: '@connecta/user_role',
    THEME_MODE: '@connecta/theme_mode',
    BIOMETRIC_ENABLED: '@connecta/biometric_enabled',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    SIGNUP: '/api/users/signup',
    SIGNIN: '/api/users/signin',
    GOOGLE_SIGNUP: '/api/users/google/signup',
    GOOGLE_SIGNIN: '/api/users/google/signin',

    // Users
    USERS: '/api/users',
    USER_ME: '/api/users/me',
    USER_BY_ID: (id: string) => `/api/users/${id}`,

    // Profiles
    PROFILES: '/api/profiles',
    PROFILE_ME: '/api/profiles/me',
    PROFILE_BY_ID: (id: string) => `/api/profiles/${id}`,

    // Jobs
    JOBS: '/api/jobs',
    MY_JOBS: '/api/jobs/client/my-jobs',
    RECOMMENDED_JOBS: '/api/jobs/recommended',
    JOB_SEARCH: '/api/jobs/search',
    JOB_BY_ID: (id: string) => `/api/jobs/${id}`,

    // Proposals
    PROPOSALS: '/api/proposals',
    ACCEPTED_PROPOSALS: '/api/proposals/client/accepted',
    FREELANCER_PROPOSALS: (freelancerId: string) => `/api/proposals/freelancer/${freelancerId}`,
    JOB_PROPOSALS: (jobId: string) => `/api/proposals/job/${jobId}`,
    PROPOSAL_STATS: (freelancerId: string) => `/api/proposals/stats/${freelancerId}`,
    PROPOSAL_BY_ID: (id: string) => `/api/proposals/${id}`,
    APPROVE_PROPOSAL: (id: string) => `/api/proposals/${id}/approve`,
    REJECT_PROPOSAL: (id: string) => `/api/proposals/${id}/reject`,

    // Projects
    PROJECTS: '/api/projects',
    MY_PROJECTS: '/api/projects/client/my-projects',
    FREELANCER_PROJECTS: (freelancerId: string) => `/api/projects/freelancer/${freelancerId}`,
    CLIENT_PROJECTS: (clientId: string) => `/api/projects/client/${clientId}`,
    PROJECT_STATS: (userId: string) => `/api/projects/stats/${userId}`,
    PROJECT_BY_ID: (id: string) => `/api/projects/${id}`,
    PROJECT_UPLOAD: (id: string) => `/api/projects/${id}/upload`,
    PROJECT_ACTIVITY: (id: string) => `/api/projects/${id}/activity`,

    // Messages
    CONVERSATIONS: '/api/messages/conversations',
    USER_CONVERSATIONS: (userId: string) => `/api/messages/user/${userId}/conversations`,
    CONVERSATION_MESSAGES: (conversationId: string) => `/api/messages/conversations/${conversationId}/messages`,
    MESSAGES_BETWEEN: (userId1: string, userId2: string) => `/api/messages/between/${userId1}/${userId2}`,
    SEND_MESSAGE: '/api/messages',
    MARK_READ: '/api/messages/read',

    // Dashboard
    DASHBOARD_STATS: '/api/dashboard/stats',
    DASHBOARD_FREELANCERS: '/api/dashboard/freelancers',
    DASHBOARD_MESSAGES: '/api/dashboard/messages',

    // Payments
    INITIALIZE_PAYMENT: '/api/payments/initialize',
    PAYMENT_JOB_VERIFICATION: '/api/payments/job-verification',
    VERIFY_PAYMENT: (reference: string) => `/api/payments/verify/${reference}`,
    PAYMENT_HISTORY: '/api/payments/history',
    WALLET_BALANCE: '/api/payments/wallet/balance',
    TRANSACTIONS: '/api/payments/transactions',
    WITHDRAWAL_REQUEST: '/api/payments/withdrawal/request',
    WITHDRAWAL_SETTINGS: '/api/payments/wallet/settings',
    BANKS: '/api/payments/banks',
    RESOLVE_BANK: '/api/payments/banks/resolve',
    RELEASE_PAYMENT: (paymentId: string) => `/api/payments/${paymentId}/release`,

    // Notifications
    NOTIFICATIONS: '/api/notifications',
    UNREAD_COUNT: '/api/notifications/unread-count',
    MARK_NOTIFICATION_READ: (id: string) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/mark-all-read',

    // Reviews
    REVIEWS: '/api/reviews',
    USER_REVIEWS: (userId: string) => `/api/reviews/user/${userId}`,
    REVIEW_STATS: (userId: string) => `/api/reviews/user/${userId}/stats`,

    // Contracts
    CONTRACTS: '/api/contracts',
    CONTRACT_BY_ID: (id: string) => `/api/contracts/${id}`,
    SIGN_CONTRACT: (id: string) => `/api/contracts/${id}/sign`,

    // Gigs
    MATCHED_GIGS: '/api/gigs/matched',
    SAVED_GIGS: '/api/gigs/saved',
    GIG_APPLICATIONS: '/api/gigs/applications',
    APPLY_TO_GIG: (id: string) => `/api/gigs/${id}/apply`,
    SAVE_GIG: (id: string) => `/api/gigs/${id}/save`,

    // AI Agent
    AI_AGENT: '/api/agent',

    // Support
    SUPPORT_FEEDBACK: '/api/support/feedback',
    SUPPORT_HELP: '/api/support/help',

    // Uploads
    UPLOAD_FILE: '/api/uploads/upload',
} as const;

// Default Values
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Socket Events
export const SOCKET_EVENTS = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    JOIN: 'join',
    LEAVE: 'leave',
    SEND_MESSAGE: 'sendMessage',
    MESSAGE_RECEIVED: 'messageReceived',
    TYPING: 'typing',
    STOP_TYPING: 'stopTyping',
} as const;
