# 🗺️ TNR Tracker: The Ultimate 5-Year Technical Roadmap

This roadmap outlines the extremely granular, minute-by-minute technical evolution of the TNR Tracker platform. Our vision is to scale from a robust hackathon prototype to a globally deployed, decentralized, AI-driven IoT ecosystem for feral cat management.

---

## 🏗️ Phase 1: MVP Hardening & Operational Readiness (Months 1-3)

### Sprint 1: Security & Architecture Audits
- [ ] **Row Level Security (RLS) Hardening**
  - Implement granular policies on the `colonies` table restricting `UPDATE` to only the creator or org-admins.
  - Secure `cats` and `traps` tables ensuring volunteers can only view data within a 50km radius of their location to prevent data-scraping of vulnerable colonies.
  - Implement Supabase Vault for encrypting sensitive volunteer PII (Personally Identifiable Information).
- [ ] **Frontend Performance Optimization**
  - Implement Code Splitting using `React.lazy()` and Suspense for `NetworkGraph.jsx` and `MapPage.jsx` to reduce initial bundle size by 40%.
  - Configure Vite PWA plugin to generate service workers for offline caching of static assets.
  - Migrate Leaflet tile servers from OpenStreetMap to a custom Mapbox instance for higher rate limits and custom dark mode themes.
- [ ] **Database Indexing Strategy**
  - Add GiST (Generalized Search Tree) indexing to `colonies.lat` and `colonies.lng` for lightning-fast geospatial queries using PostGIS.
  - Add B-Tree indexing to `cats.colony_id` and `traps.colony_id` to speed up the Knowledge Graph hierarchical queries.
  - Implement a Postgres materialized view for the "Priority Heatmap" calculation to offload the `intactCount` math from the client to the server.

### Sprint 2: Core UX/UI Refinements
- [ ] **Knowledge Graph V2**
  - Implement Web Worker offloading for the d3-force physics engine to guarantee 144FPS on high-end displays.
  - Add collision detection tuning so cats don't overlap when popping out of a colony node.
  - Implement right-click context menus on nodes for quick actions (e.g., "Add Cat to Colony" directly from the graph).
- [ ] **Map Clustering & Performance**
  - Replace raw Leaflet `<Marker>` rendering with `react-leaflet-cluster` (Supercluster) to smoothly group thousands of traps and colonies at high zoom levels.
  - Implement debounced bounding-box queries (`onMoveEnd`) so the map only requests data for the currently visible screen area, rather than the entire world.
- [ ] **Advanced Filtering & Search**
  - Build a global command palette (Ctrl+K / Cmd+K) utilizing Algolia or Supabase Full-Text Search to instantly jump to any Cat, Volunteer, or Colony.
  - Add multi-parameter filtering to the Map (e.g., "Show me only colonies with > 5 intact cats AND within 10 miles of me").

### Sprint 3: The Recovery Ward & Medical Tracking
- [ ] **Medical Schema Expansion**
  - Create `surgeries` table linking `cats.id` to `clinics.id`.
  - Create `medications` table with specific dosages (e.g., "0.5ml Meloxicam").
  - Create `rabies_tags` table to track the physical serial numbers of rabies vaccines administered during TNR.
- [ ] **Post-Op Workflow UI**
  - Build a drag-and-drop Kanban board for the Recovery Ward (Columns: "In Surgery", "Recovering", "Cleared for Release").
  - Integrate push notifications (via Firebase Cloud Messaging) to alert volunteers when a cat's 48-hour recovery hold is complete.
  - Generate printable PDF cage cards with QR codes containing the cat's medical history.

---

## 🤖 Phase 2: AI & Hardware Integration (Months 4-12)

### Sprint 4: The "Kitty Cam" Real AI Implementation
- [ ] **Computer Vision Pipeline**
  - Train a custom YOLOv8 object detection model on 50,000 images of feral cats to detect:
    1. Ear-tips (Left ear vs Right ear).
    2. Approximate age (Kitten vs Adult).
    3. Body Condition Score (1-9 scale for malnutrition tracking).
  - Deploy the model via AWS SageMaker or a custom FastAPI microservice using ONNX runtime for sub-200ms inference.
- [ ] **Biometric Cat Facial Recognition**
  - Implement Siamese Neural Networks to generate embeddings of cat faces.
  - Build an indexing system (Faiss) to match newly uploaded photos against the database of known cats to prevent duplicate entries of the same street cat.
  - Frontend integration: When a user uploads a photo, show a "Match Confidence Score" comparing it to known cats in that colony.

### Sprint 5: IoT Smart Traps
- [ ] **Hardware Prototyping**
  - Design a custom PCB utilizing an ESP32 micro-controller and a SIM7000G cellular modem.
  - Attach an infrared break-beam sensor to the trap door.
- [ ] **Firmware & Telemetry**
  - Write C++ firmware that enters deep sleep to preserve battery, waking up only when the IR beam is broken.
  - Upon trap trigger, the modem wakes up, acquires a GPS lock, and sends an MQTT message to our backend.
- [ ] **Backend IoT Integration**
  - Set up an AWS IoT Core broker to receive MQTT payloads from traps worldwide.
  - Build a Supabase Edge Function that listens to IoT webhooks, updates the `traps.status` to "Caught", and triggers a real-time WebSocket event to the frontend.
- [ ] **Frontend IoT Dashboard**
  - Add a "Live Traps" panel to the map. When a physical trap closes in the real world, the map pin instantly turns red, pulses, and sends a push notification to the assigned volunteer.

### Sprint 6: Route Optimization & Logistics
- [ ] **Advanced Route Planning API**
  - Strip out the basic Nearest-Neighbor TSP approximation.
  - Integrate the Mapbox Optimization API (or Google OR-Tools on a Python backend) to calculate real street-level driving routes.
  - Account for traffic, one-way streets, and exact driving time.
- [ ] **Turn-by-Turn Navigation**
  - Add a "Start Navigation" button on the mobile web view that generates a deep link to Google Maps / Apple Maps with multi-stop waypoints pre-loaded.
  - Automatically calculate the optimal order to drop off cats at the clinic based on appointment times.

---

## 📱 Phase 3: Mobile & Enterprise Scale (Year 2)

### Sprint 7: React Native Mobile Application
- [ ] **Architecture Setup**
  - Scaffold an Expo React Native application sharing the exact same Supabase backend.
  - Implement Zustand for global state management to mirror the web app.
- [ ] **Offline-First Data Sync**
  - Implement WatermelonDB as the local SQLite database on the mobile device.
  - Build a robust sync engine: Volunteers can download an entire Colony's data while on Wi-Fi, drive to a remote area with zero cell service, trap 5 cats, log them, and the app will automatically synchronize the changes to Supabase once LTE is restored.
- [ ] **Hardware Features**
  - Native camera integration for lightning-fast Kitty Cam scanning.
  - Background geolocation tracking to build "Volunteer Activity Heatmaps" (showing exactly which alleyways have been patrolled).
  - NFC scanning: Allow volunteers to scan NFC tags attached to physical traps to instantly pull up the trap's status on their phone.

### Sprint 8: Enterprise Clinic Integrations
- [ ] **Vet API Layer**
  - Build standard REST and GraphQL APIs for third-party veterinary software (e.g., Cornerstone, Covetrus).
  - Automatically export daily TNR manifests from TNR Tracker directly into the clinic's intake system.
- [ ] **Automated Billing & Grants**
  - Build a financial dashboard to track the cost of every surgery.
  - Automatically generate CSV reports required by municipal animal control offices to secure TNR grant funding.

### Sprint 9: Advanced Analytics & Predictive Modeling
- [ ] **Predictive Population Models**
  - Utilize time-series forecasting (ARIMA/Prophet) based on historical TNR data to predict community cat population spikes in specific zip codes.
  - The Map Heatmap evolves from "Current State" to "Predictive State" (e.g., "If this colony is ignored, it will grow by 400% by next Spring").
- [ ] **Volunteer Gamification Expansion**
  - Build a robust XP system. Logging a cat = 10 XP. Transporting to the vet = 50 XP.
  - Implement seasonal leaderboards, unlockable digital badges, and an "Impact Score" algorithm that calculates exactly how many future kittens were prevented by a volunteer's actions.

---

## 🌍 Phase 4: Decentralized Global Ecosystem (Year 3+)

### Sprint 10: Global Federation & Data Lake
- [ ] **Multi-Tenant Architecture**
  - Transition the single Supabase instance to a clustered Kubernetes architecture using raw PostgreSQL + Citus for horizontal scaling across millions of rows.
  - Implement logical replication to create regional read-replicas (US-East, EU-West, AP-South) ensuring sub-50ms latency for volunteers worldwide.
- [ ] **Open Data Lake**
  - Export anonymized telemetry data into an AWS S3 Data Lake (Parquet format) accessible via Amazon Athena.
  - Launch the "Global Feral Ecosystem API" allowing university researchers, biologists, and municipal governments to study urban wildlife patterns based on our data.
  
### Sprint 11: Drone Automation & Thermal Imaging
- [ ] **Drone Integration API**
  - Partner with commercial drone fleets equipped with FLIR (Forward Looking Infrared) cameras.
  - Build ingestion pipelines that process thermal drone footage of abandoned factories or forests.
- [ ] **Automated Colony Discovery**
  - Use computer vision to identify thermal signatures matching small mammals in drone footage.
  - Automatically drop a "Suspected Unmanaged Colony" pin on the `MapPage.jsx` when the drone identifies a cluster of heat signatures.

### Sprint 12: Autonomous Release Mechanisms
- [ ] **Smart Recovery Enclosures**
  - Build solar-powered, climate-controlled recovery enclosures for feral cats.
  - Integrate electronic locking mechanisms linked to the TNR Tracker API.
  - When a cat's 48-hour medical hold timer reaches zero, the system automatically verifies weather conditions (ensuring it's not freezing or raining) via the OpenWeather API.
  - If conditions are optimal, the TNR Tracker API sends a signal to automatically open the enclosure doors, allowing the cat to return to its colony without human intervention.

---

## 🔬 Deep Dive: The Hierarchical Graph Engine Refactor
*(Detailed breakdown of the upcoming Knowledge Graph enhancements)*

Currently, our `NetworkGraph.jsx` utilizes `react-force-graph-2d` and dynamically pulls data on click. To reach the 1,000,000 node milestone, we will execute the following minute details:

1. **Migrating to Cosmograph:** We will rip out `d3-force` and implement `@cosmograph/react`, which utilizes WebGL and SharedArrayBuffers to execute physics calculations purely on the GPU.
2. **QuadTree Clustering:** We will implement a custom QuadTree spatial index. When zoomed out, 50 cats in a 1-mile radius will collapse into a single "Meta-Node" with a label `Cats: 50`.
3. **WebSockets for Live Graph:** We will bind Supabase Realtime to the Graph. When a volunteer halfway across the world logs a new cat, a pulsing animation will fire across the graph, and the new node will shoot out of its parent colony in real-time on all active clients.
4. **Link Weighting:** The physics springs connecting nodes will be dynamically weighted. A volunteer who has logged 100 cats will have a stronger gravitational pull on the graph than a new volunteer, physically organizing the ecosystem around the most active players.

---

## 📝 Continuous Integration & DevOps

- **Testing Strategy:**
  - Implement Playwright for end-to-end testing of the map clicking, node expansion, and search dropdown race conditions.
  - Achieve 95% unit test coverage using Vitest for all React hooks (`useColonies`, `useTraps`, `useCats`).
- **CI/CD Pipeline:**
  - GitHub Actions will run Prettier, ESLint, and Vitest on every PR.
  - PRs automatically generate ephemeral preview environments using Vercel.
  - Merges to `main` trigger a production build, push the Docker image to AWS ECR, and execute a rolling update to the ECS cluster.

---

*(End of Roadmap - Welcome to the Future of TNR)*
