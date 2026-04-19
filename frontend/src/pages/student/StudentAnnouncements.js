import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { Spinner, EmptyState } from '../../components/UI';

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/announcements').then(({ data }) => {
      setAnnouncements(data.announcements);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const priorityConfig = {
    urgent: { icon: '🚨', color: 'border-red-400 bg-red-50', badge: 'bg-red-100 text-red-700' },
    important: { icon: '⚠️', color: 'border-yellow-400 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
    normal: { icon: '📌', color: 'border-blue-300 bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Announcements ({announcements.length})</h2>

      {announcements.length === 0 ? (
        <EmptyState icon="📢" message="No announcements at the moment" />
      ) : (
        <div className="space-y-4">
          {announcements.map(a => {
            const config = priorityConfig[a.priority] || priorityConfig.normal;
            return (
              <div key={a._id} className={`border-l-4 rounded-xl p-5 ${config.color}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{config.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{a.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
                        {a.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{a.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Posted by {a.createdBy?.name} • {new Date(a.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentAnnouncements;
