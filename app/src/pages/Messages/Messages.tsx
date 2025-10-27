import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import styles from './Messages.module.css';
import clientImage from '../../assets/client.png';
import sampleImage from '../../assets/sample.png';

interface Message {
  sender: 'me' | 'other';
  name?: string;
  avatar?: string;
  text?: string;
  images?: string[];
  timestamp: string;
  read?: boolean;
}

const initialMessages: Message[] = [
  {
    sender: 'me',
    text: 'Hello, how are you doing?',
    timestamp: '08:15 AM',
  },
  {
    sender: 'other',
    name: 'Client',
    avatar: clientImage,
    text: "I'm doing well, thank you! How can I help you today?",
    timestamp: '08:16 AM',
  },
  {
    sender: 'me',
    text: 'I have a question about the return policy for a product I purchased.',
    timestamp: 'Just Now',
  },
  {
    sender: 'other',
    avatar: clientImage,
    text: "This is your delivery driver from Speedy Chow. I'm just around the corner from your place. 😊",
    timestamp: '10:10',
  },
  {
    sender: 'other',
    avatar: clientImage,
    text: "Hey there! \nI've arrived at your delivery address.",
    images: [
      sampleImage,
      sampleImage
    ],
    timestamp: '10:14',
  },
  {
    sender: 'me',
    text: 'Wow, that was quick!',
    timestamp: '10:15',
    read: true,
  },
  {
    sender: 'me',
    text: "I'll be right out. Thanks for coming early!",
    timestamp: '10:15',
    read: true,
  },
];

export const Messages: React.FC = () => {
  const navigate = useNavigate();
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [messageInput, setMessageInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() && selectedFiles.length === 0) return;

    const newMessage: Message = {
      sender: 'me',
      text: messageInput.trim() || undefined,
      timestamp: getCurrentTime(),
      read: false,
    };

    // Handle file attachments
    if (selectedFiles.length > 0) {
      const imageUrls: string[] = [];
      
      selectedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            imageUrls.push(e.target.result as string);
            
            // When all files are read, add the message
            if (imageUrls.length === selectedFiles.length) {
              const messageWithImages: Message = {
                ...newMessage,
                images: imageUrls,
              };
              setMessages((prev) => [...prev, messageWithImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      setMessages((prev) => [...prev, newMessage]);
    }

    // Clear inputs
    setMessageInput('');
    setSelectedFiles([]);
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

  return (
    <div className={styles.messagesPage}>
      <div className={styles.mobileView}>
        {/* Header */}
        <header className={styles.chatHeader}>
          <button className={styles.iconButton} onClick={handleBack}>
            <Icon icon="lucide:arrow-left" className={styles.icon} />
          </button>
          <h1 className={styles.title}>Message</h1>
          <div className={styles.statusBarIcons}>
            {/* Mobile status bar icons placeholder */}
          </div>
        </header>

        {/* Chat Body */}
        <main className={styles.chatBody} ref={chatBodyRef}>
          {messages.map((msg, index) => {
            const isSent = msg.sender === 'me';
            return (
              <div
                key={index}
                className={`${styles.messageContainer} ${
                  isSent ? styles.sent : styles.received
                }`}
              >
                {msg.avatar && (
                  <img
                    src={msg.avatar}
                    alt={msg.name || 'User'}
                    className={styles.avatar}
                  />
                )}
                {!isSent && !msg.avatar && (
                  <div className={styles.avatarPlaceholder}></div>
                )}

                <div className={styles.messageContent}>
                  {msg.name && (
                    <span className={styles.senderName}>{msg.name}</span>
                  )}

                  <div
                    className={`${styles.messageBubble} ${
                      isSent ? styles.sentBubble : styles.receivedBubble
                    }`}
                  >
                    {msg.text && <p>{msg.text}</p>}

                    {msg.images && msg.images.length > 0 && (
                      <div className={styles.messageImages}>
                        {msg.images.map((imgSrc, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={imgSrc}
                            alt="Uploaded content"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className={`${styles.messageInfo} ${
                      isSent ? styles.sentInfo : ''
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.read && (
                      <Icon icon="lucide:check-check" className={styles.readIcon} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
              onChange={(e) => setMessageInput(e.target.value)}
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
