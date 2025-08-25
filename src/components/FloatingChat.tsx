import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  X, 
  Minimize2, 
  Maximize2, 
  Send, 
  Mic,
  Bot,
  User,
  GripVertical,
  Settings,
  Volume2,
  Loader2,
  Trash2,
  Paperclip,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { openaiService } from '@/services/openaiService';
import { elevenLabsService } from '@/services/elevenLabsService';
import { voiceCommands } from '@/lib/voiceCommands';
import ChatFileUpload from './ChatFileUpload';
import { ChatDocumentModal } from './chat/ChatDocumentModal';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('floatingChatOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMinimized, setIsMinimized] = useState(() => {
    const saved = localStorage.getItem('floatingChatMinimized');
    return saved ? JSON.parse(saved) : false;
  });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm VoiceLoop, your AI-powered HR assistant. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  // Dragging state
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem('floatingChatPosition');
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 400, y: window.innerHeight - 550 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  // Resizing state
  const [size, setSize] = useState<Size>(() => {
    const saved = localStorage.getItem('floatingChatSize');
    return saved ? JSON.parse(saved) : { width: 384, height: 500 };
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

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

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('floatingChatOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('floatingChatMinimized', JSON.stringify(isMinimized));
  }, [isMinimized]);

  useEffect(() => {
    localStorage.setItem('floatingChatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('floatingChatPosition', JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem('floatingChatSize', JSON.stringify(size));
  }, [size]);

  // Dragging handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      const rect = chatRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Constrain to viewport bounds
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset, size]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Resizing handlers
  const handleResizeStart = useCallback((direction: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
  }, []);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newSize = { ...size };
      
      if (resizeDirection.includes('e')) {
        newSize.width = e.clientX - position.x;
      }
      if (resizeDirection.includes('w')) {
        newSize.width = position.x + size.width - e.clientX;
        if (newSize.width > 0) {
          setPosition(prev => ({ ...prev, x: e.clientX }));
        }
      }
      if (resizeDirection.includes('s')) {
        newSize.height = e.clientY - position.y;
      }
      if (resizeDirection.includes('n')) {
        newSize.height = position.y + size.height - e.clientY;
        if (newSize.height > 0) {
          setPosition(prev => ({ ...prev, y: e.clientY }));
        }
      }
      
      // Apply minimum size constraints
      newSize.width = Math.max(300, Math.min(newSize.width, window.innerWidth - 50));
      newSize.height = Math.max(200, Math.min(newSize.height, window.innerHeight - 50));
      
      setSize(newSize);
    }
  }, [isResizing, resizeDirection, size, position]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeDirection('');
  }, []);

  // Global mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', isDragging ? handleMouseMove : handleResizeMove);
      document.addEventListener('mouseup', isDragging ? handleMouseUp : handleResizeEnd);
      
      return () => {
        document.removeEventListener('mousemove', isDragging ? handleMouseMove : handleResizeMove);
        document.removeEventListener('mouseup', isDragging ? handleMouseUp : handleResizeEnd);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp, handleResizeMove, handleResizeEnd]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Generate AI response using OpenAI
      const aiResponse = await openaiService.generateResponse([
        { role: 'user', content: inputValue.trim() }
      ]);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting to my AI services. Please check your API keys in the settings.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
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
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
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
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing voice message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I couldn't process your voice message. Please check your API keys or try typing instead.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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
  };

  const handleSuggestionClick = (command: string) => {
    setInputValue(command);
    setShowSuggestions(false);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: "Hello! I'm VoiceLoop, your AI-powered HR assistant. How can I help you today?",
        sender: 'assistant',
        timestamp: new Date()
      }
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const resetToDefault = () => {
    setPosition({ x: window.innerWidth - 400, y: window.innerHeight - 550 });
    setSize({ width: 384, height: 500 });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Only trigger on header double-click
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      resetToDefault();
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Document analysis handlers
  const handleDocumentAnalyzed = (analysis: any) => {
    // Add assistant message about the document analysis
    const analysisMessage = {
      id: Date.now().toString(),
      content: `📄 **Document Analysis Complete!**

I've analyzed "${analysis.fileName}" and here's what I found:

**📋 Summary:** ${analysis.summary}

**🔑 Key Points:**
${analysis.keyPoints.map((point: string) => `• ${point}`).join('\n')}

**📊 Document Details:**
• Type: ${analysis.documentType}
• Words: ${analysis.wordCount}
• Sentences: ${analysis.sentenceCount}
• Estimated RAG Chunks: ${analysis.estimatedChunks}
• Confidence: ${(analysis.confidence * 100).toFixed(0)}%

**💡 Recommendation:** Based on my analysis, this document appears to contain valuable information that could enhance your knowledge base. 

Would you like me to save this document to your RAG library for future reference? This will allow me to answer questions based on its content.`,
      sender: 'assistant' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, analysisMessage]);
    scrollToBottom();
  };

  const handleSaveForRAG = (documentId: string) => {
    // Add confirmation message
    const confirmMessage = {
      id: Date.now().toString(),
      content: `✅ **Document Saved to RAG Library!**

Great choice! I've successfully added this document to your knowledge base. 

**What this means:**
• I can now reference this information when answering your questions
• The document content is indexed and searchable
• Future queries will include insights from this document
• Your knowledge base is continuously expanding

**Next steps:**
You can now ask me questions about the content of this document, or upload more documents to build a comprehensive knowledge library. Try asking something like:
• "What are the key points from the document I just uploaded?"
• "Summarize the main findings from [document name]"
• "How does this document relate to [specific topic]?"

Is there anything specific you'd like to know about this document?`,
      sender: 'assistant' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, confirmMessage]);
    scrollToBottom();
    
    // Here you would typically make an API call to save to your RAG system
    console.log('Document saved for RAG:', documentId);
    
    // Show success toast
    toast({
      title: "Document Saved Successfully!",
      description: "The document has been added to your RAG knowledge base.",
    });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleChat}
          size="lg"
          className="h-16 w-16 rounded-full bg-gradient-primary hover:opacity-90 shadow-lg"
          title="VoiceLoop Assistant"
        >
          <Mic className="h-8 w-8" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      ref={chatRef}
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: isMinimized ? 64 : size.height,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <Card className={cn(
        "w-full h-full shadow-2xl border-2 border-primary/20 relative floating-chat-transition",
        isDragging && "select-none floating-chat-dragging"
      )}>
        {/* Drag Handle */}
        <div className="drag-handle absolute top-0 left-0 right-0 h-8 bg-transparent cursor-grab active:cursor-grabbing z-10 rounded-t-lg" />
        
        {/* Visual feedback during drag/resize */}
        {(isDragging || isResizing) && (
          <div className="absolute inset-0 border-2 border-primary/40 rounded-lg pointer-events-none z-30" />
        )}
        
        {/* Resize Handles */}
        {!isMinimized && (
          <>
            <div 
              className="floating-chat-resize-handle corner absolute top-0 right-0 cursor-nw-resize z-20"
              onMouseDown={(e) => handleResizeStart('nw', e)}
            />
            <div 
              className="floating-chat-resize-handle corner absolute top-0 left-0 cursor-ne-resize z-20"
              onMouseDown={(e) => handleResizeStart('ne', e)}
            />
            <div 
              className="floating-chat-resize-handle corner absolute bottom-0 right-0 cursor-se-resize z-20"
              onMouseDown={(e) => handleResizeStart('se', e)}
            />
            <div 
              className="floating-chat-resize-handle corner absolute bottom-0 left-0 cursor-sw-resize z-20"
              onMouseDown={(e) => handleResizeStart('sw', e)}
            />
            <div 
              className="floating-chat-resize-handle edge absolute top-1/2 right-0 cursor-e-resize z-20"
              onMouseDown={(e) => handleResizeStart('e', e)}
            />
            <div 
              className="floating-chat-resize-handle edge absolute top-1/2 left-0 cursor-w-resize z-20"
              onMouseDown={(e) => handleResizeStart('w', e)}
            />
            <div 
              className="floating-chat-resize-handle edge absolute bottom-0 left-1/2 cursor-s-resize z-20"
              onMouseDown={(e) => handleResizeStart('s', e)}
            />
            <div 
              className="floating-chat-resize-handle edge absolute top-0 left-1/2 cursor-n-resize z-20"
              onMouseDown={(e) => handleResizeStart('n', e)}
            />
          </>
        )}

        <CardHeader className="pb-3 bg-gradient-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 opacity-50" />
              <Bot className="h-5 w-5" />
              <CardTitle className="text-lg" title="Double-click to reset position">VoiceLoop Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                Voice Ready
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary/20"
                title="API Settings"
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary/20"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* API Settings Panel */}
            {showSettings && (
              <div className="p-4 border-b bg-muted/50">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">OpenAI API Key</label>
                    <Input
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-..."
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">ElevenLabs API Key</label>
                    <Input
                      type="password"
                      value={elevenLabsKey}
                      onChange={(e) => setElevenLabsKey(e.target.value)}
                      placeholder="..."
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                  <Button onClick={saveApiKeys} size="sm" className="w-full h-7 text-xs">
                    Save Keys
                  </Button>
                </div>
              </div>
            )}

            <CardContent className="p-0 flex flex-col flex-1">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.sender === 'assistant' && (
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                          message.sender === 'user'
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span>{message.content}</span>
                          {message.sender === 'assistant' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => playMessage(message.content)}
                              disabled={isPlaying}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            >
                              {isPlaying ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Volume2 className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                      {message.sender === 'user' && (
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

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

                {/* Input Area */}
                <div className="flex gap-2">
                  {/* Smart Document Upload */}
                  <ChatDocumentModal
                    onDocumentAnalyzed={handleDocumentAnalyzed}
                    onSaveForRAG={handleSaveForRAG}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-3"
                        title="Upload Document for AI Analysis"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    }
                  />
                  
                  {/* Regular File Upload */}
                  <Button
                    onClick={() => setShowFileUpload(true)}
                    variant="outline"
                    size="sm"
                    className="px-3"
                    title="Upload File"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message or ask a question..."
                    className="flex-1"
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    className="border-primary/20"
                  >
                    {isRecording ? (
                      <Loader2 className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="text-xs h-7"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear Chat
                  </Button>
                  
                  <div className="text-xs text-muted-foreground">
                    {messages.length} messages
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
      
      {/* File Upload Modal */}
      {showFileUpload && (
        <ChatFileUpload
          onFileUploaded={(file) => {
            setUploadedFiles(prev => [...prev, file]);
            // Add a system message about the uploaded file
            const newMessage: Message = {
              id: Date.now().toString(),
              content: `📎 File uploaded: ${file.filename} (${file.fileType.toUpperCase()})`,
              sender: 'assistant',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, newMessage]);
            setShowFileUpload(false);
          }}
          onClose={() => setShowFileUpload(false)}
        />
      )}
    </div>
  );
};
