import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Mic, 
  Trash2, 
  Bot, 
  User,
  MessageSquare
} from 'lucide-react';
import { useAssistant } from '@/hooks/useAssistant';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { voiceCommands } from '@/lib/voiceCommands';

export const AssistantInterface: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { conversation, processCommand, clearConversation, isThinking } = useAssistant();
  const { speak, isSpeaking } = useTextToSpeech();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isThinking) return;

    const message = inputValue.trim();
    setInputValue('');
    
    try {
      const response = await processCommand(message);
      if (response) {
        await speak(response);
      }
    } catch (error) {
      console.error('Failed to process command:', error);
    }
  };

  const handleVoiceInput = async () => {
    // This would integrate with the voice recognition system
    // For now, we'll simulate it with a text input
    setInputValue('How many employees do we have?');
  };

  const handleSuggestionClick = (command: string) => {
    setInputValue(command);
    setShowSuggestions(false);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-500" />
          VoiceLoop Assistant
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Voice Ready
          </Badge>
          {isSpeaking && (
            <Badge variant="secondary" className="text-xs">
              Speaking
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Conversation Area */}
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {conversation.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Start a conversation with VoiceLoop</p>
                <p className="text-xs mt-1">Try asking about PTO, wellness tips, cost insights, or say "help"</p>
              </div>
            ) : (
              conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <User className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isThinking && (
              <div className="flex gap-3 justify-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 space-y-3">
          {/* Command Suggestions */}
          {showSuggestions && (
            <div className="flex flex-wrap gap-2">
              {voiceCommands.slice(0, 6).map((command, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(command.patterns[0])}
                  className="text-xs h-7"
                >
                  {command.patterns[0]}
                </Button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message or ask a question..."
              disabled={isThinking}
              className="flex-1"
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleVoiceInput}
              disabled={isThinking}
              className="flex-shrink-0"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || isThinking}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="text-xs h-7"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear Chat
            </Button>
            
            <div className="text-xs text-muted-foreground">
              {conversation.length} messages
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
