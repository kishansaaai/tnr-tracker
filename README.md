# 🐈 TNR Tracker — The Complete Technical Manual

![TNR Tracker](https://img.shields.io/badge/Status-Active-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![Supabase](https://img.shields.io/badge/Supabase-Database-emerald) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8) ![Vite](https://img.shields.io/badge/Vite-Bundler-yellow)

**TNR Tracker** is an ultra-modern, production-ready, highly interactive web application designed to manage and gamify **Trap-Neuter-Return (TNR)** operations at a massive global scale. 

This document serves as the comprehensive technical manual, detailing every single granular feature, UI implementation, custom hook, physics engine quirk, and architectural design decision implemented in this application.

---

## 🚀 Getting Started (Local Development)

To run TNR Tracker locally, follow these steps:

### Prerequisites
- Node.js (v18+)
- Supabase CLI installed (`npm install -g supabase`)

### Setup Instructions
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy the example environment file and fill in your Supabase keys.
   ```bash
   cp .env.example .env
   ```

3. **Start the Database:**
   Start the local Supabase stack.
   ```bash
   supabase start
   ```

4. **Initialize the Database:**
   Run the schema and seed files in your Supabase SQL Editor (or via CLI):
   - `supabase/schema.sql` (Creates tables and RLS policies)
   - `supabase/migration_v2.sql` (Applies schema updates)
   - `supabase/seed.sql` (Populates test data)

5. **Deploy Edge Functions:**
   Deploy the secure proxy functions locally.
   ```bash
   supabase functions serve
   ```
   *(For production: `supabase functions deploy gemini-proxy` and `supabase functions deploy cat-api-proxy`)*

6. **Start the Frontend:**
   ```bash
   npm run dev
   ```

---

## 🛠️ 1. Technical Stack & Foundation

### Frontend
- **React 18 & Vite:** The core framework, ensuring lightning-fast Hot Module Replacement (HMR) and optimized production builds.
- **Tailwind CSS v3:** The utility-first CSS framework. We eschewed basic styling for deep customizations, including complex `tailwind.config.js` extensions for custom drop-shadows and micro-animations.
- **Vanilla CSS (`index.css`):** Used for advanced `@keyframes` that Tailwind couldn't natively support, specifically for the massive full-screen release animations and glassmorphism utilities.
- **React Router v6:** Handles SPA routing, nested routes, and protected authenticated layouts.

### Backend & Database
- **Supabase (PostgreSQL):** The entire backend infrastructure.
- **Supabase Auth:** Email/Password authentication tying users to Postgres `profiles`.
- **Row Level Security (RLS):** Postgres policies ensuring data integrity.
- **Supabase Storage:** S3-compatible buckets for hosting user-uploaded cat photos and AI simulated scans.

### Data Visualization & Maps
- **React Leaflet (`react-leaflet`, `leaflet.heat`):** For global interactive mapping.
- **Recharts:** For SVG-based dashboard analytics.
- **React Force Graph 2D (`react-force-graph-2d`):** A wrapper around `d3-force` for the Knowledge Graph.

### Security Notice: API Keys
- **VITE_GEMINI_API_KEY**: As this is a pure frontend application, Vite environment variables prefixed with `VITE_` are bundled into the client-side JavaScript. To mitigate abuse, you **must** set API key restrictions in the Google Cloud Console and restrict the key to your specific production domain (e.g., `https://your-app.vercel.app`).
- Alternatively, you can proxy the Gemini calls through a Supabase Edge Function so the key never leaves the server.

---

## ✨ 2. Granular UI & Feature Implementations

This section breaks down exactly how every core feature was built.

### 2.1 The Global Map & Priority Heatmaps (`MapPage.jsx`)
The command center for field volunteers.
* **Leaflet Foundation:** Implemented custom Marker overrides because standard Leaflet icons fail in Vite due to static pathing.
* **Dynamic Icons:** We built `createColonyIcon` and `createTrapIcon` which return `L.divIcon`. Instead of images, these render actual HTML/CSS circles that change color based on their status (e.g., Green for managed, Red for unmanaged, Purple for Traps).
* **The Priority Heatmap Engine:** 
  * **The Math:** The `heatmapData` useMemo hook iterates over 300+ colonies, counting the number of `neutered === false` cats.
  * **The UI:** We implemented `CircleMarker` (which uses screen pixels, not geographical meters) to draw glowing danger zones. If a colony has > 5 intact cats, it renders a massive `#b91c1c` dark red circle, overriding percentage logic. This ensures the heatmap is visible whether zoomed into a neighborhood or viewing the entire globe.
* **Auto-Bounds Zooming:** The `MapBoundsController` hook calculates the geospatial bounding box of all loaded colonies and automatically fits the camera to it on load.
* **UI Controls:** Positioned perfectly with `z-[400]` to sit above the Leaflet map panes, featuring translucent blurred toolbars.

### 2.2 Route Optimization & Planner (`MapPage.jsx`)
Helping field volunteers optimize their trap collection runs.
* **Nearest-Neighbor TSP Algorithm:** Implemented a Traveling Salesperson Problem (TSP) heuristic to dynamically calculate the shortest path connecting all active traps (`in_use` and `needs_pickup`).
* **Route Visualization:** Renders a dashed purple polyline connecting the traps in order, complete with numbered route marker badges (`idx + 1`) to clearly label checkpoint stops.
* **Geospatial Distance Estimator:** Computes total route distance in kilometers using the Haversine formula based on spherical trigonometry, displayed on a real-time status banner.

### 2.3 The Hierarchical Knowledge Graph (`NetworkGraph.jsx`)
The most technically complex piece of the application, designed to handle thousands of nodes without locking up the browser CPU.
* **Canvas 2D Rendering:** Instead of using standard DOM elements, we used the `nodeCanvasObject` prop to manually draw on the HTML5 Canvas.
  * We draw a background circle, and then use `ctx.fillText` to draw emojis (🐈, 🗺️, 🪤, 👤) perfectly centered based on the node's mathematical `val` size.
* **Expand-on-Demand Architecture:** To solve the 1,500+ node lag issue, we implemented Hierarchical Clustering.
  * **Initial Load:** The graph only fetches and renders `Colonies` and `Profiles` (Volunteers). 
  * **Pulsing Affordances:** If a Colony is unexpanded, we use a trigonometric `Math.sin(Date.now() / 300)` function in the canvas loop to draw an animated pulsing green ring around the node, inviting the user to click.
* **Solving the "Flying Node" Physics Bug:**
  * **The Problem:** When expanding a colony, the sudden injection of 20 cats caused the physics engine to violently push the colony out of the camera view.
  * **The Solution:** We implemented a pinning algorithm. On click, we capture `node.fx = node.x` and `node.fy = node.y`. This completely locks the colony in place, allowing the cats to physically explode outwards while the camera remains perfectly centered.
* **Race-Condition-Proof Search Bar:** 
  * Built a top-center absolute auto-complete search. 
  * Fixed a React race-condition where `onBlur` hid the dropdown before `onClick` fired by transitioning the dropdown buttons to use `onMouseDown` with `e.preventDefault()`. Clicking a search result instantly pans the camera, zooms in (`zoom(8)`), and triggers the expansion query.

### 2.4 Post-Op Recovery & The Release Overlay (`RecoveryPage.jsx` & `ReleaseOverlay.jsx`)
Managing cats recovering from surgery and celebrating their return.
* **Recovery Dashboard:** A grid layout sorting cats by status (e.g., "Recovering", "Cleared for Release"). Uses Tailwind grid tracking.
* **The `ReleaseOverlay.jsx` Celebration:**
  * When a user clicks "Release Cat", the screen doesn't just reload. It triggers a massively complex CSS animation.
  * **CSS Implementation:** In `index.css`, we wrote `@keyframes runAcross` which uses `transform: translateX` and `translateY(bounce)` to literally sprint a massive emoji cat across the screen from `-20vw` to `120vw`.
  * **Timing:** The animation runs for exactly 1.5 seconds. The React component uses a `setTimeout` to unmount itself the millisecond the cat leaves the screen, keeping the DOM clean.

### 2.5 Adoption Pipeline (`AdoptionPage.jsx`)
A comprehensive kanban/dashboard layout to manage the socialization and rehoming pipeline.
* **Pipeline Stages:** Models cat journeys from `TNR (Return)` to `Socializing`, `Ready for Adoption`, and finally `Adopted` with custom cards, badges, and foster details.
* **Colony Filter:** Quick filter dropdown to focus on cats originating from a specific colony.
* **Granular Role Controls:** Implements front-and-back security where only organization administrators can move cats to the `Adopted` stage (secured via Supabase Row-Level Security).

### 2.6 Cat Matchmaker Quiz (`MatchmakerPage.jsx`)
A gamified user-facing matching quiz to pair prospective adopters with ready-to-adopt cats.
* **Step-by-Step Questionnaire:** Evaluates household energy levels, other pets, and preferred play styles.
* **Custom Matching Engine:** Accumulates quiz option scores and selects a matching cat from the `adoption_ready` stage pool.
* **Rich UI Elements:** Staggers step indicators, uses loading animations with randomized cat GIFs during processing, and generates detailed match cards with custom `CatAvatar` fallbacks.

### 2.7 The Dashboard & Analytics (`Dashboard.jsx`)
Real-time organizational telemetry.
* **Recharts Integration:** Implemented multiple charts:
  * **TNR Progress Donut Chart:** A customized `PieChart` with an inner radius to show the exact ratio of Neutered vs Intact cats.
  * **Volunteer Activity Bar Chart:** Ranks profiles by the number of cats logged.
* **Micro-Animations:**
  * Built a custom "Paw Print Walking Loader" component. It renders 4 paw prints, staggering their opacity using CSS `animation-delay: 0.2s`, simulating a cat walking across the screen while data fetches.

### 2.8 Gamification: Paws of Honor & Avatars (`Leaderboard.jsx` & `CatAvatar.jsx`)
* **Paws of Honor Leaderboard:** Ranks volunteers dynamically based on their `cats.logged_by` count. The top 3 users get special CSS styling (Gold, Silver, Bronze borders).
* **Cat Avatar Engine (`CatAvatar.jsx`):** 
  * A custom React component that takes a cat's `color` string (e.g., "Orange Tabby", "Tuxedo", "Calico") and generates a unique CSS-based cat face icon.
  * **Logic:** Uses a `useMemo` color mapper to determine base colors and ear colors. It renders SVG elements combined with Tailwind border-radius hacks to make incredibly cute icons without needing external image assets.

### 2.9 The Kitty Cam AI Simulator (`KittyCam.jsx`)
* **UX Design:** Built to simulate a highly advanced biometric AI scan for field volunteers.
* **Implementation:** 
  * Uses a hidden `<input type="file" accept="image/*">` triggered by an overarching bounding box.
  * Uses `URL.createObjectURL(file)` to instantly display the uploaded image locally without waiting for a server upload.
  * Implements a staged timeout array: It cycles through states ("Analyzing ear-tip...", "Checking biometric database...", "Calculating BMI...") using sequential React `useEffect` timeouts.
  * Superimposes a green CSS scanning line (`@keyframes scan`) that moves up and down the image using absolute positioning and `calc(100% - 2px)`.

---

## 🗄️ 3. Database Architecture & Hooks

### Supabase Schema Definition & RLS Policies
The database is fully normalized PostgreSQL featuring highly restrictive Row Level Security (RLS) policies:
1. `profiles`: Extension of `auth.users`. Contains `id`, `name`, `role`, `created_at`.
   * *RLS Policy:* Users can read only their own profile unless they have the `admin` role.
   * *Public View:* A read-only view `public_profiles` exposes `id` and `name` to all authenticated users for dropdown assignments.
2. `colonies`: `id`, `name`, `lat`, `lng` (with constraint check BETWEEN -90/90 and -180/180), `description`, `status` (Unmanaged, In Progress, Managed), `created_by`.
3. `cats`: `id`, `name`, `color`, `gender`, `neutered` (boolean), `colony_id` (FKey), `logged_by` (FKey), `pipeline_status` (tnr, socializing, adoption_ready, adopted), `adoption_date`, `foster_name`, `health_notes`, `photo_url`.
   * *RLS Policy:* Only admin users are permitted to update `pipeline_status` to `adopted`.
4. `traps`: `id`, `lat`, `lng` (with coordinate checks), `status` (available, in_use, needs_pickup), `colony_id` (FKey), `assigned_to` (FKey).
   * *RLS Policy:* Only the assigned owner or an administrator can modify or delete traps.
5. `recoveries` & `medications`: Track post-op care.
   * *RLS Policy:* Updates/Deletes restricted to the recovery record creator or an administrator.
6. `storage`: Image assets are uploaded to the S3-compatible `cat-photos` bucket.
   * *Security:* Policies restrict upload inserts to path prefixes matching the volunteer's authenticated UID.

### Custom React Hooks (`src/hooks/*`)
We abstracted all Supabase API calls into clean, reusable React Hooks:
* `useAuth.jsx`: Listens to `supabase.auth.onAuthStateChange`. Manages the global `user` session state and admin permission flags.
* `useColonies.js`: Fetches all colonies, handles Insert/Update, and provides realtime loading states.
* `useCats.js`: Features variants like `useCats(colonyId)` for fetching cats specific to a colony, and `useAllCats()` for global analytics and pipeline stages. Includes `uploadCatPhoto` which hooks into Supabase Storage buckets.
* `useTraps.js`: Manages the lifecycle and location of traps deployed in the field.

---

## 🐍 4. The Global Data Generator

To test the extreme scaling architectures (like the Graph Hierarchical Drilldown), we needed massive amounts of data. We bypassed manual entry and built a custom Python script:

* **File:** `scratch/generate_global_data.py`
* **Logic:** 
  * Generates pure `INSERT INTO` SQL statements compatible with Postgres.
  * **Geospatial Math:** Takes bounding boxes for major cities (Tokyo, London, NYC, Bangalore) and randomly generates `lat` and `lng` floats within those boxes.
  * **Relational Integrity:** It generates UUIDs for Colonies, then generates Cats and assigns them the UUID of the previously generated Colony. It does the same for Traps and Profiles.
  * **Statistical Spread:** Uses `random.random() < 0.3` to ensure that roughly 30% of cats are neutered and 70% are intact, creating realistic TNR scenarios for the Priority Heatmap to analyze.
* **Output:** `supabase/seed.sql` which was executed directly via the Supabase SQL editor.

---

## 🎨 5. CSS & Styling Philosophy

Our design system prioritizes a **Modern Emerald & Glassmorphism** aesthetic.

* **Colors:** We explicitly purged Tailwind's default blues and purples in favor of a strictly curated Emerald (`#10b981`), Amber (`#f59e0b`), and Rose (`#f43f5e`) palette to invoke nature, caution, and veterinary care.
* **Glassmorphism:** Widely used `bg-white/90 backdrop-blur-md` across the Navbar, Map Toolbars, and Graph Sidebars to allow the data visualizations beneath to bleed through beautifully.
* **Typography:** Enforced standard sans-serif with aggressive font-weight contrasts (`font-black` for headers, `tracking-widest uppercase` for sub-labels).

---

## 🛡️ 6. Challenges Overcome

1. **Map Re-Renders:** React Leaflet's `MapContainer` is notoriously finicky if its children cause full re-renders. We solved this by extracting the marker logic and bounds fitting into decoupled components (`MapBoundsController`) that use the `useMap()` hook, rather than trying to pass state directly to the container.
2. **Graph Object Identity Constraints:** `react-force-graph` relies on referential equality. If you accidentally map over `data.nodes` and return a new object reference, the graph explodes. We solved this in `NetworkGraph.jsx` by carefully mutating the existing `[...prevData.nodes]` array using `.find()` and appending only new nodes, rather than overwriting existing ones.
3. **Tailwind Dynamic Class Pruning:** When building `CatAvatar.jsx`, generating dynamic class names like `bg-${color}-500` caused Tailwind's JIT compiler to purge the classes because they weren't statically analyzable. We solved this by using a hardcoded configuration map (`colorMap`) that explicitly defines the full class strings.

---

*(This manual documents the precise state of the application. It is ready for production deployment via Vercel or Netlify.)*
