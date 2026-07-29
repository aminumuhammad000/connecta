import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rss, ThumbsUp, MessageCircle, Share2, Loader2,
  CheckCircle2, Send, Image, MoreHorizontal, Globe, ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { feedAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

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
        title: '💬 Community Update',
        body: newPostText,
        actorName: authorName,
        actorRole: user?.userType || 'Member',
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
    const authorName = `${user?.firstName || 'Usman'} ${user?.lastName || ''}`;

    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === postId) {
          const existingComments = Array.isArray(p.comments) ? p.comments : [];
          return {
            ...p,
            comments: [...existingComments, { _id: Date.now().toString(), author: authorName, text: commentText }],
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

  return (
    <DashboardLayout>
      {/* Header Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
            <Rss size={13} /> Live Marketplace Activity Feed
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Community Feed & Job Updates
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
            Automated job posting alerts, milestone achievements, official announcements, and community posts.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Facebook-style Create Post Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{
            padding: '18px 20px',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            background: 'var(--card-bg)',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
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
            <input
              type="text"
              placeholder={`Share an update or question, ${user?.firstName || 'Usman'}?`}
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              className="input-field"
              style={{ flex: 1, borderRadius: '24px', padding: '10px 18px', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                type="button"
                onClick={() => showToast('Photo upload option selected!', 'info')}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}
              >
                <Image size={18} color="#10B981" /> Photo/Video
              </button>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}
              >
                <Globe size={18} color="#3B82F6" /> Public Feed
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreatePost}
              disabled={publishing || !newPostText.trim()}
              className="btn-primary"
              style={{ padding: '8px 20px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}
            >
              {publishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />} Post
            </motion.button>
          </div>
        </motion.div>

        {/* Feed Posts */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 10px' }} />
            <span>Loading community feed posts...</span>
          </div>
        ) : (
          posts.map((post) => {
            const isOfficial = post.actorRole === 'admin' || post.type === 'official_announcement';
            const isUserColoredPost = post.type === 'user_post' && !post.imageUrl;
            const isActivityCard = post.type === 'job_posted' || post.type === 'proposal_accepted' || post.type === 'new_member';

            return (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{
                  borderRadius: '20px',
                  border: isOfficial ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  overflow: 'hidden',
                  boxShadow: isOfficial ? '0 8px 30px rgba(253,103,48,0.14)' : '0 4px 15px rgba(0,0,0,0.02)',
                }}
              >
                {/* Official Connecta Banner */}
                {isOfficial && (
                  <div style={{
                    background: 'var(--grad-primary)',
                    color: '#fff',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    <ShieldCheck size={16} /> Official Connecta Announcement
                  </div>
                )}

                <div style={{ padding: '20px' }}>
                  {/* Author Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: isOfficial ? 'var(--grad-primary)' : 'var(--bg-tertiary)',
                        color: isOfficial ? '#fff' : 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1rem',
                        border: '2px solid var(--primary)',
                      }}>
                        {(post.actorName || 'C')[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.94rem', color: isOfficial ? 'var(--primary)' : 'var(--text-primary)' }}>
                            {post.actorName || 'Connecta User'}
                          </span>
                          <CheckCircle2 size={14} color="var(--primary)" strokeWidth={2.5} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {post.actorRole || 'Member'} • {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {/* Facebook-style Orange Color Box for User Text Posts */}
                  {isUserColoredPost ? (
                    <div style={{
                      background: 'var(--grad-primary)',
                      padding: '28px 24px',
                      borderRadius: '16px',
                      color: '#ffffff',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: '1.25rem',
                      lineHeight: 1.4,
                      boxShadow: '0 8px 20px rgba(253,103,48,0.2)',
                      marginBottom: '14px',
                    }}>
                      {post.body}
                    </div>
                  ) : isActivityCard ? (
                    /* Automated Activity Cards (Jobs Posted, Milestones, Members) */
                    <div style={{
                      background: 'var(--bg-secondary)',
                      padding: '18px 20px',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      marginBottom: '14px',
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'flex-start',
                    }}>
                      <div style={{
                        fontSize: '1.8rem',
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(253,103,48,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {post.emoji || '💼'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                          {post.title}
                        </h4>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 12px' }}>
                          {post.body}
                        </p>

                        {post.type === 'job_posted' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/jobs')}
                            className="btn-primary"
                            style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700 }}
                          >
                            View Job Listing <ArrowUpRight size={14} />
                          </motion.button>
                        )}
                        {post.type === 'new_member' && (
                          <button
                            onClick={() => navigate('/settings')}
                            style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)', cursor: 'pointer' }}
                          >
                            View Profile ↗
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* General Title & Text Body */
                    <div style={{ marginBottom: '14px' }}>
                      {post.title && (
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.35 }}>
                          {post.title}
                        </h3>
                      )}
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        {post.body || post.content}
                      </p>
                    </div>
                  )}
                </div>

                {/* Attached Image Media Banner */}
                {post.imageUrl && (
                  <div style={{ width: '100%', maxHeight: '380px', overflow: 'hidden', background: '#000' }}>
                    <img
                      src={post.imageUrl}
                      alt={post.title || 'Feed post'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                {/* Likes & Comments Count Header */}
                <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <ThumbsUp size={10} />
                    </div>
                    {post.likes || 0} Likes
                  </span>
                  <span>{(Array.isArray(post.comments) ? post.comments.length : post.comments) || 0} Comments</span>
                </div>

                {/* Facebook Action Bar */}
                <div style={{ padding: '6px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => handleLike(post._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '8px',
                      color: post.isLiked ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <ThumbsUp size={18} fill={post.isLiked ? 'var(--primary)' : 'none'} /> Like
                  </button>

                  <button
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post._id ? null : post._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '8px',
                      color: 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <MessageCircle size={18} /> Comment
                  </button>

                  <button
                    onClick={() => showToast('Post shared to community feed!', 'info')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '8px',
                      color: 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Share2 size={18} /> Share
                  </button>
                </div>

                {/* Comments Thread Section */}
                <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Array.isArray(post.comments) && post.comments.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {post.comments.map((c: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--grad-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                            {(c.author || 'C')[0]}
                          </div>
                          <div style={{ background: 'var(--card-bg)', padding: '10px 14px', borderRadius: '14px', border: '1px solid var(--border-color)', flex: 1 }}>
                            <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                              {c.author || 'Community Member'}
                            </span>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.text || c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={activeCommentPostId === post._id ? commentText : ''}
                      onFocus={() => setActiveCommentPostId(post._id)}
                      onChange={(e) => {
                        setActiveCommentPostId(post._id);
                        setCommentText(e.target.value);
                      }}
                      className="input-field"
                      style={{ flex: 1, borderRadius: '20px', padding: '8px 16px', fontSize: '0.84rem' }}
                    />
                    <button
                      onClick={() => handleCommentSubmit(post._id)}
                      className="btn-primary"
                      style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700 }}
                    >
                      Send
                    </button>
                  </div>
                </div>

              </motion.div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
};
