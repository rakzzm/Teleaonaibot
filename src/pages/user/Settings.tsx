import { useState, useEffect } from 'react';
import { Key, Bot, User, Save, Eye, EyeOff, Check, AlertCircle, Zap, RefreshCw, Plus, Trash2, X } from 'lucide-react';
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

const defaultApiKeys: ApiKeyConfig[] = [];

export default function UserSettings() {
  const { user } = useAuth();
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Load settings from localStorage on initial render
  const [originalSettings, setOriginalSettings] = useState(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fall through to default
      }
    }
    return {
      name: user?.name || '',
      email: user?.email || '',
      model: 'anthropic/claude-opus-4-5',
    };
  });

  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fall through to default
      }
    }
    return {
      name: user?.name || '',
      email: user?.email || '',
      model: 'anthropic/claude-opus-4-5',
    };
  });

  // Load API keys from localStorage
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>(() => {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultApiKeys;
      }
    }
    return defaultApiKeys;
  });

  // Save API keys to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(apiKeys));
  }, [apiKeys]);

  const [newKey, setNewKey] = useState({
    name: '',
    key: '',
    provider: 'openrouter',
  });

  const availableProviders = [
    { id: 'openrouter', name: 'OpenRouter', keyPrefix: 'sk-or-', docUrl: 'https://openrouter.ai/keys' },
    { id: 'openai', name: 'OpenAI', keyPrefix: 'sk-', docUrl: 'https://platform.openai.com/api-keys' },
    { id: 'anthropic', name: 'Anthropic', keyPrefix: 'sk-ant-', docUrl: 'https://console.anthropic.com/settings/keys' },
    { id: 'groq', name: 'Groq', keyPrefix: 'gsk_', docUrl: 'https://console.groq.com/keys' },
    { id: 'brave', name: 'Brave Search', keyPrefix: 'BSA-', docUrl: 'https://brave.com/search/api/' },
    { id: 'serper', name: 'Serper', keyPrefix: '', docUrl: 'https://serper.dev/' },
  ];

  const models = [
    { id: 'anthropic/claude-opus-4-5', name: 'Claude Opus 4.5', desc: 'Most capable', badge: 'Recommended' },
    { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', desc: 'Fast & capable' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', desc: 'OpenAI flagship' },
    { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Fast responses' },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', desc: 'Value option' },
    { id: 'minimax/minimax-m2', name: 'MiniMax M2', desc: 'Budget friendly', badge: 'Budget' },
  ];

  // Check if settings have changed
  const hasChanges = 
    settings.name !== originalSettings.name ||
    settings.model !== originalSettings.model;

  const toggleShowKey = (id: string) => {
    setShowApiKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTestKey = async (id: string) => {
    setTestingKey(id);
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Randomly set valid/invalid for demo
    setApiKeys(prev => prev.map(key => 
      key.id === id 
        ? { ...key, status: Math.random() > 0.2 ? 'valid' : 'invalid', lastTested: 'Just now' }
        : key
    ));
    
    setTestingKey(null);
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
  };

  const handleAddKey = () => {
    if (!newKey.name || !newKey.key) return;

    const newApiKey: ApiKeyConfig = {
      id: crypto.randomUUID(),
      name: newKey.name,
      key: newKey.key,
      provider: newKey.provider,
      status: 'unknown',
    };

    setApiKeys(prev => [...prev, newApiKey]);
    setNewKey({ name: '', key: '', provider: 'openrouter' });
    setShowAddModal(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API save
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Persist settings to localStorage
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    
    setOriginalSettings({ ...settings });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 8) + '•'.repeat(Math.min(20, key.length - 8));
  };

  return (
    <div className="settings-page animate-fade-in">
      {/* Profile Section */}
      <section className="settings-section glass-card">
        <div className="section-header">
          <User size={20} />
          <h2>Profile</h2>
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
            <label className="input-label">Email</label>
            <input
              type="email"
              className="input"
              value={settings.email}
              disabled
            />
            <span className="input-hint">Email is managed by your authentication provider</span>
          </div>
        </div>
      </section>

      {/* API Keys Section */}
      <section className="settings-section glass-card">
        <div className="section-header">
          <Key size={20} />
          <h2>API Keys</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Key
          </button>
        </div>
        
        <div className="api-keys-list">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="api-key-item">
              <div className="api-key-info">
                <div className="api-key-header">
                  <span className="api-key-name">{apiKey.name}</span>
                  <span className={`api-key-status status-${apiKey.status}`}>
                    {apiKey.status === 'valid' && <Check size={12} />}
                    {apiKey.status === 'invalid' && <AlertCircle size={12} />}
                    {apiKey.status === 'valid' ? 'Valid' : apiKey.status === 'invalid' ? 'Invalid' : 'Not tested'}
                  </span>
                </div>
                <div className="api-key-value">
                  <code>{showApiKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}</code>
                  <button 
                    className="btn-icon btn-ghost btn-sm"
                    onClick={() => toggleShowKey(apiKey.id)}
                  >
                    {showApiKey[apiKey.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {apiKey.lastTested && (
                  <span className="api-key-tested">Last tested: {apiKey.lastTested}</span>
                )}
              </div>
              <div className="api-key-actions">
                <button 
                  className={`btn btn-ghost btn-sm ${testingKey === apiKey.id ? 'testing' : ''}`}
                  onClick={() => handleTestKey(apiKey.id)}
                  disabled={testingKey === apiKey.id}
                >
                  <Zap size={14} className={testingKey === apiKey.id ? 'spinning' : ''} />
                  {testingKey === apiKey.id ? 'Testing...' : 'Test'}
                </button>
                <button 
                  className="btn-icon btn-ghost btn-sm btn-danger-hover"
                  onClick={() => handleDeleteKey(apiKey.id)}
                  title="Delete key"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          
          {apiKeys.length === 0 && (
            <div className="no-keys">
              <Key size={32} />
              <p>No API keys configured</p>
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                <Plus size={16} /> Add Your First Key
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Model Selection */}
      <section className="settings-section glass-card">
        <div className="section-header">
          <Bot size={20} />
          <h2>Default AI Model</h2>
        </div>
        <div className="model-grid">
          {models.map((model) => (
            <label
              key={model.id}
              className={`model-option ${settings.model === model.id ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="model"
                value={model.id}
                checked={settings.model === model.id}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              />
              <span className="model-radio"></span>
              <div className="model-info">
                <span className="model-name">
                  {model.name}
                  {model.badge && <span className={`model-badge ${model.badge.toLowerCase()}`}>{model.badge}</span>}
                </span>
                <span className="model-desc">{model.desc}</span>
              </div>
              {settings.model === model.id && <Check size={16} className="check-icon" />}
            </label>
          ))}
        </div>
      </section>

      {/* Save Button */}
      <div className="settings-actions">
        {hasChanges && (
          <span className="unsaved-indicator">
            <AlertCircle size={14} /> Unsaved changes
          </span>
        )}
        <button 
          className="btn btn-primary btn-lg" 
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <>
              <RefreshCw size={18} className="spinning" /> Saving...
            </>
          ) : saved ? (
            <>
              <Check size={18} /> Saved!
            </>
          ) : (
            <>
              <Save size={18} /> Save Changes
            </>
          )}
        </button>
      </div>

      {/* Add Key Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add API Key</h3>
              <button className="btn-icon btn-ghost" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="input-label">Provider</label>
                <select
                  className="input select"
                  value={newKey.provider}
                  onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                >
                  {availableProviders.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Display Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., My OpenRouter Key"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">API Key</label>
                <input
                  type="password"
                  className="input"
                  placeholder={availableProviders.find(p => p.id === newKey.provider)?.keyPrefix + '...'}
                  value={newKey.key}
                  onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                />
                <span className="input-hint">
                  Get your key from{' '}
                  <a 
                    href={availableProviders.find(p => p.id === newKey.provider)?.docUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {availableProviders.find(p => p.id === newKey.provider)?.name} Dashboard
                  </a>
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddKey}
                disabled={!newKey.name || !newKey.key}
              >
                <Plus size={16} /> Add Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
