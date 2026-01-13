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

    // Check if gig is accepting bids (open or assigned but not filled)
    if (gig.status === 'filled') {
      return res.status(400).json({ message: 'This gig has filled all positions' });
    }

    // Check if there are still positions available
    const positionsFilled = gig.positionsFilled || 0;
    const positionsAvailable = gig.positionsAvailable || 1;
    if (positionsFilled >= positionsAvailable) {
      return res.status(400).json({ message: 'All positions for this gig have been filled' });
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
      // Broadcast position update to all users
      io.emit('gig:positionsUpdate', {
        gigId: gig._id.toString(),
        positionsFilled,
        positionsAvailable,
        remainingPositions: positionsAvailable - positionsFilled
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
    
    console.log('Fetching bids for gigId:', gigId);
    
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Check if user is the gig owner or an admin
    const isOwner = gig.ownerId.toString() === req.user.userId;
    const isAdmin = gig.admins && gig.admins.some(id => id.toString() === req.user.userId);
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view bids for this gig' });
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email avatar skills')
      .sort({ createdAt: -1 });

    console.log('Found bids:', bids.length);
    res.json(bids);
  } catch (error) {
    console.error('Get bids error:', error);
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

    // Authorization check: Owner OR Admin can hire
    const isOwner = gig.ownerId.toString() === req.user.userId;
    const isAdmin = gig.admins && gig.admins.some(id => id.toString() === req.user.userId);
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to hire for this gig' });
    }

    // ATOMIC CHECK: Try to increment positions if available
    const gigUpdate = await Gig.findOneAndUpdate(
      {
        _id: gig._id,
        $expr: { $lt: ['$positionsFilled', '$positionsAvailable'] }, // Use $expr for field comparison
        status: { $ne: 'filled' }
      },
      {
        $inc: { positionsFilled: 1 }
      },
      {
        new: true,
        runValidators: true
      }
    );

    // Position was already taken by another admin
    if (!gigUpdate) {
      return res.status(409).json({ 
        message: 'All positions have been filled. Another admin just hired someone.',
        conflict: true
      });
    }

    // ATOMIC BID UPDATE: Only hire if still pending
    const bidUpdate = await Bid.findOneAndUpdate(
      {
        _id: bidId,
        status: 'pending'
      },
      {
        $set: { 
          status: 'hired',
          hiredBy: req.user.userId,
          hiredAt: new Date()
        }
      },
      {
        new: true
      }
    );

    // Bid was already hired or rejected by another admin
    if (!bidUpdate) {
      // ROLLBACK: Decrement position back
      await Gig.findByIdAndUpdate(gig._id, {
        $inc: { positionsFilled: -1 }
      });
      
      return res.status(409).json({ 
        message: 'This bid has already been processed by another admin.',
        conflict: true
      });
    }

    // Check if all positions are now filled
    if (gigUpdate.positionsFilled >= gigUpdate.positionsAvailable) {
      await Gig.findByIdAndUpdate(gig._id, {
        $set: { status: 'filled' }
      });
      
      // Reject all remaining pending bids atomically
      await Bid.updateMany(
        { 
          gigId: gig._id, 
          status: 'pending'
        },
        { 
          $set: { 
            status: 'rejected',
            rejectedReason: 'All positions filled'
          }
        }
      );
    }

    // Emit real-time events
    const io = req.app.get('io');
    if (io) {
      const allBids = await Bid.find({ gigId: gig._id });

      io.emit('bid:hired', {
        bidId: bidUpdate._id.toString(),
        gigId: gig._id.toString(),
        freelancerId: bidUpdate.freelancerId.toString(),
        gigOwnerId: gig.ownerId.toString(),
        hiredBy: req.user.userId,
        rejectedBidders: allBids
          .filter(b => b.status === 'rejected')
          .map(b => b.freelancerId.toString())
      });

      io.emit('gig:positionsUpdate', {
        gigId: gig._id.toString(),
        positionsFilled: gigUpdate.positionsFilled,
        positionsAvailable: gigUpdate.positionsAvailable,
        remainingPositions: gigUpdate.positionsAvailable - gigUpdate.positionsFilled,
        status: gigUpdate.status
      });
    }

    res.json({ 
      message: 'Bid hired successfully', 
      bid: bidUpdate,
      remainingPositions: gigUpdate.positionsAvailable - gigUpdate.positionsFilled
    });
  } catch (error) {
    console.error('Hire bid error:', error);
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
      { gigId: bid.gigId, _id: { $ne: bidId }, status: 'pending' },
      { $set: { status: 'rejected', rejectedReason: 'Replaced by counter-offer acceptance' } }
    );

    // Update gig positions if necessary
    const gigUpdate = await Gig.findById(bid.gigId);
    if (gigUpdate) {
      const positionsFilled = gigUpdate.positionsFilled || 0;
      const positionsAvailable = gigUpdate.positionsAvailable || 1;

      if (positionsFilled < positionsAvailable) {
        await Gig.findByIdAndUpdate(bid.gigId, { $inc: { positionsFilled: 1 } });
      }
    }

    // Emit real-time events
    const io = req.app.get('io');
    if (io) {
      io.emit('bid:accepted', {
        bidId: bid._id.toString(),
        gigId: bid.gigId.toString(),
        freelancerId: bid.freelancerId.toString(),
        gigOwnerId: bid.gigId.ownerId.toString()
      });

      // Update gig positions
      const updatedGig = await Gig.findById(bid.gigId);
      if (updatedGig) {
        io.emit('gig:positionsUpdate', {
          gigId: updatedGig._id.toString(),
          positionsFilled: updatedGig.positionsFilled,
          positionsAvailable: updatedGig.positionsAvailable,
          remainingPositions: updatedGig.positionsAvailable - updatedGig.positionsFilled,
          status: updatedGig.status
        });
      }
    }

    res.json({ message: 'Counter-offer accepted and bid hired', bid });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};