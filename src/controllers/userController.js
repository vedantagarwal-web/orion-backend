import User from '../models/User.js';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import { uploadImage } from '../utils/imageUpload.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('createdEvents')
      .populate('purchasedTickets');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;
    let profileImage = req.user.profileImage;

    // Handle image upload if provided
    if (req.file) {
      profileImage = await uploadImage(req.file);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
        phoneNumber,
        profileImage,
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const [upcomingEvents, pastEvents, tickets] = await Promise.all([
      Event.find({
        organizer: req.user.id,
        date: { $gt: new Date() },
      }).count(),
      Event.find({
        organizer: req.user.id,
        date: { $lte: new Date() },
      }).count(),
      Ticket.find({ user: req.user.id }).count(),
    ]);

    // Get activity data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activityData = await Event.aggregate([
      {
        $match: {
          organizer: req.user._id,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    res.json({
      upcomingEvents,
      pastEvents,
      ticketsPurchased: tickets,
      activityData: activityData.map(item => ({
        date: item._id,
        events: item.count,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user stats', error: error.message });
  }
};

export const getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
      .sort({ date: -1 })
      .populate('organizer', 'firstName lastName');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user events', error: error.message });
  }
};

export const getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .populate({
        path: 'event',
        select: 'title date location images',
        populate: { path: 'organizer', select: 'firstName lastName' },
      });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user tickets', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = await uploadImage(req.file);
    res.json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
}; 