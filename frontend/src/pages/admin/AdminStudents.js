import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { Spinner, EmptyState } from '../../components/UI';
import toast from 'react-hot-toast';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/admin/students').then(({ data }) => {
      setStudents(data.students);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const viewPerformance = async (student) => {
    setSelected(student);
    try {
      const { data } = await API.get(`/admin/student/${student._id}/performance`);
      setPerformance(data.performance);
    } catch { toast.error('Failed to load performance'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this student?')) return;
    try {
      await API.delete(`/admin/student/${id}`);
      setStudents(prev => prev.filter(s => s._id !== id));
      toast.success('Student removed');
    } catch { toast.error('Failed to remove'); }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Students ({students.length})</h2>
        <input className="input-field w-64" placeholder="🔍 Search students..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Performance Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Performance — {selected.name}</h3>
              <button onClick={() => { setSelected(null); setPerformance(null); }}
                className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6">
              {!performance ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Tasks Assigned', value: performance.totalAssigned, icon: '📋' },
                      { label: 'Submitted', value: performance.totalSubmitted, icon: '📤' },
                      { label: 'Submission Rate', value: `${performance.submissionRate}%`, icon: '📊' },
                      { label: 'Avg Grade', value: `${performance.avgGrade}/100`, icon: '⭐' },
                    ].map(item => (
                      <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-2xl mb-1">{item.icon}</p>
                        <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                        <p className="text-xs text-gray-500">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Submission Rate</span>
                      <span className="font-semibold">{performance.submissionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${performance.submissionRate}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Average Grade</span>
                      <span className="font-semibold">{performance.avgGrade}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${performance.avgGrade >= 75 ? 'bg-green-500' : performance.avgGrade >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${performance.avgGrade}%` }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon="👥" message="No students found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(student => (
            <div key={student._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{student.name}</p>
                    <p className="text-xs text-gray-400">{student.email}</p>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Sem {student.semester}
                </span>
              </div>
              <div className="space-y-1 mb-4">
                <p className="text-sm text-gray-500">🏛️ {student.department || 'N/A'}</p>
                <p className="text-sm text-gray-500">📅 Joined {new Date(student.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => viewPerformance(student)}
                  className="btn-primary text-xs py-1.5 flex-1">View Performance</button>
                <button onClick={() => handleDelete(student._id)}
                  className="btn-danger text-xs py-1.5 px-3">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
