import { useState, useCallback } from 'react';
import { API_CONFIG } from '@/config/api';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (isSpeaking) return;

    setIsSpeaking(true);
    setError(null);

    try {
      // Try ElevenLabs first if API key is available
      if (import.meta.env.VITE_ELEVENLABS_API_KEY || API_CONFIG.ELEVENLABS_API_KEY) {
        try {
          // Use real ElevenLabs API
          console.log('Using ElevenLabs TTS:', text);
          
          const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY || API_CONFIG.ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
              text,
              model_id: 'eleven_monolingual_v1',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5,
              },
            }),
          });

          if (response.ok) {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            return new Promise((resolve) => {
              audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                resolve();
              };
              audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                console.warn('ElevenLabs audio failed, falling back to browser speech');
                fallbackToBrowserSpeech(text, resolve);
              };
              audio.play();
            });
          } else {
            throw new Error('ElevenLabs API request failed');
          }
        } catch (elevenLabsError) {
          console.warn('ElevenLabs failed, falling back to browser speech:', elevenLabsError);
          // Fallback to browser speech synthesis
          return fallbackToBrowserSpeech(text);
        }
      } else {
        // No ElevenLabs API key, use browser speech synthesis
        return fallbackToBrowserSpeech(text);
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setError('Failed to generate speech');
      
      // Final fallback to browser speech synthesis
      return fallbackToBrowserSpeech(text);
    } finally {
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  const fallbackToBrowserSpeech = (text: string, resolve?: () => void): Promise<void> => {
    return new Promise((res) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onend = () => {
          resolve?.() || res();
        };
        
        utterance.onerror = () => {
          console.warn('Browser speech synthesis failed');
          resolve?.() || res();
        };
        
        speechSynthesis.speak(utterance);
      } else {
        console.warn('Speech synthesis not supported');
        resolve?.() || res();
      }
    });
  };

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    error,
    speak,
    stopSpeaking,
  };
};
