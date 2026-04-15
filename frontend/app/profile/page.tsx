'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  wallet_address?: string;
  balance?: string;
  created_at: string;
}

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const auth = localStorage.getItem('auth_user');
    if (!auth) {
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(auth);
    setProfile(user);
    setFormData(user);
    setLoading(false);
  }, [router]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Update failed');
      toast.success('Profile updated!');
      setEditing(false);
      const updated = await response.json();
      setProfile(updated);
      localStorage.setItem('auth_user', JSON.stringify(updated));
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-psl-dark text-white overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-psl-gradient opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-psl-mauve opacity-10 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
        {/* Header */}
        <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-psl-gradient bg-clip-text text-transparent">PSL Pulse</Link>
            <div className="flex gap-4">
              <Link href="/my-tickets" className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition">🎫 Tickets</Link>
              <button onClick={() => { localStorage.clear(); router.push('/'); }} className="px-6 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 transition">🚪 Logout</button>
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
            <h1 className="text-5xl font-bold mb-2">👤 My Profile</h1>
            <p className="text-white/70">Manage your account information</p>
          </motion.div>

          {profile ? (
            <div className="grid gap-8">
              {/* Profile Card */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-glass-bg border border-glass-border rounded-2xl p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{profile.full_name}</h2>
                    <p className="text-white/70">📧 {profile.email}</p>
                    {profile.phone_number && <p className="text-white/70">📱 {profile.phone_number}</p>}
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setEditing(!editing)} className="px-6 py-2 rounded-lg bg-psl-gradient text-white font-semibold hover:opacity-90">
                    {editing ? '✅ Done' : '✏️ Edit'}
                  </motion.button>
                </div>

                {editing && (
                  <motion.div initial="hidden" animate="visible" variants={tabVariants} className="space-y-4 pt-6 border-t border-white/10">
                    <div>
                      <label className="text-sm text-white/70">Full Name</label>
                      <input type="text" value={formData.full_name || ''} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full mt-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-psl-rose focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Phone Number</label>
                      <input type="tel" value={formData.phone_number || ''} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className="w-full mt-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-psl-rose focus:outline-none" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="w-full mt-4 px-6 py-3 rounded-lg bg-psl-gradient text-white font-semibold hover:opacity-90">
                      💾 Save Changes
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>

              {/* Account Stats */}
              <motion.div variants={tabVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="grid md:grid-cols-2 gap-6">
                <div className="bg-glass-bg border border-glass-border rounded-2xl p-6">
                  <p className="text-white/70 text-sm mb-2">Account Created</p>
                  <p className="text-2xl font-bold">{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-glass-bg border border-glass-border rounded-2xl p-6">
                  <p className="text-white/70 text-sm mb-2">Account Balance</p>
                  <p className="text-2xl font-bold text-psl-rose">{profile.balance || 'PKR 0.00'}</p>
                </div>
              </motion.div>

              {/* Security Section */}
              <motion.div variants={tabVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="bg-glass-bg border border-glass-border rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6">🔐 Security</h3>
                <div className="space-y-4">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full px-6 py-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition text-left">
                    🔑 Change Password
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full px-6 py-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition text-left">
                    ☑️ Enable Two-Factor Authentication
                  </motion.button>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-psl-rose/20 border-t-psl-rose rounded-full animate-spin mx-auto mb-4" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
