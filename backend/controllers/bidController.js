import Gig from '../models/Gig.js';
import Bid from '../models/Bid.js';

export const submitBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    if (!gigId || !message || price === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const gig = await Gig.findById(gigId).populate('ownerId');
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'This gig is no longer accepting bids' });
    }

    // Check if user is trying to bid on their own gig
    if (!gig.ownerId) {
      return res.status(400).json({ message: 'Gig owner information is missing' });
    }

    const gigOwnerId = gig.ownerId._id ? gig.ownerId._id.toString() : gig.ownerId.toString();
    const currentUserId = req.user.userId.toString();

    if (gigOwnerId === currentUserId) {
      return res.status(400).json({ message: 'Cannot bid on your own gig' });
    }

    // Check if user has an active bid (pending, hired, or counter-offered)
    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.user.userId,
      status: { $in: ['pending', 'hired', 'counter-offered'] }
    });

    if (existingBid) {
      if (existingBid.status === 'hired') {
        return res.status(400).json({ message: 'You have already been hired for this gig' });
      } else if (existingBid.status === 'counter-offered') {
        return res.status(400).json({ message: 'Please respond to the counter-offer first' });
      } else {
        return res.status(400).json({ message: 'You have already submitted a bid for this gig' });
      }
    }

    const bid = await Bid.create({
      gigId,
      freelancerId: req.user.userId,
      message,
      price,
      status: 'pending'
    });

    // Populate bid details for response
    const populatedBid = await Bid.findById(bid._id)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title ownerId');

    // Get owner ID for Socket emission
    const ownerIdForSocket = gig.ownerId._id ? gig.ownerId._id.toString() : gig.ownerId.toString();

    // Emit real-time event to gig owner
    const io = req.app.get('io');
    if (io) {
      io.emitToUser(ownerIdForSocket, 'bid:submitted', {
        bid: populatedBid,
        gigOwnerId: ownerIdForSocket
      });
      // Also emit to all for notification count updates
      io.emit('bid:submitted', {
        bid: populatedBid,
        gigOwnerId: ownerIdForSocket
      });
      console.log('📢 Emitted bid:submitted event for gig:', gig.title, 'to owner:', ownerIdForSocket);
    }

    res.status(201).json(populatedBid);
  } catch (error) {
    console.error('Submit bid error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getBidsForGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const hireBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId).populate('gigId');
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const gig = bid.gigId;

    // Verify the user is the gig owner
    if (gig.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to hire for this gig' });
    }

    if (bid.status === 'hired') {
      return res.status(400).json({ message: 'This bid has already been hired' });
    }

    if (gig.status === 'assigned') {
      return res.status(400).json({ message: 'This gig has already been assigned' });
    }

    // Reject all other bids for this gig
    await Bid.updateMany(
      { gigId: bid.gigId, _id: { $ne: bidId } },
      { status: 'rejected' }
    );

    bid.status = 'hired';
    await bid.save();

    gig.status = 'assigned';
    await gig.save();

    // Emit real-time event to all affected users
    const io = req.app.get('io');
    if (io) {
      // Get all bids for this gig to notify rejected bidders
      const allBids = await Bid.find({ gigId: bid.gigId });

      io.emit('bid:hired', {
        bidId: bid._id.toString(),
        gigId: gig._id.toString(),
        freelancerId: bid.freelancerId.toString(),
        gigOwnerId: gig.ownerId.toString(),
        rejectedBidders: allBids
          .filter(b => b.status === 'rejected')
          .map(b => b.freelancerId.toString())
      });
      console.log('📢 Emitted bid:hired event for gig:', gig.title);
    }

    res.json({ message: 'Bid hired successfully', bid });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const rejectBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId).populate('gigId');
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const gig = bid.gigId;

    // Verify the user is the gig owner
    if (gig.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to reject this bid' });
    }

    if (bid.status === 'hired') {
      return res.status(400).json({ message: 'Cannot reject a hired bid' });
    }

    if (bid.status === 'rejected') {
      return res.status(400).json({ message: 'This bid has already been rejected' });
    }

    bid.status = 'rejected';
    await bid.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('bid:rejected', {
        bidId: bid._id.toString(),
        freelancerId: bid.freelancerId.toString(),
        gigId: gig._id.toString()
      });
      console.log('📢 Emitted bid:rejected event');
    }

    res.json({ message: 'Bid rejected successfully', bid });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user.userId })
      .populate('gigId')
      .populate('gigId.ownerId', 'name email')
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const counterOffer = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { price, message } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({ message: 'Valid counter-offer price is required' });
    }

    const bid = await Bid.findById(bidId).populate('gigId').populate('freelancerId', 'name email');
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Verify the user is the gig owner
    if (bid.gigId.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update bid with counter-offer
    bid.status = 'counter-offered';
    bid.counterOffer = {
      price,
      message: message || `Counter-offer: $${price}`,
      createdAt: new Date()
    };
    await bid.save();

    // Populate for response
    const populatedBid = await Bid.findById(bid._id)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title ownerId');

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('bid:counter-offered', {
        bid: populatedBid,
        freelancerId: bid.freelancerId._id.toString()
      });
      console.log('📢 Emitted bid:counter-offered event');
    }

    res.json({ message: 'Counter-offer sent successfully', bid: populatedBid });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const acceptCounterOffer = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId).populate('gigId');
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Verify the user is the freelancer
    if (bid.freelancerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (bid.status !== 'counter-offered') {
      return res.status(400).json({ message: 'No counter-offer to accept' });
    }

    // Accept counter-offer: update bid price and hire
    bid.price = bid.counterOffer.price;
    bid.status = 'hired';
    await bid.save();

    // Reject other bids
    await Bid.updateMany(
      { gigId: bid.gigId, _id: { $ne: bidId } },
      { status: 'rejected' }
    );

    // Update gig status
    const gig = bid.gigId;
    gig.status = 'assigned';
    await gig.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      const allBids = await Bid.find({ gigId: bid.gigId });
      io.emit('bid:hired', {
        bidId: bid._id.toString(),
        gigId: gig._id.toString(),
        freelancerId: bid.freelancerId.toString(),
        gigOwnerId: gig.ownerId.toString(),
        rejectedBidders: allBids
          .filter(b => b.status === 'rejected')
          .map(b => b.freelancerId.toString())
      });
      console.log('📢 Emitted bid:hired event after counter-offer acceptance');
    }

    res.json({ message: 'Counter-offer accepted and bid hired successfully', bid });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};