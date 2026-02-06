import { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, Search, X, CheckCircle2 } from 'lucide-react';
import { skillService } from '../../services/skillService';
import type { Skill } from '../../services/skillService';
import './Skills.css';

const categories = ['All', 'Development', 'Productivity', 'Utilities', 'Research', 'Communication'];

export default function UserSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    setSkills(skillService.getSkills());
  }, []);

  const filteredSkills = skills.filter((skill) => {
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    const matchesSearch =
      skill.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleSkill = (id: string) => {
    const skill = skills.find(s => s.id === id);
    if (skill) {
      const newEnabled = !skill.enabled;
      skillService.setSkillEnabled(id, newEnabled);
      setSkills(skills.map((s) => (s.id === id ? { ...s, enabled: newEnabled } : s)));
    }
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
              <button 
                className="btn-icon btn-ghost btn-sm" 
                title="Learn more"
                onClick={() => setSelectedSkill(skill)}
              >
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Skill Details Modal */}
      {selectedSkill && (
        <div className="skill-details-overlay" onClick={() => setSelectedSkill(null)}>
          <div className="skill-details-modal glass-card glow" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-area">
                <span className="modal-skill-icon">{selectedSkill.icon}</span>
                <div>
                  <h3>{selectedSkill.displayName}</h3>
                  <span className="badge">{selectedSkill.category}</span>
                </div>
              </div>
              <button className="btn-icon btn-ghost" onClick={() => setSelectedSkill(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <section className="modal-section">
                <h4>About this skill</h4>
                <p>{selectedSkill.longDescription || selectedSkill.description}</p>
              </section>
              
              {selectedSkill.features && selectedSkill.features.length > 0 && (
                <section className="modal-section">
                  <h4>Key Features</h4>
                  <ul className="features-list">
                    {selectedSkill.features.map(feature => (
                      <li key={feature}>
                        <CheckCircle2 size={16} className="feature-icon" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="modal-status-box">
                <div className="status-info">
                  <span className="status-label">Status:</span>
                  <span className={`status-value ${selectedSkill.enabled ? 'text-success' : 'text-muted'}`}>
                    {selectedSkill.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <button 
                  className={`btn ${selectedSkill.enabled ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={() => {
                    toggleSkill(selectedSkill.id);
                    // Close modal or update local state for immediate feedback
                    setSelectedSkill(prev => prev ? { ...prev, enabled: !prev.enabled } : null);
                  }}
                >
                  {selectedSkill.enabled ? 'Disable Skill' : 'Enable Skill'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
