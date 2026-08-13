import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { MessageSquare, Send, Loader2, Video } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { messageAPI } from '../../services/api';
import { ScreeningCallModal } from '../../components/modals/ScreeningCallModal';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    const targetUserId = params.get('user') || params.get('recipientId');

    try {
      const res = await messageAPI.getConversations();
      let list = res.success && Array.isArray(res.data) ? res.data : [];

      if (targetUserId && user?._id) {
        let found = list.find((c: any) => {
          const parts = c.participants || [];
          return parts.some((p: any) => (p._id || p.id || p).toString() === targetUserId.toString()) ||
                 c.freelancerId?._id?.toString() === targetUserId.toString() ||
                 c.clientId?._id?.toString() === targetUserId.toString();
        });

        if (!found) {
          try {
            const createRes = await messageAPI.getOrCreateConversation({
              participants: [user._id, targetUserId]
            });
            if (createRes.success && createRes.data) {
              found = createRes.data;
              list = [found, ...list];
            }
          } catch (e) {
            console.error('Error creating conversation:', e);
          }
        }

        setConversations(list);
        if (found) {
          selectConversation(found);
          setLoading(false);
          return;
        }
      }

      setConversations(list);
      if (list.length > 0) {
        selectConversation(list[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: any) => {
    setActiveConv(conv);
    try {
      const res = await messageAPI.getMessages(conv._id);
      if (res.success && Array.isArray(res.data)) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !activeConv) return;

    const newMsg = {
      _id: Date.now().toString(),
      sender: user,
      text: textInput,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    const sendText = textInput;
    setTextInput('');

    try {
      await messageAPI.sendMessage(activeConv._id, sendText);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Messages & Client Chat
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
          Real-time messaging with clients, proposal discussions, and contract updates.
        </p>
      </div>

      <div className="messages-layout-container" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        {/* Conversations List Panel */}
        <div className="glass-card" style={{ borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px', paddingLeft: '4px' }}>
            Conversations ({conversations.length})
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={20} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              <span style={{ fontSize: '0.82rem' }}>Loading chat list...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No active conversations yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
              {conversations.map((c) => {
                const isSelected = activeConv?._id === c._id;
                return (
                  <div
                    key={c._id}
                    onClick={() => selectConversation(c)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(253,103,48,0.1)' : 'transparent',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--grad-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                      {(c.participantName || 'C')[0]}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.participantName || 'Client'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.lastMessage || 'Click to view chat'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Thread Panel */}
        <div className="glass-card" style={{ borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)' }}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div style={{ paddingBottom: '14px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--grad-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                    {(activeConv.participantName || 'C')[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{activeConv.participantName || 'Client'}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Online</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowCallModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, rgba(253, 103, 48, 0.12) 0%, rgba(229, 82, 27, 0.08) 100%)',
                    border: '1px solid rgba(253, 103, 48, 0.3)',
                    color: 'var(--primary)',
                    borderRadius: 'var(--radius-full)',
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="Start Native 1-on-1 Video Screening Call"
                >
                  <Video size={16} /> Start Screening Call
                </button>
              </div>

              {/* Messages History */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
                {messages.map((m) => {
                  const senderId = typeof m.sender === 'object' ? (m.sender?._id || (m.sender as any)?.id) : m.sender;
                  const currentUserId = user?._id || (user as any)?.id;
                  const isMe = senderId && currentUserId ? senderId.toString() === currentUserId.toString() : false;
                  return (
                    <div
                      key={m._id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        padding: '10px 16px',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMe ? 'var(--primary)' : 'var(--bg-tertiary)',
                        color: isMe ? '#fff' : 'var(--text-primary)',
                        fontSize: '0.88rem',
                        lineHeight: 1.45,
                      }}
                    >
                      {m.text}
                    </div>
                  );
                })}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="input-field"
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '12px' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '12px 20px', borderRadius: '12px' }}>
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)' }}>
              <MessageSquare size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <span>Select a conversation from the left to start messaging</span>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Native WebRTC Video Call Screening Modal */}
      {activeConv && (
        <ScreeningCallModal
          isOpen={showCallModal}
          onClose={() => setShowCallModal(false)}
          participantName={activeConv.participantName || 'Candidate'}
        />
      )}
    </DashboardLayout>
  );
};
