import { Router } from 'express';
import { db, normalizeNotification, persistState } from '../services/db.js';

const router = Router();

// GET /api/fleet/notifications
router.get('/', (req, res) => {
  const requestedStatus = req.query.status;
  const includeAll = req.query.all === 'true';
  const result = db.notifications.filter((n) =>
    includeAll ? true : requestedStatus ? n.status === requestedStatus : n.status === 'unread'
  );
  res.json(result);
});

// PUT /api/fleet/notifications/read-all
// NOTE: must be registered before /:id to avoid being consumed by the param route
router.put('/read-all', (_req, res) => {
  db.notifications = db.notifications.map((n) =>
    n.status === 'unread' ? { ...n, status: 'read' } : n
  );
  persistState();
  res.json({ success: true });
});

// PUT /api/fleet/notifications/:id
router.put('/:id', (req, res) => {
  const notification = db.notifications.find((n) => n.id === req.params.id);
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });

  const { status } = req.body || {};
  if (!['unread', 'read', 'archived'].includes(status)) {
    return res.status(400).json({ success: false, message: 'A valid notification status is required.' });
  }
  notification.status = status;
  persistState();
  res.json({ success: true, notification });
});

// DELETE /api/fleet/notifications/:id
router.delete('/:id', (req, res) => {
  const exists = db.notifications.some((n) => n.id === req.params.id);
  if (!exists) return res.status(404).json({ success: false, message: 'Notification not found.' });
  db.notifications = db.notifications.filter((n) => n.id !== req.params.id);
  persistState();
  res.json({ success: true });
});

// DELETE /api/fleet/notifications  (clear all or by status)
router.delete('/', (req, res) => {
  db.notifications =
    req.query.status === 'unread'
      ? db.notifications.filter((n) => n.status !== 'unread')
      : [];
  persistState();
  res.json({ success: true });
});

export default router;
