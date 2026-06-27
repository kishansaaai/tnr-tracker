import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CatAvatar, PawIcon, Reveal } from "./Decorative";
import { Cat3D, CatParade } from "./Cat3D";

import catHero from "@/assets/cat-hero.png";
import catWalk from "@/assets/cat-walk.png";

function HeroDiorama() {
  const pins = [
    { x: 20, y: 35, color: "var(--mint)" },
    { x: 55, y: 25, color: "var(--coral)" },
    { x: 75, y: 50, color: "var(--coral)" },
    { x: 35, y: 60, color: "var(--mint)" },
  ];
  return (
    <div className="relative mx-auto w-full max-w-2xl" style={{ perspective: "1400px" }}>
      <motion.div
        className="relative aspect-[4/3] glass-strong rounded-[2rem] overflow-hidden"
        initial={{ opacity: 0, y: 30, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 12 }}
        transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
        style={{
          transformStyle: "preserve-3d",
          boxShadow: "0 40px 80px -30px rgba(45, 106, 79, 0.25), var(--shadow-glow-amber)",
        }}
      >
        {/* Sky / glow */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(244, 162, 97, 0.25), transparent 60%)",
        }} />
        {/* Ground grid */}
        <div className="absolute inset-x-0 bottom-0 h-2/3" style={{
          backgroundImage:
            "linear-gradient(rgba(45, 106, 79, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 106, 79, 0.12) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          transform: "perspective(600px) rotateX(55deg)",
          transformOrigin: "bottom",
        }} />
        {/* Houses */}
        {[
          { x: "12%", y: "55%", c: "var(--coral)" },
          { x: "32%", y: "48%", c: "var(--amber)" },
          { x: "58%", y: "52%", c: "var(--mint)" },
          { x: "78%", y: "60%", c: "var(--coral)" },
        ].map((h, i) => (
          <motion.div key={i} className="absolute"
            style={{ left: h.x, top: h.y }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}>
            <svg width="64" height="64" viewBox="0 0 64 64">
              <polygon points="32,8 8,28 56,28" fill={h.c} opacity="0.9" />
              <rect x="12" y="28" width="40" height="28" fill={h.c} opacity="0.55" rx="4" />
              <rect x="26" y="38" width="12" height="18" fill="#ffffff" rx="2" />
            </svg>
          </motion.div>
        ))}
        {/* Pins floating above */}
        {pins.map((p, i) => (
          <motion.div key={i} className="absolute"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}>
            <div className="relative">
              <div className="absolute -inset-3 rounded-full animate-ring-pulse"
                style={{ background: p.color, opacity: 0.4 }} />
              <svg width="28" height="36" viewBox="0 0 22 28" fill="none" className="relative drop-shadow-lg">
                <path d="M11 0 C 17 0 22 5 22 11 C 22 18 11 28 11 28 C 11 28 0 18 0 11 C 0 5 5 0 11 0 Z" fill={p.color} />
                <circle cx="11" cy="11" r="4" fill="#ffffff" />
              </svg>
              {/* shadow on ground */}
              <div className="absolute left-1/2 -translate-x-1/2 mt-1 h-1.5 w-6 rounded-full bg-black/40 blur-sm" />
            </div>
          </motion.div>
        ))}
        {/* Hero claymation cat */}
        <motion.img
          src={catHero}
          alt="Friendly 3D orange tabby cat"
          className="absolute bottom-3 right-4 md:right-6 w-20 md:w-28 select-none pointer-events-none drop-shadow-xl"
          style={{ transform: "translateZ(80px)" }}
          animate={{ y: [0, -10, 0], rotate: [-1, 2, -1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Walking tuxedo low-poly cat */}
        <motion.img
          src={catWalk}
          alt="Low-poly tuxedo cat walking"
          className="absolute bottom-3 left-4 w-24 md:w-32 select-none pointer-events-none drop-shadow-xl"
          style={{ transform: "translateZ(50px)" }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* SVG calico mid for depth */}
        <div className="absolute hidden md:block" style={{ left: "42%", bottom: "10%", transform: "translateZ(30px)" }}>
          <Cat3D variant="calico" size={56} />
        </div>

      </motion.div>
    </div>
  );
}



export function Hero() {
  return (
    <section id="mission" className="relative pt-28 md:pt-36 pb-20 px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium mb-6">
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--mint)" }} />
              Built with love for TNR heroes
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
              Every <span className="text-gradient-warm">Cat</span> Counts
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-muted-foreground">
              Track colonies, plan trap routes, manage recoveries, and find forever homes — all in one warm,
              field-ready home base for TNR volunteers and animal welfare orgs.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/auth"
                className="group inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white lift-on-hover bg-gradient-warm shadow-warm-glow">
                <PawIcon size={18} /> Get Started
              </Link>
              <Link to="/walkthrough"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold glass-strong lift-on-hover">
                See the working
              </Link>
              <Link to="/auth"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold glass-strong lift-on-hover">
                View Dashboard
              </Link>
            </div>
          </div>
        </Reveal>
        <div className="mt-14">
          <HeroDiorama />
        </div>
        <div className="mt-10">
          <CatParade />
        </div>

      </div>
    </section>
  );
}
