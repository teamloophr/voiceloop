import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Linkedin, 
  Github
} from "lucide-react"


export function Footer() {
  const socialLinks = [
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/teamloop" },
    { name: "GitHub", icon: Github, href: "https://github.com/teamloop" },
  ]

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 Teamloop. All rights reserved.
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <Button
                key={social.name}
                variant="ghost"
                size="sm"
                className="h-9 w-9"
                asChild
              >
                <a href={social.href} aria-label={social.name}>
                  <social.icon className="h-4 w-4" />
                </a>
              </Button>
            ))}
          </div>
        </div>

        {/* Accent Footer Bar - Light mode only */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="text-sm text-muted-foreground">Powered by VoiceLoop AI</span>
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}