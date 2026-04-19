const Announcement = require('../models/Announcement');
const User = require('../models/User');

// @GET /api/announcements
const getAnnouncements = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.user.role === 'student') filter.targetRole = { $in: ['all', 'student'] };
    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/announcements
const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, createdBy: req.user._id });

    // Push notification to all target users
    const targetFilter = req.body.targetRole === 'all' ? {} : { role: req.body.targetRole };
    await User.updateMany(targetFilter, {
      $push: { notifications: { message: `📢 New Announcement: ${announcement.title}` } }
    });

    res.status(201).json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @DELETE /api/announcements/:id
const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Announcement removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };
