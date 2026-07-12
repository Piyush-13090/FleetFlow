import { Router } from 'express';
import { db, today, createId, addNotification, persistState } from '../services/db.js';

const router = Router();

// GET /api/fleet/expenses
router.get('/', (_req, res) => res.json(db.expenses));

// POST /api/fleet/expenses
router.post('/', (req, res) => {
  const source = req.body || {};
  const amount = Number(source.amount);

  if (!source.vehicle || !source.category || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Vehicle, category, and a positive amount are required.' });
  }

  const record = {
    id: createId('EX'),
    vehicle: source.vehicle,
    tripId: source.tripId || '',
    category: source.category,
    amount,
    date: source.date || today(),
    recordedBy: source.recordedBy || db.profile.name,
    status: source.status || 'Pending',
    notes: source.notes || '',
  };

  db.expenses = [record, ...db.expenses];
  addNotification({ title: 'Expense approval pending', description: `${record.category} expense of $${record.amount.toFixed(2)} needs review.`, category: 'expenses', priority: 'High', relatedVehicle: record.vehicle, actionLabel: 'Review Expense' });
  persistState();
  res.status(201).json({ success: true, record });
});

// PUT /api/fleet/expenses/:id
router.put('/:id', (req, res) => {
  const record = db.expenses.find((e) => e.id === req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Expense not found.' });
  ['vehicle', 'tripId', 'category', 'amount', 'date', 'recordedBy', 'status', 'notes'].forEach((key) => {
    if (req.body?.[key] !== undefined) record[key] = req.body[key];
  });
  persistState();
  res.json({ success: true, record });
});

// DELETE /api/fleet/expenses/:id
router.delete('/:id', (req, res) => {
  const record = db.expenses.find((e) => e.id === req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Expense not found.' });
  db.expenses = db.expenses.filter((e) => e.id !== record.id);
  persistState();
  res.json({ success: true });
});

export default router;
