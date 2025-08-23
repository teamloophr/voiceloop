import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { 
  Mic, 
  MicOff, 
  Square, 
  Volume2,
  Copy,
  Trash2
} from "lucide-react"
import { pipeline } from "@huggingface/transformers"

interface VoiceTranscriptionProps {
  onTranscription?: (text: string) => void
  compact?: boolean
}

export function VoiceTranscription({ onTranscription, compact = false }: VoiceTranscriptionProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcription, setTranscription] = useState("")
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [isModelLoading, setIsModelLoading] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const transcriberRef = useRef<any>(null)

  // Initialize Whisper model
  const initializeModel = useCallback(async () => {
    if (transcriberRef.current) return transcriberRef.current
    
    try {
      setIsModelLoading(true)
      toast({
        title: "Loading AI Model",
        description: "Loading Whisper model for speech recognition...",
      })
      
      transcriberRef.current = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-tiny.en",
        { device: "webgpu" }
      )
      
      toast({
        title: "Model Ready",
        description: "Voice transcription is now available!",
        variant: "default",
      })
      
      return transcriberRef.current
    } catch (error) {
      console.error("Failed to load model:", error)
      toast({
        title: "Model Loading Failed",
        description: "Falling back to CPU processing. This may be slower.",
        variant: "destructive",
      })
      
      // Fallback to CPU
      transcriberRef.current = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-tiny.en"
      )
      
      return transcriberRef.current
    } finally {
      setIsModelLoading(false)
    }
  }, [])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      })
      
      audioChunksRef.current = []
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        
        // Start transcription
        await transcribeAudio(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone",
      })
    } catch (error) {
      console.error("Failed to start recording:", error)
      toast({
        title: "Recording Failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }, [])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  // Transcribe audio using Whisper
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true)
      
      const transcriber = await initializeModel()
      
      // Convert blob to array buffer for processing
      const arrayBuffer = await audioBlob.arrayBuffer()
      const result = await transcriber(arrayBuffer)
      
      const text = result.text.trim()
      setTranscription(text)
      onTranscription?.(text)
      
      toast({
        title: "Transcription Complete",
        description: `Transcribed: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
      })
    } catch (error) {
      console.error("Transcription failed:", error)
      toast({
        title: "Transcription Failed",
        description: "Could not transcribe audio. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTranscribing(false)
    }
  }, [initializeModel, onTranscription])

  // Copy transcription to clipboard
  const copyToClipboard = useCallback(async () => {
    if (transcription) {
      await navigator.clipboard.writeText(transcription)
      toast({
        title: "Copied",
        description: "Transcription copied to clipboard",
      })
    }
  }, [transcription])

  // Clear transcription and audio
  const clearAll = useCallback(() => {
    setTranscription("")
    setAudioURL(null)
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }
  }, [audioURL])

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing || isModelLoading}
          className="relative"
        >
          {isRecording ? (
            <Square className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          {isRecording && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse" />
          )}
        </Button>
        
        {isModelLoading && (
          <Badge variant="secondary" className="text-xs">
            Loading AI...
          </Badge>
        )}
        
        {isTranscribing && (
          <Badge variant="default" className="text-xs">
            Transcribing...
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Transcription
            </h3>
            {(isModelLoading || isTranscribing) && (
              <Badge variant={isModelLoading ? "secondary" : "default"}>
                {isModelLoading ? "Loading AI Model..." : "Transcribing..."}
              </Badge>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing || isModelLoading}
              className="relative bg-gradient-primary hover:opacity-90"
            >
              {isRecording ? (
                <>
                  <Square className="mr-2 h-5 w-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Start Recording
                </>
              )}
              {isRecording && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full animate-pulse" />
              )}
            </Button>
          </div>

          {/* Audio Playback */}
          {audioURL && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Recorded Audio:</span>
              </div>
              <audio controls src={audioURL} className="w-full" />
            </div>
          )}

          {/* Transcription Result */}
          {transcription && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Transcription:</span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm leading-relaxed">{transcription}</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!transcription && !isRecording && (
            <div className="text-center py-8">
              <div className="text-muted-foreground space-y-2">
                <p className="text-sm">
                  Click "Start Recording" and speak clearly into your microphone
                </p>
                <p className="text-xs">
                  Powered by OpenAI Whisper • Processes locally in your browser
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}