export interface UserMemory {
  id: string;
  content: string;
  category: string;
  importance: 'High' | 'Medium' | 'Low';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const MEMORIES_STORAGE_KEY = 'teleaon_memories';

const defaultMemories: UserMemory[] = [
  { 
    id: '1', 
    content: 'User prefers dark mode interfaces and minimalist design', 
    category: 'Preferences', 
    importance: 'Medium',
    tags: ['ui', 'theme'],
    createdAt: '2024-02-05',
    updatedAt: '2024-02-05'
  },
  { 
    id: '2', 
    content: 'Works primarily with TypeScript and React for frontend development', 
    category: 'Technical', 
    importance: 'High',
    tags: ['dev', 'stack'],
    createdAt: '2024-02-04',
    updatedAt: '2024-02-04'
  },
  { 
    id: '3', 
    content: 'Timezone is UTC+5:30 (IST)', 
    category: 'Personal', 
    importance: 'Low',
    tags: ['location', 'time'],
    createdAt: '2024-02-03',
    updatedAt: '2024-02-03'
  }
];

export const memoryService = {
  getMemories(): UserMemory[] {
    try {
      const data = localStorage.getItem(MEMORIES_STORAGE_KEY);
      if (!data) return defaultMemories;
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading memories:', e);
      return defaultMemories;
    }
  },

  saveMemories(memories: UserMemory[]): void {
    try {
      localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(memories));
      window.dispatchEvent(new Event('teleaon_memories_updated'));
    } catch (e) {
      console.error('Error saving memories:', e);
    }
  },

  addMemory(content: string, category: string, importance: UserMemory['importance'], tags: string[]): UserMemory {
    const memories = this.getMemories();
    const newMemory: UserMemory = {
      id: Date.now().toString(),
      content,
      category,
      importance,
      tags,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    this.saveMemories([newMemory, ...memories]);
    return newMemory;
  },

  updateMemory(updatedMemory: UserMemory): void {
    const memories = this.getMemories();
    const index = memories.findIndex(m => m.id === updatedMemory.id);
    if (index !== -1) {
      memories[index] = {
        ...updatedMemory,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      this.saveMemories(memories);
    }
  },

  deleteMemory(id: string): void {
    const memories = this.getMemories();
    this.saveMemories(memories.filter(m => m.id !== id));
  }
};
