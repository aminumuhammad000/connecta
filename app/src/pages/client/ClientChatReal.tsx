import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { io, Socket } from 'socket.io-client';
import styles from './ClientChat.module.css';
import ClientSidebar from './components/ClientSidebar';

interface MessageData {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  receiverId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  text: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
  }[];
  isRead: boolean;
  createdAt: string;
}

interface ConversationData {
  _id: string;
  clientId: any;
  freelancerId: any;
  projectId?: any;
  lastMessage?: string;
  lastMessageAt: string;
}

const ClientChat: React.FC = () => {
  const location = useLocation();
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [input, setInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  
  // Get user IDs from localStorage and navigation state
  const currentUserId = localStorage.getItem('userId') || '';
  const searchParams = new URLSearchParams(location.search);
  const stateData = (location.state as {
    freelancerId?: string;
    freelancerName?: string;
    projectId?: string;
    projectTitle?: string;
  }) || {};
  
  const freelancerId = stateData.freelancerId || searchParams.get('freelancerId') || '';
  const freelancerName = stateData.freelancerName || searchParams.get('freelancerName') || 'Freelancer';
  const projectId = stateData.projectId || searchParams.get('projectId') || '';
  const projectTitle = stateData.projectTitle || searchParams.get('projectTitle') || '';

  // Initialize Socket.IO
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('user:join', currentUserId);

    socketRef.current.on('message:receive', (message: MessageData) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUserId]);

  // Fetch conversations and messages on mount
  useEffect(() => {
    fetchConversations();
    fetchMessages();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/user/${currentUserId}/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Group conversations by user (keep only the most recent conversation per user)
        const conversationsByUser = new Map();
        
        data.data.forEach((conv: any) => {
          // Determine the other user (client or freelancer)
          const isClient = conv.clientId?._id === currentUserId || conv.clientId === currentUserId;
          const otherUser = isClient ? conv.freelancerId : conv.clientId;
          const otherUserId = otherUser?._id || otherUser;
          
          // Only keep the most recent conversation per user
          if (!conversationsByUser.has(otherUserId) || 
              new Date(conv.lastMessageAt) > new Date(conversationsByUser.get(otherUserId).lastMessageAt)) {
            conversationsByUser.set(otherUserId, conv);
          }
        });
        
        // Transform conversations to match UI format
        const formattedConversations = Array.from(conversationsByUser.values()).map((conv: any) => {
          const isClient = conv.clientId?._id === currentUserId || conv.clientId === currentUserId;
          const otherUser = isClient ? conv.freelancerId : conv.clientId;
          
          const firstName = otherUser?.firstName || 'User';
          const lastName = otherUser?.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim();
          
          return {
            id: conv._id,
            name: fullName,
            avatar: otherUser?.profileImage || `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=f97316&color=fff`,
            lastMsg: conv.lastMessage || 'No messages yet',
            time: formatConversationTime(conv.lastMessageAt),
            unread: conv.unreadCount?.[currentUserId] || 0,
            selected: conv._id === conversation?._id,
            rawData: conv, // Store raw data for loading
          };
        });
        
        // Sort by most recent
        formattedConversations.sort((a, b) => {
          return new Date(b.rawData.lastMessageAt).getTime() - new Date(a.rawData.lastMessageAt).getTime();
        });
        
        setConversations(formattedConversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);

      if (!currentUserId || !freelancerId || !projectId) {
        console.error('Missing required IDs');
        setLoading(false);
        return;
      }

      // Create or get conversation
      const convResponse = await fetch('http://localhost:5000/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: currentUserId,
          freelancerId: freelancerId,
          projectId: projectId,
        }),
      });

      const convData = await convResponse.json();

      if (convData.success && convData.data) {
        setConversation(convData.data);

        // Fetch messages
        const response = await fetch(
          `http://localhost:5000/api/messages/conversations/${convData.data._id}/messages`
        );
        const data = await response.json();

        if (data.success) {
          setMessages(data.data || []);
        }
        
        // Refresh conversations list to update last message
        fetchConversations();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (conv: any) => {
    try {
      setLoading(true);
      setConversation(conv);

      // Fetch messages for this conversation
      const response = await fetch(
        `http://localhost:5000/api/messages/conversations/${conv._id}/messages`
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.data || []);
      }
      
      // Close mobile drawer
      setDrawerOpen(false);
      
      // Refresh conversations to update selection
      fetchConversations();
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation) return;

    try {
      const messageData = {
        conversationId: conversation._id,
        senderId: currentUserId,
        receiverId: freelancerId,
        text: input.trim(),
        attachments: [],
      };

      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, data.data]);

        if (socketRef.current) {
          socketRef.current.emit('message:send', {
            conversationId: conversation._id,
            senderId: currentUserId,
            receiverId: freelancerId,
            message: data.data,
          });
        }

        setInput('');
        
        // Refresh conversations to update last message
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // File upload logic can be added here
    console.log('File selected:', file.name);
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatConversationTime = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today - show time
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
      return `${displayHours}:${displayMinutes} ${ampm}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      // Show day name
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      // Show date
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Get current conversation details
  const getCurrentUserInfo = () => {
    if (conversation) {
      const isClient = conversation.clientId?._id === currentUserId || conversation.clientId === currentUserId;
      const otherUser = isClient ? conversation.freelancerId : conversation.clientId;
      
      if (otherUser) {
        const firstName = otherUser.firstName || '';
        const lastName = otherUser.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const avatar = otherUser.profileImage || `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=f97316&color=fff`;
        
        return { name: fullName || freelancerName, avatar };
      }
    }
    
    // Fallback to navigation state
    return {
      name: freelancerName,
      avatar: `https://ui-avatars.com/api/?name=${freelancerName.replace(' ', '+')}&background=f97316&color=fff`
    };
  };

  const currentUserInfo = getCurrentUserInfo();

  // Responsive: show drawer on mobile, sidebar on desktop
  return (
    <div className={styles.container}>
      {/* Main navigation sidebar always visible (ClientSidebar) */}
      <ClientSidebar isOpen={false} onClose={() => {}} />
      {/* Chat conversation sidebar for desktop only */}
      <aside className={styles.sidebar + ' ' + styles.desktopOnly}>
        <div className={styles.sidebarHeader}>Messages</div>
        <input
          className={styles.searchBox}
          placeholder="Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.conversationList}>
          {filteredConversations.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
              No conversations yet
            </div>
          )}
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className={
                styles.conversationItem + (conv.selected ? ' ' + styles.selected : '')
              }
              onClick={() => loadConversation({ _id: conv.id, ...conv })}
              style={{ cursor: 'pointer' }}
            >
              <img src={conv.avatar} alt={conv.name} className={styles.avatar} />
              <div className={styles.convDetails}>
                <div className={styles.convName}>{conv.name}</div>
                <div className={styles.convLastMsg}>{conv.lastMsg}</div>
              </div>
              <div className={styles.convMeta}>
                <span className={styles.convTime}>{conv.time}</span>
                {conv.unread > 0 && (
                  <span className={styles.unreadBadge}>{conv.unread}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Drawer for mobile only */}
      {drawerOpen && (
        <div className={styles.mobileDrawer}>
          <div className={styles.drawerHeader}>
            <span>Messages</span>
            <button className={styles.closeDrawerBtn} onClick={() => setDrawerOpen(false)}>
              <Icon icon="mdi:close" width={24} />
            </button>
          </div>
          <input
            className={styles.searchBox}
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className={styles.conversationList}>
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={
                  styles.conversationItem + (conv.selected ? ' ' + styles.selected : '')
                }
                onClick={() => loadConversation({ _id: conv.id, ...conv })}
                style={{ cursor: 'pointer' }}
              >
                <img src={conv.avatar} alt={conv.name} className={styles.avatar} />
                <div className={styles.convDetails}>
                  <div className={styles.convName}>{conv.name}</div>
                  <div className={styles.convLastMsg}>{conv.lastMsg}</div>
                </div>
                <div className={styles.convMeta}>
                  <span className={styles.convTime}>{conv.time}</span>
                  {conv.unread > 0 && (
                    <span className={styles.unreadBadge}>{conv.unread}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <section className={styles.chatArea}>
        {/* Chat Header */}
        <div className={styles.chatHeader}>
          {/* Hamburger for mobile */}
          <button className={styles.mobileMenuBtn} onClick={() => setDrawerOpen(true)}>
            <Icon icon="mdi:menu" width={28} />
          </button>
          <img
            src={currentUserInfo.avatar}
            alt={currentUserInfo.name}
            className={styles.headerAvatar}
          />
          <div className={styles.headerInfo}>
            <div className={styles.headerName}>{currentUserInfo.name}</div>
            {projectTitle && <div className={styles.headerRole}>{projectTitle}</div>}
          </div>
        </div>

        {/* Chat Body */}
        {loading ? (
          <div className={styles.chatBody}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <p>Loading messages...</p>
            </div>
          </div>
        ) : (
          <div className={styles.chatBody} ref={chatBodyRef}>
            {messages.map((msg) => {
              const isSent = msg.senderId._id === currentUserId;
              return (
                <div
                  key={msg._id}
                  className={styles.msgRow + ' ' + (isSent ? styles.sent : styles.received)}
                >
                  {!isSent && (
                    <img
                      src={currentUserInfo.avatar}
                      alt={`${msg.senderId.firstName} ${msg.senderId.lastName}`}
                      className={styles.avatar}
                      style={{ width: 38, height: 38 }}
                    />
                  )}
                  <div className={styles.msgBubble}>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div>
                        {msg.attachments.map((att, idx) => (
                          <a key={idx} href={att.fileUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ color: '#fd6730', textDecoration: 'underline' }}>
                            <Icon icon="mdi:file" width={18} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                            {att.fileName}
                          </a>
                        ))}
                      </div>
                    )}
                    {msg.text}
                  </div>
                  <span className={styles.msgTime}>
                    {formatTime(msg.createdAt)}
                    {isSent && (
                      <span style={{ marginLeft: 6, verticalAlign: 'middle' }}>
                        <Icon icon={msg.isRead ? "mdi:check-all" : "mdi:check"} color={msg.isRead ? "#fd6730" : "#999"} width={18} height={18} />
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Input Bar */}
        <div className={styles.inputBar}>
          <input
            className={styles.inputField}
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          />
          {/* Upload file/image icon */}
          <input
            type="file"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf,.doc,.docx,.txt"
          />
          <button
            className={styles.sendBtn}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Send file or image"
            style={{ marginRight: 6 }}
          >
            <Icon icon="mdi:paperclip" width={22} />
          </button>
          <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim()} title="Send message">
            <svg width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 21l19-9.5L2 2v7.5l13 2-13 2V21z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
};

export default ClientChat;
