import { useState, useEffect } from 'react';
import { 
  Key, Bot, User, Save, Eye, EyeOff, Check, 
  RefreshCw, Plus, Trash2, X, CreditCard, Shield, 
  Share2, Smartphone, Mail, Globe, Github, Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Settings.css';

interface ApiKeyConfig {
  id: string;
  name: string;
  key: string;
  provider: string;
  status: 'valid' | 'invalid' | 'unknown';
  lastTested?: string;
}

const SETTINGS_STORAGE_KEY = 'teleaon_user_settings';
const API_KEYS_STORAGE_KEY = 'teleaon_user_api_keys';

type TabType = 'account' | 'ai' | 'billing' | 'security' | 'integrations';

export default function UserSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Load settings from localStorage
  const [originalSettings, setOriginalSettings] = useState(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch { /* ignore */ }
    }
    return {
      name: user?.name || '',
      email: user?.email || '',
      bio: 'AI enthusiast and developer exploring Teleaon Bot.',
      model: 'anthropic/claude-opus-4-5',
      notifications: true,
      twoFactor: false
    };
  });

  const [settings, setSettings] = useState(originalSettings);

  // Load API keys
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>(() => {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(apiKeys));
  }, [apiKeys]);

  const [newKey, setNewKey] = useState({ name: '', key: '', provider: 'openrouter' });

  const tabs = [
    { id: 'account', label: 'Account', icon: <User size={18} /> },
    { id: 'ai', label: 'AI & Keys', icon: <Bot size={18} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'integrations', label: 'Integrations', icon: <Share2 size={18} /> },
  ];

  const plans = [
    { id: 'free', name: 'Free', price: '$0', features: ['100 messages/mo', 'Standard models', 'Basic memory'] },
    { id: 'pro', name: 'Pro', price: '$19', features: ['Unlimited messages', 'Claude 3.5 & GPT-4o', 'Advanced skills', 'Priority support'], current: true },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: ['Dedicated instance', 'Team management', 'API access', 'SLA'] },
  ];

  const sessions = [
    { id: '1', device: 'MacBook Pro', location: 'San Francisco, USA', current: true, lastActive: 'Now' },
    { id: '2', device: 'iPhone 15 Pro', location: 'San Francisco, USA', lastActive: '2 hours ago' },
  ];

  const integrations = [
    { id: 'github', name: 'GitHub', icon: <Github size={20} />, status: 'Connected', desc: 'Sync your repositories' },
    { id: 'google', name: 'Google', icon: <Globe size={20} />, status: 'Disconnected', desc: 'Connect to Calendar & Drive' },
    { id: 'slack', name: 'Slack', icon: <Smartphone size={20} />, status: 'Disconnected', desc: 'Receive bot notifications in Slack' },
  ];

  const availableProviders = [
    { id: 'openrouter', name: 'OpenRouter', keyPrefix: 'sk-or-', docUrl: 'https://openrouter.ai/keys' },
    { id: 'openai', name: 'OpenAI', keyPrefix: 'sk-', docUrl: 'https://platform.openai.com/api-keys' },
    { id: 'anthropic', name: 'Anthropic', keyPrefix: 'sk-ant-', docUrl: 'https://console.anthropic.com/settings/keys' },
  ];

  const models = [
    { id: 'anthropic/claude-opus-4-5', name: 'Claude Opus 4.5', desc: 'Most capable', badge: 'Recommended' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', desc: 'OpenAI flagship' },
    { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Fast responses' },
  ];

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    setOriginalSettings({ ...settings });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const maskKey = (key: string) => key.length <= 8 ? '••••••••' : key.slice(0, 8) + '•'.repeat(12);

  return (
    <div className="settings-page animate-fade-in">
      {/* Sidebar-style Tabs */}
      <div className="settings-container">
        <aside className="settings-tabs glass-card">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>

        <main className="settings-content">
          {activeTab === 'account' && (
            <section className="settings-section glass-card animate-slide-up">
              <div className="section-header">
                <User size={20} />
                <h2>Profile Settings</h2>
              </div>
              <div className="profile-header-settings">
                <div className="avatar-upload">
                  <div className="avatar-circle">{settings.name[0] || 'U'}</div>
                  <button className="btn btn-ghost btn-sm">Change Avatar</button>
                </div>
                <div className="settings-grid">
                  <div className="input-group">
                    <label className="input-label">Display Name</label>
                    <input
                      type="text"
                      className="input"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <input type="email" className="input" value={settings.email} disabled />
                    <span className="input-hint">Email cannot be changed after registration</span>
                  </div>
                  <div className="input-group full-width">
                    <label className="input-label">Profile Bio</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={settings.bio}
                      onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'ai' && (
            <div className="ai-config-tab animate-slide-up">
              <section className="settings-section glass-card">
                <div className="section-header">
                  <Bot size={20} />
                  <h2>Prefered AI Model</h2>
                </div>
                <div className="model-grid">
                  {models.map((model) => (
                    <label key={model.id} className={`model-option ${settings.model === model.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="model"
                        value={model.id}
                        checked={settings.model === model.id}
                        onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                      />
                      <div className="model-info">
                        <span className="model-name">{model.name}</span>
                        <span className="model-desc">{model.desc}</span>
                      </div>
                      {settings.model === model.id && <CheckCircle2 size={18} className="text-primary" />}
                    </label>
                  ))}
                </div>
              </section>

              <section className="settings-section glass-card">
                <div className="section-header">
                  <Key size={20} />
                  <h2>API Key Management</h2>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
                    <Plus size={14} /> Add Key
                  </button>
                </div>
                <div className="api-keys-list">
                  {apiKeys.map((k: ApiKeyConfig) => (
                    <div key={k.id} className="api-key-item">
                      <div className="api-key-info">
                        <span className="api-key-name">{k.name} ({k.provider})</span>
                        <code>{showApiKey[k.id] ? k.key : maskKey(k.key)}</code>
                      </div>
                      <div className="api-key-actions">
                        <button className="btn-icon btn-ghost btn-sm" onClick={() => setShowApiKey({ ...showApiKey, [k.id]: !showApiKey[k.id] })}>
                          {showApiKey[k.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button className="btn-icon btn-ghost btn-sm text-error" onClick={() => setApiKeys(apiKeys.filter((key: ApiKeyConfig) => key.id !== k.id))}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {apiKeys.length === 0 && <div className="empty-state-text">No API keys added yet</div>}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="billing-tab animate-slide-up">
              <section className="settings-section glass-card">
                <div className="section-header">
                  <CreditCard size={20} />
                  <h2>Subscription Plans</h2>
                </div>
                <div className="plans-grid">
                  {plans.map(plan => (
                    <div key={plan.id} className={`plan-card ${plan.current ? 'current' : ''}`}>
                      {plan.current && <span className="current-badge">Active Plan</span>}
                      <h3>{plan.name}</h3>
                      <div className="plan-price">{plan.price}<span>/mo</span></div>
                      <ul className="plan-features">
                        {plan.features.map(f => <li key={f}><Check size={14} /> {f}</li>)}
                      </ul>
                      <button className={`btn ${plan.current ? 'btn-ghost' : 'btn-primary'}`} disabled={plan.current}>
                        {plan.current ? 'Active' : 'Upgrade'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="settings-section glass-card">
                <div className="section-header">
                  <Mail size={18} />
                  <h2>Invoice History</h2>
                </div>
                <table className="invoices-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Oct 12, 2024</td>
                      <td>$19.00</td>
                      <td><span className="badge-status success">Paid</span></td>
                      <td><button className="btn-link">Download</button></td>
                    </tr>
                    <tr>
                      <td>Sep 12, 2024</td>
                      <td>$19.00</td>
                      <td><span className="badge-status success">Paid</span></td>
                      <td><button className="btn-link">Download</button></td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="security-tab animate-slide-up">
              <section className="settings-section glass-card">
                <div className="section-header">
                  <Shield size={20} />
                  <h2>Security Settings</h2>
                </div>
                <div className="security-controls">
                  <div className="control-item">
                    <div className="control-info">
                      <h4>Two-Factor Authentication</h4>
                      <p>Add an extra layer of security to your account.</p>
                    </div>
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={settings.twoFactor} 
                        onChange={() => setSettings({ ...settings, twoFactor: !settings.twoFactor })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <button className="btn btn-ghost btn-danger-hover mt-4">
                    Change Password
                  </button>
                </div>
              </section>

              <section className="settings-section glass-card">
                <div className="section-header">
                  <Smartphone size={18} />
                  <h2>Active Sessions</h2>
                </div>
                <div className="sessions-list">
                  {sessions.map(session => (
                    <div key={session.id} className="session-item">
                      <div className="session-info">
                        <span className="device-name">{session.device} {session.current && <span className="current-indicator">(Current)</span>}</span>
                        <span className="session-meta">{session.location} • {session.lastActive}</span>
                      </div>
                      {!session.current && (
                        <button className="btn btn-ghost btn-sm text-error">Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'integrations' && (
            <section className="settings-section glass-card animate-slide-up">
              <div className="section-header">
                <Share2 size={20} />
                <h2>Third-Party Integrations</h2>
              </div>
              <div className="integrations-list">
                {integrations.map(integ => (
                  <div key={integ.id} className="integration-item">
                    <div className="integration-icon-wrapper">
                      {integ.icon}
                    </div>
                    <div className="integration-info">
                      <h4>{integ.name}</h4>
                      <p>{integ.desc}</p>
                    </div>
                    <button className={`btn btn-sm ${integ.status === 'Connected' ? 'btn-ghost' : 'btn-primary'}`}>
                      {integ.status === 'Connected' ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer Actions */}
          <div className="settings-footer">
            {hasChanges && (
              <span className="unsaved-label">
                <Info size={14} /> You have unsaved changes
              </span>
            )}
            <button 
              className="btn btn-primary btn-lg" 
              disabled={!hasChanges || isSaving}
              onClick={handleSave}
            >
              {isSaving ? <RefreshCw className="spinning" /> : saved ? <Check /> : <Save />}
              {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save All Changes'}
            </button>
          </div>
        </main>
      </div>

      {/* Add Key Modal (Ported from original) */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New API Key</h3>
              <button className="btn-icon btn-ghost" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="input-label">Key Name (e.g. My OpenRouter)</label>
                <input 
                  type="text" className="input" 
                  value={newKey.name} 
                  onChange={e => setNewKey({ ...newKey, name: e.target.value })} 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Provider</label>
                <select 
                  className="input select" 
                  value={newKey.provider}
                  onChange={e => setNewKey({ ...newKey, provider: e.target.value })}
                >
                  {availableProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">API Key</label>
                <input 
                  type="password" className="input" 
                  value={newKey.key} 
                  onChange={e => setNewKey({ ...newKey, key: e.target.value })} 
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setApiKeys([...apiKeys, { ...newKey, id: Date.now().toString(), status: 'unknown' }]);
                  setShowAddModal(false);
                  setNewKey({ name: '', key: '', provider: 'openrouter' });
                }}
              >
                Add Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckCircle2({ size, className }: { size: number, className: string }) {
  return <Check size={size} className={className} />;
}
