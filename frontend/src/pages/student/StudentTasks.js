import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { StatusBadge, PriorityBadge, Spinner, EmptyState } from '../../components/UI';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const StudentTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitForm, setSubmitForm] = useState({ fileName: '', fileUrl: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/tasks');
      setTasks(data.tasks);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post(`/tasks/${selectedTask._id}/submit`, submitForm);
      toast.success('Task submitted successfully!');
      setSelectedTask(null);
      setSubmitForm({ fileName: '', fileUrl: '' });
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitted = (task) =>
    task.submissions?.some(s => s.student?._id === user?.id || s.student === user?.id);

  const getMySubmission = (task) =>
    task.submissions?.find(s => s.student?._id === user?.id || s.student === user?.id);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const getDeadlineColor = (deadline) => {
    const hours = (new Date(deadline) - new Date()) / (1000 * 60 * 60);
    if (hours < 0) return 'text-red-600';
    if (hours < 24) return 'text-red-500';
    if (hours < 72) return 'text-orange-500';
    return 'text-gray-500';
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">My Tasks ({tasks.length})</h2>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'in-progress', 'completed', 'overdue'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize
                ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Submit Task</h3>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <p className="font-semibold text-blue-800">{selectedTask.title}</p>
                <p className="text-sm text-blue-600 mt-1">{selectedTask.description}</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                  <input className="input-field" placeholder="e.g. assignment.pdf"
                    value={submitForm.fileName}
                    onChange={e => setSubmitForm({ ...submitForm, fileName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File URL / Drive Link</label>
                  <input className="input-field" placeholder="https://drive.google.com/..."
                    value={submitForm.fileUrl}
                    onChange={e => setSubmitForm({ ...submitForm, fileUrl: e.target.value })} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Submitting...' : '📤 Submit Task'}
                  </button>
                  <button type="button" onClick={() => setSelectedTask(null)} className="btn-secondary flex-1">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon="📋" message="No tasks found" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(task => {
            const submitted = isSubmitted(task);
            const mySubmission = getMySubmission(task);
            const hoursLeft = (new Date(task.deadline) - new Date()) / (1000 * 60 * 60);

            return (
              <div key={task._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{task.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{task.subject}</p>
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>

                <div className="flex items-center justify-between text-xs mb-3">
                  <span className={`font-medium ${getDeadlineColor(task.deadline)}`}>
                    📅 {new Date(task.deadline).toLocaleDateString()}
                    {hoursLeft > 0 && hoursLeft < 72 && ` (${Math.round(hoursLeft)}h left)`}
                    {hoursLeft < 0 && ' (Overdue)'}
                  </span>
                  <span className="text-gray-400">⏱️ ~{task.estimatedHours}h</span>
                </div>

                {/* Tags */}
                {task.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {task.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}

                {/* AI Score */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">AI Priority Score</span>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    🤖 {task.aiPriorityScore}
                  </span>
                </div>

                {/* Submission status */}
                {submitted ? (
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-green-700 text-sm font-medium">✅ Submitted</p>
                    {mySubmission?.fileName && <p className="text-xs text-green-600">📎 {mySubmission.fileName}</p>}
                    {mySubmission?.grade !== null && mySubmission?.grade !== undefined && (
                      <p className="text-sm font-bold text-green-700 mt-1">
                        Grade: {mySubmission.grade}/100
                        {mySubmission.feedback && <span className="font-normal text-green-600"> — {mySubmission.feedback}</span>}
                      </p>
                    )}
                  </div>
                ) : (
                  <button onClick={() => setSelectedTask(task)}
                    disabled={task.status === 'completed'}
                    className="btn-primary w-full text-sm py-2">
                    📤 Submit Task
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentTasks;
