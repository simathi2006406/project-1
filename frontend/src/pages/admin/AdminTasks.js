import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { StatusBadge, PriorityBadge, Spinner, EmptyState } from '../../components/UI';
import toast from 'react-hot-toast';

const initialForm = {
  title: '', description: '', subject: '', priority: 'medium',
  deadline: '', assignedTo: [], estimatedHours: 1, tags: ''
};

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [gradeForm, setGradeForm] = useState({ studentId: '', grade: '', feedback: '' });

  const fetchData = async () => {
    try {
      const [tasksRes, studentsRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/admin/students')
      ]);
      setTasks(tasksRes.data.tasks);
      setStudents(studentsRes.data.students);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        estimatedHours: Number(form.estimatedHours)
      };
      if (editId) {
        await API.put(`/tasks/${editId}`, payload);
        toast.success('Task updated!');
      } else {
        await API.post('/tasks', payload);
        toast.success('Task created!');
      }
      setShowForm(false);
      setForm(initialForm);
      setEditId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title, description: task.description, subject: task.subject,
      priority: task.priority, deadline: task.deadline?.split('T')[0],
      assignedTo: task.assignedTo.map(s => s._id),
      estimatedHours: task.estimatedHours,
      tags: task.tags?.join(', ') || ''
    });
    setEditId(task._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/tasks/${selectedTask._id}/grade`, gradeForm);
      toast.success('Graded successfully!');
      setSelectedTask(null);
      fetchData();
    } catch { toast.error('Failed to grade'); }
  };

  const toggleStudent = (id) => {
    setForm(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(id)
        ? prev.assignedTo.filter(s => s !== id)
        : [...prev.assignedTo, id]
    }));
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Task Management</h2>
        <button onClick={() => { setShowForm(true); setForm(initialForm); setEditId(null); }}
          className="btn-primary flex items-center gap-2">
          <span>➕</span> Create Task
        </button>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{editId ? 'Edit Task' : 'Create New Task'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input required className="input-field" placeholder="Task title"
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} className="input-field resize-none" placeholder="Task description"
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input className="input-field" placeholder="e.g. Data Structures"
                    value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="input-field" value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}>
                    {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                  <input required type="date" className="input-field"
                    value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                  <input type="number" min="1" className="input-field"
                    value={form.estimatedHours} onChange={e => setForm({ ...form, estimatedHours: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input className="input-field" placeholder="e.g. project, exam, lab"
                    value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Students</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {students.map(s => (
                      <label key={s._id} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="checkbox" checked={form.assignedTo.includes(s._id)}
                          onChange={() => toggleStudent(s._id)} className="rounded" />
                        <span>{s.name} <span className="text-gray-400">({s.department})</span></span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Saving...' : editId ? 'Update Task' : 'Create Task'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Grade Submissions — {selectedTask.title}</h3>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6">
              {selectedTask.submissions?.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No submissions yet</p>
              ) : (
                <div className="space-y-4">
                  {selectedTask.submissions.map((sub, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-sm">{sub.student?.name || 'Student'}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${sub.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {sub.status}
                        </span>
                      </div>
                      {sub.fileName && <p className="text-xs text-gray-500 mb-2">📎 {sub.fileName}</p>}
                      {sub.grade !== null ? (
                        <p className="text-sm text-green-600 font-semibold">Grade: {sub.grade}/100 — {sub.feedback}</p>
                      ) : (
                        <form onSubmit={handleGrade} className="space-y-2">
                          <input type="hidden" value={sub.student?._id}
                            onChange={() => setGradeForm({ ...gradeForm, studentId: sub.student?._id })} />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="number" min="0" max="100" required placeholder="Grade (0-100)"
                              className="input-field text-sm"
                              onChange={e => setGradeForm({ studentId: sub.student?._id, ...gradeForm, grade: e.target.value })} />
                            <input placeholder="Feedback" className="input-field text-sm"
                              onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} />
                          </div>
                          <button type="submit" className="btn-primary text-sm py-1.5 w-full"
                            onClick={() => setGradeForm(g => ({ ...g, studentId: sub.student?._id }))}>
                            Submit Grade
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      {tasks.length === 0 ? (
        <EmptyState icon="📋" message="No tasks yet. Create your first task!" />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Title', 'Subject', 'Priority', 'Status', 'Deadline', 'Assigned', 'AI Score', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tasks.map(task => (
                  <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{task.title}</td>
                    <td className="px-4 py-3 text-gray-500">{task.subject || '—'}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                    <td className="px-4 py-3 text-gray-500">{new Date(task.deadline).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-500">{task.assignedTo?.length || 0} students</td>
                    <td className="px-4 py-3">
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                        {task.aiPriorityScore}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(task)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                        <button onClick={() => setSelectedTask(task)}
                          className="text-green-600 hover:text-green-800 text-xs font-medium">Grade</button>
                        <button onClick={() => handleDelete(task._id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;
