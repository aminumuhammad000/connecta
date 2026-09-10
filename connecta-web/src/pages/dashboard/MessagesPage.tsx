import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { MessageSquare, Send, Loader2, ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { messageAPI } from '../../services/api';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://api.myconnecta.ng';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const targetUserId = searchParams.get('user') || searchParams.get('recipientId');

  // Socket.io Real-Time Connection
  useEffect(() => {
    const myId = user?._id || (user as any)?.id;
    if (!myId) return;

    const socket: Socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      query: { userId: myId }
    });

    socket.on('connect', () => {
      if (activeConv?._id) {
        socket.emit('join_conversation', activeConv._id);
      }
    });

    socket.on('new_message', (msg: any) => {
      if (activeConv?._id && (msg.conversationId === activeConv._id || msg.conversation === activeConv._id)) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          return exists ? prev : [...prev, msg];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id, activeConv?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      if (list.length > 0 && window.innerWidth > 768) {
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
    setShowMobileChat(true);
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

  const filteredConversations = conversations.filter((c) => {
    const other = getOtherParticipantDetails(c);
    const query = searchQuery.toLowerCase();
    return (
      other.name.toLowerCase().includes(query) ||
      (c.lastMessage || '').toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout>
      <div className="messages-page-wrapper" style={{ maxWidth: '1100px', margin: '0 auto', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className={`messages-header-top ${showMobileChat ? 'mobile-hide-header-in-chat' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
              Messages
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Direct communications with clients & collaborators.
            </p>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="messages-workspace-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', flex: 1, minHeight: 0 }}>
          {/* Left Panel: Conversations List */}
          <div
            className={`conversations-panel ${showMobileChat ? 'hide-mobile' : ''}`}
            style={{
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Conversations ({conversations.length})</span>
            </div>

            {/* Quick Search Bar */}
            {conversations.length > 0 && (
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '34px', width: '100%', borderRadius: '10px', fontSize: '0.8rem', height: '36px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>
            )}

            {loading ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Loader2 size={18} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.8rem' }}>Loading chats...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No active messages.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px', overflowY: 'auto' }}>
                {filteredConversations.map((c) => {
                  const isSelected = activeConv?._id === c._id;
                  const other = getOtherParticipantDetails(c);
                  return (
                    <div
                      key={c._id}
                      onClick={() => selectConversation(c)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(253,103,48,0.08)' : 'transparent',
                        border: isSelected ? '1px solid rgba(253,103,48,0.25)' : '1px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {other.avatar ? (
                        <img src={other.avatar} alt={other.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.88rem', flexShrink: 0 }}>
                          {other.name[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: isSelected ? 700 : 600, fontSize: '0.86rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {other.name}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                          {c.lastMessage || other.role}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Panel: Chat Thread */}
          <div
            className={`chat-thread-panel ${!showMobileChat ? 'hide-mobile' : ''}`}
            style={{
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {activeConv ? (
              <>
                {/* Minimal Header */}
                <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="mobile-back-btn"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginRight: '4px',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 600
                      }}
                      title="Back to conversations"
                    >
                      <ArrowLeft size={16} /> Chats
                    </button>
                    {activeOther.avatar ? (
                      <img src={activeOther.avatar} alt={activeOther.name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.88rem' }}>
                        {activeOther.name[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>{activeOther.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {activeOther.role} • <span style={{ color: 'var(--success)', fontWeight: 600 }}>Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thread Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                          maxWidth: '82%',
                          padding: '10px 14px',
                          borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: isMe ? 'var(--primary)' : 'var(--bg-secondary)',
                          color: isMe ? '#fff' : 'var(--text-primary)',
                          border: isMe ? 'none' : '1px solid var(--border-color)',
                          fontSize: '0.85rem',
                          lineHeight: 1.45,
                          boxShadow: isMe ? '0 2px 8px rgba(253,103,48,0.2)' : 'none'
                        }}
                      >
                        {msgContent}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Minimalist Input Bar */}
                <form onSubmit={handleSendMessage} className="chat-thread-input-bar" style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', background: 'var(--card-bg)' }}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="input-field"
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem', height: '42px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  />
                  <button type="submit" className="btn-primary" style={{ height: '42px', padding: '0 18px', borderRadius: '12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                    <Send size={15} /> Send
                  </button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>
                <MessageSquare size={36} style={{ marginBottom: '12px', opacity: 0.4, color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>Select a conversation</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Choose a chat from the left list to start messaging.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MessagesPage;
