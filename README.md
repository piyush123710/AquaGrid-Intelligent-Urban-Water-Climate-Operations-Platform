# AquaGrid — Intelligent Urban Water & Climate Operations Platform
> **Tagline:** *Detect. Respond. Save Every Drop.*  
> **Track:** *Heat & Water*  
> **Target Audience:** Municipal Corporations, Smart Cities, Hospital Networks, Industrial Parks, University Campuses & Large Facility Operators.

---

## 🌊 Overview

**AquaGrid** is an enterprise-grade water infrastructure intelligence and field operations platform. Instead of a basic complaint tracker, AquaGrid functions as an integrated **GIS Spatial Dashboard + ServiceNow-style Incident Management + AI Operations Platform**.

Urban water loss, thermal pipe ruptures, and localized shortages are traditionally fragmented across disconnected departments. AquaGrid unifies the complete operational lifecycle:

$$\text{Detect} \longrightarrow \text{Understand} \longrightarrow \text{Prioritize} \longrightarrow \text{Assign} \longrightarrow \text{Resolve} \longrightarrow \text{Verify} \longrightarrow \text{Measure} \longrightarrow \text{Predict}$$

---

## 🚀 Key Features

### 1. 🗺️ Live GIS Water Infrastructure Map (Leaflet & OpenStreetMap)
- Dark-mode cartographic tile styling with spatial clustering.
- Colored real-time incident pins:
  - 🔴 **Critical** (&gt;80 priority index)
  - 🟠 **High** (60–79)
  - 🟡 **Medium** (40–59)
  - 🟢 **Resolved / Safe**
- Multi-dimensional filters by Category, Severity, Status, and Zone.
- Interactive popups showing estimated daily water loss, affected population, and direct triage links.

### 2. 🤖 AI Incident Intelligence & Multimodal Triage
- Converts unstructured natural language reports and photos into structured engineering incidents.
- Predicts:
  - **Category:** Pipeline Leak, Water Shortage, Flooding, Contamination, Drainage, Tank Overflow, Infrastructure Damage.
  - **Severity:** Critical, High, Medium, Low.
  - **AI Confidence Score:** 85%–96%.
  - **Critical Infrastructure Impact:** Healthcare trauma centers, public schools, transit hubs.
  - **Estimated Water Loss:** Flow velocity in L/min & daily depletion in L/day.
- Powered by Google Gemini (`gemini-3.8-flash`) server-side proxy with intelligent deterministic fallback.

### 3. 🚨 Transparent Priority Scoring Engine (0–100 Score)
A multi-factor scoring model that shows its exact internal math:
- **Severity Factor:** Up to 30 pts
- **Affected Population Density:** Up to 25 pts
- **Duration Factor:** Up to 20 pts
- **Critical Facility Proximity (Hospital / School / Hub):** Up to 20 pts
- **Water Depletion Volume:** Up to 5 pts
- **Classification:** 80–100 (Critical), 60–79 (High), 40–59 (Medium), 0–39 (Low).

### 4. 👷 Field Worker Operations & Interactive Repair Workflow
- Mobile-first field engineer interface for rapid response units (e.g. Field Team 7).
- Step-by-step interactive resolution workflow:
  1. **Accept Assignment & Mobilize Crew**
  2. **GPS Navigation to Rupture Coordinates**
  3. **Inspect & Upload Before-Repair Photo** (supports camera/disk file upload)
  4. **Execute Repair & Upload After-Repair Photo** (clamp bolting & trench backfill)
  5. **Trigger AI Vision Repair Verification**
  6. **Submit Resolution:** Updates municipal savings in real-time.

### 5. 🔀 Interactive Before vs. After Visual Comparison Slider
- Draggable split-screen reveal slider embedded in incident detail modals and worker resolution cards.
- Directly contrasts the active pipe burst against the completed stainless steel clamp repair.
- Overlaid with the AI Vision Verification confidence score.

### 6. ⚡ SCADA Digital Twin & Emergency Valve Controller
- Virtual hydraulic twin of the municipal feeder main (PIPE-102).
- Real-time simulated telemetry:
  - **Pressure Gauge:** 6.8 bar (Surge alert)
  - **Flow Velocity Meter:** 14.2 L/min
  - **Acoustic Sensor Node SN-14:** 240 Hz leak hiss signature
  - **Soil Saturation:** 96%
- **Interactive Valve V-14 Actuator:** 1-click emergency shutoff throttles pressure to 1.9 bar and drops active loss to 0 L/min.

### 7. 🚒 Emergency Potable Water Tanker Fleet Dispatch
- Fleet tracking across municipal sectors during pipeline isolation or drought heatwaves.
- Real-time tanker status: `EN_ROUTE`, `DISPENSING`, `AVAILABLE`, `REFILLING`.
- 1-click emergency dispatch order modal with custom volume allocation (8,000L to 15,000L).

### 8. ☀️ Climate & Water Risk Engine (Heatwave Stress)
- Synchronized with urban weather telemetry (temperature 38.5°C, heat index 43.2°C, heatwave advisory).
- Sector-by-sector vulnerability matrix calculating **Heat Risk**, **Water Availability Risk**, and **Overall Vulnerability Score**.

### 9. 📊 Analytics & Recharts Data Visualization
- Weekly incident volume trend (Reported vs. Resolved).
- Water loss & savings by municipal zone (expressed in kiloLiters).
- Category distribution breakdown.
- Top active water loss hotspots table.

### 10. 🎙️ Multilingual Voice Reporting Simulation
- Transcribes natural language English reports.
- Transcribes natural language Hindi complaints (*"Pani 3 din se nahi aa raha aur paas ke hospital aur school ko bhi severe water problem hai"*).

### 11. 🏢 Multi-Tenant Data Isolation
- Seamless organization tenant switcher:
  - *Metropolitan Urban Water & Sewerage Board* (Municipality)
  - *Apollo & City Health Sciences Hospital Network* (Hospital Network)
  - *Apex Industrial Park & SEZ Authority* (Industrial Park)

### 12. 📜 Immutable Governance & Audit Logs
- Chronological audit logging tracking actor, action, entity, timestamp, old state, and new state.

---

## 🎬 6-Step Guided Hackathon Demo Tour

At the top of the application, click any step on the **Interactive Demo Walkthrough Bar** to simulate the complete end-to-end lifecycle in seconds:

1. **Step 1:** Citizen reports pipeline leak near hospital (`AQ-1024`).
2. **Step 2:** AI identifies leak & calculates Critical **94/100** Priority.
3. **Step 3:** Incident appears on GIS Map & Admin assigns Field Team 7.
4. **Step 4:** Worker arrives on site & logs Before photo.
5. **Step 5:** Worker bolts clamp & logs After photo.
6. **Step 6:** AI verifies resolution & **18,000 L/day** is credited to municipal water savings!

---

## 🔑 Demo Credentials

Use the **1-Click Demo Login** shortcuts in the header profile menu or enter:

| Role | Email | Password | Primary Interface |
|---|---|---|---|
| **Chief Admin** | `admin@aquagrid.demo` | `AquaGrid#2026` | Command Center, Live GIS Map, Asset Telemetry |
| **Field Worker** | `worker@aquagrid.demo` | `AquaGrid#2026` | Mobile Worker App, Photo Upload, Repair Workflow |
| **Citizen Reporter** | `citizen@aquagrid.demo` | `AquaGrid#2026` | Citizen Report Form, Voice Input, Report Tracker |

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion
- **Maps:** Leaflet & OpenStreetMap with custom dark cartography
- **Charts:** Recharts
- **Icons:** Lucide React
- **Full-Stack Backend:** Node.js, Express (`server.ts`) with Vite dev middleware
- **AI Engine:** Google Gemini API (`@google/genai`, model `gemini-3.8-flash`) with deterministic rule-based fallback
- **State Management:** Reactive local store (`localStorage`) with multi-tenant data isolation and instant demo state reset

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Create or check `.env`:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=3000
```
*(If no API key is set, AquaGrid automatically uses its built-in deterministic NLP & computer vision engine)*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📄 License
AquaGrid is developed as an open source enterprise water and climate operations prototype.
Licensed under the [Apache 2.0 License](LICENSE).
