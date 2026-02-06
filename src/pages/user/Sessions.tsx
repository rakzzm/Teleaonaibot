import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, Trash2, MoreVertical, Search } from 'lucide-react';
import { sessionService } from '../../services/sessionService';
import type { Session } from '../../services/sessionService';
import './Sessions.css';

export default function UserSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadSessions = () => {
    setSessions(sessionService.getSessions());
  };

  useEffect(() => {
    loadSessions();

    // Listen for real-time updates from Chat.tsx or other sessions
    window.addEventListener('teleaon_sessions_updated', loadSessions);
    return () => window.removeEventListener('teleaon_sessions_updated', loadSessions);
  }, []);

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    sessionService.deleteSession(id);
    loadSessions();
  };

  return (
    <div className="sessions-page animate-fade-in">
      <div className="sessions-header">
        <div className="search-box">
          <div className="input-with-icon">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              className="input"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="sessions-count">
          {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="sessions-list">
        {filteredSessions.map((session) => (
          <div key={session.id} className="session-card glass-card">
            <Link to={`/user/chat?session=${session.id}`} className="session-content">
              <div className="session-icon">
                <MessageSquare size={20} />
              </div>
              <div className="session-info">
                <h3 className="session-title">{session.title}</h3>
                <p className="session-preview">{session.preview}</p>
                <div className="session-meta">
                  <span className="meta-item">
                    <MessageSquare size={12} />
                    {session.messageCount} messages
                  </span>
                  <span className="meta-item">
                    <Calendar size={12} />
                    {new Date(session.updatedAt).toLocaleDateString() === new Date().toLocaleDateString()
                      ? new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : new Date(session.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
            <div className="session-actions">
              <button
                className="btn-icon btn-ghost btn-sm"
                onClick={() => handleDelete(session.id)}
                title="Delete session"
              >
                <Trash2 size={16} />
              </button>
              <button className="btn-icon btn-ghost btn-sm" title="More options">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}

        {filteredSessions.length === 0 && (
          <div className="empty-state glass-card">
            <MessageSquare size={48} />
            <h3>No sessions found</h3>
            <p>Start a new chat to create your first session!</p>
            <Link to="/user/chat" className="btn btn-primary">
              Start Chatting
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
