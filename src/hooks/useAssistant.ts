import { useState, useCallback } from 'react';
import { matchVoiceCommand, extractCommandParameters } from '@/lib/voiceCommands';
import { useDashboardData } from './useDashboardData';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useAssistant = () => {
  const [isThinking, setIsThinking] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const { dashboardData, executeAction } = useDashboardData();

  const processCommand = useCallback(async (transcript: string): Promise<string> => {
    setIsThinking(true);
    
    try {
      // Add user message to conversation
      const userMessage: ConversationMessage = {
        role: 'user',
        content: transcript,
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, userMessage]);

      // Try to match with predefined voice commands
      const matchedCommand = matchVoiceCommand(transcript);
      
      if (matchedCommand) {
        const parameters = extractCommandParameters(transcript, matchedCommand);
        const result = await executeAction(matchedCommand.action, parameters);
        
        if (result) {
          const assistantMessage: ConversationMessage = {
            role: 'assistant',
            content: result,
            timestamp: new Date(),
          };
          setConversation(prev => [...prev, assistantMessage]);
          return result;
        }
      }

      // Fallback response for unmatched commands
      const fallbackResponse = 'I heard you say "' + transcript + '". I can help you with employee information, training progress, hiring statistics, and more. Try saying "help" to see what I can do.';
      
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, assistantMessage]);
      
      return fallbackResponse;
    } catch (error) {
      console.error('Assistant processing error:', error);
      const errorResponse = 'I apologize, but I encountered an error processing your request. Please try again.';
      
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: errorResponse,
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, assistantMessage]);
      
      return errorResponse;
    } finally {
      setIsThinking(false);
    }
  }, [conversation, dashboardData, executeAction]);

  const clearConversation = useCallback(() => {
    setConversation([]);
  }, []);

  const addMessage = useCallback((content: string, role: 'user' | 'assistant' = 'user') => {
    const message: ConversationMessage = {
      role,
      content,
      timestamp: new Date(),
    };
    setConversation(prev => [...prev, message]);
  }, []);

  return {
    isThinking,
    conversation,
    processCommand,
    clearConversation,
    addMessage,
  };
};
