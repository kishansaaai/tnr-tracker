import {
  PawPrint,
  Map,
  Route as RouteIcon,
  Sparkles,
  Stethoscope,
  PartyPopper,
  Heart,
  Brain,
  BarChart3,
  ShieldCheck,
  Cat,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const chapters = [
  {
    id: 1,
    day: "Monday · 7:00 AM",
    title: "The Virtual Gates",
    subtitle: "Authentication & Onboarding",
    icon: ShieldCheck,
    story:
      "Alex pours a black coffee and registers on TNR Tracker. The glassmorphic signup card welcomes them, an email confirmation lands, and the dashboard opens up.",
    points: [
      "Supabase `onAuthStateChange` listener inside the `useAuth` hook",
      "`handle_new_user` trigger seeds `public.profiles` with role `volunteer`",
      "Email + password with subtle paw-shaped loader",
    ],
    accent: "forest",
  },
  {
    id: 2,
    day: "Monday · 9:00 AM",
    title: "The Command Center",
    subtitle: "Global Map & Priority Heatmaps",
    icon: Map,
    story:
      "Pins reveal a hidden city of colonies. A glowing red bloom over Dockside Alley whispers: 12 intact cats — action required.",
    points: [
      "Leaflet `divIcon` markers with pulsing animation",
      "`useMemo` heatmap weighted by intact cats per colony",
      "Priority threshold: more than 5 unaltered cats glows crimson",
    ],
    accent: "coral",
  },
  {
    id: 3,
    day: "Monday · 10:00 AM",
    title: "Setting the Course",
    subtitle: "Route Optimization & TSP",
    icon: RouteIcon,
    story:
      "Five traps to check. One click of Optimize Route, and a dashed purple loop appears: 7.2 km, 18 minutes, numbered stops 1 through 5.",
    points: [
      "Haversine formula in `lib/utils.js` for great-circle distance",
      "Nearest-neighbor heuristic over trap coordinates",
      "Stop badges rendered on top of Leaflet markers",
    ],
    accent: "amber",
  },
  {
    id: 4,
    day: "Monday · 10:30 AM",
    title: "Claiming the Target",
    subtitle: "Trap Deployment & Row Level Security",
    icon: PawPrint,
    story:
      "Warehouse Alley trap: raccoon-robbed but unsprung. Alex rebaits it and taps Assign to Me — the badge flips to amber.",
    points: [
      "`useTraps` updates status and `assigned_to`",
      "RLS policy: only the assignee or an admin may update",
      "Status badges: emerald, amber, rose",
    ],
    accent: "forest",
  },
  {
    id: 5,
    day: "Monday · 11:15 AM",
    title: "The Kitty Cam",
    subtitle: "Gemini Vision AI",
    icon: Sparkles,
    story:
      "Dockside Alley delivers a tuxedo cat. Alex snaps a photo, an emerald scanner sweeps it, and the form fills itself — coat, ear-tip status, even a name suggestion.",
    points: [
      "Image → base64 → Supabase Edge Function",
      "Gemini 2.5 Flash returns strict JSON: breed, color, earTipDetected",
      "API key stays server-side via `Deno.env.get`",
    ],
    accent: "amber",
  },
  {
    id: 6,
    day: "Monday · 2:00 PM",
    title: "The Recovery Pipeline",
    subtitle: "Post-Op Care & Meds",
    icon: Stethoscope,
    story:
      "Tuxedo Pirate is ear-tipped and recovering. Alex schedules buprenorphine for Tuesday and marks Wednesday for release.",
    points: [
      "`recoveries` joined to `cats` for portraits and color",
      "`medications` sub-table tracks every dose",
      "Progress bar shifts orange → emerald at 48 hours",
    ],
    accent: "coral",
  },
  {
    id: 7,
    day: "Wednesday · 9:00 AM",
    title: "Release Celebration",
    subtitle: "Confetti & Running Cat",
    icon: PartyPopper,
    story:
      "Tuxedo Pirate bolts back to his colony. The screen erupts with confetti as an emoji cat dashes across the banner: home safely.",
    points: [
      "Full-screen glass overlay at z-index 9999",
      "Canvas-rendered confetti in emerald, amber, coral",
      "`setTimeout` cleanup ensures the overlay unmounts cleanly",
    ],
    accent: "forest",
  },
  {
    id: 8,
    day: "Wednesday · PM",
    title: "Socialization Pipeline",
    subtitle: "Adoption Kanban",
    icon: Heart,
    story:
      "A purring orange kitten named Cheddar is far too friendly for the streets. He enters the Kanban: Socializing → Ready → Adopted.",
    points: [
      "Drag updates `cats.pipeline_status` in Supabase",
      "Admin-only RLS on the Adopted transition",
      "Cards show foster, age, and behavior tags",
    ],
    accent: "amber",
  },
  {
    id: 9,
    day: "Thursday · AM",
    title: "Finding the One",
    subtitle: "Matchmaker Quiz",
    icon: Brain,
    story:
      "Sarah wants a low-energy, apartment-friendly cuddler. Four questions later, the algorithm crowns Cheddar her top match.",
    points: [
      "Weighted scoring across energy, pets, and style",
      "Cards animate selection with emerald borders",
      "`PawLoader` staggers paw opacity during scoring",
    ],
    accent: "coral",
  },
  {
    id: 10,
    day: "Friday · Evening",
    title: "Telemetry & Honor",
    subtitle: "Dashboard & Leaderboard",
    icon: BarChart3,
    story:
      "Four cats logged in one week lands Alex in 4th on Paws of Honor — just behind the seasoned trappers. Next run: Monday.",
    points: [
      "Recharts donut for neuter ratio",
      "Grouped query of `cats` by `logged_by`",
      "Gold, silver, bronze borders for the top three",
    ],
    accent: "forest",
  },
];

const accentMap = {
  forest: "from-[var(--forest)] to-[var(--sage)]",
  amber: "from-[var(--amber)] to-[var(--coral)]",
  coral: "from-[var(--coral)] to-[var(--amber)]",
};

function PawIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden="true">
      <ellipse cx="32" cy="42" rx="14" ry="11" />
      <circle cx="14" cy="26" r="6" />
      <circle cx="26" cy="16" r="5.5" />
      <circle cx="38" cy="16" r="5.5" />
      <circle cx="50" cy="26" r="6" />
    </svg>
  );
}

function CatEars() {
  return (
    <div className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 flex gap-10">
      <div
        className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[26px]"
        style={{
          borderBottomColor: "white",
          transform: "rotate(-14deg)",
          filter: "drop-shadow(0 -2px 0 var(--sage))",
        }}
      />
      <div
        className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[26px]"
        style={{
          borderBottomColor: "white",
          transform: "rotate(14deg)",
          filter: "drop-shadow(0 -2px 0 var(--sage))",
        }}
      />
    </div>
  );
}

function PeekingCat() {
  return (
    <svg
      viewBox="0 0 120 80"
      className="absolute -bottom-2 -right-2 w-28 opacity-90"
      aria-hidden="true"
      style={{ animation: "float-y 6s ease-in-out infinite" }}
    >
      <ellipse cx="60" cy="60" rx="44" ry="22" fill="white" stroke="var(--sage)" strokeWidth="2" />
      <polygon points="28,46 36,28 46,46" fill="white" stroke="var(--sage)" strokeWidth="2" />
      <polygon points="92,46 84,28 74,46" fill="white" stroke="var(--sage)" strokeWidth="2" />
      <circle cx="48" cy="56" r="2.5" fill="var(--forest)" />
      <circle cx="72" cy="56" r="2.5" fill="var(--forest)" />
      <path d="M58 63 Q60 66 62 63" stroke="var(--coral)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M40 62 L30 60 M40 65 L30 67 M80 62 L90 60 M80 65 L90 67" stroke="var(--coral)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export default function Walkthrough() {
  return (
    <main className="relative min-h-screen overflow-hidden section-mint pb-20">
      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full blur-3xl opacity-50 bg-gradient-warm"
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-40 bg-gradient-forest"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 w-[420px] h-[420px] rounded-full blur-3xl opacity-30 bg-gradient-warm"
      />

      {/* Scattered paws */}
      <PawIcon className="absolute top-24 right-16 w-16 text-[var(--mint)] opacity-50" />
      <PawIcon className="absolute top-[60%] left-10 w-10 text-[var(--sage)] opacity-30" />
      <PawIcon className="absolute bottom-32 right-1/3 w-14 text-[var(--mint)] opacity-40" />

      {/* Nav */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl grid place-items-center bg-gradient-warm shadow-warm-glow"
          >
            <PawIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-display font-semibold text-lg leading-none text-[var(--forest)]">
              TNR Tracker
            </div>
            <div className="text-xs text-[var(--muted-foreground)] mt-1">
              Coordinating care for community cats
            </div>
          </div>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-white font-medium shadow-warm-glow hover:opacity-95 transition bg-gradient-warm"
        >
          Go Back Home <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 h-9 rounded-full glass-strong text-[var(--forest)] text-sm font-medium"
        >
          <Cat className="w-4 h-4" /> A volunteer's odyssey
        </div>
        <h1 className="font-display font-semibold text-5xl sm:text-6xl md:text-7xl mt-6 leading-[1.05] text-[var(--forest)]">
          One week. One volunteer.{" "}
          <span className="text-gradient-warm">A whole colony cared for.</span>
        </h1>
        <p className="mt-6 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
          Follow Alex from Monday morning signup to Friday evening leaderboard.
          Ten chapters covering authentication, heatmaps, Kitty Cam vision AI,
          post-op recovery, adoptions, and the math under the hood.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#chapter-1"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-full text-white font-semibold shadow-warm-glow hover:opacity-95 transition bg-gradient-warm"
          >
            <PawIcon className="w-5 h-5" /> Begin chapter one
          </a>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-full glass-strong text-[var(--forest)] font-medium lift-on-hover"
          >
            Go to App
          </Link>
        </div>
      </section>

      {/* System diagram */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="relative rounded-3xl glass-strong p-8 shadow-card bg-white/90">
          <CatEars />
          <div className="text-center mb-6">
            <div className="text-sm font-medium text-[var(--sage)] uppercase tracking-wider">
              How it all fits
            </div>
            <h2 className="text-3xl font-display font-semibold text-[var(--forest)] mt-2">
              The system at a glance
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {[
              ["Auth & Onboarding", "Auth.jsx · useAuth · profiles trigger"],
              ["Map & Routes", "Leaflet heatmap · TSP polyline"],
              ["Kitty Cam Vision AI", "Gemini proxy · auto-fill"],
              ["Recovery", "Recovery grid · meds log"],
              ["Adoption Pipeline", "Kanban · foster stages"],
              ["Matchmaker", "Choice tree · compatibility math"],
            ].map(([title, sub]) => (
              <div
                key={title}
                className="rounded-2xl p-4 bg-white/75 border border-[color-mix(in_oklab,var(--forest)_12%,transparent)] lift-on-hover"
              >
                <div className="font-semibold text-[var(--forest)]">{title}</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-1">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapters */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24 space-y-10">
        {chapters.map((c, idx) => {
          const Icon = c.icon;
          const reverse = idx % 2 === 1;
          return (
            <article
              key={c.id}
              id={`chapter-${c.id}`}
              className={`relative grid md:grid-cols-12 gap-6 items-stretch ${
                reverse ? "md:[direction:rtl]" : ""
              }`}
            >
              {/* Index card */}
              <div className="md:col-span-4 [direction:ltr]">
                <div
                  className="rounded-3xl p-6 text-white shadow-card lift-on-hover h-full relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, var(--${
                      c.accent === "forest" ? "forest" : c.accent
                    }), var(--${c.accent === "forest" ? "sage" : "coral"}))`,
                  }}
                >
                  <PawIcon className="absolute -right-4 -bottom-4 w-32 text-white/15" />
                  <div className="text-xs uppercase tracking-widest opacity-90">
                    Chapter {String(c.id).padStart(2, "0")}
                  </div>
                  <div className="text-sm mt-1 opacity-95">{c.day}</div>
                  <div className="mt-6 w-12 h-12 rounded-2xl bg-white/20 grid place-items-center backdrop-blur-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-semibold text-2xl mt-4 leading-tight">
                    {c.title}
                  </h3>
                  <div className="text-sm opacity-90 mt-1">{c.subtitle}</div>
                </div>
              </div>

              {/* Content card */}
              <div className="md:col-span-8 [direction:ltr]">
                <div className="relative rounded-3xl glass-strong p-7 md:p-9 shadow-card h-full overflow-hidden bg-white/90">
                  <PeekingCat />
                  <div
                    className={`inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full text-white bg-gradient-to-r ${accentMap[c.accent]}`}
                  >
                    The Story
                  </div>
                  <p className="mt-3 text-[var(--foreground)] text-lg leading-relaxed pr-24">
                    {c.story}
                  </p>
                  <div className="mt-6 border-t border-[color-mix(in_oklab,var(--forest)_12%,transparent)] pt-5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--sage)] mb-3">
                      Under the hood
                    </div>
                    <ul className="space-y-2">
                      {c.points.map((p) => (
                        <li
                          key={p}
                          className="flex items-start gap-3 text-[var(--foreground)]"
                        >
                          <span
                            className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: "var(--coral)" }}
                          />
                          <span className="text-sm leading-relaxed">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Architecture */}
      <section id="architecture" className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div
          className="relative rounded-3xl p-8 md:p-10 shadow-card text-white overflow-hidden bg-gradient-forest"
        >
          <PawIcon className="absolute -top-8 -right-8 w-56 text-white/10" />
          <PawIcon className="absolute -bottom-10 -left-6 w-40 text-white/10" />
          <div className="text-xs uppercase tracking-widest opacity-90">Epilogue</div>
          <h2 className="font-display font-semibold text-4xl mt-2">Architecture map</h2>
          <p className="mt-3 text-white/85 max-w-2xl">
            Everything Alex touched in one week, organized by where it lives in the repo.
          </p>
          <pre className="mt-6 text-xs sm:text-sm bg-black/25 rounded-2xl p-5 overflow-x-auto leading-relaxed font-mono">
{`tnr-tracker/
├── supabase/
│   ├── schema.sql              # tables + RLS policies
│   ├── migration_v2.sql        # vetting validations
│   ├── migration_v3.sql        # rate-limiting logs
│   └── functions/
│       ├── gemini-proxy/       # Kitty Cam vision
│       └── cat-api-proxy/      # fallback cat assets
├── src/
│   ├── components/
│   │   ├── Cats/               # forms, avatars, cards
│   │   ├── Colony/             # feeding logs, health reports
│   │   ├── Recovery/           # meds, release overlay
│   │   └── UI/                 # drawers, loaders
│   ├── hooks/
│   │   ├── useAuth.jsx         # session listener
│   │   ├── useColonies.js      # colonies CRUD
│   │   └── useTraps.js         # field traps state
│   ├── lib/
│   │   ├── gemini.js           # AI wrapper & demo fallbacks
│   │   ├── exportCSV.js        # secure CSV data export
│   │   └── utils.js            # geodetic routing (TSP)
│   ├── pages/
│   │   ├── MapPage.jsx         # clustered map + route planner
│   │   ├── AdoptionPage.jsx    # kanban board
│   │   └── Dashboard.jsx       # telemetry charts
│   └── index.css               # tokens + keyframes
├── vite.config.js              # PWA plugin configuration
└── vercel.json                 # routes + CSP`}
          </pre>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto px-6 pb-12 text-center">
        <div className="inline-flex items-center gap-2 text-[var(--forest)] font-display font-semibold">
          <PawIcon className="w-5 h-5" /> TNR Tracker
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          Built with warmth for the volunteers keeping community cats safe.
        </p>
      </footer>
    </main>
  );
}
