import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { db } from '../services/db.js';
import { signToken, verifyToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const role = user.metadata?.role || 'Fleet Manager';
    const token = signToken({ sub: user.id, email: user.email, role, exp: Date.now() + 8 * 60 * 60 * 1000 });
    
    // Sync local in-memory db profile cache
    db.profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      department: user.metadata?.department || 'Fleet Operations',
      region: user.metadata?.region || 'East Coast',
      notificationPreferences: user.metadata?.notificationPreferences || { email: true, push: true }
    };

    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  const session = verifyToken(token);
  if (session) {
    res.json({ 
      success: true, 
      user: { 
        id: session.sub, 
        email: session.email, 
        role: session.role,
        name: db.profile.name 
      } 
    });
  } else {
    const { id, name, email, role } = db.profile;
    res.json({ success: true, user: { id, name, email, role } });
  }
});

export default router;
