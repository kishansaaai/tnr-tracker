import { motion } from "framer-motion";

export type AvatarVariant = "orange" | "tuxedo" | "calico" | "gray";

export function CatAvatar({ variant = "orange", size = 64 }: { variant?: AvatarVariant; size?: number }) {
  const palettes: Record<AvatarVariant, { base: string; patch: string; ear: string; nose: string }> = {
    orange: { base: "#f4a261", patch: "#e76f51", ear: "#f7c59f", nose: "#ec6e5b" },
    tuxedo: { base: "#1f2330", patch: "#f5f5f5", ear: "#ffb3c1", nose: "#ec6e5b" },
    calico: { base: "#f4d35e", patch: "#e76f51", ear: "#fbe9c0", nose: "#d8a48f" },
    gray:   { base: "#9aa3b2", patch: "#5f6b80", ear: "#cdd3df", nose: "#ec6e5b" },
  };
  const p = palettes[variant];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="10,18 18,2 26,18" fill={p.base} />
      <polygon points="54,18 46,2 38,18" fill={p.base} />
      <polygon points="13,16 18,6 23,16" fill={p.ear} />
      <polygon points="51,16 46,6 41,16" fill={p.ear} />
      <ellipse cx="32" cy="38" rx="22" ry="20" fill={p.base} />
      <path d="M32 18 Q 50 18 54 36 Q 50 26 32 26 Z" fill={p.patch} opacity="0.85" />
      <circle cx="24" cy="36" r="2.5" fill="#1a1a2e" />
      <circle cx="40" cy="36" r="2.5" fill="#1a1a2e" />
      <circle cx="24.8" cy="35.2" r="0.8" fill="white" />
      <circle cx="40.8" cy="35.2" r="0.8" fill="white" />
      <path d="M30 44 Q 32 46 34 44" stroke={p.nose} strokeWidth="1.5" fill={p.nose} strokeLinecap="round" />
      <path d="M28 46 Q 26 50 22 50" stroke="#1a1a2e" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
      <path d="M36 46 Q 38 50 42 50" stroke="#1a1a2e" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

export function PawIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="16" rx="5" ry="4.5" />
      <ellipse cx="5" cy="10" rx="2.2" ry="2.8" />
      <ellipse cx="9" cy="6" rx="2" ry="2.6" />
      <ellipse cx="15" cy="6" rx="2" ry="2.6" />
      <ellipse cx="19" cy="10" rx="2.2" ry="2.8" />
    </svg>
  );
}

export function FloatingPaws() {
  // 6 paws drifting across at different rows / delays
  const paws = [
    { top: "10%", delay: 0, scale: 0.8, color: "var(--amber)" },
    { top: "25%", delay: 6, scale: 1.1, color: "var(--coral)" },
    { top: "45%", delay: 12, scale: 0.7, color: "var(--mint)" },
    { top: "60%", delay: 3, scale: 1, color: "var(--coral)" },
    { top: "78%", delay: 9, scale: 0.9, color: "var(--amber)" },
    { top: "90%", delay: 15, scale: 0.6, color: "var(--coral)" },
  ];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {paws.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: p.top,
            color: p.color,
            opacity: 0.18,
            transform: `scale(${p.scale})`,
            animation: `paw-walk 22s linear ${p.delay}s infinite`,
          }}
        >
          <PawIcon size={36} />
        </div>
      ))}
    </div>
  );
}

export function Reveal({ children, delay = 0, x = 0, y = 30 }: { children: React.ReactNode; delay?: number; x?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
