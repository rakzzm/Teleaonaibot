import { useState, useEffect, useCallback } from 'react';
import { FileJson, Save, RotateCcw, Check, AlertCircle, Copy, Download, Upload, X } from 'lucide-react';
import './Config.css';

const defaultConfig = `{
  "providers": {
    "openrouter": {
      "apiKey": "sk-or-v1-xxx"
    },
    "groq": {
      "apiKey": "gsk_xxx"
    }
  },
  "agents": {
    "defaults": {
      "model": "anthropic/claude-opus-4-5"
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "token": "123456:ABC...",
      "allowFrom": ["123456789"]
    },
    "whatsapp": {
      "enabled": true
    },
    "feishu": {
      "enabled": false
    }
  },
  "tools": {
    "web": {
      "search": {
        "apiKey": "BSA-xxx"
      }
    }
  }
}`;

export default function AdminConfig() {
  const [config, setConfig] = useState(defaultConfig);
  const [savedConfig, setSavedConfig] = useState(defaultConfig);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lineCount, setLineCount] = useState(0);

  // Check if config has been modified
  const isDirty = config !== savedConfig;

  // Count lines in config
  useEffect(() => {
    setLineCount(config.split('\n').length);
  }, [config]);

  // Validate JSON as user types
  const validateJson = useCallback((text: string): boolean => {
    try {
      JSON.parse(text);
      setError('');
      return true;
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError(`Invalid JSON: ${e.message}`);
      }
      return false;
    }
  }, []);

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (config.trim()) {
        validateJson(config);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [config, validateJson]);

  const handleSave = async () => {
    if (!validateJson(config)) {
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setSavedConfig(config);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetClick = () => {
    if (isDirty) {
      setShowResetConfirm(true);
    } else {
      handleReset();
    }
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    setSavedConfig(defaultConfig);
    setError('');
    setShowResetConfirm(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teleaon-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (validateJson(text)) {
            setConfig(text);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(config);
      setConfig(JSON.stringify(parsed, null, 2));
      setError('');
    } catch {
      // Already showing error from validation
    }
  };

  return (
    <div className="config-page animate-fade-in">
      <div className="config-header">
        <div className="config-title">
          <FileJson size={20} />
          <span>config.json</span>
          {isDirty && <span className="unsaved-badge">Unsaved changes</span>}
        </div>
        <div className="config-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleCopy} title="Copy to clipboard">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleImport} title="Import from file">
            <Upload size={14} /> Import
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleExport} title="Export to file">
            <Download size={14} /> Export
          </button>
          <div className="divider-vertical"></div>
          <button 
            className="btn btn-ghost" 
            onClick={handleResetClick}
            disabled={!isDirty && config === defaultConfig}
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={!isDirty || !!error || isSaving}
          >
            {isSaving ? (
              'Saving...'
            ) : saved ? (
              <>
                <Check size={16} /> Saved!
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="config-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="config-editor glass-card">
        <div className="editor-line-numbers">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i + 1}>{i + 1}</span>
          ))}
        </div>
        <textarea
          className="code-editor"
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div className="config-footer">
        <div className="config-hint">
          <p>Edit the configuration JSON above. Changes will take effect after saving and restarting the gateway.</p>
        </div>
        <div className="config-meta">
          <button className="btn btn-ghost btn-sm" onClick={formatJson}>
            Format JSON
          </button>
          <span className="line-count">{lineCount} lines</span>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal modal-sm glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Configuration</h3>
              <button className="btn-icon btn-ghost" onClick={() => setShowResetConfirm(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>You have unsaved changes. Are you sure you want to reset to the default configuration?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleReset}>
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
