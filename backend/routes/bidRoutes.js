import express from 'express';
import { submitBid, getBidsForGig, hireBid, rejectBid, getMyBids, counterOffer, acceptCounterOffer } from '../controllers/bidController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, submitBid);
router.get('/my-bids', authenticate, getMyBids);
router.get('/:gigId', authenticate, getBidsForGig);
router.patch('/:bidId/hire', authenticate, hireBid);
router.patch('/:bidId/reject', authenticate, rejectBid);
router.patch('/:bidId/counter-offer', authenticate, counterOffer);
router.patch('/:bidId/accept-counter', authenticate, acceptCounterOffer);

export default router;
