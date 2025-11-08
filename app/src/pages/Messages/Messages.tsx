import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { io, Socket } from 'socket.io-client';
import styles from './Messages.module.css';
import { useNotification } from '../../contexts/NotificationContext';

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
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationData {
  _id: string;
  participants: {
    _id: string;
    firstName: string;
    lastName: string;
  }[];
  lastMessage?: string;
  lastMessageAt: string;
}

export const Messages: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Debug: log navigation state on mount
  useEffect(() => {
    // eslint-disable-next-line no-console
    try {
      console.log('Messages.tsx location.state:', JSON.stringify(location.state, null, 2));
    } catch (e) {
      console.log('Messages.tsx location.state:', location.state);
    }
  }, [location.state]);
  const { showLoader, hideLoader, showError } = useNotification();
  
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  // Get user IDs from localStorage and navigation state
  const currentUserId = localStorage.getItem('userId') || '';
  
  // Debug: Log current user ID
  useEffect(() => {
    console.log('Current User ID (Freelancer):', currentUserId);
    console.log('User Type:', localStorage.getItem('userType'));
  }, [currentUserId]);
  
  // Pull identifiers from navigation state or URL query params (for refresh/deep links)
  const searchParams = new URLSearchParams(location.search);
  const stateData = (location.state as {
    clientId?: string;
    clientName?: string;
    freelancerId?: string;
    freelancerName?: string;
    projectId?: string;
    projectTitle?: string;
  }) || {};
  const clientId = stateData.clientId || searchParams.get('clientId') || undefined;
  const clientName = stateData.clientName || searchParams.get('clientName') || undefined;
  const freelancerId = stateData.freelancerId || searchParams.get('freelancerId') || undefined;
  const freelancerName = stateData.freelancerName || searchParams.get('freelancerName') || undefined;
  const projectId = stateData.projectId || searchParams.get('projectId') || undefined;
  const projectTitle = stateData.projectTitle || searchParams.get('projectTitle') || undefined;

  // Determine roles based on user type
  // If current user is a freelancer, other user is client, and vice versa
  const isFreelancer = localStorage.getItem('userType') === 'freelancer';
  const myId = currentUserId;
  const theirId = isFreelancer ? clientId : freelancerId;
  // otherUserId is the id of the other participant in the chat
  const otherUserId = theirId || '';


  useEffect(() => {
    // Initialize Socket.io connection
    socketRef.current = io('http://localhost:5000');

    // Join as current user
    socketRef.current.emit('user:join', currentUserId);

    // Listen for incoming messages
    socketRef.current.on('message:receive', (message: MessageData) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for typing indicators
    socketRef.current.on('typing:show', () => {
      setOtherUserTyping(true);
    });

    socketRef.current.on('typing:hide', () => {
      setOtherUserTyping(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUserId]);

  useEffect(() => {
    // Fetch messages when component mounts
    fetchMessages();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      showLoader();
      // Validate required IDs before creating/fetching conversation
      let clientIdToSend = isFreelancer ? theirId : myId;
      let freelancerIdToSend = isFreelancer ? myId : theirId;

      // If some identifiers are missing but we have a projectId, fetch project to derive them
      if ((!clientIdToSend || !freelancerIdToSend) && projectId) {
        try {
          const projResp = await fetch(`http://localhost:5000/api/projects/${projectId}`);
          const projData = await projResp.json();
          if (projResp.ok && projData?.success && projData?.data) {
            const proj = projData.data;
            const derivedClientId = proj?.clientId?._id || proj?.clientId;
            const derivedFreelancerId = proj?.freelancerId?._id || proj?.freelancerId;
            if (!clientIdToSend || !freelancerIdToSend) {
              // Recompute based on role
              clientIdToSend = isFreelancer ? (theirId || derivedClientId) : myId;
              freelancerIdToSend = isFreelancer ? myId : (theirId || derivedFreelancerId);
            }
          }
        } catch (e) {
          // ignore, validation below will handle
        }
      }

      if (!clientIdToSend || !freelancerIdToSend || !projectId) {
        console.error('Missing IDs for conversation:', { clientIdToSend, freelancerIdToSend, projectId });
        showError('Missing conversation data (clientId, freelancerId or projectId). Please reopen the chat from the project page.');
        return;
      }

      const payload = {
        clientId: clientIdToSend,
        freelancerId: freelancerIdToSend,
        projectId: projectId,
      };
      console.log('Creating/fetching conversation with payload:', payload);

      // First, get or create conversation with project context
      const convResponse = await fetch('http://localhost:5000/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let convData: any;
      try {
        convData = await convResponse.json();
      } catch (jsonErr) {
        const text = await convResponse.text();
        console.error('Conversation endpoint returned non-json:', text);
        showError('Server error initializing conversation');
        return;
      }

      if (convResponse.ok && convData && convData.success && convData.data) {
        setConversation(convData.data);

        // Then fetch messages for this specific conversation
        const response = await fetch(
          `http://localhost:5000/api/messages/conversations/${convData.data._id}/messages`
        );

        let data: any;
        try {
          data = await response.json();
        } catch (jsonErr) {
          const text = await response.text();
          console.error('Messages endpoint returned non-json:', text);
          showError('Server error loading messages');
          return;
        }

        if (response.ok && data.success) {
          setMessages(data.data || []);
        } else {
          console.error('Failed to load messages response:', data);
          showError(data.message || data.error || 'Failed to load messages');
        }
      } else {
        console.error('Failed to initialize conversation response:', convData);
        showError(convData?.message || convData?.error || 'Failed to initialize conversation');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      showError('Failed to load messages. Please try again.');
    } finally {
      hideLoader();
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/project-dashboard');
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if message is from today
    const isToday = date.toDateString() === now.toDateString();
    
    // Check if message is from yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeStr = `${displayHours}:${displayMinutes} ${ampm}`;
    
    if (isToday) {
      return timeStr;
    } else if (isYesterday) {
      return `Yesterday ${timeStr}`;
    } else {
      // Show date for older messages
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}, ${timeStr}`;
    }
  };

  const handleTyping = () => {
    if (!socketRef.current || !conversation) return;

    // Emit typing start
    socketRef.current.emit('typing:start', {
      conversationId: conversation._id,
      userId: currentUserId,
      receiverId: otherUserId,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && conversation) {
        socketRef.current.emit('typing:stop', {
          conversationId: conversation._id,
          userId: currentUserId,
          receiverId: otherUserId,
        });
      }
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && selectedFiles.length === 0) return;
    
    // Ensure conversation exists
    let currentConversation = conversation;
    // Resolve receiver id robustly
    let receiverIdToUse = otherUserId;
    if (!receiverIdToUse) {
      // Try derive from known role + ids from state/query
      const possibleClientId = clientId;
      const possibleFreelancerId = freelancerId;
      if (isFreelancer) {
        receiverIdToUse = possibleClientId || receiverIdToUse || '';
      } else {
        receiverIdToUse = possibleFreelancerId || receiverIdToUse || '';
      }
      // As a fallback, fetch project to derive peer id
      if (!receiverIdToUse && projectId) {
        try {
          const projResp = await fetch(`http://localhost:5000/api/projects/${projectId}`);
          const projData = await projResp.json();
          if (projResp.ok && projData?.success && projData?.data) {
            const proj = projData.data;
            receiverIdToUse = isFreelancer
              ? (proj?.clientId?._id || proj?.clientId)
              : (proj?.freelancerId?._id || proj?.freelancerId);
          }
        } catch (e) {
          // ignore, will validate below
        }
      }
    }
    
    // If conversation doesn't exist, create it first
    if (!currentConversation) {
      try {
        const convResponse = await fetch('http://localhost:5000/api/messages/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId: isFreelancer ? theirId : myId,
            freelancerId: isFreelancer ? myId : theirId,
            projectId: projectId || undefined,
          }),
        });

        const convData = await convResponse.json();

        if (convData.success && convData.data) {
          currentConversation = convData.data;
          setConversation(convData.data);
          // Try to derive receiver from conversation if still missing
          if (!receiverIdToUse) {
            const participants: any[] = convData.data.participants || [];
            const other = participants.find((p) => p?._id && p._id !== currentUserId);
            if (other && other._id) {
              receiverIdToUse = other._id;
            }
          }
        } else {
          // Try fallback: maybe conversation already exists (different endpoint)
          try {
            const betweenResp = await fetch(
              `http://localhost:5000/api/messages/between/${currentUserId}/${otherUserId}`
            );
            const betweenData = await betweenResp.json();
            if (betweenData.success && betweenData.conversation) {
              currentConversation = betweenData.conversation;
              setConversation(betweenData.conversation);
              if (!receiverIdToUse) {
                const participants: any[] = betweenData.conversation.participants || [];
                const other = participants.find((p: any) => p?._id && p._id !== currentUserId);
                if (other && other._id) {
                  receiverIdToUse = other._id;
                }
              }
            } else {
              showError(convData.message || 'Failed to initialize conversation');
              return;
            }
          } catch (innerErr) {
            console.error('Fallback conversation lookup failed:', innerErr);
            showError(convData.message || 'Failed to initialize conversation');
            return;
          }
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
        showError('Failed to initialize conversation');
        return;
      }
    }

    // Double check conversation exists
    if (!currentConversation) {
      showError('Failed to initialize conversation');
      return;
    }

    // Validate sender/receiver
    if (!currentUserId || !receiverIdToUse) {
      showError('Failed to resolve chat participants. Please reopen the chat from the project page.');
      return;
    }

    try {
      // Prepare attachments array if files are selected
      const attachments = selectedFiles.map(file => ({
        fileName: file.name,
        fileUrl: `uploads/${file.name}`, // Simulated URL
        fileType: file.type,
      }));

      const messageData = {
        conversationId: currentConversation._id,
        senderId: currentUserId,
        receiverId: receiverIdToUse,
        text: messageInput.trim() || (selectedFiles.length > 0 ? '📎 Attachment' : ''),
        attachments: attachments.length > 0 ? attachments : [],
      };

      // Send to backend
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      const data = await response.json();

      if (data.success) {
        // Add message to local state
        setMessages((prev) => [...prev, data.data]);

        // Emit via Socket.io for real-time delivery
        if (socketRef.current) {
          socketRef.current.emit('message:send', {
            conversationId: currentConversation._id,
            senderId: currentUserId,
            receiverId: otherUserId,
            message: data.data,
          });
        }

        // Clear inputs
        setMessageInput('');
        setSelectedFiles([]);
      } else {
        showError(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const getOtherUserName = (): string => {
    if (isFreelancer && clientName) return clientName;
    if (!isFreelancer && freelancerName) return freelancerName;
    if (conversation && conversation.participants && conversation.participants.length > 0) {
      const otherUser = conversation.participants.find(p => p._id !== currentUserId);
      if (otherUser) {
        return `${otherUser.firstName} ${otherUser.lastName}`;
      }
    }
    return isFreelancer ? 'Client' : 'Freelancer';
  };

  if (loading) {
    return (
      <div className={styles.messagesPage}>
        <div className={styles.mobileView}>
          <header className={styles.chatHeader}>
            <button className={styles.iconButton} onClick={handleBack}>
              <Icon icon="lucide:arrow-left" className={styles.icon} />
            </button>
            <h1 className={styles.title}>Message</h1>
          </header>
          <div className={styles.loadingContainer}>
            <p>Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.messagesPage}>
      <div className={styles.mobileView}>
        {/* Header */}
        <header className={styles.chatHeader}>
          <button className={styles.iconButton} onClick={handleBack}>
            <Icon icon="lucide:arrow-left" className={styles.icon} />
          </button>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>{getOtherUserName()}</h1>
            {projectTitle && <p className={styles.subtitle}>{projectTitle}</p>}
          </div>
          <div className={styles.statusBarIcons}>
            {/* Mobile status bar icons placeholder */}
          </div>
        </header>

        {/* Chat Body */}
        <main className={styles.chatBody} ref={chatBodyRef}>
          {messages.map((msg, index) => {
            // Extract sender ID - handle both populated and string formats
            const messageSenderId = msg.senderId?._id || msg.senderId;
            const senderIdString = messageSenderId 
              ? (typeof messageSenderId === 'object' ? messageSenderId.toString() : messageSenderId)
              : '';
            const currentUserIdString = currentUserId;
            
            // FREELANCER sends messages (RIGHT side) = isSent true
            // CLIENT sends messages (LEFT side, grey) = isSent false
            const isSent = senderIdString === currentUserIdString;
            
            // Debug log for first 3 messages
            if (index < 3) {
              console.log(`Message ${index}:`, {
                text: msg.text?.substring(0, 20),
                senderIdString,
                currentUserIdString,
                isSent: isSent ? 'RIGHT (Freelancer)' : 'LEFT (Client)',
                senderName: msg.senderId ? `${msg.senderId.firstName} ${msg.senderId.lastName}` : 'Unknown'
              });
            }
            
            return (
              <div
                key={msg._id || index}
                className={`${styles.messageContainer} ${
                  isSent ? styles.sent : styles.received
                }`}
              >
                {!isSent && (
                  <div className={styles.avatarPlaceholder}>
                    {msg.senderId.firstName.charAt(0)}
                  </div>
                )}

                <div className={styles.messageContent}>
                  {!isSent && (
                    <span className={styles.senderName}>
                      {msg.senderId.firstName} {msg.senderId.lastName}
                    </span>
                  )}

                  <div
                    className={`${styles.messageBubble} ${
                      isSent ? styles.sentBubble : styles.receivedBubble
                    }`}
                  >
                    {msg.text && <p>{msg.text}</p>}

                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className={styles.messageImages}>
                        {msg.attachments.map((attachment, imgIndex) => (
                          <div key={imgIndex} className={styles.attachment}>
                            <Icon icon="lucide:file" className={styles.fileIcon} />
                            <span>{attachment.fileName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className={`${styles.messageInfo} ${
                      isSent ? styles.sentInfo : ''
                    }`}
                  >
                    <span>{formatTime(msg.createdAt)}</span>
                    {isSent && (
                      msg.isRead ? (
                        <Icon icon="lucide:check-check" className={styles.readIcon} />
                      ) : (
                        <Icon icon="lucide:check" className={styles.unreadIcon} />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {otherUserTyping && (
            <div className={styles.typingIndicator}>
              <div className={styles.typingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className={styles.typingText}>{getOtherUserName()} is typing...</span>
            </div>
          )}
        </main>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className={styles.filePreview}>
            <div className={styles.filePreviewHeader}>
              <span>{selectedFiles.length} file(s) selected</span>
              <button
                className={styles.clearButton}
                onClick={() => setSelectedFiles([])}
              >
                <Icon icon="lucide:x" className={styles.icon} />
              </button>
            </div>
            <div className={styles.fileList}>
              {selectedFiles.map((file, index) => (
                <div key={index} className={styles.fileItem}>
                  <Icon icon="lucide:file" className={styles.fileIcon} />
                  <span className={styles.fileName}>{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className={styles.chatFooter}>
          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            multiple
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,.doc,.docx"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            multiple
          />

          <div className={styles.inputContainer}>
            <input
              type="text"
              placeholder="Type a message ..."
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
            />
            <div className={styles.inputIcons}>
              <button className={styles.iconButton} onClick={handleCameraClick}>
                <Icon icon="lucide:camera" className={styles.icon} />
              </button>
              <button className={styles.iconButton} onClick={handleAttachClick}>
                <Icon icon="lucide:paperclip" className={styles.icon} />
              </button>
            </div>
          </div>
          <button className={styles.sendButton} onClick={handleSendMessage}>
            <Icon icon="lucide:send" className={styles.icon} />
          </button>
        </footer>
      </div>
    </div>
  );
};
