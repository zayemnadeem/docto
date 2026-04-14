import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      if (data.role === 'doctor') navigate('/doctor/dashboard');
      else if (data.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `radial-gradient(ellipse at 20% 50%, #c8ede9 0%, transparent 55%),
                     radial-gradient(ellipse at 80% 20%, #d0f0ec 0%, transparent 55%), #fff`
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img src="/doctonewlogo.jpeg" alt="Docto" className="h-16 md:h-20 w-auto" />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-8">
          <h1 className="text-2xl text-[#0d2b28] mb-1 text-center">
            Welcome back
          </h1>
          <p className="text-sm text-[#9ca3af] text-center mb-6">Sign in to your Docto account</p>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-sm text-[#ef4444]">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Email</label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white text-[#0d2b28]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Password</label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white text-[#0d2b28]"
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className={`w-full rounded-full py-3 text-sm font-medium transition mt-2 ${
                loading
                  ? 'bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed'
                  : 'bg-[#1a9e8f] text-white hover:bg-[#158577]'
              }`}
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-[#9ca3af] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#1a9e8f] font-medium underline underline-offset-2 hover:text-[#158577] transition">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

