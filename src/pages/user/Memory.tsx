import { useState } from 'react';
import { Brain, Plus, Trash2, Edit2, X, Save, Tag } from 'lucide-react';
import './Memory.css';

interface Memory {
  id: string;
  content: string;
  category: string;
  createdAt: string;
}

const mockMemories: Memory[] = [
  { id: '1', content: 'User prefers dark mode interfaces and minimalist design', category: 'Preferences', createdAt: '2024-02-05' },
  { id: '2', content: 'Works primarily with TypeScript and React for frontend development', category: 'Technical', createdAt: '2024-02-04' },
  { id: '3', content: 'Timezone is UTC+5:30 (IST)', category: 'Personal', createdAt: '2024-02-03' },
  { id: '4', content: 'Prefers concise explanations with code examples', category: 'Communication', createdAt: '2024-02-02' },
  { id: '5', content: 'Uses VS Code as primary IDE with Vim keybindings', category: 'Technical', createdAt: '2024-02-01' },
];

const categories = ['All', 'Preferences', 'Technical', 'Personal', 'Communication'];

export default function UserMemory() {
  const [memories, setMemories] = useState(mockMemories);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [newMemory, setNewMemory] = useState({ content: '', category: 'Preferences' });

  const filteredMemories = memories.filter(
    (m) => selectedCategory === 'All' || m.category === selectedCategory
  );

  const handleAdd = () => {
    if (!newMemory.content.trim()) return;
    const memory: Memory = {
      id: Date.now().toString(),
      content: newMemory.content,
      category: newMemory.category,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMemories([memory, ...memories]);
    setNewMemory({ content: '', category: 'Preferences' });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setMemories(memories.filter((m) => m.id !== id));
  };

  return (
    <div className="memory-page animate-fade-in">
      <div className="memory-header">
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
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} /> Add Memory
        </button>
      </div>

      {isAdding && (
        <div className="add-memory-card glass-card glow">
          <div className="add-memory-header">
            <h3>Add New Memory</h3>
            <button className="btn-icon btn-ghost" onClick={() => setIsAdding(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="add-memory-form">
            <textarea
              className="input"
              placeholder="What should I remember about you?"
              value={newMemory.content}
              onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
              rows={3}
            />
            <div className="form-row">
              <select
                className="input select"
                value={newMemory.category}
                onChange={(e) => setNewMemory({ ...newMemory, category: e.target.value })}
              >
                {categories.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={handleAdd}>
                <Save size={18} /> Save Memory
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="memories-grid">
        {filteredMemories.map((memory) => (
          <div key={memory.id} className="memory-card glass-card">
            <div className="memory-content">
              <Brain size={20} className="memory-icon" />
              <p>{memory.content}</p>
            </div>
            <div className="memory-footer">
              <span className="badge badge-primary">
                <Tag size={12} /> {memory.category}
              </span>
              <span className="memory-date">{memory.createdAt}</span>
            </div>
            <div className="memory-actions">
              <button className="btn-icon btn-ghost btn-sm" title="Edit">
                <Edit2 size={14} />
              </button>
              <button
                className="btn-icon btn-ghost btn-sm"
                title="Delete"
                onClick={() => handleDelete(memory.id)}
              >
                <Trash2 size={14} />
              </button>
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
