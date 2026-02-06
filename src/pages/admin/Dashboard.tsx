
import {
  Users,
  MessageSquare,
  Clock,
  Activity,
  Server,
  Radio,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import './Dashboard.css';

const stats = [
  { id: 'users', label: 'Total Users', value: '1,247', change: '+8.2%', positive: true, icon: <Users size={20} /> },
  { id: 'messages', label: 'Messages Today', value: '8,432', change: '+15.3%', positive: true, icon: <MessageSquare size={20} /> },
  { id: 'sessions', label: 'Active Sessions', value: '156', change: '-2.1%', positive: false, icon: <Clock size={20} /> },
  { id: 'uptime', label: 'System Uptime', value: '99.9%', change: '', positive: true, icon: <Activity size={20} /> },
];

const providers = [
  { id: 'openrouter', name: 'OpenRouter', status: 'connected', usage: '78%' },
  { id: 'anthropic', name: 'Anthropic', status: 'connected', usage: '45%' },
  { id: 'openai', name: 'OpenAI', status: 'disconnected', usage: '0%' },
  { id: 'groq', name: 'Groq', status: 'connected', usage: '23%' },
];

const channels = [
  { id: 'telegram', name: 'Telegram', status: 'online', users: 524 },
  { id: 'whatsapp', name: 'WhatsApp', status: 'online', users: 312 },
  { id: 'feishu', name: 'Feishu', status: 'offline', users: 0 },
];

const recentActivity = [
  { id: '1', type: 'user', message: 'New user registered: john@example.com', time: '2 min ago' },
  { id: '2', type: 'cron', message: 'Cron job "daily-report" executed successfully', time: '15 min ago' },
  { id: '3', type: 'channel', message: 'WhatsApp channel reconnected', time: '1 hour ago' },
  { id: '4', type: 'provider', message: 'OpenRouter API rate limit warning', time: '2 hours ago' },
];

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard animate-fade-in">
      {/* Stats Grid */}
      <section className="admin-stats-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="glass-card admin-stat-card">
            <div className="stat-icon-wrapper">
              {stat.icon}
            </div>
            <div className="stat-details">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-value-row">
                <span className="stat-value">{stat.value}</span>
                {stat.change && (
                  <span className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                    {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {stat.change}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="admin-grid">
        {/* Providers Status */}
        <section className="glass-card">
          <div className="card-header">
            <h3><Server size={18} /> Providers</h3>
          </div>
          <div className="provider-list">
            {providers.map((provider) => (
              <div key={provider.id} className="provider-item">
                <div className="provider-info">
                  <span className={`status-dot ${provider.status === 'connected' ? 'online' : 'offline'}`}></span>
                  <span className="provider-name">{provider.name}</span>
                </div>
                <div className="provider-usage">
                  <div className="usage-bar">
                    <div className="usage-fill" style={{ width: provider.usage }}></div>
                  </div>
                  <span className="usage-text">{provider.usage}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Channels Status */}
        <section className="glass-card">
          <div className="card-header">
            <h3><Radio size={18} /> Channels</h3>
          </div>
          <div className="channel-list">
            {channels.map((channel) => (
              <div key={channel.id} className="channel-item">
                <div className="channel-info">
                  <span className={`status-dot ${channel.status === 'online' ? 'online pulse' : 'offline'}`}></span>
                  <span className="channel-name">{channel.name}</span>
                </div>
                <span className="channel-users">{channel.users} users</span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="glass-card activity-section">
          <div className="card-header">
            <h3><Activity size={18} /> Recent Activity</h3>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
