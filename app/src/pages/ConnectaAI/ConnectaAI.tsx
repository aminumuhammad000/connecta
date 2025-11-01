import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './ConnectaAI.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface SuggestionCard {
  title: string;
  description: string;
}

import JobList from './components/JobList';
import type { Job } from './components/JobCard';
import ProfileList from './components/ProfileList';
import type { Profile } from './components/ProfileCard';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  attachments?: { name: string; type: string; url: string }[];
  jobs?: Job[];
  profiles?: Profile[];
  type?: 'text' | 'jobs' | 'profiles';
}

const ConnectaAI = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { showError } = useNotification();

  const suggestions: SuggestionCard[] = [
    {
      title: 'Update profile',
      description: 'Get help updating your professional profile with AI.',
    },
    {
      title: 'Create cover letter',
      description: 'Get a professional and persuasive letter instantly.',
    },
    {
      title: 'Optimize my CV',
      description: 'Make your CV stand out with AI-powered suggestions.',
    },
    {
      title: 'Create Portfolio',
      description: 'Build a stunning portfolio to showcase your work.',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load initial message if no messages
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessage: Message = {
        id: 'welcome',
        text: 'Hello! I\'m your Connecta AI assistant. How can I help you today?',
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages([initialMessage]);
    }
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const getAIResponse = async (userMessage: string) => {
    if (!user) {
      showError('Please log in to use Connecta AI');
      return;
    }

    setIsTyping(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          input: userMessage,
          userId: user._id || localStorage.getItem('userId'),
          userType: user.userType || 'freelancer'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get response from AI');
      }

      const data = await response.json();
      console.log('AI Response:', JSON.stringify(data, null, 2));
      
      // Try to parse different response formats
      let jobsData = [];
      let profilesData = [];
      let messageText = data.result?.message || data.message || '';
      let responseType: 'text' | 'jobs' | 'profiles' = 'text';
      
      // Extract jobs from various nested structures
      const possibleJobsData = data.result?.data?.data || data.data?.data || data.data || data.jobs || [];
      if (Array.isArray(possibleJobsData) && possibleJobsData.length > 0) {
        // Check if first item looks like a job
        const firstItem = possibleJobsData[0];
        if (firstItem?.title && (firstItem?.company || firstItem?.description)) {
          jobsData = possibleJobsData;
          responseType = 'jobs';
          messageText = 'Here are some job listings that match your criteria:';
        }
      }
      
      // Extract profiles from various nested structures
      const possibleProfilesData = data.result?.data?.data || data.data?.data || data.data || data.profiles || data.users || [];
      if (Array.isArray(possibleProfilesData) && possibleProfilesData.length > 0 && jobsData.length === 0) {
        // Check if first item looks like a profile
        const firstItem = possibleProfilesData[0];
        if (firstItem?.firstName && firstItem?.email) {
          profilesData = possibleProfilesData;
          responseType = 'profiles';
          messageText = 'Here are some profiles that match your search:';
        }
      }
      
      console.log('Parsed response:', { responseType, jobsCount: jobsData.length, profilesCount: profilesData.length });
      
      // Create the AI message
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'ai',
        timestamp: new Date(),
        type: responseType,
      };
      
      // Add data based on type
      if (jobsData.length > 0) {
        aiMessage.jobs = jobsData;
      } else if (profilesData.length > 0) {
        aiMessage.profiles = profilesData;
      }
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      const errorMessage = error?.message || 'Failed to get response from AI. Please try again.';
      showError(errorMessage);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: errorMessage,
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    const messageText = message.trim();
    if (!messageText && attachments.length === 0) return;

    const attachmentData = attachments.map(file => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
    }));

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      attachments: attachmentData.length > 0 ? attachmentData : undefined,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setAttachments([]);
    
    // Get AI response
    await getAIResponse(messageText);
  };

  const handleSuggestionClick = async (suggestion: SuggestionCard) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: suggestion.title,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    await getAIResponse(suggestion.title);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.app}>
      <div className={styles.chatContainer}>
        <header className={styles.chatHeader}>
          <button 
            className={styles.chatHeader__backBtn} 
            onClick={handleBack}
            aria-label="Go back"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M15 18L9 12L15 6" 
                stroke="#2C2D3A" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className={styles.chatHeader__title}>Connecta AI</h1>
        </header>

        {messages.length === 0 ? (
          <main className={styles.chatMain}>
            <div className={styles.infoCard}>
              Remembers what user said<br />earlier in the conversation
            </div>
            <div className={styles.infoCard}>
              Allows user to provide.<br />follow-up corrections With Ai
            </div>
            <div className={styles.infoCard}>
              Limited knowledge of world<br />and events after 2025
            </div>
          </main>
        ) : (
          <main className={styles.chatMessages}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={msg.sender === 'user' ? styles.userMessage : styles.aiMessage}
              >
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className={styles.attachments}>
                    {msg.attachments.map((att, idx) => (
                      <div key={idx} className={styles.attachment}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="#FD6730" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M13 2V9H20" stroke="#FD6730" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Render based on message type */}
                {msg.jobs && msg.jobs.length > 0 ? (
                  // Show job cards
                  <div className={styles.jobsContainer}>
                    {msg.text && <p className={styles.jobsHeader}>{msg.text}</p>}
                    <JobList jobs={msg.jobs} />
                  </div>
                ) : msg.profiles && msg.profiles.length > 0 ? (
                  // Show profile cards
                  <div className={styles.profilesContainer}>
                    {msg.text && <p className={styles.profilesHeader}>{msg.text}</p>}
                    <ProfileList profiles={msg.profiles} />
                  </div>
                ) : msg.text ? (
                  // Show plain text message
                  <div className={msg.sender === 'ai' ? styles.aiMessageText : styles.userMessageText}>
                    {msg.text}
                  </div>
                ) : null}
              </div>
            ))}
            
            {isTyping && (
              <div className={styles.aiMessage}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>
        )}

        <footer className={styles.chatFooter}>
          <div className={styles.suggestions}>
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className={styles.suggestionCard}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <p className={styles.suggestionCard__title}>{suggestion.title}</p>
                <p className={styles.suggestionCard__description}>{suggestion.description}</p>
              </div>
            ))}
          </div>
          
          {attachments.length > 0 && (
            <div className={styles.attachmentPreview}>
              {attachments.map((file, index) => (
                <div key={index} className={styles.previewItem}>
                  <span>{file.name}</span>
                  <button onClick={() => removeAttachment(index)}>×</button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.inputArea}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
            />
            <button 
              className={styles.inputArea__addBtn} 
              onClick={handleFileUpload}
              aria-label="Attach file"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M12 5V19M5 12H19" 
                  stroke="rgba(0, 0, 0, 0.7)" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className={styles.inputArea__wrapper}>
              <input 
                type="text" 
                className={styles.inputArea__textField} 
                placeholder="Send a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                className={styles.inputArea__sendBtn} 
                onClick={handleSendMessage}
                aria-label="Send message"
              >
                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M22.8156 2.1853L11.8156 13.1853" 
                    stroke="#FD6730" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M22.8156 2.1853L15.8156 22.1853L11.8156 13.1853L2.81562 9.1853L22.8156 2.1853Z" 
                    stroke="#FD6730" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ConnectaAI;
