import { useState } from "react"
import { Hero } from "@/components/Hero"
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
        <main>
          <Hero />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
