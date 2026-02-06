import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Moon, Sun, Check, Trash2, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import './Navbar.css';

interface NavbarProps {
  title: string;
  subtitle?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

const initialNotifications: Notification[] = [
  { id: '1', title: 'New Message', message: 'You have a new message from Telegram', time: '2 min ago', read: false, type: 'info' },
  { id: '2', title: 'Job Completed', message: 'Daily report cron job executed successfully', time: '15 min ago', read: false, type: 'success' },
  { id: '3', title: 'API Rate Limit', message: 'OpenRouter API approaching rate limit (85%)', time: '1 hour ago', read: false, type: 'warning' },
];

export default function Navbar({ title, subtitle }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="page-title">
          <h1>{title}</h1>
          {subtitle && <span className="page-subtitle">{subtitle}</span>}
        </div>
      </div>

      <div className="navbar-right">
        <div className="search-box">
          <div className="input-with-icon">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              className="input"
              placeholder="Search..."
            />
          </div>
        </div>

        <button 
          className="btn-icon btn-ghost theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="notification-container" ref={dropdownRef}>
          <button 
            className={`btn-icon btn-ghost notification-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown glass-card">
              <div className="notification-header">
                <h4>Notifications</h4>
                <div className="notification-actions">
                  {unreadCount > 0 && (
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={markAllAsRead}
                    >
                      <Check size={12} /> Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={clearAll}
                    >
                      <Trash2 size={12} /> Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    <Bell size={32} />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.read ? 'read' : ''} type-${notification.type}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="notification-content">
                        <span className="notification-title">{notification.title}</span>
                        <span className="notification-message">{notification.message}</span>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                      <button 
                        className="btn-icon btn-ghost btn-sm notification-close"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
