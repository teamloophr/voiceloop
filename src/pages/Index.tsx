import { useState } from "react"
import { Header } from "@/components/Header"
import { Hero } from "@/components/Hero"
import { Features } from "@/components/Features"
import { DashboardPreview } from "@/components/DashboardPreview"
import { VoiceDemo } from "@/components/VoiceDemo"
import { Footer } from "@/components/Footer"
import { SplashPage } from "@/components/SplashPage"

const Index = () => {
  const [showSplash, setShowSplash] = useState(true)

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  return (
    <>
      {showSplash && <SplashPage onComplete={handleSplashComplete} />}
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <Features />
          <DashboardPreview />
          <VoiceDemo />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
