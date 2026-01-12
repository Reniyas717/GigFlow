import express from 'express';
import { createGig, getGigs } from '../controllers/gigController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getGigs);
router.post('/', authenticate, createGig);

export default router;