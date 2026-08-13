import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Send, User, Loader2, RotateCcw, ShieldCheck, Zap, ArrowUpRight, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { aiAPI } from '../../services/api';
import { MinimalistLoader } from '../../components/common/SkeletonLoader';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const getSmartResponse = (promptText: string, currentUser: any, isClientRole: boolean) => {
  const lower = promptText.trim().toLowerCase();
  const firstName = currentUser?.firstName || 'User';
  const company = currentUser?.companyName || 'your organization';
  const title = currentUser?.title || 'Tech Specialist';

  if (
    lower === 'hey' || lower === 'hello' || lower === 'hi' ||
    lower.startsWith('hey') || lower.startsWith('hello') || lower.startsWith('hi')
  ) {
    if (isClientRole) {
      return `Hey ${firstName}! 👋 Welcome to your Connecta AI Copilot.

I have your account loaded as a **Client (${company})**. Here is how I can assist your hiring today:

• **Draft Job Descriptions**: Generate detailed project scopes & milestones.
• **Budget Estimations**: Benchmark pricing for tech talent and skilled trades.
• **Screen Proposals**: Evaluate incoming freelancer bids and verified badges.

What hiring goal can I assist you with right now?`;
    }
    return `Hey ${firstName}! 👋 Welcome to your Connecta AI Copilot.

I have your profile loaded as a **${title}**. Here is how I can help you succeed on Connecta:

• **Winning Proposals**: Craft high-converting pitch cover letters.
• **Rate & Pricing**: Benchmark hourly and milestone rates for your skills.
• **Vetted Badge**: Tips for verifying your profile to land high-budget contracts.

What project or pitch would you like assistance with?`;
  }

  if (lower.includes('proposal') || lower.includes('pitch') || lower.includes('cover')) {
    return `Here is a high-converting proposal pitch template for your profile (${title}):

"Hi there! I reviewed your project requirements and am confident in delivering top quality. With ${currentUser?.yearsOfExperience || 3}+ years of experience, I ensure clean architecture, transparent milestone updates, and full compliance with Connecta Escrow milestone protection.

Let's connect to discuss your project scope and kick off milestone 1!"`;
  }

  if (lower.includes('job') || lower.includes('draft') || lower.includes('post') || lower.includes('hire')) {
    return `To post a high-performing project scope on Connecta:

1. **Deliverables**: Detail core functionality and technical stack.
2. **Escrow Milestones**: Split total budget into 2–3 funded milestones.
3. **Skill Tags**: Add required skills so matched candidates get alerted instantly.`;
  }

  if (lower.includes('budget') || lower.includes('price') || lower.includes('cost') || lower.includes('rate')) {
    return `Connecta Marketplace Pricing Benchmarks:

• **Full Stack / Mobile App**: ₦350,000 – ₦1,200,000 ($400 – $1,500 USD)
• **UI/UX & Branding**: ₦150,000 – ₦450,000 ($150 – $500 USD)
• **Monthly Retainer**: ₦250,000 – ₦700,000 / mo

Always lock milestone funds in **Connecta Escrow** prior to starting work.`;
  }

  return `Hello ${firstName}! As your Connecta AI Copilot, I am here to support your workflow.

Regarding **"${promptText}"**:

• **Action Items**: You can ask me to draft job scopes, write proposal pitches, or estimate project pricing.
• **Context**: Personalized for your account as a **${isClientRole ? 'Client' : 'Freelancer'}** (${title}).

Select one of the quick prompts below or ask any question!`;
};

export const AiAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const isClient = user?.userType === 'client';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const welcome = isClient
      ? `Hello ${user?.firstName || 'Client'}! I am your Connecta AI Copilot. I have your account loaded as a Client at ${user?.companyName || 'your organization'}. Ask me to draft job postings, benchmark budgets, or screen candidate bids.`
      : `Hello ${user?.firstName || 'Freelancer'}! I am your Connecta AI Copilot. I have your profile loaded (${user?.title || 'Professional Specialist'}). Ask me to write winning proposal pitches, optimize your rates, or find high-paying jobs.`;

    setMessages([
      {
        id: 'init-1',
        sender: 'ai',
        text: welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [user]);

  const quickPrompts = isClient
    ? [
        '💡 Draft a clear project job posting',
        '💰 Benchmark mobile app budget',
        '⚡ Screening questions for talent interviews',
        '🛡️ How Connecta Escrow protects client funds',
      ]
    : [
        '📝 Write a high-converting proposal pitch',
        '💰 Hourly rate & milestone pricing advice',
        '⚡ How to earn Connecta Vetted Pro badge',
        '🎯 High-demand skills for my profile',
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
      const replyText = res?.data?.reply || (res as any)?.reply || (res as any)?.data?.data?.reply;
      
      if (replyText && typeof replyText === 'string') {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error('AI chat API notice:', err);
    }

    // Smart context-aware response generator
    const fallbackText = getSmartResponse(messageText, user, isClient);
    const fallbackMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: fallbackText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, fallbackMsg]);
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <MinimalistLoader loading={loading} />

      {/* Minimalist Header */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(253,103,48,0.08)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', border: '1px solid rgba(253,103,48,0.2)' }}>
            <Zap size={13} color="var(--primary)" /> Connecta OpenAI Copilot
          </div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            AI Assistant & Project Copilot
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Generate job scopes, craft winning proposals, and optimize milestone pricing instantly.
          </p>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '8px 14px',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <RotateCcw size={14} /> Clear Chat
        </button>
      </div>

      {/* Minimalist Glass Container */}
      <div
        className="glass-card"
        style={{
          height: 'calc(100vh - 260px)',
          minHeight: '480px',
          borderRadius: '22px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--card-bg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Context Status Header */}
        <div style={{ padding: '10px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={14} color="var(--primary)" />
            <span>Active Account: <strong style={{ color: 'var(--text-primary)' }}>{user?.firstName} {user?.lastName}</strong> ({isClient ? `Client • ${user?.companyName || 'Company'}` : `Freelancer • ${user?.title || 'Specialist'}`})</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} /> Live Copilot Online
          </span>
        </div>

        {/* Message History Stream */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: msg.sender === 'ai' ? 'var(--grad-primary)' : 'var(--bg-tertiary)',
                  color: msg.sender === 'ai' ? '#fff' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: msg.sender === 'ai' ? '0 4px 12px rgba(253,103,48,0.25)' : 'none',
                }}>
                  {msg.sender === 'ai' ? <Bot size={17} /> : <User size={17} />}
                </div>

                <div style={{
                  background: msg.sender === 'ai' ? 'var(--bg-secondary)' : 'var(--primary)',
                  color: msg.sender === 'ai' ? 'var(--text-primary)' : '#fff',
                  padding: '14px 18px',
                  borderRadius: msg.sender === 'ai' ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                  border: msg.sender === 'ai' ? '1px solid var(--border-color)' : 'none',
                  boxShadow: msg.sender === 'user' ? '0 4px 15px rgba(253,103,48,0.2)' : 'none',
                }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </p>
                  <span style={{ fontSize: '0.66rem', opacity: 0.7, marginTop: '6px', display: 'block', textAlign: 'right' }}>
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--grad-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={17} />
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '12px 18px', borderRadius: '4px 18px 18px 18px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <Loader2 size={15} className="animate-spin" color="var(--primary)" /> Connecta Copilot is analyzing query...
              </div>
            </div>
          )}
        </div>

        {/* Minimalist Quick Prompt Chips */}
        <div style={{ padding: '8px 20px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt.replace(/^[^\s]+\s/, ''))}
              style={{
                fontSize: '0.76rem',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: '14px 20px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Ask AI Copilot for job descriptions, proposals, or pricing advice..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input-field"
            style={{ flex: 1, borderRadius: '14px' }}
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary"
            style={{ padding: '12px 20px', borderRadius: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem' }}
          >
            <Send size={15} /> Send
          </motion.button>
        </form>

      </div>
    </DashboardLayout>
  );
};

export default AiAssistantPage;
