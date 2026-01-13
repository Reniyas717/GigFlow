import express from 'express';
import { createGig, getGigs, getAllGigs } from '../controllers/gigController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getGigs);
router.get('/all', authenticate, getAllGigs);
router.post('/', authenticate, createGig);

export default router;