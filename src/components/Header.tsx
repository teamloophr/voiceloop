import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Link } from "react-router-dom"
import { useTheme } from "next-themes"

export function Header() {
  const { theme } = useTheme()





  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={theme === 'dark' ? "/voiceloop-logo-black.png" : "/teamloop-logo.png"} 
              alt="VoiceLoop Logo" 
              className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>



          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>


      </div>
    </header>
  )
}