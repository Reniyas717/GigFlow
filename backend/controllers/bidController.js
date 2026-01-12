import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';

export const submitBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    if (!gigId || !message || price === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Gig is no longer open' });
    }

    // Check if user is trying to bid on their own gig
    // Convert both to strings for proper comparison
    const gigOwnerId = gig.ownerId._id ? gig.ownerId._id.toString() : gig.ownerId.toString();
    const currentUserId = req.user.userId.toString();

    if (gigOwnerId === currentUserId) {
      return res.status(400).json({ message: 'Cannot bid on your own gig' });
    }

    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.user.userId
    });

    if (existingBid) {
      return res.status(400).json({ message: 'Already submitted a bid for this gig' });
    }

    const bid = await Bid.create({
      gigId,
      freelancerId: req.user.userId,
      message,
      price,
      status: 'pending'
    });

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getBidsForGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to view bids' });
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const hireBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const gig = await Gig.findById(bid.gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only gig owner can hire' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Gig is not open' });
    }

    await Bid.updateMany(
      { gigId: bid.gigId, _id: { $ne: bidId } },
      { status: 'rejected' }
    );

    bid.status = 'hired';
    await bid.save();

    gig.status = 'assigned';
    await gig.save();

    res.json({ message: 'Bid hired successfully', bid });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};