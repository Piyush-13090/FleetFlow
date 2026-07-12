import { Router } from 'express';
import { db, today, createId, findVehicle, addActivity, addNotification, persistState } from '../services/db.js';

const router = Router();

// GET /api/fleet/maintenance
router.get('/', (_req, res) => res.json(db.maintenanceRecords));

// POST /api/fleet/maintenance
router.post('/', (req, res) => {
  const source = req.body || {};
  const registrationNumber = String(source.registrationNumber || '').toUpperCase();
  const vehicle = findVehicle(registrationNumber);

  if (!vehicle || !source.workshop || !source.mechanic || !source.type) {
    return res.status(400).json({ success: false, message: 'Vehicle, maintenance type, workshop, and mechanic are required.' });
  }

  const record = {
    id: createId('MA'),
    vehicle: `${vehicle.name} (#${registrationNumber})`,
    registrationNumber,
    type: source.type,
    workshop: source.workshop,
    mechanic: source.mechanic,
    scheduledDate: source.scheduledDate || today(),
    estimatedCost: Number(source.estimatedCost) || 0,
    status: source.status || 'Scheduled',
    priority: source.priority || 'Medium',
    notes: source.notes || '',
    partsUsed: source.partsUsed || [],
  };

  db.maintenanceRecords = [record, ...db.maintenanceRecords];
  vehicle.status = record.status === 'Completed' ? 'Available' : 'In Shop';
  vehicle.lastMaintenance = record.scheduledDate;
  vehicle.timeline.unshift({ date: today(), event: `Maintenance ${record.id} scheduled` });

  addActivity({ type: 'maintenance_created', title: `Maintenance scheduled: ${registrationNumber}`, desc: `${record.type} at ${record.workshop}.`, color: '#EF4444', bgColor: '#FEE2E2' });
  addNotification({ title: `Maintenance scheduled for ${registrationNumber}`, description: `${record.type} is scheduled with ${record.mechanic}.`, category: 'maintenance', priority: record.priority === 'High' ? 'High' : 'Medium', relatedVehicle: registrationNumber, actionLabel: 'View Maintenance' });
  persistState();
  res.status(201).json({ success: true, record });
});

// PUT /api/fleet/maintenance/:id
router.put('/:id', (req, res) => {
  const record = db.maintenanceRecords.find((r) => r.id === req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Maintenance record not found.' });

  const source = req.body || {};
  ['type', 'workshop', 'mechanic', 'scheduledDate', 'estimatedCost', 'status', 'priority', 'notes', 'partsUsed'].forEach((key) => {
    if (source[key] !== undefined) record[key] = source[key];
  });

  const vehicle = findVehicle(record.registrationNumber);
  if (vehicle && source.status) {
    vehicle.status = source.status === 'Completed' || source.status === 'Cancelled' ? 'Available' : 'In Shop';
    vehicle.lastMaintenance = today();
    vehicle.maintenanceHistory.unshift({ date: today(), issue: record.type, cost: Number(record.estimatedCost), shop: record.workshop });
    vehicle.timeline.unshift({ date: today(), event: `Maintenance ${record.id} marked ${record.status}` });
  }

  if (source.status === 'Completed') {
    addActivity({ type: 'maintenance_completed', title: `Maintenance completed: ${record.registrationNumber}`, desc: `${record.type} completed at ${record.workshop}.`, color: '#22C55E', bgColor: '#DCFCE7' });
    addNotification({ title: `Maintenance completed for ${record.registrationNumber}`, description: `${record.type} has been completed and the asset is available.`, category: 'maintenance', relatedVehicle: record.registrationNumber, actionLabel: 'View Vehicle' });
  }

  persistState();
  res.json({ success: true, record });
});

// DELETE /api/fleet/maintenance/:id
router.delete('/:id', (req, res) => {
  const record = db.maintenanceRecords.find((r) => r.id === req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Maintenance record not found.' });
  db.maintenanceRecords = db.maintenanceRecords.filter((r) => r.id !== record.id);
  persistState();
  res.json({ success: true });
});

export default router;
