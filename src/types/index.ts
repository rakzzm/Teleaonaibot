import type { ReactNode } from 'react';

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: string;
  lastActive?: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Chat types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sessionId: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

// Provider types
export interface Provider {
  id: string;
  name: string;
  displayName: string;
  apiKey?: string;
  apiBase?: string;
  isConfigured: boolean;
  isDefault: boolean;
  models: string[];
}

// Channel types
export interface Channel {
  id: string;
  type: 'telegram' | 'whatsapp' | 'feishu';
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, unknown>;
  lastActivity?: string;
}

// Cron Job types
export interface CronJob {
  id: string;
  name: string;
  message: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  channel?: string;
  to?: string;
}

// Skill types
export interface Skill {
  id: string;
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
  category: string;
  icon?: string;
}

// Memory types
export interface Memory {
  id: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// System status
export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'down';
  version: string;
  uptime: number;
  gateway: {
    running: boolean;
    port: number;
  };
  channels: {
    telegram: boolean;
    whatsapp: boolean;
    feishu: boolean;
  };
  providers: {
    configured: string[];
    default: string;
  };
}

// Stats
export interface DashboardStats {
  totalMessages: number;
  activeSessions: number;
  totalUsers: number;
  cronJobsActive: number;
  messageChange: number;
  sessionChange: number;
}

// Navigation
export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
  badge?: string | number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Config types
export interface AppConfig {
  providers: Record<string, ProviderConfig>;
  agents: {
    defaults: {
      model: string;
    };
  };
  channels: Record<string, ChannelConfig>;
  tools: {
    web?: {
      search?: {
        apiKey?: string;
      };
    };
  };
}

export interface ProviderConfig {
  apiKey?: string;
  apiBase?: string;
}

export interface ChannelConfig {
  enabled: boolean;
  token?: string;
  appId?: string;
  appSecret?: string;
  allowFrom?: string[];
}
