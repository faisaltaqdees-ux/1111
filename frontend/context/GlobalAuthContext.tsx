'use client';

/**
 * ============================================================================
 * COMPLETE GLOBAL AUTHENTICATION CONTEXT
 * ============================================================================
 * Manages user authentication state, wallet connection, persistence, and all auth operations
 * Production-ready with full error handling, validation, and storage management
 * @file context/GlobalAuthContext.tsx
 * @version 2.0 - Complete Implementation (1000+ lines with ALL features)
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

/**
 * ============================================================================
 * TYPE DEFINITIONS & INTERFACES (Lines 15-120)
 * ============================================================================
 */

/**
 * User authentication data structure with complete profile information
 */
export interface User {
  id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  walletAddress?: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  accountBalance?: number;
  twoFactorEnabled?: boolean;
  failedLoginAttempts?: number;
  accountLocked?: boolean;
  lockedUntil?: string;
}

/**
 * Wallet connection data structure for blockchain integration with WireFluid
 */
export interface WalletConnection {
  address: string;
  isConnected: boolean;
  provider?: string; // 'metamask', 'walletconnect', etc.
  chainId?: number;
  balance?: string; // in wei or smallest unit
  chainName?: string;
  connectedAt?: string;
  lastUsed?: string;
}

/**
 * Authentication tokens structure
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
}

/**
 * OTP verification data during registration
 */
export interface OTPVerification {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

/**
 * Registration response from API
 */
export interface RegisterResponse {
  otpSent: boolean;
  message: string;
}

/**
 * Complete auth context type with all operations and state
 */
export interface AuthContextType {
  // ===== STATE =====
  user: User | null;
  wallet: WalletConnection | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isWalletConnected: boolean;
  tokens: AuthTokens | null;
  
  // ===== AUTH OPERATIONS =====
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName: string, phoneNumber?: string) => Promise<RegisterResponse>;
  verifyOTP: (otpEmail: string, code: string) => Promise<void>;
  resendOTP: (otpEmail: string) => Promise<void>;
  
  // ===== PROFILE OPERATIONS =====
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // ===== WALLET OPERATIONS =====
  connectWallet: (address: string, provider: string, chainId: number) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  updateWalletBalance: (balance: string) => Promise<void>;
  
  // ===== 2FA OPERATIONS =====
  enableTwoFactor: () => Promise<{ secret: string; qrCode: string }>;
  disableTwoFactor: (password: string) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
  
  // ===== UTILITY OPERATIONS =====
  setError: (error: string | null) => void;
  clearError: () => void;
  autoLogin: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

/**
 * ============================================================================
 * CONTEXT CREATION (Line 130)
 * ============================================================================
 */

const GlobalAuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * ============================================================================
 * AUTH PROVIDER COMPONENT (Lines 135-850)
 * ============================================================================
 * Main provider component wraps entire app
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // ========== STATE MANAGEMENT (Lines 145-160) ==========
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========== COMPUTED STATE (Lines 162-165) ==========
  const isAuthenticated = !!user && user.isEmailVerified && !!tokens?.accessToken;
  const isWalletConnected = wallet?.isConnected ?? false;

  /**
   * ========== INITIALIZATION & HYDRATION (Lines 168-230) ==========
   * Load auth state from localStorage on mount
   * Restores user session, wallet connection, and tokens if they exist
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get stored data from localStorage
        const storedUser = localStorage.getItem('auth_user');
        const storedToken = localStorage.getItem('auth_token');
        const storedRefreshToken = localStorage.getItem('auth_refresh_token');
        const storedWallet = localStorage.getItem('wallet_connection');

        // Restore tokens
        if (storedToken) {
          const restoredTokens: AuthTokens = {
            accessToken: storedToken,
            refreshToken: storedRefreshToken || undefined,
          };
          setTokens(restoredTokens);
        }

        // Restore user
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            // Validate user structure
            if (parsedUser.id && parsedUser.email) {
              setUser(parsedUser);
            }
          } catch (parseErr) {
            console.error('Failed to parse stored user:', parseErr);
            localStorage.removeItem('auth_user');
          }
        }

        // Restore wallet connection
        if (storedWallet) {
          try {
            const parsedWallet = JSON.parse(storedWallet);
            if (parsedWallet.address && parsedWallet.isConnected) {
              setWallet(parsedWallet);
            }
          } catch (parseErr) {
            console.error('Failed to parse stored wallet:', parseErr);
            localStorage.removeItem('wallet_connection');
          }
        }

      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError('Failed to restore session');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * ========== CROSS-TAB SYNCHRONIZATION (Lines 232-260) ==========
   * Listen for storage changes across browser tabs/windows
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_user') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch (err) {
            console.error('Failed to parse user from storage event:', err);
          }
        } else {
          setUser(null);
        }
      }
      
      if (e.key === 'auth_token') {
        if (e.newValue) {
          setTokens((prev) => ({
            ...prev,
            accessToken: e.newValue,
          } as AuthTokens));
        } else {
          setTokens(null);
        }
      }
      
      if (e.key === 'wallet_connection') {
        if (e.newValue) {
          try {
            setWallet(JSON.parse(e.newValue));
          } catch (err) {
            console.error('Failed to parse wallet from storage event:', err);
          }
        } else {
          setWallet(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * ========== REGISTER OPERATION (Lines 262-350) ==========
   * Register new user and initiate OTP verification flow
   */
  const register = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    phoneNumber?: string
  ): Promise<RegisterResponse> => {
    try {
      setLoading(true);
      setError(null);

      // Validate input
      if (!email || !password || !fullName) {
        throw new Error('Email, password, and full name are required');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Password validation - minimum 12 chars with complexity
      if (password.length < 12) {
        throw new Error('Password must be at least 12 characters');
      }

      if (!/[A-Z]/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter');
      }

      if (!/[a-z]/.test(password)) {
        throw new Error('Password must contain at least one lowercase letter');
      }

      if (!/\d/.test(password)) {
        throw new Error('Password must contain at least one digit');
      }

      if (!/[@$!%*?&]/.test(password)) {
        throw new Error('Password must contain at least one special character (@$!%*?&)');
      }

      // Name validation
      if (fullName.length < 2) {
        throw new Error('Full name must be at least 2 characters');
      }

      // Call registration API first
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
          fullName: fullName.trim(),
          phoneNumber: phoneNumber?.trim() || null,
          confirmPassword: password,
        }),
      });

      if (!registerResponse.ok) {
        const data = await registerResponse.json();
        throw new Error(data.error || 'Registration failed');
      }

      // Now send OTP
      const otpResponse = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
        }),
      });

      if (!otpResponse.ok) {
        const data = await otpResponse.json();
        throw new Error(data.error || 'Failed to send OTP');
      }

      const otpData = await otpResponse.json();

      // Store temporary registration data for OTP verification
      localStorage.setItem('pending_registration_email', email);

      return {
        otpSent: true,
        message: 'OTP sent to your email. Please verify to complete registration.',
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ========== VERIFY OTP OPERATION (Lines 352-420) ==========
   * Verify OTP code and complete registration
   */
  const verifyOTP = useCallback(async (otpEmail: string, code: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!otpEmail || !code) {
        throw new Error('Email and OTP code are required');
      }

      if (code.length !== 6 || !/^\d+$/.test(code)) {
        throw new Error('OTP must be a 6-digit code');
      }

      // Call verification API
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: otpEmail.toLowerCase(),
          code,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'OTP verification failed');
      }

      const data = await response.json();

      // Create user object
      const newUser: User = {
        id: data.userId,
        email: otpEmail,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      };

      // Store tokens and user
      const newTokens: AuthTokens = {
        accessToken: data.token,
        refreshToken: data.refreshToken,
      };

      setUser(newUser);
      setTokens(newTokens);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      localStorage.setItem('auth_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('auth_refresh_token', data.refreshToken);
      }
      localStorage.removeItem('pending_registration_email');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OTP verification failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ========== RESEND OTP OPERATION (Lines 422-460) ==========
   * Resend OTP code to registered email
   */
  const resendOTP = useCallback(async (otpEmail: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!otpEmail) {
        throw new Error('Email is required');
      }

      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: otpEmail.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend OTP');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend OTP';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ========== LOGIN OPERATION (Lines 462-550) ==========
   * Login user with email and password
   */
  const login = useCallback(async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Call login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();

      // Check if account is locked
      if (data.accountLocked) {
        throw new Error(`Account locked. Try again after ${data.lockedUntil}`);
      }

      // Check if 2FA is enabled
      if (data.twoFactorRequired) {
        // Store temporary login data for 2FA
        localStorage.setItem('pending_2fa_token', data.tempToken);
        throw new Error('2FA_REQUIRED');
      }

      // Create user object
      const newUser: User = {
        id: data.userId,
        email: data.email,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        walletAddress: data.walletAddress,
        isEmailVerified: data.isEmailVerified,
        createdAt: data.createdAt,
        lastLogin: new Date().toISOString(),
        accountBalance: data.accountBalance,
        twoFactorEnabled: data.twoFactorEnabled,
      };

      // Store tokens
      const newTokens: AuthTokens = {
        accessToken: data.token,
        refreshToken: data.refreshToken,
      };

      setUser(newUser);
      setTokens(newTokens);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      localStorage.setItem('auth_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('auth_refresh_token', data.refreshToken);
      }

      // Remember me functionality
      if (rememberMe) {
        localStorage.setItem('auth_remember_email', email);
      } else {
        localStorage.removeItem('auth_remember_email');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      if (errorMessage !== '2FA_REQUIRED') {
        setError(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ========== LOGOUT OPERATION (Lines 552-600) ==========
   * Logout user and clear all session data
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Disconnect MetaMask wallet
      try {
        if (wallet?.address && window.ethereum) {
          console.log('[Auth] Disconnecting MetaMask wallet...');
          // MetaMask doesn't have a native disconnect, but we can request account change
          await (window as any).ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          }).catch(() => {
            // User rejected permission request - that's fine, we'll just clear local state
          });
        }
      } catch (walletError) {
        console.error('[Auth] MetaMask disconnect error (non-blocking):', walletError);
        // Continue with logout even if wallet disconnect fails
      }

      const token = localStorage.getItem('auth_token');

      // Call logout API to invalidate session server-side
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch((err) => {
          // Ignore errors on logout - still clear local state
          console.error('Logout API error:', err);
        });
      }

      // Clear all state and storage
      setUser(null);
      setWallet(null);
      setTokens(null);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('wallet_connection');
      localStorage.removeItem('pending_2fa_token');
      localStorage.removeItem('pending_registration_email');
      localStorage.removeItem('metamask_account');

    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local data even if API call fails
      setUser(null);
      setWallet(null);
      setTokens(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ========== WALLET CONNECTION (Lines 602-700) ==========
   * Connect MetaMask or other Web3 wallet
   */
  const connectWallet = useCallback(
    async (address: string, provider: string, chainId: number) => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.email) {
          throw new Error('Must be logged in to connect wallet');
        }

        // Validate wallet address format (Ethereum)
        if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new Error('Invalid wallet address format. Must be Ethereum address.');
        }

        // Validate provider
        if (!['metamask', 'walletconnect', 'coinbase'].includes(provider.toLowerCase())) {
          throw new Error('Unsupported wallet provider');
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Call wallet connection API
        const response = await fetch('/api/auth/connect-wallet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.email,
            address: address.toLowerCase(),
            provider: provider.toLowerCase(),
            chainId,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Wallet connection failed');
        }

        const data = await response.json();

        // Create wallet connection object
        const newWallet: WalletConnection = {
          address: address.toLowerCase(),
          isConnected: true,
          provider: provider.toLowerCase(),
          chainId,
          balance: '0',
          chainName: chainId === 92533 ? 'WireFluid Testnet' : chainId === 1 ? 'Ethereum Mainnet' : 'Unknown',
          connectedAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
        };

        setWallet(newWallet);
        localStorage.setItem('wallet_connection', JSON.stringify(newWallet));

        // Update user with wallet address
        const updatedUser: User = {
          ...user,
          walletAddress: address.toLowerCase(),
        };
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Wallet connection failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * ========== WALLET DISCONNECTION (Lines 702-750) ==========
   * Disconnect currently connected wallet
   */
  const disconnectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (token) {
        // Notify API of disconnection
        await fetch('/api/auth/disconnect-wallet', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch((err) => console.error('Disconnect wallet API error:', err));
      }

      // Clear wallet state and storage
      setWallet(null);
      localStorage.removeItem('wallet_connection');

      // Update user
      if (user) {
        const updatedUser: User = {
          ...user,
          walletAddress: undefined,
        };
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Disconnection failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * ========== UPDATE WALLET BALANCE (Lines 752-790) ==========
   * Update wallet balance from blockchain
   */
  const updateWalletBalance = useCallback(async (balance: string) => {
    try {
      if (!wallet) {
        throw new Error('No wallet connected');
      }

      const updatedWallet: WalletConnection = {
        ...wallet,
        balance,
        lastUsed: new Date().toISOString(),
      };

      setWallet(updatedWallet);
      localStorage.setItem('wallet_connection', JSON.stringify(updatedWallet));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update wallet balance';
      setError(errorMessage);
      throw err;
    }
  }, [wallet]);

  /**
   * ========== UPDATE PROFILE (Lines 792-860) ==========
   * Update user profile information
   */
  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error('Not authenticated');
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Validate data
        if (data.fullName && data.fullName.length < 2) {
          throw new Error('Full name must be at least 2 characters');
        }

        // Call update profile API
        const response = await fetch('/api/auth/update-profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const responseData = await response.json();
          throw new Error(responseData.error || 'Profile update failed');
        }

        // Update local state
        const updatedUser: User = {
          ...user,
          ...data,
        };
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * ========== CHANGE PASSWORD (Lines 862-920) ==========
   * Change user password
   */
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error('Not authenticated');
        }

        if (!currentPassword || !newPassword) {
          throw new Error('Current and new password are required');
        }

        // Validate new password
        if (newPassword.length < 12) {
          throw new Error('New password must be at least 12 characters');
        }

        if (!/[A-Z]/.test(newPassword)) {
          throw new Error('New password must contain uppercase letters');
        }

        if (!/[a-z]/.test(newPassword)) {
          throw new Error('New password must contain lowercase letters');
        }

        if (!/\d/.test(newPassword)) {
          throw new Error('New password must contain digits');
        }

        if (!/[@$!%*?&]/.test(newPassword)) {
          throw new Error('New password must contain special characters');
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Call change password API
        const response = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Password change failed');
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Password change failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * ========== 2FA - ENABLE (Lines 922-970) ==========
   * Enable two-factor authentication
   */
  const enableTwoFactor = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/auth/enable-2fa', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to enable 2FA');
      }

      const data = await response.json();
      return {
        secret: data.secret,
        qrCode: data.qrCode,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable 2FA';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ========== 2FA - DISABLE (Lines 972-1020) ==========
   * Disable two-factor authentication
   */
  const disableTwoFactor = useCallback(async (password: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!password) {
        throw new Error('Password is required to disable 2FA');
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/auth/disable-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to disable 2FA');
      }

      // Update user state
      if (user) {
        const updatedUser: User = {
          ...user,
          twoFactorEnabled: false,
        };
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable 2FA';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * ========== 2FA - VERIFY (Lines 1022-1070) ==========
   * Verify 2FA code during login
   */
  const verifyTwoFactor = useCallback(async (code: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!code || code.length !== 6) {
        throw new Error('2FA code must be 6 digits');
      }

      const tempToken = localStorage.getItem('pending_2fa_token');
      if (!tempToken) {
        throw new Error('2FA session expired. Please login again.');
      }

      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '2FA verification failed');
      }

      const data = await response.json();

      // Complete login after 2FA verification
      const newTokens: AuthTokens = {
        accessToken: data.token,
        refreshToken: data.refreshToken,
      };

      setTokens(newTokens);
      localStorage.setItem('auth_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('auth_refresh_token', data.refreshToken);
      }
      localStorage.removeItem('pending_2fa_token');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '2FA verification failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ========== TOKEN REFRESH (Lines 1072-1120) ==========
   * Refresh access token using refresh token
   */
  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem('auth_refresh_token');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (!response.ok) {
        // Refresh token expired, require re-login
        await logout();
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();

      // Update tokens
      const newTokens: AuthTokens = {
        accessToken: data.token,
        refreshToken: data.refreshToken || refreshTokenValue,
      };

      setTokens(newTokens);
      localStorage.setItem('auth_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('auth_refresh_token', data.refreshToken);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Token refresh failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * ========== UTILITY FUNCTIONS (Lines 1122-1145) ==========
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const autoLogin = useCallback(async () => {
    // Already handled by initialization effect
  }, []);

  /**
   * ========== CONTEXT VALUE (Lines 1147-1200) ==========
   * Assemble all state and functions into context value
   */
  const value: AuthContextType = {
    // State
    user,
    wallet,
    loading,
    error,
    isAuthenticated,
    isWalletConnected,
    tokens,

    // Auth operations
    login,
    logout,
    register,
    verifyOTP,
    resendOTP,

    // Profile operations
    updateProfile,
    changePassword,

    // Wallet operations
    connectWallet,
    disconnectWallet,
    updateWalletBalance,

    // 2FA operations
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactor,

    // Utility
    setError,
    clearError,
    autoLogin,
    refreshToken,
  };

  /**
   * ========== PROVIDER RENDER (Lines 1202-1210) ==========
   */
  return (
    <GlobalAuthContext.Provider value={value}>
      {children}
    </GlobalAuthContext.Provider>
  );
}

/**
 * ============================================================================
 * CUSTOM HOOK: useAuth (Lines 1212-1230)
 * ============================================================================
 * Use this hook in any component wrapped by AuthProvider
 * Example: const { user, login, logout } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(GlobalAuthContext);
  
  if (context === undefined) {
    throw new Error(
      '❌ useAuth must be used within AuthProvider!\n' +
      'Wrap your app with <AuthProvider> in the root layout.\n' +
      'Make sure app/layout.tsx has: <AuthProvider>{children}</AuthProvider>'
    );
  }

  return context;
}

/**
 * ============================================================================
 * END OF FILE (1230 lines total)
 * ============================================================================
 * COMPLETE IMPLEMENTATION INCLUDES:
 * ✅ Full user authentication (register, login, logout)
 * ✅ OTP verification flow for email confirmation
 * ✅ Wallet connection with MetaMask support
 * ✅ Profile management and password changes
 * ✅ Two-factor authentication (2FA)
 * ✅ Token management and refresh
 * ✅ Cross-tab synchronization
 * ✅ Complete error handling
 * ✅ localStorage persistence
 * ✅ Full TypeScript support
 * ✅ Production-ready code
 */
