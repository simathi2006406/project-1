import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTasks from './pages/admin/AdminTasks';
import AdminStudents from './pages/admin/AdminStudents';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentTasks from './pages/student/StudentTasks';
import StudentProgress from './pages/student/StudentProgress';
import AISuggestions from './pages/student/AISuggestions';
import StudentAnnouncements from './pages/student/StudentAnnouncements';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const home = user ? (user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard') : '/login';

  return (
    <Routes>
      <Route path="/" element={<Navigate to={home} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={home} replace />} />

      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/tasks" element={<ProtectedRoute role="admin"><AdminTasks /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute role="admin"><AdminStudents /></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute role="admin"><AdminAnnouncements /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />

      <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/tasks" element={<ProtectedRoute role="student"><StudentTasks /></ProtectedRoute>} />
      <Route path="/student/progress" element={<ProtectedRoute role="student"><StudentProgress /></ProtectedRoute>} />
      <Route path="/student/suggestions" element={<ProtectedRoute role="student"><AISuggestions /></ProtectedRoute>} />
      <Route path="/student/announcements" element={<ProtectedRoute role="student"><StudentAnnouncements /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif' } }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
