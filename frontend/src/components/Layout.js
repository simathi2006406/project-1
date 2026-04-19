import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const adminLinks = [
  { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/admin/tasks', icon: '📋', label: 'Manage Tasks' },
  { path: '/admin/students', icon: '👥', label: 'Students' },
  { path: '/admin/announcements', icon: '📢', label: 'Announcements' },
  { path: '/admin/analytics', icon: '📈', label: 'Analytics' },
];

const studentLinks = [
  { path: '/student/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/student/tasks', icon: '📋', label: 'My Tasks' },
  { path: '/student/progress', icon: '📈', label: 'My Progress' },
  { path: '/student/suggestions', icon: '🤖', label: 'AI Suggestions' },
  { path: '/student/announcements', icon: '📢', label: 'Announcements' },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const links = user?.role === 'admin' ? adminLinks : studentLinks;
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await API.get('/notifications');
        setNotifications(data.notifications.slice(0, 10));
      } catch {}
    };
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gradient-to-b from-blue-900 to-indigo-900 text-white flex flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Logo */}
        <div className="p-4 border-b border-blue-700 flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">🎓</span>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-sm leading-tight">Smart Portal</p>
              <p className="text-blue-300 text-xs capitalize">{user?.role} Panel</p>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <Link key={link.path} to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium
                ${location.pathname === link.path
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'}`}>
              <span className="text-lg flex-shrink-0">{link.icon}</span>
              {sidebarOpen && <span>{link.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User info */}
        {sidebarOpen && (
          <div className="p-4 border-t border-blue-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-blue-300 text-xs truncate">{user?.department}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full text-left text-xs text-blue-300 hover:text-white transition-colors flex items-center gap-2">
              <span>🚪</span> Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 text-xl">☰</button>
            <h2 className="text-lg font-semibold text-gray-800">
              {links.find((l) => l.path === location.pathname)?.label || 'Smart Portal'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setShowNotif(!showNotif); if (!showNotif) markAllRead(); }}
                className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <p className="font-semibold text-gray-800">Notifications</p>
                    <button onClick={() => setShowNotif(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-gray-400 py-8 text-sm">No notifications</p>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} className={`px-4 py-3 border-b border-gray-50 text-sm ${!n.read ? 'bg-blue-50' : ''}`}>
                          <p className="text-gray-700">{n.message}</p>
                          <p className="text-gray-400 text-xs mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
