const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getTasks, createTask, getTask, updateTask,
  deleteTask, submitTask, gradeSubmission, getAISuggestions
} = require('../controllers/taskController');

router.get('/ai/suggestions', protect, getAISuggestions);
router.get('/', protect, getTasks);
router.post('/', protect, adminOnly, createTask);
router.get('/:id', protect, getTask);
router.put('/:id', protect, adminOnly, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);
router.post('/:id/submit', protect, submitTask);
router.put('/:id/grade', protect, adminOnly, gradeSubmission);

module.exports = router;
