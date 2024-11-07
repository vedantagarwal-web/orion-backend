import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  category: {
    type: String,
    required: true,
    enum: ['music', 'sports', 'arts', 'technology', 'food', 'business', 'other'],
  },
  images: [{
    url: String,
    alt: String,
  }],
  ticketTiers: [{
    name: String,
    price: Number,
    quantity: Number,
    description: String,
    soldCount: {
      type: Number,
      default: 0,
    },
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft',
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false,
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

// Add indexes for better query performance
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event; 