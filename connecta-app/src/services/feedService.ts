import { API_ENDPOINTS } from '../utils/constants';
import apiClient from './api';

export type FeedPostType =
    | 'project_completed'
    | 'job_posted'
    | 'proposal_accepted'
    | 'review_received'
    | 'new_member'
    | 'identity_verified'
    | 'portfolio_added'
    | 'milestone_hit'
    | 'first_hire'
    | 'platform_win'
    | 'daily_tip'
    | 'leaderboard_update'
    | 'community_poll'
    | 'job_trending'
    | 'proposal_submitted'
    | 'user_post';

export type ReactionType = 'celebrate' | 'insightful' | 'clap' | 'fire' | 'love';

export interface FeedReactions {
    celebrate: string[];
    insightful: string[];
    clap: string[];
    fire: string[];
    love: string[];
}

export interface FeedPost {
    _id: string;
    type: FeedPostType;
    actor?: string;
    actorName?: string;
    actorAvatar?: string;
    actorRole?: string;
    actorLocation?: string;
    title: string;
    body: string;
    emoji: string;
    imageUrl?: string;
    videoUrl?: string;
    relatedType?: 'job' | 'project' | 'proposal' | 'review' | 'user';
    relatedId?: string;
    targetAudience: 'all' | 'freelancers' | 'clients';
    visibility: 'public' | 'followers';
    reactions: FeedReactions;
    commentCount: number;
    poll?: {
        question: string;
        options: { text: string; votes: string[] }[];
        closesAt?: string;
    };
    isPinned: boolean;
    isTrending: boolean;
    isSystemPost: boolean;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
    myReaction?: ReactionType;
    totalReactions: number;
}

export interface FeedComment {
    _id: string;
    feedPostId: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    text: string;
    mentions: string[];
    likes: string[];
    createdAt: string;
}

class FeedService {
    cachedPosts: FeedPost[] = [];
    cachedPage: number = 1;

    setCache(posts: FeedPost[], page: number) {
        this.cachedPosts = posts;
        this.cachedPage = page;
    }

    async getFeed(page = 1, limit = 20, audience = 'all') {
        const response: any = await apiClient.get(`${API_ENDPOINTS.FEED}?page=${page}&limit=${limit}&audience=${audience}`);
        if (Array.isArray(response)) return response;
        if (response?.data && Array.isArray(response.data)) return response.data;
        return [];
    }

    async getTrendingPosts() {
        return apiClient.get(API_ENDPOINTS.FEED_TRENDING);
    }

    async getStats() {
        return apiClient.get(API_ENDPOINTS.FEED_STATS);
    }

    async getPostById(id: string) {
        return apiClient.get(API_ENDPOINTS.FEED_POST_BY_ID(id));
    }

    async reactToPost(id: string, reaction: ReactionType) {
        return apiClient.post(API_ENDPOINTS.FEED_REACT(id), { reaction });
    }

    async removeReaction(id: string) {
        return apiClient.delete(API_ENDPOINTS.FEED_REACT(id));
    }

    async getComments(postId: string) {
        return apiClient.get(API_ENDPOINTS.FEED_COMMENTS(postId));
    }

    async addComment(postId: string, text: string, authorName?: string, authorAvatar?: string) {
        return apiClient.post(API_ENDPOINTS.FEED_COMMENTS(postId), { text, authorName, authorAvatar });
    }

    async voteOnPoll(postId: string, optionIndex: number) {
        return apiClient.post(API_ENDPOINTS.FEED_POLL_VOTE(postId), { optionIndex });
    }

    async editPost(postId: string, title: string, body: string) {
        const response: any = await apiClient.put(`/feed/user/${postId}`, { title, body });
        return response?.data;
    }

    async deletePost(postId: string) {
        const response: any = await apiClient.delete(`/feed/user/${postId}`);
        return response?.success;
    }
}

export const feedService = new FeedService();
export default feedService;
