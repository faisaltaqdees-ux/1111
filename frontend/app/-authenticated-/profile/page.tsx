'use client';

/**
 * User Profile & Account Management Page
 * Complete account management, receipt history, security settings
 * @file app/(authenticated)/profile/page.tsx - ~2,500 lines
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface UserProfile {
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

interface Receipt {
  id: string;
  transaction_hash: string;
  wallet_address: string;
  match_id: string;
  token_id: string;
  seat_section: string;
  qr_code: string;
  created_at: string;
}

interface LoginHistory {
  id: string;
  ip_address: string;
  device_info: string;
  login_type: string;
  success: boolean;
  created_at: string;
}

interface TabType {
  name: string;
  id: 'overview' | 'receipts' | 'security' | 'connected' | 'history' | 'settings';
  icon: string;
}

const TABS: TabType[] = [
  { name: 'Overview', id: 'overview', icon: '👤' },
  { name: 'Receipts', id: 'receipts', icon: '🎟️' },
  { name: 'Security', id: 'security', icon: '🔒' },
  { name: 'Connected Wallet', id: 'connected', icon: '💰' },
  { name: 'Login History', id: 'history', icon: '📱' },
  { name: 'Settings', id: 'settings', icon: '⚙️' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'receipts' | 'security' | 'connected' | 'history' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBio, setNewBio] = useState('');

  // Modal states
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConnectWalletModal, setShowConnectWalletModal] = useState(false);

  // 2FA setup states
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [twoFASecret, setTwoFASecret] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Wallet connection
  const [walletLoading, setWalletLoading] = useState(false);

  // ========== Fetch User Profile ==========
  useEffect(() => {
    fetchUserProfile();
    fetchReceipts();
    fetchLoginHistory();
  }, []);

  async function fetchUserProfile() {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUser(data.user);
      setNewName(data.user.full_name);
      setNewPhone(data.user.phone_number || '');
      setNewBio(data.user.bio || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function fetchReceipts() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/receipts', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReceipts(data.receipts || []);
      }
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
    }
  }

  async function fetchLoginHistory() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/login-history', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLoginHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch login history:', err);
    }
  }

  // ========== Update Profile ==========
  async function updateName() {
    if (!newName.trim()) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: newName }),
      });

      if (response.ok) {
        setUser(prev => prev ? { ...prev, full_name: newName } : null);
        setEditingName(false);
        setSuccess('Name updated successfully');
      }
    } catch (err) {
      setError('Failed to update name');
    }
  }

  async function updatePhone() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone_number: newPhone || null }),
      });

      if (response.ok) {
        setUser(prev => prev ? { ...prev, phone_number: newPhone } : null);
        setEditingPhone(false);
        setSuccess('Phone number updated successfully');
      }
    } catch (err) {
      setError('Failed to update phone number');
    }
  }

  async function updateBio() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio: newBio || null }),
      });

      if (response.ok) {
        setUser(prev => prev ? { ...prev, bio: newBio } : null);
        setEditingBio(false);
        setSuccess('Bio updated successfully');
      }
    } catch (err) {
      setError('Failed to update bio');
    }
  }

  // ========== Change Password ==========
  async function handleChangePassword() {
    const errors: string[] = [];

    if (!currentPassword) errors.push('Current password is required');
    if (!newPassword) errors.push('New password is required');
    if (newPassword !== confirmPassword) errors.push('Passwords do not match');

    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
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

      const data = await response.json();

      if (!response.ok) {
        setPasswordErrors(data.errors || [data.message]);
        return;
      }

      setSuccess('Password changed successfully');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors([]);
    } catch (err) {
      setPasswordErrors(['Failed to change password']);
    }
  }

  // ========== Setup 2FA ==========
  async function handleSetup2FA() {
    try {
      setTwoFALoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/setup-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setQrCode(data.qrCode);
      setTwoFASecret(data.secret);
      setRecoveryCodes(data.recoveryCodes);
    } catch (err) {
      setError('Failed to setup 2FA');
    } finally {
      setTwoFALoading(false);
    }
  }

  async function handleVerify2FA() {
    if (!verificationCode) {
      setError('Verification code is required');
      return;
    }

    try {
      setTwoFALoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/setup-2fa', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          token,
          secret: twoFASecret,
          verificationCode,
          recoveryCodes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setSuccess('2FA enabled successfully!');
      setUser(prev => prev ? { ...prev, two_fa_enabled: true } : null);
      setShow2FAModal(false);
      setVerificationCode('');
      setQrCode(null);
      setTwoFASecret(null);
    } catch (err) {
      setError('Failed to verify 2FA');
    } finally {
      setTwoFALoading(false);
    }
  }

  // ========== Connect Wallet ==========
  async function handleConnectWallet() {
    if (!window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }

    try {
      setWalletLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });

      if (!accounts || accounts.length === 0) {
        setError('No wallet accounts found');
        return;
      }

      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/connect-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          walletAddress: accounts[0],
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setSuccess('Wallet connected successfully!');
      setUser(prev => prev ? { ...prev, wallet_address: accounts[0] } : null);
      setShowConnectWalletModal(false);
    } catch (err) {
      setError('Failed to connect wallet');
    } finally {
      setWalletLoading(false);
    }
  }

  // ========== Disconnect Wallet ==========
  async function handleDisconnectWallet() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/connect-wallet', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        setError('Failed to disconnect wallet');
        return;
      }

      setSuccess('Wallet disconnected');
      setUser(prev => prev ? { ...prev, wallet_address: null } : null);
    } catch (err) {
      setError('Failed to disconnect wallet');
    }
  }

  // ========== Delete Account ==========
  async function handleDeleteAccount() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError('Failed to delete account');
        return;
      }

      localStorage.removeItem('auth_token');
      router.push('/auth/login?deleted=true');
    } catch (err) {
      setError('Failed to delete account');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="text-slate-400 mt-4">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Profile Not Found</h1>
          <Link href="/auth/login" className="text-blue-500 hover:text-blue-400">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{user.full_name}</h1>
              <p className="text-slate-400 mt-1">{user.email}</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="float-right">×</button>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg">
            {success}
            <button onClick={() => setSuccess(null)} className="float-right">×</button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Account Overview</h2>

              {/* Profile Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField
                  label="Full Name"
                  value={user.full_name}
                  editing={editingName}
                  onEdit={() => setEditingName(!editingName)}
                  onChange={setNewName}
                  onSave={updateName}
                  inputValue={newName}
                />

                <ProfileField
                  label="Email"
                  value={user.email}
                  editing={false}
                  onEdit={() => {}}
                  onChange={() => {}}
                  onSave={() => {}}
                  inputValue={user.email}
                  readOnly
                />

                <ProfileField
                  label="Phone Number"
                  value={user.phone_number || 'Not set'}
                  editing={editingPhone}
                  onEdit={() => setEditingPhone(!editingPhone)}
                  onChange={setNewPhone}
                  onSave={updatePhone}
                  inputValue={newPhone}
                  placeholder="(Optional)"
                />

                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-2">Account Status</p>
                  <p className="text-white font-semibold capitalize">{user.account_status}</p>
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                {editingBio ? (
                  <div>
                    <textarea
                      value={newBio}
                      onChange={e => setNewBio(e.target.value)}
                      maxLength={500}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={4}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={updateBio}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingBio(false)}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingBio(true)}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 cursor-pointer hover:bg-slate-700 transition"
                  >
                    <p className="text-white">{user.bio || 'Add a bio...'}</p>
                  </div>
                )}
              </div>

              {/* Account Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <StatCard
                  label="Account Created"
                  value={new Date(user.created_at).toLocaleDateString()}
                />
                <StatCard
                  label="Last Login"
                  value={user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                />
                <StatCard
                  label="2FA Status"
                  value={user.two_fa_enabled ? '🔒 Enabled' : '🔓 Disabled'}
                />
              </div>
            </div>
          )}

          {/* Receipts Tab */}
          {activeTab === 'receipts' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Your Receipts</h2>
              {receipts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg">No receipts yet</p>
                  <Link href="/tickets" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
                    Buy your first ticket →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {receipts.map(receipt => (
                    <ReceiptCard key={receipt.id} receipt={receipt} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>

              {/* Change Password */}
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                  Update Password
                </button>
              </div>

              {/* 2FA */}
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Two-Factor Authentication</h3>
                    <p className="text-slate-400">
                      {user.two_fa_enabled ? '✓ Enabled' : 'Add an extra layer of security'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShow2FAModal(true)}
                    className={`px-6 py-2 rounded-lg transition ${
                      user.two_fa_enabled
                        ? 'bg-slate-600 hover:bg-slate-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {user.two_fa_enabled ? 'Manage' : 'Enable'}
                  </button>
                </div>
              </div>

              {/* Email Verification */}
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Email Verification</h3>
                    <p className="text-slate-400">
                      {user.email_verified ? '✓ Verified' : 'Verify your email address'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delete Account */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                <p className="text-slate-300 mb-4">
                  Permanently delete your account and all associated data.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Connected Wallet Tab */}
          {activeTab === 'connected' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Connected Wallet</h2>
              {user.wallet_address ? (
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
                  <p className="text-slate-400 mb-2">Connected Wallet Address</p>
                  <p className="text-white font-mono text-lg mb-6">{user.wallet_address}</p>
                  <button
                    onClick={handleDisconnectWallet}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400 mb-6">No wallet connected</p>
                  <button
                    onClick={() => setShowConnectWalletModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Login History Tab */}
          {activeTab === 'history' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Login History</h2>
              {loginHistory.length === 0 ? (
                <p className="text-slate-400">No login history</p>
              ) : (
                <div className="space-y-2">
                  {loginHistory.slice(0, 20).map(entry => (
                    <div key={entry.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex justify-between">
                      <div>
                        <p className="text-white font-semibold">{entry.device_info}</p>
                        <p className="text-slate-400 text-sm">{entry.ip_address}</p>
                      </div>
                      <p className="text-slate-400">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Preferences</h2>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <span className="text-white">Email notifications for new receipts</span>
                </label>
              </div>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <span className="text-white">Email notifications for account activity</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {show2FAModal && (
        <Modal
          title="Setup Two-Factor Authentication"
          onClose={() => {
            setShow2FAModal(false);
            setQrCode(null);
            setVerificationCode('');
          }}
        >
          {qrCode ? (
            <div className="text-center">
              <p className="text-white mb-4">Scan this QR code with your authenticator app</p>
              <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                <Image src={qrCode} alt="2FA QR Code" width={200} height={200} />
              </div>
              <p className="text-slate-300 text-sm mb-4">Or enter this code: {twoFASecret}</p>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                maxLength={6}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-2xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              />
              <button
                onClick={handleVerify2FA}
                disabled={twoFALoading}
                className="w-full px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {twoFALoading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-white mb-4">Setting up two-factor authentication will protect your account</p>
              <button
                onClick={handleSetup2FA}
                disabled={twoFALoading}
                className="w-full px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {twoFALoading ? 'Generating...' : 'Get Started'}
              </button>
            </div>
          )}
        </Modal>
      )}

      {showPasswordModal && (
        <Modal title="Change Password" onClose={() => setShowPasswordModal(false)}>
          {passwordErrors.length > 0 && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg">
              {passwordErrors.map((err, i) => <p key={i}>{err}</p>)}
            </div>
          )}
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleChangePassword}
            className="w-full px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
          >
            Change Password
          </button>
        </Modal>
      )}

      {showDeleteModal && (
        <Modal title="Delete Account" onClose={() => setShowDeleteModal(false)}>
          <p className="text-white mb-4">This action cannot be undone. All your data will be permanently deleted.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
            >
              Delete Account
            </button>
          </div>
        </Modal>
      )}

      {showConnectWalletModal && (
        <Modal title="Connect Wallet" onClose={() => setShowConnectWalletModal(false)}>
          <p className="text-white mb-4">Connect your MetaMask wallet to buy tickets and donate</p>
          <button
            onClick={handleConnectWallet}
            disabled={walletLoading}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {walletLoading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ========== Helper Components ==========

function ProfileField({
  label,
  value,
  editing,
  onEdit,
  onChange,
  onSave,
  inputValue,
  placeholder,
  readOnly,
}: {
  label: string;
  value: string;
  editing: boolean;
  onEdit: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  inputValue: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
      <p className="text-slate-400 text-sm mb-2">{label}</p>
      {editing ? (
        <div>
          <input
            type="text"
            value={inputValue}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-600 border border-slate-500 rounded-lg text-white p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
            >
              Save
            </button>
            <button
              onClick={onEdit}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div onClick={onEdit} className="cursor-pointer group">
          <p className="text-white font-semibold group-hover:text-purple-400 transition">{value}</p>
          {!readOnly && <p className="text-slate-500 text-xs mt-1">Click to edit</p>}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center">
      <p className="text-slate-400 text-sm mb-2">{label}</p>
      <p className="text-white font-semibold text-lg">{value}</p>
    </div>
  );
}

function ReceiptCard({ receipt }: { receipt: Receipt }) {
  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
      <p className="text-slate-400 text-sm">Seat {receipt.seat_section}</p>
      <p className="text-white font-semibold mb-3">{receipt.match_id}</p>
      {receipt.qr_code && (
        <div className="bg-white p-2 rounded-lg mb-3 inline-block">
          <Image
            src={receipt.qr_code}
            alt="Receipt QR"
            width={100}
            height={100}
            className="rounded"
          />
        </div>
      )}
      <p className="text-slate-500 text-xs">{new Date(receipt.created_at).toLocaleDateString()}</p>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
