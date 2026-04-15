'use client';

/**
 * Login Page
 * User authentication and login
 * @file app/(auth)/login/page.tsx
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState<string | null>(null);

  useEffect(() => {
    const verified = searchParams?.get('verified');
    const message = searchParams?.get('message');

    if (verified === 'true') {
      setShowMessage('✓ Email verified! You can now log in.');
    } else if (message) {
      setShowMessage(message);
    }

    const email = searchParams?.get('email');
    if (email) {
      setFormData(prev => ({ ...prev, email: decodeURIComponent(email) }));
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || [data.message || 'Login failed']);
        return;
      }

      if (data.requires2FA) {
        // Redirect to 2FA verification
        sessionStorage.setItem('userId', data.userId);
        router.push('/auth/verify-2fa');
        return;
      }

      // Store token
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('userId', data.userId);

      // Redirect to profile or home
      router.push('/profile');
    } catch (error) {
      setErrors(['An unexpected error occurred']);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
            PSL Pulse
          </h1>
          <p className="text-slate-400">Welcome back</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Log In</h2>

          {showMessage && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg mb-6">
              {showMessage}
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
              {errors.map((error, i) => (
                <p key={i} className="text-sm">• {error}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold rounded-lg transition mt-6"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-center text-slate-400">
              <Link href="/auth/forgot-password" className="text-purple-400 hover:text-purple-300 font-semibold">
                Forgot password?
              </Link>
            </p>
            <hr className="border-slate-700" />
            <p className="text-center text-slate-400">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
