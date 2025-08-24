import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VoiceLoopCommandBar } from '@/components/voice/VoiceCommandBar';
import { MetricsPanel } from './MetricsPanel';
import { ActivityFeed } from './ActivityFeed';
import { AnalyticsCharts } from './AnalyticsCharts';
import { AssistantInterface } from '@/components/assistant/AssistantInterface';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Link } from 'react-router-dom';
import { Settings, Edit3, Check, X } from 'lucide-react';
import { useSandbox } from '@/contexts/SandboxContext';

export const DashboardLayout: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { addActivity, updateMetric } = useSandbox();

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
                <img 
                  src="/teamloop_logo_2.png" 
                  alt="Teamloop" 
                  className="h-12 w-auto sm:h-16 cursor-pointer"
                />
              </Link>
              {isEditMode && (
                <Badge variant="secondary" className="bg-yellow-500 text-yellow-900 text-xs sm:text-sm">
                  🎯 Sandbox Mode
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                onClick={toggleEditMode}
                className={`text-xs sm:text-sm ${isEditMode ? "bg-yellow-500 hover:bg-yellow-600" : ""}`}
              >
                {isEditMode ? (
                  <>
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Exit Edit Mode</span>
                    <span className="sm:hidden">Exit</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Enable Edit Mode</span>
                    <span className="sm:hidden">Edit</span>
                  </>
                )}
              </Button>
              <Link to="/settings">
                <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-10 sm:w-10 p-0">
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* VoiceLoop Assistant - Featured at the top */}
        <div className="mb-6 sm:mb-8">
          <AssistantInterface />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Metrics Panel */}
          <div className="lg:col-span-3">
            <MetricsPanel isEditMode={isEditMode} />
            <div className="mt-4 sm:mt-6">
              <AnalyticsCharts />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <ActivityFeed isEditMode={isEditMode} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src="/teamloop_logo_2.png" 
                alt="Teamloop" 
                className="h-6 w-auto sm:h-8 opacity-70"
              />
              <span className="text-xs sm:text-sm text-muted-foreground">
                © 2024 Teamloop. All rights reserved.
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
              <span>VoiceLoop Active</span>
              <span className="hidden sm:inline">•</span>
              <span>AI Assistant Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
