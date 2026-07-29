import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ChevronDown, Send } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const HelpSupportPage: React.FC = () => {
  const { showToast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const faqs = [
    {
      q: 'How does escrow payment protection work on Connecta?',
      a: 'When a client hires you for a milestone or project, their funds are deposited securely into Connecta Escrow. The funds are automatically released to your wallet upon work completion and client approval.',
    },
    {
      q: 'How do I withdraw funds to my local Nigerian bank account?',
      a: 'Navigate to "My Wallet" and click "Withdraw Funds". You can enter your verified NUBAN bank account number. Withdrawals are processed instantly via Paystack.',
    },
    {
      q: 'What is the Connecta platform service fee?',
      a: 'Connecta charges a competitive flat 5% service fee on completed contracts to maintain platform security, escrow infrastructure, and dispute resolution.',
    },
    {
      q: 'How can I get a verified badge on my freelancer profile?',
      a: 'Complete your profile bio, upload your portfolio items, and verify your phone number or ID documentation under "My Profile".',
    },
  ];

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    showToast('Support ticket submitted successfully! Our team will get back to you within 2 hours.', 'success');
    setTicketSubject('');
    setTicketMessage('');
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Help & Support Center
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
          Find answers to common questions or submit a direct ticket to the Connecta support desk.
        </p>
      </div>

      <div className="grid-responsive-2" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '28px' }}>
        {/* FAQs */}
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Frequently Asked Questions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{ borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}
              >
                <div
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                </div>
                {openFaq === idx && (
                  <div style={{ padding: '0 20px 16px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support Ticket Form */}
        <form onSubmit={handleSendTicket} className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Contact Support Desk
          </h3>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Subject</label>
            <input type="text" placeholder="e.g. Escrow milestone query" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} className="input-field" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>How can we help?</label>
            <textarea placeholder="Provide details about your query..." value={ticketMessage} onChange={(e) => setTicketMessage(e.target.value)} className="input-field" rows={4} style={{ width: '100%', lineHeight: 1.5 }} />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '12px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700, justifyContent: 'center' }}>
            Submit Ticket <Send size={16} />
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};
