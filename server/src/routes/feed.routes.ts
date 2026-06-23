import express from 'express';
import { authenticate, requireRole } from '../core/middleware/auth.middleware.js';
import {
  getFeed,
  getFeedPostById,
  reactToPost,
  removeReaction,
  getComments,
  addComment,
  voteOnPoll,
  getPlatformStats,
  getTrendingPosts,
  createPost,
  getAdminFeed,
  updatePost,
  deletePost,
  editUserPost,
  deleteUserPost
} from '../controllers/feed.controller.js';

const router = express.Router();

// Public read routes (still need auth for personalization)
router.get('/',           authenticate, getFeed);
router.get('/trending',   authenticate, getTrendingPosts);
router.get('/stats',      authenticate, getPlatformStats);
router.get('/:id',        authenticate, getFeedPostById);
router.get('/:id/comments', authenticate, getComments);

// Write routes (require auth)
router.post('/create',            authenticate, requireRole(['admin']), createPost);        // Admin-generated post
router.post('/:id/react',         authenticate, reactToPost);
router.delete('/:id/react',       authenticate, removeReaction);
router.post('/:id/comments',      authenticate, addComment);
router.post('/:id/poll/vote',     authenticate, voteOnPoll);

// Write routes (user level management)
router.put('/user/:id',           authenticate, editUserPost);
router.delete('/user/:id',        authenticate, deleteUserPost);

// Admin Management routes
router.get('/admin/all',          authenticate, requireRole(['admin']), getAdminFeed);
router.put('/:id',                authenticate, requireRole(['admin']), updatePost);
router.delete('/:id',             authenticate, requireRole(['admin']), deletePost);

export default router;
