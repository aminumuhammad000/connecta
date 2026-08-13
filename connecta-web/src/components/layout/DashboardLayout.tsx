import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { notificationAPI } from '../../services/api';
import {
  Sun, Moon, LogOut, PlusCircle, Bell, LayoutDashboard, Briefcase, MessageSquare,
  Wallet, UserCheck, HelpCircle, Bookmark, FileText, ChevronRight, User, CheckCircle2, Rss, Sparkles, Search, Building2, Menu, X, Trash2
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { PageArtwork } from '../common/PageArtwork';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifMenu, setShowNotifMenu] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifLoading, setNotifLoading] = React.useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);

  // Fetch notifications when bell is opened or on mount
  const fetchNotifications = React.useCallback(async () => {
    try {
      setNotifLoading(true);
      const res = await notificationAPI.getNotifications(1, 10);
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
        setUnreadCount((res as any).unreadCount ?? res.data.filter((n: any) => !n.isRead).length);
      }
    } catch (e) {
      // silent fail
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // Poll unread count every 30 seconds
  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(async () => {
      try {
        const res = await notificationAPI.getUnreadCount();
        if (res.success) setUnreadCount((res.data as any)?.unreadCount ?? 0);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleDeleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationAPI.deleteNotification(id);
      const wasUnread = notifications.find(n => n._id === id && !n.isRead);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const getNotifIcon = (type: string) => {
    const icons: Record<string, string> = {
      proposal_received: '📋', proposal_accepted: '🎉', proposal_rejected: '❌',
      payment_received: '💰', payment_released: '💸', message_received: '💬',
      review_received: '⭐', job_posted: '💼', project_started: '🚀',
      project_completed: '✅', milestone_completed: '🏁', contract_signed: '📝',
      gig_matched: '🎯', collabo_invite: '🤝', deadline_approaching: '⏰',
      system: '🔔', info: 'ℹ️', success: '✅', warning: '⚠️', error: '🚨',
    };
    return icons[type] || '🔔';
  };

  const getNotifBorderColor = (type: string) => {
    const colors: Record<string, string> = {
      proposal_accepted: 'var(--primary)', payment_received: '#22c55e',
      payment_released: '#22c55e', message_received: '#3B82F6',
      review_received: '#f59e0b', gig_matched: 'var(--primary)',
      project_completed: '#22c55e', error: '#ef4444', warning: '#f59e0b',
    };
    return colors[type] || 'var(--border-color)';
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isFreelancer = user?.userType === 'freelancer';
  const isClient = user?.userType === 'client';

  const sidebarNavItems = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      path: isFreelancer ? '/freelancer/dashboard' : '/client/dashboard',
    },
    {
      label: 'Activity Feeds',
      icon: <Rss size={18} color="var(--primary)" />,
      path: '/feed',
      isNew: true,
    },
    {
      label: isFreelancer ? 'Find Jobs' : 'My Jobs & Projects',
      icon: <Briefcase size={18} />,
      path: isFreelancer ? '/jobs' : '/client/projects',
    },
    {
      label: isFreelancer ? 'My Proposals' : 'Hired Talent',
      icon: isFreelancer ? <FileText size={18} /> : <UserCheck size={18} />,
      path: isFreelancer ? '/proposals' : '/client/talent',
    },
    {
      label: 'Messages',
      icon: <MessageSquare size={18} />,
      path: '/messages',
    },
    {
      label: 'My Wallet',
      icon: <Wallet size={18} />,
      path: '/wallet',
    },
    ...(isFreelancer ? [
      {
        label: 'Saved Gigs',
        icon: <Bookmark size={18} />,
        path: '/saved-gigs',
      }
    ] : []),
    {
      label: 'My Profile',
      icon: <User size={18} />,
      path: '/settings',
    },
    {
      label: 'Help & Support',
      icon: <HelpCircle size={18} />,
      path: '/support',
    },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Background Left & Right Angle Artworks */}
      <PageArtwork />

      {/* Fixed Top Header Navigation Bar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        zIndex: 100,
        background: 'transparent',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Brand Logo & Mobile Menu Hamburger Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="mobile-hamburger-btn"
              style={{
                background: 'var(--bg-tertiary)',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              <Menu size={20} />
            </button>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Logo height={32} />
            </Link>
          </div>

          {/* Right Header Actions */}
          <div className="header-actions-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Top Nav AI Copilot Button (Icon only matching Header Action icons) */}
            <button
              onClick={() => navigate('/ai-assistant')}
              title="AI Copilot"
              className="header-action-btn"
              style={{
                background: 'rgba(253,103,48,0.12)',
                border: '1px solid rgba(253,103,48,0.25)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Sparkles size={18} color="var(--primary)" />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="header-action-btn"
              style={{
                background: 'var(--bg-tertiary)',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications Dropdown */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => { setShowNotifMenu(!showNotifMenu); if (!showNotifMenu) fetchNotifications(); }}
                className="header-action-btn"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      minWidth: '16px',
                      height: '16px',
                      borderRadius: '8px',
                      background: '#ef4444',
                      border: '2px solid var(--bg-primary)',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                      padding: '0 3px',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotifMenu && (
                <div
                  className="glass-card"
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: '0',
                    width: '360px',
                    borderRadius: '16px',
                    padding: '0',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
                    zIndex: 200,
                    overflow: 'hidden',
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={15} color="var(--primary)" />
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, borderRadius: '10px', padding: '1px 6px' }}>{unreadCount}</span>
                      )}
                    </div>
                    <span
                      onClick={handleMarkAllRead}
                      style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', opacity: unreadCount === 0 ? 0.4 : 1 }}
                    >
                      Mark all read
                    </span>
                  </div>

                  {/* Notification Items */}
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {notifLoading ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        Loading...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔔</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>You're all caught up!</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>No notifications yet</div>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleMarkOneRead(notif._id)}
                          style={{
                            padding: '11px 16px',
                            borderLeft: `3px solid ${notif.isRead ? 'transparent' : getNotifBorderColor(notif.type)}`,
                            background: notif.isRead ? 'transparent' : 'rgba(var(--primary-rgb, 253,103,48),0.04)',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'flex-start',
                            transition: 'background 0.15s',
                          }}
                        >
                          <span style={{ fontSize: '1.15rem', flexShrink: 0, marginTop: '1px' }}>{getNotifIcon(notif.type)}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: notif.isRead ? 500 : 700, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '2px', lineHeight: 1.3 }}>
                              {notif.title}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.73rem', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {notif.message}
                            </div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                              {formatTimeAgo(notif.createdAt)}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handleDeleteNotif(notif._id, e)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-muted)', flexShrink: 0, opacity: 0.5 }}
                            title="Dismiss"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', textAlign: 'center' }}>
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifMenu(false)}
                      style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                    >
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Image & Logout */}
            <div className="header-user-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid var(--border-color)' }}>
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.firstName}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid var(--primary)',
                  }}
                />
              ) : (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--grad-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}>
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <button
                onClick={handleLogout}
                title="Sign Out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  marginLeft: '2px',
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body below Fixed Top Nav */}
      <div style={{
        marginTop: '90px',
        height: 'calc(100vh - 90px)',
        display: 'flex',
        maxWidth: '1400px',
        width: '100%',
        margin: '90px auto 0',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Fixed Left Navigation Sidebar */}
        <aside className="desktop-sidebar" style={{
          width: '240px',
          height: '100%',
          background: 'transparent',
          padding: '0 16px 24px 0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          {/* Top Sidebar Profile Card */}
          <div className="glass-card" style={{
            padding: '10px 14px',
            borderRadius: '16px',
            border: '1px solid rgba(253,103,48,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.firstName}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--primary)',
                  }}
                />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--grad-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(253,103,48,0.3)',
                }}>
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.firstName} {user?.lastName}
                  </span>
                  <CheckCircle2 size={13} color="var(--primary)" />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Building2 size={11} color="var(--primary)" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {(user as any)?.jobTitle || (isFreelancer ? 'Senior Software Engineer' : 'Product Client')}
                  </span>
                </div>
              </div>
            </div>

            {/* Micro Bio */}
            <p style={{
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.35,
              marginBottom: '8px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              textOverflow: 'ellipsis',
              maxHeight: '2.6em',
            }}>
              {user?.bio || (isFreelancer ? 'Building scalable web & mobile apps with modern frameworks across Africa.' : 'Hiring top-tier tech talent and managing tech projects.')}
            </p>
          </div>

          {/* Navigation Items Group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '16px', marginBottom: '16px', flex: 1 }}>
            {sidebarNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 14px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.86rem',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(253,103,48,0.08)' : 'transparent',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={16} color="var(--primary)" />}
                </Link>
              );
            })}
          </div>

          {/* Bottom Call to Action Button */}
          <div>
            {isClient ? (
              <button
                onClick={() => navigate('/jobs/new')}
                className="btn-primary"
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                }}
              >
                <PlusCircle size={17} /> Post a Job
              </button>
            ) : (
              <button
                onClick={() => navigate('/jobs')}
                className="btn-primary"
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                }}
              >
                <Search size={17} /> Find a Job
              </button>
            )}
          </div>
        </aside>

        {/* Scrollable Main Content Area */}
        <main className="main-content-container" style={{
          flex: 1,
          height: '100%',
          padding: '24px 32px 60px',
          overflowY: 'auto',
        }}>
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Sliding Drawer Overlay */}
      {mobileSidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
          {/* Backdrop */}
          <div
            onClick={() => setMobileSidebarOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          />

          {/* Sliding Drawer Container */}
          <div
            style={{
              position: 'relative',
              width: '280px',
              maxWidth: '85vw',
              height: '100%',
              background: 'var(--bg-primary)',
              borderRight: '1px solid var(--border-color)',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 310,
              boxShadow: '10px 0 30px rgba(0,0,0,0.2)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <Logo height={30} />
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  style={{ background: 'var(--bg-tertiary)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Profile Card in Drawer */}
              <div className="glass-card" style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 600 }}>{isFreelancer ? (user?.title || 'Freelancer') : 'Client'}</div>
              </div>

              {/* Nav Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {sidebarNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '11px 14px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontWeight: isActive ? 700 : 600,
                        fontSize: '0.88rem',
                        color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                        background: isActive ? 'rgba(253,103,48,0.08)' : 'transparent',
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => { setMobileSidebarOpen(false); handleLogout(); }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: 'none', color: 'var(--error)', fontWeight: 700, cursor: 'pointer' }}
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
