# Pune Metropolitan Spatial GIS & Ward Analytics Platform (React + TypeScript)

An interactive, high-performance GIS analytics web platform built with **React 18**, **TypeScript**, **Vite**, and **Leaflet** for exploring Pune & Pimpri-Chinchwad municipal wards, public transit (GTFS stops & routes), and road networks on an interactive map.

---

## 🚀 Quick Start (Development & Production)

### 1. Development Mode (with Instant Hot Reload)
Run the Vite development server:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 2. Production Build & Preview
To build an optimized production bundle:
```bash
npm run build
npm run preview
```

---

## 🗺️ Datasets Mapped (Exactly 73 Metropolitan Wards)

1. **Municipal Wards (`Full_Pune_1 (1).geojson` / `Full_Pune_73_Wards.geojson`)**:
   - **73 Wards in Total**:
     - **Pune Municipal Corporation (PMC)**: **41 Wards** (Wards 1 through 41 from the official PMC 2025 boundary dataset).
     - **Pimpri Chinchwad Municipal Corporation (PCMC)**: **32 Wards** (Wards 1 through 32 with comprehensive micro-climate and heat vulnerability data).
2. **Bus Stops (`GTFS.geojson`)**:
   - **3,407 transit stops** rendered with high-speed circle markers, stop IDs, stop names, and geographic coordinates.
3. **Bus Routes (`GTFSRoutes.geojson`)**:
   - **555 transit line corridors** with route identifiers, lengths, and hover highlights.
4. **Metro Layer (`Metro.geojson`)**:
   - Metro alignment and administrative boundary zones.
5. **Road Infrastructure (`PuneRoads_Major.geojson` & `PuneRoadNetwork.geojson`)**:
   - **Major Arterial Roads** (6,136 highways, trunk roads, primary and secondary corridors) loaded smoothly by default.
   - **Full Local Road Network** (75,359 roads including all residential streets) available via on-demand toggle.

---

## 🎨 UI Architecture & Metaphor

- **Attached Layout**:
  - Pinned header flush to the top edge (no floating gap).
  - Docked sidebar attached flush to the left edge directly under the header with smooth collapse/expand toggle.
- **"MIND THE MAP" Animated Typography**:
  - Prominent 24px bold tech display typography.
  - **Animates ONLY on hover**: completely static at rest with zero background timers or continuous loops.
  - Cascades letter-by-letter physics bounce when hovered.
- **Urban Gap Analysis Modal**:
  - Explores the **Climate Heat Vulnerability Gap**, **Transit Accessibility Gap**, and **Demographic Growth Gap** across the 73 wards.
