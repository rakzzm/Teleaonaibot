import { useState } from 'react';
import { Sparkles, ExternalLink, Search } from 'lucide-react';
import './Skills.css';

interface Skill {
  id: string;
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
  category: string;
  icon: string;
}

const mockSkills: Skill[] = [
  { id: '1', name: 'github', displayName: 'GitHub', description: 'Interact with GitHub repositories, issues, and pull requests', enabled: true, category: 'Development', icon: '🐙' },
  { id: '2', name: 'weather', displayName: 'Weather', description: 'Get real-time weather information for any location', enabled: true, category: 'Utilities', icon: '🌤️' },
  { id: '3', name: 'tmux', displayName: 'Tmux', description: 'Manage terminal sessions with tmux', enabled: false, category: 'Development', icon: '💻' },
  { id: '4', name: 'summarize', displayName: 'Summarize', description: 'Summarize articles, documents, and web pages', enabled: true, category: 'Productivity', icon: '📝' },
  { id: '5', name: 'web-search', displayName: 'Web Search', description: 'Search the web for real-time information', enabled: true, category: 'Research', icon: '🔍' },
  { id: '6', name: 'code-review', displayName: 'Code Review', description: 'Review code and suggest improvements', enabled: false, category: 'Development', icon: '🔧' },
  { id: '7', name: 'calendar', displayName: 'Calendar', description: 'Manage your calendar and schedule events', enabled: false, category: 'Productivity', icon: '📅' },
  { id: '8', name: 'email', displayName: 'Email', description: 'Read and send emails on your behalf', enabled: false, category: 'Communication', icon: '📧' },
];

const categories = ['All', 'Development', 'Productivity', 'Utilities', 'Research', 'Communication'];

export default function UserSkills() {
  const [skills, setSkills] = useState(mockSkills);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSkills = skills.filter((skill) => {
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    const matchesSearch =
      skill.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleSkill = (id: string) => {
    setSkills(skills.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const enabledCount = skills.filter((s) => s.enabled).length;

  return (
    <div className="skills-page animate-fade-in">
      <div className="skills-summary glass-card">
        <div className="summary-icon">
          <Sparkles size={24} />
        </div>
        <div className="summary-content">
          <h3>{enabledCount} Skills Active</h3>
          <p>Enable skills to expand your assistant's capabilities</p>
        </div>
      </div>

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
        <div className="category-filter">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="skills-grid">
        {filteredSkills.map((skill) => (
          <div key={skill.id} className={`skill-card glass-card ${skill.enabled ? 'enabled' : ''}`}>
            <div className="skill-header">
              <span className="skill-icon">{skill.icon}</span>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={skill.enabled}
                  onChange={() => toggleSkill(skill.id)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <h3 className="skill-name">{skill.displayName}</h3>
            <p className="skill-description">{skill.description}</p>
            <div className="skill-footer">
              <span className="badge">{skill.category}</span>
              <button className="btn-icon btn-ghost btn-sm" title="Learn more">
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="empty-state glass-card">
          <Sparkles size={48} />
          <h3>No skills found</h3>
          <p>Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
}
