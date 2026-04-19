const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');

router.get('/', protect, getAnnouncements);
router.post('/', protect, adminOnly, createAnnouncement);
router.delete('/:id', protect, adminOnly, deleteAnnouncement);

module.exports = router;
