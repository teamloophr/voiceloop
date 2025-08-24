import { useState, useCallback } from 'react';

interface DashboardData {
  totalEmployees: number;
  openPositions: number;
  avgTimeToHire: number;
  employeeSatisfaction: number;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
  trainingProgress: Array<{
    name: string;
    progress: number;
  }>;
}

const mockDashboardData: DashboardData = {
  totalEmployees: 247,
  openPositions: 8,
  avgTimeToHire: 18,
  employeeSatisfaction: 94,
  recentActivities: [
    {
      id: '1',
      type: 'onboarding',
      title: 'John Smith completed onboarding',
      description: 'Successfully completed all required training modules',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'application',
      title: 'New candidate applied',
      description: 'Senior Developer position - Sarah Johnson',
      timestamp: '4 hours ago'
    },
    {
      id: '3',
      type: 'review',
      title: 'Q1 Performance reviews started',
      description: 'Performance review cycle initiated for all departments',
      timestamp: '1 day ago'
    }
  ],
  trainingProgress: [
    { name: 'Data Security Training', progress: 85 },
    { name: 'Leadership Development', progress: 62 },
    { name: 'New Employee Orientation', progress: 94 },
    { name: 'Compliance Training', progress: 78 },
    { name: 'Technical Skills', progress: 71 }
  ]
};

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(mockDashboardData);

  const executeAction = useCallback(async (action: string, parameters: Record<string, string> = {}): Promise<string> => {
    switch (action) {
      case 'navigate_dashboard':
        return 'You are already on the main dashboard. What would you like to know?';
      
      case 'navigate_analytics':
        return 'I can show you analytics information. The dashboard displays hiring trends, training progress, and department distribution. What specific data would you like to see?';
      
      case 'navigate_employees':
        return 'I can help you with employee information. Currently showing 247 total employees with 8 open positions. What would you like to know about the team?';
      
      case 'navigate_training':
        return 'Training progress is displayed on the dashboard. Data Security Training is at 85%, Leadership Development at 62%, and New Employee Orientation at 94%. How can I help with training?';
      
      case 'query_employee_count':
        return `You currently have ${dashboardData.totalEmployees} employees, with ${dashboardData.openPositions} open positions.`;
      
      case 'query_hiring_stats':
        return `Your average time to hire is ${dashboardData.avgTimeToHire} days, which is 3 days faster than last month. You have ${dashboardData.openPositions} open positions, with 3 marked as urgent.`;
      
      case 'query_satisfaction':
        return `Employee satisfaction is currently at ${dashboardData.employeeSatisfaction}%, which is a 2% increase from last quarter. This is above industry average.`;
      
      case 'query_training_progress':
        return `Here's your training progress: Data Security Training is ${dashboardData.trainingProgress[0].progress}% complete, Leadership Development is ${dashboardData.trainingProgress[1].progress}% complete, and New Employee Orientation is ${dashboardData.trainingProgress[2].progress}% complete.`;
      
      case 'query_pto_balance':
        return 'Your current PTO balance shows 15 vacation days remaining, 3 sick days, and 2 personal days. You have 8 days scheduled for next month. Would you like me to help you request additional time off?';
      
      case 'query_wellness_tips':
        return 'Here are today\'s wellness tips: Take a 5-minute stretch break every hour, stay hydrated with 8 glasses of water daily, and practice deep breathing exercises. Would you like me to set a wellness reminder for you?';
      
      case 'query_cost_insights':
        return 'Your cost insights show HR operations are 12% under budget this quarter. Training costs are optimized, and employee retention initiatives have saved $45,000 in recruitment costs. Would you like a detailed cost breakdown?';
      
      case 'action_add_employee':
        const employeeName = parameters.employeeName || 'a new employee';
        return `I'll help you add ${employeeName}. You can use the "Add Employee" button in the top right, or I can guide you through the process. What information do you have about ${employeeName}?`;
      
      case 'action_schedule_review':
        return 'I can help you schedule a performance review. What date and time would you prefer? Also, which employee would this be for?';
      
      case 'action_generate_report':
        const reportType = parameters.reportType || 'a general report';
        return `I'll generate ${reportType} for you. This will include current metrics, trends, and recommendations. The report will be ready in a few moments.`;
      
      case 'action_send_message':
        const message = parameters.message || 'your message';
        return `I'll help you send a message: "${message}". This will be sent to all employees. Would you like me to proceed with sending this announcement?`;
      
      case 'action_request_pto':
        return 'I can help you request PTO. How many days would you like to request, and what dates are you thinking of? I\'ll also check if you have enough balance available.';
      
      case 'action_log_attendance':
        return 'I\'ll log your attendance. You\'re currently clocked in. Would you like me to set a reminder for when to clock out, or do you need to log a different time entry?';
      
      case 'action_set_wellness_reminder':
        return 'I\'ll set a wellness reminder for you. I can remind you to take breaks, stay hydrated, or practice mindfulness exercises. What type of reminder would you like, and how often?';
      
      case 'assistant_help':
        return 'I\'m VoiceLoop, your AI assistant for Teamloop! I can help you with: HR tasks (employee management, PTO requests), wellness tips and reminders, cost insights and analysis, attendance tracking, and general dashboard navigation. Try saying "check my PTO balance", "give me wellness tips", or "show cost insights".';
      
      case 'assistant_explain':
        return 'I can explain dashboard features, metrics, and how to use various functions. What would you like me to explain?';
      
      case 'assistant_greeting':
        return 'Hello! I\'m VoiceLoop, your integrated voice assistant for Teamloop. I can help you with HR tasks, PTO management, wellness tips, cost insights, and attendance tracking. How can I assist you today?';
      
      case 'assistant_thanks':
        return 'You\'re welcome! I\'m here to help make your HR tasks easier. Is there anything else you need assistance with?';
      
      default:
        return 'I understand you said something, but I\'m not sure what action to take. Try saying "help" to see what I can do, or ask me about employees, training, or other dashboard features.';
    }
  }, [dashboardData]);

  const updateDashboardData = useCallback((updates: Partial<DashboardData>) => {
    setDashboardData(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    dashboardData,
    executeAction,
    updateDashboardData,
  };
};
