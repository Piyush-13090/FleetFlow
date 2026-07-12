import crypto from 'crypto';

const authSecret = process.env.AUTH_SECRET || 'change-this-development-secret-before-deploying';

// ─── Token Helpers ────────────────────────────────────────────────────────────

export const signToken = (payload) => {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', authSecret).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
};

export const verifyToken = (token) => {
  const [encodedPayload, signature] = String(token || '').split('.');
  if (!encodedPayload || !signature) return null;
  const expected = crypto.createHmac('sha256', authSecret).update(encodedPayload).digest('base64url');
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
};

// ─── Middleware ───────────────────────────────────────────────────────────────

export const requireAuth = (req, res, next) => {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  const session = verifyToken(token);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Authentication is required.' });
  }
  req.user = session;
  next();
};
