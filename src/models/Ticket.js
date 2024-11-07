import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ticketTier: {
    name: String,
    price: Number,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['valid', 'used', 'cancelled', 'refunded'],
    default: 'valid',
  },
  qrCode: {
    type: String,
  },
  transactionId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket; 