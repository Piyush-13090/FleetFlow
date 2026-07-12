import { Router } from 'express';
import { db, persistState } from '../services/db.js';

const router = Router();

// GET /api/fleet/kpis
router.get('/kpis', (_req, res) => {
  const activeTrips = db.trips.filter((t) => t.status === 'On Trip').length;
  const delayedTrips = db.trips.filter((t) => t.status === 'Delayed').length;
  const availableVehicles = db.vehicles.filter((v) => v.status === 'Available').length;
  const maintenanceVehicles = db.vehicles.filter((v) => v.status === 'In Shop').length;
  const driversOnDuty = db.drivers.filter((d) => d.status === 'On Trip').length;
  const activeVehicles = db.vehicles.filter((v) => v.status === 'On Trip').length;
  const fleetUtilization = db.vehicles.length
    ? Math.round(((activeVehicles + maintenanceVehicles) / db.vehicles.length) * 100)
    : 0;

  res.json({ activeVehicles, availableVehicles, inMaintenance: maintenanceVehicles, activeTrips, pendingTrips: delayedTrips, driversOnDuty, fleetUtilization });
});

// GET /api/fleet/health
router.get('/health', (_req, res) => {
  const averageFuelEfficiency = db.vehicles.length
    ? Number((db.vehicles.reduce((sum, v) => sum + Number(v.specs?.mpg || 0), 0) / db.vehicles.length).toFixed(1))
    : 0;
  const maintenanceInProgress = db.maintenanceRecords.filter((r) => r.status === 'In Progress' || r.status === 'Scheduled').length;
  const highCostAssets = db.vehicles
    .map((v) => ({
      registrationNumber: v.registrationNumber,
      name: v.name,
      cost: [
        ...db.fuelLogs.filter((r) => r.registrationNumber === v.registrationNumber).map((r) => r.totalCost),
        ...db.maintenanceRecords.filter((r) => r.registrationNumber === v.registrationNumber).map((r) => Number(r.estimatedCost)),
      ].reduce((sum, val) => sum + val, 0),
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 2);

  res.json({
    maintenanceInProgress,
    maintenanceTotal: db.maintenanceRecords.length,
    averageFuelEfficiency,
    upcomingLicenses: db.drivers
      .filter((d) => d.daysToExpiry <= 30)
      .map((d) => ({ name: d.name, daysToExpiry: d.daysToExpiry, licenseCategory: d.licenseCategory })),
    highCostAssets,
  });
});

// GET /api/fleet/activity
router.get('/activity', (_req, res) => res.json(db.activityTimeline));

// GET /api/fleet/profile
router.get('/profile', (_req, res) => res.json(db.profile));

// PUT /api/fleet/profile
router.put('/profile', (req, res) => {
  const source = req.body || {};
  db.profile = { ...db.profile, ...source, id: db.profile.id, email: source.email || db.profile.email };
  persistState();
  res.json({ success: true, profile: db.profile });
});

// GET /api/fleet/reports/summary
router.get('/reports/summary', (_req, res) => {
  const totalFuelCost = db.fuelLogs.reduce((sum, r) => sum + r.totalCost, 0);
  const totalExpenses = db.expenses.reduce((sum, r) => sum + r.amount, 0);
  const totalMaintenanceCost = db.maintenanceRecords.reduce((sum, r) => sum + Number(r.estimatedCost), 0);

  res.json({
    vehicles: db.vehicles.length,
    drivers: db.drivers.length,
    trips: db.trips.length,
    activeTrips: db.trips.filter((t) => t.status === 'On Trip').length,
    vehicleStatus: db.vehicles.reduce((acc, v) => ({ ...acc, [v.status]: (acc[v.status] || 0) + 1 }), {}),
    tripStatus: db.trips.reduce((acc, t) => ({ ...acc, [t.status]: (acc[t.status] || 0) + 1 }), {}),
    totalFuelCost: Number(totalFuelCost.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    totalMaintenanceCost: Number(totalMaintenanceCost.toFixed(2)),
    operationalCost: Number((totalFuelCost + totalExpenses + totalMaintenanceCost).toFixed(2)),
    totalFuelQuantity: db.fuelLogs.reduce((sum, r) => sum + r.quantity, 0),
  });
});

export default router;
