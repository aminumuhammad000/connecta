import React from 'react';
import { Icon } from '@iconify/react';
import styles from './ClientChat.module.css';
import ClientSidebar from './components/ClientSidebar';
import ClientHeader from './components/ClientHeader';

// Demo data for UI matching the screenshot
const conversations = [
  {
    id: '1',
    name: 'Eleanor Vance',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastMsg: "Great, I'll get that over to ...",
    time: '10:42 AM',
    unread: 1,
    selected: true,
  },
  {
    id: '2',
    name: 'Marcus Holloway',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMsg: 'The file is attached. Let me...',
    time: 'Yesterday',
    unread: 3,
    selected: false,
  },
  {
    id: '3',
    name: 'Lena Petrova',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    lastMsg: 'Perfect, thank you!',
    time: 'Mon',
    unread: 0,
    selected: false,
  },
  {
    id: '4',
    name: 'Kenji Tanaka',
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
    lastMsg: 'Sure, I can do that.',
    time: 'Sun',
    unread: 0,
    selected: false,
  },
];

import { useState, useRef } from 'react';

const initialMessages = [
  {
    id: 1,
    sender: 'Eleanor Vance',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    role: 'UX/UI Designer',
    text: "Hi there! I've just pushed the latest designs for the dashboard. Please let me know your thoughts.",
    time: '10:40 AM',
    sent: false,
    type: 'text',
  },
  {
    id: 2,
    sender: 'You',
    text: 'Looks great, Eleanor. The new data visualization components are exactly what we were looking for.',
    time: '10:41 AM',
    sent: true,
    type: 'text',
  },
  {
    id: 3,
    sender: 'Eleanor Vance',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    role: 'UX/UI Designer',
    text: "Great, I’ll get that over to you by EOD. I’ll also include the mobile mockups.",
    time: '10:42 AM',
    sent: false,
    type: 'text',
  },
];


const ClientChat: React.FC = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  const [search, setSearch] = useState('');
  const chatBodyRef = useRef<HTMLDivElement>(null);

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
