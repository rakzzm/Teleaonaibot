import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  History,
  Brain,
  Sparkles,
  Settings,
  Users,
  Server,
  Radio,
  Clock,
  Wrench,
  FileJson,
  FileText,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const userNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/user' },
  { id: 'chat', label: 'Chat', icon: <MessageSquare size={20} />, path: '/user/chat' },
  { id: 'sessions', label: 'Sessions', icon: <History size={20} />, path: '/user/sessions' },
  { id: 'memory', label: 'Memory', icon: <Brain size={20} />, path: '/user/memory' },
  { id: 'skills', label: 'Skills', icon: <Sparkles size={20} />, path: '/user/skills' },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/user/settings' },
];

const adminNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
  { id: 'users', label: 'Users', icon: <Users size={20} />, path: '/admin/users' },
  { id: 'providers', label: 'Providers', icon: <Server size={20} />, path: '/admin/providers' },
  { id: 'channels', label: 'Channels', icon: <Radio size={20} />, path: '/admin/channels' },
  { id: 'cron', label: 'Cron Jobs', icon: <Clock size={20} />, path: '/admin/cron' },
  { id: 'skills', label: 'Skills', icon: <Wrench size={20} />, path: '/admin/skills' },
  { id: 'config', label: 'Configuration', icon: <FileJson size={20} />, path: '/admin/config' },
  { id: 'logs', label: 'Logs', icon: <FileText size={20} />, path: '/admin/logs' },
  { id: 'status', label: 'Status', icon: <Activity size={20} />, path: '/admin/status' },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { logout, isAdmin, user } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const navItems = isAdminRoute ? adminNavItems : userNavItems;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <img src="/favicon.png" alt="Teleaon Bot" width={28} height={28} />
          </div>
          {!collapsed && <span className="logo-text">Teleaon Bot</span>}
        </div>
        <button className="sidebar-toggle btn-icon btn-ghost" onClick={onToggle}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                end={item.path === '/user' || item.path === '/admin'}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {isAdmin && (
        <div className="sidebar-portal-switch">
          <NavLink
            to={isAdminRoute ? '/user' : '/admin'}
            className="portal-switch-btn"
          >
            <span className="nav-icon">
              {isAdminRoute ? <MessageSquare size={20} /> : <Settings size={20} />}
            </span>
            {!collapsed && (
              <span className="nav-label">
                {isAdminRoute ? 'User Portal' : 'Admin Portal'}
              </span>
            )}
          </NavLink>
        </div>
      )}

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar avatar-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="user-details">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{user?.role || 'user'}</span>
            </div>
          )}
        </div>
        <button className="btn-icon btn-ghost logout-btn" onClick={logout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
