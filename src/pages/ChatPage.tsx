import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Send, Square, Volume2, Loader2, Settings } from 'lucide-react';
import { openaiService } from '@/services/openaiService';
import { elevenLabsService } from '@/services/elevenLabsService';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm VoiceLoop, your AI-powered HR assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Load API keys from localStorage on mount
  useEffect(() => {
    const savedOpenaiKey = localStorage.getItem('openai_api_key');
    const savedElevenLabsKey = localStorage.getItem('elevenlabs_api_key');
    
    if (savedOpenaiKey) {
      setOpenaiKey(savedOpenaiKey);
      openaiService.setApiKey(savedOpenaiKey);
    }
    if (savedElevenLabsKey) {
      setElevenLabsKey(savedElevenLabsKey);
      elevenLabsService.setApiKey(savedElevenLabsKey);
    }
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Generate AI response using OpenAI
      const aiResponse = await openaiService.generateResponse([
        { role: 'user', content: content.trim() }
      ]);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI response. Please check your OpenAI API key.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Transcribe audio using Whisper
      const transcription = await openaiService.transcribeAudio(audioBlob);
      
      // Add transcribed message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: transcription,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      // Generate AI response
      const aiResponse = await openaiService.generateResponse([
        { role: 'user', content: transcription }
      ]);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      toast({
        title: "Voice Message Processed",
        description: `Transcribed: "${transcription.substring(0, 50)}${transcription.length > 50 ? '...' : ''}"`,
      });
    } catch (error) {
      console.error('Error processing voice message:', error);
      toast({
        title: "Error",
        description: "Failed to process voice message. Please check your API keys.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playMessage = async (text: string) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      // Generate speech using ElevenLabs
      const audioBlob = await elevenLabsService.generateSpeech(text);
      await elevenLabsService.playAudio(audioBlob);
    } catch (error) {
      console.error('Error playing message:', error);
      toast({
        title: "Error",
        description: "Failed to play message. Please check your ElevenLabs API key.",
        variant: "destructive",
      });
    } finally {
      setIsPlaying(false);
    }
  };

  const saveApiKeys = () => {
    if (openaiKey) {
      localStorage.setItem('openai_api_key', openaiKey);
      openaiService.setApiKey(openaiKey);
    }
    if (elevenLabsKey) {
      localStorage.setItem('elevenlabs_api_key', elevenLabsKey);
      elevenLabsService.setApiKey(elevenLabsKey);
    }
    
    setShowSettings(false);
    toast({
      title: "API Keys Saved",
      description: "Your API keys have been saved and services are now active.",
    });
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: "Hello! I'm VoiceLoop, your AI-powered HR assistant. How can I help you today?",
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">VoiceLoop Chat</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              API Keys
            </Button>
            <Button
              variant="outline"
              onClick={clearChat}
              className="text-muted-foreground"
            >
              Clear Chat
            </Button>
          </div>
        </div>

        {/* API Keys Settings */}
        {showSettings && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
                <Input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for Whisper transcription and GPT responses
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ElevenLabs API Key</label>
                <Input
                  type="password"
                  value={elevenLabsKey}
                  onChange={(e) => setElevenLabsKey(e.target.value)}
                  placeholder="..."
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for text-to-speech functionality
                </p>
              </div>
              <Button onClick={saveApiKeys} className="w-full">
                Save API Keys
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Chat Area */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              VoiceLoop AI Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{message.content}</span>
                      {message.sender === 'ai' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playMessage(message.content)}
                          disabled={isPlaying}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isPlaying ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "outline"}
                disabled={isLoading}
                className="border-primary/20"
              >
                {isRecording ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
