/**
 * FeedService
 * Centralized Feed post creator. Call createPost() from any controller
 * after a significant event to publish it to the platform feed.
 */
import FeedPost from '../models/Feed.model.js';
import User from '../models/user.model.js';
import { getIO } from '../core/utils/socketIO.js';
import NotificationService from './notification.service.js';
export const createFeedPost = async (options) => {
    try {
        const { type, actor, title, body, emoji = '📢', imageUrl, relatedType, relatedId, targetAudience = 'all', isSystemPost = false, poll, } = options;
        const actorName = actor
            ? `${actor.firstName || ''} ${actor.lastName || ''}`.trim()
            : undefined;
        const postData = {
            type,
            actor: actor?._id,
            actorName,
            actorAvatar: actor?.profileImage || actor?.avatar,
            actorRole: actor?.jobTitle,
            actorLocation: actor?.location,
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
                _id: post._id,
                type: post.type,
                emoji: post.emoji,
                title: post.title,
                body: post.body,
                actorName: post.actorName,
                actorAvatar: post.actorAvatar,
                createdAt: post.createdAt,
            });
        }
        catch (socketErr) {
            // Socket errors should not block feed creation
            console.warn('[FeedService] Socket broadcast failed:', socketErr);
        }
        console.log(`✅ [FeedService] Post created: [${type}] ${title}`);
        // Push Notifications for major system posts or Admin Broadcasts
        if (isSystemPost || post.actorRole === 'admin') {
            // Run async detached so we don't block the HTTP response
            setImmediate(async () => {
                try {
                    const audienceQuery = { pushToken: { $exists: true, $ne: null } };
                    if (targetAudience === 'freelancers')
                        audienceQuery.userType = 'freelancer';
                    if (targetAudience === 'clients')
                        audienceQuery.userType = 'client';
                    const users = await User.find(audienceQuery).select('_id pushToken');
                    console.log(`[FeedService] Dispatching mass push to ${users.length} targets`);
                    for (const user of users) {
                        // We use the notification service we found
                        await NotificationService.sendPushNotification(user._id.toString(), title, post.emoji ? `${post.emoji} ${body.substring(0, 80)}...` : body.substring(0, 80) + '...', { feedPostId: post._id, type: 'feed_update' });
                    }
                }
                catch (pushErr) {
                    console.error('[FeedService] Mass broadcast push failed:', pushErr);
                }
            });
        }
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('[FeedService] Error getting stats:', error);
        return { totalPosts: 0, totalUsers: 0, activeJobs: 0, completedProjects: 0 };
    }
};
export default { createFeedPost, getFeedStats };
