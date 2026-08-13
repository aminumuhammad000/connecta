import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useNotifications } from '../../contexts/NotificationContext';
import type { AppNotification } from '../../contexts/NotificationContext';
import {
  Bell, CheckCheck, Trash2, RefreshCw, X, ChevronRight,
  FileText, CheckCircle2, XCircle, DollarSign, ArrowDownToLine,
  MessageSquare, Star, Briefcase, Rocket, CheckCircle, Flag,
  FileCheck, Target, Users, AlarmClock, Info, AlertTriangle,
  AlertCircle, Handshake, MailOpen, Award, Clock, ArrowLeft
} from 'lucide-react';

// ── Icon map (Lucide vector icon + Color badge per notification type) ─────
const NOTIF_ICON_MAP: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  proposal_received:   { icon: <FileText size={18} />,      color: '#fd6730', bg: 'rgba(253,103,48,0.12)' },
  proposal_new:        { icon: <FileText size={18} />,      color: '#fd6730', bg: 'rgba(253,103,48,0.12)' },
  proposal_accepted:   { icon: <CheckCircle2 size={18} />,  color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  proposal_rejected:   { icon: <XCircle size={18} />,       color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  payment_received:    { icon: <DollarSign size={18} />,    color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  payment_released:    { icon: <ArrowDownToLine size={18} />, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  message_received:    { icon: <MessageSquare size={18} />, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  review_received:     { icon: <Star size={18} />,          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  job_posted:          { icon: <Briefcase size={18} />,     color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  project_started:     { icon: <Rocket size={18} />,        color: '#fd6730', bg: 'rgba(253,103,48,0.12)' },
  project_completed:   { icon: <CheckCircle size={18} />,   color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  milestone_completed: { icon: <Flag size={18} />,          color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  contract_signed:     { icon: <FileCheck size={18} />,     color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  gig_matched:         { icon: <Target size={18} />,        color: '#fd6730', bg: 'rgba(253,103,48,0.12)' },
  collabo_invite:      { icon: <Handshake size={18} />,     color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  collabo_started:     { icon: <Users size={18} />,         color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  job_invite:          { icon: <MailOpen size={18} />,      color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  deadline_approaching:{ icon: <AlarmClock size={18} />,    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  system:              { icon: <Bell size={18} />,          color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  info:                { icon: <Info size={18} />,          color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  success:             { icon: <CheckCircle2 size={18} />,  color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  warning:             { icon: <AlertTriangle size={18} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  error:               { icon: <AlertCircle size={18} />,   color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const DEFAULT_ICON = { icon: <Bell size={18} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' };

const getNotifMeta = (type: string) => NOTIF_ICON_MAP[type] || DEFAULT_ICON;

const getNotifMeta = (type: string) => NOTIF_ICON_MAP[type] || DEFAULT_ICON;

// ── Helpers ────────────────────────────────────────────────────────────────
const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatFullDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

// ── Filter config ───────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'all',      label: 'All' },
  { key: 'unread',   label: 'Unread' },
  { key: 'messages', label: 'Messages' },
  { key: 'proposals',label: 'Proposals' },
  { key: 'payments', label: 'Payments' },
  { key: 'system',   label: 'System' },
];

const matchesFilter = (n: AppNotification, filter: string) => {
  if (filter === 'all')       return true;
  if (filter === 'unread')    return !n.isRead;
  if (filter === 'messages')  return n.type === 'message_received';
  if (filter === 'proposals') return n.type?.startsWith('proposal');
  if (filter === 'payments')  return n.type?.startsWith('payment');
  if (filter === 'system')    return ['system','info','warning','error','success'].includes(n.type);
  return true;
};

// ── Detail Panel ───────────────────────────────────────────────────────────
const DetailPanel: React.FC<{
  notif: AppNotification;
  onClose: () => void;
  onNavigate: (link: string) => void;
  onDelete: (id: string) => void;
}> = ({ notif, onClose, onNavigate, onDelete }) => {
  const meta = getNotifMeta(notif.type);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
      />

      {/* Panel */}
      <div style={{
        position: 'relative', zIndex: 1, width: '420px', maxWidth: '95vw',
        height: '100vh', background: 'var(--bg-primary)',
        borderLeft: '1px solid var(--border-color)',
        boxShadow: '-16px 0 50px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
        animation: 'slideInRight 0.22s ease',
      }}>
        {/* Panel Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              borderRadius: '8px', padding: '6px', cursor: 'pointer',
              color: 'var(--text-secondary)', display: 'flex',
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            Notification Detail
          </span>
        </div>

        {/* Icon + Title */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: meta.bg, color: meta.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
          }}>
            {/* Render larger icon by re-mapping type to a 24px icon */}
            {React.createElement(
              (meta.icon as React.ReactElement).type,
              { size: 24, strokeWidth: 2 }
            )}
          </div>
          <h2 style={{
            fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)',
            margin: '0 0 8px', lineHeight: 1.3,
          }}>
            {notif.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
            {notif.message}
          </p>
        </div>

        {/* Metadata */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
          {/* Date */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', flexShrink: 0,
            }}>
              <Clock size={14} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Received</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>{formatFullDate(notif.createdAt)}</div>
            </div>
          </div>

          {/* From */}
          {notif.actorName && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', flexShrink: 0,
              }}>
                <Users size={14} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>{notif.actorName}</div>
              </div>
            </div>
          )}

          {/* Type */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', flexShrink: 0,
            }}>
              <Award size={14} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '3px 10px', borderRadius: '20px',
                background: meta.bg, color: meta.color,
                fontSize: '0.75rem', fontWeight: 600,
              }}>
                {React.createElement((meta.icon as React.ReactElement).type, { size: 12, strokeWidth: 2 })}
                {notif.type?.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', flexShrink: 0,
            }}>
              <CheckCircle2 size={14} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '0.78rem', fontWeight: 600,
                color: notif.isRead ? 'var(--text-muted)' : '#22c55e',
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: notif.isRead ? 'var(--text-muted)' : '#22c55e',
                }} />
                {notif.isRead ? 'Read' : 'Unread'}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: '20px 24px', borderTop: '1px solid var(--border-color)',
          display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0,
        }}>
          {notif.link && (
            <button
              onClick={() => onNavigate(notif.link!)}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                background: 'var(--primary)', border: 'none', color: '#fff',
                fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              View Details <ChevronRight size={16} />
            </button>
          )}
          <button
            onClick={() => { onDelete(notif._id); onClose(); }}
            style={{
              width: '100%', padding: '10px', borderRadius: '12px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <Trash2 size={14} /> Dismiss
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications, unreadCount, loading,
    fetchNotifications, markAsRead, markAllAsRead,
    deleteNotification, clearRead,
  } = useNotifications();

  const [filter, setFilter] = React.useState('all');
  const [refreshing, setRefreshing] = React.useState(false);
  const [selected, setSelected] = React.useState<AppNotification | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(1, true);
    setRefreshing(false);
  };

  const handleCardClick = async (notif: AppNotification) => {
    setSelected(notif);
    if (!notif.isRead) await markAsRead(notif._id);
  };

  const handleNavigate = (link: string) => {
    setSelected(null);
    navigate(link);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await deleteNotification(id);
  };

  const filtered = notifications.filter(n => matchesFilter(n, filter));

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 0 60px' }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'rgba(253,103,48,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bell size={20} color="var(--primary)" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Notifications
                </h1>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={handleRefresh} disabled={refreshing} style={btnStyle('secondary')}>
                <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} style={btnStyle('primary')}>
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <button onClick={clearRead} style={btnStyle('secondary')}>
                <Trash2 size={13} /> Clear read
              </button>
            </div>
          </div>
        </div>

        {/* ── Filter Tabs ── */}
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
                padding: '6px 14px', borderRadius: '20px',
                border: filter === f.key ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: filter === f.key ? 'var(--primary)' : 'var(--bg-secondary)',
                color: filter === f.key ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {f.label}
              {f.key === 'unread' && unreadCount > 0 && (
                <span style={{
                  marginLeft: '5px', background: filter === 'unread' ? 'rgba(255,255,255,0.3)' : '#ef4444',
                  color: '#fff', borderRadius: '8px', padding: '1px 5px', fontSize: '0.65rem', fontWeight: 700,
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Loading Skeleton ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                padding: '16px', background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex', gap: '12px', alignItems: 'center',
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-tertiary)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '12px', width: '55%', background: 'var(--bg-tertiary)', borderRadius: '6px', marginBottom: '8px' }} />
                  <div style={{ height: '10px', width: '80%', background: 'var(--bg-tertiary)', borderRadius: '6px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* ── Empty State ── */
          <div style={{
            textAlign: 'center', padding: '64px 24px',
            background: 'var(--bg-secondary)', borderRadius: '16px',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px',
              background: 'rgba(253,103,48,0.1)', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bell size={28} color="var(--primary)" />
            </div>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', margin: '0 0 6px' }}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
              {filter === 'unread' ? "You've read everything." : "We'll notify you when something happens."}
            </p>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} style={{ ...btnStyle('primary'), marginTop: '16px', display: 'inline-flex' }}>
                View all
              </button>
            )}
          </div>
        ) : (
          /* ── Notification List ── */
          <div style={{
            borderRadius: '16px', overflow: 'hidden',
            border: '1px solid var(--border-color)',
          }}>
            {filtered.map((notif, idx) => {
              const meta = getNotifMeta(notif.type);
              return (
                <div
                  key={notif._id}
                  onClick={() => handleCardClick(notif)}
                  style={{
                    padding: '14px 18px',
                    borderLeft: `3px solid ${notif.isRead ? 'transparent' : meta.color}`,
                    background: notif.isRead ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-color)' : 'none',
                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = notif.isRead ? 'var(--bg-secondary)' : 'var(--bg-primary)')}
                >
                  {/* Vector Icon Badge */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                    background: meta.bg, color: meta.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {meta.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '3px' }}>
                      <span style={{
                        fontWeight: notif.isRead ? 500 : 700, fontSize: '0.84rem',
                        color: 'var(--text-primary)', lineHeight: 1.3,
                      }}>
                        {notif.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatTimeAgo(notif.createdAt)}</span>
                        <button
                          onClick={(e) => handleDelete(notif._id, e)}
                          title="Dismiss"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                            color: 'var(--text-muted)', opacity: 0.5, transition: 'opacity 0.15s', borderRadius: '4px',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>

                    <p style={{
                      color: 'var(--text-secondary)', fontSize: '0.78rem',
                      margin: '0 0 5px', lineHeight: 1.5,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {notif.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!notif.isRead && (
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: meta.color, display: 'inline-block', flexShrink: 0,
                        }} />
                      )}
                      {notif.actorName && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>From: {notif.actorName}</span>
                      )}
                      <span style={{
                        fontSize: '0.7rem', color: meta.color, marginLeft: 'auto',
                        display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 500,
                      }}>
                        View detail <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <style>{`
          @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        `}</style>
      </div>

      {/* ── Detail Panel ── */}
      {selected && (
        <DetailPanel
          notif={selected}
          onClose={() => setSelected(null)}
          onNavigate={handleNavigate}
          onDelete={deleteNotification}
        />
      )}
    </DashboardLayout>
  );
};

// ── Button style helper ────────────────────────────────────────────────────
function btnStyle(variant: 'primary' | 'secondary'): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: '10px', fontSize: '0.78rem',
    fontWeight: 600, cursor: 'pointer',
    ...(variant === 'primary'
      ? { background: 'rgba(253,103,48,0.1)', border: '1px solid rgba(253,103,48,0.3)', color: 'var(--primary)' }
      : { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }
    ),
  };
}

export default NotificationsPage;
