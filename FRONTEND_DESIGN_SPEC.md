# TransitOps — Frontend Design System & Specification
### Premium SaaS Design Language · v2.0 (Senior Designer Handoff)

**Product:** TransitOps — Smart Transport Operations Platform
**Repository:** `FleetFlow`
**Design register:** Apple-grade clarity · Stripe-grade precision · Linear-grade density
**Stack:** React 19 · TypeScript · Vite · Tailwind v4 · framer-motion · lucide-react
**Date:** 2026-07-12

---

## 0. Design Philosophy — "Quiet Confidence"

A million-dollar product does not shout. It earns trust through **restraint, precision, and
inevitability**. Every screen should feel like it could not have been arranged any other way.

**Seven principles (non-negotiable):**

1. **Neutrals do the work, one accent does the talking.** 95% of the UI is ink, paper, and
   graphite. Blue appears only where the user must act or look. Color = meaning, never decoration.
2. **Type is the interface.** Hierarchy comes from weight, size, and spacing — not boxes and
   lines. Borders are a last resort; whitespace is the primary divider.
3. **Depth is a whisper.** Elevation via layered, low-opacity shadows and hairline borders —
   never drop-shadows you can point at. Glass is used sparingly, as a moment, not a texture.
4. **Motion explains, never entertains.** Physics-based, sub-250ms, purposeful. If a user
   notices the animation instead of the result, it failed.
5. **Density with air.** Show real operational data at Linear/Stripe density, but let it breathe
   on an 8pt grid. Alignment is sacred.
6. **The tap target is a promise.** Generous hit areas, obvious focus, keyboard-first, instant
   feedback (<100ms perceived).
7. **Details are the product.** Optical alignment, tabular numerals, consistent corner radii,
   perfect vertical rhythm. The 1px matters.

---

## 1. Foundations

### 1.1 Color System — Neutrals-first, semantic accent

> Evolves the current `index.css` tokens toward a restrained, Stripe/Linear-grade palette.
> Ink scale replaces flat black; a single blue accent + muted semantics.

**Ink / Neutral scale (the backbone — ~90% of pixels)**

| Token | Hex | Usage |
|-------|-----|-------|
| `ink-950` | `#0A0F1E` | Primary headings, highest-contrast text |
| `ink-800` | `#1E293B` | Body headings |
| `ink-600` | `#475569` | Body text |
| `ink-400` | `#94A3B8` | Secondary/meta text, placeholders |
| `ink-200` | `#E2E8F0` | Hairline borders, dividers |
| `ink-100` | `#F1F5F9` | Row hover, subtle fills |
| `paper` | `#FFFFFF` | Cards, surfaces |
| `canvas` | `#FBFCFD` | App background (warmer, softer than pure gray) |

**Accent (used sparingly — action & focus only)**

| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#2563EB` | Primary CTA, active nav, focus ring, key data |
| `accent-hover` | `#1D4ED8` | Pressed/hover |
| `accent-tint` | `#EFF4FF` | Selected-row wash, badge fill (very low sat) |

**Semantic (muted, never neon)**

| Token | Hex | Meaning |
|-------|-----|---------|
| `positive` | `#059669` | Available · Completed · Valid |
| `warning` | `#D97706` | Delayed · Expiring soon |
| `critical` | `#DC2626` | In Shop · Expired · Suspended · Errors |
| `neutral` | `#64748B` | Retired · Off Duty · Draft |

**Status pill treatment (premium):** *soft* — tinted background at ~8% opacity + solid text +
a 6px status dot. No loud saturated fills. E.g. On Trip = `accent-tint` bg / `accent` dot & text.

**Dark mode (first-class, not a toggle afterthought):** invert on an ink-blue base
(`#0A0F1E` canvas, `#111827` surface, `#1F2937` elevated), text `#E5E9F0`, borders at 8% white.
Accent brightens to `#3B82F6`. Shadows become subtle inner-glows/hairlines.

### 1.2 Typography — one family, tight system

- **Primary:** `Inter` or `Outfit` (keep `Outfit`), `-feature-settings: "cv11","ss01"`,
  `text-rendering: optimizeLegibility`, antialiased.
- **Numerals:** **tabular-nums** everywhere numbers align (tables, KPIs, currency).
- **Optional mono:** `Geist Mono` / `JetBrains Mono` for IDs, reg #s, license #s.

**Type scale (rem · weight · tracking · line-height):**

| Role | Size | Weight | Tracking | LH |
|------|------|--------|----------|-----|
| Display | 40 / 2.5rem | 700 | −0.02em | 1.1 |
| H1 | 30 / 1.875rem | 700 | −0.02em | 1.15 |
| H2 | 22 / 1.375rem | 600 | −0.01em | 1.2 |
| H3 | 18 / 1.125rem | 600 | −0.01em | 1.3 |
| Body-L | 16 / 1rem | 400 | 0 | 1.5 |
| Body | 14 / 0.875rem | 400 | 0 | 1.5 |
| Label | 13 / 0.8125rem | 500 | 0 | 1.4 |
| Caption / Eyebrow | 11–12 | 600 | 0.06em (UPPERCASE) | 1.3 |

Rule: **never more than 3 type sizes visible in one component.**

### 1.3 Spacing & Grid — strict 8pt (with 4pt half-steps)

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`. Section rhythm = 32/48. Card padding = 24.
Content max-width for reading blocks = 1200px; dashboard is fluid within gutters of 24–32.

### 1.4 Radius, Border, Elevation

- **Radius scale:** `sm 8 · md 12 · lg 16 · xl 20 · pill 999`. Cards = `lg (16)`. Inputs = `md`.
- **Borders:** hairline `1px ink-200` (light) / `1px rgba(255,255,255,.08)` (dark). Prefer border
  **or** shadow, rarely both.
- **Elevation (layered, low-opacity — the Stripe look):**
  - `e0` flat: none (rely on border).
  - `e1` card: `0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)`.
  - `e2` raised/hover: `0 4px 12px rgba(16,24,40,.08)`.
  - `e3` modal/popover: `0 12px 32px rgba(16,24,40,.12), 0 2px 8px rgba(16,24,40,.08)`.
  - Focus ring: `0 0 0 3px rgba(37,99,235,.16)` + `accent` border.

### 1.5 Motion — spring physics, purposeful

- **Curves:** standard `cubic-bezier(.2,.8,.2,1)`; framer spring `{ stiffness: 260, damping: 30 }`.
- **Durations:** micro 120ms · standard 200ms · overlay 240ms. Nothing over 300ms.
- **Patterns:**
  - Page/section enter: `opacity 0→1` + `y 8→0`, staggered children (40ms).
  - Cards/rows hover: `y −2`, shadow `e1→e2`, 160ms.
  - Modals: scale `0.98→1` + fade, backdrop blur-in.
  - Numbers: **count-up** on KPI mount; charts draw-in.
  - Errors: 3px lateral shake, single pulse — not a wobble.
- **Accessibility:** honor `prefers-reduced-motion` → replace transforms with instant fades.

### 1.6 Iconography & Imagery

- `lucide-react`, **1.5px stroke** (thinner = more premium), 20px default / 16px inline.
- Two-tone allowed only for KPI glyphs (accent + tint). No emoji, no clip-art.
- Empty-state art: minimal line illustration, single accent, lots of negative space.

### 1.7 Data Visualization

- Monochrome-blue sequential + one warm for comparison; **no rainbow**.
- Thin lines (1.5px), soft area gradients (accent → transparent), no gridline clutter (dotted,
  10% opacity). Tooltips = `e3` card, tabular nums. Charts are muted until hovered.

---

## 2. Global Shell (premium chrome)

### 2.1 Sidebar (`Sidebar.tsx`)
- 264px expanded / 72px rail. `canvas`-tinted, hairline right border, **no heavy fills**.
- Nav item: 20px icon + label, 40px height, `md` radius. **Active** = `accent-tint` wash +
  `accent` text + 2px left accent bar (not a full blue block). Hover = `ink-100`.
- Collapsed rail: icon-only + hover tooltip (`e3`, 120ms).
- Footer: user chip (avatar, name, role) with subtle menu.

### 2.2 TopNav (`TopNav.tsx`)
- 64px, `paper`, hairline bottom border, sticky. Left: page title (H2) + breadcrumb caption.
- Center/right: **⌘K command palette** search (Linear-style), notification bell w/ count dot,
  theme toggle, avatar. Everything ghost-styled until hover.

### 2.3 Command Palette (⌘K) — *new, premium signal*
Global fuzzy search + actions ("Create trip", "Find vehicle TRK-892", "Go to Reports"). Modal
`e3`, keyboard-first, recent + suggested. This single feature reads as "serious software."

### 2.4 Filters (`FiltersPanel.tsx`)
Segmented controls + ghost dropdown chips (type · status · region). Selected chip = `accent-tint`.
Clear-all ghost link. Filters persist per view.

### 2.5 Forms & Modals (`AddEdit*`, `QuickActionModals`)
- Right-side **sheet** (480px) for create/edit — feels lighter than centered modals.
- Inputs: 44px, `md` radius, hairline border, `ink-400` placeholder, focus ring §1.4.
- Floating/inline label, helper text `caption`, inline validation with `critical` + shake.
- Primary CTA solid `accent`; secondary ghost; destructive `critical` text button.
- Optimistic save + subtle success check; toast bottom-center, auto-dismiss.

### 2.6 Data Table (the workhorse — Stripe-grade)
- Sticky header, `label`-caps column titles, `ink-400`. Rows 52px, hairline separators only.
- Hover = `ink-100`; selected = `accent-tint` + left accent bar. Zebra **off** (too busy).
- Tabular-num numeric columns, right-aligned. Status = soft pill. Row-end kebab actions on hover.
- Sort affordance in header; sticky first column on mobile; skeleton shimmer while loading.

### 2.7 System states
Skeletons (not spinners) for load; empty states with line art + one CTA; `AccessDenied` /
`NotFound404` centered, minimal, single accent action.

---

## 3. PAGE 1 — Landing (`App.tsx`)

**Register:** Apple product page meets Stripe hero. Calm, spacious, confident.

```
┌───────────────────────────────────────────┬───────────────────────────────┐
│ LEFT ~55% — Brand / narrative              │ RIGHT ~45% — Auth (Page 2)    │
│ canvas, faint dot-grid, one soft gradient  │ paper, e1, centered           │
│                                            │                               │
│ ◆ TransitOps            (mark, still)      │      Sign in                  │
│                                            │                               │
│ Display: "Run your fleet like             │                               │
│  a control tower."                         │                               │
│ Sub (Body-L, ink-600): one calm line.      │                               │
│                                            │                               │
│ — three quiet feature rows (icon+label),   │                               │
│   hairline separated, no cards:            │                               │
│   ▸ Vehicle intelligence                   │                               │
│   ▸ Dispatch & routing                     │                               │
│   ▸ Operational analytics                  │                               │
│                                            │                               │
│ ◦ SOC2 · JWT · RBAC   (caption, ink-400)   │                               │
└───────────────────────────────────────────┴───────────────────────────────┘
```

**Refinements vs v1:** drop the 3 heavy feature *cards* for **quiet feature rows** (icon + one
line, hairline dividers) — more Apple, less template. One soft radial gradient behind the logo,
extremely low opacity. Mark is **static** (no float) — stillness reads premium. Trust cues become
a single muted caption line, not pills.

---

## 4. PAGE 2 — Login (`LoginCard.tsx`)

**Register:** Stripe/Linear sign-in — minimal, precise, reassuring.

- Card: `paper`, `e1`, `lg` radius, 400px. Title H2 "Sign in", caption subline.
- **Email** + **Password** (show/hide ghost toggle), 44px inputs, focus ring, inline validation.
- Row: "Remember me" (custom switch) · "Forgot?" ghost link.
- **Primary CTA** full-width solid `accent`, label "Sign in", arrow appears on hover, 160ms.
- Demo hint in `caption ink-400`.

**Success flow — refined:** replace the 4-step spinner modal with an **inline progress on the
button** (label morphs: Signing in → Securing session → Redirecting) + a slim top progress bar.
Sub-2s, no full-screen takeover. Success = brief check, then cross-fade to dashboard.
*(Keep the ShieldCheck spinner only as fallback.)*

**Error:** field-level `critical` message + single shake pulse; never a red banner shout.

---

## 5. PAGE 3 — Dashboard / Command Center

**Register:** Linear + Stripe dashboard. Information-dense, perfectly aligned, calm.

```
┌────────┬──────────────────────────────────────────────────────────────┐
│Sidebar │ TopNav · ⌘K · bell · theme · avatar                          │
│        ├──────────────────────────────────────────────────────────────┤
│        │ Eyebrow: OVERVIEW    H1: Good morning, Piyush   [Filters]     │
│        ├──────────────────────────────────────────────────────────────┤
│        │ KPI ROW — 7 tiles (tabular nums, count-up, sparkline)         │
│        ├───────────────────────────────────┬──────────────────────────┤
│        │ Fleet performance (area chart)     │ Fleet health (radial)    │
│        ├───────────────────────────────────┼──────────────────────────┤
│        │ Live operations map                │ Activity (timeline)      │
│        ├───────────────────────────────────┴──────────────────────────┤
│        │ Active trips — data table                                     │
│        └──────────────────────────────────────────────────────────────┘
```

**KPI tile (`KpiGrid.tsx`) — premium spec:** `paper`, `e1`, 24px pad. Top row: two-tone glyph +
eyebrow label. Big **tabular** number (H1, count-up). Delta chip (`positive`/`critical` soft) +
"vs last week" caption. Tiny inline **sparkline** (accent, 1.5px). Seven KPIs: Active Vehicles ·
Available · In Maintenance · Active Trips · Pending Trips · Drivers On Duty · **Fleet Utilization %**.

**Widgets:** performance area-chart (gradient fill, muted until hover); Fleet Health radial (single
accent arc, big center %); Live map (subtle basemap, `accent` route pulses); Activity timeline
(dot rail, `label` titles, `caption` time, semantic dots); Active-trips table (§2.6).

**AI assistant:** ghost floating button → slide-in sheet (`e3`), not a bubble. Feels like a
copilot, not a widget.

---

## 6. PAGE 4 — Vehicle Registry (`VehicleRegistry.tsx`)

- Header: H1 "Vehicles" + count caption · Filters · **Register vehicle** CTA (solid accent).
- **Data table (§2.6):** Reg # (mono) · Model · Type · Capacity · Odometer · Acquisition ($) ·
  **Status** soft pill · Health (thin bar) · Driver · Region · hover kebab.
- **Create/edit = right sheet** (`AddEditVehicle.tsx`): grouped sections (Identity · Specs ·
  Financials). Unique reg # validated inline. Duplicate → `critical` field error.
- **Details (`VehicleDetails.tsx`) = full drawer:** header with big status, tabbed content
  (Overview · Specs · Documents · Trips · Fuel · Maintenance · Timeline). Documents as chip list
  with view/upload. Numbers tabular; small trend charts.
- **Rule cues:** In Shop / Retired shown with muted styling + "hidden from dispatch" caption.

---

## 7. PAGE 5 — Driver Management (`DriverManagement.tsx`)

- Header + **Enroll driver** CTA.
- **Table/cards:** Name (avatar initial) · License # (mono) · Category · **Expiry** badge
  (Valid `positive` / Expiring `warning` / Expired `critical`) · **Safety score** (mini ring,
  color-graded) · **Status** pill · Region.
- **Details (`DriverDetails.tsx`):** compliance grid (license/medical/background/training as
  soft check chips), incidents, experience, trips, avg distance, fuel eff., emergency contact,
  timeline. Low safety score → `warning`/`critical` emphasis, not alarm.
- **Rule cues:** Expiring ≤30d amber banner (quiet), Expired/Suspended → disabled for dispatch.

---

## 8. PAGE 6 — Trip Management (`TripManagement.tsx`)

- Header + **Create trip** CTA. Optional **board view** (Draft · Dispatched · Completed ·
  Cancelled columns) toggle alongside table.
- **Row:** Trip ID (mono) · Vehicle · Driver · Route (source ➔ dest, arrow glyph) · **Status**
  pill (+ Delayed `warning`) · Cargo · ETA · Health.
- **Create sheet (`AddEditTrip.tsx`):** source, destination, **available vehicle** (pool excludes
  In Shop/Retired/On Trip), **available driver** (excludes Expired/Suspended/On Trip), cargo
  weight, planned distance. **Live capacity meter**: fills toward max; over-capacity → `critical`
  inline "Exceeds 500 kg limit" and dispatch disabled. This validation moment should feel
  intelligent and instant.
- **Details (`TripDetails.tsx`):** live route, status, Complete / Cancel (destructive confirm).
- Auto-transitions animate on the affected vehicle/driver rows.

---

## 9. PAGE 7 — Maintenance (`MaintenanceManagement.tsx`)

- List: Vehicle · Issue · Date · Cost · Shop · Status (Ongoing `warning` / Closed `neutral`).
- **Log maintenance sheet:** vehicle, issue, cost, shop. On save → vehicle flips **In Shop**
  with a subtle status animation and leaves the dispatch pool; Close → back to Available (unless
  Retired). Confirmation shown as quiet toast.

---

## 10. PAGE 8 — Fuel & Expenses (`FuelExpenseManagement.tsx`)

- Segmented tabs: **Fuel** · **Expenses**.
- Summary band: Total Fuel · Total Maintenance · **Operational Cost (Fuel + Maintenance)** ·
  Fuel Efficiency (Distance ÷ Fuel) — KPI tiles, tabular.
- Entry sheets: fuel (vehicle, volume, cost, date) · expense (category, amount, date, vehicle).
- Anomaly rows flagged with a quiet `warning` dot + reason on hover.

---

## 11. PAGE 9 — Reports & Analytics (`ReportsAnalytics.tsx`)

- Eyebrow + H1 + date-range picker + region/type filters + **Export** (CSV primary; PDF bonus).
- **Metric band:** Fuel Efficiency · Fleet Utilization · Operational Cost · **Vehicle ROI**
  `(Revenue − (Maintenance + Fuel)) ÷ Acquisition Cost` — with delta chips.
- Charts: utilization trend (area), cost breakdown (stacked/donut, muted), efficiency by vehicle
  (bar), ROI ranking (horizontal bar, accent gradient). All draw-in, muted-until-hover, tabular
  tooltips.
- Financials table below, sortable, exportable.

---

## 12. PAGE 10 — Notifications (`NotificationsCenter.tsx`)

- Grouped by day. Item: semantic type glyph, `label` title, `caption` desc + time, critical =
  `critical` left hairline + dot (no red block). Actions: mark read · dismiss · clear all.
- Filters: All · Critical · License · Maintenance · Fuel. Bell count reflects unread.

---

## 13. PAGE 11 — Settings / Profile (`ProfileSettings.tsx`)

- Left sub-nav: Profile · Preferences · Security · Notifications · Team/RBAC.
- Profile: avatar, name, role chip, contact. Preferences: **theme (Light / Dark / System)**,
  density, default region. Security: password, sessions, sign-out. Custom switches/segmented
  controls — no default checkboxes.

---

## 14. System Pages

- `AccessDenied` — centered, line-art shield, H2 "You don't have access", ghost "Back to
  dashboard". Calm, not scary.
- `NotFound404` — big muted "404", one line, single accent CTA. Whitespace does the work.

---

## 15. Navigation Map (`Sidebar.tsx`)

| # | Item | Icon | Page |
|---|------|------|------|
| 1 | Dashboard | LayoutDashboard | §5 |
| 2 | Vehicle Registry | Truck | §6 |
| 3 | Driver Management | Users | §7 |
| 4 | Trip Management | Route | §8 |
| 5 | Maintenance | Wrench | §9 |
| 6 | Fuel & Expenses | Fuel | §10 |
| 7 | Reports & Analytics | BarChart3 | §11 |
| 8 | Notifications | Bell | §12 |
| 9 | Settings | Settings | §13 |

Flow: **Landing → Login → Dashboard**, then lateral via sidebar / ⌘K.

---

## 16. Premium Signals Checklist (what makes it feel million-dollar)

- [ ] Neutrals-first; accent only on action/focus/key data.
- [ ] Tabular numerals on every aligned number; consistent radii & 8pt spacing.
- [ ] Hairline borders + layered low-opacity shadows (no hard drop-shadows).
- [ ] Soft status pills (tint + dot), never saturated blocks.
- [ ] Skeletons (not spinners); optimistic saves; sub-250ms spring motion; reduced-motion safe.
- [ ] ⌘K command palette + keyboard nav.
- [ ] Right-sheet forms with inline validation & live capacity meter on trips.
- [ ] First-class dark mode with its own elevation model.
- [ ] Muted-until-hover charts, monochrome-blue viz palette.
- [ ] Empty/error states with line art + single CTA.
- [ ] Count-up KPIs with sparklines & delta chips.

---

## 17. Token Deltas to Ship (implementation notes)

1. **Extend `@theme` in `index.css`** with the ink scale, semantic-muted, accent-tint, radius &
   shadow tokens above (keep `--color-primary` = `#2563EB` as `accent`).
2. Add `font-variant-numeric: tabular-nums` utility + apply to tables/KPIs.
3. Add elevation utilities `.e1/.e2/.e3` and `.focus-ring`.
4. Add `dark` variant token set; wire theme toggle in `ProfileSettings` + TopNav.
5. Replace login full-screen loader with inline button-progress + top bar.
6. Introduce shared `<DataTable>`, `<StatusPill>`, `<KpiTile>`, `<Sheet>`, `<CommandPalette>`
   primitives so every page inherits the system.

---

*TransitOps Frontend Design System v2.0 — premium, minimal, precise. Restraint is the feature.
Export to PDF for the design deliverable.*
