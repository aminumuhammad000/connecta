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
  participants: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  }[];
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
  
  const freelancerId = stateData.freelancerId || searchParams.get('freelancerId') || undefined;
  const freelancerName = stateData.freelancerName || searchParams.get('freelancerName') || undefined;
  const projectId = stateData.projectId || searchParams.get('projectId') || undefined;
  const projectTitle = stateData.projectTitle || searchParams.get('projectTitle') || undefined;

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date();
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: 'You',
        text: input,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: true,
        type: 'text',
      },
    ]);
    setInput('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const now = new Date();
    let url = '';
    if (file.type.startsWith('image/')) {
      url = URL.createObjectURL(file);
    }
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: 'You',
        fileName: file.name,
        fileType: file.type,
        fileUrl: url,
        text: file.type.startsWith('image/') ? '' : file.name,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: true,
        type: file.type.startsWith('image/') ? 'image' : 'file',
      },
    ]);
    // Reset file input value so same file can be uploaded again
    if (fileInput) fileInput.value = '';
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(search.toLowerCase())
  );

  // Responsive: show drawer on mobile, sidebar on desktop
  return (
    <div className={styles.container}>
      {/* Main navigation sidebar always visible (ClientSidebar) */}
      <ClientSidebar />
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
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className={
                styles.conversationItem + (conv.selected ? ' ' + styles.selected : '')
              }
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
                onClick={() => setDrawerOpen(false)}
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
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Eleanor Vance"
            className={styles.headerAvatar}
          />
          <div className={styles.headerInfo}>
            <div className={styles.headerName}>Eleanor Vance</div>
            <div className={styles.headerRole}>UX/UI Designer</div>
          </div>
        </div>

        {/* Chat Body */}
        <div className={styles.chatBody} ref={chatBodyRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={styles.msgRow + ' ' + (msg.sent ? styles.sent : styles.received)}
            >
              {!msg.sent && msg.avatar && (
                <img
                  src={msg.avatar}
                  alt={msg.sender}
                  className={styles.avatar}
                  style={{ width: 38, height: 38 }}
                />
              )}
              <div className={styles.msgBubble}>
                {msg.type === 'image' && msg.fileUrl && (
                  <img src={msg.fileUrl} alt={msg.fileName} style={{ maxWidth: 180, borderRadius: 8, marginBottom: 4 }} />
                )}
                {msg.type === 'file' && msg.fileName && (
                  <a href={msg.fileUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ color: '#fd6730', textDecoration: 'underline' }}>
                    <Icon icon="mdi:file" width={18} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    {msg.fileName}
                  </a>
                )}
                {msg.text}
              </div>
              <span className={styles.msgTime}>
                {msg.time}
                {msg.sent && (
                  <span style={{ marginLeft: 6, verticalAlign: 'middle' }}>
                    {/* Simulate all sent messages as seen for now */}
                    <Icon icon="mdi:check-all" color="#fd6730" width={18} height={18} title="Seen" />
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

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
            ref={el => setFileInput(el)}
            onChange={handleFileChange}
            accept="image/*,application/pdf,.doc,.docx,.txt"
          />
          <button
            className={styles.sendBtn}
            type="button"
            onClick={() => fileInput && fileInput.click()}
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
