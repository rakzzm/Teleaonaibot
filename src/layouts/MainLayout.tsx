import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import './MainLayout.css';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  // User routes
  '/user': { title: 'Dashboard', subtitle: 'Welcome back!' },
  '/user/chat': { title: 'Chat', subtitle: 'Talk to your AI assistant' },
  '/user/sessions': { title: 'Sessions', subtitle: 'Your conversation history' },
  '/user/memory': { title: 'Memory', subtitle: 'Your personal memories' },
  '/user/skills': { title: 'Skills', subtitle: 'Available agent skills' },
  '/user/settings': { title: 'Settings', subtitle: 'Configure your preferences' },
  // Admin routes
  '/admin': { title: 'Admin Dashboard', subtitle: 'System overview' },
  '/admin/users': { title: 'Users', subtitle: 'Manage users' },
  '/admin/providers': { title: 'Providers', subtitle: 'LLM providers configuration' },
  '/admin/channels': { title: 'Channels', subtitle: 'Telegram, WhatsApp, Feishu' },
  '/admin/cron': { title: 'Cron Jobs', subtitle: 'Scheduled tasks' },
  '/admin/skills': { title: 'Skills', subtitle: 'Manage agent skills' },
  '/admin/config': { title: 'Configuration', subtitle: 'System configuration' },
  '/admin/logs': { title: 'Logs', subtitle: 'System logs' },
  '/admin/status': { title: 'Status', subtitle: 'System health' },
};

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const pageInfo = pageTitles[location.pathname] || { title: 'Teleaon Bot' };

  return (
    <div className={`main-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className="main-content">
        <Navbar title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Global SVG Gradient for Icons */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="teleaon-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" /> {/* Sky Blue */}
            <stop offset="100%" stopColor="#ec4899" /> {/* Pink */}
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
