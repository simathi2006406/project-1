const User = require('../models/User');

// @GET /api/notifications - Get user notifications
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json({ success: true, notifications: user.notifications.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/notifications/read - Mark all as read
const markAllRead = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { 'notifications.$[].read': true } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getNotifications, markAllRead };
