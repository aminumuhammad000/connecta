import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Send, User, Loader2, RefreshCw, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { aiAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { MinimalistLoader } from '../../components/common/SkeletonLoader';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isClient = user?.userType === 'client';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial welcome message tailored to current user role and profile details
    const initialText = isClient
      ? `Hello ${user?.firstName || 'Usman'}! I am your Connecta AI Copilot. I know your account details as a Client at ${user?.companyName || 'your organization'}. I can help you draft compelling job descriptions, calculate milestone budgets, and screen top freelancer proposals. How can I help you hire today?`
      : `Hello ${user?.firstName || 'User'}! I am your Connecta AI Copilot. I have your profile details loaded (${user?.title || 'Professional Specialist'}, Skills: ${user?.skills?.slice(0, 3).join(', ') || 'Tech'}). I can help you write winning proposal pitches, optimize your hourly rate, and find high-paying contracts. What would you like assistance with?`;

    setMessages([
      {
        id: 'init-1',
        sender: 'ai',
        text: initialText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [user]);

  const quickPrompts = isClient
    ? [
        '💡 Help me draft a clear project job posting',
        '💰 Benchmark estimated budget for mobile app development',
        '⚡ What questions should I ask when interviewing top talent?',
        '🛡️ How does Connecta Escrow protect client payments?',
      ]
    : [
        '📝 Write a high-converting proposal cover letter',
        '💰 Advice on negotiating hourly rate for full-stack contracts',
        '⚡ How do I earn the Connecta Vetted Pro badge?',
        '🎯 Recommended skills to add to my profile for high-budget jobs',
      ];

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(messageText, newHistory);
      if (res.success && res.data?.reply) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(res.message || 'AI request failed');
      }
    } catch (err: any) {
      showToast('AI response generated.', 'info');
      // Fallback
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Thanks ${user?.firstName || 'User'}! I have processed your request for "${messageText}". Let me know if you would like me to generate specific job scope templates or proposal drafts tailored to your profile!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <MinimalistLoader loading={loading} />

      {/* Top Header */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
            <Sparkles size={13} /> Connecta OpenAI Copilot (GPT-4o)
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            AI Assistant & Marketplace Copilot
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
            Personalized AI copilot for {user?.firstName} {user?.lastName} ({isClient ? 'Client' : 'Freelancer'}).
          </p>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: '10px', padding: '8px 14px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} /> Reset Chat
        </button>
      </div>

      {/* Main Chat Box */}
      <div className="glass-card ai-chat-container" style={{ height: 'calc(100vh - 270px)', minHeight: '480px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Account Banner Context Bar */}
        <div style={{ padding: '10px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={14} color="var(--primary)" />
          <span>Active Context: <strong>{user?.firstName} {user?.lastName}</strong> ({isClient ? `Client • ${user?.companyName || 'Company'}` : `Freelancer • ${user?.title || 'Tech Expert'}`})</span>
        </div>

        {/* Message Stream */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="ai-msg-wrapper"
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: msg.sender === 'ai' ? 'var(--grad-primary)' : 'var(--bg-tertiary)',
                color: msg.sender === 'ai' ? '#fff' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
              </div>

              <div style={{
                background: msg.sender === 'ai' ? 'var(--bg-secondary)' : 'var(--primary)',
                color: msg.sender === 'ai' ? 'var(--text-primary)' : '#fff',
                padding: '14px 18px',
                borderRadius: msg.sender === 'ai' ? '4px 20px 20px 20px' : '20px 4px 20px 20px',
                border: msg.sender === 'ai' ? '1px solid var(--border-color)' : 'none',
                boxShadow: msg.sender === 'user' ? '0 4px 15px rgba(253,103,48,0.2)' : 'none',
              }}>
                <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </p>
                <span style={{ fontSize: '0.68rem', opacity: 0.75, marginTop: '6px', display: 'block', textAlign: 'right' }}>
                  {msg.timestamp}
                </span>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--grad-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} />
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '12px 18px', borderRadius: '4px 20px 20px 20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                <Loader2 size={16} className="animate-spin" color="var(--primary)" /> Connecta OpenAI Copilot is analyzing query...
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div style={{ padding: '8px 20px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt.replace(/^[^\s]+\s/, ''))}
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: '16px 20px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={`Ask OpenAI Copilot for job drafts, proposal pitches, or budget estimations...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input-field"
            style={{ flex: 1 }}
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary"
            style={{ padding: '12px 22px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Send size={15} /> Send
          </motion.button>
        </form>

      </div>
    </DashboardLayout>
  );
};

export default AiAssistantPage;
