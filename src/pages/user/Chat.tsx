import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MoreVertical, Bot, User, Loader2, AlertCircle, Settings } from 'lucide-react';
import { sendChatMessage } from '../../services/api';
import { Link } from 'react-router-dom';
import './Chat.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  error?: boolean;
}

interface Provider {
  id: string;
  apiKey: string;
  isConfigured: boolean;
  isDefault: boolean;
}

const PROVIDERS_STORAGE_KEY = 'teleaon_providers';
const SETTINGS_STORAGE_KEY = 'teleaon_user_settings';

// Get configured provider from localStorage
function getConfiguredProvider(): { apiKey: string; provider: string; model: string } | null {
  try {
    const providersData = localStorage.getItem(PROVIDERS_STORAGE_KEY);
    if (!providersData) return null;

    const providers: Provider[] = JSON.parse(providersData);
    const activeProvider = providers.find(p => p.isDefault && p.isConfigured && p.apiKey) || 
                          providers.find(p => p.isConfigured && p.apiKey);

    if (!activeProvider) return null;

    // Get user's selected model
    const settingsData = localStorage.getItem(SETTINGS_STORAGE_KEY);
    let model = settingsData ? JSON.parse(settingsData).model : null;

    // Provide sensible default if no model is selected
    if (!model) {
      switch (activeProvider.id) {
        case 'gemini':
          model = 'google/gemini-2.0-flash';
          break;
        case 'anthropic':
          model = 'anthropic/claude-3-5-sonnet';
          break;
        case 'openai':
          model = 'openai/gpt-4o';
          break;
        default:
          model = 'anthropic/claude-3-5-sonnet';
      }
    }

    return {
      apiKey: activeProvider.apiKey,
      provider: activeProvider.id,
      model,
    };
  } catch {
    return null;
  }
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello! 👋 I'm Teleaon Bot, your intelligent AI assistant. How can I help you today?",
    timestamp: new Date(Date.now() - 60000),
  },
];

export default function UserChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [noProvider, setNoProvider] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if provider is configured
  useEffect(() => {
    const config = getConfiguredProvider();
    // Use timeout to avoid calling setState during effect top-level (cascading render)
    const timer = setTimeout(() => {
      setNoProvider(!config);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Get provider configuration
    const config = getConfiguredProvider();
    console.log('[Chat] Configured Provider:', config);
    
    if (!config) {
      setNoProvider(true);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "⚠️ No AI provider configured. Please configure an API key in Admin > Providers or User > Settings to enable AI responses.",
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
      return;
    }

    try {
      // Build messages array for API
      const chatMessages = messages
        .filter(m => !m.error)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      chatMessages.push({ role: 'user', content: input });

      // Add system message
      const systemMessage = {
        role: 'system' as const,
        content: 'You are Teleaon Bot, a helpful and intelligent AI assistant. Be concise, friendly, and helpful. Format your responses with markdown when appropriate.',
      };

      const response = await sendChatMessage({
        messages: [systemMessage, ...chatMessages],
        model: config.model,
        apiKey: config.apiKey,
        provider: config.provider,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.error 
          ? `❌ Error: ${response.error}` 
          : response.content || "I received your message but couldn't generate a response.",
        timestamp: new Date(),
        error: !!response.error,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Failed to get response: ${errorMsg}\n\nMake sure the backend server is running (\`npm run server\`).`,
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
    
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-page">
      <div className="chat-container glass-card">
        {/* No Provider Warning */}
        {noProvider && (
          <div className="chat-warning">
            <AlertCircle size={16} />
            <span>No AI provider configured.</span>
            <Link to="/admin/providers" className="btn btn-sm btn-primary">
              <Settings size={14} /> Configure
            </Link>
          </div>
        )}

        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="avatar">
              <Bot size={20} />
            </div>
            <div>
              <h3>Teleaon Bot</h3>
              <span className="status-text">
                <span className="status-dot pulse"></span>
                Online
              </span>
            </div>
          </div>
          <button className="btn-icon btn-ghost">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'} ${message.error ? 'message-error' : ''}`}
            >
              <div className="message-avatar">
                {message.role === 'user' ? (
                  <div className="avatar avatar-sm">
                    <User size={14} />
                  </div>
                ) : (
                  <div className="avatar avatar-sm assistant-avatar">
                    <Bot size={14} />
                  </div>
                )}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  {message.content}
                </div>
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message message-assistant">
              <div className="message-avatar">
                <div className="avatar avatar-sm assistant-avatar">
                  <Bot size={14} />
                </div>
              </div>
              <div className="message-content">
                <div className="message-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <button className="btn-icon btn-ghost" title="Attach file">
            <Paperclip size={20} />
          </button>
          <div className="input-wrapper">
            <textarea
              className="chat-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
          </div>
          <button className="btn-icon btn-ghost" title="Voice input">
            <Mic size={20} />
          </button>
          <button
            className="btn btn-primary send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
          >
            {isTyping ? <Loader2 size={18} className="spinner-icon" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
