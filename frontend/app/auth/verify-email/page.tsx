'use client';

/**
 * Email Verification Page
 * Verify user email with OTP or token
 * @file app/auth/verify-email/page.tsx
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/GlobalAuthContext';

/**
 * Email Verification Page Component
 */
export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Get token from URL or email from auth state
  const tokenFromUrl = searchParams.get('token');
  const userEmail = user?.email;
  
  const [verificationMethod, setVerificationMethod] = useState<'token' | 'otp'>('token');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Auto-verify if token present in URL
  useEffect(() => {
    if (tokenFromUrl) {
      handleVerifyWithToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  /**
   * Verify email with token from URL
   */
  const handleVerifyWithToken = useCallback(async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, method: 'token' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      const data = await response.json();
      setVerified(true);
      toast.success('Email verified successfully!');

      // Redirect after delay
      setTimeout(() => {
        router.push('/auth/wallet-connect');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      toast.error(errorMessage);
      setVerificationMethod('otp'); // Fallback to OTP
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Verify email with OTP
   */
  const handleVerifyWithOtp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, method: 'otp' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      const data = await response.json();
      setVerified(true);
      toast.success('Email verified successfully!');

      // Redirect after delay
      setTimeout(() => {
        router.push('/auth/wallet-connect');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [otp, router]);

  /**
   * Resend OTP
   */
  const handleResendOtp = useCallback(async () => {
    try {
      setResendLoading(true);
      setError(null);

      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend OTP');
      }

      toast.success('OTP sent to your email!');
      setResendCooldown(60); // 60 second cooldown
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  }, [userEmail]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-paws-dark via-paws-dark to-paws-dark flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-paws-mauve/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-paws-rose/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl p-8 space-y-6">
          {/* Verified State */}
          {verified && (
            <div className="text-center space-y-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-6xl"
              >
                ✅
              </motion.div>
              <h1 className="text-2xl font-black text-white">Email Verified!</h1>
              <p className="text-gray-400 text-sm">
                Your email has been confirmed. Redirecting to wallet setup...
              </p>
            </div>
          )}

          {/* Verification Body */}
          {!verified && (
            <>
              {/* Header */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-black bg-gradient-to-r from-paws-mauve to-paws-rose bg-clip-text text-transparent">
                  Verify Email
                </h1>
                <p className="text-gray-400 text-sm">
                  {userEmail && <>Confirm your email at {userEmail}</>}
                  {!userEmail && <>Confirm your email address</>}
                </p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Method Tabs */}
              <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                <button
                  onClick={() => setVerificationMethod('token')}
                  className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition-all ${
                    verificationMethod === 'token'
                      ? 'bg-paws-rose text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Link
                </button>
                <button
                  onClick={() => setVerificationMethod('otp')}
                  className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition-all ${
                    verificationMethod === 'otp'
                      ? 'bg-paws-rose text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Code
                </button>
              </div>

              {/* Token Method */}
              {verificationMethod === 'token' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-lg bg-paws-mauve/10 border border-paws-mauve/30">
                    <p className="text-sm text-gray-300">
                      📧 Check your email for a verification link. Click the link to confirm your email address.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                    <p className="text-xs text-gray-400">Didn't receive an email?</p>
                    <button
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || resendLoading}
                      className="w-full py-2 px-4 rounded-lg text-white text-sm font-semibold bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : resendLoading
                          ? 'Sending...'
                          : 'Resend Email'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* OTP Method */}
              {verificationMethod === 'otp' && (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleVerifyWithOtp}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      6-Digit Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, ''); // Only numbers
                        setOtp(val);
                        setError(null);
                      }}
                      placeholder="000000"
                      className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-600 focus:outline-none focus:border-paws-rose focus:ring-2 focus:ring-paws-rose/20 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full py-3 px-4 rounded-lg font-bold bg-gradient-to-r from-paws-mauve to-paws-rose text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                    <p className="text-xs text-gray-400">Didn't receive a code?</p>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || resendLoading}
                      className="w-full py-2 px-4 rounded-lg text-white text-sm font-semibold bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : resendLoading
                          ? 'Sending...'
                          : 'Resend Code'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-paws-mauve/10 border border-paws-mauve/30 space-y-2">
                <p className="font-semibold text-sm">ℹ️ Why verify email?</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>✓ Secure your account</li>
                  <li>✓ Recover lost credentials</li>
                  <li>✓ Receive purchase confirmations</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Back to Login */}
        {!verified && (
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-sm text-gray-400 hover:text-gray-300 underline"
            >
              Back to Login
            </button>
          </div>
        )}
      </motion.div>
    </main>
  );
}
