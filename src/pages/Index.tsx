import { useState } from "react"
import { Header } from "@/components/Header"
import { Hero } from "@/components/Hero"
import { DashboardPreview } from "@/components/DashboardPreview"
import { VoiceDemo } from "@/components/VoiceDemo"
import { Footer } from "@/components/Footer"
import { SplashPage } from "@/components/SplashPage"
import { EditableEmployeeManager } from "@/components/EditableEmployeeManager"
import { EditableMetricsManager } from "@/components/EditableMetricsManager"

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
          
          {/* Sandbox Mode - Editable HR Management */}
          <section className="py-20 bg-background">
            {/* Accent Top Bar - Light mode only */}
            <div className="w-full h-1 bg-gradient-to-r from-primary/20 via-accent/30 to-primary/20 mb-16"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  HR Management{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Sandbox Mode
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Edit employee data, update metrics, and see real-time changes reflected in the dashboard. 
                  This is your development playground for testing HR workflows.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <EditableEmployeeManager />
                <EditableMetricsManager />
              </div>
            </div>
          </section>
          
          <DashboardPreview />
          <VoiceDemo />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
