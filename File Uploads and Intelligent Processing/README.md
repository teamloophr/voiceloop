- VoiceLoop HR Platform

A modern, AI-powered HR management platform with integrated voice assistant capabilities, built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Platform
- **HR Management Dashboard** - Comprehensive employee tracking and analytics
- **VoiceLoop AI Assistant** - AI-powered voice interactions for HR tasks
- **Sandbox Mode** - Development playground for testing data manipulation
- **Responsive Design** - Mobile-first approach with desktop optimization
- **Dark/Light Mode** - True black dark mode with light mode support

### AI & Voice Integration
- **OpenAI Whisper** - Speech-to-text transcription
- **ElevenLabs TTS** - High-quality text-to-speech
- **Floating Chat Interface** - Persistent, draggable, resizable chat window
- **Voice Commands** - Predefined AI suggestions and actions
- **Real-time Processing** - Instant voice input/output

### Data Management
- **Employee Records** - Add, edit, delete employee information
- **Performance Metrics** - Track KPIs and performance indicators
- **Activity Feed** - Monitor HR activities and updates
- **Real-time Updates** - Live data synchronization across components

## 🏗️ Site Architecture & Navigation

### Main Landing Page (`/`)
- **Hero Section** - Platform introduction with VoiceLoop launch button
- **Features Overview** - Key platform capabilities
- **HR Management Sandbox** - Editable employee and metrics management
- **Dashboard Preview** - Platform capabilities showcase

### Dashboard (`/dashboard`)
- **Header** - Logo (clickable to home), edit mode toggle, settings, theme toggle
- **VoiceLoop Assistant** - Featured AI chat interface at the top
- **Metrics Panel** - Key HR metrics with inline editing (sandbox mode)
- **Analytics Charts** - Visual data representation
- **Activity Feed** - Recent activities with add functionality (sandbox mode)
- **Footer** - Company info and status indicators

### Settings (`/settings`)
- **API Configuration** - OpenAI and ElevenLabs API key management
- **Theme Preferences** - Dark/light mode settings
- **User Preferences** - Customizable settings

### Chat Interface (`/chat`)
- **Standalone Chat** - Full-featured voice-enabled AI assistant
- **API Key Management** - Built-in configuration for voice services

## 🎯 Sandbox Mode - Development Playground

### Purpose
Sandbox mode allows HR professionals and developers to:
- Test data manipulation in a safe environment
- Demonstrate real-time data flow between components
- Validate CRUD operations for employee and metric data
- Showcase the platform's capabilities without production concerns

### Features
- **Toggle Edit Mode** - Enable/disable editing capabilities
- **Inline Editing** - Click-to-edit metrics and employee records
- **Real-time Updates** - Changes reflect immediately across the dashboard
- **Data Persistence** - Local storage for development data
- **Visual Indicators** - Clear indication when sandbox mode is active

### Usage
1. Navigate to dashboard and click "Enable Edit Mode"
2. Edit metrics by clicking the ✏️ icon on metric cards
3. Add new activities using the "Add" button in Activity Feed
4. Modify employee data on the main page sandbox section
5. Watch real-time updates across all components

## 📱 Mobile Optimization

### Responsive Design Features
- **Mobile-First Approach** - Optimized for small screens
- **Adaptive Layouts** - Grid systems that stack on mobile
- **Touch-Friendly Controls** - Appropriate button sizes and spacing
- **Responsive Typography** - Text scales appropriately across devices
- **Optimized Spacing** - Reduced padding and margins on mobile

### Breakpoint Strategy
- **Mobile**: `sm:` (640px+) - Compact layouts, stacked grids
- **Tablet**: `md:` (768px+) - Medium spacing, 2-column grids
- **Desktop**: `lg:` (1024px+) - Full layouts, 4-column grids
- **Large**: `xl:` (1280px+) - Maximum content width

### Mobile-Specific Enhancements
- **Compact Headers** - Smaller logo and button sizes on mobile
- **Stacked Navigation** - Vertical layout for mobile navigation
- **Touch Targets** - Minimum 44px touch areas for mobile
- **Readable Text** - Appropriate font sizes for mobile screens
- **Optimized Forms** - Mobile-friendly input fields and buttons

## 🤖 AI Context Awareness

### Platform Understanding
The AI assistant is aware of:
- **Site Structure** - Navigation patterns and page relationships
- **Data Models** - Employee, metric, and activity data structures
- **Sandbox Capabilities** - Development and testing features
- **Voice Commands** - Predefined AI suggestions and actions
- **Real-time Updates** - Live data synchronization

### Common User Scenarios
1. **HR Professional Setup** - Configuring the platform for team management
2. **Data Entry** - Adding and managing employee records
3. **Performance Monitoring** - Tracking KPIs and metrics
4. **Voice Interaction** - Using VoiceLoop for hands-free HR tasks
5. **Development Testing** - Utilizing sandbox mode for validation

## 🛠️ Technical Implementation

### Frontend Stack
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Vite** - Fast build tool and dev server

### State Management
- **React Context** - Global state for sandbox mode
- **Local Storage** - Persistence for chat and user preferences
- **Real-time Updates** - Live data synchronization

### Voice Services
- **OpenAI Whisper** - Speech-to-text via API
- **ElevenLabs** - Text-to-speech synthesis
- **MediaRecorder API** - Browser-based audio recording
- **Audio API** - Playback and audio management

### Responsive Utilities
- **CSS Grid** - Flexible layout system
- **Flexbox** - Component alignment and spacing
- **CSS Variables** - Theme-aware styling
- **Media Queries** - Breakpoint-specific styles

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key for Whisper functionality
- ElevenLabs API key for text-to-speech

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd human-light-mode-main

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Add your API keys to .env.local

# Start development server
npm run dev
```

### Environment Variables
```bash
# OpenAI API Key (required for Whisper)
VITE_OPENAI_API_KEY=your_openai_key_here

# ElevenLabs API Key (required for TTS)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

### Build & Deploy
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to your hosting platform
# The build output is in the 'dist' folder
```

## 🎨 Customization

### Theming
- **Dark Mode** - True black backgrounds with accent colors
- **Light Mode** - Clean white backgrounds with subtle gradients
- **Custom Colors** - Modify CSS variables in `src/index.css`
- **Component Styling** - Override shadcn/ui component styles

### Voice Assistant
- **Custom Commands** - Add new voice command suggestions
- **AI Responses** - Modify AI behavior and responses
- **Voice Settings** - Adjust TTS voice and speed
- **Integration** - Connect to external HR systems

### Data Models
- **Employee Fields** - Customize employee record structure
- **Metrics** - Define custom KPIs and calculations
- **Activities** - Add new activity types and statuses
- **Validation** - Implement custom data validation rules

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   ├── ui/            # shadcn/ui components
│   └── voice/         # Voice-related components
├── contexts/           # React context providers
├── hooks/             # Custom React hooks
├── pages/             # Route components
├── services/          # API and external service integrations
└── lib/               # Utility functions and configurations
```

### Key Components
- **DashboardLayout** - Main dashboard structure and navigation
- **MetricsPanel** - HR metrics display with inline editing
- **ActivityFeed** - Activity tracking with add functionality
- **FloatingChat** - Persistent voice-enabled chat interface
- **SandboxContext** - Global state management for sandbox mode

### Adding New Features
1. **Component Creation** - Add new components to appropriate directories
2. **State Management** - Extend SandboxContext for new data types
3. **Routing** - Add new routes in App.tsx
4. **Styling** - Use Tailwind classes and CSS variables
5. **Testing** - Test on mobile and desktop devices

## 📱 Mobile Testing

### Device Testing
- **iOS Safari** - Test on iPhone and iPad
- **Android Chrome** - Test on various Android devices
- **Responsive DevTools** - Use browser dev tools for mobile simulation
- **Touch Interactions** - Verify touch targets and gestures

### Performance
- **Bundle Size** - Monitor JavaScript bundle size
- **Loading Speed** - Test on slower mobile networks
- **Memory Usage** - Check for memory leaks on mobile
- **Battery Impact** - Minimize battery drain from voice features

## 🤝 Contributing

### Development Workflow
1. **Feature Branch** - Create feature branch from main
2. **Mobile First** - Develop with mobile in mind
3. **Testing** - Test on multiple devices and screen sizes
4. **Code Review** - Submit PR for review
5. **Mobile Validation** - Ensure mobile compatibility

### Code Standards
- **TypeScript** - Use strict typing
- **Responsive Design** - Mobile-first approach
- **Accessibility** - Follow WCAG guidelines
- **Performance** - Optimize for mobile devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the documentation in the `docs/` folder
- Review the code examples in components
- Test the sandbox mode for feature understanding
- Use the VoiceLoop assistant for platform guidance

---

**Built with ❤️ for modern HR professionals who value efficiency, accessibility, and innovation.**
