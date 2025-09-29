import { useState, useRef, useEffect } from 'react';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const showToast = (message, type = "info") => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) {
      showToast('Please enter a message', 'warning');
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send to N8n webhook
      const response = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          timestamp: userMessage.timestamp.toISOString(),
          sessionId: `chat_${Date.now()}`,
          userId: localStorage.getItem('userEmail') || 'anonymous'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: data.response || "I'm here to help! Could you please rephrase your question?",
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      showToast('Connection error. Please try again.', 'error');
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10001,
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            animation: 'slideIn 0.3s ease-out',
            minWidth: '300px',
            overflow: 'hidden'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            gap: '8px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'white',
              backgroundColor: toastMessage.type === 'success' ? '#10b981' : 
                               toastMessage.type === 'error' ? '#ef4444' :
                               toastMessage.type === 'warning' ? '#f59e0b' : '#3b82f6'
            }}>
              {toastMessage.type === 'success' ? '✓' : 
               toastMessage.type === 'error' ? '✖' :
               toastMessage.type === 'warning' ? '⚠' : 'i'}
            </div>
            <span style={{ color: '#374151', fontSize: '14px' }}>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 10000,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
      }}>
        {/* Chat Window */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            bottom: '80px',
            right: '0',
            width: '350px',
            height: '500px',
            backgroundColor: '#1a1a1a',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            border: '1px solid #8b5cf6',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'chatSlideUp 0.3s ease-out'
          }}>
            {/* Chat Header */}
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              padding: '16px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  🤖
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>AI Assistant</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Online</div>
                </div>
              </div>
              <button 
                onClick={toggleChat}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#0a0a0a'
            }}>
              {messages.map((message) => (
                <div key={message.id} style={{
                  display: 'flex',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: message.sender === 'user' 
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    flexShrink: 0
                  }}>
                    {message.sender === 'user' ? '👤' : '🤖'}
                  </div>
                  <div style={{
                    maxWidth: '70%',
                    backgroundColor: message.sender === 'user' ? '#8b5cf6' : '#2a2a2a',
                    color: 'white',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>
                    <div>{message.text}</div>
                    <div style={{
                      fontSize: '11px',
                      opacity: 0.7,
                      marginTop: '4px'
                    }}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>
                    🤖
                  </div>
                  <div style={{
                    backgroundColor: '#2a2a2a',
                    color: 'white',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#8b5cf6',
                        animation: 'bounce 1.4s infinite ease-in-out'
                      }}></div>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#8b5cf6',
                        animation: 'bounce 1.4s infinite ease-in-out 0.2s'
                      }}></div>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#8b5cf6',
                        animation: 'bounce 1.4s infinite ease-in-out 0.4s'
                      }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
              padding: '16px',
              borderTop: '1px solid #27272a',
              backgroundColor: '#1a1a1a'
            }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-end'
              }}>
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'white',
                    fontSize: '14px',
                    resize: 'none',
                    minHeight: '40px',
                    maxHeight: '80px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  style={{
                    background: inputMessage.trim() ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : '#2a2a2a',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                    color: 'white',
                    fontSize: '14px',
                    minWidth: '60px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isLoading ? '...' : '→'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Button */}
        <button
          onClick={toggleChat}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'white',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 12px 32px rgba(139, 92, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.3)';
          }}
        >
          {isOpen ? '✕' : '🤖'}
          
          {/* Pulse animation ring */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            border: '2px solid #8b5cf6',
            opacity: 0,
            animation: 'pulse 2s infinite'
          }}></div>
        </button>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes chatSlideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 0.7;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.3;
            }
            100% {
              transform: scale(1.4);
              opacity: 0;
            }
          }
          
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1);
            }
          }
          
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  );
};

export default AIChatWidget;