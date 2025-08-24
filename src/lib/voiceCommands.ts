export interface VoiceCommand {
  patterns: string[];
  action: string;
  description: string;
  category: 'navigation' | 'query' | 'action' | 'assistant';
}

export const voiceCommands: VoiceCommand[] = [
  // Navigation Commands
  {
    patterns: ['show dashboard', 'go to dashboard', 'dashboard', 'main dashboard'],
    action: 'navigate_dashboard',
    description: 'Navigate to the main dashboard',
    category: 'navigation',
  },
  {
    patterns: ['show analytics', 'go to analytics', 'analytics', 'charts'],
    action: 'navigate_analytics',
    description: 'Navigate to analytics section',
    category: 'navigation',
  },
  {
    patterns: ['show employees', 'employee list', 'employees', 'staff list'],
    action: 'navigate_employees',
    description: 'Navigate to employee list',
    category: 'navigation',
  },
  {
    patterns: ['show training', 'training section', 'training progress'],
    action: 'navigate_training',
    description: 'Navigate to training section',
    category: 'navigation',
  },

  // Query Commands
  {
    patterns: ['how many employees', 'employee count', 'total employees', 'staff count'],
    action: 'query_employee_count',
    description: 'Get total employee count',
    category: 'query',
  },
  {
    patterns: ['pto balance', 'vacation days', 'time off balance', 'leave balance'],
    action: 'query_pto_balance',
    description: 'Check PTO/vacation balance',
    category: 'query',
  },
  {
    patterns: ['wellness tips', 'health tips', 'wellness prompt', 'health advice'],
    action: 'query_wellness_tips',
    description: 'Get wellness and health tips',
    category: 'query',
  },
  {
    patterns: ['cost insights', 'cost analysis', 'expense insights', 'budget overview'],
    action: 'query_cost_insights',
    description: 'Get cost insights and analysis',
    category: 'query',
  },
  {
    patterns: ['hiring rate', 'recruitment stats', 'hiring statistics', 'hiring trends'],
    action: 'query_hiring_stats',
    description: 'Get hiring statistics',
    category: 'query',
  },
  {
    patterns: ['employee satisfaction', 'satisfaction score', 'satisfaction rate', 'morale'],
    action: 'query_satisfaction',
    description: 'Get employee satisfaction metrics',
    category: 'query',
  },
  {
    patterns: ['training progress', 'training status', 'completion rates'],
    action: 'query_training_progress',
    description: 'Get training progress information',
    category: 'query',
  },

  // Action Commands
  {
    patterns: ['add employee', 'new employee', 'create employee', 'hire employee'],
    action: 'action_add_employee',
    description: 'Add a new employee',
    category: 'action',
  },
  {
    patterns: ['request pto', 'request time off', 'book vacation', 'schedule leave'],
    action: 'action_request_pto',
    description: 'Request PTO or time off',
    category: 'action',
  },
  {
    patterns: ['log attendance', 'clock in', 'clock out', 'mark attendance'],
    action: 'action_log_attendance',
    description: 'Log attendance or time tracking',
    category: 'action',
  },
  {
    patterns: ['set wellness reminder', 'wellness notification', 'health reminder'],
    action: 'action_set_wellness_reminder',
    description: 'Set wellness and health reminders',
    category: 'action',
  },
  {
    patterns: ['schedule review', 'performance review', 'schedule meeting', 'book review'],
    action: 'action_schedule_review',
    description: 'Schedule a performance review',
    category: 'action',
  },
  {
    patterns: ['generate report', 'create report', 'export report', 'download report'],
    action: 'action_generate_report',
    description: 'Generate a report',
    category: 'action',
  },
  {
    patterns: ['send message', 'message team', 'notify employees', 'team announcement'],
    action: 'action_send_message',
    description: 'Send a message to the team',
    category: 'action',
  },

  // Assistant Commands
  {
    patterns: ['help', 'what can you do', 'commands', 'available commands'],
    action: 'assistant_help',
    description: 'Show available commands',
    category: 'assistant',
  },
  {
    patterns: ['explain', 'what is', 'tell me about', 'describe'],
    action: 'assistant_explain',
    description: 'Explain a concept or feature',
    category: 'assistant',
  },
  {
    patterns: ['good morning', 'hello', 'hi', 'hey teamloop'],
    action: 'assistant_greeting',
    description: 'Greet the assistant',
    category: 'assistant',
  },
  {
    patterns: ['thank you', 'thanks', 'appreciate it'],
    action: 'assistant_thanks',
    description: 'Thank the assistant',
    category: 'assistant',
  },
];

export function matchVoiceCommand(transcript: string): VoiceCommand | null {
  const normalizedTranscript = transcript.toLowerCase().trim();
  
  for (const command of voiceCommands) {
    for (const pattern of command.patterns) {
      if (normalizedTranscript.includes(pattern.toLowerCase())) {
        return command;
      }
    }
  }
  
  return null;
}

export function extractCommandParameters(transcript: string, command: VoiceCommand): Record<string, string> {
  const params: Record<string, string> = {};
  
  // Extract common parameters based on command type
  if (command.action.includes('employee')) {
    const nameMatch = transcript.match(/(?:for|about|employee)\s+([a-zA-Z\s]+)/i);
    if (nameMatch) {
      params.employeeName = nameMatch[1].trim();
    }
  }
  
  if (command.action.includes('report')) {
    const typeMatch = transcript.match(/(?:generate|create)\s+([a-zA-Z\s]+)\s+report/i);
    if (typeMatch) {
      params.reportType = typeMatch[1].trim();
    }
  }
  
  if (command.action.includes('message')) {
    const messageMatch = transcript.match(/(?:message|notify|announce)\s+(.+)/i);
    if (messageMatch) {
      params.message = messageMatch[1].trim();
    }
  }
  
  return params;
}

export function getCommandSuggestions(partialCommand: string): VoiceCommand[] {
  if (!partialCommand.trim()) return voiceCommands.slice(0, 5);
  
  const normalizedPartial = partialCommand.toLowerCase().trim();
  
  return voiceCommands
    .filter(command => 
      command.patterns.some(pattern => 
        pattern.toLowerCase().includes(normalizedPartial)
      ) ||
      command.description.toLowerCase().includes(normalizedPartial)
    )
    .slice(0, 5);
}
