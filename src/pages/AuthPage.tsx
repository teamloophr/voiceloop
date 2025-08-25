import React, { useState } from 'react'
import { LoginForm } from '../components/auth/LoginForm'
import { SignUpForm } from '../components/auth/SignUpForm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Logo and Navigation */}
        <div className="text-center mb-8">
          {/* Clickable Logo */}
          <Link to="/" className="inline-block mb-4">
            <img 
              src="/teamloop-logo.png" 
              alt="VoiceLoop Logo" 
              className="h-24 w-auto mx-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VoiceLoop</h1>
          <p className="text-gray-600">
            AI-Powered HR Management with Voice Commands
          </p>
          
          {/* Return Home Button */}
          <Link to="/" className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800 font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Return to Home
          </Link>
        </div>
        
        {/* Authentication Forms */}
        {isLogin ? (
          <LoginForm onSwitchToSignUp={() => setIsLogin(false)} />
        ) : (
          <SignUpForm onSwitchToLogin={() => setIsLogin(true)} />
        )}

        {/* Features Info Card */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">
                <strong>Features that require API keys:</strong>
              </p>
              <ul className="space-y-1 text-xs">
                <li>• Voice Transcription (OpenAI Whisper)</li>
                <li>• AI Chat Assistant (OpenAI GPT)</li>
                <li>• Document Analysis & RAG (OpenAI)</li>
                <li>• Enhanced Text-to-Speech (ElevenLabs - Optional)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* After Sign-In Navigation Help */}
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="text-center text-xs text-gray-500">
              <p className="mb-2">
                <strong>After signing in:</strong>
              </p>
              <p>If you're not automatically redirected, use the navigation above or click the logo to return home.</p>
              <div className="mt-3">
                <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                  <Home className="h-3 w-3" />
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
