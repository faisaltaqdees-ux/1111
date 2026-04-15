/**
 * Authentication Hooks
 * React hooks for managing auth state and operations
 * @file lib/hooks/useAuth.ts
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  wallet_address: string | null;
  avatar_url: string | null;
  bio: string | null;
  email_verified: boolean;
  two_fa_enabled: boolean;
  account_status: string;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, fullName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  connectWallet: (walletAddress: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setupTwoFA: () => Promise<{ qrCode: string; secret: string; recoveryCodes: string[] }>;
  verifyTwoFA: (secret: string, code: string, recoveryCodes: string[]) => Promise<void>;
}

export function useAuth(): AuthContextType {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token invalid, clear storage
        localStorage.removeItem('auth_token');
        setToken(null);
      }
    } catch (error) {
      console.error('[Auth] Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.requires2FA) {
        throw new Error('2FA_REQUIRED');
      }

      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      router.push('/profile');
    } catch (error) {
      throw error;
    }
  }, [router]);

  const signup = useCallback(async (email: string, fullName: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullName,
          password,
          confirmPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    router.push('/auth/login');
  }, [router]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      await fetchUser(token);
    } catch (error) {
      throw error;
    }
  }, [token, fetchUser]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!token) throw new Error('Not authenticated');

      try {
        const response = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (!response.ok) throw new Error('Failed to change password');
      } catch (error) {
        throw error;
      }
    },
    [token]
  );

  const connectWallet = useCallback(
    async (walletAddress: string) => {
      if (!token) throw new Error('Not authenticated');

      try {
        const response = await fetch('/api/auth/connect-wallet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ walletAddress, token }),
        });

        if (!response.ok) throw new Error('Failed to connect wallet');

        await fetchUser(token);
      } catch (error) {
        throw error;
      }
    },
    [token, fetchUser]
  );

  const disconnectWallet = useCallback(async () => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch('/api/auth/connect-wallet', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) throw new Error('Failed to disconnect wallet');

      await fetchUser(token);
    } catch (error) {
      throw error;
    }
  }, [token, fetchUser]);

  const deleteAccount = useCallback(async () => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete account');

      await logout();
    } catch (error) {
      throw error;
    }
  }, [token, logout]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    await fetchUser(token);
  }, [token, fetchUser]);

  const setupTwoFA = useCallback(async () => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch('/api/auth/setup-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error('Failed to setup 2FA');

      return {
        qrCode: data.qrCode,
        secret: data.secret,
        recoveryCodes: data.recoveryCodes,
      };
    } catch (error) {
      throw error;
    }
  }, [token]);

  const verifyTwoFA = useCallback(
    async (secret: string, code: string, recoveryCodes: string[]) => {
      if (!token) throw new Error('Not authenticated');

      try {
        const response = await fetch('/api/auth/setup-2fa', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            token,
            secret,
            verificationCode: code,
            recoveryCodes,
          }),
        });

        if (!response.ok) throw new Error('Failed to verify 2FA');

        await fetchUser(token);
      } catch (error) {
        throw error;
      }
    },
    [token, fetchUser]
  );

  return {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    connectWallet,
    disconnectWallet,
    deleteAccount,
    refreshUser,
    setupTwoFA,
    verifyTwoFA,
  };
}

/**
 * Hook to check if user is authenticated
 * Redirects to login if not
 */
export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  return { loading };
}

/**
 * Hook to redirect to home if already authenticated
 */
export function usePreventAuthenticatedAccess() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/profile');
    }
  }, [isAuthenticated, loading, router]);

  return { loading };
}
