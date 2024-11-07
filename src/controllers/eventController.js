import Event from '../models/Event.js';
import { validateEventData } from '../utils/validation.js';
import { uploadImage } from '../utils/imageUpload.js';

export const createEvent = async (req, res) => {
  try {
    const eventData = { ...req.body, organizer: req.user.id };

    // Handle image uploads if any
    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(file => uploadImage(file))
      );
      eventData.images = imageUrls.map(url => ({ url }));
    }

    const event = new Event(eventData);
    await event.save();

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      message: 'Error creating event', 
      error: error.message 
    });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { category, search, date, status } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (date) query.date = { $gte: new Date(date) };
    if (search) {
      query.$text = { $search: search };
    }

    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName')
      .populate('attendees', 'firstName lastName');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.remove();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
}; 