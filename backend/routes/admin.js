const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getStudents, getAnalytics, getStudentPerformance, deleteStudent } = require('../controllers/adminController');

router.get('/students', protect, adminOnly, getStudents);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/student/:id/performance', protect, adminOnly, getStudentPerformance);
router.delete('/student/:id', protect, adminOnly, deleteStudent);

module.exports = router;
