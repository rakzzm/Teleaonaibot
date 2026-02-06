import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MoreVertical, Bot, User, Loader2, AlertCircle, Settings } from 'lucide-react';
import type { Session } from '../../services/sessionService';
import { sendChatMessage } from '../../services/api';
import { sessionService } from '../../services/sessionService';
import { Link, useSearchParams } from 'react-router-dom';
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

export default function UserChat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [noProvider, setNoProvider] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load session or initial message
  useEffect(() => {
    if (sessionId) {
      const session = sessionService.getSession(sessionId);
      if (session) {
        const mappedMessages = session.messages
          .filter(m => m.role !== 'system')
          .map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(m.timestamp)
          }));
        
        // Use functional update to avoid unnecessary re-renders if the content is the same
        setMessages(mappedMessages);
        setCurrentSessionId(sessionId);
        return;
      }
    }
    
    // Default initial message if no session loaded
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hello! 👋 I'm Teleaon Bot, your intelligent AI assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setCurrentSessionId(null);
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if provider is configured
  useEffect(() => {
    const config = getConfiguredProvider();
    const timer = setTimeout(() => {
      setNoProvider(!config);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const timestamp = new Date();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Get provider configuration
    const config = getConfiguredProvider();
    
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

    // Ensure we have a session
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      activeSessionId = Date.now().toString();
      const newSession: Session = {
        id: activeSessionId,
        title: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
        preview: input,
        messageCount: 1,
        messages: [
          {
            id: 'system-1',
            role: 'system',
            content: 'You are Teleaon Bot, a helpful and intelligent AI assistant.',
            timestamp: new Date().toISOString()
          },
          {
            ...userMessage,
            timestamp: timestamp.toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      sessionService.saveSession(newSession);
      setCurrentSessionId(activeSessionId);
      setSearchParams({ session: activeSessionId });
    } else {
      sessionService.addMessageToSession(activeSessionId, {
        ...userMessage,
        timestamp: timestamp.toISOString()
      });
    }

    try {
      const chatMessages = messages
        .filter(m => !m.error)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      chatMessages.push({ role: 'user', content: input });

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

      const assistantTimestamp = new Date();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.error 
          ? `❌ Error: ${response.error}` 
          : response.content || "I received your message but couldn't generate a response.",
        timestamp: assistantTimestamp,
        error: !!response.error,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to session
      if (activeSessionId && !response.error) {
        sessionService.addMessageToSession(activeSessionId, {
          id: assistantMessage.id,
          role: 'assistant',
          content: assistantMessage.content,
          timestamp: assistantTimestamp.toISOString()
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Failed to get response: ${errorMsg}`,
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
