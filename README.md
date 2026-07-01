<div align="center">

# 🐾 TNR Tracker

### *Coordinating Care for Community Cats*

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC?logo=tailwindcss)](https://tailwindcss.com)

### 🔗 Live Demo: [https://tnr-tracker.vercel.app](https://tnr-tracker.vercel.app)

**TNR Tracker** is a full-stack, map-first web application built for animal welfare volunteers managing **Trap-Neuter-Return** programs for community (stray/feral) cats. It replaces scattered spreadsheets and group chats with a unified, real-time platform for colony mapping, cat registration, AI-powered health analysis, adoption pipelines, and volunteer coordination.

[Getting Started](#-getting-started) · [Features](#-features) · [Architecture](#-architecture) · [AI Integration](#-ai-integration) · [Documentation](#-documentation)

</div>

---

## 🌍 The Problem

Every city has colonies of community cats. TNR (Trap-Neuter-Return) is the **only humane, scientifically proven method** to stabilize and reduce these populations over time. But TNR coordinators face a logistical nightmare:

- **No centralized map** — volunteers don't know where colonies exist or overlap
- **Paper-based tracking** — cat records live in notebooks, text threads, or inconsistent spreadsheets
- **Zero visibility** — there's no way to see which cats are neutered, recovering, or adoption-ready
- **Volunteer burnout** — without coordination tools, the same people do all the work

**TNR Tracker solves all of this.**

---

## ✨ Features

### 🗺️ Interactive Colony Map
The home screen is a full-screen **Leaflet map** where every colony and trap is a clickable pin. Volunteers can:
- **Drop pins** to register new colonies or traps directly on the map
- **View colony sidebars** with live cat counts, neutering %, and status badges
- **Toggle a population heatmap** showing cat density across the city
- **Plan optimized routes** between traps using a TSP (Traveling Salesman Problem) solver with 2-opt geodetic refinement

### 🐱 Cat Registration & Kitty Cam AI
Log every cat with name, gender, health notes, and a photo. When a photo is uploaded:
- **Kitty Cam Vision AI** (powered by Groq/Gemini multimodal) automatically scans for **ear-tip detection** — the universal sign of a neutered TNR cat
- Auto-detects **breed/coat pattern** from the photo
- Pre-fills the neutered checkbox if an ear-tip is detected

### 🧠 AI Colony Health Reports
One click generates a structured **AI health analysis** for any colony, covering:
- Colony status summary
- Health concerns and patterns
- Neutering progress assessment
- Specific, actionable next steps for volunteers

The AI pipeline uses a **3-tier failover**: Groq (LLaMA 3.3 70B) → Supabase Edge Function → Gemini API direct.

### 🏥 Recovery Ward
Post-surgery care tracking for cats after spay/neuter or medical procedures:
- Track surgery type, date, vet notes, and expected release
- **Medication management** — log dosages, frequencies, and mark medications as completed
- Visual release animation when a cat graduates from recovery
- Filter between active recoveries and released cats

### 🐾 Adoption Pipeline
A Kanban-style board tracking cats through four stages:
| Stage | Description |
|---|---|
| 🔄 **TNR (Return)** | Standard return-to-colony after neutering |
| 💕 **Socializing** | Cat is being socialized for potential adoption |
| 🏠 **Ready for Adoption** | Cleared by vets and foster-ready |
| 🎉 **Adopted** | Successfully placed in a forever home |

Move cats between stages with one click. Track foster names and adoption dates.

### 💕 Adoption Matchmaker
An interactive quiz that matches potential adopters with compatible cats based on:
- Household energy level
- Existing pets
- Preferred cat temperament

Uses intelligent keyword matching against real cat health notes (e.g. "friendly", "shy", "playful") to find the best match.

### 📊 Analytics Dashboard
High-level metrics and visualizations:
- **Stat cards**: Total cats, neutered %, active traps, colony count
- **Spay/Neuter bar charts** per colony (via Recharts)
- **Municipal quarterly reporting** with estimated funding calculations for grant applications
- **One-click CSV export** and **printable Vet Summary sheets** for clinic days

### 🕸️ Network Graph (Admin)
An interactive **force-directed graph** (react-force-graph-2d) visualizing the entire TNR network:
- Colonies as hub nodes, cats as satellite nodes
- Color-coded by neutered status
- Searchable with real-time node highlighting
- Click to expand/collapse colony clusters

### 🔔 Real-time Notifications
Supabase Realtime powers **live activity feeds** and a notification dropdown:
- New cats logged, status changes, feeding updates
- Colony-level activity feeds with human-readable timestamps
- Badge count on the navbar bell icon

### 🍽️ Feeding Manager
Colony-level feeding coordination:
- Set **recurring feeding schedules** with assigned caregivers
- Log individual feeding events (food type, quantity, caregiver, notes)
- View feeding history parsed from the activity log

### 📋 Data Exports
- **CSV Export**: Download colony and cat data as structured CSV files
- **Vet Summary Export**: Generate printable, clinic-ready HTML documents listing all intact (un-neutered) cats with colony assignments and health notes

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  React 18 + Vite 8 + Tailwind CSS 4             │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Leaflet  │ │ Recharts │ │ Force Graph 2D   │ │
│  │ Map      │ │ Charts   │ │ Network Viz      │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│  ┌──────────────────────────────────────────────┐│
│  │ React Router v6  •  Framer Motion  •  RBAC  ││
│  └──────────────────────────────────────────────┘│
└────────────────────┬────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────┐
│              Supabase (Backend)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Postgres │ │ Auth     │ │ Realtime (CDC)   │ │
│  │ + RLS    │ │ + JWT    │ │ WebSocket        │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│  ┌──────────────────────────────────────────────┐│
│  │ Edge Functions (Deno)                        ││
│  │  • gemini-proxy   → AI health reports        ││
│  │  • cat-api-proxy  → TheCatAPI integration    ││
│  └──────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────┐│
│  │ Storage Buckets  → cat-photos (public)       ││
│  └──────────────────────────────────────────────┘│
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│            External APIs                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Groq API │ │ Gemini   │ │ TheCatAPI        │ │
│  │ LLaMA 3.3│ │ 1.5 Flash│ │ Cat of the Day   │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, Vite 8 | SPA with code-splitting & lazy loading |
| **Styling** | Tailwind CSS 4, Framer Motion | Responsive UI with smooth animations |
| **Maps** | Leaflet + React-Leaflet | Interactive colony & trap mapping |
| **Charts** | Recharts | Dashboard analytics visualizations |
| **Graph** | react-force-graph-2d | Network topology visualization |
| **Backend** | Supabase (PostgreSQL) | Database, Auth, Realtime, Storage |
| **Edge Functions** | Deno (Supabase Edge) | Serverless API proxies |
| **AI (Primary)** | Groq (LLaMA 3.3 70B) | Colony health reports, cat photo analysis |
| **AI (Fallback)** | Google Gemini 1.5 Flash | Failover AI provider |
| **Hosting** | Vercel | Frontend deployment with security headers |

---

## 🤖 AI Integration

TNR Tracker integrates AI to solve two critical operational pain points for field volunteers:

1. **Kitty Cam Vision**: Ear-tip detection by eye is extremely challenging when handling blurry phone photos of feral cats in low-light field conditions. Multimodal AI scans uploaded images, detects ear-tipping (the universal marker for neutered cats), identifies coat patterns, and pre-fills form data.
2. **Colony Health Reports**: Writing veterinary-style health assessments doesn't scale as soon as a volunteer manages multiple colonies. The AI aggregates unstructured timeline updates and cat rosters, transforming them into a structured report (Status Summary → Health Concerns → Neutering Progress → Actionable Next Steps).

### Secure, Server-Mediated Architecture
To prevent API key exposure in client bundles, **all AI operations are mediated through authenticated Supabase Edge Functions** (`gemini-proxy`). 
- **Zero Client-Key Exposure**: Frontend contains no API keys. Gemini credentials are encrypted and stored solely as server-side environment secrets.
- **Rate-Limiting**: Every call is protected by a database-backed atomic rate limiter (`check_and_increment_rate_limit`) restricting users to 1 request per 5 seconds.
- **Failover & Offline Resiliency**: If the Edge function fails (network loss, API provider downtime, or rate-limiting), the client gracefully falls back to high-fidelity pre-generated reports/scans based on seed data, ensuring zero workflow disruption during live demos or field use.
- **Input Sanitization & Injection Constraints**: User inputs are sanitized to strip backticks and HTML elements. Indirect prompt injection via malicious volunteer logs is a acknowledged boundary constraint; safety rules are enforced via system instructions in the Edge function.

---

- **Zero Client-Side AI Key Exposure** — All AI requests (Kitty Cam scans, Colony Health Reports) are mediated strictly through Supabase Edge Functions. No AI provider API keys (Gemini/Groq) are loaded on the client or exposed in the JS bundle.
- **Row Level Security (RLS)** on all 7 database tables with granular policies
- **SECURITY DEFINER** helper functions to prevent RLS recursion
- **Content Security Policy** headers via Vercel configuration
- **HSTS**, **X-Frame-Options: DENY**, **X-Content-Type-Options: nosniff**
- **Input sanitization** — HTML injection prevented in updates via CHECK constraints
- **AI prompt sanitization** — user inputs stripped of backticks and angle brackets before embedding
- **Edge Function authentication** — Supabase JWT verification on all serverless functions

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com) Gemini API key (stored securely in Supabase)

### 1. Clone & Install
```bash
git clone https://github.com/kishansaaai/tnr-tracker.git
cd tnr-tracker
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` with your credentials (note that AI keys are not needed here since they are serverless-mediated):
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# TheCatAPI (Cat of the Day widget proxy fallback)
VITE_CAT_API_KEY=your-cat-api-key
```

### 3. Initialize Database
Run the SQL schema in your Supabase SQL Editor:
1. Execute `supabase/schema.sql` — creates all tables, indexes, RLS policies, and triggers
2. *(Optional)* Execute `supabase/seed.sql` — populates demo data for testing

### 4. Deploy Edge Functions (Optional)
```bash
supabase functions deploy gemini-proxy
supabase functions deploy cat-api-proxy
supabase secrets set GEMINI_API_KEY=xxx THE_CAT_API_KEY=xxx
```

### 5. Run Development Server
```bash
npm run dev
```
Open **http://localhost:5173** — create an account and start mapping colonies! 🐾

### 🔑 Demo Admin Credentials
For convenience during hackathon judging and evaluation, you can log in as an administrator using the quick-autofill button on the Sign In page, or manually enter the following credentials:
- **Email**: `judge-demo@tnrtracker.app`
- **Password**: `TNRDemo2026!`

---

## 📁 Project Structure

```
tnr-tracker/
├── docs/                     # Documentation folder
│   ├── ARCHITECTURE.md       # System architecture details
│   ├── DATABASE.md           # Database schema documentation
│   └── API.md                # API & Edge Function docs
├── public/                   # Static assets
├── src/
│   ├── components/
│   │   ├── Cats/             # Cat registration, avatars, cards
│   │   ├── Colony/           # Health reports, feeding, activity
│   │   ├── Map/              # Map sidebar, modals, markers
│   │   ├── Recovery/         # Recovery ward components
│   │   ├── Traps/            # Trap management
│   │   ├── UI/               # Shared UI (Button, Modal, Navbar...)
│   │   └── tnr/              # Landing page components
│   ├── hooks/                # Custom React hooks (data layer)
│   │   ├── useAuth.jsx       # Authentication context
│   │   ├── useCats.js        # Cat CRUD + realtime
│   │   ├── useColonies.js    # Colony CRUD + realtime
│   │   ├── useNotifications  # Live notification system
│   │   ├── useRecovery.js    # Recovery ward operations
│   │   ├── useTraps.js       # Trap CRUD + realtime
│   │   └── useUpdates.js     # Activity feed hook
│   ├── lib/                  # Utility & service libraries
│   │   ├── gemini.js         # AI integration (Groq + Gemini)
│   │   ├── supabase.js       # Supabase client init
│   │   ├── catApi.js         # TheCatAPI client
│   │   ├── exportCSV.js      # CSV data export
│   │   ├── vetExport.js      # Printable vet summaries
│   │   ├── utils.js          # Haversine, TSP, sanitizers
│   │   └── utils.test.js     # Unit tests (Vitest)
│   ├── pages/                # Route-level page components
│   │   ├── MapPage.jsx       # Interactive colony map (home)
│   │   ├── Dashboard.jsx     # Analytics & reporting
│   │   ├── ColonyDetail.jsx  # Single colony deep-dive
│   │   ├── RecoveryPage.jsx  # Post-surgery recovery ward
│   │   ├── AdoptionPage.jsx  # Adoption pipeline board
│   │   ├── MatchmakerPage    # Adoption matchmaker quiz
│   │   ├── NetworkGraph.jsx  # Force-directed network viz
│   │   ├── Volunteers.jsx    # Volunteer management (admin)
│   │   └── Auth.jsx          # Authentication page
│   ├── App.jsx               # Root component & routing
│   └── index.css             # Global styles & Tailwind
├── supabase/
│   ├── functions/            # Supabase Edge Functions (Deno)
│   │   ├── gemini-proxy/     # AI proxy with rate limiting
│   │   └── cat-api-proxy/    # TheCatAPI secure proxy
│   ├── schema.sql            # Complete database schema
│   └── seed.sql              # Demo seed data
├── .env.example              # Environment variable template
├── vite.config.js            # Vite build configuration
├── vercel.json               # Vercel deployment + security headers
├── CONTRIBUTING.md           # Contribution guidelines
├── ROADMAP.md                # Feature roadmap
└── LICENSE                   # MIT License
```

---

## 🧪 Testing

```bash
# Run the full test suite
npm run test

# Run in watch mode during development
npx vitest
```

Tests cover utility functions including:
- Haversine distance calculations
- TSP route optimization (nearest-neighbor + 2-opt)
- Input sanitization functions
- Error message formatting
- Keyword matching for adoption matchmaking

---

## 📚 Documentation

Detailed documentation is available in the [`docs/`](docs/) folder:

| Document | Description |
|----------|------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, data flow, and component relationships |
| [DATABASE.md](docs/DATABASE.md) | Complete database schema, RLS policies, and triggers |
| [API.md](docs/API.md) | Edge Function API documentation and AI integration details |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute, code style, and PR guidelines |
| [ROADMAP.md](ROADMAP.md) | Feature roadmap and planned improvements |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with 💚 for community cats everywhere**

*TNR Tracker — because every cat deserves to be counted.*

🐾

</div>
