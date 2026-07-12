# TransitOps — Fleet Operations Dashboard
## Visual Rebuild Specification (Designer Handoff)

**Purpose:** Reconstruct the Fleet Operations Dashboard (Overview page) 1:1 from the reference
screenshots. Every component, exact label, sample value, and state is catalogued below.
**Screen:** Desktop, ~1440–1600px content width, light theme.
**Font:** Outfit. **Primary accent:** `#2563EB`. **Canvas:** `#F8FAFC`. **Cards:** white, radius ~18px, hairline border `#E2E8F0`, soft shadow.

---

## LAYOUT MAP (top → bottom)

```
① TOP NAV BAR (sticky)
② PAGE HEADER  (title + telemetry lock + Refresh)
③ FILTERS BAR
④ KPI GRID  (7 stat cards, 4-col row + 3-col row)
⑤ CHARTS ROW  →  [ Fleet Utilization Trend (2/3) ] [ Vehicle Status donut (1/3) ]
⑥ LIVE TRIP MONITOR  →  [ Map (2/3) ] [ Trip Details (1/3) ]
⑦ BOTTOM GRID  →  [ Operations Overview table (2/3) ] [ Fleet Health Panel (1/3) ]
⑧ Floating AI Assistant button (bottom-right, all screens)
```

---

## ① TOP NAV BAR

Sticky, white, full width, hairline bottom border. Left → right:

| Element | Content / State |
|---------|-----------------|
| **Location switcher** | Globe icon + **"NE Fleet Hub"** + chevron ▾ (pill, hairline border) |
| **Global search** | Pill input, magnifier icon, placeholder *"Search vehicles, routes, drivers, cargos…"* (wide, ~40% of bar) |
| **Live clock** | Clock icon + **"13:24:33"** · divider · **"SUN 12 JUL"** (pill) |
| **Weather** | Sun icon + **"Sunny, 74°F"** (pill) |
| **Add button** | Solid `#2563EB` circle, white **"+"** |
| **Notifications** | Bell icon, ghost circle button |
| **User chip** | **"Piyush Sharma"** (bold) + **"Fleet Manager"** role badge (blue pill) + avatar icon |

---

## ② PAGE HEADER

- **H1:** "Fleet Operations Dashboard" (extrabold, near-black `#0F172A`)
- **Subtitle:** "Monitor fleet performance, dispatch activities, maintenance, and operational health in real time." (small, slate)
- **Right cluster:**
  - Eyebrow (caps, slate-400): **"TELEMETRY LOCK"**
  - Mono text: **"Last synced: 13:23:50"**
  - **Refresh Data** button — solid `#2563EB`, white text, circular-arrows icon (spins while loading), radius ~12px
- Divider hairline under the header.

---

## ③ FILTERS BAR

White card, one row. Funnel icon + **"Filters"** label · vertical divider · then 4 dropdown pills:

1. **All Types** ▾
2. **All Statuses** ▾
3. **All Regions** ▾
4. **All Drivers** ▾

Each = hairline-bordered pill, label + chevron, ~180px wide, evenly spaced.

---

## ④ KPI GRID — 7 stat cards

**Row 1 (4 cards), Row 2 (3 cards).** Card anatomy: white, radius ~18px, 24px padding. Top-left
**rounded-square icon tile** (tinted). Top-right **delta chip** (▲ green / ▼ red, soft pill).
Big **number** (extrabold, ~40px). **Label** (caps, slate). **Sub-label** (small slate).
Most cards show a **mini line sparkline** bottom-right; the last shows a **radial ring**.

| # | Icon (tile color) | Value | Label | Sub-label | Delta | Sparkline |
|---|-------------------|-------|-------|-----------|-------|-----------|
| 1 | Truck (blue tint) | **121** | ACTIVE VEHICLES | Currently operational | **▲ +8%** green | blue line ↗ |
| 2 | Check-circle (green tint) | **78** | AVAILABLE VEHICLES | Ready for dispatch | **▲ +3%** green | green line ↗ |
| 3 | Wrench (red tint) | **14** | VEHICLES IN MAINTENANCE | Service ongoing | **▼ −2%** red | red line ↘ |
| 4 | Route/nodes (blue tint) | **42** | ACTIVE TRIPS | Currently dispatched | **▲ +11%** green | blue line ↗ |
| 5 | Clock (amber tint) | **13** | PENDING TRIPS | Awaiting dispatch | — | amber zig-zag line |
| 6 | Users (blue tint) | **65** | DRIVERS ON DUTY | Currently driving | **▲ +6%** green | blue line ↗ |
| 7 | Trend-up (blue tint) | **84%** | FLEET UTILIZATION | Asset utilization index | — | **blue radial ring @ 84%** |

> **Selected/emphasis state:** Card 4 (Active Trips) is shown with a **blue focus outline** — use this as the "active/highlighted KPI" treatment.

---

## ⑤ CHARTS ROW

### ⑤a — Fleet Utilization Trend  (left, ~2/3 width)
- **Header:** bar-chart icon + **"Fleet Utilization Trend"** (bold) / sub *"Real-time daily resource activity"*.
- **Top-right controls:** segmented toggle **"7D | 30D | 3M"** (3M active = blue) · **download** icon button · **expand/fullscreen** icon button.
- **Chart:** smooth **area line**, `#2563EB` stroke with soft blue gradient fill fading to transparent.
- **Y-axis:** 50% → 100% (gridlines at 50/60/70/80/90/100, dotted, faint).
- **X-axis:** Apr · May · Jun. Data points marked with dots; sample curve rises ~76% → ~86%.

### ⑤b — Vehicle Status  (right, ~1/3 width)
- **Header:** pie icon + **"Vehicle Status"** / sub *"Distribution of fleet assets"*.
- **Donut chart** with center label: **"TOTAL FLEET" / 162 / "100% Active"** (162 bold, "100% Active" in blue).
- **Segments + legend (2×2 grid, colored dots):**
  - 🟢 **Available** — 98 Vehicles (55%)
  - 🔵 **On Trip** — 42 Vehicles (30%)
  - 🔴 **In Shop** — 17 Vehicles (12%)
  - ⚫ **Retired** — 5 Vehicles (3%)

---

## ⑥ LIVE TRIP MONITOR

- **Header:** compass icon + **"Live Trip Monitor"** / sub *"Real-time dispatch tracking and telemetry"*.
- **Top-right trip tabs:** **TR-8802 · TR-9114 (active, blue outline) · TR-7761** (pill toggle).

### ⑥a — Map panel (left, ~2/3)
- **Dark navy** rounded panel (`#0A0F1E`-ish), faint grid lines + compass rose watermark (top-left).
- **Route:** dashed blue polyline connecting waypoints; **green dot = origin**, **amber/orange dot = current position**, small **blue dot = destination**; several muted gray waypoint dots scattered.

### ⑥b — Trip Details card (right, ~1/3)
- Header row: **"TRIP DETAILS"** (caps) + **"⚠ Delayed"** status badge (amber, soft).
- **Origin Hub:** blue pin — **"Chicago Depot (CHI-3)"**
- **Destination Hub:** green pin — **"Minneapolis Terminal (MSP-2)"**
- 2×2 meta grid (caps label + bold value):
  - **CARGO PAYLOAD:** Consumer Electronics
  - **GPS ETA LOCK:** ⏱ 3.8 Hours
  - **ACTIVE DRIVER:** Sarah Davis
  - **DIST. REMAINING:** 215 miles
- **CTA button (full-width, ghost/outline):** ⓘ **"Open Command Terminal"**

---

## ⑦ BOTTOM GRID

### ⑦a — Operations Overview  (left, ~2/3) — DATA TABLE
- **Header:** **"Operations Overview"** (bold) / sub *"Real-time status of dispatch activities"* · right pill **"Showing 6 Active Records"**.
- **Columns (caps, slate):** VEHICLE · DRIVER · CURRENT ROUTE · STATUS · CARGO · ETA · HEALTH
- Row anatomy: vehicle **name + reg # (bold)** with **type sub-label**; driver = **initials avatar** + name; status = **soft pill w/ dot**; health = **heart icon + %** (green ≥80, red when low).

| Vehicle | Type | Driver | Route | Status | Cargo | ETA | Health |
|---------|------|--------|-------|--------|-------|-----|--------|
| Volvo VNL 860 (#TRK-892) | Semi-Truck | RJ · Robert Johnson | BOS-Hub → JFK-NY | ● On Trip (blue) | Medical Equip… | 1.2 Hours | 💚 94% |
| Freightliner Cascadia (#TRK-201) | Semi-Truck | SD · Sarah Davis | CHI-Depot → MSP-Terminal | Delayed (amber) | Consumer Elec… | 3.8 Hours | 💚 88% |
| Peterbilt 579 (#TRK-544) | Semi-Truck | JD · John Doe | HOU-Freight → DAL-Distribution | ● On Trip (blue) | Automotive Pa… | 0.4 Hours | 💚 97% |
| Ford Transit Cargo (#TRK-109) | Delivery Van | JS · Jane Smith | LAX-Hub → SFO-Terminal | ● Available (green) | E-commerce P… | Ready | 💚 100% |
| Volvo VNL 860 (#TRK-704) | Semi-Truck | MM · Michael Miller | MIA-Depot → ATL-Hub | (In Shop) | N/A (Shop Rep…) | In Service | ❤️ 54% (red) |
| Chevrolet Express (#TRK-112) | Delivery Van | DW · David Wilson | SEA-Hub → PDX-Depot | ● Completed (gray) | Perishable Pro… | Completed | 💚 99% |

- Horizontal scroll indicator at bottom; cargo text truncates with ellipsis.

### ⑦b — Fleet Health Panel  (right, ~1/3) — 4 stacked cards
- **Header:** heart-pulse icon + **"Fleet Health Panel"** / sub *"Telemetry and compliance diagnostics"*.

**Card 1 — Scheduled Maintenance**
- Wrench icon + **"Scheduled Maintenance"** · right: **"12 / 17 Serviced"**
- Blue **progress bar** (~70%) · caption **"Progress: 70.5% completed"** · right link **"View Schedule ›"**

**Card 2 — License Expiry Alerts**
- Doc icon + **"License Expiry Alerts"**
- Row: **"Class A CDL (Sarah Davis)"** / sub *"Compliance renewal required"* — badge **"⚠ 3 Days Left"** (red)
- Row: **"IFTA Permit (Asset #TRK-892)"** / sub *"Quarterly taxation registry"* — badge **"14 Days Left"** (amber)

**Card 3 — Fuel Consumption Index**
- Fuel icon + **"Fuel Consumption Index"**
- Big value **"6.8 MPG"** · right caption **"Fleet Target: 7.5 MPG"**
- Blue **progress bar** · caption **"Average efficiency: 9.3% below optimization target"**

**Card 4 — High Cost Assets (MTD)**
- $ icon + **"High Cost Assets (MTD)"**
- Row: **"Volvo VNL (#TRK-892)"** — **$2,410.50** (red)
- Row: **"Peterbilt 579 (#TRK-544)"** — **$1,850.00**

---

## ⑧ FLOATING AI ASSISTANT
- Bottom-right, solid `#2563EB` circle, white robot/assistant icon. Persistent on every scroll position.

---

## COMPONENT & STYLE TOKENS (for rebuild)

**Cards:** white · radius 16–18px · border `#E2E8F0` · shadow `0 1px 3px rgba(16,24,40,.06)` · padding 24px.
**Status pills (soft):** tint bg + colored dot + text — On Trip `#2563EB` · Available `#22C55E` · Delayed `#D97706` · In Shop/Completed `#64748B`/red.
**Delta chips:** green `#22C55E` (▲) / red `#EF4444` (▼), soft tinted pill, arrow glyph.
**Numbers:** tabular, extrabold for KPIs, near-black `#0F172A`.
**Icon tiles:** 40px rounded square, 10–12% tint of the semantic color, icon in full color.
**Segmented toggles (7D/30D/3M):** pill group, active segment = white chip on light track / blue text.
**Progress bars:** track `#E2E8F0`, fill `#2563EB`, 6px height, rounded.
**Grid gap:** 24px between all cards. **Column split:** charts & bottom rows = 2fr / 1fr.

---

## STATES TO DELIVER (per component)
- **KPI cards:** default · highlighted (blue outline, see Active Trips) · loading (skeleton).
- **Table rows:** default · hover (`#F1F5F9`) · status variants (5) · low-health (red heart).
- **Trip Monitor:** tab switching (TR-8802 / TR-9114 / TR-7761) updates map + details.
- **Charts:** range toggle 7D/30D/3M · download · fullscreen.
- **Alerts:** critical (red, ≤3 days) vs warning (amber, ≤14 days).
- **Refresh:** idle vs syncing (spinner + "Last synced" timestamp update) + toast.

---

*This document catalogs the exact structure, copy, and values shown in the reference screenshots
so the dashboard can be rebuilt faithfully. Pair with FRONTEND_DESIGN_SPEC.md (v2.0) for the
premium design-system rules.*
