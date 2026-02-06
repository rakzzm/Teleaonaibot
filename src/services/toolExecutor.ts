export interface ToolResult {
  success: boolean;
  data: unknown;
  error?: string;
}

export const toolExecutor = {
  async execute(toolCall: string): Promise<ToolResult> {
    console.log('[ToolExecutor] Executing:', toolCall);
    
    try {
      // Very basic parser for tool_name(args)
      const nameMatch = toolCall.match(/^([a-z0-9_.]+)\((.*)\)$/i);
      if (!nameMatch) {
        throw new Error('Invalid tool call format');
      }

      const toolName = nameMatch[1].toLowerCase();
      const argsStr = nameMatch[2];

      // Route to specific handlers
      switch (toolName) {
        case 'github.search_repositories':
        case 'github.list_repositories':
          return this.mockGithubSearch(argsStr);
        
        case 'weather.get_weather':
          return this.mockWeather(argsStr);
          
    case 'web_search.search':
        case 'web-search.search':
          return this.mockWebSearch(argsStr);

        case 'tmux.list_sessions':
        case 'tmux.create_session':
          return this.mockTmux(argsStr);

        case 'summarize.summarize_text':
        case 'summarize.summarize_url':
          return this.mockSummarize(argsStr);

        case 'code_review.review':
        case 'code-review.review':
          return this.mockCodeReview(argsStr);

        case 'calendar.get_events':
        case 'calendar.schedule_event':
          return this.mockCalendar(argsStr);

        case 'email.get_recent':
        case 'email.send_email':
          return this.mockEmail(argsStr);

        default:
          return {
            success: false,
            data: null,
            error: `Skill "${toolName}" is not yet fully implemented for execution.`
          };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown execution error'
      };
    }
  },

  async mockGithubSearch(args: string): Promise<ToolResult> {
    console.log('[Mock] GitHub Search Args:', args);
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      data: [
        { name: 'facebook/react', stars: 220000, description: 'A JavaScript library for building user interfaces.' },
        { name: 'vercel/next.js', stars: 118000, description: 'The React Framework for the Web.' },
        { name: 'tailwindlabs/tailwindcss', stars: 76000, description: 'A utility-first CSS framework for rapid UI development.' }
      ]
    };
  },

  async mockWeather(args: string): Promise<ToolResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: {
        location: args.replace(/['"]/g, '') || 'Kuala Lumpur',
        temperature: '28°C',
        condition: 'Partly Cloudy',
        humidity: '65%'
      }
    };
  },

  async mockWebSearch(args: string): Promise<ToolResult> {
    console.log('[Mock] Web Search Args:', args);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      success: true,
      data: [
        { title: 'Teleaon Bot Official Documentation', url: 'https://teleaon.bot/docs' },
        { title: 'Best AI Assistants 2026', url: 'https://techreview.com/ai-2026' }
      ]
    };
  },

  async mockTmux(args: string): Promise<ToolResult> {
    console.log('[Mock] Tmux Args:', args);
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: true,
      data: {
        activeServer: 'ubuntu-prod-01',
        sessions: [
          { id: '0', name: 'main-server', windows: 3, attached: true },
          { id: '1', name: 'db-logs', windows: 1, attached: false }
        ]
      }
    };
  },

  async mockSummarize(args: string): Promise<ToolResult> {
    console.log('[Mock] Summarize Args:', args);
    await new Promise(resolve => setTimeout(resolve, 2500));
    return {
      success: true,
      data: {
        summary: "The content discusses the rise of Agentic AI workflows in 2025. Key points include: 1) Shift from chatbots to autonomous agents, 2) Increased reliance on tool execution, and 3) The importance of memory and context persistence.",
        wordCount: 45,
        originalLength: 1200
      }
    };
  },

  async mockCodeReview(args: string): Promise<ToolResult> {
    console.log('[Mock] Code Review Args:', args);
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      success: true,
      data: {
        score: 'B+',
        issues: [
          { severity: 'medium', message: 'Use of "any" type detected in 3 locations.' },
          { severity: 'low', message: 'Missing return type on helper function.' }
        ],
        suggestions: [
          'Consider separating API calls into a dedicated service layer.',
          'Add error boundary for the main component.'
        ]
      }
    };
  },

  async mockCalendar(args: string): Promise<ToolResult> {
    console.log('[Mock] Calendar Args:', args);
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
      success: true,
      data: {
        date: new Date().toLocaleDateString(),
        events: [
          { time: '10:00 AM', title: 'Team Standup', participants: ['Alice', 'Bob'] },
          { time: '02:00 PM', title: 'Client Demo: Teleaon Bot', participants: ['External Client'] },
          { time: '04:30 PM', title: 'Code Review Sync', participants: ['Dev Team'] }
        ]
      }
    };
  },

  async mockEmail(args: string): Promise<ToolResult> {
    console.log('[Mock] Email Args:', args);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      success: true,
      data: {
        unreadCount: 3,
        recent: [
          { from: 'GitHub Notifications', subject: '[TeleaonBot] CI build failed', time: '10 mins ago' },
          { from: 'Alice Smith', subject: 'Re: Design Assets for new Icon', time: '1 hour ago' },
          { from: 'Stripe', subject: 'Invoice #4401 payment successful', time: '3 hours ago' }
        ]
      }
    };
  }
};
