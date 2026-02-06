import { useState, useEffect } from 'react';
import { Activity, Server, Radio, CheckCircle, Cpu, HardDrive, Wifi, RefreshCw, AlertCircle, XCircle } from 'lucide-react';
import './Status.css';

interface SystemStatus {
  status: 'healthy' | 'degraded' | 'error';
  version: string;
  uptime: string;
  gateway: {
    running: boolean;
    port: number;
  };
}

interface Service {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  latency: string;
}

interface Channel {
  id: string;
  name: string;
  status: 'online' | 'offline';
  messages: number;
}

interface Provider {
  id: string;
  name: string;
  status: 'online' | 'offline';
  requests: number;
}

interface Metric {
  id: string;
  name: string;
  value: string;
  percentage?: number;
  icon: React.ReactNode;
}

const initialSystemStatus: SystemStatus = {
  status: 'healthy',
  version: '0.1.3.post4',
  uptime: '4d 12h 35m',
  gateway: {
    running: true,
    port: 18790,
  },
};

const initialServices: Service[] = [
  { id: 'gateway', name: 'Gateway', status: 'online', latency: '2ms' },
  { id: 'agent', name: 'Agent Loop', status: 'online', latency: '45ms' },
  { id: 'memory', name: 'Memory Store', status: 'online', latency: '3ms' },
  { id: 'cron', name: 'Cron Scheduler', status: 'online', latency: '1ms' },
];

const initialChannels: Channel[] = [
  { id: 'telegram', name: 'Telegram', status: 'online', messages: 1243 },
  { id: 'whatsapp', name: 'WhatsApp', status: 'online', messages: 876 },
  { id: 'feishu', name: 'Feishu', status: 'offline', messages: 0 },
];

const initialProviders: Provider[] = [
  { id: 'openrouter', name: 'OpenRouter', status: 'online', requests: 4521 },
  { id: 'groq', name: 'Groq', status: 'online', requests: 234 },
];

export default function AdminStatus() {
  const [systemStatus] = useState(initialSystemStatus);
  const [services, setServices] = useState(initialServices);
  const [channels, setChannels] = useState(initialChannels);
  const [providers, setProviders] = useState(initialProviders);
  const [cpuUsage, setCpuUsage] = useState(23);
  const [memoryUsage, setMemoryUsage] = useState(456);
  const [networkUsage, setNetworkUsage] = useState(12);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  // Update metrics in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate CPU fluctuation (15-45%)
      setCpuUsage(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(15, Math.min(45, prev + change));
      });

      // Simulate memory fluctuation (400-600 MB)
      setMemoryUsage(prev => {
        const change = (Math.random() - 0.5) * 20;
        return Math.max(400, Math.min(600, prev + change));
      });

      // Simulate network fluctuation (5-25 Mbps)
      setNetworkUsage(prev => {
        const change = (Math.random() - 0.5) * 5;
        return Math.max(5, Math.min(25, prev + change));
      });

      // Update last update time
      setLastUpdate(new Date());

      // Update uptime
      setUptimeSeconds(prev => prev + 2);

      // Randomly update message counts
      setChannels(prev => prev.map(ch => ({
        ...ch,
        messages: ch.status === 'online' ? ch.messages + Math.floor(Math.random() * 3) : ch.messages
      })));

      // Randomly update request counts
      setProviders(prev => prev.map(p => ({
        ...p,
        requests: p.status === 'online' ? p.requests + Math.floor(Math.random() * 5) : p.requests
      })));

      // Update service latencies
      setServices(prev => prev.map(s => ({
        ...s,
        latency: s.status === 'online' ? `${Math.floor(Math.random() * 50) + 1}ms` : 'N/A'
      })));

    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${4 + Math.floor(days / 24)}d ${12 + hours}h ${35 + minutes}m`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const metrics: Metric[] = [
    { id: 'cpu', name: 'CPU', value: `${Math.round(cpuUsage)}%`, percentage: cpuUsage, icon: <Cpu size={16} /> },
    { id: 'memory', name: 'Memory', value: `${Math.round(memoryUsage)} MB`, percentage: memoryUsage / 10, icon: <HardDrive size={16} /> },
    { id: 'network', name: 'Network', value: `${Math.round(networkUsage)} Mbps`, percentage: networkUsage * 4, icon: <Wifi size={16} /> },
  ];

  const getStatusIcon = () => {
    switch (systemStatus.status) {
      case 'healthy':
        return <CheckCircle size={48} />;
      case 'degraded':
        return <AlertCircle size={48} />;
      case 'error':
        return <XCircle size={48} />;
    }
  };

  const getStatusText = () => {
    switch (systemStatus.status) {
      case 'healthy':
        return { text: 'Healthy', subtitle: 'All systems operational' };
      case 'degraded':
        return { text: 'Degraded', subtitle: 'Some services experiencing issues' };
      case 'error':
        return { text: 'Error', subtitle: 'Critical services are down' };
    }
  };

  return (
    <div className="status-page animate-fade-in">
      {/* Header with refresh */}
      <div className="status-header">
        <span className="last-update">
          <span className="live-indicator"></span>
          Last update: {lastUpdate.toLocaleTimeString()}
        </span>
        <button 
          className={`btn btn-ghost ${isRefreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {/* Overall Status */}
      <section className="status-overview glass-card glow">
        <div className="status-main">
          <div className={`status-indicator ${systemStatus.status}`}>
            {getStatusIcon()}
          </div>
          <div className="status-info">
            <h2>System Status: <span className={`status-text ${systemStatus.status}`}>{getStatusText().text}</span></h2>
            <p>{getStatusText().subtitle}</p>
          </div>
        </div>
        <div className="status-meta">
          <div className="meta-item">
            <span className="meta-label">Version</span>
            <span className="meta-value">{systemStatus.version}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Uptime</span>
            <span className="meta-value">{formatUptime(uptimeSeconds)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Gateway</span>
            <span className="meta-value">:{systemStatus.gateway.port}</span>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="metrics-grid">
        {metrics.map((metric) => (
          <div key={metric.id} className="glass-card metric-card">
            <div className="metric-icon">{metric.icon}</div>
            <div className="metric-info">
              <span className="metric-label">{metric.name}</span>
              <span className="metric-value">{metric.value}</span>
            </div>
            <div className="metric-bar">
              <div 
                className="metric-bar-fill" 
                style={{ width: `${Math.min(100, metric.percentage || 0)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </section>

      <div className="status-grid">
        {/* Services */}
        <section className="glass-card">
          <h3><Server size={18} /> Services</h3>
          <div className="status-list">
            {services.map((service) => (
              <div key={service.id} className="status-item">
                <div className="item-info">
                  <span className={`status-dot ${service.status === 'online' ? 'online pulse' : service.status === 'degraded' ? 'connecting' : 'offline'}`}></span>
                  <span className="item-name">{service.name}</span>
                </div>
                <span className="item-latency">{service.latency}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Channels */}
        <section className="glass-card">
          <h3><Radio size={18} /> Channels</h3>
          <div className="status-list">
            {channels.map((channel) => (
              <div key={channel.id} className="status-item">
                <div className="item-info">
                  <span className={`status-dot ${channel.status === 'online' ? 'online pulse' : 'offline'}`}></span>
                  <span className="item-name">{channel.name}</span>
                </div>
                <span className="item-count">{channel.messages.toLocaleString()} msgs</span>
              </div>
            ))}
          </div>
        </section>

        {/* Providers */}
        <section className="glass-card">
          <h3><Activity size={18} /> Providers</h3>
          <div className="status-list">
            {providers.map((provider) => (
              <div key={provider.id} className="status-item">
                <div className="item-info">
                  <span className={`status-dot ${provider.status === 'online' ? 'online pulse' : 'offline'}`}></span>
                  <span className="item-name">{provider.name}</span>
                </div>
                <span className="item-count">{provider.requests.toLocaleString()} reqs</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
