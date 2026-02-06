export interface Skill {
  id: string;
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
  category: string;
  icon: string;
}

const SKILLS_STORAGE_KEY = 'teleaon_skills';

const defaultSkills: Skill[] = [
  { id: '1', name: 'github', displayName: 'GitHub', description: 'Interact with GitHub repositories, issues, and pull requests', enabled: true, category: 'Development', icon: '🐙' },
  { id: '2', name: 'weather', displayName: 'Weather', description: 'Get real-time weather information for any location', enabled: true, category: 'Utilities', icon: '🌤️' },
  { id: '3', name: 'tmux', displayName: 'Tmux', description: 'Manage terminal sessions with tmux', enabled: false, category: 'Development', icon: '💻' },
  { id: '4', name: 'summarize', displayName: 'Summarize', description: 'Summarize articles, documents, and web pages', enabled: true, category: 'Productivity', icon: '📝' },
  { id: '5', name: 'web-search', displayName: 'Web Search', description: 'Search the web for real-time information', enabled: true, category: 'Research', icon: '🔍' },
  { id: '6', name: 'code-review', displayName: 'Code Review', description: 'Review code and suggest improvements', enabled: false, category: 'Development', icon: '🔧' },
  { id: '7', name: 'calendar', displayName: 'Calendar', description: 'Manage your calendar and schedule events', enabled: false, category: 'Productivity', icon: '📅' },
  { id: '8', name: 'email', displayName: 'Email', description: 'Read and send emails on your behalf', enabled: false, category: 'Communication', icon: '📧' },
];

export const skillService = {
  getSkills(): Skill[] {
    try {
      const data = localStorage.getItem(SKILLS_STORAGE_KEY);
      if (!data) return defaultSkills;
      
      const stored: Skill[] = JSON.parse(data);
      // Merge with defaultSkills to ensure any new skills are added while keeping enabled states
      return defaultSkills.map(def => {
        const found = stored.find(s => s.id === def.id);
        return found ? { ...def, enabled: found.enabled } : def;
      });
    } catch (e) {
      console.error('Error loading skills:', e);
      return defaultSkills;
    }
  },

  setSkillEnabled(id: string, enabled: boolean): void {
    const skills = this.getSkills();
    const updated = skills.map(s => s.id === id ? { ...s, enabled } : s);
    localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(updated));
  },

  getEnabledSkills(): Skill[] {
    return this.getSkills().filter(s => s.enabled);
  }
};
