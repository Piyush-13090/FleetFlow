import { Router } from 'express';
import { db } from '../services/db.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (email !== 'admin@fleetflow.io' || password !== 'password123') {
    return res.status(401).json({ success: false, message: 'Invalid corporate credentials.' });
  }
  const { id, name, email: userEmail, role } = db.profile;
  const token = signToken({ sub: id, email: userEmail, role, exp: Date.now() + 8 * 60 * 60 * 1000 });
  res.json({ success: true, token, user: { id, name, email: userEmail, role } });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const { id, name, email, role } = db.profile;
  res.json({ success: true, user: { id, name, email, role } });
});

export default router;
