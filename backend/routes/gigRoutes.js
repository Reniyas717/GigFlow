import express from 'express';
import { createGig, getGigs, getAllGigs, assignAdmin, removeAdmin, getGigById } from '../controllers/gigController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getGigs);
router.get('/all', authenticate, getAllGigs);
router.post('/', authenticate, createGig);
router.post('/:gigId/assign-admin', authenticate, assignAdmin);
router.post('/:gigId/remove-admin', authenticate, removeAdmin);
router.get('/:gigId', authenticate, getGigById);

export default router;