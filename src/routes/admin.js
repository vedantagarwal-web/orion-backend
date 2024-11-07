import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import {
  getAdminStats,
  getUsers,
  getEvents,
  updateUserStatus,
  updateEventStatus,
  deleteUser,
  deleteEvent,
} from '../controllers/adminController.js';

const router = express.Router();

// Protect all admin routes
router.use(auth, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.get('/events', getEvents);
router.put('/users/:id/status', updateUserStatus);
router.put('/events/:id/status', updateEventStatus);
router.delete('/users/:id', deleteUser);
router.delete('/events/:id', deleteEvent);

export default router; 