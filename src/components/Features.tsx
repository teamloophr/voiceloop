import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  UserCheck, 
  Clock, 
  BarChart3, 
  Brain, 
  Shield, 
  Smartphone,
  Zap,
  Globe
} from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Complete employee lifecycle management with AI-powered insights, voice AI assistance, and intelligent workflows.",
      badge: "Core Feature"
    },
    {
      icon: UserCheck,
      title: "AI Assistant",
      description: "Intelligent AI chat and voice transcription powered by OpenAI Whisper and ElevenLabs for seamless communication.",
      badge: "AI-Enhanced"
    },
    {
      icon: Clock,
      title: "Time & Payroll",
      description: "Integrated timesheet management, benefits tracking, and seamless payroll software integration.",
      badge: "Integrated"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Predictive HR analytics with customizable dashboards, turnover prediction, and performance insights.",
      badge: "Analytics"
    },
    {
      icon: Brain,
      title: "Voice AI & Transcription",
      description: "Advanced voice recognition with OpenAI Whisper and natural-sounding TTS with ElevenLabs integration.",
      badge: "AI-Powered"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC 2 compliant platform with advanced encryption, multi-factor authentication, and global compliance management.",
      badge: "Security"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Fully responsive web platform with dedicated mobile apps for iOS and Android with offline capabilities.",
      badge: "Mobile"
    },
    {
      icon: Zap,
      title: "Real-time AI Chat",
      description: "Instant AI assistance for employee queries, onboarding guidance, and performance insights with natural conversations.",
      badge: "Enhanced UX"
    },
    {
      icon: Globe,
      title: "Global Ready",
      description: "Multi-language support, global compliance management, and localized HR processes for international teams.",
      badge: "Global"
    }
  ]

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case "AI-Enhanced":
      case "AI-Powered":
        return "default"
      case "Security":
        return "destructive"
      case "Enhanced UX":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Comprehensive Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Modern Teams
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From recruitment to retirement, our platform covers every aspect of human resource management 
            with cutting-edge technology and intuitive design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="relative group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-gradient-primary rounded-lg w-fit">
                    <feature.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <Badge variant={getBadgeVariant(feature.badge)} className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
              
              {/* Subtle hover effect */}
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-lg transition-opacity" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}