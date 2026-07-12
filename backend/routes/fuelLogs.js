import { Router } from 'express';
import { db, today, createId, findVehicle, addActivity, persistState } from '../services/db.js';

const router = Router();

// GET /api/fleet/fuel-logs
router.get('/', (_req, res) => res.json(db.fuelLogs));

// POST /api/fleet/fuel-logs
router.post('/', (req, res) => {
  const source = req.body || {};
  const registrationNumber = String(source.registrationNumber || source.vehicle || '').toUpperCase();
  const vehicle = findVehicle(registrationNumber);
  const quantity = Number(source.quantity);
  const pricePerLiter = Number(source.pricePerLiter);

  if (!vehicle || !source.station || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(pricePerLiter) || pricePerLiter <= 0) {
    return res.status(400).json({ success: false, message: 'Valid vehicle, station, quantity, and price are required.' });
  }

  const record = {
    id: createId('FL'),
    vehicle: vehicle.name,
    registrationNumber,
    driver: source.driver || vehicle.assignedDriver || 'N/A',
    tripId: source.tripId || '',
    station: source.station,
    fuelType: source.fuelType || vehicle.specs.fuelType || 'Diesel',
    quantity,
    pricePerLiter,
    totalCost: Number((quantity * pricePerLiter).toFixed(2)),
    odometer: Number(source.odometer) || vehicle.odometer,
    date: source.date || today(),
    notes: source.notes || '',
  };

  db.fuelLogs = [record, ...db.fuelLogs];
  vehicle.odometer = Math.max(vehicle.odometer, record.odometer);
  vehicle.fuelConsumption.unshift({ date: record.date, gallons: record.quantity, cost: record.totalCost });
  vehicle.timeline.unshift({ date: today(), event: `Fuel log ${record.id} recorded` });

  addActivity({ type: 'fuel_logged', title: `Fuel logged: ${registrationNumber}`, desc: `${record.quantity} units recorded at ${record.station}.` });
  persistState();
  res.status(201).json({ success: true, record });
});

// DELETE /api/fleet/fuel-logs/:id
router.delete('/:id', (req, res) => {
  const record = db.fuelLogs.find((r) => r.id === req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Fuel log not found.' });
  db.fuelLogs = db.fuelLogs.filter((r) => r.id !== record.id);
  persistState();
  res.json({ success: true });
});

export default router;
