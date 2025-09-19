import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).lean();
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
  const ok = Array.isArray(roles) ? roles.includes(req.user.role) : req.user.role === roles;
  if (!ok) return res.status(403).json({ error: 'Forbidden' });
  next();
};

// For admin event modifications: ensure admin only touches their city
export const requireCityOwnershipForAdmin = (getBodyCity) => (req, res, next) => {
  const u = req.user;
  if (u.role === 'super_admin') return next();
  if (u.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
  const bodyCity = getBodyCity(req);
  if (!u.city || !bodyCity || u.city.toLowerCase() != String(bodyCity).toLowerCase()) {
    return res.status(403).json({ error: 'Admin can only manage events in their city' });
  }
  next();
};
