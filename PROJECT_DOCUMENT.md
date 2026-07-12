# FleetFlow — Smart Transport Operations Platform
### Final Project Document

**Repository:** `FleetFlow`
**Product name:** FleetFlow
**Type:** Hackathon deliverable (8-hour build) — Transport / Fleet Operations Platform
**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 (frontend) · Node.js + Express (backend)
**Date:** 2026-07-12

---

## 1. Executive Summary

FleetFlow is a centralized web platform that digitizes the full lifecycle of transport
operations for logistics companies — replacing spreadsheets and manual logbooks with a single
system for **vehicles, drivers, dispatch, maintenance, fuel/expense tracking, and analytics**.

It enforces operational **business rules** (capacity limits, license validity, status
transitions) and surfaces **real-time KPIs** and **analytics** so managers gain operational
visibility they previously lacked.

---

## 2. Target Users & Roles (RBAC)

| Role | Responsibilities |
|------|------------------|
| **Fleet Manager** | Oversees fleet assets, maintenance, vehicle lifecycle, operational efficiency. |
| **Driver** | Creates trips, assigns vehicles/drivers, monitors active deliveries. |
| **Safety Officer** | Ensures driver compliance, tracks license validity, monitors safety scores. |
| **Financial Analyst** | Reviews operational expenses, fuel consumption, maintenance costs, ROI. |

Authentication is via email + password, returning a mock JWT and the user's role. Only
authenticated users reach the dashboard.

> **Demo credentials:** `admin@fleetflow.io` / `password123` → logs in as *Piyush Sharma (Fleet Manager)*.

---

## 3. Architecture

```
┌─────────────────────────────┐         /api proxy         ┌──────────────────────────────┐
│  Frontend (Vite dev :5173)  │  ───────────────────────▶  │  Backend (Express :3001)     │
│  React 19 + TS + Tailwind   │                            │  In-memory data store        │
│  framer-motion, lucide      │  ◀───────────────────────  │  REST JSON API               │
└─────────────────────────────┘        JSON responses      └──────────────────────────────┘
```

- **Frontend** (`/frontend`): SPA. `App.tsx` renders the login experience, then swaps to
  `FleetFlowDashboard` on auth. Vite dev server proxies `/api` → `http://localhost:3001`.
- **Backend** (`/backend`): Express server (`server.js`) with an in-memory database
  (`vehicles`, `drivers`, `trips`, `notifications`, `activityTimeline`). No external DB — state
  resets on restart (appropriate for a hackathon demo).

---

## 4. Tech Stack

**Frontend**
- React 19, TypeScript ~6
- Vite 8 (dev server + build), `/api` proxy to backend
- Tailwind CSS v4 (`@tailwindcss/vite`)
- framer-motion (animations), lucide-react (icons)
- oxlint (linting)

**Backend**
- Node.js (ESM), Express 4
- CORS enabled
- In-memory state (no persistence layer)

---

## 5. Feature Coverage (mapped to requirements)

| # | Requirement | Status | Where |
|---|-------------|--------|-------|
| 3.1 | Authentication (email/password, RBAC) | ✅ | `LoginCard.tsx`, `POST /api/auth/login` |
| 3.2 | Dashboard KPIs + filters | ✅ | `KpiGrid.tsx`, `FiltersPanel.tsx`, `GET /api/fleet/kpis` |
| 3.3 | Vehicle Registry (unique reg #, status) | ✅ | `VehicleRegistry.tsx`, `AddEditVehicle.tsx`, `/api/fleet/vehicles` |
| 3.4 | Driver Management (license, safety score, status) | ✅ | `DriverManagement.tsx`, `AddEditDriver.tsx`, `/api/fleet/drivers` |
| 3.5 | Trip Management (create, lifecycle) | ✅ | `TripManagement.tsx`, `AddEditTrip.tsx`, `/api/fleet/trips` |
| 3.6 | Maintenance (auto → In Shop) | ✅ | `MaintenanceManagement.tsx` |
| 3.7 | Fuel & Expense tracking + total cost | ✅ | `FuelExpenseManagement.tsx` |
| 3.8 | Reports & Analytics (efficiency, ROI, CSV) | ✅ | `ReportsAnalytics.tsx`, `AnalyticsSection.tsx` |

**Bonus features present:** charts/visual analytics, live trip map (`LiveTripMap.tsx`),
notifications & license-expiry reminders (`NotificationsCenter.tsx`, `NotificationPanel.tsx`),
vehicle document management (vehicle `documents[]`), search/filters/sorting, AI assistant
(`AiAssistant.tsx`), profile/settings, 404 & access-denied pages.

---

## 6. Data Model (entities)

**Vehicle** — `registrationNumber` (unique), `name`, `type`, `capacity`, `odometer`,
`acquisitionCost`, `status` (`Available | On Trip | In Shop | Retired`), `assignedDriver`,
`health`, `region`, `specs {engine, fuelType, mpg, fuelCapacity}`, `documents[]`,
`tripsHistory[]`, `fuelConsumption[]`, `maintenanceHistory[]`, `timeline[]`.

**Driver** — `id`, `name`, `licenseNumber` (unique), `licenseCategory`, `licenseExpiry`,
`daysToExpiry`, `contactNumber`, `safetyScore`, `status`
(`Available | On Trip | Off Duty | Suspended`), `experience`, `totalTrips`, `region`,
`compliance {license, medical, background, training}`, `incidents`, `timeline[]`.

**Trip** — `id`, `vehicle`, `vehicleType`, `driver`, `route` (source ➔ destination), `status`
(`Draft → Dispatched/On Trip → Completed → Cancelled`, plus `Delayed`), `cargo`, `eta`,
`health`, `region`.

**Supporting** — `MaintenanceLog`, `FuelLog`, `Expense`, `Notification`, `ActivityTimeline`,
`Users/Roles`.

---

## 7. API Reference

Base URL: `http://localhost:3001`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | Authenticate, return token + user/role |
| GET | `/api/fleet/kpis` | Dashboard KPI telemetry |
| GET | `/api/fleet/trips` | List trips |
| POST | `/api/fleet/trips` | Create/dispatch trip (auto-updates vehicle + driver → On Trip) |
| DELETE | `/api/fleet/trips/:id` | Terminate trip (frees driver → Available) |
| GET | `/api/fleet/vehicles` | List vehicles |
| POST | `/api/fleet/vehicles` | Register vehicle (validates unique registration) |
| DELETE | `/api/fleet/vehicles/:id` | De-register vehicle |
| GET | `/api/fleet/drivers` | List drivers |
| POST | `/api/fleet/drivers` | Enroll driver (validates unique license) |
| DELETE | `/api/fleet/drivers/:id` | Remove driver |
| GET | `/api/fleet/notifications` | List notifications |
| DELETE | `/api/fleet/notifications/:id` | Dismiss one notification |
| DELETE | `/api/fleet/notifications` | Clear all notifications |
| GET | `/api/fleet/activity` | Activity timeline feed |

---

## 8. Mandatory Business Rules

| Rule | Enforcement |
|------|-------------|
| Vehicle registration number must be unique | ✅ `POST /vehicles` rejects duplicates |
| Driver license number must be unique | ✅ `POST /drivers` rejects duplicates |
| Retired / In Shop vehicles never appear in dispatch | Filtered from selection pool |
| Expired-license or Suspended drivers cannot be assigned | Blocked at trip creation |
| A driver/vehicle already On Trip cannot be re-assigned | Blocked at trip creation |
| Cargo weight ≤ vehicle max load capacity | Validated at trip creation |
| Dispatching a trip → vehicle **and** driver become On Trip | ✅ `POST /trips` |
| Completing a trip → both restored to Available | Trip lifecycle handler |
| Cancelling a dispatched trip → both restored to Available | ✅ `DELETE /trips/:id` |
| Creating active maintenance → vehicle becomes In Shop | Maintenance workflow |
| Closing maintenance → vehicle restored (unless Retired) | Maintenance workflow |

> **Note / hardening backlog:** the capacity check, expired-license/suspended block, and the
> already-On-Trip guard should be enforced **server-side** in `POST /api/fleet/trips` (currently
> the endpoint trusts the client). See §11.

---

## 9. Example Workflow (from spec)

1. Register vehicle *Van-05*, max capacity 500 kg, status Available.
2. Register driver *Alex* with a valid license.
3. Create a trip with cargo 450 kg.
4. System validates 450 ≤ 500 → allows dispatch.
5. Vehicle + driver auto-transition to **On Trip**.
6. Complete trip (enter final odometer + fuel consumed).
7. System marks both **Available**.
8. Create maintenance (e.g., Oil Change) → vehicle **In Shop**, hidden from dispatch.
9. Reports update operational cost + fuel efficiency from the latest trip/fuel log.

---

## 10. Analytics & Formulas

- **Fuel Efficiency** = Distance ÷ Fuel consumed
- **Fleet Utilization (%)** = active vehicles ÷ total operable vehicles
- **Operational Cost** = Fuel + Maintenance (per vehicle)
- **Vehicle ROI** = `(Revenue − (Maintenance + Fuel)) ÷ Acquisition Cost`
- **Export:** CSV supported; PDF optional (bonus).

---

## 11. Setup & Run

**Prerequisites:** Node.js 18+.

```bash
# 1. Backend
cd backend
npm install
npm run dev            # → http://localhost:3001

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev            # → http://localhost:5173  (proxies /api → :3001)
```

Open the frontend URL and log in with `admin@fleetflow.io` / `password123`.

**Build for production:** `cd frontend && npm run build` (output in `frontend/dist`).

---

## 12. Deliverables Checklist

**Mandatory**
- [x] Responsive web interface
- [x] Authentication with RBAC
- [x] CRUD for Vehicles and Drivers
- [x] Trip Management with validations
- [x] Automatic status transitions
- [x] Maintenance workflow
- [x] Fuel & Expense tracking
- [x] Dashboard with KPIs

**Bonus**
- [x] Charts & visual analytics
- [x] Email/expiry reminders (notification center)
- [x] Vehicle document management
- [x] Search, filters, sorting
- [~] PDF export (CSV done; PDF optional)
- [~] Dark mode (verify in `ProfileSettings.tsx`)

---

## 13. Known Gaps / Next Steps

1. **Move business-rule validation server-side** — enforce capacity, license, and On-Trip
   guards in `POST /api/fleet/trips` rather than trusting the client payload.
2. **Persist state** — swap the in-memory store for SQLite/Postgres so data survives restarts.
3. **Real auth** — replace the mock JWT with signed tokens + role-checked route middleware.
4. **Trip completion endpoint** — add explicit `PATCH /trips/:id` for the Draft → Dispatched →
   Completed lifecycle (currently create = dispatch, delete = cancel).
5. **PDF export** and confirm **dark mode** to close the remaining bonus items.

---

*Generated as the consolidated final project document for the FleetFlow hackathon build.*
