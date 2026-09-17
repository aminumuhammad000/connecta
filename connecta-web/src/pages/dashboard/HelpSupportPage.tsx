import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  Send,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  ExternalLink,
  LifeBuoy,
  PlusCircle,
  Inbox,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { contactAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface SupportTicket {
  _id: string;
  subject: string;
  message: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status: 'Submitted' | 'In Progress' | 'Reviewed' | 'Resolved' | string;
  adminResponse?: string;
  createdAt: string;
  updatedAt?: string;
}

export const HelpSupportPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'submit' | 'history' | 'faqs'>('submit');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Form states
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Account & Security');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [submitting, setSubmitting] = useState(false);

  // Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const [contactInfo, setContactInfo] = useState({
    email: 'support@myconnecta.ng',
    phone: '+234 812 345 6789',
    whatsapp: '+234 812 345 6789',
    supportHours: 'Mon – Sat: 8:00 AM – 8:00 PM WAT',
    supportChannel: 'Email, WhatsApp & Helpdesk',
  });

  const categories = [
    'Account & Security',
    'Escrow & Payments',
    'Proposals & Jobs',
    'Profile & Verification',
    'Technical Issue',
    'General Inquiry',
  ];

  const faqs = [
    {
      q: 'How does escrow protection work on Connecta?',
      a: 'Funds are securely deposited into escrow when a contract starts and released only after work is reviewed and approved.',
    },
    {
      q: 'How do I withdraw funds to my local bank account?',
      a: 'Go to "My Wallet" and click "Withdraw Funds". Enter your verified NUBAN account number. Withdrawals process seamlessly.',
    },
    {
      q: 'What is the platform service fee?',
      a: 'Connecta charges a competitive flat fee on completed contracts to maintain platform security and escrow support.',
    },
    {
      q: 'How do I get verified as a freelancer?',
      a: 'Complete your profile details, upload your portfolio items, and verify your ID or phone number.',
    },
  ];

  useEffect(() => {
    contactAPI.getPublicContact()
      .then((res) => {
        if (res?.success && res?.data) {
          setContactInfo((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {});
  }, []);

  const fetchMyTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await contactAPI.getMyTickets();
      if (res?.success && Array.isArray(res.data)) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      showToast('Please provide both subject and message', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await contactAPI.submitContact({
        name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined,
        email: user?.email,
        subject: subject.trim(),
        message: message.trim(),
        category,
        priority,
      });

      if (res?.success) {
        showToast('Support ticket submitted successfully.', 'success');
        setSubject('');
        setMessage('');
        fetchMyTickets();
        setActiveTab('history');
      } else {
        showToast(res?.message || 'Ticket submitted successfully', 'success');
        setSubject('');
        setMessage('');
        fetchMyTickets();
        setActiveTab('history');
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to submit request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'resolved') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
          <CheckCircle2 size={12} /> Resolved
        </span>
      );
    }
    if (s === 'reviewed') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(147, 51, 234, 0.12)', color: '#7e22ce' }}>
          <CheckCircle2 size={12} /> Reviewed
        </span>
      );
    }
    if (s === 'in progress') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(245, 158, 11, 0.14)', color: '#d97706' }}>
          <RefreshCw size={12} /> In Progress
        </span>
      );
    }
    // Default Submitted
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
        <AlertCircle size={12} /> Submitted
      </span>
    );
  };

  const cleanPhone = contactInfo.phone.replace(/[^0-9+]/g, '');
  const cleanWhatsapp = contactInfo.whatsapp.replace(/[^0-9]/g, '');

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1020px', margin: '0 auto', paddingBottom: '40px' }}>
        {/* Header */}
        <div style={{ marginBottom: '22px' }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Support & Help Desk
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
            Submit tickets, track resolution status, or get quick answers.
          </p>
        </div>

        {/* Quick Contact Chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <a
            href={`mailto:${contactInfo.email}`}
            className="glass-card"
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(253, 103, 48, 0.1)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Mail size={16} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>Email Support</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{contactInfo.email}</span>
            </div>
          </a>

          <a
            href={`https://wa.me/${cleanWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card"
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(37, 211, 102, 0.12)', color: '#25D366', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <MessageCircle size={16} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>WhatsApp</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{contactInfo.whatsapp}</span>
            </div>
          </a>

          <div
            className="glass-card"
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Clock size={16} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>Hours</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{contactInfo.supportHours}</span>
            </div>
          </div>
        </div>

        {/* Minimalist Tabs Header */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('submit')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'submit' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'submit' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'submit' ? 700 : 600,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <PlusCircle size={15} />
            Submit Request
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              fetchMyTickets();
            }}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'history' ? 700 : 600,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Inbox size={15} />
            My Requests
            {tickets.length > 0 && (
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                background: activeTab === 'history' ? 'var(--primary)' : 'rgba(150,150,150,0.15)',
                color: activeTab === 'history' ? '#fff' : 'var(--text-secondary)',
                borderRadius: '999px',
                padding: '1px 6px',
              }}>
                {tickets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'faqs' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'faqs' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'faqs' ? 700 : 600,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <HelpCircle size={15} />
            FAQs
          </button>
        </div>

        {/* Tab 1: Submit Request */}
        {activeTab === 'submit' && (
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', maxWidth: '640px' }}>
            <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.86rem', padding: '10px 12px' }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Priority
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: priority === p ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                        background: priority === p ? 'rgba(253, 103, 48, 0.08)' : 'transparent',
                        color: priority === p ? 'var(--primary)' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Issue with milestone payment release"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.86rem', padding: '10px 12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Message
                </label>
                <textarea
                  placeholder="Describe your request clearly..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-field"
                  rows={4}
                  style={{ width: '100%', fontSize: '0.86rem', padding: '10px 12px', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ paddingTop: '6px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                  <Send size={15} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: My Requests */}
        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'} submitted
              </span>
              <button
                onClick={fetchMyTickets}
                disabled={loadingTickets}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                <RefreshCw size={13} className={loadingTickets ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {loadingTickets ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                Loading requests...
              </div>
            ) : tickets.length === 0 ? (
              <div
                className="glass-card"
                style={{
                  padding: '48px 24px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center',
                }}
              >
                <Inbox size={36} style={{ color: 'var(--text-secondary)', margin: '0 auto 12px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  No support requests yet
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
                  Have an issue or question? Submit a request and track its status here.
                </p>
                <button
                  onClick={() => setActiveTab('submit')}
                  className="btn-primary"
                  style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}
                >
                  Create Request
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tickets.map((t) => (
                  <div
                    key={t._id}
                    className="glass-card"
                    style={{
                      padding: '18px 20px',
                      borderRadius: '14px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary)' }}>
                            {t.category || 'General Support'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>•</span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                            {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {t.subject}
                        </h4>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        {getStatusBadge(t.status)}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {t.message}
                    </p>

                    {/* Admin Response if present */}
                    {t.adminResponse && (
                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          background: 'rgba(253, 103, 48, 0.05)',
                          borderLeft: '3px solid var(--primary)',
                          marginTop: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <MessageSquare size={13} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                            Support Desk Reply
                          </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                          {t.adminResponse}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: FAQs */}
        {activeTab === 'faqs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '720px' }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{ borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}
              >
                <div
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: 'var(--text-secondary)' }}
                  />
                </div>
                {openFaq === idx && (
                  <div style={{ padding: '0 18px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HelpSupportPage;
