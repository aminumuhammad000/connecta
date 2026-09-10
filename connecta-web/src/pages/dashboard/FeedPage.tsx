import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { storage } from '../../utils/storage';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Loader2,
  ShieldCheck, ArrowUpRight, Send, CornerDownRight, MoreHorizontal, Sparkles, Image as ImageIcon, X, Edit3, Trash2, CheckCircle2
} from 'lucide-react';
import { feedAPI, authAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { CardSkeleton, MinimalistLoader } from '../../components/common/SkeletonLoader';

interface ReplyItem {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  createdAt: string;
}

interface CommentItem {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  createdAt: string;
  likes?: number;
  isLiked?: boolean;
  replies?: ReplyItem[];
}

export const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const highlightPostId = searchParams.get('post');

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Composer State
  const [newPostText, setNewPostText] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'all' | 'announcements' | 'jobs'>('all');

  // UI Interactive States
  const [openCommentsState, setOpenCommentsState] = useState<Record<string, boolean>>({});
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [postCommentInput, setPostCommentInput] = useState<Record<string, string>>({});
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [showReplyBox, setShowReplyBox] = useState<Record<string, boolean>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostBody, setEditingPostBody] = useState<string>('');
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const toggleComments = (postId: string) => {
    setOpenCommentsState((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleExpandPost = (postId: string) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  useEffect(() => {
    fetchPlatformFeed();

    const token = storage.getToken();
    if (!token) return;

    const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://api.myconnecta.ng';
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('feed:new_post', (newPost: any) => {
      setPosts((prev) => {
        if (prev.some(p => p._id === newPost._id)) return prev;
        return [newPost, ...prev];
      });
    });

    socket.on('feed:comment', ({ postId, comment }: { postId: string; comment: any }) => {
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            const formattedComment: CommentItem = {
              id: comment._id || `c-${Date.now()}`,
              author: comment.authorName || comment.author || 'Connecta User',
              avatar: comment.authorAvatar || comment.avatar,
              text: comment.text || '',
              createdAt: comment.createdAt || new Date().toISOString(),
              likes: 0,
              isLiked: false,
              replies: [],
            };
            const existing = p.comments || [];
            if (existing.some((c: CommentItem) => c.id === formattedComment.id)) return p;
            return {
              ...p,
              comments: [...existing, formattedComment],
            };
          }
          return p;
        })
      );
    });

    socket.on('feed:reaction', ({ postId, totalReactions, likes }: { postId: string; totalReactions: number; likes?: number }) => {
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            return {
              ...p,
              likes: likes ?? totalReactions ?? (p.likes || 0) + 1,
            };
          }
          return p;
        })
      );
    });

    return () => {
      if (socket.connected) socket.disconnect();
    };
  }, []);

  const fetchPlatformFeed = async () => {
    setLoading(true);
    try {
      const res = await feedAPI.getFeed(20, 1);
      let list = [];
      if (res?.success && Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res)) {
        list = res as any;
      }

      if (list.length < 20) setHasMore(false);

      const formatted = list.map((p: any) => {
        const rawComments = Array.isArray(p.comments) ? p.comments : [];
        const structuredComments: CommentItem[] = rawComments.map((c: any, cIdx: number) => ({
          id: c.id || c._id || `c-${cIdx}`,
          author: c.author || c.authorName || 'Connecta Pro',
          avatar: c.avatar || c.authorAvatar,
          text: c.text || c.content || '',
          createdAt: c.createdAt || new Date().toISOString(),
          likes: c.likes || 0,
          isLiked: false,
          replies: c.replies || [],
        }));

        return {
          ...p,
          comments: structuredComments,
        };
      });

      setPosts(formatted);
      setPage(1);
    } catch (err) {
      console.error('Error loading live platform feed:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreFeed = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await feedAPI.getFeed(20, nextPage);
      let list = [];
      if (res?.success && Array.isArray(res?.data)) {
        list = res.data;
      }

      if (list.length < 20) setHasMore(false);

      const formatted = list.map((p: any) => {
        const rawComments = Array.isArray(p.comments) ? p.comments : [];
        const structuredComments: CommentItem[] = rawComments.map((c: any, cIdx: number) => ({
          id: c.id || c._id || `c-${cIdx}`,
          author: c.author || c.authorName || 'Connecta Pro',
          avatar: c.avatar || c.authorAvatar,
          text: c.text || c.content || '',
          createdAt: c.createdAt || new Date().toISOString(),
          likes: c.likes || 0,
          isLiked: false,
          replies: c.replies || [],
        }));

        return {
          ...p,
          comments: structuredComments,
        };
      });

      setPosts((prev) => [...prev, ...formatted]);
      setPage(nextPage);
    } catch (err) {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPostImage(localUrl);
    setUploadingImage(true);

    try {
      const res = await feedAPI.uploadImage(file);
      const url = res?.data?.url || res?.url || (res?.data && typeof res.data === 'string' ? res.data : null);

      if (url) {
        setPostImage(url);
        showToast('Image attached!', 'success');
      }
    } catch (err: any) {
      console.warn('Backend image upload fallback to local preview:', err);
      showToast('Image attached!', 'success');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !postImage) {
      showToast('Please enter a caption or attach an image.', 'error');
      return;
    }

    setPublishing(true);
    try {
      const authorName = `${user?.firstName || 'Connecta'} ${user?.lastName || 'User'}`;
      const postContent = newPostText.trim() || (postImage ? 'Photo Post' : 'Community Update');
      const res = await feedAPI.createPost({
        title: postContent.slice(0, 100),
        body: postContent,
        imageUrl: postImage || undefined,
        actorName: authorName,
        actorRole: user?.userType === 'client' ? 'Client' : 'Freelancer',
        actorAvatar: user?.profileImage,
      });

      const newEntry = {
        _id: res?.data?._id || Date.now().toString(),
        actor: user?._id || (user as any)?.id,
        actorName: authorName,
        actorRole: user?.userType === 'client' ? 'Client' : 'Freelancer',
        actorAvatar: user?.profileImage,
        body: newPostText.trim(),
        imageUrl: postImage,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        comments: [],
      };

      setPosts((prev) => [newEntry, ...prev]);
      setNewPostText('');
      setPostImage(null);
      showToast('Post published to feed!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to publish post.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleEditPost = async (postId: string) => {
    if (!editingPostBody.trim()) return;
    try {
      await feedAPI.editPost(postId, { body: editingPostBody });
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, body: editingPostBody } : p))
      );
      setEditingPostId(null);
      setEditingPostBody('');
      showToast('Post updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update post.', 'error');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await feedAPI.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      showToast('Post deleted successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete post.', 'error');
    }
  };

  const handleReaction = async (postId: string, reactionType = 'like') => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === postId) {
          const isSameReaction = p.myReaction === reactionType;
          return {
            ...p,
            myReaction: isSameReaction ? null : reactionType,
            likes: (p.likes || 0) + (isSameReaction ? -1 : 1),
            isLiked: !isSameReaction,
          };
        }
        return p;
      })
    );
    try {
      await feedAPI.reactToPost(postId, reactionType);
    } catch (err) {}
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === postId) {
          const updatedComments = (p.comments || []).map((c: CommentItem) => {
            if (c.id === commentId) {
              const isLiked = c.isLiked;
              return { ...c, likes: (c.likes || 0) + (isLiked ? -1 : 1), isLiked: !isLiked };
            }
            return c;
          });
          return { ...p, comments: updatedComments };
        }
        return p;
      })
    );
  };

  const handleAddComment = async (postId: string) => {
    const text = postCommentInput[postId];
    if (!text || !text.trim()) return;

    const authorName = `${user?.firstName || 'Connecta'} ${user?.lastName || 'User'}`;
    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: authorName,
      avatar: user?.profileImage,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: [],
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === postId) {
          return { ...p, comments: [...(p.comments || []), newComment] };
        }
        return p;
      })
    );

    setPostCommentInput((prev) => ({ ...prev, [postId]: '' }));
    showToast('Comment added!', 'success');

    try {
      await feedAPI.addComment(postId, text);
    } catch (err) {}
  };

  const handleAddReply = async (postId: string, commentId: string) => {
    const key = `${postId}_${commentId}`;
    const text = replyInput[key];
    if (!text || !text.trim()) return;

    const authorName = `${user?.firstName || 'Connecta'} ${user?.lastName || 'User'}`;
    const newReply: ReplyItem = {
      id: `r-${Date.now()}`,
      author: authorName,
      avatar: user?.profileImage,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === postId) {
          const updatedComments = (p.comments || []).map((c: CommentItem) => {
            if (c.id === commentId) {
              return { ...c, replies: [...(c.replies || []), newReply] };
            }
            return c;
          });
          return { ...p, comments: updatedComments };
        }
        return p;
      })
    );

    setReplyInput((prev) => ({ ...prev, [key]: '' }));
    setActiveReplyId(null);
    showToast('Reply added!', 'success');

    try {
      await feedAPI.addComment(postId, text, commentId);
    } catch (err) {}
  };



  const filteredPosts = posts.filter((p) => {
    if (feedFilter === 'announcements') return p.actorRole === 'admin' || p.type === 'official_announcement';
    if (feedFilter === 'jobs') return p.type === 'job_posted';
    return true;
  });

  return (
    <DashboardLayout>
      <MinimalistLoader loading={publishing} />

      <div style={{ maxWidth: '580px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Minimal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Feeds
          </h1>

          {/* Minimal Filter Tabs */}
          <div className="mobile-feed-filter-bar" style={{ display: 'inline-flex', background: 'var(--bg-secondary)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color)', gap: '2px' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'announcements', label: 'Official' },
              { id: 'jobs', label: 'Jobs' }
            ].map((tab) => {
              const isActive = feedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFeedFilter(tab.id as any)}
                  className={isActive ? 'active-filter-tab' : ''}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                    fontWeight: isActive ? 800 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 8px rgba(253, 103, 48, 0.35)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Composer Input Row */}
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '14px 16px',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--grad-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              flexShrink: 0,
              overflow: 'hidden'
            }}>
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.firstName || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (user?.firstName || 'U')[0]?.toUpperCase()
              )}
            </div>

            <div style={{ flex: 1 }}>
              <textarea
                placeholder={`Share an update or photo to Feeds, ${user?.firstName || 'User'}...`}
                value={newPostText}
                rows={1}
                onChange={(e) => {
                  setNewPostText(e.target.value);
                  // Auto expand height based on content length
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleCreatePost(e);
                  }
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  padding: '6px 0',
                  fontWeight: 500,
                  resize: 'none',
                  minHeight: '36px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  lineHeight: 1.45,
                  fontFamily: 'inherit'
                }}
              />

              {/* Hidden file input for photo upload */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />

              {/* Attached Image Thumbnail Preview */}
              {postImage && (
                <div style={{ position: 'relative', marginTop: '8px', display: 'inline-block', maxWidth: '100%' }}>
                  <img
                    src={postImage}
                    alt="Attached preview"
                    style={{ maxHeight: '160px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setPostImage(null)}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: 'rgba(0,0,0,0.65)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: postImage ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    padding: 0
                  }}
                >
                  {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={16} />}
                  <span>{postImage ? 'Photo attached' : 'Add Photo'}</span>
                </button>

                <button
                  onClick={handleCreatePost}
                  disabled={publishing || (!newPostText.trim() && !postImage)}
                  className="btn-primary"
                  style={{ padding: '5px 14px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 700, opacity: (!newPostText.trim() && !postImage) ? 0.5 : 1 }}
                >
                  {publishing ? <Loader2 size={13} className="animate-spin" /> : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thread Feed Posts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : filteredPosts.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
                No threads found in this filter. Start the conversation!
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isOfficial = post.actorRole === 'admin' || post.type === 'official_announcement';
              const isJob = post.type === 'job_posted';
              const comments: CommentItem[] = post.comments || [];
              const isAuthor = (user?._id && post.actor === user._id) || (post.actorName === `${user?.firstName} ${user?.lastName}`);
              const isHighlighted = highlightPostId === post._id;

              return (
                <div
                  key={post._id}
                  id={`post-${post._id}`}
                  style={{
                    background: 'var(--card-bg)',
                    borderRadius: '18px',
                    border: isHighlighted ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    padding: '18px',
                    position: 'relative',
                    boxShadow: isHighlighted ? '0 0 16px rgba(253, 103, 48, 0.25)' : '0 2px 8px rgba(0,0,0,0.02)',
                    transition: 'border 0.3s ease'
                  }}
                >
                  {/* Main Post Row */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', position: 'relative' }}>
                    
                    {/* Avatar & Vertical Thread Line */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: isOfficial ? 'var(--grad-primary)' : 'var(--bg-tertiary)',
                        color: isOfficial ? '#fff' : 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        overflow: 'hidden'
                      }}>
                        {post.actorAvatar || post.avatar ? (
                          <img src={post.actorAvatar || post.avatar} alt={post.actorName || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          (post.actorName || 'C')[0]?.toUpperCase()
                        )}
                      </div>

                      {comments.length > 0 && (
                        <div style={{
                          width: '2px',
                          flex: 1,
                          minHeight: '40px',
                          background: 'var(--border-color)',
                          margin: '6px 0',
                          borderRadius: '2px'
                        }} />
                      )}
                    </div>

                    {/* Main Post Body */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      
                      {/* Author Meta & Action Menu */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                            {post.actorName || 'Connecta Pro'}
                          </span>
                          {isOfficial && <ShieldCheck size={14} color="var(--primary)" />}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>

                          {/* Options Menu Dropdown */}
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={() => setActiveMenuPostId(activeMenuPostId === post._id ? null : post._id)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            {activeMenuPostId === post._id && (
                              <div style={{
                                position: 'absolute',
                                right: 0,
                                top: '22px',
                                background: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                                zIndex: 30,
                                minWidth: '130px',
                                overflow: 'hidden'
                              }}>
                                {isAuthor && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingPostId(post._id);
                                        setEditingPostBody(post.body || post.content || '');
                                        setActiveMenuPostId(null);
                                      }}
                                      style={{ width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', fontSize: '0.78rem', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                      <Edit3 size={13} /> Edit Post
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDeletePost(post._id);
                                        setActiveMenuPostId(null);
                                      }}
                                      style={{ width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', fontSize: '0.78rem', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                      <Trash2 size={13} /> Delete Post
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => {
                                    const permalink = `${window.location.origin}/feed?post=${post._id}`;
                                    navigator.clipboard.writeText(permalink);
                                    showToast('Post permalink copied!', 'success');
                                    setActiveMenuPostId(null);
                                  }}
                                  style={{ width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', fontSize: '0.78rem', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                  <Share2 size={13} /> Copy Link
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Editing View vs Standard View */}
                      {editingPostId === post._id ? (
                        <div style={{ marginBottom: '12px' }}>
                          <textarea
                            value={editingPostBody}
                            onChange={(e) => setEditingPostBody(e.target.value)}
                            style={{
                              width: '100%',
                              borderRadius: '10px',
                              border: '1px solid var(--primary)',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-primary)',
                              padding: '8px',
                              fontSize: '0.86rem',
                              minHeight: '70px'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
                            <button
                              onClick={() => setEditingPostId(null)}
                              style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleEditPost(post._id)}
                              className="btn-primary"
                              style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Text Content with Show More / Show Less */
                        (() => {
                          const content = post.body || post.content || '';
                          const isLong = content.length > 240;
                          const isExpanded = expandedPosts[post._id];
                          const displayContent = isLong && !isExpanded ? content.slice(0, 240) + '...' : content;

                          return (
                            <div style={{ margin: '0 0 10px' }}>
                              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
                                {displayContent}
                              </p>
                              {isLong && (
                                <button
                                  onClick={() => toggleExpandPost(post._id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    padding: '4px 0 0 0',
                                    display: 'inline-block'
                                  }}
                                >
                                  {isExpanded ? 'Show less' : 'Show more'}
                                </button>
                              )}
                            </div>
                          );
                        })()
                      )}

                      {/* Clickable Image Lightbox Thumbnail */}
                      {post.imageUrl && (
                        <div
                          onClick={() => setSelectedImageModal(post.imageUrl)}
                          style={{ width: '100%', maxHeight: '280px', overflow: 'hidden', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer' }}
                        >
                          <img src={post.imageUrl} alt="Thread media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}



                      {/* Job Badge */}
                      {isJob && (
                        <div style={{
                          background: 'var(--bg-secondary)',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)',
                          marginBottom: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {post.title || 'New Job Opportunity'}
                          </span>
                          <button
                            onClick={() => navigate('/jobs')}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
                          >
                            View <ArrowUpRight size={13} />
                          </button>
                        </div>
                      )}

                      {/* Post Action Bar */}
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '18px', margin: '8px 0 4px' }}>
                        
                        <button
                          onClick={() => handleReaction(post._id, 'like')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: post.isLiked || post.myReaction ? '#EF4444' : 'var(--text-muted)',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: 0
                          }}
                        >
                          <Heart size={16} fill={post.isLiked || post.myReaction ? '#EF4444' : 'none'} /> {post.likes || 0}
                        </button>

                        <button
                          onClick={() => toggleComments(post._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: openCommentsState[post._id] ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: 0
                          }}
                        >
                          <MessageCircle size={16} /> {comments.length}
                        </button>

                        <button
                          onClick={() => {
                            const permalink = `${window.location.origin}/feed?post=${post._id}`;
                            navigator.clipboard.writeText(permalink);
                            showToast('Link copied to clipboard!', 'success');
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                        >
                          <Share2 size={15} />
                        </button>
                      </div>

                      {/* CONDITIONAL COMMENTS & REPLIES DRAWER */}
                      {openCommentsState[post._id] && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          
                          {/* Inline Post Comment Input */}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={postCommentInput[post._id] || ''}
                              onChange={(e) => setPostCommentInput({ ...postCommentInput, [post._id]: e.target.value })}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post._id); }}
                              style={{
                                flex: 1,
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-secondary)',
                                padding: '6px 14px',
                                fontSize: '0.78rem',
                                outline: 'none',
                                color: 'var(--text-primary)'
                              }}
                            />
                            <button
                              onClick={() => handleAddComment(post._id)}
                              className="btn-primary"
                              style={{ padding: '6px 14px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}
                            >
                              Comment
                            </button>
                          </div>

                          {/* Comments List */}
                          {comments.map((comment) => (
                            <div key={comment.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                              <div style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                flexShrink: 0,
                                overflow: 'hidden'
                              }}>
                                {comment.avatar ? (
                                  <img src={comment.avatar} alt={comment.author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  (comment.author || 'C')[0]?.toUpperCase()
                                )}
                              </div>

                              <div style={{ flex: 1, background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.76rem', color: 'var(--text-primary)' }}>
                                    {comment.author}
                                  </span>
                                  <button
                                    onClick={() => handleLikeComment(post._id, comment.id)}
                                    style={{ background: 'none', border: 'none', color: comment.isLiked ? '#EF4444' : 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                                  >
                                    <Heart size={11} fill={comment.isLiked ? '#EF4444' : 'none'} /> {comment.likes || 0}
                                  </button>
                                </div>

                                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 4px', lineHeight: 1.4 }}>
                                  {comment.text}
                                </p>

                                {/* Reply Trigger */}
                                <button
                                  onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '3px' }}
                                >
                                  <CornerDownRight size={10} /> Reply
                                </button>

                                {/* Inline Nested Reply Input */}
                                {activeReplyId === comment.id && (
                                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                    <input
                                      type="text"
                                      placeholder={`Reply to ${comment.author}...`}
                                      value={replyInput[`${post._id}_${comment.id}`] || ''}
                                      onChange={(e) => setReplyInput({ ...replyInput, [`${post._id}_${comment.id}`]: e.target.value })}
                                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddReply(post._id, comment.id); }}
                                      style={{
                                        flex: 1,
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--card-bg)',
                                        padding: '4px 10px',
                                        fontSize: '0.72rem',
                                        outline: 'none',
                                        color: 'var(--text-primary)'
                                      }}
                                    />
                                    <button
                                      onClick={() => handleAddReply(post._id, comment.id)}
                                      className="btn-primary"
                                      style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700 }}
                                    >
                                      Reply
                                    </button>
                                  </div>
                                )}

                                {/* Render Nested Sub-Replies */}
                                {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', paddingLeft: '8px', borderLeft: '2px solid var(--border-color)' }}>
                                    {comment.replies.map((reply) => (
                                      <div key={reply.id} style={{ fontSize: '0.74rem', background: 'var(--card-bg)', padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                        <strong style={{ color: 'var(--text-primary)', marginRight: '4px' }}>{reply.author}:</strong>
                                        <span style={{ color: 'var(--text-secondary)' }}>{reply.text}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={fetchMoreFeed}
              disabled={loadingMore}
              className="btn-secondary"
              style={{ padding: '8px 20px', borderRadius: '12px', fontSize: '0.84rem', fontWeight: 700, background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              {loadingMore ? <Loader2 size={16} className="animate-spin" /> : 'Load More Threads'}
            </button>
          </div>
        )}

        {/* Full Resolution Image Lightbox Modal */}
        <AnimatePresence>
          {selectedImageModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImageModal(null)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
            >
              <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
                <img
                  src={selectedImageModal}
                  alt="Full view"
                  style={{ width: '100%', height: '100%', maxHeight: '85vh', borderRadius: '16px', objectFit: 'contain' }}
                />
                <button
                  onClick={() => setSelectedImageModal(null)}
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    right: '-14px',
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default FeedPage;
