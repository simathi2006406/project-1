import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import API from '../../utils/api';
import { StatusBadge, PriorityBadge, Spinner } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/tasks'),
      API.get('/announcements')
    ]).then(([tasksRes, annRes]) => {
      setTasks(tasksRes.data.tasks);
      setAnnouncements(annRes.data.announcements.slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const pending = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const overdue = tasks.filter(t => t.status === 'overdue').length;

  const pieData = [
    { name: 'Pending', value: pending, color: '#f59e0b' },
    { name: 'In Progress', value: inProgress, color: '#3b82f6' },
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'Overdue', value: overdue, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const urgentTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => b.aiPriorityScore - a.aiPriorityScore)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hello, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-blue-100 mt-1">{user?.department} • Semester {user?.semester}</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-blue-100 text-sm">Today</p>
            <p className="text-xl font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: tasks.length, icon: '📋', color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending', value: pending, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
          { label: 'In Progress', value: inProgress, icon: '🔄', color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Completed', value: completed, icon: '✅', color: 'bg-green-50 text-green-600' },
        ].map(stat => (
          <div key={stat.label} className="card text-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Progress</h3>
          {pieData.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No tasks assigned yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}></div>
                    <span className="text-gray-600">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Urgent Tasks */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">🔥 Priority Tasks</h3>
            <Link to="/student/tasks" className="text-blue-600 text-sm font-medium hover:underline">View all</Link>
          </div>
          {urgentTasks.length === 0 ? (
            <p className="text-center text-gray-400 py-8">All caught up! 🎉</p>
          ) : (
            <div className="space-y-3">
              {urgentTasks.map(task => {
                const hoursLeft = Math.max(0, (new Date(task.deadline) - new Date()) / (1000 * 60 * 60));
                return (
                  <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{task.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{task.subject}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                      <span className={`text-xs font-medium ${hoursLeft < 24 ? 'text-red-500' : hoursLeft < 72 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {hoursLeft < 24 ? `${Math.round(hoursLeft)}h` : `${Math.round(hoursLeft / 24)}d`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Announcements */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">📢 Latest Announcements</h3>
          <Link to="/student/announcements" className="text-blue-600 text-sm font-medium hover:underline">View all</Link>
        </div>
        {announcements.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No announcements</p>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-xl flex-shrink-0">{a.priority === 'urgent' ? '🚨' : a.priority === 'important' ? '⚠️' : '📌'}</span>
                <div>
                  <p className="font-medium text-sm text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
