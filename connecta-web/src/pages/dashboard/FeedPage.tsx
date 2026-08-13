import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rss, ThumbsUp, MessageCircle, Share2, Loader2,
  CheckCircle2, Send, Image, MoreHorizontal, Globe, ShieldCheck,
  ArrowUpRight, TrendingUp, Sparkles, MessageSquare, Heart, Bookmark,
  Filter, HelpCircle, FileText, UserPlus, Layers
} from 'lucide-react';
import { feedAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { CardSkeleton, MinimalistLoader } from '../../components/common/SkeletonLoader';

export const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Create Post State
  const [newPostText, setNewPostText] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'all' | 'announcements' | 'jobs'>('all');

  useEffect(() => {
    fetchPlatformFeed();
  }, []);

  const fetchPlatformFeed = async () => {
    setLoading(true);
    try {
      const res = await feedAPI.getFeed();
      if (res?.success && Array.isArray(res?.data)) {
        setPosts(res.data);
      } else if (Array.isArray(res)) {
        setPosts(res as any);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error('Error loading live platform feed:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    setPublishing(true);
    try {
      const authorName = `${user?.firstName || 'Connecta'} ${user?.lastName || 'User'}`;
      const res = await feedAPI.createPost({
        title: 'Community Update',
        body: newPostText,
        actorName: authorName,
        actorRole: user?.userType === 'client' ? 'Product Client' : 'Verified Freelancer',
        actorAvatar: user?.profileImage,
      });

      if (res?.success && res?.data) {
        setPosts((prev) => [res.data, ...prev]);
      } else {
        fetchPlatformFeed();
      }
      setNewPostText('');
      showToast('Published post to Community Feed!', 'success');
    } catch (err: any) {
      console.error('Failed to publish post to feed:', err);
      showToast(err.response?.data?.message || 'Failed to post to feed.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === postId) {
          const isLiked = p.isLiked;
          return { ...p, likes: (p.likes || 0) + (isLiked ? -1 : 1), isLiked: !isLiked };
        }
        return p;
      })
    );
    try {
      await feedAPI.reactToPost(postId, 'like');
    } catch (err) {
      // optimistic update
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!commentText.trim()) return;
    const authorName = `${user?.firstName || 'Connecta'} ${user?.lastName || 'User'}`;

    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === postId) {
          const existingComments = Array.isArray(p.comments) ? p.comments : [];
          return {
            ...p,
            comments: [...existingComments, { _id: Date.now().toString(), author: authorName, text: commentText, createdAt: new Date().toISOString() }],
          };
        }
        return p;
      })
    );

    setCommentText('');
    showToast('Comment posted!', 'success');
    try {
      await feedAPI.addComment(postId, commentText);
    } catch (err) {
      // optimistic update
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (feedFilter === 'announcements') return p.actorRole === 'admin' || p.type === 'official_announcement';
    if (feedFilter === 'jobs') return p.type === 'job_posted';
    return true;
  });

  return (
    <DashboardLayout>
      <MinimalistLoader loading={publishing} />

      {/* Top Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
              <Rss size={13} /> Live Community & Job Feed
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              Activity Feed & Announcements
            </h1>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
              Live job alerts, verified talent achievements, platform announcements, and community discussions.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setFeedFilter('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: feedFilter === 'all' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: feedFilter === 'all' ? 'var(--primary)' : 'var(--bg-secondary)',
                color: feedFilter === 'all' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              All Posts
            </button>
            <button
              onClick={() => setFeedFilter('announcements')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: feedFilter === 'announcements' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: feedFilter === 'announcements' ? 'var(--primary)' : 'var(--bg-secondary)',
                color: feedFilter === 'announcements' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Official Updates
            </button>
            <button
              onClick={() => setFeedFilter('jobs')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: feedFilter === 'jobs' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: feedFilter === 'jobs' ? 'var(--primary)' : 'var(--bg-secondary)',
                color: feedFilter === 'jobs' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Job Alerts
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Feed + Right Sidebar */}
      <div className="grid-responsive-2" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'flex-start' }}>

        {/* Feed Posts Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Create Post Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{
              padding: '20px',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.firstName}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                />
              ) : (
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--grad-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <textarea
                placeholder={`Share an update, project milestone, or question, ${user?.firstName || 'User'}...`}
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                className="input-field"
                rows={3}
                style={{ flex: 1, borderRadius: '16px', padding: '12px 16px', fontSize: '0.88rem', lineHeight: 1.4, resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  type="button"
                  onClick={() => showToast('Attach photo or video option selected', 'info')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  <Image size={17} color="#10B981" /> Media Attachment
                </button>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  <Globe size={17} color="#3B82F6" /> Public Community
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCreatePost}
                disabled={publishing || !newPostText.trim()}
                className="btn-primary"
                style={{ padding: '8px 22px', borderRadius: '12px', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {publishing ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />} Post Update
              </motion.button>
            </div>
          </motion.div>

          {/* Posts List or Skeleton Loader */}
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : filteredPosts.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
              <Rss size={36} color="var(--primary)" style={{ margin: '0 auto 12px', opacity: 0.7 }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                No activity posts found
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Be the first to share an update with the Connecta marketplace community!
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isOfficial = post.actorRole === 'admin' || post.type === 'official_announcement';
              const isActivityCard = post.type === 'job_posted' || post.type === 'proposal_accepted' || post.type === 'new_member';
              const commentsList = Array.isArray(post.comments) ? post.comments : [];
              const showComments = activeCommentPostId === post._id;

              return (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card"
                  style={{
                    borderRadius: '20px',
                    border: isOfficial ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    overflow: 'hidden',
                    boxShadow: isOfficial ? '0 8px 28px rgba(253,103,48,0.12)' : 'var(--shadow-sm)',
                  }}
                >
                  {/* Official Announcement Banner */}
                  {isOfficial && (
                    <div style={{
                      background: 'var(--grad-primary)',
                      color: '#fff',
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}>
                      <ShieldCheck size={15} /> Official Connecta Announcement
                    </div>
                  )}

                  <div style={{ padding: '20px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: isOfficial ? 'var(--grad-primary)' : 'var(--bg-tertiary)',
                          color: isOfficial ? '#fff' : 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          border: '2px solid var(--primary)',
                        }}>
                          {(post.actorName || 'C')[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: isOfficial ? 'var(--primary)' : 'var(--text-primary)' }}>
                              {post.actorName || 'Connecta Member'}
                            </span>
                            <CheckCircle2 size={14} color="var(--primary)" strokeWidth={2.5} />
                          </div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {post.actorRole || 'Member'} • {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    {isActivityCard ? (
                      <div style={{
                        background: 'var(--bg-secondary)',
                        padding: '16px 18px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        marginBottom: '14px',
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'flex-start',
                      }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: 'rgba(253,103,48,0.12)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {post.type === 'job_posted' ? <FileText size={20} /> : <UserPlus size={20} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                            {post.title}
                          </h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 10px' }}>
                            {post.body}
                          </p>

                          {post.type === 'job_posted' && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => navigate('/jobs')}
                              className="btn-primary"
                              style={{ padding: '7px 14px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              View Job Listing <ArrowUpRight size={13} />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: '14px' }}>
                        {post.title && (
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.35 }}>
                            {post.title}
                          </h3>
                        )}
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap' }}>
                          {post.body || post.content}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Attached Image Media */}
                  {post.imageUrl && (
                    <div style={{ width: '100%', maxHeight: '360px', overflow: 'hidden', background: '#000' }}>
                      <img
                        src={post.imageUrl}
                        alt={post.title || 'Feed post'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  {/* Reaction counts */}
                  <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <ThumbsUp size={11} />
                      </div>
                      <strong style={{ color: 'var(--text-primary)' }}>{post.likes || 0}</strong> Likes
                    </span>
                    <span
                      onClick={() => setActiveCommentPostId(showComments ? null : post._id)}
                      style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--primary)' }}
                    >
                      {commentsList.length} Comments
                    </span>
                  </div>

                  {/* Action Bar */}
                  <div style={{ padding: '6px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <button
                      onClick={() => handleLike(post._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: post.isLiked ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'background 0.15s',
                      }}
                    >
                      <ThumbsUp size={15} /> Like
                    </button>

                    <button
                      onClick={() => setActiveCommentPostId(showComments ? null : post._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <MessageCircle size={15} /> Comment
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        showToast('Link copied to clipboard!', 'success');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Share2 size={15} /> Share
                    </button>
                  </div>

                  {/* Comment Drawer Section */}
                  {showComments && (
                    <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
                      {commentsList.map((c: any, cIdx: number) => (
                        <div key={c._id || cIdx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                            {(c.author || 'U')[0]?.toUpperCase()}
                          </div>
                          <div style={{ background: 'var(--card-bg)', padding: '8px 14px', borderRadius: '14px', border: '1px solid var(--border-color)', flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--text-primary)', marginBottom: '2px' }}>{c.author || 'Connecta Member'}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{c.text || c.content}</div>
                          </div>
                        </div>
                      ))}

                      {/* Comment Input */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleCommentSubmit(post._id); }}
                          className="input-field"
                          style={{ flex: 1, fontSize: '0.82rem', borderRadius: '20px' }}
                        />
                        <button
                          onClick={() => handleCommentSubmit(post._id)}
                          className="btn-primary"
                          style={{ padding: '8px 16px', borderRadius: '18px', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Desktop Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Trending Topics Box */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <TrendingUp size={18} color="var(--primary)" />
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-primary)' }}>Trending Marketplace Topics</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                #EscrowPaymentProtection
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>142 discussions today</span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                #VettedProVerification
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>88 talent badges issued</span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                #MobileAppEscrow
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>34 new job listings</span>
              </div>
            </div>
          </div>

          {/* Community Guidelines Card */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Sparkles size={18} color="var(--primary)" />
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-primary)' }}>Community Guidelines</h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              Keep discussions professional. Use Connecta Escrow for all work agreements to ensure 100% payment protection.
            </p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default FeedPage;
