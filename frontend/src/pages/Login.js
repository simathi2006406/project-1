import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  // Clear any stale session on login page load
  React.useEffect(() => {
    logout();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Smart Portal</h1>
          <p className="text-blue-200 mt-1">Operational Strategy for College Students</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email" required
                className="input-field"
                placeholder="you@college.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password" required
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-xs font-semibold text-blue-700 mb-2">🔑 Demo Credentials</p>
            <div className="space-y-1 text-xs text-blue-600">
              <p><strong>Admin:</strong> admin@college.edu / admin123</p>
              <p><strong>Student:</strong> arun@student.edu / student123</p>
            </div>
          </div> */}

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
