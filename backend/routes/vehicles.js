import { Router } from 'express';
import { db, today, createId, vehicleRegistration, findVehicle, addActivity, addNotification, persistState } from '../services/db.js';

const router = Router();

// GET /api/fleet/vehicles
router.get('/', (_req, res) => res.json(db.vehicles));

// POST /api/fleet/vehicles
router.post('/', (req, res) => {
  const source = req.body || {};
  const registrationNumber = String(source.registrationNumber || vehicleRegistration(source.id) || '').trim().toUpperCase();
  const name = String(source.name || source.id || '').replace(/\s*\(#?[A-Z0-9-]+\)\s*$/i, '').trim();

  if (!registrationNumber || !name) {
    return res.status(400).json({ success: false, message: 'Registration number and vehicle name are required.' });
  }
  if (findVehicle(registrationNumber)) {
    return res.status(409).json({ success: false, message: `Registration number ${registrationNumber} already exists.` });
  }

  const newVehicle = {
    registrationNumber,
    name,
    type: source.type || 'Semi-Truck',
    capacity: Number(source.capacity) || 12000,
    odometer: Number(source.odometer) || 0,
    acquisitionCost: Number(source.acquisitionCost) || 50000,
    status: 'Available',
    lastMaintenance: today(),
    assignedDriver: 'N/A',
    health: 100,
    region: source.region || 'East Coast',
    purchaseDate: source.purchaseDate || today(),
    insuranceExpiry: source.insuranceExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    roadTax: source.roadTax || 'Compliant',
    documents: Array.isArray(source.documents) ? source.documents : ['Insurance', 'Registration'],
    specs: {
      engine: source.engine || source.specs?.engine || 'Cummins 300HP',
      fuelType: source.fuelType || source.specs?.fuelType || 'Diesel',
      mpg: Number(source.mpg || source.specs?.mpg) || 8.5,
      fuelCapacity: Number(source.fuelCapacity || source.specs?.fuelCapacity) || 80,
    },
    tripsHistory: [],
    fuelConsumption: [],
    maintenanceHistory: [],
    timeline: [{ date: today(), event: 'Asset registered in fleet registry' }],
  };

  db.vehicles = [...db.vehicles, newVehicle];
  addActivity({ type: 'vehicle_registered', title: `Asset registered: ${registrationNumber}`, desc: `${name} added to the ${newVehicle.region} fleet.` });
  addNotification({ title: `Vehicle ${registrationNumber} registered`, description: `${name} is available for dispatch.`, category: 'vehicles', relatedVehicle: registrationNumber, actionLabel: 'View Vehicle' });
  persistState();
  res.status(201).json({ success: true, message: `Vehicle ${name} registered successfully.`, vehicle: newVehicle });
});

// PUT /api/fleet/vehicles/:registrationNumber
router.put('/:registrationNumber', (req, res) => {
  const vehicle = findVehicle(req.params.registrationNumber.toUpperCase());
  if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });

  const source = req.body || {};
  const allowed = ['name', 'type', 'capacity', 'odometer', 'acquisitionCost', 'status', 'lastMaintenance', 'assignedDriver', 'health', 'region', 'purchaseDate', 'insuranceExpiry', 'roadTax', 'documents'];
  allowed.forEach((key) => { if (source[key] !== undefined) vehicle[key] = source[key]; });

  if (source.engine || source.fuelType || source.mpg || source.fuelCapacity || source.specs) {
    vehicle.specs = {
      ...vehicle.specs,
      ...(source.specs || {}),
      ...(source.engine ? { engine: source.engine } : {}),
      ...(source.fuelType ? { fuelType: source.fuelType } : {}),
      ...(source.mpg ? { mpg: Number(source.mpg) } : {}),
      ...(source.fuelCapacity ? { fuelCapacity: Number(source.fuelCapacity) } : {}),
    };
  }
  vehicle.timeline.unshift({ date: today(), event: 'Vehicle information updated' });
  persistState();
  res.json({ success: true, vehicle });
});

// DELETE /api/fleet/vehicles/:registrationNumber
router.delete('/:registrationNumber', (req, res) => {
  const registrationNumber = req.params.registrationNumber.toUpperCase();
  const vehicle = findVehicle(registrationNumber);
  if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  if (vehicle.status === 'On Trip') return res.status(409).json({ success: false, message: 'Close the active trip before removing this vehicle.' });

  db.vehicles = db.vehicles.filter((v) => v.registrationNumber !== registrationNumber);
  addActivity({ type: 'vehicle_removed', title: `Asset removed: ${registrationNumber}`, desc: `${vehicle.name} was removed from the fleet.` });
  persistState();
  res.json({ success: true, message: `Vehicle ${registrationNumber} de-registered.` });
});

export default router;
