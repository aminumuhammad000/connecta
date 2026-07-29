import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Send, User, Loader2, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your Connecta AI Assistant. I can help you draft job postings, refine proposal cover letters, analyze project budgets, or match skills with open opportunities. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    '💡 Help me draft a clear project description',
    '📝 Write a high-converting freelancer proposal',
    '💰 Benchmark estimated budget for mobile app development',
    '⚡ Find top recommended tech skills for AI projects',
  ];

  const handleSend = (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    setTimeout(() => {
      let responseText = 'I am analyzing your query with Connecta AI...';
      const query = messageText.toLowerCase();

      if (query.includes('proposal') || query.includes('cover letter')) {
        responseText = 'Here is a tailored proposal pitch template:\n\n"Hi there! I reviewed your project requirements and have 4+ years of experience delivering scalable web & mobile solutions. I can implement clean architecture, secure Paystack escrow integrations, and automated testing within your timeline."';
      } else if (query.includes('draft') || query.includes('project') || query.includes('job')) {
        responseText = 'To craft an effective job post, include:\n1. Clear project scope & deliverables\n2. Required tech stack (React, Node.js, Mongoose)\n3. Milestone budget allocation\n4. Expected delivery timeline.';
      } else if (query.includes('budget')) {
        responseText = 'Based on current Connecta marketplace data, modern full-stack web applications range between ₦300,000 and ₦800,000 depending on real-time features and database scale.';
      } else {
        responseText = `I have processed your prompt regarding "${messageText}". Let me know if you would like step-by-step guidance or code snippets for your implementation!`;
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
            <Sparkles size={13} /> Powered by Connecta AI
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            AI Assistant & Project Copilot
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
            Generate job scopes, craft winning proposals, and optimize milestone pricing instantly.
          </p>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: '10px', padding: '8px 14px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} /> Clear Chat
        </button>
      </div>

      {/* Main Chat Container */}
      <div className="glass-card ai-chat-container" style={{ height: 'calc(100vh - 270px)', minHeight: '480px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Messages Stream */}
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
                maxWidth: '80%',
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
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {msg.text}
                </p>
                <span style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '6px', display: 'block', textAlign: 'right' }}>
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
              <div style={{ background: 'var(--bg-secondary)', padding: '12px 18px', borderRadius: '4px 20px 20px 20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Loader2 size={16} className="animate-spin" /> Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div style={{ padding: '8px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
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

        {/* Input Box */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: '16px 24px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Ask AI Copilot to generate job scopes, proposals, or budget estimations..."
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
            style={{ padding: '12px 20px', borderRadius: '12px', fontWeight: 700 }}
          >
            <Send size={16} /> Send
          </motion.button>
        </form>

      </div>
    </DashboardLayout>
  );
};
