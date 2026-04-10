export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* Orbs */}
      <div
        className="orb w-[600px] h-[600px] animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)',
          top: '-10%', left: '-15%',
        }}
      />
      <div
        className="orb w-[500px] h-[500px] animate-float-slow"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
          bottom: '-10%', right: '-10%',
          animationDelay: '3s',
        }}
      />
      <div
        className="orb w-[400px] h-[400px] animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          top: '40%', left: '45%',
          animationDelay: '1.5s',
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(2,2,10,0.7) 100%)',
        }}
      />
    </div>
  )
}
