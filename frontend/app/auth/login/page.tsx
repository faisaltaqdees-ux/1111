'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/GlobalAuthContext';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
      setError(null);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (failedAttempts >= 5) {
        toast.error('Too many failed attempts. Try again later.');
        return;
      }
      try {
        setLoading(true);
        setError(null);
        if (!formData.email || !formData.password) {
          throw new Error('Email and password are required');
        }
        await authLogin(formData.email, formData.password);
        toast.success('Login successful!');
        if (formData.rememberMe) {
          localStorage.setItem('auth_remember_email', formData.email);
        }
        setTimeout(() => router.push('/tickets'), 800);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';
        setError(errorMessage);
        setFailedAttempts((prev) => prev + 1);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [formData, failedAttempts, authLogin, router]
  );

  return (
    <div className="min-h-screen bg-psl-dark text-white overflow-hidden relative flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-psl-gradient opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-psl-mauve opacity-10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-psl-gradient bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-white/70">
            Sign in to your PSL Pulse account
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-glass-bg border border-glass-border backdrop-blur-xl rounded-2xl p-8 space-y-5"
        >
          {failedAttempts > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400"
            >
              Warning: {failedAttempts} failed attempts. {5 - failedAttempts} remaining.
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400"
            >
              Error: {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-white/90">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading || failedAttempts >= 5}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 hover:border-white/40 text-white placeholder-white/40 focus:outline-none focus:border-psl-rose transition-all disabled:opacity-50"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-white/90">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-psl-rose hover:text-psl-rose/80 transition">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading || failedAttempts >= 5}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 hover:border-white/40 text-white placeholder-white/40 focus:outline-none focus:border-psl-rose transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-white/60 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2"
            >
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
                className="w-4 h-4 rounded bg-white/10 border border-white/20 accent-psl-rose cursor-pointer disabled:opacity-50"
              />
              <label htmlFor="rememberMe" className="text-sm text-white/70 cursor-pointer">
                Remember me for 30 days
              </label>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || failedAttempts >= 5}
              className="w-full py-3 rounded-lg bg-psl-gradient text-white font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-3 py-2"
          >
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/60">New user?</span>
            <div className="flex-1 h-px bg-white/10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="text-center"
          >
            <Link
              href="/auth/register"
              className="inline-block px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 hover:border-white/40 transition-all"
            >
              Sign Up Now
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-psl-mauve/10 border border-psl-mauve/30 rounded-lg p-4 text-center"
        >
          <p className="text-sm text-white/70">
            Your account is protected by industry-standard encryption
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
