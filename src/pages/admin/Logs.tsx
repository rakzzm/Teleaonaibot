import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, AlertCircle, Info, AlertTriangle, Trash2, Download, Pause, Play } from 'lucide-react';
import './Logs.css';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  source: string;
  message: string;
}

const initialLogs: LogEntry[] = [
  { id: '1', timestamp: '2024-02-05 15:02:34', level: 'info', source: 'gateway', message: 'Gateway started on port 18790' },
  { id: '2', timestamp: '2024-02-05 15:02:33', level: 'info', source: 'telegram', message: 'Connected to Telegram Bot API' },
  { id: '3', timestamp: '2024-02-05 15:02:32', level: 'warning', source: 'openrouter', message: 'Rate limit approaching: 85% of quota used' },
  { id: '4', timestamp: '2024-02-05 15:02:30', level: 'info', source: 'agent', message: 'Agent loop initialized with model anthropic/claude-opus-4-5' },
  { id: '5', timestamp: '2024-02-05 15:02:28', level: 'error', source: 'whatsapp', message: 'Connection timeout, retrying in 5s...' },
  { id: '6', timestamp: '2024-02-05 15:02:25', level: 'info', source: 'cron', message: 'Scheduled job "daily-report" executed successfully' },
  { id: '7', timestamp: '2024-02-05 15:02:20', level: 'info', source: 'memory', message: 'Loaded 156 memories from storage' },
  { id: '8', timestamp: '2024-02-05 15:02:18', level: 'info', source: 'skills', message: 'Loaded 5 skills: github, weather, tmux, summarize, skill-creator' },
];

// Simulated log messages that can appear
const simulatedMessages = [
  { level: 'info' as const, source: 'telegram', message: 'Message received from user @teleaon_user' },
  { level: 'info' as const, source: 'agent', message: 'Processing request with claude-opus-4-5' },
  { level: 'info' as const, source: 'agent', message: 'Response generated in 1.2s' },
  { level: 'warning' as const, source: 'openrouter', message: 'High latency detected: 850ms' },
  { level: 'info' as const, source: 'memory', message: 'Saved new memory to storage' },
  { level: 'info' as const, source: 'cron', message: 'Cron job check completed' },
  { level: 'error' as const, source: 'whatsapp', message: 'Rate limit exceeded, waiting 30s' },
  { level: 'info' as const, source: 'skills', message: 'Skill execution completed: github' },
  { level: 'info' as const, source: 'gateway', message: 'Health check passed' },
  { level: 'warning' as const, source: 'memory', message: 'Memory usage at 75%' },
];

const levelIcons = {
  info: <Info size={14} />,
  warning: <AlertTriangle size={14} />,
  error: <AlertCircle size={14} />,
};

const formatTimestamp = (): string => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').slice(0, 19);
};

export default function AdminLogs() {
  const [logs, setLogs] = useState(initialLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Add a new random log entry
  const addRandomLog = useCallback(() => {
    const randomMsg = simulatedMessages[Math.floor(Math.random() * simulatedMessages.length)];
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: formatTimestamp(),
      level: randomMsg.level,
      source: randomMsg.source,
      message: randomMsg.message,
    };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep max 100 logs
    setLastUpdate(new Date());
  }, []);

  // Auto-update logs when live mode is on
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.5) { // 50% chance to add a log
        addRandomLog();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive, addRandomLog]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add a few new logs on manual refresh
    for (let i = 0; i < 3; i++) {
      addRandomLog();
    }
    
    setIsRefreshing(false);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleExportLogs = () => {
    const logText = logs.map(log => 
      `${log.timestamp} [${log.level.toUpperCase()}] [${log.source}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teleaon-logs-${formatTimestamp().replace(/[: ]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="logs-page animate-fade-in">
      <div className="logs-header">
        <div className="logs-filters">
          <div className="search-box">
            <div className="input-with-icon">
              <Search size={18} className="input-icon" />
              <input
                type="text"
                className="input"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <select
            className="input select level-filter"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div className="logs-actions">
          <button 
            className={`btn btn-ghost btn-sm ${isLive ? 'live-active' : ''}`}
            onClick={() => setIsLive(!isLive)}
            title={isLive ? 'Pause live updates' : 'Resume live updates'}
          >
            {isLive ? <Pause size={14} /> : <Play size={14} />}
            {isLive ? 'Live' : 'Paused'}
          </button>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={handleExportLogs}
            title="Export logs"
          >
            <Download size={14} /> Export
          </button>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={handleClearLogs}
            title="Clear logs"
          >
            <Trash2 size={14} /> Clear
          </button>
          <button 
            className={`btn btn-ghost ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="logs-status-bar">
        <span className="log-count">{filteredLogs.length} logs</span>
        <span className="last-update">
          {isLive && <span className="live-indicator"></span>}
          Last update: {lastUpdate.toLocaleTimeString()}
        </span>
      </div>

      <div className="logs-container glass-card">
        <div className="logs-list">
          {filteredLogs.length === 0 ? (
            <div className="no-logs">No logs to display</div>
          ) : (
            filteredLogs.map((log, index) => (
              <div 
                key={log.id} 
                className={`log-entry log-${log.level} ${index === 0 && isLive ? 'new-log' : ''}`}
              >
                <span className="log-timestamp">{log.timestamp}</span>
                <span className={`log-level level-${log.level}`}>
                  {levelIcons[log.level]}
                  {log.level.toUpperCase()}
                </span>
                <span className="log-source">[{log.source}]</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
