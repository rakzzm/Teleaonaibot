
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  TrendingUp,
  Clock,
  Brain,
  Sparkles,
  ArrowRight,
  Zap,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

const stats = [
  { id: 'messages', label: 'Messages Today', value: '142', change: '+12%', positive: true, icon: <MessageSquare size={20} /> },
  { id: 'sessions', label: 'Active Sessions', value: '8', change: '+3', positive: true, icon: <Clock size={20} /> },
  { id: 'memories', label: 'Memories', value: '56', change: '+5', positive: true, icon: <Brain size={20} /> },
  { id: 'skills', label: 'Active Skills', value: '12', change: '', positive: true, icon: <Sparkles size={20} /> },
];

const recentChats = [
  { id: '1', title: 'Market Analysis Report', preview: 'Here is the latest market analysis...', time: '2 min ago' },
  { id: '2', title: 'Code Review', preview: 'I have reviewed your pull request...', time: '15 min ago' },
  { id: '3', title: 'Daily Schedule', preview: 'Your schedule for today includes...', time: '1 hour ago' },
  { id: '4', title: 'Research Notes', preview: 'Based on my research...', time: '3 hours ago' },
];

const quickActions = [
  { id: 'chat', label: 'Start New Chat', icon: <MessageSquare size={20} />, path: '/user/chat', color: 'primary' },
  { id: 'skills', label: 'Browse Skills', icon: <Sparkles size={20} />, path: '/user/skills', color: 'purple' },
  { id: 'memory', label: 'View Memories', icon: <Brain size={20} />, path: '/user/memory', color: 'lime' },
];

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard animate-fade-in">
      {/* Welcome Section */}
      <section className="welcome-section glass-card glow">
        <div className="welcome-content">
          <div className="welcome-icon">
            <Bot size={48} />
          </div>
          <div className="welcome-text">
            <h2>Welcome back, <span className="text-gradient">{user?.name || 'User'}</span>!</h2>
            <p>Your AI assistant is ready to help. What would you like to do today?</p>
          </div>
        </div>
        <Link to="/user/chat" className="btn btn-primary btn-lg">
          Start Chatting <ArrowRight size={18} />
        </Link>
      </section>

      {/* Stats Grid */}
      <section className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="glass-card stat-card">
            <div className="stat-header">
              <span className="stat-icon">{stat.icon}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
            <div className="stat-value">{stat.value}</div>
            {stat.change && (
              <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                <TrendingUp size={14} />
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Quick Actions & Recent Chats */}
      <div className="dashboard-grid">
        {/* Quick Actions */}
        <section className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-list">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                to={action.path}
                className={`action-card glass-card action-${action.color}`}
              >
                <div className="action-icon">{action.icon}</div>
                <span className="action-label">{action.label}</span>
                <ArrowRight size={16} className="action-arrow" />
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Chats */}
        <section className="recent-chats">
          <div className="section-header">
            <h3>Recent Conversations</h3>
            <Link to="/user/sessions" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="chats-list">
            {recentChats.map((chat) => (
              <Link key={chat.id} to={`/user/chat?session=${chat.id}`} className="chat-item glass-card">
                <div className="chat-content">
                  <h4 className="chat-title">{chat.title}</h4>
                  <p className="chat-preview">{chat.preview}</p>
                </div>
                <span className="chat-time">{chat.time}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Features Highlight */}
      <section className="features-section">
        <h3>What I Can Do</h3>
        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon-wrapper primary">
              <Zap size={24} />
            </div>
            <h4>24/7 Real-Time Analysis</h4>
            <p>Get instant market insights, trend analysis, and data-driven recommendations.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon-wrapper purple">
              <MessageSquare size={24} />
            </div>
            <h4>Full-Stack Engineering</h4>
            <p>Code assistance, debugging, and software development support.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon-wrapper lime">
              <Clock size={24} />
            </div>
            <h4>Smart Scheduling</h4>
            <p>Automate your daily routines and manage tasks efficiently.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon-wrapper orange">
              <Brain size={24} />
            </div>
            <h4>Personal Knowledge</h4>
            <p>Learn and remember your preferences for a personalized experience.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
