export function VoiceDemo() {
  return (
    <section className="py-20 bg-background">
      {/* Accent Top Bar - Light mode only */}
      <div className="w-full h-1 bg-gradient-to-r from-primary/20 via-accent/30 to-primary/20 mb-16"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Platform{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Ready
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your HR management platform is fully configured and ready to use.
          </p>
        </div>
      </div>
    </section>
  )
}