import { Router } from 'express';
import { db, today, createId, findDriver, addActivity, persistState } from '../services/db.js';

const router = Router();

// GET /api/fleet/drivers
router.get('/', (_req, res) => res.json(db.drivers));

// POST /api/fleet/drivers
router.post('/', (req, res) => {
  const source = req.body || {};
  const name = String(source.name || '').trim();
  const licenseNumber = String(source.licenseNumber || `PENDING-${createId('CDL')}`).toUpperCase();

  if (!name) return res.status(400).json({ success: false, message: 'Driver name is required.' });
  if (db.drivers.some((d) => d.licenseNumber === licenseNumber)) {
    return res.status(409).json({ success: false, message: `License ${licenseNumber} already exists.` });
  }

  const newDriver = {
    id: createId('DRV'),
    name,
    licenseNumber,
    licenseCategory: source.licenseCategory || 'CDL-A',
    contactNumber: source.contactNumber || '+1 (555) 010-0000',
    safetyScore: Number(source.safetyScore) || 100,
    status: 'Available',
    currentVehicle: 'N/A',
    licenseExpiry: source.licenseExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    daysToExpiry: Number(source.daysToExpiry) || 365,
    lastTrip: 'N/A',
    experience: Number(source.experience) || 1,
    totalTrips: 0,
    avgDistance: 0,
    avgFuelEfficiency: 7,
    emergencyContact: source.emergencyContact || 'N/A',
    region: source.region || 'East Coast',
    compliance: source.compliance || { license: 'Valid', medical: 'Valid', background: 'Cleared', training: 'Completed' },
    incidents: 0,
    timeline: [{ date: today(), event: 'Driver profile created' }],
  };

  db.drivers = [...db.drivers, newDriver];
  addActivity({ type: 'driver_registered', title: `Driver enrolled: ${name}`, desc: `${name} added to the driver registry.` });
  persistState();
  res.status(201).json({ success: true, driver: newDriver });
});

// PUT /api/fleet/drivers/:id
router.put('/:id', (req, res) => {
  const driver = db.drivers.find((d) => d.id === req.params.id);
  if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });

  const source = req.body || {};
  if (source.licenseNumber && db.drivers.some((d) => d.id !== driver.id && d.licenseNumber === String(source.licenseNumber).toUpperCase())) {
    return res.status(409).json({ success: false, message: 'License number already exists.' });
  }

  const allowed = ['name', 'licenseNumber', 'licenseCategory', 'contactNumber', 'safetyScore', 'status', 'currentVehicle', 'licenseExpiry', 'daysToExpiry', 'lastTrip', 'experience', 'totalTrips', 'avgDistance', 'avgFuelEfficiency', 'emergencyContact', 'region', 'compliance', 'incidents'];
  allowed.forEach((key) => {
    if (source[key] !== undefined) driver[key] = key === 'licenseNumber' ? String(source[key]).toUpperCase() : source[key];
  });
  driver.timeline.unshift({ date: today(), event: 'Driver profile updated' });
  persistState();
  res.json({ success: true, driver });
});

// DELETE /api/fleet/drivers/:id
router.delete('/:id', (req, res) => {
  const driver = db.drivers.find((d) => d.id === req.params.id);
  if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });
  if (driver.status === 'On Trip') return res.status(409).json({ success: false, message: 'Close the active trip before removing this driver.' });

  db.drivers = db.drivers.filter((d) => d.id !== driver.id);
  addActivity({ type: 'driver_removed', title: `Driver archived: ${driver.name}`, desc: `${driver.name} was removed from the active registry.` });
  persistState();
  res.json({ success: true, message: `Driver ${driver.id} removed.` });
});

export default router;
