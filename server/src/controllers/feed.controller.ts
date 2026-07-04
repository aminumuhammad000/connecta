import { Request, Response } from 'express';
import FeedPost from '../models/Feed.model.js';
import FeedComment from '../models/FeedComment.model.js';
import { getFeedStats } from '../services/feed.service.js';
import { getIO } from '../core/utils/socketIO.js';
import mongoose from 'mongoose';

// ─── GET FEED (paginated) ────────────────────────────────────────────────────
export const getFeed = async (req: Request, res: Response) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip  = (page - 1) * limit;
    const audience = (req.query.audience as string) || 'all'; // 'all' | 'freelancers' | 'clients'

    // Build audience filter
    const audienceFilter =
      audience === 'all'
        ? { targetAudience: { $in: ['all', 'freelancers', 'clients'] } }
        : { targetAudience: { $in: ['all', audience] } };

    const filter: any = {
      visibility: 'public',
      // Exclude expired posts (stories)
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
      ...audienceFilter,
    };

    const [posts, total] = await Promise.all([
      FeedPost.find(filter)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FeedPost.countDocuments(filter),
    ]);

    // Attach current user's reaction to each post
    const userId = (req as any).user?.id;
    const enrichedPosts = posts.map(post => {
      let myReaction: string | null = null;
      if (userId) {
        const uid = new mongoose.Types.ObjectId(userId);
        const reactions = post.reactions as any;
        if (reactions) {
          for (const key of ['celebrate', 'insightful', 'clap', 'fire', 'love']) {
            if (reactions[key]?.some((id: any) => id.toString() === uid.toString())) {
              myReaction = key;
              break;
            }
          }
        }
      }
      const reactions = post.reactions as any;
      const totalReactions = reactions
        ? ['celebrate', 'insightful', 'clap', 'fire', 'love'].reduce(
            (sum, k) => sum + (reactions[k]?.length || 0),
            0
          )
        : 0;

      return { ...post, myReaction, totalReactions };
    });

    res.status(200).json({
      success: true,
      data: enrichedPosts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching feed', error: error.message });
  }
};

// ─── GET SINGLE POST ─────────────────────────────────────────────────────────
export const getFeedPostById = async (req: Request, res: Response) => {
  try {
    const post = await FeedPost.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, data: post });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching post', error: error.message });
  }
};

// ─── REACT TO POST ───────────────────────────────────────────────────────────
export const reactToPost = async (req: Request, res: Response) => {
  try {
    const userId   = (req as any).user?.id;
    const postId   = req.params.id;
    const { reaction } = req.body; // 'celebrate' | 'insightful' | 'clap' | 'fire' | 'love'

    const validReactions = ['celebrate', 'insightful', 'clap', 'fire', 'love'];
    if (!validReactions.includes(reaction)) {
      return res.status(400).json({ success: false, message: 'Invalid reaction type' });
    }

    const post = await FeedPost.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const uid = new mongoose.Types.ObjectId(userId);

    // Remove user from ALL reaction arrays first (toggle / change reaction)
    for (const key of validReactions) {
      (post.reactions as any)[key] = ((post.reactions as any)[key] as mongoose.Types.ObjectId[])
        .filter(id => id.toString() !== uid.toString());
    }

    // Add to the chosen reaction
    (post.reactions as any)[reaction].push(uid);
    await post.save();

    // Calculate totals
    const reactions = post.reactions as any;
    const totalReactions = validReactions.reduce((sum, k) => sum + ((reactions[k]?.length) || 0), 0);

    // Broadcast live reaction update
    try {
      getIO().emit('feed:reaction', { postId, reactions: post.reactions, totalReactions });
    } catch {}

    res.status(200).json({ success: true, data: { reactions: post.reactions, totalReactions } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error reacting to post', error: error.message });
  }
};

// ─── REMOVE REACTION ─────────────────────────────────────────────────────────
export const removeReaction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const postId = req.params.id;
    const validReactions = ['celebrate', 'insightful', 'clap', 'fire', 'love'];

    const post = await FeedPost.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const uid = new mongoose.Types.ObjectId(userId);
    for (const key of validReactions) {
      (post.reactions as any)[key] = ((post.reactions as any)[key] as mongoose.Types.ObjectId[])
        .filter(id => id.toString() !== uid.toString());
    }
    await post.save();

    const reactions = post.reactions as any;
    const totalReactions = validReactions.reduce((sum, k) => sum + ((reactions[k]?.length) || 0), 0);

    try {
      getIO().emit('feed:reaction', { postId, reactions: post.reactions, totalReactions });
    } catch {}

    res.status(200).json({ success: true, data: { reactions: post.reactions, totalReactions } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error removing reaction', error: error.message });
  }
};

// ─── GET COMMENTS ────────────────────────────────────────────────────────────
export const getComments = async (req: Request, res: Response) => {
  try {
    const comments = await FeedComment.find({ feedPostId: req.params.id })
      .sort({ createdAt: 1 })
      .lean();
    res.status(200).json({ success: true, data: comments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching comments', error: error.message });
  }
};

// ─── ADD COMMENT ─────────────────────────────────────────────────────────────
export const addComment = async (req: Request, res: Response) => {
  try {
    const userId   = (req as any).user?.id;
    const postId   = req.params.id;
    const { text, authorName, authorAvatar } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await FeedPost.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await FeedComment.create({
      feedPostId:   postId,
      authorId:     userId,
      authorName:   authorName || 'User',
      authorAvatar: authorAvatar,
      text:         text.trim(),
    });

    // Increment comment count on post (denormalized)
    await FeedPost.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    // Broadcast comment
    try {
      getIO().emit('feed:comment', { postId, comment });
    } catch {}

    res.status(201).json({ success: true, data: comment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error adding comment', error: error.message });
  }
};

// ─── VOTE ON POLL ────────────────────────────────────────────────────────────
export const voteOnPoll = async (req: Request, res: Response) => {
  try {
    const userId      = (req as any).user?.id;
    const postId      = req.params.id;
    const { optionIndex } = req.body;

    const post = await FeedPost.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!post.poll) return res.status(400).json({ success: false, message: 'This post is not a poll' });
    if (post.poll.closesAt && post.poll.closesAt < new Date()) {
      return res.status(400).json({ success: false, message: 'This poll has closed' });
    }

    const uid = new mongoose.Types.ObjectId(userId);

    // Remove previous vote from all options
    post.poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(id => id.toString() !== uid.toString());
    });

    // Add vote to selected option
    if (optionIndex >= 0 && optionIndex < post.poll.options.length) {
      post.poll.options[optionIndex].votes.push(uid as any);
    }

    await post.save();

    res.status(200).json({ success: true, data: post.poll });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error voting on poll', error: error.message });
  }
};

// ─── GET PLATFORM STATS ──────────────────────────────────────────────────────
export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const stats = await getFeedStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
};

// ─── GET TRENDING POSTS ──────────────────────────────────────────────────────
export const getTrendingPosts = async (req: Request, res: Response) => {
  try {
    const posts = await FeedPost.find({ visibility: 'public', isTrending: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    res.status(200).json({ success: true, data: posts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching trending', error: error.message });
  }
};
// ─── CREATE POST (user-generated) ───────────────────────────────────────────
export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const isValidObjectId = typeof userId === 'string' && /^[0-9a-fA-F]{24}$/.test(userId);
    const { type = 'user_post', title, body, emoji, actorName, actorAvatar, actorRole, targetAudience } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'title and body are required' });
    }

    const post = await FeedPost.create({
      type,
      actor: isValidObjectId ? userId : undefined,
      actorName: actorName || 'Connecta Admin',
      actorAvatar: actorAvatar || '',
      actorRole: actorRole || 'admin',
      title: title.slice(0, 200),
      body: body.slice(0, 2000),
      emoji: emoji || '📝',
      targetAudience: targetAudience || 'all',
      visibility: 'public',
    });

    // Broadcast live to all connected clients
    try {
      getIO().emit('feed:new_post', post);
    } catch {}

    res.status(201).json({ success: true, data: post });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error creating post', error: error.message });
  }
};

// ─── USER: EDIT POST ────────────────────────────────────────────────────────
export const editUserPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, body } = req.body;
    const userId = (req as any).user?.id;

    const post = await FeedPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.actor?.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this post' });
    }

    if (title) post.title = title.slice(0, 200);
    if (body) post.body = body.slice(0, 2000);
    
    await post.save();

    res.status(200).json({ success: true, data: post });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error editing post', error: error.message });
  }
};

// ─── USER: DELETE POST ──────────────────────────────────────────────────────
export const deleteUserPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const post = await FeedPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.actor?.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this post' });
    }

    await FeedPost.deleteOne({ _id: id });
    await FeedComment.deleteMany({ postId: id });

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error deleting post', error: error.message });
  }
};

// ─── ADMIN: GET ALL POSTS (Paginated) ───────────────────────────────────────
export const getAdminFeed = async (req: Request, res: Response) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip  = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      FeedPost.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FeedPost.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching admin feed', error: error.message });
  }
};

// ─── ADMIN: UPDATE POST ─────────────────────────────────────────────────────
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Prevent overriding crucial tracking fields unless intended
    delete updates._id;

    const post = await FeedPost.findByIdAndUpdate(id, { $set: updates }, { new: true });
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({ success: true, data: post });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error updating post', error: error.message });
  }
};

// ─── ADMIN: DELETE POST ─────────────────────────────────────────────────────
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await FeedPost.findByIdAndDelete(id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Optional: Also delete associated comments if the user requested it in the plan.
    // The user didn't explicitly say yes or no, let's gracefully soft-delete or hard delete them:
    await FeedComment.deleteMany({ postId: id });

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error deleting post', error: error.message });
  }
};
