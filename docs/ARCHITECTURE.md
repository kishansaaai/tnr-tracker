# 🏗️ TNR Tracker — System Architecture

## Overview

TNR Tracker is a **full-stack single-page application (SPA)** designed for real-time coordination of Trap-Neuter-Return programs. The architecture prioritizes offline resilience, real-time collaboration, and a layered AI failover strategy.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                       │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │   Pages     │  │  Components │  │  Custom Hooks        │ │
│  │  (Routes)   │──│  (UI Layer) │──│  (Data/State Layer)  │ │
│  └─────────────┘  └─────────────┘  └──────────┬───────────┘ │
│                                                │              │
│  ┌─────────────────────────────────────────────▼────────────┐│
│  │              Service Libraries (src/lib/)                 ││
│  │  supabase.js │ gemini.js │ catApi.js │ utils.js           ││
│  └──────────────────────────┬────────────────────────────────┘│
└─────────────────────────────┼────────────────────────────────┘
                              │  HTTPS / WSS
┌─────────────────────────────▼────────────────────────────────┐
│                     SUPABASE PLATFORM                         │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  PostgreSQL  │  │  Auth (GoTrue)│  │  Realtime (CDC)   │ │
│  │  + RLS       │  │  + JWT Tokens │  │  + WebSocket      │ │
│  └──────────────┘  └──────────────┘  └────────────────────┘ │
│                                                               │
│  ┌──────────────┐  ┌─────────────────────────────────────┐   │
│  │  Storage     │  │  Edge Functions (Deno Runtime)       │   │
│  │  (cat-photos)│  │  ├── gemini-proxy (AI reports)       │   │
│  └──────────────┘  │  └── cat-api-proxy (TheCatAPI)       │   │
│                    └─────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Build System
- **Vite 8** — ES module-based dev server with sub-second HMR
- **React 18** — Concurrent rendering with `Suspense` and `React.lazy()` for route-level code splitting
- **Tailwind CSS 4** — Utility-first CSS with the `@tailwindcss/vite` plugin for zero-config integration

### Routing & Code Splitting
All page components are lazy-loaded via `React.lazy()`:

```javascript
const MapPage = React.lazy(() => import('./pages/MapPage'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const ColonyDetail = React.lazy(() => import('./pages/ColonyDetail'))
// ... etc
```

Each lazy route is wrapped in `<ErrorBoundary>` + `<Suspense>` with a `<PawLoader>` fallback.

### State Management
TNR Tracker uses a **hooks-based architecture** instead of a global state library:

| Hook | Responsibility |
|------|---------------|
| `useAuth` | Authentication context (user, profile, RBAC roles) |
| `useColonies` | Colony CRUD + Supabase Realtime subscription |
| `useCats` | Cat CRUD + photo uploads + Realtime |
| `useTraps` | Trap management + status updates |
| `useRecovery` | Recovery ward + medication tracking |
| `useUpdates` | Colony activity feed |
| `useNotifications` | Real-time notification aggregation |

Each hook encapsulates its own Supabase queries, Realtime subscriptions, and optimistic updates.

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|------------|
| `volunteer` | View map, log cats, update traps, post updates |
| `feeder` | All volunteer permissions + feeding management |
| `admin` | Full access + volunteer management + network graph |

Routes are protected via `<ProtectedRoute>` and `<AdminRoute>` wrapper components.

---

## Backend Architecture

### Database (PostgreSQL via Supabase)
7 core tables with full referential integrity:

- **profiles** — User profiles extending `auth.users`
- **colonies** — Colony locations with GPS coordinates
- **cats** — Individual cat records with adoption pipeline tracking
- **traps** — Trap locations with assignment tracking
- **updates** — Colony activity feed (HTML-injection-safe via CHECK constraints)
- **recoveries** — Post-surgery recovery records
- **medications** — Medication schedules linked to recoveries

### Row Level Security (RLS)
Every table has RLS enabled with granular policies:
- Volunteers can read all data but only modify their own records
- Admins have full read/write access via `SECURITY DEFINER` helper functions
- Profile role escalation is prevented at the policy level

### Realtime
Supabase's Change Data Capture (CDC) system powers live updates:
- Colony sidebar refreshes when a new cat is logged
- Notification dropdown shows live activity
- Dashboard metrics update without page refresh

### Edge Functions
Two Deno-based serverless functions proxy external API calls:

1. **`gemini-proxy`** — Proxies Gemini AI requests with JWT authentication and rate limiting
2. **`cat-api-proxy`** — Proxies TheCatAPI requests to avoid exposing API keys client-side

---

## AI Pipeline Architecture

### 3-Tier Failover Strategy

```
Client Request
     │
     ▼
[1] Groq API (LLaMA 3.3 70B Versatile)
     │ ← Primary: fastest, free tier available
     │ (on error/timeout)
     ▼
[2] Supabase Edge Function (gemini-proxy)
     │ ← Secondary: server-side, rate-limited
     │ (on error)
     ▼
[3] Direct Gemini 1.5 Flash API
     │ ← Tertiary: client-side fallback
     ▼
  Response to UI
```

This ensures AI features remain functional even if one or two providers experience outages.

### AI Use Cases

| Feature | Input | Output |
|---------|-------|--------|
| Colony Health Report | Colony data + cat roster + activity log | 4-section structured health assessment |
| Kitty Cam Vision | Cat photo (base64) | Ear-tip detection + breed identification (JSON) |

---

## Deployment Architecture

### Frontend (Vercel)
- **SPA routing** via `vercel.json` rewrites
- **Security headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Asset caching**: Immutable 1-year cache for hashed static assets
- **Build**: `vite build` producing optimized, tree-shaken bundles

### Backend (Supabase Cloud)
- **Database**: Managed PostgreSQL with automated backups
- **Auth**: Hosted GoTrue with email/password authentication
- **Edge Functions**: Deployed via `supabase functions deploy`
- **Storage**: Public bucket for cat photos with direct URL access

---

## Key Design Decisions

### 1. Hooks over Redux
Custom hooks provide co-located data fetching and state management without the boilerplate of a global store. Each hook manages its own Supabase subscription lifecycle.

### 2. Lazy Loading Everything
Every page is code-split to minimize the initial bundle size. The map page (with Leaflet) and network graph (with D3 force simulation) are particularly heavy and benefit from deferred loading.

### 3. TSP for Route Optimization
The trap route planner uses a **nearest-neighbor heuristic** followed by a **2-opt improvement pass** with Haversine distance calculations. This provides near-optimal routes in O(n²) time, suitable for real-time computation with up to ~100 traps.

### 4. AI Failover Chain
Rather than depending on a single AI provider, the 3-tier failover ensures that the health report and vision features degrade gracefully across provider outages.

### 5. RLS-First Security
All authorization logic lives in PostgreSQL RLS policies, not in application code. This means even direct database access (via Supabase client libraries or REST API) is subject to the same security rules.
