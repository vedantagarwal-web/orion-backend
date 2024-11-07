import User from '../models/User.js';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';

export const getAdminStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    const previousThirtyDays = new Date(now.setDate(now.getDate() - 30));

    // Get current stats
    const [
      totalUsers,
      totalEvents,
      totalRevenue,
      activeUsers,
      previousMonthUsers,
      previousMonthEvents,
      previousMonthRevenue,
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Ticket.aggregate([
        { $group: { _id: null, total: { $sum: '$ticketTier.price' } } }
      ]),
      User.countDocuments({ lastActive: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: previousThirtyDays, $lt: thirtyDaysAgo } }),
      Event.countDocuments({ createdAt: { $gte: previousThirtyDays, $lt: thirtyDaysAgo } }),
      Ticket.aggregate([
        { $match: { createdAt: { $gte: previousThirtyDays, $lt: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$ticketTier.price' } } }
      ]),
    ]);

    // Calculate growth percentages
    const currentRevenue = totalRevenue[0]?.total || 0;
    const prevRevenue = previousMonthRevenue[0]?.total || 0;
    const currentUserCount = totalUsers;
    const prevUserCount = previousMonthUsers;

    const stats = {
      totalUsers,
      totalEvents,
      totalRevenue: currentRevenue,
      activeUsers,
      userGrowth: prevUserCount ? ((currentUserCount - prevUserCount) / prevUserCount) * 100 : 0,
      eventGrowth: 0, // Calculate similar to userGrowth
      revenueGrowth: prevRevenue ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0,
    };

    // Get revenue data for chart
    const revenueData = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$ticketTier.price' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get category distribution data
    const categoryData = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          value: { $sum: 1 }
        }
      }
    ]);

    res.json({
      ...stats,
      revenueData,
      categoryData: categoryData.map(item => ({
        name: item._id,
        value: item.value
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin stats', error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};

export const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const event = await Event.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('organizer', 'firstName lastName email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event status', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    // Also delete related tickets
    await Ticket.deleteMany({ event: id });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
}; 