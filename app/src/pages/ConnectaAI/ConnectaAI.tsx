import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ConnectaAI.module.css';

interface SuggestionCard {
  title: string;
  description: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  attachments?: { name: string; type: string; url: string }[];
}

const ConnectaAI = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleBack = () => {
    navigate(-1);
  };

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage);
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('profile')) {
      return "I can help you update your profile! Make sure to include your key skills, experience, and a professional summary. Would you like me to review your current profile?";
    } else if (lowerMessage.includes('cover letter')) {
      return "I'll help you create a professional cover letter. Please share the job description and I'll craft a compelling letter highlighting your relevant skills and experience.";
    } else if (lowerMessage.includes('cv') || lowerMessage.includes('resume')) {
      return "Great! I can optimize your CV. Focus on quantifiable achievements, use action verbs, and tailor it to your target role. Would you like specific suggestions?";
    } else if (lowerMessage.includes('portfolio')) {
      return "Let's build an impressive portfolio! Include your best work, case studies, and testimonials. I can guide you through the structure and content.";
    } else {
      return "I'm here to help! I can assist with updating your profile, creating cover letters, optimizing your CV, or building your portfolio. What would you like to work on?";
    }
  };

  const handleSendMessage = () => {
    if (message.trim() || attachments.length > 0) {
      const attachmentData = attachments.map(file => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      }));

      const userMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'user',
        timestamp: new Date(),
        attachments: attachmentData.length > 0 ? attachmentData : undefined,
      };
      
      setMessages(prev => [...prev, userMessage]);
      simulateAIResponse(message.trim());
      setMessage('');
      setAttachments([]);
    }
  };

  const handleSuggestionClick = (suggestion: SuggestionCard) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: suggestion.title,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    simulateAIResponse(suggestion.title);
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
                {msg.text && <p>{msg.text}</p>}
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
          {messages.length === 0 && (
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
          )}
          
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
