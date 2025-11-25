const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  maxAttendees: {
    type: Number,
    min: [1, 'Maximum attendees must be at least 1'],
    default: null
  },
  category: {
    type: String,
    enum: ['Social', 'Business', 'Educational', 'Sports', 'Other'],
    default: 'Social'
  }
}, {
  timestamps: true
});

// Index for efficient querying
eventSchema.index({ date: 1 });
eventSchema.index({ creator: 1 });

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return this.date > new Date();
});

module.exports = mongoose.model('Event', eventSchema);
