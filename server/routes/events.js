import express from 'express';
import Event from '../models/Event.js';
import { auth, requireRole, requireCityOwnershipForAdmin } from '../middleware/auth.js';

const router = express.Router();

// List all events (everyone)
router.get('/', async (req, res) => {
  const { city } = req.query;
  const q = city ? { city } : {};
  const events = await Event.find(q).sort({ date: 1 }).lean();
  res.json(events);
});

// Create event (admin only for their city, super_admin for any city)
router.post('/',
  auth,
  requireRole(['admin', 'super_admin']),
  requireCityOwnershipForAdmin(req => req.body.city),
  async (req, res) => {
    try {
      const { title, description, date, city, location } = req.body;
      if (!title || !date || !city) return res.status(400).json({ error: 'Missing required fields' });
      const ev = await Event.create({ title, description, date, city, location });
      res.status(201).json(ev);
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update event
router.put('/:id',
  auth,
  requireRole(['admin', 'super_admin']),
  async (req, res) => {
    try {
      const ev = await Event.findById(req.params.id);
      if (!ev) return res.status(404).json({ error: 'Not found' });
      // If admin, ensure same city
      if (req.user.role === 'admin' && req.user.city?.toLowerCase() !== ev.city.toLowerCase()) {
        return res.status(403).json({ error: 'Admin can only edit events in their city' });
      }
      const { title, description, date, city, location } = req.body;
      if (req.user.role === 'admin' && city && city.toLowerCase() !== ev.city.toLowerCase()) {
        return res.status(403).json({ error: 'Admin cannot move event to another city' });
      }
      ev.title = title ?? ev.title;
      ev.description = description ?? ev.description;
      ev.date = date ?? ev.date;
      ev.location = location ?? ev.location;
      if (req.user.role === 'super_admin' && city) ev.city = city;
      await ev.save();
      res.json(ev);
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete event
router.delete('/:id',
  auth,
  requireRole(['admin', 'super_admin']),
  async (req, res) => {
    try {
      const ev = await Event.findById(req.params.id);
      if (!ev) return res.status(404).json({ error: 'Not found' });
      if (req.user.role === 'admin' && req.user.city?.toLowerCase() !== ev.city.toLowerCase()) {
        return res.status(403).json({ error: 'Admin can only delete events in their city' });
      }
      await ev.deleteOne();
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update event
router.put('/:id', auth, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { title, description, date, city, location } = req.body;

    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Admins can only edit events in their own city
    if (req.user.role === 'admin' && event.city.toLowerCase() !== req.user.city.toLowerCase()) {
      return res.status(403).json({ error: 'Admins can only edit events in their city' });
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.city = city || event.city;
    event.location = location || event.location;

    await event.save();
    res.json(event);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
