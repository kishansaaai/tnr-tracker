# 🗺️ TNR Tracker: Operational Roadmap

This roadmap outlines the technical and feature evolution of the TNR Tracker platform. Our vision is to scale from a robust prototype to a fully featured, mobile-friendly operational tool for local feral cat management organizations and community volunteers.

---

## 🏗️ Phase 1: MVP Hardening & Security (Months 1-3)

### Security & Access Control
- [x] **Row Level Security (RLS) Hardening**
  - Implement granular policies on `traps`, `recoveries`, and `medications` tables restricting write access to only the assigned user/creator or admins.
  - Set up audit logs for volunteer status updates to monitor database mutations.
- [x] **Frontend Performance Optimization**
  - Implement Code Splitting using `React.lazy()` and Suspense for heavy views (`NetworkGraph.jsx` and `MapPage.jsx`).
  - Optimize Supabase CDC realtime listener payloads to prevent unnecessary state duplication.
- [x] **Database Indexing**
  - Add indexes to `cats.colony_id` and `traps.colony_id` to speed up relation queries.

### Core UX/UI Refinements
- [x] **Mobile-Friendly Fallbacks**
  - Replace the heavy force-directed graph canvas on viewports < 768px with a clean colony card roster and a toggleable full-screen overlay mode.
- [ ] **Map Clustering & Performance**
  - Integrate marker clustering (`react-leaflet-cluster`) to group markers at low zoom levels.
  - Implement bounds-based data loading to only fetch markers within the active viewport.

---

## 📱 Phase 2: Offline Capabilities & Mobile Experience (Months 4-6)

### Offline-First Support
- [ ] **Service Workers & PWA**
  - Configure Vite PWA plugin to turn TNR Tracker into a Progressive Web App.
  - Cache static assets and key API payloads to allow viewing the colony map and cat roster offline in areas with poor cellular reception.
- [ ] **Offline Data Entry**
  - Queue mutations (adding a cat, changing trap status) locally using IndexedDB when offline.
  - Automatically sync queued updates to the remote Supabase database once network connectivity is restored.

### Trapping Logistics
- [ ] **Volunteer Scheduling**
  - Create a calendar interface for scheduling trapping shifts and recovery ward duties.
  - Integrate standard ICS feeds so volunteers can sync their shifts with Google Calendar or Apple Calendar.
- [ ] **Multi-Colony Route Planning**
  - Extend the TSP routing heuristic on the map to support multi-vehicle routing for coordinate trapping runs.

---

## 🏥 Phase 3: Clinic & Recovery Integrations (Months 7-12)

### Medical Ward Workflow
- [x] **Medication Tracking**
  - Add specific dosages, times, and administrator logging for recovery medications.
  - Implement visual notifications and alert logs when a cat's 48-hour recovery hold time is completed.
- [ ] **Veterinary Export Upgrades**
  - Expand the Vet Export feature to support customized CSV and PDF generation conforming to regional clinic intake templates.

### Data Portability
- [x] **Municipal Grant Reporting Tools**
  - Build quarterly reporting engines with estimated funding calculations to compile municipal grant application summaries.
- [ ] **Advanced Importing**
  - Allow bulk import of colony metadata and cat history via Excel/CSV spreadsheets to help organizations migrate from legacy tracking methods.
