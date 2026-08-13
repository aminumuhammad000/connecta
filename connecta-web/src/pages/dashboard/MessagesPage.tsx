import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { MessageSquare, Send, Loader2, Video } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { messageAPI } from '../../services/api';
import { ScreeningCallModal } from '../../components/modals/ScreeningCallModal';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);

  const targetUserId = searchParams.get('user') || searchParams.get('recipientId');

  useEffect(() => {
    fetchConversations();
  }, [targetUserId, user?._id]);

  const isTargetUserInConv = (c: any, targetId: string) => {
    if (!c || !targetId) return false;
    const tid = targetId.toString();

    const extractId = (val: any): string | null => {
      if (!val) return null;
      if (typeof val === 'string') return val;
      if (typeof val === 'object') {
        const id = val._id || val.id;
        return id ? id.toString() : null;
      }
      return null;
    };

    if (Array.isArray(c.participants) && c.participants.some((p: any) => extractId(p) === tid)) {
      return true;
    }
    if (extractId(c.freelancerId) === tid) return true;
    if (extractId(c.clientId) === tid) return true;

    return false;
  };

  const fetchConversations = async () => {
    setLoading(true);

    try {
      const res = await messageAPI.getConversations();
      let list = res.success && Array.isArray(res.data) ? res.data : [];

      if (targetUserId && user?._id) {
        let found = list.find((c: any) => isTargetUserInConv(c, targetUserId));

        if (!found) {
          try {
            const createRes = await messageAPI.getOrCreateConversation({
              participants: [user._id, targetUserId]
            });
            if (createRes.success && createRes.data) {
              found = createRes.data;
              const exists = list.some((item: any) => item._id === found._id);
              if (!exists) {
                list = [found, ...list];
              }
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

    const sendText = textInput;
    setTextInput('');

    const optimisticMsg = {
      _id: Date.now().toString(),
      senderId: user?._id || (user as any)?.id,
      sender: user,
      text: sendText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await messageAPI.sendMessage(activeConv._id, sendText);
      if (res?.success) {
        // Refresh message thread from DB
        const msgRes = await messageAPI.getMessages(activeConv._id);
        if (msgRes.success && Array.isArray(msgRes.data)) {
          setMessages(msgRes.data);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const getOtherParticipantDetails = (conv: any) => {
    if (!conv) return { name: 'Chat Participant', avatar: null, role: 'Connecta Member' };

    const myId = (user?._id || (user as any)?.id || '').toString();

    if (Array.isArray(conv.participants) && conv.participants.length > 0) {
      const other = conv.participants.find((p: any) => {
        const pid = typeof p === 'object' ? (p._id || p.id)?.toString() : p?.toString();
        return pid && pid !== myId;
      });
      if (other && typeof other === 'object') {
        const name = `${other.firstName || ''} ${other.lastName || ''}`.trim() || other.name || other.email?.split('@')[0] || 'Connecta Member';
        const role = other.jobTitle || (other.userType === 'client' ? 'Product Client' : 'Freelancer');
        const avatar = other.profileImage || other.avatar || null;
        return { name, avatar, role };
      }
    }

    if (conv.clientId && typeof conv.clientId === 'object') {
      const cid = (conv.clientId._id || conv.clientId.id)?.toString();
      if (cid && cid !== myId) {
        const name = `${conv.clientId.firstName || ''} ${conv.clientId.lastName || ''}`.trim() || conv.clientId.name || 'Client';
        return { name, avatar: conv.clientId.profileImage || conv.clientId.avatar || null, role: conv.clientId.jobTitle || 'Product Client' };
      }
    }

    if (conv.freelancerId && typeof conv.freelancerId === 'object') {
      const fid = (conv.freelancerId._id || conv.freelancerId.id)?.toString();
      if (fid && fid !== myId) {
        const name = `${conv.freelancerId.firstName || ''} ${conv.freelancerId.lastName || ''}`.trim() || conv.freelancerId.name || 'Freelancer';
        return { name, avatar: conv.freelancerId.profileImage || conv.freelancerId.avatar || null, role: conv.freelancerId.jobTitle || 'Freelancer' };
      }
    }

    return {
      name: conv.participantName || 'Connecta Member',
      avatar: conv.participantAvatar || null,
      role: conv.participantRole || 'Connecta Member'
    };
  };

  const activeOther = getOtherParticipantDetails(activeConv);

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
                const other = getOtherParticipantDetails(c);
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
                    {other.avatar ? (
                      <img src={other.avatar} alt={other.name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--grad-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                        {other.name[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {other.name}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.lastMessage || other.role}
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
                  {activeOther.avatar ? (
                    <img src={activeOther.avatar} alt={activeOther.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--grad-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>
                      {activeOther.name[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{activeOther.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{activeOther.role}</span> • <span style={{ color: 'var(--success)', fontWeight: 600 }}>Online</span>
                    </div>
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
                  const senderObj = m.sender || m.senderId;
                  const senderId = typeof senderObj === 'object' ? (senderObj?._id || (senderObj as any)?.id) : senderObj;
                  const currentUserId = user?._id || (user as any)?.id;
                  const isMe = senderId && currentUserId ? senderId.toString() === currentUserId.toString() : false;
                  const msgContent = m.text || m.content || '';
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
                      {msgContent}
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
          participantName={activeOther.name}
          participantRole={activeOther.role}
        />
      )}
    </DashboardLayout>
  );
};
