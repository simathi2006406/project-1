import React, { useEffect, useState } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import API from '../../utils/api';
import { Spinner } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';

const StudentProgress = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/tasks').then(({ data }) => {
      setTasks(data.tasks);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const overdue = tasks.filter(t => t.status === 'overdue').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Grades from submissions
  const gradedSubmissions = tasks.flatMap(t =>
    t.submissions?.filter(s => (s.student?._id === user?.id || s.student === user?.id) && s.grade !== null) || []
  );
  const avgGrade = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length)
    : 0;

  // Subject-wise breakdown
  const subjectMap = {};
  tasks.forEach(t => {
    const sub = t.subject || 'Other';
    if (!subjectMap[sub]) subjectMap[sub] = { total: 0, completed: 0 };
    subjectMap[sub].total++;
    if (t.status === 'completed') subjectMap[sub].completed++;
  });
  const subjectData = Object.entries(subjectMap).map(([name, v]) => ({
    name, total: v.total, completed: v.completed,
    rate: Math.round((v.completed / v.total) * 100)
  }));

  const radialData = [{ name: 'Completion', value: completionRate, fill: '#3b82f6' }];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">My Progress</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Completion Rate', value: `${completionRate}%`, icon: '🎯', color: 'from-blue-500 to-blue-600' },
          { label: 'Avg Grade', value: avgGrade > 0 ? `${avgGrade}/100` : 'N/A', icon: '⭐', color: 'from-yellow-500 to-orange-500' },
          { label: 'Completed', value: completed, icon: '✅', color: 'from-green-500 to-green-600' },
          { label: 'Overdue', value: overdue, icon: '⚠️', color: 'from-red-500 to-red-600' },
        ].map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white`}>
            <p className="text-3xl mb-1">{card.icon}</p>
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-sm opacity-80">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radial Progress */}
        <div className="card flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 self-start">Overall Completion</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={10} fill="#3b82f6" background={{ fill: '#e2e8f0' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-4xl font-bold text-blue-600 -mt-16">{completionRate}%</p>
          <p className="text-gray-400 text-sm mt-2">{completed} of {total} tasks completed</p>
        </div>

        {/* Task Status Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'Completed', value: completed, total, color: 'bg-green-500' },
              { label: 'In Progress', value: inProgress, total, color: 'bg-blue-500' },
              { label: 'Pending', value: pending, total, color: 'bg-yellow-500' },
              { label: 'Overdue', value: overdue, total, color: 'bg-red-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 font-medium">{item.label}</span>
                  <span className="font-bold text-gray-800">{item.value} <span className="text-gray-400 font-normal">/ {item.total}</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className={`${item.color} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject-wise Progress */}
      {subjectData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject-wise Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" name="Total" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Graded Submissions */}
      {gradedSubmissions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Graded Submissions</h3>
          <div className="space-y-3">
            {tasks.filter(t => t.submissions?.some(s => (s.student?._id === user?.id || s.student === user?.id) && s.grade !== null))
              .map(task => {
                const sub = task.submissions.find(s => (s.student?._id === user?.id || s.student === user?.id) && s.grade !== null);
                return (
                  <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{task.title}</p>
                      <p className="text-xs text-gray-400">{task.subject} • {sub?.feedback}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${sub?.grade >= 75 ? 'text-green-600' : sub?.grade >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {sub?.grade}/100
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProgress;
