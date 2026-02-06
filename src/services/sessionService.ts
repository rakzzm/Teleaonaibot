export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  error?: boolean;
}

export interface Session {
  id: string;
  title: string;
  preview: string;
  messageCount: number;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const SESSIONS_STORAGE_KEY = 'teleaon_chat_sessions';

export const sessionService = {
  getSessions(): Session[] {
    try {
      const data = localStorage.getItem(SESSIONS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading sessions:', e);
      return [];
    }
  },

  getSession(id: string): Session | undefined {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === id);
  },

  saveSession(session: Session): void {
    try {
      const sessions = this.getSessions();
      const index = sessions.findIndex(s => s.id === session.id);
      
      if (index >= 0) {
        sessions[index] = session;
      } else {
        sessions.unshift(session);
      }
      
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      // Dispatch a storage event for real-time syncing in the same tab if needed
      window.dispatchEvent(new Event('teleaon_sessions_updated'));
    } catch (e) {
      console.error('Error saving session:', e);
    }
  },

  addMessageToSession(sessionId: string, message: Message): void {
    const session = this.getSession(sessionId);
    if (session) {
      session.messages.push(message);
      session.messageCount = session.messages.filter(m => m.role !== 'system').length;
      session.preview = message.content.slice(0, 100) + (message.content.length > 100 ? '...' : '');
      session.updatedAt = new Date().toISOString();
      this.saveSession(session);
    }
  },

  deleteSession(id: string): void {
    try {
      const sessions = this.getSessions().filter(s => s.id !== id);
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      window.dispatchEvent(new Event('teleaon_sessions_updated'));
    } catch (e) {
      console.error('Error deleting session:', e);
    }
  }
};
