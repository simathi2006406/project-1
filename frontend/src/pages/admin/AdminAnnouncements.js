import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { Spinner, EmptyState } from '../../components/UI';
import toast from 'react-hot-toast';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', targetRole: 'all', priority: 'normal' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await API.get('/announcements');
      setAnnouncements(data.announcements);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/announcements', form);
      toast.success('Announcement posted!');
      setShowForm(false);
      setForm({ title: '', content: '', targetRole: 'all', priority: 'normal' });
      fetchAnnouncements();
    } catch { toast.error('Failed to post'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      toast.success('Removed');
    } catch { toast.error('Failed to remove'); }
  };

  const priorityColors = { normal: 'bg-gray-100 text-gray-600', important: 'bg-yellow-100 text-yellow-700', urgent: 'bg-red-100 text-red-700' };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Announcements</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <span>📢</span> New Announcement
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">New Announcement</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input required className="input-field" placeholder="Announcement title"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea required rows={4} className="input-field resize-none" placeholder="Announcement content..."
                  value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                  <select className="input-field" value={form.targetRole}
                    onChange={e => setForm({ ...form, targetRole: e.target.value })}>
                    <option value="all">Everyone</option>
                    <option value="student">Students Only</option>
                    <option value="admin">Admins Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="input-field" value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Posting...' : 'Post Announcement'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {announcements.length === 0 ? (
        <EmptyState icon="📢" message="No announcements yet" />
      ) : (
        <div className="space-y-4">
          {announcements.map(a => (
            <div key={a._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-800">{a.title}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColors[a.priority]}`}>
                      {a.priority}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {a.targetRole === 'all' ? 'Everyone' : a.targetRole}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{a.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    By {a.createdBy?.name} • {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => handleDelete(a._id)}
                  className="text-red-400 hover:text-red-600 ml-4 text-lg">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
