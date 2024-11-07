import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import {
  getUserProfile,
  updateUserProfile,
  getUserStats,
  getUserEvents,
  getUserTickets,
  changePassword,
  uploadProfileImage,
} from '../controllers/userController.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  },
});

router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);
router.get('/stats', auth, getUserStats);
router.get('/events', auth, getUserEvents);
router.get('/tickets', auth, getUserTickets);
router.put('/change-password', auth, changePassword);
router.post('/upload-image', auth, upload.single('image'), uploadProfileImage);

export default router; 