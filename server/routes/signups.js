import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Signup from '../models/Signup.js';
import Event from '../models/Event.js';
import { stringify } from 'csv-stringify/sync';

const router = express.Router();

// Create signup or conversation
router.post('/', auth, requireRole(['user', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { type, eventId, category = 'signup', personName } = req.body;

    // Validate personName
    if (!personName || typeof personName !== 'string' || personName.trim() === '') {
      return res.status(400).json({ error: 'personName is required' });
    }

    if (!['personal', 'event'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    if (!['signup', 'conversation'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    let city;
    let event = null;

    if (type === 'event') {
      if (!eventId) return res.status(400).json({ error: 'eventId required for event type' });
      event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ error: 'Event not found' });
      city = event.city;
    } else {
      city = req.user.city || null;
    }

    const signup = await Signup.create({
      user: req.user._id,
      event: event ? event._id : null,
      type,
      category,
      personName: personName.trim(),
      city: city || null
    });

    res.status(201).json(signup);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get signups / conversations
router.get('/', auth, async (req, res) => {
  try {
    const u = req.user;
    const { city } = req.query;
    let filter = {};

    if (u.role === 'user') {
      filter.user = u._id;
    } else if (u.role === 'admin') {
      filter.city = u.city;
    } else {
      // super_admin
      if (city) {
        filter.city = city;
      }
    }

    const items = await Signup.find(filter)
      .populate('user', 'name email role city')
      .populate('event', 'title city date')
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export CSV
router.get('/export', auth, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const u = req.user;
    const { city } = req.query;
    let filter = {};

    if (u.role === 'admin') {
      filter.city = u.city;
    } else if (city) {
      filter.city = city;
    }

    const items = await Signup.find(filter)
      .populate('user', 'name')
      .populate('event', 'title city')
      .lean();

    // Build records with human-readable fields
    const records = items.map((s) => ({
      'User Name': s.user?.name || '',
      'Category': s.category === 'conversation' ? 'Conversation' : 'Signup',
      'Signup Type': s.type,
      'Event Title': s.type === 'event' ? s.event?.title || '' : '',
      'Person Name': s.personName || '',
      'Signup Date': s.timestamp ? new Date(s.timestamp).toLocaleString() : '',
      'City': s.city || s.event?.city || ''
    }));

    const csv = stringify(records, { header: true });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=signups.csv');
    res.send(csv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete signup/conversation (Admins & Super Admins)
router.delete('/:id', auth, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const signup = await Signup.findById(req.params.id).populate('event', 'city').lean();
    if (!signup) return res.status(404).json({ error: 'Record not found' });

    if (req.user.role === 'admin') {
      const signupCity = signup.city || signup.event?.city;
      if (!signupCity || signupCity.toLowerCase() !== req.user.city.toLowerCase()) {
        return res.status(403).json({ error: 'Admins can only delete records in their city' });
      }
    }

    await Signup.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
