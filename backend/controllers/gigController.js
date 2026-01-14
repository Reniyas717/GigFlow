import Gig from '../models/Gig.js';
import Bid from '../models/Bid.js';

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

export const assignAdmin = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Only owner can assign admins
    if (gig.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only gig owner can assign admins' });
    }

    // Check if user is already an admin
    if (gig.admins && gig.admins.includes(userId)) {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    // Add admin
    if (!gig.admins) {
      gig.admins = [];
    }
    gig.admins.push(userId);
    await gig.save();

    res.json({ message: 'Admin assigned successfully', gig });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const removeAdmin = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Only owner can remove admins
    if (gig.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only gig owner can remove admins' });
    }

    // Remove admin
    if (gig.admins) {
      gig.admins = gig.admins.filter(id => id.toString() !== userId);
    }
    await gig.save();

    res.json({ message: 'Admin removed successfully', gig });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getGigById = async (req, res) => {
  try {
    const { gigId } = req.params;
    const gig = await Gig.findById(gigId)
      .populate('ownerId', 'name email')
      .populate('admins', 'name email');
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    
    res.json(gig);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markGigComplete = async (req, res) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Only owner can mark complete
    if (gig.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the gig owner can mark it as complete' });
    }

    gig.status = 'completed';
    gig.completedAt = new Date();
    await gig.save();

    // Notify all hired freelancers
    const io = req.app.get('io');
    if (io) {
      const hiredBids = await Bid.find({ gigId: gig._id, status: 'hired' });
      hiredBids.forEach(bid => {
        io.to(bid.freelancerId.toString()).emit('gig:completed', {
          gigId: gig._id,
          title: gig.title
        });
      });
    }

    res.json({ message: 'Gig marked as complete', gig });
  } catch (error) {
    console.error('Mark complete error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { forceDelete } = req.body; // Allow force delete option

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Only owner can delete
    if (gig.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the gig owner can delete it' });
    }

    // Check for hired freelancers
    const hiredBids = await Bid.find({ gigId: gig._id, status: 'hired' });
    
    if (hiredBids.length > 0 && !forceDelete) {
      return res.status(400).json({ 
        message: 'This gig has hired freelancers. Are you sure you want to delete?',
        hasHiredFreelancers: true,
        requiresConfirmation: true
      });
    }

    // Delete all associated bids
    await Bid.deleteMany({ gigId: gig._id });

    // Delete the gig
    await Gig.findByIdAndDelete(gigId);

    // Notify freelancers
    const io = req.app.get('io');
    if (io) {
      io.emit('gig:deleted', { gigId: gig._id });
    }

    res.json({ message: 'Gig deleted successfully' });
  } catch (error) {
    console.error('Delete gig error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};