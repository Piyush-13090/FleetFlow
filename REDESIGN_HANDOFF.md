# TransitOps — Dashboard Redesign Handoff

**Goal:** Redesign the entire TransitOps frontend (dashboard + all section pages) to a premium,
multi-billion-dollar SaaS look (Linear / Stripe / Vercel / Apple caliber) — a **visual & interaction
redesign, NOT a feature cut**. Every existing feature, field, handler, API call, and mock value must
be preserved; only presentation/interaction changes. Same features, new skin.

This doc is self-contained: another model can execute it without prior chat context.

---

## 0. Stack & how to run

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + framer-motion + lucide-react
  (+ `@splinetool/react-spline` for the landing hero only). Path: `frontend/`.
- **Backend:** Node + Express in-memory API. Path: `backend/` (`node server.js`, port 3001).
- **Run:**
  ```bash
  cd backend && npm install && npm run dev        # http://localhost:3001
  cd frontend && npm install && npm run dev       # http://localhost:5173
  ```
- **Open the dashboard directly:** `http://localhost:5173/?dashboard`
  (App.tsx reads `?dashboard` to skip landing→login; otherwise landing → CTAs → login → dashboard).
- **Demo login:** `admin@transitops.com` / `password123`.
- **Verify after every change:** `cd frontend && npm run build` must pass `tsc -b && vite build` with 0 errors.

---

## 1. Design language — "Quiet Confidence"

95% neutral palette + ONE electric-blue accent (actions / key data only) + one success green.
Hierarchy from type weight/size/spacing, not boxes. Hairline 1px borders + soft layered low-opacity
shadows (no hard drop shadows). Strict 8pt spacing, consistent radius (8/12/20), tabular numerals for
ALL numbers. Physics-based motion <250ms. Reduced-motion honored. Focus rings + ≥44px tap targets.

### Color tokens (use these literal hex values)
| Purpose | Value |
|---|---|
| Ink / headings | `#0A0A0A` |
| Body text | `#4B5563` |
| Muted / meta | `#6B7280`, `#9CA3AF` |
| Hairline border | `#E5E7EB` (sub-cards `#EEF1F4`) |
| Canvas / soft fill | `#FBFCFD`, `#F9FAFB`, `#F3F4F6` |
| **Accent (electric blue)** | `#2563EB` (hover `#1D4ED8`, tint `#EFF4FF`, tint border `#DBE6FF`) |
| Success | `#059669` / dot `#16A34A` (tint `#ECFDF5`, border `#C7F0DC`) |
| Warning | `#D97706` (tint `#FFFBEB`, border `#FDE8B0`) |
| Critical | `#DC2626` (tint `#FEF2F2`, border `#FBD5D5`) |
| Neutral status | `#4B5563` / dot `#94A3B8` (tint `#F3F4F6`) |

### Typography
- Display/headings: **Space Grotesk** via `.cc-display` class (tight `-0.02em`, weight 600–700).
- Body: **Inter** via `.cc-body` class (line-height 1.6).
- Both imported in `frontend/src/index.css`. Use `tabular-nums` on every number.

### Global CSS helpers (already in `frontend/src/index.css`)
- `.cc-display`, `.cc-body`
- `.cc-glass` (glass; use sparingly — nav/palette only)
- `.cc-shadow-sm` / `.cc-shadow-md` / `.cc-shadow-lg` (the ONLY shadows to use)
- `.cc-focus:focus-visible` → blue focus ring
- Radius: use arbitrary values `rounded-[8px]` (sm) / `rounded-[12px]` (md, controls) / `rounded-[16px]`
  (cards) / `rounded-[20px]` (large). Keep them explicit for consistency.

### Motion
- Ease curve: `[0.2, 0.8, 0.2, 1]`. Springs: `{ stiffness: 320, damping: 34 }`.
- Scroll reveals: fade + rise ~14px, staggered ~60ms. Count-ups on KPI mount/filter-change.
- Status changes should animate as a smooth chip color/label morph (not a hard reload).
- Always gate continuous motion with framer's `useReducedMotion`.

---

## 2. Reusable building blocks (ALREADY CREATED — use these, don't reinvent)

In `frontend/src/components/ui/`:
| File | Export | Purpose |
|---|---|---|
| `CountUp.tsx` | `CountUp`, `EASE` | Animated tabular count-up (`to`, `decimals`, `prefix`, `suffix`). |
| `Reveal.tsx` | `Reveal` | Scroll-reveal wrapper (`delay`, `y`). |
| `StatusPill.tsx` | `StatusPill`, `statusTone` | Soft tint+dot status pill; `statusTone(str)` maps ANY status string → tone. |
| `KpiTile.tsx` | `KpiTile` | Premium KPI card (icon, delta chip, count-up, optional sparkline). |
| `SectionHeader.tsx` | `SectionHeader` | Page header (eyebrow + display title + subtitle + `actions` slot). |
| `Sparkline.tsx` | `Sparkline` | Minimal SVG sparkline (`data`, `color`, `area`). |
| `Ring.tsx` | `Ring` | Animated circular progress ring w/ centered label (health/safety/readiness). |
| `Segmented.tsx` | `Segmented` | Tab/toggle with sliding active pill (`options`, `value`, `onChange`, `layoutId`). |
| `Card.tsx` | `Card`, `CardLabel` | Standard surface card + caps label. |
| `Field.tsx` | `Field`, `SelectField` | Labeled input/select with inline validation + hint. |
| `ModalShell.tsx` | `ModalShell` | Centered modal w/ soft backdrop, title/subtitle/footer slots. |

**Replace old repeated patterns with these:** old KPI tiles → `KpiTile`; old status badges → `StatusPill`;
old page headers → `SectionHeader`; old health/safety/readiness SVG rings → `Ring`; old sparklines →
`Sparkline`; old tab/view switchers → `Segmented`; old modals → `ModalShell`; form fields → `Field`/`SelectField`.

---

## 3. The restyle recipe (apply to EVERY page — markup/classes only, never touch logic)

| Old | New |
|---|---|
| `font-black text-text-dark` | `cc-display font-bold text-[#0A0A0A]` |
| heading font (Outfit) | `.cc-display` (Space Grotesk) for titles, `.cc-body` (Inter) for text |
| `border-border-gray` | `border-[#E5E7EB]` |
| `shadow-sm` / `shadow-md` | `cc-shadow-sm` / `cc-shadow-md` |
| `rounded-2xl` (cards) / `rounded-xl` (controls) | `rounded-[16px]` / `rounded-[12px]` |
| `font-mono` on numbers/IDs/costs | `tabular-nums` |
| inputs `bg-slate-50 ... input-glow` | `bg-[#F9FAFB] border-[#E5E7EB] rounded-[12px] cc-focus` |
| modal overlay `bg-slate-950/45 backdrop-blur-sm` | `bg-[#0A0F1E]/40 backdrop-blur` (or use `ModalShell`) |
| status badges (emerald/rose/amber/blue pills) | `<StatusPill status={...} />` |
| tiny type `text-[8px]`–`text-[10px]` | bump to `text-[11px]`–`text-[13px]` for readability |
| `bg-primary`/`text-primary` (=`#2563EB`) | keep — it's the accent |
| chart SVG bright colors | mute to accent `#2563EB` + graphite `#94A3B8` + tint fills |

Keep all semantic status color meanings: **success=green (available/completed/approved/valid),
accent=blue (on-trip/dispatched/scheduled), warning=amber (delayed/pending/expiring/in-progress),
critical=red (in-shop/suspended/cancelled/overdue/expired/rejected/critical), neutral=slate (retired/off-duty/draft).**

---

## 4. What's ALREADY DONE (do not redo; match this quality)

- **Landing page** — `frontend/src/components/CommandControlLanding.tsx` (premium, Spline 3D hero,
  Unsplash imagery, feature sections, animated stats). Fully redesigned.
- **Dashboard shell** — `frontend/src/components/dashboard/TransitOpsDashboard.tsx`:
  - `CommandCenterSidebar.tsx` — collapsible grouped nav (Operations/Fleet/Finance/System) + account footer.
  - `CommandPalette.tsx` — ⌘K / Ctrl+K, fuzzy jump to sections + vehicles/drivers/trips + quick actions.
  - `TopNav.tsx` — workspace switcher, search, clock, weather, quick-add, notifications, profile drawer trigger.
  - `ProfileNavDrawer.tsx` — right slide-over account/nav (mobile).
  - `FleetPulse.tsx` — signature animated fleet-utilization gauge hero on the Overview.
  - Overview widgets restyled: `KpiGrid`, `FiltersPanel`, `FleetHealth`, `ActivityTimeline`,
    `OperationsTable`, `AnalyticsSection`, `LiveTripMap` (token-aligned).
- **Shared `ui/` primitives** — all listed in §2 are built.

**Navigation ids** (used by sidebar/palette `setActiveTab`): `dashboard, vehicles, drivers, trips,
maintenance, fuel, reports, notifications, settings, notfound`. Unknown ids → `AccessDenied`.

---

## 5. What REMAINS — reskin these pages (in this order; keep app runnable + build green after each)

All live in `frontend/src/components/dashboard/` unless noted. For each: apply the §3 recipe, swap in
§2 primitives, preserve EVERY feature/field/handler/endpoint listed. Add the "signature" item noted.

### Step 1 — Vehicle Registry
Files: `VehicleRegistry.tsx`, `AddEditVehicle.tsx`, `VehicleDetails.tsx`.
- **VehicleRegistry** (`props: onShowToast`; exports `VehicleData`). API: `GET /api/fleet/vehicles`,
  `DELETE /api/fleet/vehicles/:reg`. Preserve: header (Add Vehicle / Export CSV / Import Vehicles /
  Refresh); 4 KPI tiles (Total, Available, On Trip, In Maintenance) with sparklines; sticky search+filter
  ribbon (search; Type/Status/Region selects; **capacity range slider** 4000–50000; sort odometer/cost/
  health; Reset); **table↔grid view toggle**; table cols (Vehicle Name+region, Registration, Type,
  Odometer, Capacity, Status, Driver, Actions View/Edit/Delete) with **expandable inline rows** (Specs;
  Compliance Documents Insurance/Registration/IFTA Active/Expired/Missing; Last Repair Logs); grid cards;
  empty state; **right inspector dock** (health ring, logistics list, doc indicators, activity timeline);
  **floating speed-dial FAB** (Register/Import/Scan). *Signature add:* utilization sparkline on grid cards.
- **AddEditVehicle** (`props: initialData, onClose, onShowToast, existingVehicles`). API: `POST /api/fleet/vehicles`
  (edit = DELETE then POST). Preserve: **4-step stepper** (Basic Info / Operational / Compliance / Status);
  fields — registrationNumber (**live unique check**), name, type, manufacturer, mfgYear, color, VIN
  (**17-char validation**), capacity (**>0**), odometer, acquisitionCost (**>0**), purchaseDate, fuelType,
  transmission, engineNumber, fuelCap, region; document uploads w/ simulated progress; status cards;
  **live preview** (animated truck SVG that shakes/smokes when On Trip); smart-hint cards; success + error
  modals; shake-on-invalid; In-Shop/Retired "excluded from dispatch" warning.
- **VehicleDetails** (`props: vehicle, onClose, onEdit, onShowToast`). No API. Preserve: sticky header
  (Back/Edit/Schedule Maintenance/Export/More); hero card (animated truck, status, stat grid, health ring);
  2 SVG charts (Fuel Efficiency trend, Monthly Expense stack); **tabs** (Maintenance History / Recent Trips /
  Fuel & Expense Logs / Compliance Docs); right column (Fleet Intelligence AI insights, Registry Alerts,
  Operational Timeline); speed-dial FAB. Keep all hardcoded mock values.

### Step 2 — Driver Management
Files: `DriverManagement.tsx`, `AddEditDriver.tsx`, `DriverDetails.tsx`.
- **DriverManagement** (`props: onShowToast`; exports `DriverData`). API: `GET /api/fleet/drivers`,
  `DELETE /api/fleet/drivers/:id`. Preserve: header (Add Driver/Export/Refresh); 4 KPIs (Total, Available,
  On Trip, Expired/Suspended); filter ribbon (search; Status/Category/Region; **Min Safety slider** 50–100;
  sort safety/trips/experience; Reset); table↔grid; table cols (Operator+region, License **w/ EXPIRED /
  EXPIRING SOON(Xd) / Valid(Xd) states**, CDL Class, **Safety Rating mini ring**, Fuel Avg MPG, Availability,
  Actions); expandable rows (Driver Overview, Dossier Compliance, Incident Logs); grid cards w/ EXPIRED
  banner; right inspector (safety ring, metrics, emergency contact, **AI Safety Insights** expired/expiring/
  approved, timeline, View Operational Dashboard); speed-dial. *Signature add:* **compliance ring** on grid cards.
  Business rules to keep visible: `daysToExpiry<=0`→EXPIRED, `<=30`→EXPIRING; safety color thresholds 90/70.
- **AddEditDriver** (`props: initialData, onClose, onShowToast, existingDrivers`). API: `POST /api/fleet/drivers`
  (edit = DELETE then POST). Preserve: **4-step stepper** (Personal / License / Compliance Docs / Availability);
  fields — name, empId(auto), phone(**≥10 digits**), email, dob, gender, address/city/state/zip, emergency
  name/phone; licenseNum (**live unique**), category, issueDate, expiryDate (**cannot register expired**),
  experience, issuingAuthority, country/state; doc uploads (License/GovID/Medical/Background/Training);
  safetyScore slider, region, status; **live onboarding preview + Readiness score ring** (15%/doc +10% valid
  license +15/5% safety); success/error modals; shake validation.
- **DriverDetails** (`props: driver, onClose, onEdit, onShowToast`). No API. Preserve: header w/ **Suspend/
  Lift toggle** + Export; tabs (Overview / Compliance & Docs / Trip History); Overview (hero avatar w/ online
  dot, stat tiles, AreaChart Distance + LineChart Trips w/ Weekly/Monthly toggle, Safety & Incident Audit,
  Operator Readiness ring, On-Trip mission panel, AI insights); Compliance (4 cards Valid/Expiring/Missing +
  Renew, Document Attachments); History (Missions Logs table). Keep hardcoded values.

### Step 3 — Trip Management
Files: `TripManagement.tsx`, `AddEditTrip.tsx`, `TripDetails.tsx`.
- **TripManagement** (`props: onShowToast`; `TripData`). API: `GET /api/fleet/trips`, `GET /api/fleet/drivers`.
  Preserve: header (Create Trip/Export/Refresh); 6 KPIs (Active/Draft/Completed/Cancelled/Avg Distance/
  Utilization) w/ sparklines; filter ribbon; table (Trip ID expand, Route, Cargo, Asset, Distance, **Dispatch
  State badge**, Actions **View/Dispatch(Play, Draft only)/Complete(Check, Dispatched only)/Cancel**);
  expandable rows (Driver, Cargo checks, Expenses); **Interactive Dispatch Route Map** (animated truck nodes,
  dashed routes, live badge, CHI/ATL pins); **sidebar Trip Inspector** (details + Dispatch Milestones timeline);
  AI insights. Handlers `handleDispatch/Complete/Cancel/UpdateTripStatus` are client-state. Status normalize
  on load (`On Trip→Dispatched`, `In Shop→Draft`). *Signature add:* **animated status-chip morph** on dispatch/
  complete/cancel (chip color+label smoothly transitions).
- **AddEditTrip** (`props: initialData, onClose, onShowToast`). API: `GET drivers`, `GET vehicles`, `POST /api/fleet/trips`.
  Preserve: **5-step stepper** (Route/Vehicle/Driver/Cargo/Review); Step1 route fields; Step2 **available-vehicle**
  grid (status available/idle only, shows maxLoad); Step3 **ready-driver** grid (available + `daysToExpiry>0` +
  `compliance.license==='Valid'`); Step4 cargo fields + **real-time capacity compliance card** (Verified green /
  Warning rose, `cargoWeight<=maxLoad`); Step5 review; **Dispatch Readiness ring** + checklist; dispatch enabled
  only at **100%**; confirm/success/error modals stating dispatch auto-sets vehicle+driver to On Trip.
- **TripDetails** (`props: trip, onClose, onEdit, onShowToast, onUpdateStatus`). No API. Preserve: header w/
  **Complete/Cancel** (only when dispatched/on-trip/delayed) + Edit/Export; hero (status, route map SVG);
  tabs (Overview / Fuel & Expenses / Timeline); Overview (driver card, vehicle specs, **Complete Trip wizard**
  requiring delivery-signature checkbox, **Cancel Trip wizard** requiring reason+comments, Operator Safety
  ring, AI insights); Finance (Refueling + Tolls/Maintenance tables + totals + **Expense DonutChart** =
  fuel+tolls+maintenance rollup); Timeline. Complete/Cancel bubble via `onUpdateStatus` + "returned to Available" toast.

### Step 4 — Maintenance (`MaintenanceManagement.tsx`)
`props: onShowToast`. API: `GET /api/fleet/vehicles` (records mocked in-code, 3 seeds). Preserve: header
(Add Record/Export/Refresh); 6 KPIs (In Shop/Scheduled/Active Repairs/Completed/Total Cost/Avg Downtime);
filter bar (search, Type/Status/Priority, Reset); table (Maintenance ID expand, Asset, Service Type, Workshop,
Mechanic, Scheduled Date, Est. Cost, **Status badge** incl. Overdue w/ bounce); expandable rows (Technician
Notes + Parts Used table); analytics (Monthly Repair BarChart, Fleet Health gauge); **Work Order Inspector**
sidebar (Complete Repair Order when In Progress); AI diagnostics; **Complete Work Order modal** (Final Cost,
remarks, **quality-check checkbox**, Release Vehicle); **Schedule Service 2-step modal** (vehicle **excludes
Retired** / type / workshop / mechanic → cost / date / priority / remarks). Business rules: add→"In Shop",
complete→"Available"; cost rollup. *Signature add:* card **slides into "In Shop"** state on schedule.

### Step 5 — Fuel & Expenses (`FuelExpenseManagement.tsx`)
`props: onShowToast`. No real API (seeds 3 fuel + 4 expenses). Preserve: header (Add Fuel Log/Add Expense/
Export/Refresh); 6 KPIs w/ trend arrows (Total Fuel Cost/Fuel Consumed L/Total Ops Cost/Maintenance/Other/
Avg Cost per Mile); filter bar (**context-sensitive Type options** per tab; Status only on expenses); **3 tabs**
(Fuel Logs / Expense Records / Operational Summary); Fuel table (11 cols) + expandable (Efficiency/Trip/Station);
Expense table (Category badge, Amount, **Status badge**, expand Notes + Receipt upload); Summary (4 cost rings
w/ % of total, Fuel LineChart, Expense DonutChart, Vehicle Cost Leaderboard, AI Cost Intelligence); **Add Fuel
modal** (**auto-computed total = qty×price/L**); **Add Expense modal** (defaults status **Pending**). Keep
rollups (fuel/maint/other/ops cost).

### Step 6 — Reports & Analytics (`ReportsAnalytics.tsx`)
`props: onShowToast`. No API (static + toasts). Preserve: sticky header (**Export Report dropdown** CSV/PDF/
Excel/Email, Share, Refresh); global filter bar (date range + 4 search + Apply/Reset); **8-KPI ribbon**
(Utilization/Revenue/Ops Cost/Fuel Efficiency/Distance/Fuel Consumed/Maintenance/ROI); **Executive Summary**
gauge (score 74) + 4 stat tiles + paragraph; **6-card analytics grid** (Utilization AreaChart, Fuel Efficiency
AreaChart, Expense DonutChart, Cost Breakdown BarChart, Trip Completion BarChart, AI Business Intelligence);
Fleet Leaderboards (top vehicles ROI bars, top drivers Safety bars); **4 tabs** (Overview / Vehicle Matrix /
Driver Matrix / Cost Analytics) w/ tables + Export & Distribution Center (6 cards); loading skeleton. Recolor
all SVG charts to the muted palette.

### Step 7 — Notifications (`NotificationsCenter.tsx`)
`props: onShowToast`. In-memory (12 seeds). Preserve: header (Mark All Read/Preferences/Export/Refresh);
6 KPI cards; **Preferences panel** (8 toggle switches); filter bar (search, Priority, Status, Reset, live count);
**category tabs** (all + 9 categories w/ counts); **feed cards** (priority icon, badge via `StatusPill`, unread
dot, timestamp, related chips, hover actions mark-read/archive/delete); empty state; **detail panel** (Related
Records, History timeline, action buttons); **Smart Alert Center** (6 cards); AI Notification Intelligence;
Fleet Activity Timeline. Keep `markAllRead/markRead/archive/delete/togglePref` + derived counts.

### Step 8 — Settings (`ProfileSettings.tsx`)
`props: onShowToast`. No API. Preserve **left 12-section nav** (profile/security/notifications/appearance/
preferences/sessions/activity/connected/workspace/developer/privacy/support) + Sign Out; sticky header w/
**dirty-state Save/Cancel + Saved badge**; Profile (avatar completion ring, 10 fields + bio, AI Personalization);
Security (**password strength meter**, 2FA toggle, recovery); Notifications (11 toggles); Appearance (font/
sidebar selects, compact/animations toggles, accent swatches); Preferences (8 selects); Sessions (3 devices +
terminate); Activity Log; Connected Accounts (5 integrations); Workspace (4 selects); Developer (**masked API
key/webhook/token** terminal block + Regenerate); Privacy (download/export + **Danger Zone Delete Account**);
Support (4 help cards); **Save Confirmation modal**. Use `ToggleSwitch`, `Field`/`SelectField`.

### Step 9 — System pages: `AccessDenied.tsx` (403) + `NotFound404.tsx`
`props: attemptedResource?, requiredRole?, onNavigate?, onShowToast?` / `onNavigate?, onShowToast?`. No API.
Preserve: 403 — animated shield illustration, Permission Summary, Access Timeline, User Identity card, **Request
Access form**, **Permission Matrix table** (9 modules), Suggested Navigation (6 pages), FAQ accordion, Security
Notice, AI Assistant. 404 — layered "404", animated truck illustration, **SearchCard** (8 suggestions, live
filter), Quick Navigation (8 modules), Recent Activity / System Status / Keyboard Shortcuts, Suggestions, AI
Navigation Assistant. Redesign to premium-minimal; keep all content + `onNavigate` routing.

### Step 10 — Login (`frontend/src/components/LoginCard.tsx`)
`props: onLoginSuccess`. **Real API: `POST /api/auth/login`.** Preserve: **4-step success overlay** (Validating
→ JWT → Loading → Access Granted), glass card w/ shake-on-error, email/password (show toggle), Remember Me,
Forgot Password, social logins (Google/Azure stubs), footer. Validation: email regex + password ≥6. Match the
landing's premium look.

---

## 6. Guardrails (hard rules)
- **Do NOT remove or hide any feature, field, column, filter, KPI, tab, modal, handler, or mock value.**
  If unsure, preserve it. Only presentation/interaction changes.
- Palette = neutrals + one accent (`#2563EB`) + success green. Pastel icon tiles OK. No hard shadows.
- Every interactive element: hover + focus (`cc-focus`) + pressed states. Tap targets ≥44px.
- Designed empty / loading / error states (not default library styling).
- Forms: inline validation + business-rule guidance shown as help (capacity limit, license expiry, On-Trip
  lock), not just post-submit toasts.
- Reduced-motion honored via `useReducedMotion`. No new major dependencies (ask first).
- The per-page floating **speed-dial FABs** overlap the global AI-assistant FAB — offset/stack them, keep both.

## 7. Verification (after each step)
1. `cd frontend && npm run build` → 0 errors.
2. Backend running; open `http://localhost:5173/?dashboard`; reach the page via sidebar + ⌘K.
3. Confirm: data loads; search/filters/sort work; table↔grid toggles; wizards validate (unique reg/license,
   capacity, license expiry) and submit; detail tabs render; modals open/close; exports toast; status
   transitions animate; empty/loading/error states show.
4. Toggle OS reduce-motion; resize to mobile → no horizontal overflow. Login + ⌘K still work.

---

*Everything in §2 and §4 is already built. Start at §5 Step 1 and proceed in order, keeping the build green.*
