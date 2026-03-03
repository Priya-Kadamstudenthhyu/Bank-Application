import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      {/* Left branding */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 text-white p-12">
        <div className="text-6xl mb-6">🏦</div>
        <h1 className="text-4xl font-bold mb-4">SmartBank</h1>
        <p className="text-xl opacity-80 text-center max-w-sm">
          Secure, modern banking at your fingertips. Manage your accounts with confidence.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-4 text-center">
          {[['🔒', 'Secure JWT Auth'], ['📊', 'Analytics Dashboard'], ['✍️', 'Digital Signature'], ['⚡', 'Real-time Updates']].map(([icon, label]) => (
            <div key={label} className="bg-white bg-opacity-10 rounded-xl p-4">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-sm opacity-90">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🏦</div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-500 text-sm">Don't have an account? </span>
            <Link to="/register" className="text-blue-600 hover:underline text-sm font-semibold">Register</Link>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
            <strong>Demo Credentials:</strong><br />
            Admin: admin@bank.com / Admin@123<br />
            (Register to create a user account)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
