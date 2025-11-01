import React, { useEffect, useState, useRef } from 'react';
import { getSocket, disconnectSocket } from '../../utils/socket';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Header from '../../components/Header';
import styles from './Chats.module.css';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Project {
  _id: string;
  title: string;
}

interface Conversation {
  _id: string;
  participants: User[];
  clientId?: User | { _id: string } | string;
  freelancerId?: User | { _id: string } | string;
  lastMessage?: {
    text: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: Record<string, number>;
  projectId?: Project;
  lastMessageAt?: string;
}

const Chats: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // Get userId from localStorage, with fallback

  // Force localStorage userId to seeded freelancer if not set
  const SEEDED_FREELANCER_ID = '69035ceb526dcadeee50d557'; // Replace with actual seeded freelancer ID if different
  const getUserId = (): string => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      localStorage.setItem('userId', SEEDED_FREELANCER_ID);
      userId = SEEDED_FREELANCER_ID;
    }
    return userId;
  };

  const currentUserId = getUserId();


  // Socket.io real-time updates
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!currentUserId) {
      setError('User ID not found. Please login again.');
      setLoading(false);
      return;
    }
    fetchConversations();

    // Setup socket connection
    socketRef.current = getSocket();
    socketRef.current.emit('user:join', currentUserId);

    // Listen for new messages or conversations
    socketRef.current.on('message:receive', () => {
      fetchConversations();
    });
    socketRef.current.on('conversation:update', () => {
      fetchConversations();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('message:receive');
        socketRef.current.off('conversation:update');
        disconnectSocket();
      }
    };
    // eslint-disable-next-line
  }, [currentUserId]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching conversations for userId:', currentUserId);
      
      const response = await fetch(
        `http://localhost:5000/api/messages/conversations/${currentUserId}`
      );
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      
      console.log('Conversations data:', data);

      if (data.success) {
        console.log('Found conversations:', data.count);
        setConversations(data.data || []);
        setError('');
      } else {
        console.error('Failed to fetch conversations:', data.message);
        setError(data.message || 'Failed to load conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (conversation: Conversation): User | null => {
    const participants = Array.isArray(conversation.participants)
      ? conversation.participants
      : [];
    // Prefer participants if available
    if (participants.length > 0) {
      const other = participants.find((p) => p && p._id !== currentUserId);
      if (other) return other;
    }

    // Fallback to clientId/freelancerId fields from backend
    const clientField: any = (conversation as any).clientId;
    const freelancerField: any = (conversation as any).freelancerId;
    const clientUser: User | null = clientField && typeof clientField === 'object' && 'firstName' in clientField
      ? (clientField as User)
      : null;
    const freelancerUser: User | null = freelancerField && typeof freelancerField === 'object' && 'firstName' in freelancerField
      ? (freelancerField as User)
      : null;

    if (clientUser && clientUser._id !== currentUserId) return clientUser;
    if (freelancerUser && freelancerUser._id !== currentUserId) return freelancerUser;
    return null;
  };

  const formatTime = (dateString?: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleConversationClick = (conversation: Conversation) => {
    const otherUser = getOtherUser(conversation);
    if (!otherUser) return;

    // Build chat params using explicit roles when available
    const clientField: any = (conversation as any).clientId;
    const freelancerField: any = (conversation as any).freelancerId;
    const clientId = clientField && typeof clientField === 'object' && clientField._id ? clientField._id : clientField;
    const freelancerId = freelancerField && typeof freelancerField === 'object' && freelancerField._id ? freelancerField._id : freelancerField;

    const clientName = clientField && typeof clientField === 'object' && clientField.firstName
      ? `${clientField.firstName} ${clientField.lastName}`
      : undefined;
    const freelancerName = freelancerField && typeof freelancerField === 'object' && freelancerField.firstName
      ? `${freelancerField.firstName} ${freelancerField.lastName}`
      : undefined;

    const params = new URLSearchParams({
      ...(clientId ? { clientId: String(clientId) } : {}),
      ...(clientName ? { clientName } : {}),
      ...(freelancerId ? { freelancerId: String(freelancerId) } : {}),
      ...(freelancerName ? { freelancerName } : {}),
      ...(conversation.projectId?._id ? { projectId: conversation.projectId._id } : {}),
      ...(conversation.projectId?.title ? { projectTitle: conversation.projectId.title } : {}),
    }).toString();

    navigate(`/messages?${params}`, {
      state: {
        clientId,
        clientName,
        freelancerId,
        freelancerName,
        projectId: conversation.projectId?._id,
        projectTitle: conversation.projectId?.title,
      },
    });
  };

  // Only show conversations that have at least one message
  const conversationsWithMessages = conversations.filter((c) => {
    const lm: any = c.lastMessage as any;
    return Boolean(lm) || Boolean(c.lastMessageAt);
  });

  const filteredConversations = conversationsWithMessages.filter((conversation) => {
    const otherUser = getOtherUser(conversation);
    if (!otherUser) return false;

    const fullName = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
    const projectTitle = conversation.projectId?.title?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || projectTitle.includes(query);
  });

  if (loading) {
    return (
      <div className={styles.chatsPage}>
        <Header />
        <div className={styles.loadingContainer}>
          <Icon icon="eos-icons:loading" className={styles.loadingIcon} />
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.chatsPage}>
        <Header />
        <div className={styles.loadingContainer}>
          <Icon icon="mdi:alert-circle" className={styles.emptyIcon} />
          <h3>Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => {
              setError('');
              setLoading(true);
              fetchConversations();
            }}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              backgroundColor: '#FD6730',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatsPage}>
      <Header />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Chats</h1>
          <p className={styles.subtitle}>
            {conversationsWithMessages.length} conversation{conversationsWithMessages.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <Icon icon="mdi:magnify" className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Conversations List */}
        <div className={styles.conversationsList}>
          {filteredConversations.length === 0 ? (
            <div className={styles.emptyState}>
              <Icon icon="mdi:message-outline" className={styles.emptyIcon} />
              <h3>No conversations yet</h3>
              <p>Start chatting by clicking "Chat" on a project</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              if (!otherUser) return null;

              const unreadCount = conversation.unreadCount?.[currentUserId] || 0;
              // Support both string and object shapes for lastMessage
              const lastMsgAny: any = conversation.lastMessage as any;
              const lastMessageText = typeof lastMsgAny === 'string'
                ? lastMsgAny
                : (lastMsgAny?.text || 'No messages yet');
              const isLastMessageFromMe = typeof lastMsgAny === 'object' && lastMsgAny?.senderId === currentUserId;

              return (
                <div
                  key={conversation._id}
                  className={styles.conversationCard}
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className={styles.avatar}>
                    <Icon icon="mdi:account-circle" className={styles.avatarIcon} />
                  </div>

                  <div className={styles.conversationInfo}>
                    <div className={styles.conversationHeader}>
                      <h3 className={styles.userName}>
                        {otherUser.firstName} {otherUser.lastName}
                      </h3>
                      <span className={styles.timestamp}>
                        {formatTime(conversation.lastMessage?.createdAt || conversation.lastMessageAt)}
                      </span>
                    </div>

                    {conversation.projectId && (
                      <div className={styles.projectTag}>
                        <Icon icon="mdi:briefcase-outline" className={styles.projectIcon} />
                        <span>{conversation.projectId.title}</span>
                      </div>
                    )}

                    <div className={styles.lastMessageContainer}>
                      <p className={styles.lastMessage}>
                        {isLastMessageFromMe && <span className={styles.youPrefix}>You: </span>}
                        {lastMessageText}
                      </p>
                      {unreadCount > 0 && (
                        <div className={styles.unreadBadge}>{unreadCount}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;
