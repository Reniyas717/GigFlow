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
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'hired', 'rejected', 'counter-offered'],
    default: 'pending'
  },
  counterOffer: {
    price: {
      type: Number,
      min: 0
    },
    message: {
      type: String
    },
    createdAt: {
      type: Date
    }
  }
}, { timestamps: true });

// Index for faster queries (not unique to allow rebidding after rejection)
bidSchema.index({ gigId: 1, freelancerId: 1 });

export default mongoose.model('Bid', bidSchema);