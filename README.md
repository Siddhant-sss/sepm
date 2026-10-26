# Military Management System (MMS) — Tactical Command Center

A modern, responsive, defensive preparedness and joint operational resource management application designed with a military woodland command aesthetic.

Built according to strict tactical command standards, data verification protocols, and role-based access control (RBAC).

---

## 1. Official Color Palette & Design System

Defined as design tokens and CSS variables adhering to the military specifications:

| Token | Hex Code | Role in Application |
|---|---|---|
| **Military Forest Green** | `#26382A` | Primary branding, sidebar, main navigation, major interface accents |
| **Olive Drab** | `#414B32` | Primary action buttons, selected items, tactical controls |
| **Field Olive** | `#747653` | Supporting visual elements, secondary highlights |
| **Desert Khaki** | `#B7AA83` | Decorative accents, category tags, geographic identifiers |
| **Sandstone** | `#D9D2B8` | Light surfaces and secondary labels |
| **Command Black** | `#151A17` | Main dark-mode background |
| **Pale Tactical Grey** | `#E8EBDD` | Main high-contrast typography, metrics, headers |
| **Status Operational** | `#48C774` | Success / Active / Combat Serviceable / Adequate |
| **Status Warning** | `#F2B84B` | Attention Required / Caution / Restricted / Reorder |
| **Status Critical** | `#FF6464` | Emergency / Fatal / Missing / Shortage / Blocked |
| **Status Information** | `#62B7E8` | Pending Review / Unverified / Hospitalized / In-Transit |

---

## 2. Implemented Modules

1. **Central Command Dashboard (Module 4)**
   - High-contrast KPI cards (Active, Injured, Hospitalized, Missing/Deceased, Supply Shortages, Equipment Needing Maintenance, Active Met Hazards)
   - Unit-level scope filtering (1st Recon, 4th Mechanized, 8th Support, 12th Aviation)
   - Strategic supply reserve meters with calculated burn duration
   - Medical facility bed and ICU capacity gauges
   - Real-time immutable audit feed and immediate operational action drawer
   - Unverified casualty review notice

2. **Soldier Status & Casualty Management (Module 1)**
   - Personnel directory with service ID, military rank, assigned role, blood type, and status
   - Confirmed vs Unverified casualty triage reporting with automated service member status updates
   - Medical evacuation (Medevac) transport requests and hospital delivery routing
   - Return-to-duty evaluation workflow (strictly restricted to certified Medical Officers)
   - Role-protected Next-of-Kin (NOK) emergency contact records
   - Conflicting / duplicate casualty report detection engine

3. **Weapons & Ammunition Inventory (Module 2)**
   - Serialized small arms and heavy command launch unit (CLU) registry
   - Ammunition lot inspection and expiration countdowns
   - Authorized custodial issue and return sign-out workflow
   - Discrepancy flagging and lot quarantine isolation
   - Physical armory reconciliation audit runner

4. **Geographic Intelligence & Strategic Planning (Module 3)**
   - Interactive Leaflet tactical map with CartoDB Dark Matter styling
   - Layer toggles for military bases, transit bridges, medical facilities, depots, and flood inundation buffer zones
   - Strategic Disruption Simulator (Normal vs Bridge Bravo Flood Closure vs Mountain Pass Landslide)
   - Route accessibility and delay calculation (+4.2 hours detour impact)
   - Infrastructure risk profile and elevation data

5. **Logistics & Supply Chain Management (Module 5)**
   - Supply classes for Rations (MRE), Potable Water, JP-8 Fuel, Diesel, Trauma Kits, Batteries
   - Linear burn rate model calculating Days of Supply remaining
   - Automated reorder thresholds and supply requisition modal
   - Expiry date monitoring for perishable rations and medical fluids

6. **Medical & Emergency Management (Module 6)**
   - Healthcare facility directory across Role 1 (Aid Station), Role 2 (Forward Surgical), and Role 3 (Field Hospital)
   - Real-time bed occupancy, ICU beds, and active surgical theater metrics
   - Universal O-Negative blood bank inventory and cold-chain courier dispatch workflow
   - Mass-casualty Emergency Surge protocol declaration

7. **Equipment Maintenance & Readiness (Module 7)**
   - Fleet asset registry (JLTV, FMTV, AMMPS Generators, SatCom Terminals, Radar)
   - Multi-stage repair ticket pipeline: *Reported → Diagnosis → In Repair → Testing → Awaiting Sign-off → Closed*
   - **Enforced Serviceability Verification:** Assets cannot automatically return to "Serviceable" status without recorded technical verification by an authorized Maintenance Officer.

8. **Training & Personnel Readiness (Module 8)**
   - Course catalogue (TCCC Tier 3, CBRN Refresher, Marksmanship Qual, UAS Drone Ops)
   - Unit qualification percentage tracker and 30-day expiration warnings
   - Course enrollment modal linked to active personnel roster

9. **Weather & Environmental Telemetry (Module 9)**
   - Multi-station weather readings (Airfield Base, Falcon Ridge, Bridge Basin)
   - Aviation flight rules assessment (VFR / MVFR / IFR)
   - Heavy ground vehicle mobility index (GO / SLOW / NO-GO)
   - Severe weather bulletins (High wind shear, flash flood emergency)

10. **Security & Access Control (Module 10)**
    - Role-Based Access Control (RBAC) matrix for 8 distinct military roles:
      1. *System Administrator*
      2. *Command Supervisor*
      3. *Personnel Officer*
      4. *Medical Officer*
      5. *Logistics Officer*
      6. *Maintenance Officer*
      7. *Training Officer*
      8. *Read-Only Auditor*
    - Top bar quick role switcher to test and observe authorization enforcement live
    - Intrusion & suspicious access detection engine
    - Cryptographic SHA-256 data integrity check runner
    - Hardened AES-256 backup snapshot generator
    - Filterable immutable audit trail

11. **Reports & Analytics (Section 16)**
    - Standardized report templates: Daily Situation Report (SITREP), Personnel Readiness, Logistics Burn, Asset Serviceability, Security Audit
    - Print-friendly layout (`@media print` formatted)
    - One-click CSV export for all authorized datasets

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v3, Lucide Icons, Leaflet
- **Backend:** Node.js, Express, REST APIs, Server-side RBAC middleware, JSON persistence
- **Testing:** Node.js native test runner (`node --test`)
- **Fonts:** Inter & JetBrains Mono

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
npm install
```

### Run Frontend Development Server
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

### Run Backend REST Server
```bash
npm run server
```
Backend runs on `http://localhost:3001` with API routes under `/api/*`.

### Run Automated Unit Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```
Generates production-optimized bundle in `dist/`.
