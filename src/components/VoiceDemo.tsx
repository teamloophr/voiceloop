import { useState } from "react"
import { VoiceTranscription } from "./VoiceTranscription"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { 
  Save, 
  MessageSquare, 
  FileText, 
  Users,
  Mic
} from "lucide-react"

export function VoiceDemo() {
  const [transcribedText, setTranscribedText] = useState("")
  const [useCase, setUseCase] = useState<string | null>(null)

  const useCases = [
    {
      id: "performance-review",
      title: "Performance Review Notes",
      description: "Dictate performance review comments and feedback",
      icon: FileText,
      placeholder: "Speak your performance review notes here..."
    },
    {
      id: "employee-feedback",
      title: "Employee Feedback",
      description: "Voice-to-text for employee feedback and suggestions",
      icon: MessageSquare,
      placeholder: "Share employee feedback using voice..."
    },
    {
      id: "meeting-notes",
      title: "Meeting Notes",
      description: "Capture meeting notes and action items quickly",
      icon: Users,
      placeholder: "Record meeting notes and action items..."
    }
  ]

  const handleTranscription = (text: string) => {
    setTranscribedText(prev => prev ? `${prev} ${text}` : text)
  }

  const clearText = () => {
    setTranscribedText("")
    setUseCase(null)
  }

  const saveNote = () => {
    // In a real app, this would save to the database
    console.log("Saving note:", { useCase, text: transcribedText })
    alert("Note saved successfully!")
  }

  return (
    <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Mic className="h-3 w-3 mr-1" />
            AI-Powered Voice Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Voice-to-Text{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              HR Assistant
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your HR workflows with AI-powered voice transcription. 
            Dictate notes, feedback, and reviews with advanced Whisper technology.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Use Cases */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold mb-4">Common Use Cases</h3>
            {useCases.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all hover:shadow-medium ${
                  useCase === item.id ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => setUseCase(item.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Voice Transcription */}
          <div className="lg:col-span-2 space-y-6">
            <VoiceTranscription 
              onTranscription={handleTranscription}
            />

            {/* Text Editor */}
            {transcribedText && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {useCase ? useCases.find(u => u.id === useCase)?.title : "Transcribed Text"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={transcribedText}
                    onChange={(e) => setTranscribedText(e.target.value)}
                    placeholder={
                      useCase 
                        ? useCases.find(u => u.id === useCase)?.placeholder 
                        : "Your transcribed text will appear here..."
                    }
                    className="min-h-[120px] resize-none"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {transcribedText.length} characters
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={clearText}>
                        Clear
                      </Button>
                      <Button onClick={saveNote} className="bg-gradient-primary hover:opacity-90">
                        <Save className="h-4 w-4 mr-2" />
                        Save Note
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="p-3 bg-gradient-primary rounded-lg w-fit mx-auto mb-4">
                <Mic className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">OpenAI Whisper</h3>
              <p className="text-sm text-muted-foreground">
                State-of-the-art speech recognition with 99%+ accuracy
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="p-3 bg-gradient-primary rounded-lg w-fit mx-auto mb-4">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Processing</h3>
              <p className="text-sm text-muted-foreground">
                Instant transcription processing directly in your browser
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="p-3 bg-gradient-primary rounded-lg w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Privacy First</h3>
              <p className="text-sm text-muted-foreground">
                All processing happens locally - your data never leaves your device
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}