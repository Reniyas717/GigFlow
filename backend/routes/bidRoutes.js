import express from 'express';
import { submitBid, getBidsForGig, hireBid } from '../controllers/bidController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, submitBid);
router.get('/:gigId', authenticate, getBidsForGig);
router.patch('/:bidId/hire', authenticate, hireBid);

export default router;