import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import multer from 'multer';
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post('/', auth, authorize('organizer', 'admin'), upload.array('images'), createEvent);
router.get('/', getEvents);
router.get('/:id', getEvent);
router.put('/:id', auth, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', auth, authorize('organizer', 'admin'), deleteEvent);

export default router; 