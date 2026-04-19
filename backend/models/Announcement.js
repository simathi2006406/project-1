const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, enum: ['all', 'student', 'admin'], default: 'all' },
  priority: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
