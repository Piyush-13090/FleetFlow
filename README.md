# FleetFlow — Enterprise Smart Transport & Fleet Operations Platform

[![Stack: React 19 + TypeScript](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TS%20%2B%20Tailwind%20v4-blue.svg)](https://react.dev/)
[![Backend: Node.js + Express](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)](https://expressjs.com/)
[![Database: PostgreSQL + Prisma 7](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Prisma%207-indigo.svg)](https://prisma.io/)
[![Linter: Oxlint](https://img.shields.io/badge/Linter-Oxlint-orange.svg)](https://oxc.rs/docs/guide/usage/linter/rules)

FleetFlow (TransitOps) is a production-ready, centralized transport operations platform designed for mid-to-large-scale logistics enterprises. It digitizes the end-to-end lifecycle of fleet management, asset tracking, trip dispatch, safety compliance, maintenance logging, and financial telemetry, replacing error-prone spreadsheets with a single pane of glass.

---

## 🏗️ Architecture & Technical Stack

The project is structured as a decoupled monorepo, optimized for developer velocity, ease of containerization, and clean boundaries:

```
                  ┌──────────────────────────────┐
                  │      React 19 Frontend       │
                  │   Vite 8 SPA (Port 5173)     │
                  └──────────────┬───────────────┘
                                 │
                     API Proxy   │  /api/*
                                 ▼
                  ┌──────────────────────────────┐
                  │      Express API Server      │
                  │     Node.js (Port 3001)      │
                  └──────────────┬───────────────┘
                                 │
                     Prisma ORM  │  Type-Safe Client
                                 ▼
                  ┌──────────────────────────────┐
                  │      PostgreSQL Database     │
                  │      Local Port 5432         │
                  └──────────────────────────────┘
```

### Technical Stack Specs
*   **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Framer Motion, Lucide React, Oxlint.
*   **Backend**: Node.js (ESM), Express, Prisma 7 ORM.
*   **Database**: PostgreSQL 18, utilizing connection pooling and transactional constraints.

---

## 📂 Project Structure

```
FleetFlow/
├── backend/
│   ├── generated/
│   │   └── prisma/             # Type-safe Generated Prisma Client
│   ├── lib/
│   │   └── prisma.js           # Centralized Prisma Client Instantiation
│   ├── prisma/
│   │   └── schema.prisma       # Relational Database Models & Mappings
│   ├── src/                    # Controllers, middlewares, and routes
│   ├── .env                    # Database Credentials (Single Source of Truth)
│   ├── .gitignore              # Backend Version Control Ignores
│   ├── package.json            # Node/Express dependencies (Prisma v7.8.0)
│   ├── prisma.config.ts        # Prisma 7 Database Configuration
│   └── server.js               # Express API and main entrypoint
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Global graphics
│   │   ├── components/         # Reusable presentation blocks
│   │   │   └── dashboard/      # Contextual modules (Trips, Vehicles, Alerts)
│   │   ├── App.tsx             # Root orchestrator (Login/RBAC routing)
│   │   ├── index.css           # Global typography & design variables
│   │   └── main.tsx            # Vite entrypoint
│   ├── package.json            # Frontend dependencies (Tailwind CSS v4)
│   └── vite.config.ts          # Vite compilation, aliases, and API proxy
└── README.md                   # Project Documentation
```

---

## 📊 Entity-Relationship (ER) Diagram

Below is the relational data model layout representing FleetFlow's core operational entities and mappings:

```mermaid
erDiagram
    ORGANIZATION ||--o{ USER : has
    ORGANIZATION ||--o{ VEHICLE : owns
    ORGANIZATION ||--o{ DRIVER : employs
    ORGANIZATION ||--o{ TRIP : runs
    ORGANIZATION ||--o{ ALERT : raises

    USER ||--o{ USER_ROLE : has
    ROLE ||--o{ USER_ROLE : assigned_to
    USER ||--o| DRIVER : "linked login"
    USER ||--o{ TRIP : creates
    USER ||--o{ MAINTENANCE_LOG : logs
    USER ||--o{ FUEL_LOG : logs
    USER ||--o{ EXPENSE : "creates/approves"
    USER ||--o{ ACTIVITY_LOG : performs

    VEHICLE ||--o{ TRIP : "assigned to"
    VEHICLE ||--o{ MAINTENANCE_LOG : undergoes
    VEHICLE ||--o{ FUEL_LOG : records
    VEHICLE ||--o{ EXPENSE : incurs

    DRIVER ||--o{ TRIP : "assigned to"

    TRIP ||--o{ FUEL_LOG : "linked to"
    TRIP ||--o{ EXPENSE : "linked to"

    ORGANIZATION {
        uuid id PK
        varchar name
        varchar region
        timestamptz created_at
    }

    ROLE {
        int id PK
        varchar name UK "Fleet Manager, Driver, Safety Officer, Financial Analyst, Admin"
    }

    USER {
        uuid id PK
        uuid organization_id FK
        varchar name
        varchar email UK
        text password_hash
        boolean is_active
    }

    USER_ROLE {
        uuid user_id FK
        int role_id FK
    }

    VEHICLE {
        uuid id PK
        uuid organization_id FK
        varchar registration_number UK
        varchar name_model
        varchar type
        decimal max_load_capacity_kg
        decimal odometer_km
        decimal acquisition_cost
        enum status "Available/On Trip/In Shop/Retired"
        varchar region
        decimal next_service_due_km
        date next_service_due_date
    }

    DRIVER {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK "nullable, unique"
        varchar name
        varchar license_number UK
        varchar license_category
        date license_expiry_date
        varchar contact_number
        decimal safety_score
        enum status "Available/On Trip/Off Duty/Suspended"
        varchar region
    }

    TRIP {
        uuid id PK
        uuid organization_id FK
        varchar source
        varchar destination
        uuid vehicle_id FK
        uuid driver_id FK
        decimal cargo_weight_kg
        decimal planned_distance_km
        decimal actual_distance_km
        decimal fuel_consumed_l
        decimal revenue
        enum status "Draft/Dispatched/Completed/Cancelled"
        uuid created_by FK
        timestamptz dispatched_at
        timestamptz completed_at
        timestamptz cancelled_at
    }

    MAINTENANCE_LOG {
        uuid id PK
        uuid vehicle_id FK
        varchar type
        text description
        decimal cost
        enum status "Open/Closed"
        timestamptz started_at
        timestamptz closed_at
        uuid created_by FK
    }

    FUEL_LOG {
        uuid id PK
        uuid vehicle_id FK
        uuid trip_id FK "nullable"
        decimal liters
        decimal cost
        date log_date
        uuid created_by FK
    }

    EXPENSE {
        uuid id PK
        uuid vehicle_id FK
        uuid trip_id FK "nullable"
        enum type "Toll/Parking/Fine/Other"
        decimal amount
        date expense_date
        boolean requires_approval
        uuid approved_by FK
        uuid created_by FK
    }

    ACTIVITY_LOG {
        bigint id PK
        varchar entity_type "trip/vehicle/driver/maintenance"
        uuid entity_id
        varchar action
        uuid performed_by FK
        jsonb metadata
        timestamptz created_at
    }

    ALERT {
        uuid id PK
        uuid organization_id FK
        varchar type "LICENSE_EXPIRING/MAINTENANCE_DUE/LOW_SAFETY_SCORE"
        varchar related_entity_type
        uuid related_entity_id
        text message
        varchar severity "info/warning/critical"
        boolean is_read
    }
```

---

## 🔒 Role-Based Access Control (RBAC)

The system handles core user functions depending on their assigned authorization role:

| Role | Core Privileges | Key System Focus |
|------|-----------------|------------------|
| **Fleet Manager** | Full access to inventory, assets, and routes | Fleet uptime, utilization rate, lifecycle planning |
| **Driver** | Operational logs, routing, odometer reporting | Dispatch sheets, electronic logging, delivery updates |
| **Safety Officer** | Compliance monitoring, document updates | Safety scoring, incident records, license expiry alerts |
| **Financial Analyst** | Expense approvals, billing reports | Fuel efficiency (MPG), maintenance costs, asset ROI |

---

## ⚙️ Mandatory Business Rules Enforced

The following operational constraints are validated:

*   **Registry Uniqueness**: Vehicle registration numbers and driver license numbers are unique and checked at insertion.
*   **State Conflict Prevention**: Drivers or vehicles marked as `On Trip`, `In Shop`, or `Retired`/`Suspended` are blocked from new dispatch assignments.
*   **Capacity Boundary**: Trips cannot be created if the `cargo_weight_kg` exceeds the assigned vehicle's `max_load_capacity_kg`.
*   **Lifecycle Syncing**: Dispatching a trip transitions both the assigned vehicle and driver statuses to `On Trip`. Completing/cancelling the trip automatically reverts them to `Available`.
*   **Maintenance Workflows**: Opening a maintenance ticket sets the vehicle status to `In Shop`. Closing the ticket restores the vehicle back to `Available`.

---

## 📊 Analytics Formulas Used

*   **Fleet Utilization**:
    $$\text{Fleet Utilization (\%)} = \left(\frac{\text{Vehicles "On Trip"}}{\text{Total Operable Vehicles}}\right) \times 100$$
*   **Fuel Consumption Efficiency**:
    $$\text{Fuel Efficiency} = \frac{\text{Actual Distance (km)}}{\text{Fuel Consumed (L)}}$$
*   **Total Operational Cost (per vehicle)**:
    $$\text{Total Cost} = \sum \text{Fuel Logs Cost} + \sum \text{Maintenance Logs Cost}$$
*   **Asset Return-on-Investment (ROI)**:
    $$\text{Vehicle ROI (\%)} = \left(\frac{\text{Trip Revenue} - \text{Total Operational Cost}}{\text{Acquisition Cost}}\right) \times 100$$

---

## 🚦 Quick Start & Setup Guide

### Prerequisites
*   [Node.js](https://nodejs.org/) v18+
*   [PostgreSQL](https://www.postgresql.org/) v14+ (listening on port `5432`)

### 1. Database Setup
1. Verify that your PostgreSQL database service is running locally on port `5432`.
2. Configure your credentials inside [backend/.env](file:///c:/Users/Ansh%20Rastogi/OneDrive/Desktop/FleetFlow-main/backend/.env):
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fleetflow?schema=public"
   ```

### 2. Backend Installation & Client Generation
Navigate to the `backend/` folder, install the packages, pull the database schema, and compile the type-safe client:
```bash
cd backend
npm install

# Introspect database structure
npx prisma db pull

# Generate type-safe Prisma client
npx prisma generate

# Start the Express API server
npm run dev
```

### 3. Frontend Installation & Client Start
Open a new terminal session, navigate to the `frontend/` folder, install dependencies, and run the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser. All API requests to `/api/*` will automatically proxy to your backend server running on port `3001`.

### 4. Admin View (Prisma Studio)
To inspect the relational database data in a web browser GUI:
```bash
cd backend
npx prisma studio
```
Navigate to **[http://localhost:5555](http://localhost:5555)**.

---

## 🔑 Demo Credentials (RBAC Quick Testing)

Use these credentials on the login screen to access pre-configured dashboards with mock operational data matching the roles:

*   **Fleet Manager (Piyush Sharma)**:
    *   **Email**: `admin@fleetflow.io`
    *   **Password**: `password123`
*   **Safety Officer**:
    *   **Email**: `safety@fleetflow.io`
    *   **Password**: `password123`
*   **Financial Analyst**:
    *   **Email**: `finance@fleetflow.io`
    *   **Password**: `password123`

---

## 🛰️ Core Features Spotlight

### 🧠 Integrated AI Assistant
*   Built-in natural language query engine processing operational logs, driver analytics, and diagnostics.
*   Enables managers to type prompts like *"Show all vehicles with critical health warnings"* or *"List drivers with safety scores below 90"*.

### 🗺️ Live Telemetry Simulation
*   A real-time dispatch dashboard displaying live simulated locations, route checkpoints, ETA countdowns, and vehicle diagnostics (fuel levels, tire pressure, and engine temperatures).

### 📑 Document Compliance Vault
*   Digital management for critical fleet assets, supporting electronic storage, upload previews, and compliance tracking for CDL credentials, vehicle insurance registrations, and safety logs.

---

## 💻 REST API Endpoints Specification

| Method | Endpoint | Payload / Params | System Outcome |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | `{ email, password }` | Authenticates user, generates JWT token, returns payload containing roles. |
| **GET** | `/api/fleet/kpis` | *None* | Computes and returns real-time fleet KPIs (Utilization, ROI, alert counts). |
| **GET** | `/api/fleet/vehicles` | `?region=East` | Returns list of vehicles filtered by regions, type, or maintenance status. |
| **POST** | `/api/fleet/vehicles`| `{ registrationNumber, type, capacity, ... }` | Registers a new vehicle; fails if registration number is duplicate. |
| **GET** | `/api/fleet/drivers` | *None* | Fetches active drivers including license expiry and compliance status. |
| **POST** | `/api/fleet/trips` | `{ vehicleId, driverId, cargoWeight, ... }` | Validates load capacity, verifies driver availability, locks status, and dispatches trip. |
| **DELETE**| `/api/fleet/trips/:id`| *Path Parameter* | Terminates the trip, calculates final statistics, and frees up the vehicle and driver. |

---

## 🎨 Enterprise Design Patterns Used

*   **Singleton Pattern**: The Express app utilizes a single shared instance of the Prisma Client to avoid exceeding database connection limit boundaries during heavy concurrent operations.
*   **Stateless REST Architecture**: The system communication layer is built on decoupled, stateless HTTP endpoints returning uniform JSON payloads, allowing for horizontal scalability.
*   **Facade Pattern (Prisma Service Layer)**: Complex SQL operations (join relations, group-bys, and transaction validations) are abstracted away behind simple, readable Prisma APIs.

