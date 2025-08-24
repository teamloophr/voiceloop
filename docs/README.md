# 🚀 Teamloop + VoiceLoop - HR + Wellness + Cost Insights Platform

<div align="center">
  <img src="src/assets/teamloop-logo-2.png" alt="Teamloop Logo" width="200" />
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Voice AI](https://img.shields.io/badge/VoiceLoop-AI%20Assistant-blue?style=flat&logo=mic&logoColor=white)](https://teamloop.com)
</div>

## 📖 Overview

**Teamloop + VoiceLoop** is a revolutionary HR + wellness + cost insights platform that integrates an intelligent voice assistant to simplify HR operations. Built with React, TypeScript, and cutting-edge AI technologies, VoiceLoop enables hands-free management of employee data, PTO requests, wellness tracking, and cost analysis through natural voice commands.

### ✨ Key Features

- 🎤 **VoiceLoop AI Assistant** - Integrated voice commands for all HR operations
- 👥 **Employee Management** - Complete lifecycle management with voice control
- 📅 **PTO & Attendance Tracking** - Voice-activated time-off requests and clock in/out
- 💚 **Wellness Integration** - Voice-activated health tips and wellness reminders
- 💰 **Cost Insights** - Voice-activated budget analysis and cost optimization
- 🤖 **AI-Powered Responses** - OpenAI GPT integration for intelligent HR support
- 🔊 **Natural Voice Synthesis** - ElevenLabs integration for human-like responses
- 📊 **Real-time Analytics** - Voice-activated dashboard insights and reporting
- 🎨 **Modern UI/UX** - Beautiful, responsive design with dark/light mode
- 📱 **Mobile-First Design** - Optimized for all devices and screen sizes

## 🏗️ Architecture

```
Teamloop + VoiceLoop/
├── Frontend (React + TypeScript)
│   ├── VoiceLoop Command Bar
│   ├── AI Assistant Interface
│   ├── HR Dashboard
│   ├── Analytics & Charts
│   └── Settings & Configuration
├── Voice Processing Pipeline
│   ├── Speech-to-Text (Web Speech API + Whisper)
│   ├── Intent Recognition & Processing
│   ├── Action Execution
│   └── Text-to-Speech (ElevenLabs)
├── Backend (Node.js + Express)
│   ├── OpenAI Integration
│   ├── ElevenLabs TTS
│   ├── Voice Command Processing
│   └── API Endpoints
└── Database (PostgreSQL/MongoDB)
    ├── Employee Management
    ├── PTO & Attendance
    ├── Wellness Data
    └── Cost Analytics
```

## 🎯 VoiceLoop Capabilities

### 🤖 AI Context Awareness
VoiceLoop is fully aware of your current HR data and can provide intelligent responses based on:
- **Real-time Employee Count**: Knows exactly how many employees you have
- **Department Distribution**: Understands team structure and composition
- **Performance Metrics**: Aware of current performance scores and trends
- **Active vs Onboarding**: Distinguishes between employee statuses
- **Live Data Changes**: Responds to modifications made in sandbox mode

### 🗣️ Voice Commands by Category

#### **HR Operations**
- `"Add new employee"` - Create employee profiles
- `"Schedule performance review"` - Book review meetings
- `"Generate employee report"` - Create custom reports
- `"Send team message"` - Broadcast announcements

#### **PTO & Attendance**
- `"Check my PTO balance"` - View vacation/sick days
- `"Request time off"` - Submit PTO requests
- `"Clock in"` / `"Clock out"` - Log attendance
- `"Show attendance history"` - View time tracking

#### **Wellness & Health**
- `"Give me wellness tips"` - Get health advice
- `"Set wellness reminder"` - Schedule health notifications
- `"Track my breaks"` - Monitor work-life balance
- `"Wellness check-in"` - Log health status

#### **Cost Insights**
- `"Show cost analysis"` - View budget breakdown
- `"HR cost optimization"` - Get savings recommendations
- `"Training cost report"` - Analyze learning investments
- `"Recruitment cost insights"` - Hiring expense analysis

#### **Navigation & Queries**
- `"Go to dashboard"` - Navigate to main view
- `"Show analytics"` - Display charts and metrics
- `"Employee count"` - Get team statistics
- `"Training progress"` - View learning status

## 🏗️ Site Architecture & Navigation

### **Main Landing Page (`/`)**
- **Hero Section**: Introduction to Teamloop + VoiceLoop
- **Features**: Platform capabilities overview
- **HR Management Sandbox**: Interactive employee and metrics management
- **Dashboard Preview**: Live preview of the dashboard
- **Voice Demo**: VoiceLoop capabilities demonstration

### **Dashboard (`/dashboard`)**
- **Real-time Metrics**: Live employee data calculations
- **Activity Feed**: Recent HR activities and updates
- **Analytics Charts**: Training progress, hiring trends, department distribution
- **AI Assistant**: Integrated chat interface for HR queries

### **AI Chat (`/chat`)**
- **OpenAI GPT Integration**: Intelligent HR assistance
- **Context Awareness**: Understands current employee data and metrics
- **Voice Input**: Speech-to-text for hands-free interaction

### **Settings (`/settings`)**
- **Voice Configuration**: Adjust VoiceLoop settings
- **AI Preferences**: Customize AI assistant behavior
- **System Preferences**: Theme, notifications, etc.

## 🧪 Sandbox Mode - Development Playground

### **Purpose**
The sandbox mode provides a complete development environment for testing HR workflows, demonstrating real-time data manipulation, and showcasing the platform's capabilities to stakeholders.

### **Features**
- **Editable Employee Management**: Full CRUD operations for employee data
- **Live Metrics Updates**: Real-time calculation of HR metrics
- **Data Persistence**: Changes persist during the session
- **Real-time Dashboard Sync**: All modifications immediately reflect in the dashboard

### **How to Use Sandbox Mode**
1. **Navigate to Main Page**: Visit the homepage to access the sandbox
2. **Add Employees**: Use the employee form to create new team members
3. **Edit Data**: Modify existing employee information in real-time
4. **Update Metrics**: Adjust key performance indicators
5. **View Dashboard**: See all changes reflected immediately in the dashboard
6. **Test Workflows**: Simulate real HR scenarios and processes

### **Sample Data Included**
- **4 Sample Employees**: Pre-populated with realistic HR data
- **Department Coverage**: HR, Engineering, Sales, Marketing
- **Performance Metrics**: Realistic scores and trends
- **Status Variations**: Active, onboarding, and inactive employees

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **OpenAI API Key** for GPT and Whisper
- **ElevenLabs API Key** for enhanced TTS
- **Modern browser** with ES6+ support (Chrome/Edge recommended for voice)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/teamloop-voiceloop.git
   cd teamloop-voiceloop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.dashboard .env.local
   # Edit .env.local with your API keys
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the dashboard**
   Navigate to `http://localhost:5173/dashboard`

6. **Test VoiceLoop**
   Click the "VoiceLoop" button and start speaking!

## 🌐 Live Demo

**Try Teamloop + VoiceLoop Live:** [http://teamloop-voiceloop.s3-website-us-east-1.amazonaws.com](http://teamloop-voiceloop.s3-website-us-east-1.amazonaws.com)

Experience the future of HR management with voice-activated commands and AI-powered insights.

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_MODEL=gpt-4

# ElevenLabs Configuration
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
VITE_ELEVENLABS_MODEL=eleven_monolingual_v1

# VoiceLoop Configuration
VITE_VOICE_WAKE_WORD=hey teamloop
VITE_VOICE_TIMEOUT=5000
VITE_VOICE_CONFIDENCE_THRESHOLD=0.8

# Feature Flags
VITE_ENABLE_VOICE_COMMANDS=true
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_VOICE_TRANSCRIPTION=true
```

### API Keys Setup

1. **OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add to your `.env.local` file

2. **ElevenLabs API Key**
   - Visit [ElevenLabs](https://elevenlabs.io/)
   - Sign up and get your API key
   - Add to your `.env.local` file

## 🎨 VoiceLoop User Experience

### Voice Command Flow

```
User Speaks → Frontend Captures → Backend Processes → STT Conversion → 
Intent Recognition → Action Execution → Response Generation → TTS Output → User Hears Response
```

### Voice Command Examples

#### **Quick HR Queries**
- `"How many employees do we have?"`
- `"What's our hiring rate?"`
- `"Show me training progress"`

#### **Wellness & Health**
- `"Give me today's wellness tips"`
- `"Set a reminder to take breaks"`
- `"Track my water intake"`

#### **Cost Management**
- `"Show me cost insights"`
- `"What's our HR budget status?"`
- `"Generate cost optimization report"`

#### **Employee Actions**
- `"Add John Smith as new employee"`
- `"Schedule review for Sarah Johnson"`
- `"Send message about team meeting"`

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Project Structure

```
teamloop-voiceloop/
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   │   ├── dashboard/      # Dashboard components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── MetricsPanel.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── AnalyticsCharts.tsx
│   │   ├── voice/          # VoiceLoop components
│   │   │   ├── VoiceLoopCommandBar.tsx
│   │   │   └── VoiceVisualizer.tsx
│   │   ├── assistant/      # AI Assistant
│   │   │   └── AssistantInterface.tsx
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   │   ├── useVoiceRecognition.ts
│   │   ├── useTextToSpeech.ts
│   │   ├── useAssistant.ts
│   │   └── useDashboardData.ts
│   ├── lib/                # Utility libraries
│   │   ├── voiceCommands.ts
│   │   ├── mockApi.ts
│   │   └── config/
│   │       └── api.ts
│   ├── pages/              # Page components
│   │   ├── DashboardPage.tsx
│   │   └── other pages...
│   └── assets/             # Images and static files
├── public/                 # Static assets
├── env.dashboard           # Environment template
└── docs/                   # Documentation files
```

## 🚀 Deployment

### S3 Static Website Hosting

Teamloop + VoiceLoop is deployed to AWS S3 for production hosting:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to S3**
   ```bash
   aws s3 sync dist/ s3://teamloop-voiceloop --delete
   ```

3. **Access your live site**
   Navigate to: `http://teamloop-voiceloop.s3-website-us-east-1.amazonaws.com`

### AWS S3 Configuration

#### **Bucket Setup**
```bash
# Create S3 bucket
aws s3 mb s3://teamloop-voiceloop

# Configure static website hosting
aws s3 website s3://teamloop-voiceloop --index-document index.html --error-document index.html
```

#### **Bucket Policy**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::teamloop-voiceloop/*"
        }
    ]
}
```

#### **CORS Configuration**
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### CloudFront Distribution (Optional)

For enhanced performance and HTTPS:

1. **Create CloudFront distribution**
2. **Set origin** to S3 bucket
3. **Configure behaviors** for optimal caching
4. **Set custom domain** (if applicable)

## 🔧 Backend Setup

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Database** (PostgreSQL/MongoDB)

### Installation

1. **Navigate to backend directory**
   ```bash
   cd human-light-mode-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

## 📱 Features in Detail

### VoiceLoop AI Assistant

- **Natural voice commands** for all HR operations
- **Context-aware responses** for HR-specific queries
- **Multi-language support** (English primary)
- **Voice command suggestions** and help system
- **Real-time voice processing** with visual feedback

### Employee Management

- **Complete employee profiles** with voice search
- **Performance tracking** and analytics
- **Onboarding workflows** and automation
- **Document management** and storage
- **Voice-activated employee queries**

### PTO & Attendance System

- **Voice-activated time-off requests**
- **Clock in/out functionality**
- **PTO balance tracking**
- **Attendance history and reports**
- **Automated reminders and notifications**

### Wellness Integration

- **Daily wellness tips** via voice
- **Health reminder system**
- **Break tracking** and work-life balance
- **Wellness check-ins** and progress
- **Personalized health recommendations**

### Cost Insights & Analytics

- **Voice-activated budget analysis**
- **Cost optimization recommendations**
- **Training investment insights**
- **Recruitment cost analysis**
- **Real-time financial reporting**

## 🚧 Current Status

### ✅ Completed
- [x] VoiceLoop command system
- [x] AI Assistant integration
- [x] Dashboard with voice controls
- [x] PTO & wellness voice commands
- [x] Cost insights voice queries
- [x] ElevenLabs TTS integration
- [x] Responsive design system
- [x] Dark/light mode support

### 🔄 In Progress
- [ ] Backend API integration
- [ ] Authentication system
- [ ] Production deployment
- [ ] S3 bucket configuration

### 📋 Planned
- [ ] Advanced voice biometrics
- [ ] Multi-language voice support
- [ ] Mobile app development
- [ ] API documentation
- [ ] Performance optimization
- [ ] Advanced analytics

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** voice commands thoroughly
5. **Submit** a pull request

### Code Standards

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Voice command testing** required
- **Conventional commits** for messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and component docs
- **Voice Commands**: Say "help" in the dashboard
- **Issues**: [GitHub Issues](https://github.com/your-username/teamloop-voiceloop/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/teamloop-voiceloop/discussions)
- **Email**: hello@teamloop.com

### Common Issues

- **Voice not working**: Check browser permissions and use Chrome/Edge
- **API errors**: Verify environment variables
- **Build failures**: Clear `node_modules` and reinstall
- **Voice commands not recognized**: Check microphone access and try different phrases

## 🙏 Acknowledgments

- **OpenAI** for GPT and Whisper APIs
- **ElevenLabs** for advanced TTS capabilities
- **shadcn/ui** for beautiful component library
- **Tailwind CSS** for utility-first styling
- **Vite** for fast development experience
- **Web Speech API** for voice recognition

## 📞 Contact

- **Website**: [teamloop.com](https://teamloop.com)
- **Email**: hello@teamloop.com
- **Twitter**: [@Teamloop](https://twitter.com/teamloop)
- **LinkedIn**: [Teamloop](https://linkedin.com/company/teamloop)

---

<div align="center">
  <strong>Built with ❤️ and 🎤 by the Teamloop + VoiceLoop Development Team</strong>
  
  [![Teamloop](https://img.shields.io/badge/Teamloop-AI%20Powered-blue?style=for-the-badge&logo=teamloop)](https://teamloop.com)
  [![VoiceLoop](https://img.shields.io/badge/VoiceLoop-Voice%20AI-green?style=for-the-badge&logo=mic)](https://teamloop.com)
</div>
