const express = require('express');
const router = express.Router();
const RSVP = require('../models/RSVP');
const auth = require('../middleware/auth');

// Create or update RSVP
router.post('/', auth, async (req, res) => {
  try {
    const { event, response, guests } = req.body;
    
    const rsvp = await RSVP.findOneAndUpdate(
      { user: req.user.id, event },
      { response, guests },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'name email').populate('event');
    
    // Emit real-time update (you'll need to pass io instance via app)
    req.app.get('io').to(event).emit('rsvp-update', {
      eventId: event,
      rsvp: rsvp
    });
    
    res.json(rsvp);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get RSVPs for a user
router.get('/my-rsvps', auth, async (req, res) => {
  try {
    const rsvps = await RSVP.find({ user: req.user.id })
      .populate('event')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(rsvps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get RSVPs for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const rsvps = await RSVP.find({ event: req.params.eventId })
      .populate('user', 'name email')
      .sort({ response: 1, createdAt: -1 });
    
    res.json(rsvps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;