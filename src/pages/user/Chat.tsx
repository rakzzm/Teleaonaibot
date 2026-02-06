import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MoreVertical, Bot, User, Loader2, AlertCircle, Settings } from 'lucide-react';
import type { Session } from '../../services/sessionService';
import { sendChatMessage } from '../../services/api';
import { sessionService } from '../../services/sessionService';
import { skillService } from '../../services/skillService';
import { memoryService } from '../../services/memoryService';
import { toolExecutor } from '../../services/toolExecutor';
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
// Helper to parse and render message content with markdown and tool support
const MessageContent = ({ content }: { content: string }) => {
  // Split by tool_code blocks
  const parts = content.split(/(```tool_code[\s\S]*?```)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('```tool_code')) {
          // Extract tool call details
          const toolMatch = part.match(/```tool_code\s+([\s\S]*?)```/);
          const toolCall = toolMatch ? toolMatch[1].trim() : 'Unknown Action';
          
          // Try to make it look nicer (e.g., github.search -> GitHub Search)
          const skillName = toolCall.split('(')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
          
          return (
            <div key={index} className="skill-call-card glass-card glow">
              <div className="skill-call-header">
                <Bot size={14} className="skill-icon" />
                <span className="skill-label">Skill Action</span>
              </div>
              <div className="skill-call-body">
                <span className="skill-name">{skillName}</span>
                <code className="skill-code">{toolCall}</code>
              </div>
              <div className="skill-call-status">
                <div className="status-indicator processing"></div>
                <span>Executing background task...</span>
              </div>
            </div>
          );
        }

        // Basic Markdown-ish parsing for the rest
        return (
          <div key={index} className="text-content">
            {part.split('\n').map((line, i) => {
              const parseBold = (text: string) => {
                const boldParts = text.split(/(\*\*.*?\*\*)/g);
                return boldParts.map((p, j) => 
                  p.startsWith('**') && p.endsWith('**') 
                    ? <strong key={j}>{p.slice(2, -2)}</strong> 
                    : p
                );
              };

              // Handle inline code
              const parseInlineCode = (items: (string | React.ReactNode)[]) => {
                const newItems: (string | React.ReactNode)[] = [];
                items.forEach((item, idx) => {
                  if (typeof item === 'string') {
                    const codeParts = item.split(/(`.*?`)/g);
                    codeParts.forEach((p, k) => {
                      if (p.startsWith('`') && p.endsWith('`')) {
                        newItems.push(<code key={`${idx}-${k}`} className="inline-code">{p.slice(1, -1)}</code>);
                      } else {
                        newItems.push(p);
                      }
                    });
                  } else {
                    newItems.push(item);
                  }
                });
                return newItems;
              };

              const parsedLine = parseInlineCode(parseBold(line));

              return (
                <p key={i}>
                  {parsedLine.length > 0 ? parsedLine : <br />}
                </p>
              );
            })}
          </div>
        );
      })}
    </>
  );
};

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
      const currentMessagesForAI = [
        ...messages
          .filter(m => !m.error)
          .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: input }
      ];

      const enabledSkills = skillService.getEnabledSkills();
      const skillsDescription = enabledSkills.length > 0
        ? `\nYou have the following skills enabled: ${enabledSkills.map((s) => `[${s.displayName}: ${s.description}]`).join(', ')}.`
        : '';

      const userMemories = memoryService.getMemories();
      const memoriesDescription = userMemories.length > 0
        ? `\nYou remember the following about the user: ${userMemories.map(m => `[${m.category}: ${m.content}]`).join(', ')}.`
        : '';

      const systemMessage = {
        role: 'system' as const,
        content: `You are Teleaon Bot, a helpful and intelligent AI assistant. Be concise, friendly, and helpful. Format your responses with markdown when appropriate.${skillsDescription}${memoriesDescription}`,
      };

      // Turn 1: Initial AI response (might contain a tool call)
      let response = await sendChatMessage({
        messages: [systemMessage, ...currentMessagesForAI],
        model: config.model,
        apiKey: config.apiKey,
        provider: config.provider,
        useGrounding: config.provider?.toLowerCase() === 'gemini',
      });

      let assistantContent = response.content || "";
      
      // TOOL EXECUTION LOOP
      // If the AI output a tool call, we execute it and send it back
      if (assistantContent.includes('```tool_code')) {
        const toolMatch = assistantContent.match(/```tool_code\s+([\s\S]*?)```/);
        if (toolMatch) {
          const toolCall = toolMatch[1].trim();
          
          // 1. Add the tool call message to the UI first so user sees it "executing"
          const toolCallMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, toolCallMsg]);
          
          // 2. Execute the tool
          const toolResult = await toolExecutor.execute(toolCall);
          
          // 3. Prepare recursive call with tool results
          const resultStr = toolResult.success 
            ? `Tool Result: ${JSON.stringify(toolResult.data)}` 
            : `Tool Error: ${toolResult.error}`;
            
          currentMessagesForAI.push({ role: 'assistant', content: assistantContent });
          currentMessagesForAI.push({ role: 'user', content: resultStr });

          // 4. Get final summarized response from AI
          response = await sendChatMessage({
            messages: [systemMessage, ...currentMessagesForAI],
            model: config.model,
            apiKey: config.apiKey,
            provider: config.provider,
            useGrounding: config.provider?.toLowerCase() === 'gemini',
          });
          
          assistantContent = response.content || "";
        }
      }

      const assistantTimestamp = new Date();
      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: response.error 
          ? `❌ Error: ${response.error}` 
          : assistantContent || "I received the data but couldn't generate a summary.",
        timestamp: assistantTimestamp,
        error: !!response.error,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to session
      if (activeSessionId && !response.error) {
        // We might want to save both if there was a tool call
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
              <img src="/bot-avatar.png" alt="Bot" />
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
                    <img src="/bot-avatar.png" alt="Bot" />
                  </div>
                )}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  <MessageContent content={message.content} />
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
