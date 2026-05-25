"use client";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f172a] to-[#0a0a0f]" />

      {/* Animated orbs */}
      <div
        className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 -right-20 h-[400px] w-[400px] rounded-full animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          animationDelay: "1.5s",
        }}
      />
      <div
        className="absolute -bottom-20 left-1/3 h-[350px] w-[350px] rounded-full animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          animationDelay: "3s",
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
