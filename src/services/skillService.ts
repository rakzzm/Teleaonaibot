export interface Skill {
  id: string;
  name: string;
  displayName: string;
  description: string;
  longDescription?: string;
  enabled: boolean;
  category: string;
  icon: string;
  features?: string[];
}

const SKILLS_STORAGE_KEY = 'teleaon_skills';

const defaultSkills: Skill[] = [
  { 
    id: '1', 
    name: 'github', 
    displayName: 'GitHub', 
    description: 'Interact with GitHub repositories, issues, and pull requests', 
    longDescription: 'The GitHub skill allows Teleaon Bot to interact directly with your GitHub account. It can read repository information, list issues, create pull requests, and even analyze code changes.',
    features: ['List and search repositories', 'Manage issues and PRs', 'Code analysis', 'Commit history viewing'],
    enabled: true, 
    category: 'Development', 
    icon: '🐙' 
  },
  { 
    id: '2', 
    name: 'weather', 
    displayName: 'Weather', 
    description: 'Get real-time weather information for any location', 
    longDescription: 'Get hyper-local weather updates. Whether you need the current temperature, a 5-day forecast, or severe weather alerts, this skill has you covered.',
    features: ['Current conditions', 'Hourly forecasts', '7-day outlook', 'Air quality index'],
    enabled: true, 
    category: 'Utilities', 
    icon: '🌤️' 
  },
  { 
    id: '3', 
    name: 'tmux', 
    displayName: 'Tmux', 
    description: 'Manage terminal sessions with tmux', 
    longDescription: 'Control your remote terminal sessions directly from the chat. Create, attach to, and manage multiple tmux windows and panes without leaving the bot interface.',
    features: ['Session management', 'Window switching', 'Pane splitting', 'Remote execution'],
    enabled: false, 
    category: 'Development', 
    icon: '💻' 
  },
  { 
    id: '4', 
    name: 'summarize', 
    displayName: 'Summarize', 
    description: 'Summarize articles, documents, and web pages', 
    longDescription: 'Save time by getting the gist of long content. This skill uses advanced AI to distill articles, long emails, or technical documentation into concise, actionable summaries.',
    features: ['Web link summarization', 'Text extraction', 'Key point identification', 'Multi-language support'],
    enabled: true, 
    category: 'Productivity', 
    icon: '📝' 
  },
  { 
    id: '5', 
    name: 'web-search', 
    displayName: 'Web Search', 
    description: 'Search the web for real-time information', 
    longDescription: 'Connects the AI to the live internet. Use this to find the latest news, research technical topics, or verify facts with up-to-the-minute data.',
    features: ['Live web results', 'Source citation', 'Topic research', 'Image search integration'],
    enabled: true, 
    category: 'Research', 
    icon: '🔍' 
  },
  { 
    id: '6', 
    name: 'code-review', 
    displayName: 'Code Review', 
    description: 'Review code and suggest improvements', 
    longDescription: 'A automated partner for your development workflow. This skill scans your code for potential bugs, security vulnerabilities, and style inconsistencies.',
    features: ['Security auditing', 'Bug detection', 'Refactoring suggestions', 'Style checking'],
    enabled: false, 
    category: 'Development', 
    icon: '🔧' 
  },
  { 
    id: '7', 
    name: 'calendar', 
    displayName: 'Calendar', 
    description: 'Manage your calendar and schedule events', 
    longDescription: 'Your personal AI scheduler. Connect your calendar to book meetings, check your availability, and get daily agenda briefings.',
    features: ['Event scheduling', 'Availability checks', 'Agenda summaries', 'Reminder management'],
    enabled: false, 
    category: 'Productivity', 
    icon: '📅' 
  },
  { 
    id: '8', 
    name: 'email', 
    displayName: 'Email', 
    description: 'Read and send emails on your behalf', 
    longDescription: 'Streamline your communication. Teleaon Bot can help you draft emails, sort your inbox, and search for specific messages using natural language.',
    features: ['Draft generation', 'Inbox searching', 'Email categorization', 'Reply assistance'],
    enabled: false, 
    category: 'Communication', 
    icon: '📧' 
  },
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
