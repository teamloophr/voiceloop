import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MessageSquare, Users } from "lucide-react"

export function VoiceDemo() {
  return (
    <section className="py-20 bg-background">
      {/* Accent Top Bar - Light mode only */}
      <div className="w-full h-1 bg-gradient-to-r from-primary/20 via-accent/30 to-primary/20 mb-16"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Mic className="h-3 w-3 mr-1" />
            VoiceLoop Demo
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Experience{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              VoiceLoop
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            VoiceLoop is now integrated throughout the platform. Use the floating chat assistant 
            for instant help with HR tasks and employee queries.
          </p>
        </div>

        {/* Simple Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="p-3 bg-gradient-primary rounded-lg w-fit mx-auto mb-4">
                <Mic className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Voice Commands</h3>
              <p className="text-sm text-muted-foreground">
                Navigate and control the system with natural voice commands
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="p-3 bg-gradient-primary rounded-lg w-fit mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Get intelligent responses and assistance for HR queries
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="p-3 bg-gradient-primary rounded-lg w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Data</h3>
              <p className="text-sm text-muted-foreground">
                Access live employee data and analytics instantly
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            VoiceLoop is integrated throughout the platform for seamless AI assistance.
          </p>
        </div>
      </div>
    </section>
  )
}