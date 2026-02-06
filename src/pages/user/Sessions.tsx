import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, Trash2, MoreVertical, Search } from 'lucide-react';
import './Sessions.css';

interface Session {
  id: string;
  title: string;
  preview: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

const mockSessions: Session[] = [
  {
    id: '1',
    title: 'Market Analysis Report',
    preview: 'Here is the latest market analysis for today...',
    messageCount: 24,
    createdAt: '2024-02-05',
    updatedAt: '2 minutes ago',
  },
  {
    id: '2',
    title: 'Code Review - Authentication Module',
    preview: 'I have reviewed your pull request and found...',
    messageCount: 18,
    createdAt: '2024-02-05',
    updatedAt: '1 hour ago',
  },
  {
    id: '3',
    title: 'Daily Schedule Planning',
    preview: 'Your schedule for today includes several meetings...',
    messageCount: 12,
    createdAt: '2024-02-04',
    updatedAt: '3 hours ago',
  },
  {
    id: '4',
    title: 'Research: AI Trends 2024',
    preview: 'Based on my research, the top AI trends for 2024...',
    messageCount: 45,
    createdAt: '2024-02-03',
    updatedAt: 'Yesterday',
  },
  {
    id: '5',
    title: 'Project Planning Meeting Notes',
    preview: 'Key takeaways from the project planning session...',
    messageCount: 32,
    createdAt: '2024-02-02',
    updatedAt: '2 days ago',
  },
];

export default function UserSessions() {
  const [sessions, setSessions] = useState(mockSessions);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
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
                    {session.updatedAt}
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
