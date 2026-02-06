import { useState, useEffect } from 'react';
import { Brain, Plus, Trash2, Edit2, X, Save, Tag, Search, AlertCircle, ChevronDown } from 'lucide-react';
import { memoryService } from '../../services/memoryService';
import type { UserMemory } from '../../services/memoryService';
import './Memory.css';

const categories = ['All', 'Preferences', 'Technical', 'Personal', 'Communication'];
const importanceLevels: UserMemory['importance'][] = ['Low', 'Medium', 'High'];

export default function UserMemory() {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    content: '', 
    category: 'Preferences', 
    importance: 'Medium' as UserMemory['importance'],
    tags: '' 
  });

  const loadMemories = () => {
    setMemories(memoryService.getMemories());
  };

  useEffect(() => {
    loadMemories();
    window.addEventListener('teleaon_memories_updated', loadMemories);
    return () => window.removeEventListener('teleaon_memories_updated', loadMemories);
  }, []);

  const filteredMemories = memories.filter((m) => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSave = () => {
    if (!formData.content.trim()) return;
    
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t !== '');
    
    if (editingId) {
      const memoryToUpdate = memories.find(m => m.id === editingId);
      if (memoryToUpdate) {
        memoryService.updateMemory({
          ...memoryToUpdate,
          content: formData.content,
          category: formData.category,
          importance: formData.importance,
          tags: tagsArray
        });
      }
    } else {
      memoryService.addMemory(
        formData.content,
        formData.category,
        formData.importance,
        tagsArray
      );
    }
    
    resetForm();
  };

  const handleEdit = (memory: UserMemory) => {
    setEditingId(memory.id);
    setFormData({
      content: memory.content,
      category: memory.category,
      importance: memory.importance,
      tags: memory.tags.join(', ')
    });
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      memoryService.deleteMemory(id);
    }
  };

  const resetForm = () => {
    setFormData({ content: '', category: 'Preferences', importance: 'Medium', tags: '' });
    setEditingId(null);
    setIsAdding(false);
  };

  const getImportanceColor = (level: string) => {
    switch (level) {
      case 'High': return 'importance-high';
      case 'Medium': return 'importance-medium';
      case 'Low': return 'importance-low';
      default: return '';
    }
  };

  return (
    <div className="memory-page animate-fade-in">
      {/* Header & Stats */}
      <div className="memory-stats-bar">
        <div className="memory-stat glass-card">
          <Brain size={20} className="text-primary" />
          <div>
            <span className="stat-value">{memories.length}</span>
            <span className="stat-label">Total Memories</span>
          </div>
        </div>
        <div className="memory-stat glass-card">
          <AlertCircle size={20} className="text-warning" />
          <div>
            <span className="stat-value">{memories.filter(m => m.importance === 'High').length}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>
      </div>

      <div className="memory-header-actions">
        <div className="search-bar glass-card">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search memories or tags..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {!isAdding && (
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
            <Plus size={18} /> Add Memory
          </button>
        )}
      </div>

      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {isAdding && (
        <div className="add-memory-overlay">
          <div className="add-memory-modal glass-card glow">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Memory' : 'New Memory'}</h3>
              <button className="btn-icon btn-ghost" onClick={resetForm}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Memory Content</label>
                <textarea
                  className="input"
                  placeholder="What should I remember about you?"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Category</label>
                  <div className="select-wrapper">
                    <select
                      className="input select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="select-icon" size={16} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Importance</label>
                  <div className="select-wrapper">
                    <select
                      className="input select"
                      value={formData.importance}
                      onChange={(e) => setFormData({ ...formData, importance: e.target.value as UserMemory['importance'] })}
                    >
                      {importanceLevels.map(lvl => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                    <ChevronDown className="select-icon" size={16} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Tags (comma separated)</label>
                <div className="input-with-icon">
                  <Tag size={16} className="input-icon" />
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. ui, development, preference"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={resetForm}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                <Save size={18} /> {editingId ? 'Update Memory' : 'Save Memory'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="memories-grid">
        {filteredMemories.map((memory) => (
          <div key={memory.id} className="memory-card glass-card">
            <div className={`importance-tag ${getImportanceColor(memory.importance)}`}>
              {memory.importance}
            </div>
            <div className="memory-body">
              <Brain size={20} className="memory-icon" />
              <p>{memory.content}</p>
            </div>
            
            <div className="memory-tags-list">
              {memory.tags.map(tag => (
                <span key={tag} className="tag-pill">#{tag}</span>
              ))}
            </div>

            <div className="memory-footer">
              <div className="memory-meta">
                <span className="badge">
                  {memory.category}
                </span>
                <span className="memory-date">{memory.createdAt}</span>
              </div>
              <div className="memory-actions">
                <button className="btn-icon btn-ghost btn-sm" onClick={() => handleEdit(memory)}>
                  <Edit2 size={14} />
                </button>
                <button className="btn-icon btn-ghost btn-sm text-error" onClick={() => handleDelete(memory.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMemories.length === 0 && (
        <div className="empty-state glass-card">
          <Brain size={48} />
          <h3>No memories found</h3>
          <p>Add memories to help me remember important things about you!</p>
        </div>
      )}
    </div>
  );
}
