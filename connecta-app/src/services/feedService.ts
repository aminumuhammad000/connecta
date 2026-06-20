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
    | 'job_trending';

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
    async getFeed(page = 1, limit = 20, audience = 'all') {
        return apiClient.get(`${API_ENDPOINTS.FEED}?page=${page}&limit=${limit}&audience=${audience}`);
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
}

export const feedService = new FeedService();
export default feedService;
