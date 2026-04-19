const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  subject: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'overdue'], default: 'pending' },
  deadline: { type: Date, required: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submissions: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      fileUrl: String,
      fileName: String,
      submittedAt: { type: Date, default: Date.now },
      grade: { type: Number, default: null },
      feedback: { type: String, default: '' },
      status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' }
    }
  ],
  tags: [String],
  estimatedHours: { type: Number, default: 1 },
  aiPriorityScore: { type: Number, default: 0 }
}, { timestamps: true });

// Auto-compute AI priority score before save
taskSchema.pre('save', function () {
  const now = new Date();
  const hoursLeft = (this.deadline - now) / (1000 * 60 * 60);
  const urgency = hoursLeft < 24 ? 10 : hoursLeft < 72 ? 7 : hoursLeft < 168 ? 4 : 1;
  const workloadFactor = this.estimatedHours > 5 ? 3 : this.estimatedHours > 2 ? 2 : 1;
  const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
  this.aiPriorityScore = urgency * workloadFactor * (priorityMap[this.priority] || 1);
});

module.exports = mongoose.model('Task', taskSchema);
