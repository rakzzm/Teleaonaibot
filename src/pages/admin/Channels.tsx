import React, { useState } from 'react';
import { MessageCircle, Phone, MessageSquare, RefreshCw, Settings, X, Check, AlertCircle, ExternalLink } from 'lucide-react';
import './Channels.css';

interface ChannelConfig {
  // Telegram
  botToken?: string;
  // WhatsApp
  phoneNumberId?: string;
  accessToken?: string;
  webhookVerifyToken?: string;
  // Feishu
  appId?: string;
  appSecret?: string;
}

interface Channel {
  id: string;
  type: 'telegram' | 'whatsapp' | 'feishu';
  name: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'connecting';
  users: number;
  messagesTotal: number;
  config: ChannelConfig;
  docsUrl: string;
}

const mockChannels: Channel[] = [
  { id: '1', type: 'telegram', name: 'Telegram', enabled: false, status: 'disconnected', users: 0, messagesTotal: 0, config: {}, docsUrl: 'https://core.telegram.org/bots#how-do-i-create-a-bot' },
  { id: '2', type: 'whatsapp', name: 'WhatsApp Business', enabled: false, status: 'disconnected', users: 0, messagesTotal: 0, config: {}, docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started' },
  { id: '3', type: 'feishu', name: 'Feishu (飞书)', enabled: false, status: 'disconnected', users: 0, messagesTotal: 0, config: {}, docsUrl: 'https://open.feishu.cn/document/home/introduction-to-custom-app-development/create-development-app' },
];

const channelIcons: Record<string, React.ReactNode> = {
  telegram: <MessageCircle size={24} />,
  whatsapp: <Phone size={24} />,
  feishu: <MessageSquare size={24} />,
};

export default function AdminChannels() {
  const [channels, setChannels] = useState(mockChannels);
  const [configModal, setConfigModal] = useState<Channel | null>(null);
  const [formData, setFormData] = useState<ChannelConfig>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isReconnecting, setIsReconnecting] = useState<string | null>(null);

  const toggleChannel = (id: string) => {
    const channel = channels.find(c => c.id === id);
    if (!channel) return;

    // If trying to enable but not configured, open config modal
    if (!channel.enabled && !hasConfiguration(channel)) {
      openConfigModal(channel);
      return;
    }

    setChannels(channels.map((c) =>
      c.id === id ? { 
        ...c, 
        enabled: !c.enabled, 
        status: c.enabled ? 'disconnected' : 'connecting' 
      } : c
    ));

    // Simulate connection after toggle on
    if (!channel.enabled) {
      setTimeout(() => {
        setChannels(prev => prev.map((c) =>
          c.id === id ? { ...c, status: 'connected' } : c
        ));
      }, 1500);
    }
  };

  const hasConfiguration = (channel: Channel): boolean => {
    switch (channel.type) {
      case 'telegram':
        return !!channel.config.botToken;
      case 'whatsapp':
        return !!channel.config.phoneNumberId && !!channel.config.accessToken;
      case 'feishu':
        return !!channel.config.appId && !!channel.config.appSecret;
      default:
        return false;
    }
  };

  const openConfigModal = (channel: Channel) => {
    setConfigModal(channel);
    setFormData({ ...channel.config });
    setTestResult(null);
  };

  const closeConfigModal = () => {
    setConfigModal(null);
    setFormData({});
    setTestResult(null);
    setIsTesting(false);
  };

  const handleReconnect = async (id: string) => {
    setIsReconnecting(id);
    
    // Update to connecting status
    setChannels(channels.map((c) =>
      c.id === id ? { ...c, status: 'connecting' } : c
    ));

    // Simulate reconnection
    await new Promise(resolve => setTimeout(resolve, 2000));

    setChannels(channels.map((c) =>
      c.id === id ? { ...c, status: 'connected' } : c
    ));

    setIsReconnecting(null);
  };

  const testConnection = async () => {
    if (!configModal) return;

    setIsTesting(true);
    setTestResult(null);

    // Simulate API test
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Validate based on channel type
    let isValid = false;
    switch (configModal.type) {
      case 'telegram':
        isValid = !!formData.botToken && formData.botToken.includes(':');
        break;
      case 'whatsapp':
        isValid = !!formData.phoneNumberId && !!formData.accessToken;
        break;
      case 'feishu':
        isValid = !!formData.appId && !!formData.appSecret;
        break;
    }
    
    if (isValid) {
      setTestResult({ success: true, message: 'Connection successful! Channel is ready to use.' });
    } else {
      setTestResult({ success: false, message: 'Invalid configuration. Please check your credentials.' });
    }
    
    setIsTesting(false);
  };

  const saveConfiguration = () => {
    if (!configModal) return;

    setChannels(channels.map((c) => {
      if (c.id === configModal.id) {
        return {
          ...c,
          config: { ...formData },
          enabled: true,
          status: 'connecting' as const,
        };
      }
      return c;
    }));

    // Simulate connection after saving
    setTimeout(() => {
      setChannels(prev => prev.map((c) =>
        c.id === configModal.id ? { ...c, status: 'connected' } : c
      ));
    }, 1500);

    closeConfigModal();
  };

  const renderConfigFields = () => {
    if (!configModal) return null;

    switch (configModal.type) {
      case 'telegram':
        return (
          <>
            <div className="input-group">
              <label className="input-label">Bot Token *</label>
              <input
                type="password"
                className="input"
                placeholder="123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                value={formData.botToken || ''}
                onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
              />
              <span className="input-hint">
                Get your bot token from <a href="https://t.me/botfather" target="_blank" rel="noopener noreferrer">@BotFather</a>
              </span>
            </div>
          </>
        );

      case 'whatsapp':
        return (
          <>
            <div className="input-group">
              <label className="input-label">Phone Number ID *</label>
              <input
                type="text"
                className="input"
                placeholder="1234567890123456"
                value={formData.phoneNumberId || ''}
                onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Access Token *</label>
              <input
                type="password"
                className="input"
                placeholder="EAAxxxxxxx..."
                value={formData.accessToken || ''}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Webhook Verify Token</label>
              <input
                type="text"
                className="input"
                placeholder="your-verify-token"
                value={formData.webhookVerifyToken || ''}
                onChange={(e) => setFormData({ ...formData, webhookVerifyToken: e.target.value })}
              />
              <span className="input-hint">
                Used to verify webhook requests from Meta
              </span>
            </div>
          </>
        );

      case 'feishu':
        return (
          <>
            <div className="input-group">
              <label className="input-label">App ID *</label>
              <input
                type="text"
                className="input"
                placeholder="cli_xxxxxxxxxxxxxxxx"
                value={formData.appId || ''}
                onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">App Secret *</label>
              <input
                type="password"
                className="input"
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={formData.appSecret || ''}
                onChange={(e) => setFormData({ ...formData, appSecret: e.target.value })}
              />
              <span className="input-hint">
                Get these from the <a href="https://open.feishu.cn/app" target="_blank" rel="noopener noreferrer">Feishu Developer Console</a>
              </span>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const isFormValid = (): boolean => {
    if (!configModal) return false;
    switch (configModal.type) {
      case 'telegram':
        return !!formData.botToken;
      case 'whatsapp':
        return !!formData.phoneNumberId && !!formData.accessToken;
      case 'feishu':
        return !!formData.appId && !!formData.appSecret;
      default:
        return false;
    }
  };

  return (
    <div className="channels-page animate-fade-in">
      <div className="channels-grid">
        {channels.map((channel) => (
          <div key={channel.id} className={`channel-card glass-card ${channel.enabled ? 'enabled' : ''}`}>
            <div className="channel-header">
              <div className="channel-icon-wrapper">
                {channelIcons[channel.type]}
              </div>
              <div className="channel-title">
                <h3>{channel.name}</h3>
                <span className={`badge ${channel.status === 'connected' ? 'badge-success' : channel.status === 'connecting' ? 'badge-warning' : ''}`}>
                  <span className={`status-dot ${channel.status === 'connected' ? 'online pulse' : channel.status === 'connecting' ? 'connecting' : 'offline'}`}></span>
                  {channel.status}
                </span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={channel.enabled}
                  onChange={() => toggleChannel(channel.id)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="channel-stats">
              <div className="stat">
                <span className="stat-value">{channel.users}</span>
                <span className="stat-label">Users</span>
              </div>
              <div className="stat">
                <span className="stat-value">{channel.messagesTotal.toLocaleString()}</span>
                <span className="stat-label">Messages</span>
              </div>
            </div>

            <div className="channel-actions">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => handleReconnect(channel.id)}
                disabled={!channel.enabled || isReconnecting === channel.id}
              >
                <RefreshCw size={14} className={isReconnecting === channel.id ? 'spinning' : ''} />
                {isReconnecting === channel.id ? 'Reconnecting...' : 'Reconnect'}
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => openConfigModal(channel)}
              >
                <Settings size={14} /> Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {configModal && (
        <div className="modal-overlay" onClick={closeConfigModal}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-icon">{channelIcons[configModal.type]}</span>
                <h3>Configure {configModal.name}</h3>
              </div>
              <button className="btn-icon btn-ghost" onClick={closeConfigModal}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {renderConfigFields()}

              {testResult && (
                <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                  {testResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="docs-link">
                <ExternalLink size={14} />
                <a href={configModal.docsUrl} target="_blank" rel="noopener noreferrer">
                  View {configModal.name} Setup Documentation
                </a>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-ghost" 
                onClick={testConnection}
                disabled={isTesting || !isFormValid()}
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
              <button 
                className="btn btn-primary" 
                onClick={saveConfiguration}
                disabled={!isFormValid()}
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
