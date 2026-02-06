import { useState, useEffect } from 'react';
import { Server, Eye, EyeOff, ExternalLink, Zap, X, Check, AlertCircle } from 'lucide-react';
import './Providers.css';

interface Provider {
  id: string;
  name: string;
  displayName: string;
  apiKey: string;
  apiBase?: string;
  isConfigured: boolean;
  isDefault: boolean;
  status: 'connected' | 'disconnected' | 'error';
  models: string[];
  docsUrl: string;
}

const defaultProviders: Provider[] = [
  { id: 'openrouter', name: 'openrouter', displayName: 'OpenRouter', apiKey: '', apiBase: 'https://openrouter.ai/api/v1', isConfigured: false, isDefault: false, status: 'disconnected', models: ['anthropic/claude-opus-4-5', 'openai/gpt-4o', 'google/gemini-2.0'], docsUrl: 'https://openrouter.ai/keys' },
  { id: 'anthropic', name: 'anthropic', displayName: 'Anthropic', apiKey: '', apiBase: 'https://api.anthropic.com', isConfigured: false, isDefault: false, status: 'disconnected', models: ['claude-opus-4-5', 'claude-sonnet-4'], docsUrl: 'https://console.anthropic.com/settings/keys' },
  { id: 'openai', name: 'openai', displayName: 'OpenAI', apiKey: '', apiBase: 'https://api.openai.com/v1', isConfigured: false, isDefault: false, status: 'disconnected', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini'], docsUrl: 'https://platform.openai.com/api-keys' },
  { id: 'groq', name: 'groq', displayName: 'Groq', apiKey: '', apiBase: 'https://api.groq.com/openai/v1', isConfigured: false, isDefault: false, status: 'disconnected', models: ['llama-3.1-70b', 'mixtral-8x7b'], docsUrl: 'https://console.groq.com/keys' },
  { id: 'deepseek', name: 'deepseek', displayName: 'DeepSeek', apiKey: '', apiBase: 'https://api.deepseek.com', isConfigured: false, isDefault: false, status: 'disconnected', models: ['deepseek-chat', 'deepseek-coder'], docsUrl: 'https://platform.deepseek.com/api_keys' },
  { id: 'gemini', name: 'gemini', displayName: 'Google Gemini', apiKey: '', apiBase: 'https://generativelanguage.googleapis.com/v1beta', isConfigured: false, isDefault: false, status: 'disconnected', models: ['gemini-2.0-flash', 'gemini-2.0-pro'], docsUrl: 'https://aistudio.google.com/app/apikey' },
];

const STORAGE_KEY = 'teleaon_providers';

interface ConfigFormData {
  apiKey: string;
  apiBase: string;
}

export default function AdminProviders() {
  // Load from localStorage on initial render
  const [providers, setProviders] = useState<Provider[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultProviders;
      }
    }
    return defaultProviders;
  });
  
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [configModal, setConfigModal] = useState<Provider | null>(null);
  const [formData, setFormData] = useState<ConfigFormData>({ apiKey: '', apiBase: '' });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Save to localStorage whenever providers change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
  }, [providers]);

  const toggleKey = (id: string) => {
    setShowKeys({ ...showKeys, [id]: !showKeys[id] });
  };

  const setDefault = (id: string) => {
    setProviders(providers.map((p) => ({ ...p, isDefault: p.id === id })));
  };

  const openConfigModal = (provider: Provider) => {
    setConfigModal(provider);
    setFormData({
      apiKey: provider.apiKey,
      apiBase: provider.apiBase || '',
    });
    setTestResult(null);
  };

  const closeConfigModal = () => {
    setConfigModal(null);
    setFormData({ apiKey: '', apiBase: '' });
    setTestResult(null);
    setIsTesting(false);
  };

  const testConnection = async () => {
    if (!formData.apiKey) {
      setTestResult({ success: false, message: 'Please enter an API key' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/providers/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: configModal?.id,
          apiKey: formData.apiKey,
          apiBase: formData.apiBase,
        }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: 'Failed to connect to backend server. Make sure dev server is running.' 
      });
    }
    
    setIsTesting(false);
  };

  const saveConfiguration = () => {
    if (!configModal || !formData.apiKey) return;

    setProviders(providers.map((p) => {
      if (p.id === configModal.id) {
        return {
          ...p,
          apiKey: formData.apiKey,
          apiBase: formData.apiBase || p.apiBase,
          isConfigured: true,
          status: 'connected' as const,
        };
      }
      return p;
    }));

    closeConfigModal();
  };

  const disconnectProvider = (id: string) => {
    setProviders(providers.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          apiKey: '',
          isConfigured: false,
          isDefault: false,
          status: 'disconnected' as const,
        };
      }
      return p;
    }));
  };

  return (
    <div className="providers-page animate-fade-in">
      <div className="providers-grid">
        {providers.map((provider) => (
          <div key={provider.id} className={`provider-card glass-card ${provider.isConfigured ? 'configured' : ''}`}>
            <div className="provider-header">
              <div className="provider-title">
                <Server size={20} />
                <h3>{provider.displayName}</h3>
              </div>
              <span className={`badge ${provider.status === 'connected' ? 'badge-success' : provider.status === 'error' ? 'badge-error' : ''}`}>
                <span className={`status-dot ${provider.status === 'connected' ? 'online' : 'offline'}`}></span>
                {provider.status}
              </span>
            </div>

            <div className="provider-body">
              <div className="input-group">
                <label className="input-label">API Key</label>
                <div className="input-with-action">
                  <input
                    type={showKeys[provider.id] ? 'text' : 'password'}
                    className="input"
                    value={provider.apiKey ? (showKeys[provider.id] ? provider.apiKey : '••••••••••••') : ''}
                    placeholder="Not configured"
                    readOnly
                  />
                  {provider.apiKey && (
                    <button
                      className="btn-icon btn-ghost"
                      onClick={() => toggleKey(provider.id)}
                    >
                      {showKeys[provider.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>

              {provider.models.length > 0 && (
                <div className="models-list">
                  <span className="models-label">Available Models:</span>
                  <div className="models-tags">
                    {provider.models.slice(0, 3).map((model) => (
                      <span key={model} className="badge">{model}</span>
                    ))}
                    {provider.models.length > 3 && (
                      <span className="badge">+{provider.models.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="provider-footer">
              {provider.isDefault ? (
                <span className="default-badge">
                  <Zap size={14} /> Default Provider
                </span>
              ) : provider.isConfigured ? (
                <button className="btn btn-ghost btn-sm" onClick={() => setDefault(provider.id)}>
                  Set as Default
                </button>
              ) : null}
              {provider.isConfigured ? (
                <div className="footer-buttons">
                  <button 
                    className="btn btn-ghost btn-sm btn-danger" 
                    onClick={() => disconnectProvider(provider.id)}
                  >
                    Disconnect
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => openConfigModal(provider)}>
                    <ExternalLink size={14} /> Edit
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => openConfigModal(provider)}>
                  <ExternalLink size={14} /> Configure
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {configModal && (
        <div className="modal-overlay" onClick={closeConfigModal}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Configure {configModal.displayName}</h3>
              <button className="btn-icon btn-ghost" onClick={closeConfigModal}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="input-label">API Key *</label>
                <input
                  type="password"
                  className="input"
                  placeholder={`Enter your ${configModal.displayName} API key...`}
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                />
                <span className="input-hint">
                  Get your API key from{' '}
                  <a href={configModal.docsUrl} target="_blank" rel="noopener noreferrer">
                    {configModal.displayName} Console
                  </a>
                </span>
              </div>
              
              <div className="input-group">
                <label className="input-label">API Base URL (Optional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Custom API endpoint..."
                  value={formData.apiBase}
                  onChange={(e) => setFormData({ ...formData, apiBase: e.target.value })}
                />
                <span className="input-hint">
                  Default: {configModal.apiBase}
                </span>
              </div>

              {testResult && (
                <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                  {testResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-ghost" 
                onClick={testConnection}
                disabled={isTesting || !formData.apiKey}
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
              <button 
                className="btn btn-primary" 
                onClick={saveConfiguration}
                disabled={!formData.apiKey}
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
