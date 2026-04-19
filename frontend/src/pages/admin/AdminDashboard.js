import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../../utils/api';
import { StatCard, Spinner } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/analytics').then(({ data }) => {
      setAnalytics(data.analytics);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const taskStatusData = analytics ? [
    { name: 'Pending', value: analytics.pendingTasks, color: '#f59e0b' },
    { name: 'In Progress', value: analytics.inProgressTasks, color: '#3b82f6' },
    { name: 'Completed', value: analytics.completedTasks, color: '#10b981' },
    { name: 'Overdue', value: analytics.overdueTasks, color: '#ef4444' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h1>
        <p className="text-blue-100 mt-1">Here's what's happening in your portal today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Students" value={analytics?.totalStudents || 0} color="bg-blue-50" />
        <StatCard icon="📋" label="Total Tasks" value={analytics?.totalTasks || 0} color="bg-purple-50" />
        <StatCard icon="✅" label="Completed Tasks" value={analytics?.completedTasks || 0} color="bg-green-50" />
        <StatCard icon="📊" label="Completion Rate" value={`${analytics?.completionRate || 0}%`} color="bg-orange-50" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Pie */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={taskStatusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {taskStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Stats Bar */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tasks by Subject</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics?.subjectStats?.map(s => ({ name: s._id || 'Other', count: s.count })) || []}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Students & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Students */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Top Performing Students</h3>
          {analytics?.topStudents?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No graded submissions yet</p>
          ) : (
            <div className="space-y-3">
              {analytics?.topStudents?.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.totalSubmissions} submissions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{Math.round(s.avgGrade)}%</p>
                    <p className="text-xs text-gray-400">avg grade</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/admin/tasks', icon: '➕', label: 'Create Task', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
              { to: '/admin/students', icon: '👥', label: 'View Students', color: 'bg-green-50 hover:bg-green-100 text-green-700' },
              { to: '/admin/announcements', icon: '📢', label: 'Announce', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
              { to: '/admin/analytics', icon: '📈', label: 'Analytics', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700' },
            ].map((action) => (
              <Link key={action.to} to={action.to}
                className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all font-medium text-sm ${action.color}`}>
                <span className="text-2xl mb-1">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
