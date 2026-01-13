import Gig from '../models/Gig.js';

export const createGig = async (req, res) => {
  try {
    const { title, description, budget, positionsAvailable } = req.body;

    if (!title || !description || budget === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user.userId,
      status: 'open',
      positionsAvailable: positionsAvailable || 1,
      positionsFilled: 0
    });

    // Populate owner info before emitting
    await gig.populate('ownerId', 'name email');

    // Emit real-time event to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('gig:created', gig);
      console.log('📢 Emitted gig:created event:', gig.title);
    }

    res.status(201).json(gig);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const getGigs = async (req, res) => {
  try {
    const { search, _id } = req.query;

    let query = {};

    // If specific gig ID requested
    if (_id) {
      query._id = _id;
    } else {
      // Otherwise only show open gigs
      query.status = 'open';
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all gigs for a specific user (for profile stats)
export const getAllGigs = async (req, res) => {
  try {
    const gigs = await Gig.find()
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};