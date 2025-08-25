import { useEffect, useState } from "react"


interface SplashPageProps {
  onComplete: () => void
}

export function SplashPage({ onComplete }: SplashPageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Show the splash page
    setIsVisible(true)
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoaded(true)
      
      // Hide splash page after animation
      setTimeout(() => {
        setIsVisible(false)
        onComplete()
      }, 1000)
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center transition-all duration-1000 ease-in-out">
      <div className={`text-center transition-all duration-1000 ${
        isLoaded ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Large Logo */}
        <img 
          src="/voiceloop-logo-black.png" 
          alt="VoiceLoop" 
          className="h-80 w-auto mx-auto mb-8 drop-shadow-2xl"
        />
        
        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          <div className={`w-3 h-3 bg-primary rounded-full animate-bounce ${
            isLoaded ? 'animate-pulse' : ''
          }`} style={{ animationDelay: '0ms' }}></div>
          <div className={`w-3 h-3 bg-primary rounded-full animate-bounce ${
            isLoaded ? 'animate-pulse' : ''
          }`} style={{ animationDelay: '150ms' }}></div>
          <div className={`w-3 h-3 bg-primary rounded-full animate-bounce ${
            isLoaded ? 'animate-pulse' : ''
          }`} style={{ animationDelay: '300ms' }}></div>
        </div>
        
        {/* Loading Text */}
        <p className="text-muted-foreground mt-4 text-lg font-medium">
          {isLoaded ? 'Welcome to Teamloop' : 'Loading...'}
        </p>
      </div>
    </div>
  )
}
