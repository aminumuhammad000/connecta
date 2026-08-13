import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { notificationAPI } from '../../services/api';
import {
  Bell, CheckCheck, Trash2, RefreshCw, Filter, X, ChevronRight
} from 'lucide-react';

const NOTIF_ICONS: Record<string, string> = {
  proposal_received: '📋', proposal_accepted: '🎉', proposal_rejected: '❌',
  proposal_new: '📋', payment_received: '💰', payment_released: '💸',
  message_received: '💬', review_received: '⭐', job_posted: '💼',
  project_started: '🚀', project_completed: '✅', milestone_completed: '🏁',
  contract_signed: '📝', gig_matched: '🎯', collabo_invite: '🤝',
  collabo_started: '🤝', job_invite: '📩', deadline_approaching: '⏰',
  system: '🔔', info: 'ℹ️', success: '✅', warning: '⚠️', error: '🚨',
};

const NOTIF_COLORS: Record<string, string> = {
  proposal_accepted: '#fd6730', proposal_new: '#fd6730', proposal_received: '#fd6730',
  payment_received: '#22c55e', payment_released: '#22c55e',
  message_received: '#3B82F6', review_received: '#f59e0b',
  gig_matched: '#fd6730', project_completed: '#22c55e',
  error: '#ef4444', warning: '#f59e0b',
  system: '#8b5cf6',
};

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'messages', label: 'Messages' },
  { key: 'proposals', label: 'Proposals' },
  { key: 'payments', label: 'Payments' },
  { key: 'system', label: 'System' },
];

const matchesFilter = (notif: any, filter: string) => {
  if (filter === 'all') return true;
  if (filter === 'unread') return !notif.isRead;
  if (filter === 'messages') return notif.type === 'message_received';
  if (filter === 'proposals') return notif.type?.startsWith('proposal');
  if (filter === 'payments') return notif.type?.startsWith('payment');
  if (filter === 'system') return ['system', 'info', 'warning', 'error', 'success'].includes(notif.type);
  return true;
};

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [filter, setFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [error, setError] = React.useState('');

  const fetchNotifications = React.useCallback(async (pg = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const res = await notificationAPI.getNotifications(pg, 30);
      if (res.success && Array.isArray(res.data)) {
        if (pg === 1) {
          setNotifications(res.data);
        } else {
          setNotifications(prev => [...prev, ...res.data as any[]]);
        }
        setUnreadCount((res as any).unreadCount ?? res.data.filter((n: any) => !n.isRead).length);
        const pagination = (res as any).pagination;
        if (pagination) setTotalPages(pagination.pages ?? 1);
      }
    } catch (e: any) {
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkOneRead = async (id: string) => {
    const notif = notifications.find(n => n._id === id);
    if (notif?.isRead) return;
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const wasUnread = notifications.find(n => n._id === id && !n.isRead);
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleClearRead = async () => {
    try {
      await notificationAPI.clearRead();
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch {}
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchNotifications(next);
  };

  const handleNotifClick = (notif: any) => {
    handleMarkOneRead(notif._id);
    if (notif.link) navigate(notif.link);
  };

  const filtered = notifications.filter(n => matchesFilter(n, filter));

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 0 40px' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'rgba(253,103,48,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Bell size={20} color="var(--primary)" />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Notifications
                  </h1>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => fetchNotifications(1, true)}
                disabled={refreshing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '10px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600,
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  opacity: refreshing ? 0.6 : 1,
                }}
              >
                <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '10px',
                    background: 'rgba(253,103,48,0.1)', border: '1px solid rgba(253,103,48,0.3)',
                    color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
              <button
                onClick={handleClearRead}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '10px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Trash2 size={13} />
                Clear read
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex', gap: '6px', flexWrap: 'wrap',
          marginBottom: '20px', paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color)',
        }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: filter === f.key ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: filter === f.key ? 'var(--primary)' : 'var(--bg-secondary)',
                color: filter === f.key ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {f.label}
              {f.key === 'unread' && unreadCount > 0 && (
                <span style={{
                  marginLeft: '5px', background: '#ef4444', color: '#fff',
                  borderRadius: '8px', padding: '1px 5px', fontSize: '0.65rem', fontWeight: 700,
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div style={{
            padding: '14px 16px', borderRadius: '12px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444', fontSize: '0.82rem', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span>⚠️</span> {error}
            <button onClick={() => fetchNotifications(1)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' }}>
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                style={{
                  padding: '16px', borderRadius: '14px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  animation: 'pulse 1.5s infinite',
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-tertiary)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '12px', width: '60%', background: 'var(--bg-tertiary)', borderRadius: '6px', marginBottom: '8px' }} />
                  <div style={{ height: '10px', width: '85%', background: 'var(--bg-tertiary)', borderRadius: '6px', marginBottom: '6px' }} />
                  <div style={{ height: '8px', width: '30%', background: 'var(--bg-tertiary)', borderRadius: '6px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State */
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            background: 'var(--bg-secondary)', borderRadius: '18px',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🔔</div>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.05rem', margin: '0 0 6px' }}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
              {filter === 'unread'
                ? "You've read all your notifications. Great job!"
                : "We'll notify you when something important happens."}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                style={{
                  marginTop: '16px', padding: '8px 20px', borderRadius: '10px',
                  background: 'var(--primary)', color: '#fff', border: 'none',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                View all notifications
              </button>
            )}
          </div>
        ) : (
          /* Notification List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            {filtered.map((notif, idx) => {
              const accentColor = NOTIF_COLORS[notif.type] || 'var(--border-color)';
              return (
                <div
                  key={notif._id}
                  onClick={() => handleNotifClick(notif)}
                  style={{
                    padding: '14px 18px',
                    borderLeft: `3px solid ${notif.isRead ? 'transparent' : accentColor}`,
                    background: notif.isRead ? 'var(--bg-secondary)' : `color-mix(in srgb, ${accentColor} 5%, var(--bg-secondary))`,
                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-color)' : 'none',
                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                    cursor: notif.link ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!notif.isRead) (e.currentTarget as HTMLElement).style.background = `color-mix(in srgb, ${accentColor} 9%, var(--bg-secondary))`;
                  }}
                  onMouseLeave={e => {
                    if (!notif.isRead) (e.currentTarget as HTMLElement).style.background = `color-mix(in srgb, ${accentColor} 5%, var(--bg-secondary))`;
                    else (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)';
                  }}
                >
                  {/* Icon Badge */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                    background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}>
                    {NOTIF_ICONS[notif.type] || '🔔'}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '3px'
                    }}>
                      <span style={{
                        fontWeight: notif.isRead ? 500 : 700,
                        fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.3,
                      }}>
                        {notif.title}
                      </span>
                      <span style={{
                        fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0, paddingTop: '2px'
                      }}>
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p style={{
                      color: 'var(--text-secondary)', fontSize: '0.79rem', margin: '0 0 4px',
                      lineHeight: 1.5,
                    }}>
                      {notif.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!notif.isRead && (
                        <span style={{
                          display: 'inline-block', width: '6px', height: '6px',
                          borderRadius: '50%', background: accentColor,
                        }} />
                      )}
                      {notif.actorName && (
                        <span style={{ fontSize: '0.71rem', color: 'var(--text-muted)' }}>
                          From: {notif.actorName}
                        </span>
                      )}
                      {notif.link && (
                        <span style={{ fontSize: '0.71rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          View <ChevronRight size={10} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(notif._id, e)}
                    title="Dismiss"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '4px', color: 'var(--text-muted)', flexShrink: 0,
                      opacity: 0.4, transition: 'opacity 0.15s', borderRadius: '6px',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.4'}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {!loading && page < totalPages && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={handleLoadMore}
              style={{
                padding: '10px 28px', borderRadius: '12px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Load more notifications
            </button>
          </div>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
