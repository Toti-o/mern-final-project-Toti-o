const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  response: {
    type: String,
    enum: ['Yes', 'No', 'Maybe'],
    required: true
  },
  guests: {
    type: Number,
    default: 0,
    min: [0, 'Guests cannot be negative']
  }
}, {
  timestamps: true
});

// Ensure one RSVP per user per event
rsvpSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('RSVP', rsvpSchema);