import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/MessagesPanel.module.css';

interface Message {
  id: string;
  name: string;
  message: string;
  time: string;
  unread: boolean;
  avatar: string;
}

interface MessagesPanelProps {
  messages: Message[];
}

const MessagesPanel = ({ messages }: MessagesPanelProps) => {
  const navigate = useNavigate();

  const handleViewAllMessages = () => {
    navigate('/chats');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Messages</h2>
        <button className={styles.viewAllBtn} onClick={handleViewAllMessages}>
          View All
        </button>
      </div>

      {/* Messages List */}
      <div className={styles.messagesList}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <Icon icon="material-symbols:mail-outline" className={styles.emptyIcon} />
            <p>No messages yet</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={styles.messageCard}
              onClick={handleViewAllMessages}
            >
              <img 
                src={message.avatar} 
                alt={message.name} 
                className={styles.avatar}
              />
              
              <div className={styles.messageContent}>
                <h4 className={styles.senderName}>{message.name}</h4>
                <p className={styles.messageText}>{message.message}</p>
              </div>

              <div className={styles.messageRight}>
                <span className={styles.time}>{message.time}</span>
                {message.unread && <span className={styles.unreadDot}></span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagesPanel;
