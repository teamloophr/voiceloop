# 🤝 Contributing to Teamloop

Thank you for your interest in contributing to Teamloop! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Questions or Problems?](#questions-or-problems)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please report unacceptable behavior to hello@teamloop.com.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Git** for version control
- **Modern browser** for testing
- **API keys** for OpenAI and ElevenLabs (optional for UI development)

### Fork and Clone

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/teamloop.git
   cd teamloop
   ```
3. **Add upstream** remote:
   ```bash
   git remote add upstream https://github.com/original-owner/teamloop.git
   ```

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
cp env.teamloop.md .env.local
# Edit .env.local with your configuration
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8081`

### 4. Backend Setup (Optional)

```bash
cd human-light-mode-backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## 🔧 Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

### 2. Make Your Changes

- Follow the [Code Standards](#code-standards)
- Write tests for new functionality
- Update documentation as needed
- Ensure responsive design works on all screen sizes

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build test
npm run build
```

### 4. Commit Your Changes

Use conventional commit messages:

```bash
git commit -m "feat: add new AI chat feature"
git commit -m "fix: resolve voice transcription bug"
git commit -m "docs: update README with new features"
```

## 🔄 Pull Request Process

### 1. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 2. Create Pull Request

- Go to your fork on GitHub
- Click "New Pull Request"
- Select your feature branch
- Fill out the PR template

### 3. PR Requirements

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design verified

### 4. Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, your PR will be merged

## 📏 Code Standards

### TypeScript

- Use **strict mode** and proper typing
- Avoid `any` type - use proper interfaces
- Export types and interfaces from `src/types/`

### React Components

```tsx
// ✅ Good
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// ❌ Avoid
export function Button(props: any) {
  return <button {...props} />
}
```

### CSS and Styling

- Use **Tailwind CSS** utility classes
- Follow **mobile-first** responsive design
- Maintain **dark/light mode** compatibility
- Use **CSS variables** for theming

### File Naming

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Types**: PascalCase (`UserTypes.ts`)

### Import Organization

```tsx
// 1. React imports
import { useState, useEffect } from 'react'

// 2. Third-party libraries
import { Button } from '@/components/ui/button'

// 3. Local components
import { UserCard } from './UserCard'

// 4. Utilities and types
import { formatDate } from '@/lib/utils'
import type { User } from '@/types/user'
```

## 🧪 Testing

### Testing Guidelines

- **Unit tests** for utility functions
- **Component tests** for React components
- **Integration tests** for complex workflows
- **Accessibility tests** for UI components

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 Documentation

### Code Documentation

- **JSDoc** comments for functions and components
- **README** updates for new features
- **Component stories** for UI components
- **API documentation** for backend endpoints

### Documentation Standards

```tsx
/**
 * User profile component with avatar and basic information
 * @param user - User object containing profile data
 * @param onEdit - Callback function when edit button is clicked
 * @param variant - Visual variant of the component
 */
export function UserProfile({ 
  user, 
  onEdit, 
  variant = 'default' 
}: UserProfileProps) {
  // Component implementation
}
```

## ❓ Questions or Problems?

### Getting Help

- **GitHub Issues**: [Create an issue](https://github.com/your-username/teamloop/issues)
- **Discussions**: [Join the conversation](https://github.com/your-username/teamloop/discussions)
- **Email**: hello@teamloop.com
- **Documentation**: Check the [README](README.md)

### Before Asking

1. **Search** existing issues and discussions
2. **Check** the documentation
3. **Verify** your development environment
4. **Provide** detailed information about your problem

## 🎯 Contribution Areas

We welcome contributions in these areas:

### Frontend Development
- **UI Components**: New components and improvements
- **Responsive Design**: Mobile and tablet optimization
- **Accessibility**: ARIA labels, keyboard navigation
- **Performance**: Code splitting, lazy loading

### Backend Development
- **API Endpoints**: New routes and functionality
- **Database**: Schema design and optimization
- **Authentication**: Security improvements
- **Testing**: Unit and integration tests

### AI Integration
- **OpenAI**: GPT and Whisper improvements
- **ElevenLabs**: TTS enhancements
- **Voice AI**: Transcription accuracy
- **Chat Features**: Conversation management

### Documentation
- **README**: Project overview and setup
- **API Docs**: Endpoint documentation
- **Component Docs**: Usage examples
- **Tutorials**: Getting started guides

## 🏆 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **GitHub** contributors graph
- **Release notes** for significant contributions
- **Teamloop website** (when available)

## 📝 License

By contributing to Teamloop, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Teamloop! 🚀**

Your contributions help make Teamloop the best AI-powered employee management platform possible.
