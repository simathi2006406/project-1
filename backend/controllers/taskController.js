const Task = require('../models/Task');
const User = require('../models/User');

// @GET /api/tasks - Get tasks (role-based)
const getTasks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.assignedTo = req.user._id;

    const { status, priority, subject } = req.query;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (subject) query.subject = new RegExp(subject, 'i');

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ aiPriorityScore: -1, deadline: 1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/tasks - Create task (admin)
const createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user._id });

    // Notify assigned students
    if (req.body.assignedTo && req.body.assignedTo.length > 0) {
      await User.updateMany(
        { _id: { $in: req.body.assignedTo } },
        { $push: { notifications: { message: `New task assigned: ${task.title}` } } }
      );
    }

    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/tasks/:id - Get single task
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email department')
      .populate('submissions.student', 'name email');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/tasks/:id - Update task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @DELETE /api/tasks/:id - Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/tasks/:id/submit - Student submits task
const submitTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Check if already submitted
    const alreadySubmitted = task.submissions.find(
      (s) => s.student.toString() === req.user._id.toString()
    );
    if (alreadySubmitted) return res.status(400).json({ success: false, message: 'Already submitted' });

    task.submissions.push({
      student: req.user._id,
      fileUrl: req.body.fileUrl || '',
      fileName: req.body.fileName || '',
      submittedAt: new Date()
    });

    // Update status if all assigned students submitted
    if (task.submissions.length >= task.assignedTo.length) task.status = 'completed';
    else task.status = 'in-progress';

    await task.save();
    res.json({ success: true, message: 'Task submitted successfully', task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/tasks/:id/grade - Admin grades submission
const gradeSubmission = async (req, res) => {
  try {
    const { studentId, grade, feedback } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const submission = task.submissions.find((s) => s.student.toString() === studentId);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';
    await task.save();

    // Notify student
    await User.findByIdAndUpdate(studentId, {
      $push: { notifications: { message: `Your submission for "${task.title}" has been graded: ${grade}/100` } }
    });

    res.json({ success: true, message: 'Graded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/tasks/ai/suggestions - AI-based task suggestions for student
const getAISuggestions = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id,
      status: { $in: ['pending', 'in-progress'] }
    }).sort({ aiPriorityScore: -1 });

    const suggestions = tasks.slice(0, 5).map((task) => {
      const hoursLeft = Math.max(0, (new Date(task.deadline) - new Date()) / (1000 * 60 * 60));
      let advice = '';
      if (hoursLeft < 24) advice = '🚨 Critical! Start immediately — deadline in less than 24 hours.';
      else if (hoursLeft < 72) advice = '⚠️ High urgency — allocate focused time today.';
      else if (hoursLeft < 168) advice = '📅 Plan this week — break into smaller sessions.';
      else advice = '✅ Good time buffer — schedule regular study sessions.';

      return {
        taskId: task._id,
        title: task.title,
        deadline: task.deadline,
        priority: task.priority,
        aiScore: task.aiPriorityScore,
        hoursLeft: Math.round(hoursLeft),
        advice,
        estimatedHours: task.estimatedHours
      };
    });

    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasks, createTask, getTask, updateTask, deleteTask, submitTask, gradeSubmission, getAISuggestions };
