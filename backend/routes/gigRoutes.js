import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createGig,
  getGigs,
  getAllGigs,
  getGigById,
  assignAdmin,
  removeAdmin,
  markGigComplete,
  deleteGig
} from '../controllers/gigController.js';

const router = express.Router();

// Add root POST route that also creates a gig
router.post('/', authenticate, createGig);
router.post('/create', authenticate, createGig);
router.get('/', authenticate, getGigs);
router.get('/all', authenticate, getAllGigs);
router.get('/:gigId', authenticate, getGigById);
router.post('/:gigId/assign-admin', authenticate, assignAdmin);
router.post('/:gigId/remove-admin', authenticate, removeAdmin);
router.post('/:gigId/complete', authenticate, markGigComplete);
router.delete('/:gigId', authenticate, deleteGig);

export default router;