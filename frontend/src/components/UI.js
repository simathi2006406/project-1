import React from 'react';

const StatusBadge = ({ status }) => {
  const map = {
    pending: 'badge-pending',
    'in-progress': 'badge-inprogress',
    completed: 'badge-completed',
    overdue: 'badge-overdue',
  };
  return <span className={map[status] || 'badge-pending'}>{status}</span>;
};

const PriorityBadge = ({ priority }) => {
  const map = {
    low: 'badge-low',
    medium: 'badge-medium',
    high: 'badge-high',
    critical: 'badge-critical',
  };
  return <span className={map[priority] || 'badge-medium'}>{priority}</span>;
};

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

const EmptyState = ({ icon, message }) => (
  <div className="text-center py-16">
    <div className="text-5xl mb-3">{icon}</div>
    <p className="text-gray-400 font-medium">{message}</p>
  </div>
);

export { StatusBadge, PriorityBadge, StatCard, Spinner, EmptyState };
