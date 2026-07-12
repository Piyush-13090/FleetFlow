import express from 'express';
import cors from 'cors';

import { loadState } from './services/db.js';
import { requireAuth } from './middleware/auth.js';

import authRouter from './routes/auth.js';
import tripsRouter from './routes/trips.js';
import vehiclesRouter from './routes/vehicles.js';
import driversRouter from './routes/drivers.js';
import maintenanceRouter from './routes/maintenance.js';
import fuelLogsRouter from './routes/fuelLogs.js';
import expensesRouter from './routes/expenses.js';
import notificationsRouter from './routes/notifications.js';
import fleetRouter from './routes/fleet.js';

// ─── App Configuration ────────────────────────────────────────────────────────

const app = express();
const port = Number(process.env.PORT) || 3001;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: clientOrigin.split(',').map((o) => o.trim()) }));
app.use(express.json());

// ─── Load Persisted State ─────────────────────────────────────────────────────

loadState();

// ─── Public Routes ────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString(), storage: 'json-file' });
});

app.use('/api/auth', authRouter);

// ─── Protected Fleet Routes ───────────────────────────────────────────────────

app.use('/api/fleet', requireAuth);

app.use('/api/fleet', fleetRouter);
app.use('/api/fleet/trips', tripsRouter);
app.use('/api/fleet/vehicles', vehiclesRouter);
app.use('/api/fleet/drivers', driversRouter);
app.use('/api/fleet/maintenance', maintenanceRouter);
app.use('/api/fleet/fuel-logs', fuelLogsRouter);
app.use('/api/fleet/expenses', expensesRouter);
app.use('/api/fleet/notifications', notificationsRouter);

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(port, () => {
  console.log(`FleetFlow Backend listening at http://localhost:${port}`);
});
