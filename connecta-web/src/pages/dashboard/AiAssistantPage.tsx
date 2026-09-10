import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Loader2, RotateCcw, ShieldCheck, Sparkles, SquarePen, Copy, Check, ArrowUp, Briefcase, DollarSign, FileText, Lock, ArrowRight, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { aiAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface JobItem {
  id: string;
  title: string;
  category: string;
  budget: string;
  type: string;
  skills: string[];
  matchScore?: string;
  description?: string;
}

interface TipCard {
  id: string;
  step: string;
  title: string;
  bullets: string[];
}

interface SubmittedProposal {
  id: string;
  jobTitle: string;
  budget: number;
  status: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  jobs?: JobItem[];
  tipCards?: TipCard[];
  submittedProposal?: SubmittedProposal;
  timestamp: string;
}

const getSmartResponse = (promptText: string, currentUser: any, isClientRole: boolean): { text: string; jobs?: JobItem[]; tipCards?: TipCard[] } => {
  const lower = promptText.trim().toLowerCase();
  const firstName = currentUser?.firstName || 'User';
  const company = currentUser?.companyName || 'your organization';
  const title = currentUser?.title || 'Tech Specialist';

  if (
    lower === 'hey' || lower === 'hello' || lower === 'hi' ||
    lower.startsWith('hey') || lower.startsWith('hello') || lower.startsWith('hi')
  ) {
    if (isClientRole) {
      return {
        text: `Hello ${firstName}! Welcome to Connecta AI.\n\nI have your account loaded as a Client (${company}). Here is how I can assist your hiring today:`,
        tipCards: [
          { id: 'tip-1', step: '01', title: 'Draft Job Descriptions', bullets: ['Generate detailed project scopes & milestones', 'Define clear requirements & deliverables'] },
          { id: 'tip-2', step: '02', title: 'Budget Estimations', bullets: ['Benchmark pricing for tech talent', 'Compare fixed vs milestone contracts'] },
          { id: 'tip-3', step: '03', title: 'Screen Proposals', bullets: ['Evaluate freelancer bids & verified badges', 'Shortlist top matched talent'] }
        ]
      };
    }
    return {
      text: `Hello ${firstName}! Welcome to Connecta AI.\n\nI have your profile loaded as a ${title}. Here are personalized recommendations to boost your earnings on Connecta:`,
      tipCards: [
        { id: 'tip-1', step: '01', title: 'Update Your Profile', bullets: ['Highlight key skills: Python, JavaScript, PHP, Dart, SQL', 'Showcase expertise in AI and LLM projects prominently'] },
        { id: 'tip-2', step: '02', title: 'Search Filters', bullets: ['Filter job listings by high-budget payment range', 'Target Top Rated and verified client contracts'] },
        { id: 'tip-3', step: '03', title: 'Job Categories', bullets: ['AI & ML: Focus on data annotation and evaluation', 'Software Dev: High demand web & mobile opportunities'] },
        { id: 'tip-4', step: '04', title: 'Proposal Pitches', bullets: ['Craft tailored proposals highlighting your value', 'Emphasize verified experience & Escrow milestone safety'] }
      ]
    };
  }

  if (lower.includes('job') || lower.includes('role') || lower.includes('match') || lower.includes('find') || lower.includes('work') || lower.includes('annotation') || lower.includes('engineer') || lower.includes('developer')) {
    return {
      text: `Based on your profile as an AI Data Annotation & LLM Specialist and Software Engineer, here are top project matches currently active on Connecta:`,
      jobs: [
        {
          id: 'job-1',
          title: 'AI Data Annotation & LLM Evaluation Specialist',
          category: 'AI & Data Science',
          budget: '₦450,000 ($450 USD)',
          type: 'Fixed Price',
          skills: ['Python', 'LLM Evaluation', 'Data Labeling', 'RLHF'],
          matchScore: '98% Match',
          description: 'Label and evaluate dataset responses for training large language models.'
        },
        {
          id: 'job-2',
          title: 'Full Stack Developer (React, Next.js & Laravel)',
          category: 'Web Development',
          budget: '₦750,000 ($750 USD)',
          type: 'Milestone Contract',
          skills: ['React', 'Next.js', 'PHP', 'Laravel', 'MySQL'],
          matchScore: '95% Match',
          description: 'Build responsive frontend interfaces and integrate robust PHP Laravel backend services.'
        },
        {
          id: 'job-3',
          title: 'Mobile App Developer (Flutter & Firebase)',
          category: 'Mobile Development',
          budget: '₦600,000 ($600 USD)',
          type: 'Fixed Price',
          skills: ['Flutter', 'Dart', 'Firebase', 'REST APIs'],
          matchScore: '92% Match',
          description: 'Cross-platform mobile application development for Android and iOS using Flutter.'
        },
        {
          id: 'job-4',
          title: 'Backend API Developer (REST APIs & MySQL)',
          category: 'Backend Engineering',
          budget: '₦350,000 / mo',
          type: 'Monthly Retainer',
          skills: ['PHP', 'Laravel', 'REST API', 'MySQL', 'SQLite'],
          matchScore: '90% Match',
          description: 'Design and manage high-performance RESTful API endpoints and database schemas.'
        }
      ]
    };
  }

  if (lower.includes('proposal') || lower.includes('pitch') || lower.includes('cover')) {
    return {
      text: `Here is a high-converting proposal pitch template for your profile (${title}):\n\n"Hi there! I reviewed your project requirements and am confident in delivering top quality. With ${currentUser?.yearsOfExperience || 3}+ years of experience, I ensure clean architecture, transparent milestone updates, and full compliance with Connecta Escrow milestone protection.\n\nLet's connect to discuss your project scope and kick off milestone 1!"`
    };
  }

  if (lower.includes('budget') || lower.includes('price') || lower.includes('cost') || lower.includes('rate')) {
    return {
      text: `Connecta Marketplace Pricing Benchmarks:\n\n• Full Stack / Mobile App: ₦350,000 – ₦1,200,000 ($400 – $1,500 USD)\n• UI/UX & Branding: ₦150,000 – ₦450,000 ($150 – $500 USD)\n• Monthly Retainer: ₦250,000 – ₦700,000 / mo\n\nAlways lock milestone funds in Connecta Escrow prior to starting work.`
    };
  }

  return {
    text: `Hello ${firstName}! As your Connecta AI Copilot, here are actionable steps for "${promptText}":`,
    tipCards: [
      { id: 'tip-1', step: '01', title: 'Update Your Profile', bullets: ['Highlight key skills: Python, JavaScript, PHP, Dart, SQL', 'Showcase expertise in AI and LLM projects prominently'] },
      { id: 'tip-2', step: '02', title: 'Search Filters', bullets: ['Filter job listings by payment range', 'Look for jobs categorized as High Budget or Top Rated'] },
      { id: 'tip-3', step: '03', title: 'Job Categories', bullets: ['AI & ML: Data annotation and evaluation roles', 'Software Dev: Web & mobile app development'] },
      { id: 'tip-4', step: '04', title: 'Networking & Pitches', bullets: ['Connect with active clients for high-paying contracts', 'Craft tailored proposals highlighting your verified value'] }
    ]
  };
};

export const AiAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isClient = user?.userType === 'client';

  const storageKey = `connecta_ai_chat_${user?.id || 'guest'}`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (err) {
        console.warn('Failed to persist chat messages:', err);
      }
    }
  }, [messages, loading, storageKey]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewChat = () => {
    setMessages([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
  };

  const promptCards = isClient
    ? [
        { title: 'Screen candidate bids', desc: 'Rank freelancer proposals by match score' },
        { title: 'Draft a job description', desc: 'Create detailed project scopes & milestones' },
        { title: 'Estimate project budget', desc: 'Benchmark pricing for tech talent' },
        { title: 'Escrow protection', desc: 'Learn how Connecta protects client funds' },
      ]
    : [
        { title: 'Find top-paying jobs', desc: 'Discover live matching jobs on Connecta' },
        { title: 'Write a proposal pitch', desc: 'Craft a high-converting cover letter' },
        { title: 'Pricing & rate advice', desc: 'Benchmark hourly & milestone rates' },
        { title: 'Escrow milestone breakdown', desc: 'Generate 3-stage contract delivery plan' },
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
      const replyData = res?.data?.data || res?.data || res;
      const replyText = replyData?.reply;
      const apiJobs = replyData?.jobs;
      const apiProposal = replyData?.submittedProposal;

      if (replyText && typeof replyText === 'string') {
        if (apiProposal) {
          showToast(`Proposal for ${apiProposal.jobTitle} submitted!`, 'success');
        }

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: replyText,
          jobs: Array.isArray(apiJobs) && apiJobs.length > 0 ? apiJobs : undefined,
          submittedProposal: apiProposal || undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error('AI chat API notice:', err);
    }

    const fallback = getSmartResponse(messageText, user, isClient);
    const fallbackMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: fallback.text,
      jobs: fallback.jobs,
      tipCards: fallback.tipCards,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, fallbackMsg]);
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', maxWidth: '860px', margin: '0 auto', overflow: 'hidden' }}>
        
        {/* Minimalist Header Bar */}
        <div style={{
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0,
        }}>
          {/* Model / Brand Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '100px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            <Sparkles size={15} color="var(--primary)" />
            <span>Connecta AI</span>
          </div>

          <button
            onClick={handleNewChat}
            title="Start new chat"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '6px 14px',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <SquarePen size={15} /> New Chat
          </button>
        </div>

        {/* Chat Body Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column' }}>
          
          {/* Empty / Welcome State (ChatGPT style) */}
          {messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px 0' }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'rgba(253, 103, 48, 0.1)', border: '1px solid rgba(253, 103, 48, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px', color: 'var(--primary)',
                }}
              >
                <Sparkles size={26} />
              </motion.div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                What can I help with today?
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0 0 32px', maxWidth: '420px' }}>
                Ask me to write job scopes, draft proposal pitches, or estimate project pricing for your Connecta workflow.
              </p>

              {/* 2x2 Suggestion Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', width: '100%', maxWidth: '640px' }}>
                {promptCards.map((card, idx) => {
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -2, borderColor: 'var(--primary)' }}
                      onClick={() => handleSend(card.title)}
                      style={{
                        padding: '16px 18px',
                        borderRadius: '16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {card.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {card.desc}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Active Message Stream */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '780px', margin: '0 auto' }}>
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      width: '100%',
                    }}
                  >
                    {/* User Bubble vs AI Stream */}
                    {msg.sender === 'user' ? (
                      <div style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        padding: '12px 18px',
                        borderRadius: '20px 20px 4px 20px',
                        border: '1px solid var(--border-color)',
                        maxWidth: '80%',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                      }}>
                        {msg.text}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '14px', width: '100%', maxWidth: '100%' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: 'rgba(253, 103, 48, 0.1)', border: '1px solid rgba(253, 103, 48, 0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, color: 'var(--primary)', marginTop: '2px',
                        }}>
                          <Sparkles size={16} />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{
                            color: 'var(--text-primary)',
                            fontSize: '0.92rem',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                          }}>
                            {msg.text.replace(/###\s*/g, '').replace(/\*\*/g, '')}
                          </div>

                          {/* Animated Minimalist Job Cards Grid */}
                          {msg.jobs && msg.jobs.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginTop: '14px' }}>
                              {msg.jobs.map((job) => (
                                <motion.div
                                  key={job.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  whileHover={{ y: -3, borderColor: 'var(--primary)' }}
                                  style={{
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justify: 'space-between',
                                    gap: '12px',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                                  }}
                                >
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(253,103,48,0.08)', padding: '2px 8px', borderRadius: '100px', border: '1px solid rgba(253,103,48,0.2)' }}>
                                        {job.category}
                                      </span>
                                      {job.matchScore && (
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                          <CheckCircle2 size={12} /> {job.matchScore}
                                        </span>
                                      )}
                                    </div>

                                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.35 }}>
                                      {job.title}
                                    </h4>

                                    {job.description && (
                                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.4 }}>
                                        {job.description}
                                      </p>
                                    )}

                                    {/* Skill tags */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                                      {job.skills.map((s, idx) => (
                                        <span key={idx} style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '2px 7px', borderRadius: '6px' }}>
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px', gap: '8px' }}>
                                    <div>
                                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Budget</span>
                                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>{job.budget}</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <motion.button
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => handleSend(`Generate pitch proposal for ${job.title}`)}
                                        style={{
                                          fontSize: '0.72rem', fontWeight: 600, padding: '5px 9px', borderRadius: '8px',
                                          background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                                          color: 'var(--text-primary)', cursor: 'pointer'
                                        }}
                                      >
                                        Pitch
                                      </motion.button>

                                      <motion.button
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => {
                                          showToast(`Opening ${job.title}`, 'info');
                                          navigate('/jobs');
                                        }}
                                        className="btn-primary"
                                        style={{
                                          fontSize: '0.75rem', fontWeight: 700, padding: '5px 12px', borderRadius: '8px',
                                          display: 'flex', alignItems: 'center', gap: '4px'
                                        }}
                                      >
                                        <span>Apply</span> <ArrowRight size={13} />
                                      </motion.button>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                          {/* Animated Minimalist Tip Cards Grid */}
                          {msg.tipCards && msg.tipCards.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '14px' }}>
                              {msg.tipCards.map((tip, idx) => (
                                <motion.div
                                  key={tip.id || idx}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  whileHover={{ y: -3, borderColor: 'var(--primary)' }}
                                  style={{
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                                      STEP {tip.step}
                                    </span>
                                  </div>

                                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                    {tip.title}
                                  </h4>

                                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                                    {tip.bullets.map((b, bIdx) => (
                                      <li key={bIdx} style={{ marginBottom: '4px' }}>{b}</li>
                                    ))}
                                  </ul>
                                </motion.div>
                              ))}
                            </div>
                          )}
                          {/* Submitted Proposal Success Card */}
                          {msg.submittedProposal && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              style={{
                                marginTop: '14px',
                                padding: '16px',
                                borderRadius: '16px',
                                background: 'rgba(16, 185, 129, 0.06)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                              }}
                            >
                              <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: 'rgba(16, 185, 129, 0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#10b981', flexShrink: 0
                              }}>
                                <CheckCircle2 size={22} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                                  Proposal Submitted Successfully!
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                  Position: {msg.submittedProposal.jobTitle} • Escrow Protected
                                </div>
                              </div>
                              <button
                                onClick={() => navigate('/proposals')}
                                className="btn-primary"
                                style={{ fontSize: '0.74rem', padding: '6px 12px', borderRadius: '8px' }}
                              >
                                View Proposal
                              </button>
                            </motion.div>
                          )}

                          {/* Action Bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                            <button
                              onClick={() => handleCopy(msg.text, msg.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 4px',
                                borderRadius: '4px',
                              }}
                            >
                              {copiedId === msg.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                              <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading Indicator */}
              {loading && (
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(253, 103, 48, 0.1)', border: '1px solid rgba(253, 103, 48, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: 'var(--primary)',
                  }}>
                    <Sparkles size={16} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Loader2 size={15} className="animate-spin" color="var(--primary)" />
                    <span>Connecta AI is thinking…</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ChatGPT Style Floating Input Box */}
        <div style={{ padding: '12px 16px 16px', maxWidth: '780px', width: '100%', margin: '0 auto', flexShrink: 0, background: 'var(--bg-primary)' }}>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px 8px 18px',
              borderRadius: '26px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              transition: 'border-color 0.2s ease',
            }}
          >
            <input
              type="text"
              placeholder="Message Connecta AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '0.92rem',
                fontWeight: 500,
              }}
            />

            <motion.button
              whileHover={{ scale: input.trim() ? 1.05 : 1 }}
              whileTap={{ scale: input.trim() ? 0.95 : 1 }}
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: input.trim() ? 'var(--primary)' : 'var(--bg-tertiary)',
                color: input.trim() ? '#fff' : 'var(--text-muted)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              <ArrowUp size={18} />
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', margin: '8px 0 0' }}>
            Connecta AI can make mistakes. Verify important project and financial details.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AiAssistantPage;
