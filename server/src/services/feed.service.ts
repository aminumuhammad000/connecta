/**
 * FeedService
 * Centralized Feed post creator. Call createPost() from any controller
 * after a significant event to publish it to the platform feed.
 */
import FeedPost, { FeedPostType } from '../models/Feed.model.js';
import { getIO } from '../core/utils/socketIO.js';

interface CreateFeedPostOptions {
  type: FeedPostType;
  actor?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    profileImage?: string;
    jobTitle?: string;
    location?: string;
  };
  title: string;
  body: string;
  emoji?: string;
  imageUrl?: string;
  relatedType?: 'job' | 'project' | 'proposal' | 'review' | 'user';
  relatedId?: string;
  targetAudience?: 'all' | 'freelancers' | 'clients';
  isSystemPost?: boolean;
  poll?: {
    question: string;
    options: { text: string }[];
    closesAt?: Date;
  };
}

export const createFeedPost = async (options: CreateFeedPostOptions): Promise<void> => {
  try {
    const {
      type, actor, title, body, emoji = '📢',
      imageUrl, relatedType, relatedId,
      targetAudience = 'all',
      isSystemPost = false,
      poll,
    } = options;

    const actorName = actor
      ? `${actor.firstName || ''} ${actor.lastName || ''}`.trim()
      : undefined;

    const postData: any = {
      type,
      actor:          actor?._id,
      actorName,
      actorAvatar:    actor?.profileImage || actor?.avatar,
      actorRole:      actor?.jobTitle,
      actorLocation:  actor?.location,
      title,
      body,
      emoji,
      imageUrl,
      relatedType,
      relatedId,
      targetAudience,
      isSystemPost,
    };

    if (poll) {
      postData.poll = {
        question: poll.question,
        options: poll.options.map(o => ({ text: o.text, votes: [] })),
        closesAt: poll.closesAt,
      };
    }

    const post = await FeedPost.create(postData);

    // Broadcast to all connected clients via Socket.IO
    try {
      const io = getIO();
      io.emit('feed:new_post', {
        _id:        post._id,
        type:       post.type,
        emoji:      post.emoji,
        title:      post.title,
        body:       post.body,
        actorName:  post.actorName,
        actorAvatar: post.actorAvatar,
        createdAt:  post.createdAt,
      });
    } catch (socketErr) {
      // Socket errors should not block feed creation
      console.warn('[FeedService] Socket broadcast failed:', socketErr);
    }

    console.log(`✅ [FeedService] Post created: [${type}] ${title}`);
  } catch (error) {
    // Feed errors should NEVER crash the calling controller
    console.error('[FeedService] Error creating feed post:', error);
  }
};

/**
 * Get platform-wide quick stats for the Feed header
 */
export const getFeedStats = async () => {
  try {
    const FeedPostModel = FeedPost;
    const totalPosts = await FeedPostModel.countDocuments({ visibility: 'public' });

    // Import other models for stats
    const User = (await import('../models/user.model.js')).default;
    const Project = (await import('../models/Project.model.js')).default;
    const Job = (await import('../models/Job.model.js')).default;

    const [totalUsers, activeJobs, completedProjects] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Project.countDocuments({ status: 'completed' }),
    ]);

    return {
      totalPosts,
      totalUsers,
      activeJobs,
      completedProjects,
    };
  } catch (error) {
    console.error('[FeedService] Error getting stats:', error);
    return { totalPosts: 0, totalUsers: 0, activeJobs: 0, completedProjects: 0 };
  }
};

export default { createFeedPost, getFeedStats };
