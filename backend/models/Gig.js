import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  skills: [{
    type: String
  }],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'filled', 'completed'],
    default: 'open'
  },
  positionsAvailable: {
    type: Number,
    default: 1
  },
  positionsFilled: {
    type: Number,
    default: 0
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  completedAt: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.model('Gig', gigSchema);