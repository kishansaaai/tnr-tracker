import { motion } from "framer-motion";
import { CatAvatar, PawIcon } from "./Decorative";
import catGroup from "../../assets/cat-group.png";
import catRunning from "../../assets/cat-running.png";
import catEartip from "../../assets/cat-eartip.png";

// ----- 1. Map with priority heatmap -----
export function MapVisual() {
  const pins = [
    { x: 25, y: 30, color: "var(--mint)", label: "managed" },
    { x: 60, y: 22, color: "var(--coral)", label: "unmanaged" },
    { x: 45, y: 55, color: "var(--coral)", label: "trap" },
    { x: 78, y: 60, color: "var(--mint)", label: "managed" },
    { x: 32, y: 72, color: "var(--coral)", label: "unmanaged" },
  ];
  return (
    <div
      className="glass-strong relative h-72 w-full overflow-hidden rounded-3xl p-4"
      style={{ transform: "perspective(1200px) rotateX(8deg) rotateY(-10deg)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(45, 106, 79, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 106, 79, 0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Heatmap blob */}
      <div className="absolute h-40 w-40 rounded-full blur-3xl"
        style={{ left: "50%", top: "15%", background: "var(--coral)", opacity: 0.45 }}
      />
      {pins.map((p, i) => (
        <div key={i} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -100%)" }}>
          <div className="absolute -inset-2 rounded-full animate-ring-pulse" style={{ background: p.color, opacity: 0.4 }} />
          <div className="relative animate-pulse-pin">
            <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
              <path d="M11 0 C 17 0 22 5 22 11 C 22 18 11 28 11 28 C 11 28 0 18 0 11 C 0 5 5 0 11 0 Z" fill={p.color} />
              <circle cx="11" cy="11" r="4" fill="#1a1a2e" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}

// ----- 2. Route planner -----
export function RouteVisual() {
  return (
    <div
      className="glass-strong relative h-72 w-full overflow-hidden rounded-3xl p-4"
      style={{ transform: "perspective(1200px) rotateX(6deg) rotateY(8deg)", boxShadow: "var(--shadow-card)" }}
    >
      <svg viewBox="0 0 400 250" className="h-full w-full">
        <defs>
          <linearGradient id="rt" x1="0" x2="1">
            <stop offset="0" stopColor="#f4a261" />
            <stop offset="1" stopColor="#e76f51" />
          </linearGradient>
        </defs>
        <polyline points="40,200 120,140 200,170 280,80 360,120"
          fill="none" stroke="url(#rt)" strokeWidth="3" className="animate-dash-flow" />
        {[[40,200],[120,140],[200,170],[280,80],[360,120]].map(([x,y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="10" fill="#ffffff" stroke="url(#rt)" strokeWidth="2" />
            <circle cx={x} cy={y} r="4" fill="#f4a261" />
          </g>
        ))}
        <motion.circle r="6" fill="white"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: ["0%", "100%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ offsetPath: "path('M40 200 L 120 140 L 200 170 L 280 80 L 360 120')" } as React.CSSProperties}
        />
      </svg>
      <div className="absolute bottom-3 right-4 glass rounded-full px-3 py-1 text-xs font-medium">
        4.8 km · 5 stops
      </div>
    </div>
  );
}

// ----- 3. Network graph -----
export function NetworkVisual() {
  const nodes = [
    { x: 50, y: 50, r: 18, color: "var(--amber)" },
    { x: 20, y: 25, r: 10, color: "var(--mint)" },
    { x: 80, y: 30, r: 12, color: "var(--coral)" },
    { x: 15, y: 75, r: 9, color: "var(--coral)" },
    { x: 85, y: 78, r: 10, color: "var(--mint)" },
    { x: 50, y: 88, r: 8, color: "var(--coral)" },
  ];
  return (
    <div className="glass-strong relative h-72 w-full overflow-hidden rounded-3xl p-4"
      style={{ transform: "perspective(1200px) rotateY(-6deg)", boxShadow: "var(--shadow-card)" }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        {nodes.slice(1).map((n, i) => (
          <line key={i} x1={nodes[0].x} y1={nodes[0].y} x2={n.x} y2={n.y}
            stroke="rgba(45, 106, 79, 0.25)" strokeWidth="0.4" />
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={n.r * 1.4} fill={n.color} opacity="0.2">
              <animate attributeName="r" values={`${n.r};${n.r*1.8};${n.r}`} dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx={n.x} cy={n.y} r={n.r * 0.6} fill={n.color} />
          </g>
        ))}
      </svg>
      <motion.img
        src={catGroup}
        alt="3D rendered group of three friendly cats"
        loading="lazy"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 md:w-56 drop-shadow-2xl pointer-events-none"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}


// ----- 4. Recovery overlay -----
export function RecoveryVisual() {
  return (
    <div className="glass-strong relative h-72 w-full overflow-hidden rounded-3xl p-6"
      style={{ transform: "perspective(1200px) rotateX(4deg) rotateY(6deg)", boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">In Recovery</p>
          <p className="font-display text-3xl">12</p>
        </div>
        <div className="rounded-2xl glass px-3 py-2 text-xs">Day 3 / 7</div>
      </div>
      <div className="mt-4 space-y-2">
        {[
          { name: "Mochi", pct: 90, v: "orange" as const },
          { name: "Pepper", pct: 65, v: "tuxedo" as const },
          { name: "Luna", pct: 30, v: "calico" as const },
        ].map((c) => (
          <div key={c.name} className="flex items-center gap-3 glass rounded-2xl p-2">
            <CatAvatar variant={c.v} size={36} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs"><span>{c.name}</span><span className="text-muted-foreground">{c.pct}%</span></div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div className="h-full" style={{ background: "linear-gradient(90deg, var(--mint), var(--amber))" }}
                  initial={{ width: 0 }} whileInView={{ width: `${c.pct}%` }} viewport={{ once: true }} transition={{ duration: 1.2 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <motion.img
        src={catRunning}
        alt="3D orange tabby cat running with joy"
        loading="lazy"
        className="absolute -bottom-2 w-20 md:w-24 drop-shadow-xl pointer-events-none"
        initial={{ x: "-20%" }}
        animate={{ x: "110%", y: [0, -6, 0] }}
        transition={{
          x: { duration: 6, repeat: Infinity, ease: "linear", delay: 1 },
          y: { duration: 0.4, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    </div>
  );
}

// ----- 5. Kanban -----
export function KanbanVisual() {
  const cols = [
    { title: "TNR", color: "var(--coral)", cats: ["Smokey"] },
    { title: "Socializing", color: "var(--coral)", cats: ["Ginger", "Bean"] },
    { title: "Ready", color: "var(--amber)", cats: ["Pip"] },
    { title: "Adopted", color: "var(--mint)", cats: ["Sushi"] },
  ];
  return (
    <div className="glass-strong relative h-72 w-full overflow-hidden rounded-3xl p-3"
      style={{ transform: "perspective(1200px) rotateX(4deg) rotateY(-8deg)", boxShadow: "var(--shadow-card)" }}>
      <div className="grid grid-cols-4 gap-2 h-full">
        {cols.map((c) => (
          <div key={c.title} className="glass rounded-2xl p-2 flex flex-col gap-2">
            <div className="text-[10px] uppercase tracking-wide font-bold" style={{ color: c.color }}>{c.title}</div>
            {c.cats.map((name, i) => (
              <motion.div key={name} className="rounded-xl bg-white/10 p-1.5 text-xs"
                initial={{ y: -20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.2 + 0.3 }}>
                {name}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      <motion.div className="absolute right-3 bottom-3 text-2xl"
        initial={{ scale: 0 }} whileInView={{ scale: [0, 1.4, 1] }} viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 1 }}>❤️</motion.div>
    </div>
  );
}

// ----- 6. Matchmaker quiz -----
export function QuizVisual() {
  return (
    <div className="relative h-72 w-full flex items-center justify-center"
      style={{ perspective: "1200px" }}>
      <motion.div className="glass-strong rounded-3xl p-6 w-64"
        animate={{ rotateY: [0, 180, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d", boxShadow: "var(--shadow-card)" }}>
        <div className="flex justify-center mb-3"><CatAvatar variant="calico" size={70} /></div>
        <p className="text-xs text-muted-foreground text-center">Question 2 of 5</p>
        <p className="font-display text-center mt-1">How energetic is your home?</p>
        <div className="mt-3 space-y-1.5">
          {["Calm", "Lively", "Wild"].map((o) => (
            <div key={o} className="glass rounded-xl px-3 py-1.5 text-xs">{o}</div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ----- 7. Dashboard charts -----
export function DashboardVisual() {
  return (
    <div className="glass-strong relative h-72 w-full overflow-hidden rounded-3xl p-5"
      style={{ transform: "perspective(1200px) rotateX(6deg) rotateY(4deg)", boxShadow: "var(--shadow-card)" }}>
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Donut */}
        <div className="flex flex-col items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(45, 106, 79, 0.12)" strokeWidth="12" />
            <motion.circle cx="50" cy="50" r="40" fill="none" stroke="var(--amber)" strokeWidth="12" strokeLinecap="round"
              strokeDasharray="251" initial={{ strokeDashoffset: 251 }} whileInView={{ strokeDashoffset: 75 }}
              viewport={{ once: true }} transition={{ duration: 1.5 }} />
          </svg>
          <p className="text-xs text-muted-foreground mt-2">TNR Progress 70%</p>
        </div>
        {/* Bars */}
        <div className="flex items-end justify-around gap-2 pb-6">
          {[60, 80, 45, 95, 70].map((h, i) => (
            <motion.div key={i} className="w-4 rounded-t-md"
              style={{ background: "linear-gradient(180deg, var(--coral), var(--amber))" }}
              initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }} />
          ))}
        </div>
      </div>
      {/* Paw loader */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 text-[var(--amber)]">
        {[0,1,2,3].map((i) => (
          <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}>
            <PawIcon size={14} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ----- 8. Leaderboard -----
export function LeaderboardVisual() {
  const podium = [
    { rank: 2, name: "Maya", h: "70%", v: "tuxedo" as const, color: "#c0c0c0" },
    { rank: 1, name: "Alex", h: "100%", v: "orange" as const, color: "var(--amber)" },
    { rank: 3, name: "Sam", h: "55%", v: "calico" as const, color: "#cd7f32" },
  ];
  return (
    <div className="glass-strong relative h-72 w-full overflow-hidden rounded-3xl p-5"
      style={{ transform: "perspective(1200px) rotateX(4deg) rotateY(-6deg)", boxShadow: "var(--shadow-card)" }}>
      <div className="flex justify-around items-end h-full pb-2">
        {podium.map((p, i) => (
          <div key={p.name} className="flex flex-col items-center gap-2">
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.2 }}>
              <CatAvatar variant={p.v} size={48} />
            </motion.div>
            <div className="text-xs font-bold">{p.name}</div>
            <motion.div className="w-16 rounded-t-xl flex items-start justify-center pt-2 text-sm font-display font-bold"
              style={{ background: p.color, height: p.h }}
              initial={{ height: 0 }} whileInView={{ height: p.h }} viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15 }}>
              {p.rank}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- 9. Kitty cam vision -----
export function VisionVisual() {
  return (
    <div className="relative h-72 w-full flex items-center justify-center"
      style={{ perspective: "1200px" }}>
      <div className="relative glass-strong rounded-[2.5rem] p-3 w-56 h-72"
        style={{ transform: "rotateY(-12deg) rotateX(4deg)", boxShadow: "var(--shadow-card)" }}>
        <div className="relative h-full w-full rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(180deg, #fefae0, #b7e4c7)" }}>
          <img
            src={catEartip}
            alt="3D cat face showing ear-tip TNR marker"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* color tint */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(180deg, rgba(82,183,136,0.1), rgba(45,106,79,0.2))" }} />
          {/* scan line */}
          <div className="absolute left-0 right-0 h-0.5 animate-scan-line"
            style={{ background: "var(--mint)", boxShadow: "0 0 14px var(--mint)" }} />
          {/* detection box */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-10 h-10 border-2 rounded"
            style={{ borderColor: "var(--mint)" }} />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 glass rounded-full px-3 py-1 text-[10px] whitespace-nowrap"
            style={{ color: "var(--mint)" }}>
            Ear-tip detected ✓
          </div>
        </div>
      </div>
    </div>
  );
}
