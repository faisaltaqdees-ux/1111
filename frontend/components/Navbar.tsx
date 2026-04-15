/**
 * Navbar Component - Complete Production Version
 * User-friendly navigation with all essential buttons and links
 * Supports both authenticated and unauthenticated states
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/GlobalAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, wallet, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items for all users
  const publicNavItems = [
    { label: '🎟️ Tickets', href: '/tickets', description: 'Buy match tickets' },
    { label: '🏆 Leaderboard', href: '/leaderboard', description: 'View top supporters' },
    { label: '💰 Donations', href: '/donations', description: 'Support charities' },
    { label: '👤 Players', href: '/players', description: 'Tip players' },
  ];

  // Additional items for authenticated users
  const authNavItems = [
    { label: '🎫 My Tickets', href: '/my-tickets', description: 'Your purchased tickets' },
    { label: '⚙️ Settings', href: '/settings', description: 'Account settings' },
    { label: '💳 Transactions', href: '/transactions', description: 'Payment history' },
  ];

  const navItems = isAuthenticated ? [...publicNavItems, ...authNavItems] : publicNavItems;

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/95 border-b border-purple-500/20'
          : 'bg-black/80 border-b border-purple-500/10'
      } backdrop-blur-lg`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-2xl md:text-3xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">
                PSL
              </span>
              <span className="bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent ml-2">
                Pulse
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-1 items-center">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm font-medium group relative"
              >
                {item.label}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-rose-400 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <div className="w-px h-6 bg-gray-700 mx-2" />
                {authNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm font-medium group relative"
                  >
                    {item.label}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-rose-400 group-hover:w-full transition-all duration-300" />
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated && wallet?.address && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-900/20 border border-purple-500/30">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs text-gray-300 font-mono">{formatAddress(wallet.address)}</span>
              </div>
            )}

            {isAuthenticated ? (
              <>
                {/* User Info - Mobile */}
                <div className="lg:hidden text-right">
                  <p className="text-xs font-semibold text-white">{user?.fullName || user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Logout Button - Desktop */}
                <button
                  onClick={handleLogout}
                  className="hidden sm:px-4 sm:py-2 sm:rounded-lg sm:bg-red-600/20 sm:hover:bg-red-600/30 sm:text-red-400 sm:text-sm sm:font-medium sm:transition-colors lg:block"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden sm:px-4 sm:py-2 sm:text-sm sm:font-medium sm:text-gray-300 sm:hover:text-white sm:transition-colors sm:block"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-rose-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/95 border-t border-purple-500/20"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-lg hover:bg-purple-900/20 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </Link>
              ))}

              <div className="border-t border-gray-700 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium transition-colors text-sm mt-2"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
