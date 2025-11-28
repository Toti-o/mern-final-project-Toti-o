const express = require('express');
const router = express.Router();
const RSVP = require('../models/RSVP');
const Event = require('../models/Event'); 
const auth = require('../middleware/auth');

// Create or update RSVP
router.post('/', auth, async (req, res) => {
  try {
    console.log('📨 RSVP request received:', req.body);
    console.log('👤 User:', req.user.id);
    
    const { eventId, response, guests } = req.body;
    
    // Validation
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }
    
    if (!response) {
      return res.status(400).json({ message: 'Response is required' });
    }

    // Check valid response types
    const validResponses = ['going', 'not_going', 'maybe'];
    if (!validResponses.includes(response)) {
      return res.status(400).json({ 
        message: 'Response must be: going, not_going, or maybe' 
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Create or update RSVP
    const rsvp = await RSVP.findOneAndUpdate(
      { user: req.user.id, event: eventId },
      { 
        response, 
        guests: guests || 0,
        user: req.user.id,
        event: eventId
      },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'name email').populate('event');

    console.log('✅ RSVP saved:', rsvp);

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(eventId).emit('rsvp-update', {
        eventId: eventId,
        rsvp: rsvp,
        userId: req.user.id,
        userName: req.user.name
      });
      console.log('📢 Socket event emitted for event:', eventId);
    }
    
    res.json(rsvp);
  } catch (error) {
    console.log('❌ RSVP error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get RSVPs for a user
router.get('/my-rsvps', auth, async (req, res) => {
  try {
    console.log('📨 Fetching RSVPs for user:', req.user.id);
    
    const rsvps = await RSVP.find({ user: req.user.id })
      .populate('event')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${rsvps.length} RSVPs for user`);
    res.json(rsvps);
  } catch (error) {
    console.log('❌ Error fetching user RSVPs:', error);
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

// Delete RSVP
router.delete('/:id', auth, async (req, res) => {
  try {
    const rsvp = await RSVP.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!rsvp) {
      return res.status(404).json({ message: 'RSVP not found' });
    }

    res.json({ message: 'RSVP deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
