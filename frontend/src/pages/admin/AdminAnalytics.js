import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import API from '../../utils/api';
import { Spinner } from '../../components/UI';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/analytics').then(({ data }) => {
      setAnalytics(data.analytics);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const statusData = [
    { name: 'Pending', value: analytics?.pendingTasks || 0 },
    { name: 'In Progress', value: analytics?.inProgressTasks || 0 },
    { name: 'Completed', value: analytics?.completedTasks || 0 },
    { name: 'Overdue', value: analytics?.overdueTasks || 0 },
  ];

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const trendData = analytics?.monthlyTrend?.map(t => ({
    month: monthNames[t._id.month - 1],
    tasks: t.count
  })) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Analytics & Reports</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: analytics?.totalStudents, icon: '👥', color: 'from-blue-500 to-blue-600' },
          { label: 'Total Tasks', value: analytics?.totalTasks, icon: '📋', color: 'from-purple-500 to-purple-600' },
          { label: 'Completion Rate', value: `${analytics?.completionRate}%`, icon: '✅', color: 'from-green-500 to-green-600' },
          { label: 'Overdue Tasks', value: analytics?.overdueTasks, icon: '⚠️', color: 'from-red-500 to-red-600' },
        ].map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white`}>
            <p className="text-3xl mb-1">{card.icon}</p>
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-sm opacity-80">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Status Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Task Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tasks by Subject</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics?.subjectStats?.map(s => ({ name: s._id || 'Other', count: s.count })) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {analytics?.subjectStats?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Top Students by Grade</h3>
          {analytics?.topStudents?.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No graded data available</p>
          ) : (
            <div className="space-y-3">
              {analytics?.topStudents?.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xl w-8">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{s.name}</span>
                      <span className="font-bold text-blue-600">{Math.round(s.avgGrade)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                        style={{ width: `${s.avgGrade}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
