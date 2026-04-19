const User = require('../models/User');
const Task = require('../models/Task');

// @GET /api/admin/students - Get all students
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/admin/analytics - Overall analytics
const getAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });
    const overdueTasks = await Task.countDocuments({ status: 'overdue' });

    // Task distribution by subject
    const subjectStats = await Task.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // Monthly task creation trend
    const monthlyTrend = await Task.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    // Top performing students (by graded submissions)
    const topStudents = await Task.aggregate([
      { $unwind: '$submissions' },
      { $match: { 'submissions.grade': { $ne: null } } },
      {
        $group: {
          _id: '$submissions.student',
          avgGrade: { $avg: '$submissions.grade' },
          totalSubmissions: { $sum: 1 }
        }
      },
      { $sort: { avgGrade: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $project: { name: '$student.name', avgGrade: 1, totalSubmissions: 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        totalStudents, totalTasks, completedTasks, pendingTasks,
        inProgressTasks, overdueTasks, subjectStats, monthlyTrend, topStudents,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/admin/student/:id/performance - Individual student performance
const getStudentPerformance = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const assignedTasks = await Task.find({ assignedTo: req.params.id });
    const submittedTasks = assignedTasks.filter((t) =>
      t.submissions.some((s) => s.student.toString() === req.params.id)
    );
    const gradedSubmissions = assignedTasks.flatMap((t) =>
      t.submissions.filter((s) => s.student.toString() === req.params.id && s.grade !== null)
    );

    const avgGrade = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length
      : 0;

    res.json({
      success: true,
      performance: {
        student,
        totalAssigned: assignedTasks.length,
        totalSubmitted: submittedTasks.length,
        submissionRate: assignedTasks.length > 0
          ? Math.round((submittedTasks.length / assignedTasks.length) * 100) : 0,
        avgGrade: Math.round(avgGrade),
        gradedCount: gradedSubmissions.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @DELETE /api/admin/student/:id - Remove student
const deleteStudent = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Student removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStudents, getAnalytics, getStudentPerformance, deleteStudent };
