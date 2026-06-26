import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CatAvatar, type AvatarVariant } from "./Decorative";

/**
 * Cat3D — layered SVG slices with translateZ for real CSS 3D depth.
 * Body, head, and ears live on different Z planes so parallax happens
 * when the parent rotates (or on hover).
 */
export function Cat3D({
  variant = "orange",
  size = 120,
  className = "",
  idle = true,
}: {
  variant?: AvatarVariant;
  size?: number;
  className?: string;
  idle?: boolean;
}) {
  const palettes: Record<AvatarVariant, { base: string; patch: string; ear: string; belly: string }> = {
    orange: { base: "#f4a261", patch: "#e76f51", ear: "#f7c59f", belly: "#fde2c8" },
    tuxedo: { base: "#1f2330", patch: "#f5f5f5", ear: "#ffb3c1", belly: "#ffffff" },
    calico: { base: "#f4d35e", patch: "#e76f51", ear: "#fbe9c0", belly: "#fff4d6" },
    gray:   { base: "#9aa3b2", patch: "#5f6b80", ear: "#cdd3df", belly: "#dfe4ec" },
  };
  const p = palettes[variant];

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: size,
        height: size,
        transformStyle: "preserve-3d",
        animation: idle ? "cat-idle 6s ease-in-out infinite" : undefined,
      }}
    >
      {/* Ground shadow */}
      <div
        className="absolute rounded-full blur-md bg-black/35"
        style={{
          width: size * 0.7,
          height: size * 0.12,
          left: "50%",
          bottom: -size * 0.05,
          transform: "translateX(-50%) translateZ(-40px) rotateX(85deg)",
        }}
      />
      {/* Tail — behind */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0"
        style={{ transform: "translateZ(-12px)" }}
      >
        <path
          d="M70 70 Q 95 55 88 30"
          stroke={p.base}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {/* Body */}
      <svg viewBox="0 0 100 100" className="absolute inset-0" style={{ transform: "translateZ(0px)" }}>
        <ellipse cx="50" cy="68" rx="32" ry="26" fill={p.base} />
        <ellipse cx="50" cy="76" rx="18" ry="14" fill={p.belly} opacity="0.7" />
      </svg>
      {/* Head */}
      <svg viewBox="0 0 100 100" className="absolute inset-0" style={{ transform: "translateZ(22px)" }}>
        {/* Ears back */}
        <polygon points="28,30 36,12 44,30" fill={p.base} />
        <polygon points="72,30 64,12 56,30" fill={p.base} />
        <polygon points="31,28 36,16 41,28" fill={p.ear} />
        <polygon points="69,28 64,16 59,28" fill={p.ear} />
        {/* Head */}
        <ellipse cx="50" cy="40" rx="26" ry="23" fill={p.base} />
        {/* Patch */}
        <path d="M50 20 Q 72 22 76 40 Q 70 28 50 28 Z" fill={p.patch} opacity="0.85" />
      </svg>
      {/* Face — eyes, nose, whiskers on top plane */}
      <svg viewBox="0 0 100 100" className="absolute inset-0" style={{ transform: "translateZ(34px)" }}>
        {/* Eyes */}
        <ellipse cx="40" cy="40" rx="4" ry="5" fill="#1f2937" />
        <ellipse cx="60" cy="40" rx="4" ry="5" fill="#1f2937" />
        <circle cx="41.5" cy="38.5" r="1.4" fill="white" />
        <circle cx="61.5" cy="38.5" r="1.4" fill="white" />
        {/* Nose */}
        <path d="M47 48 Q 50 51 53 48 L 50 52 Z" fill="#e76f51" />
        {/* Mouth */}
        <path d="M50 52 Q 47 56 44 54" stroke="#1f2937" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M50 52 Q 53 56 56 54" stroke="#1f2937" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Whiskers */}
        <line x1="34" y1="50" x2="22" y2="48" stroke="#1f2937" strokeWidth="0.6" opacity="0.6" />
        <line x1="34" y1="52" x2="22" y2="54" stroke="#1f2937" strokeWidth="0.6" opacity="0.6" />
        <line x1="66" y1="50" x2="78" y2="48" stroke="#1f2937" strokeWidth="0.6" opacity="0.6" />
        <line x1="66" y1="52" x2="78" y2="54" stroke="#1f2937" strokeWidth="0.6" opacity="0.6" />
        {/* TNR ear-tip mark */}
        <polygon points="64,16 67,12 70,16" fill="#52b788" />
      </svg>
      {/* Front paws — slightly forward */}
      <svg viewBox="0 0 100 100" className="absolute inset-0" style={{ transform: "translateZ(14px)" }}>
        <ellipse cx="38" cy="90" rx="6" ry="4" fill={p.base} />
        <ellipse cx="62" cy="90" rx="6" ry="4" fill={p.base} />
        <ellipse cx="38" cy="90" rx="3" ry="2" fill={p.belly} opacity="0.7" />
        <ellipse cx="62" cy="90" rx="3" ry="2" fill={p.belly} opacity="0.7" />
      </svg>
    </div>
  );
}

/**
 * TiltCard — wraps children in a perspective container that follows the
 * cursor for a real 3D tilt + glare effect. Falls back to a gentle idle
 * float when the cursor isn't over it.
 */
export function TiltCard({
  children,
  className = "",
  max = 14,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 18 });
  const sy = useSpring(y, { stiffness: 180, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max]);
  const [isTouch, setIsTouch] = useState(false);

  // Device orientation parallax for touch devices.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const touch =
      "ontouchstart" in window ||
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);
    setIsTouch(touch);
    if (!touch) return;

    let active = true;

    const handle = (e: DeviceOrientationEvent) => {
      if (!active || !ref.current) return;
      // Only react when the card is roughly on-screen — saves work
      // and avoids tilting cards far above/below the viewport.
      const rect = ref.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      // gamma: left/right tilt (-90..90), beta: front/back (-180..180)
      const gamma = e.gamma ?? 0;
      const beta = e.beta ?? 0;
      // Normalize to roughly [-0.5, 0.5] and clamp.
      const nx = Math.max(-0.5, Math.min(0.5, gamma / 45));
      const ny = Math.max(-0.5, Math.min(0.5, (beta - 45) / 45));
      x.set(nx);
      y.set(ny);
    };

    // iOS 13+ requires explicit permission.
    const DOE = (window as unknown as {
      DeviceOrientationEvent?: { requestPermission?: () => Promise<string> };
    }).DeviceOrientationEvent;

    const attach = () => window.addEventListener("deviceorientation", handle);

    if (DOE && typeof DOE.requestPermission === "function") {
      const onFirstTouch = () => {
        DOE.requestPermission!()
          .then((state) => {
            if (state === "granted") attach();
          })
          .catch(() => {});
        window.removeEventListener("touchend", onFirstTouch);
      };
      window.addEventListener("touchend", onFirstTouch, { once: true });
    } else {
      attach();
    }

    return () => {
      active = false;
      window.removeEventListener("deviceorientation", handle);
    };
  }, [x, y]);

  return (
    <div className={className} style={{ perspective: 1200 }}>
      <motion.div
        ref={ref}
        onMouseMove={
          isTouch
            ? undefined
            : (e) => {
                const r = ref.current!.getBoundingClientRect();
                x.set((e.clientX - r.left) / r.width - 0.5);
                y.set((e.clientY - r.top) / r.height - 0.5);
              }
        }
        onMouseLeave={
          isTouch
            ? undefined
            : () => {
                x.set(0);
                y.set(0);
              }
        }
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}


/**
 * CatParade — a row of cats trotting across the screen in 3D.
 */
export function CatParade() {
  const cats: AvatarVariant[] = ["orange", "tuxedo", "calico", "gray", "orange"];
  return (
    <div className="pointer-events-none relative h-24 overflow-hidden" style={{ perspective: 800 }}>
      <motion.div
        className="absolute bottom-0 flex items-end gap-10"
        initial={{ x: "-30%" }}
        animate={{ x: "60%" }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {cats.concat(cats).map((v, i) => (
          <div
            key={i}
            style={{
              transform: `translateZ(${(i % 3) * -30}px) rotateY(${i % 2 ? -8 : 8}deg)`,
              animation: `cat-bob 1.${(i % 5) + 2}s ease-in-out infinite`,
            }}
          >
            <CatAvatar variant={v} size={56 - (i % 3) * 8} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
