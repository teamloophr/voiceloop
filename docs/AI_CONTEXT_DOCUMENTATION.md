# 🤖 AI Context Documentation for Teamloop + VoiceLoop

## 📋 Overview
This document provides comprehensive context for AI assistants to understand the Teamloop + VoiceLoop platform, its data structure, and capabilities. Use this information to provide accurate, contextual responses to user queries.

## 🏗️ Platform Architecture

### **Technology Stack**
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **State Management**: React Context (SandboxContext)
- **UI Components**: shadcn/ui component library
- **Voice Processing**: Web Speech API + OpenAI Whisper
- **AI Integration**: OpenAI GPT-4 + ElevenLabs TTS
- **Routing**: React Router DOM

### **Core Components**
- **SandboxContext**: Central state management for all HR data
- **EditableEmployeeManager**: Employee CRUD operations
- **EditableMetricsManager**: Metrics editing and updates
- **DashboardLayout**: Real-time dashboard with live data
- **VoiceLoopCommandBar**: Voice command interface

## 📊 Data Models & Structure

### **Employee Data Model**
```typescript
interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'inactive' | 'onboarding';
  performance: number; // 0-100 scale
  ptoDays: number;
  manager: string;
}
```

### **Metrics Data Model**
```typescript
interface Metric {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  urgent?: boolean;
  editable?: boolean;
}
```

### **Activity Data Model**
```typescript
interface Activity {
  id: string;
  type: 'onboarding' | 'application' | 'review' | 'training' | 'general';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
    initials: string;
  };
  status?: 'completed' | 'pending' | 'urgent';
}
```

## 🧪 Sandbox Mode Capabilities

### **Real-time Data Manipulation**
- **Employee Management**: Add, edit, delete employees
- **Metrics Updates**: Modify key performance indicators
- **Live Calculations**: Dashboard metrics update automatically
- **Session Persistence**: Changes persist during development session

### **Sample Data Included**
- **4 Pre-populated Employees** with realistic HR data
- **Department Coverage**: HR, Engineering, Sales, Marketing
- **Performance Variations**: Range from 75% to 94%
- **Status Distribution**: Active, onboarding employees

### **Available Actions**
1. **Add New Employee**: Complete form with all HR fields
2. **Edit Employee**: Modify existing employee data
3. **Delete Employee**: Remove employee records
4. **Update Metrics**: Change values, trends, urgency flags
5. **Real-time Sync**: All changes reflect immediately in dashboard

## 🎯 VoiceLoop AI Assistant

### **Context Awareness**
The AI assistant has full access to:
- Current employee count and list
- Department distribution
- Performance metrics and trends
- Employee statuses (active/onboarding/inactive)
- Real-time data changes from sandbox mode

### **Intelligent Responses**
- **Employee Queries**: "How many employees do we have?" → Real count
- **Department Analysis**: "Show engineering team" → Filtered results
- **Performance Insights**: "Team performance status" → Calculated metrics
- **Trend Analysis**: "Hiring progress" → Onboarding status

### **Voice Command Integration**
- **Speech-to-Text**: Web Speech API + Whisper fallback
- **Intent Recognition**: Natural language processing
- **Action Execution**: Direct data manipulation
- **Text-to-Speech**: ElevenLabs integration

## 🚀 Site Navigation & Routes

### **Main Routes**
- `/` - Landing page with sandbox mode
- `/dashboard` - Real-time HR dashboard
- `/chat` - AI assistant interface
- `/settings` - Configuration and preferences

### **Component Hierarchy**
```
App
├── SandboxProvider (Context)
├── Header (Navigation + VoiceLoop)
├── Routes
│   ├── Index (Landing + Sandbox)
│   ├── DashboardPage
│   ├── ChatPage
│   └── SettingsPage
└── Footer
```

### **Sandbox Mode Location**
- **Main Page**: Hero → Features → **HR Management Sandbox** → Dashboard Preview
- **Two-Column Layout**: Employee Manager + Metrics Manager
- **Interactive Forms**: Real-time data entry and editing

## 💡 Common User Scenarios

### **HR Professional Testing**
1. **Add Test Employee**: Use sandbox to create sample data
2. **Modify Metrics**: Update performance indicators
3. **View Dashboard**: See real-time changes reflected
4. **Test Voice Commands**: Use VoiceLoop with live data

### **Stakeholder Demo**
1. **Show Current State**: Display existing employee data
2. **Live Modifications**: Demonstrate real-time updates
3. **Dashboard Sync**: Show immediate metric calculations
4. **Voice Interaction**: Highlight hands-free operation

### **Development Testing**
1. **Data Validation**: Test form inputs and validation
2. **State Management**: Verify context updates
3. **Component Integration**: Test real-time sync
4. **Error Handling**: Test edge cases and validation

## 🔧 Technical Implementation

### **State Management**
```typescript
const {
  employees,        // Current employee list
  metrics,         // Key metrics data
  activities,      // Recent activities
  updateEmployee,  // Update employee function
  addEmployee,     // Add employee function
  deleteEmployee,  // Delete employee function
  updateMetric     // Update metric function
} = useSandbox();
```

### **Real-time Updates**
- **Context Updates**: All components re-render automatically
- **Calculated Metrics**: Dashboard metrics computed from employee data
- **Live Sync**: Changes in sandbox immediately appear in dashboard
- **Session Persistence**: Data maintained during development session

### **Data Flow**
```
Sandbox Input → Context Update → Component Re-render → Dashboard Update
     ↓              ↓              ↓              ↓
  Form Data → State Change → UI Update → Live Metrics
```

## 📚 Available Commands & Queries

### **Employee Management**
- "How many employees do we have?"
- "Show me the engineering team"
- "What's the average performance score?"
- "Who is currently onboarding?"

### **Metrics & Analytics**
- "What's our current employee count?"
- "Show performance trends"
- "Department distribution"
- "Onboarding status"

### **System Information**
- "What can this platform do?"
- "How does the sandbox mode work?"
- "Explain the dashboard features"
- "What voice commands are available?"

## 🎯 Best Practices for AI Responses

### **Context-Aware Responses**
- Always reference current data when available
- Use real employee counts and metrics
- Reference actual department names
- Mention real-time capabilities

### **Sandbox Mode Promotion**
- Highlight the interactive development environment
- Explain real-time data manipulation
- Demonstrate live dashboard updates
- Showcase voice command integration

### **Technical Accuracy**
- Use correct component names and routes
- Reference actual data models
- Explain real implementation details
- Provide accurate technical guidance

---

**Note**: This documentation should be updated whenever new features are added or the platform architecture changes. The AI assistant should always reference the most current information to provide accurate responses.
