import { useState } from 'react';
import { Wrench, Search, Settings, X, Save, RotateCcw, ExternalLink } from 'lucide-react';
import './Skills.css';

interface SkillConfig {
  [key: string]: string | boolean | number;
}

interface Skill {
  id: string;
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
  category: string;
  usageCount: number;
  config?: SkillConfig;
  configSchema?: ConfigField[];
  docsUrl?: string;
}

interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'boolean' | 'select';
  description?: string;
  required?: boolean;
  default?: string | boolean | number;
  options?: { value: string; label: string }[];
}

const mockSkills: Skill[] = [
  { 
    id: '1', 
    name: 'github', 
    displayName: 'GitHub', 
    description: 'Interact with GitHub repositories', 
    enabled: true, 
    category: 'Development', 
    usageCount: 1247,
    docsUrl: 'https://docs.github.com/en/rest',
    config: { token: '', autoSync: true, defaultBranch: 'main' },
    configSchema: [
      { name: 'token', label: 'Personal Access Token', type: 'password', required: true, description: 'GitHub PAT with repo access' },
      { name: 'autoSync', label: 'Auto Sync', type: 'boolean', default: true, description: 'Automatically sync repository data' },
      { name: 'defaultBranch', label: 'Default Branch', type: 'text', default: 'main', description: 'Default branch for operations' },
    ]
  },
  { 
    id: '2', 
    name: 'weather', 
    displayName: 'Weather', 
    description: 'Get weather information', 
    enabled: true, 
    category: 'Utilities', 
    usageCount: 856,
    docsUrl: 'https://openweathermap.org/api',
    config: { apiKey: '', units: 'metric', defaultCity: '' },
    configSchema: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true, description: 'OpenWeatherMap API key' },
      { name: 'units', label: 'Temperature Units', type: 'select', default: 'metric', options: [
        { value: 'metric', label: 'Celsius (°C)' },
        { value: 'imperial', label: 'Fahrenheit (°F)' },
        { value: 'kelvin', label: 'Kelvin (K)' },
      ]},
      { name: 'defaultCity', label: 'Default City', type: 'text', description: 'Default city for weather queries' },
    ]
  },
  { 
    id: '3', 
    name: 'tmux', 
    displayName: 'Tmux', 
    description: 'Manage terminal sessions', 
    enabled: true, 
    category: 'Development', 
    usageCount: 432,
    config: { sessionPrefix: 'teleaon', autoAttach: true },
    configSchema: [
      { name: 'sessionPrefix', label: 'Session Prefix', type: 'text', default: 'teleaon', description: 'Prefix for tmux session names' },
      { name: 'autoAttach', label: 'Auto Attach', type: 'boolean', default: true, description: 'Automatically attach to existing sessions' },
    ]
  },
  { 
    id: '4', 
    name: 'summarize', 
    displayName: 'Summarize', 
    description: 'Summarize documents and articles', 
    enabled: true, 
    category: 'Productivity', 
    usageCount: 2341,
    config: { maxLength: 500, style: 'concise' },
    configSchema: [
      { name: 'maxLength', label: 'Max Summary Length', type: 'number', default: 500, description: 'Maximum characters in summary' },
      { name: 'style', label: 'Summary Style', type: 'select', default: 'concise', options: [
        { value: 'concise', label: 'Concise' },
        { value: 'detailed', label: 'Detailed' },
        { value: 'bullet', label: 'Bullet Points' },
      ]},
    ]
  },
  { 
    id: '5', 
    name: 'skill-creator', 
    displayName: 'Skill Creator', 
    description: 'Create new custom skills', 
    enabled: false, 
    category: 'Meta', 
    usageCount: 12,
    config: { templateDir: './templates', autoTest: false },
    configSchema: [
      { name: 'templateDir', label: 'Template Directory', type: 'text', default: './templates', description: 'Directory for skill templates' },
      { name: 'autoTest', label: 'Auto Test', type: 'boolean', default: false, description: 'Automatically test new skills' },
    ]
  },
];

export default function AdminSkills() {
  const [skills, setSkills] = useState(mockSkills);
  const [searchQuery, setSearchQuery] = useState('');
  const [configModal, setConfigModal] = useState<Skill | null>(null);
  const [formData, setFormData] = useState<SkillConfig>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const filteredSkills = skills.filter(
    (skill) =>
      skill.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSkill = (id: string) => {
    setSkills(skills.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const openConfigModal = (skill: Skill) => {
    setConfigModal(skill);
    setFormData({ ...(skill.config || {}) });
    setSaveSuccess(false);
  };

  const closeConfigModal = () => {
    setConfigModal(null);
    setFormData({});
    setSaveSuccess(false);
    setIsSaving(false);
  };

  const handleFieldChange = (name: string, value: string | boolean | number) => {
    setFormData({ ...formData, [name]: value });
  };

  const resetToDefaults = () => {
    if (!configModal?.configSchema) return;
    
    const defaults: SkillConfig = {};
    configModal.configSchema.forEach((field) => {
      if (field.default !== undefined) {
        defaults[field.name] = field.default;
      } else {
        defaults[field.name] = field.type === 'boolean' ? false : '';
      }
    });
    setFormData(defaults);
  };

  const saveConfiguration = async () => {
    if (!configModal) return;

    setIsSaving(true);
    
    // Simulate API save
    await new Promise((resolve) => setTimeout(resolve, 800));

    setSkills(skills.map((s) => {
      if (s.id === configModal.id) {
        return { ...s, config: { ...formData } };
      }
      return s;
    }));

    setIsSaving(false);
    setSaveSuccess(true);
    
    // Close modal after brief success indication
    setTimeout(() => {
      closeConfigModal();
    }, 1000);
  };

  const renderConfigField = (field: ConfigField) => {
    const value = formData[field.name];

    switch (field.type) {
      case 'password':
        return (
          <input
            type="password"
            className="input"
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            value={String(value || '')}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            className="input"
            value={Number(value) || 0}
            onChange={(e) => handleFieldChange(field.name, parseInt(e.target.value) || 0)}
          />
        );
      
      case 'boolean':
        return (
          <label className="toggle">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        );
      
      case 'select':
        return (
          <select
            className="input select"
            value={String(value || field.default || '')}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type="text"
            className="input"
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            value={String(value || '')}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="admin-skills-page animate-fade-in">
      <div className="skills-header">
        <div className="search-box">
          <div className="input-with-icon">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              className="input"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <span className="skills-count">
          {skills.filter((s) => s.enabled).length} / {skills.length} enabled
        </span>
      </div>

      <div className="admin-skills-table glass-card">
        <table>
          <thead>
            <tr>
              <th>Skill</th>
              <th>Category</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSkills.map((skill) => (
              <tr key={skill.id}>
                <td>
                  <div className="skill-cell">
                    <Wrench size={16} />
                    <div>
                      <span className="skill-name">{skill.displayName}</span>
                      <span className="skill-desc">{skill.description}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge">{skill.category}</span>
                </td>
                <td className="text-muted">{skill.usageCount.toLocaleString()}</td>
                <td>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={skill.enabled}
                      onChange={() => toggleSkill(skill.id)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </td>
                <td>
                  <button 
                    className="btn-icon btn-ghost btn-sm" 
                    title="Configure"
                    onClick={() => openConfigModal(skill)}
                  >
                    <Settings size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Configuration Modal */}
      {configModal && (
        <div className="modal-overlay" onClick={closeConfigModal}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Wrench size={18} className="modal-icon" />
                <h3>Configure {configModal.displayName}</h3>
              </div>
              <button className="btn-icon btn-ghost" onClick={closeConfigModal}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {configModal.configSchema?.map((field) => (
                <div key={field.name} className={`input-group ${field.type === 'boolean' ? 'inline' : ''}`}>
                  <label className="input-label">
                    {field.label}
                    {field.required && <span className="required">*</span>}
                  </label>
                  {renderConfigField(field)}
                  {field.description && (
                    <span className="input-hint">{field.description}</span>
                  )}
                </div>
              ))}

              {saveSuccess && (
                <div className="save-success">
                  <Save size={16} />
                  Configuration saved successfully!
                </div>
              )}

              {configModal.docsUrl && (
                <div className="docs-link">
                  <ExternalLink size={14} />
                  <a href={configModal.docsUrl} target="_blank" rel="noopener noreferrer">
                    View {configModal.displayName} Documentation
                  </a>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={resetToDefaults}>
                <RotateCcw size={14} /> Reset
              </button>
              <button 
                className="btn btn-primary" 
                onClick={saveConfiguration}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <Save size={14} /> Save Configuration
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
