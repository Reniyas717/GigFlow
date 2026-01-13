import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  submitBid,
  getBidsForGig,
  hireBid,
  rejectBid,
  getMyBids,
  counterOffer,
  acceptCounterOffer
} from '../controllers/bidController.js';

const router = express.Router();

// Submit a bid
router.post('/submit', authenticate, submitBid);

// Get all bids for a specific gig (for gig owner)
router.get('/gig/:gigId', authenticate, getBidsForGig);

// Get my bids (as freelancer)
router.get('/my-bids', authenticate, getMyBids);

// Hire a bid
router.post('/:bidId/hire', authenticate, hireBid);

// Reject a bid
router.post('/:bidId/reject', authenticate, rejectBid);

// Counter offer
router.post('/:bidId/counter-offer', authenticate, counterOffer);

// Accept counter offer
router.post('/:bidId/accept-counter', authenticate, acceptCounterOffer);

export default router;
