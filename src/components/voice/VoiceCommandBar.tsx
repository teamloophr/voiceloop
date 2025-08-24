import React, { useState, useCallback } from 'react';
import { Mic, MicOff, Volume2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useAssistant } from '@/hooks/useAssistant';
import { VoiceVisualizer } from './VoiceVisualizer';

export const VoiceLoopCommandBar: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { processCommand, isThinking } = useAssistant();
  const { speak, isSpeaking } = useTextToSpeech();

  const handleVoiceResult = useCallback(async (transcript: string, isFinal: boolean) => {
    if (isFinal && transcript.trim()) {
      setIsProcessing(true);
      try {
        const response = await processCommand(transcript);
        if (response) {
          await speak(response);
        }
      } catch (error) {
        console.error('Voice command error:', error);
        await speak('Sorry, I encountered an error processing your command.');
      } finally {
        setIsProcessing(false);
      }
    }
  }, [processCommand, speak]);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
  } = useVoiceRecognition({
    onResult: handleVoiceResult,
    continuous: false,
    interimResults: true,
  });

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Voice commands not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Voice Status Indicator */}
      {(isListening || isProcessing || isSpeaking || isThinking) && (
        <div className="flex items-center space-x-2">
          <VoiceVisualizer isActive={isListening} />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {isListening && 'Listening...'}
            {isProcessing && 'Processing...'}
            {isThinking && 'Thinking...'}
            {isSpeaking && 'Speaking...'}
          </span>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="max-w-xs truncate text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          "{transcript}"
        </div>
      )}

      {/* AI Thinking Indicator */}
      {isThinking && (
        <Badge variant="secondary" className="flex items-center space-x-1">
          <Brain className="h-3 w-3 animate-pulse" />
          <span>AI Processing</span>
        </Badge>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && (
        <Volume2 className="h-4 w-4 text-blue-500 animate-pulse" />
      )}
    </div>
  );
};
