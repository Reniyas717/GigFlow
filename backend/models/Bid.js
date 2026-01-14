import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'hired', 'rejected', 'countered'],
    default: 'pending'
  },
  counterOffer: {
    price: Number,
    message: String,
    createdAt: Date
  }
}, { timestamps: true });

export default mongoose.model('Bid', bidSchema);