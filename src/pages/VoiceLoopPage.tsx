import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Mic, 
  Bot, 
  Settings, 
  Upload,
  Paperclip,
  Users,
  FileText,
  Brain,
  Zap
} from 'lucide-react';
import { FloatingChat } from '@/components/FloatingChat';

const VoiceLoopPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Bot className="h-12 w-12 mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold">
              VoiceLoop
            </h1>
          </div>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Your AI-powered HR assistant with voice AI, document analysis, and intelligent insights
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Mic className="h-4 w-4 mr-2" />
              Voice AI Ready
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Brain className="h-4 w-4 mr-2" />
              AI-Powered
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <FileText className="h-4 w-4 mr-2" />
              Smart Documents
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">VoiceLoop Features</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Mic className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Voice AI & Transcription</h3>
                    <p className="text-muted-foreground">
                      Speak naturally with OpenAI Whisper integration. Get instant voice-to-text and text-to-speech capabilities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">AI-Powered Chat</h3>
                    <p className="text-muted-foreground">
                      Intelligent conversations with context-aware responses. Ask questions about your documents and get smart insights.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Smart Document Analysis</h3>
                    <p className="text-muted-foreground">
                      Upload resumes and documents for AI analysis. Get summaries and structured data extraction before deciding to save.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">HR Management</h3>
                    <p className="text-muted-foreground">
                      Complete employee lifecycle management with AI insights and intelligent workflows.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4">Getting Started</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>1. Use the floating chat button to start conversations</p>
                <p>2. Upload documents for AI analysis and insights</p>
                <p>3. Ask questions about your HR data and documents</p>
                <p>4. Use voice commands for hands-free operation</p>
              </div>
            </div>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Live Chat Interface</h3>
              <p className="text-muted-foreground">
                Your VoiceLoop assistant is ready to help. Click the chat button below to get started.
              </p>
            </div>

            {/* Chat Preview Card */}
            <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Bot className="h-6 w-6 text-primary" />
                  VoiceLoop Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-background rounded-lg p-4 border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">VoiceLoop</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    Hello! I'm your AI-powered HR assistant. I can help you with employee management, 
                    document analysis, and answer questions about your HR data. How can I assist you today?
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {
                      // This will be handled by the floating chat
                      const chatButton = document.querySelector('[title="VoiceLoop Assistant"]') as HTMLElement;
                      if (chatButton) chatButton.click();
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Start Chat
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg w-fit mx-auto mb-3">
                  <Mic className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold mb-1">Voice Commands</h4>
                <p className="text-xs text-muted-foreground">Use voice to interact naturally</p>
              </Card>
              
              <Card className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg w-fit mx-auto mb-3">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold mb-1">Document Analysis</h4>
                <p className="text-xs text-muted-foreground">AI-powered insights from files</p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat - Always Available */}
      <FloatingChat />
    </div>
  );
};

export default VoiceLoopPage;

