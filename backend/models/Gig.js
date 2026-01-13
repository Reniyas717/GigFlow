import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'filled'],
    default: 'open'
  },
  positionsAvailable: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  positionsFilled: {
    type: Number,
    default: 0,
    min: 0
  }
}, { timestamps: true });

export default mongoose.model('Gig', gigSchema);