/**
 * UserStatsCard Component\n * Displays current user's leaderboard stats (if connected wallet)
 * @file UserStatsCard.tsx
 */

'use client';

import React, { FC } from 'react';
import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '@/lib/data/mockLeaderboard';

export interface UserStatsCardProps {
  /**
   * Current user's stats entry
   */
  userStats: LeaderboardEntry | null;

  /**
   * Current user's wallet address
   */
  userAddress?: string;

  /**
   * Reduces animations if user prefers
   */
  prefersReducedMotion?: boolean;
}

/**
 * UserStatsCard Component
 * @component
 */
export const UserStatsCard: FC<UserStatsCardProps> = ({
  userStats,
  userAddress,
  prefersReducedMotion = false,
}) => {
  if (!userStats || !userAddress) {
    return null;
  }

  const getLevelColor = (rank: number) => {
    if (rank <= 10) return 'paws-pink';
    if (rank <= 50) return 'paws-rose';
    if (rank <= 100) return 'paws-mauve';
    return 'paws-electric';
  };

  const getLevelLabel = (rank: number) => {
    if (rank <= 10) return '🌟 Legendary';
    if (rank <= 50) return '👑 Elite';
    if (rank <= 100) return '⭐ Rising Star';
    if (rank <= 500) return '🎯 Achiever';
    return '🌱 Emerging';
  };

  const containerVariants: any = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, type: 'spring', stiffness: 100 },
    },
  };

  const buttonVariants = {
    initial: { opacity: 0, y: 10 },
    animate: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.2 + index * 0.1 },
    }),
    hover: { y: -4, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="w-full py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Card Background */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-paws-mauve/10 to-paws-rose/10 border border-paws-rose/30 backdrop-blur-xl p-6 sm:p-8">
          {/* Animated Background Glow */}
          <motion.div
            className="absolute inset-0 opacity-50 blur-3xl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              background: 'linear-gradient(135deg, rgba(109, 58, 109, 0.3) 0%, rgba(184, 92, 138, 0.3) 100%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 space-y-6">
            {/* Title Row */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-paws-rose to-paws-pink bg-clip-text text-transparent">
                Your Stats
              </h3>
              <motion.span
                className="text-4xl"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🏆
              </motion.span>
            </motion.div>

            {/* Main Stats Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {/* Rank */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Your Rank</p>
                <motion.p
                  className="text-3xl font-black text-paws-rose mt-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  #{userStats.rank}
                </motion.p>
              </div>

              {/* Impact Points */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Impact Points</p>
                <motion.p
                  className="text-3xl font-black text-paws-electric mt-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                >
                  {(userStats.impactPoints / 1000).toFixed(1)}K
                </motion.p>
              </div>

              {/* Level */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:col-span-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Your Level</p>
                <motion.p
                  className="text-2xl font-black mt-2 text-transparent bg-gradient-to-r from-paws-rose to-paws-pink bg-clip-text"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {getLevelLabel(userStats.rank)}
                </motion.p>
              </div>
            </motion.div>

            {/* Secondary Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4"
            >
              {[
                { label: 'Badges', value: userStats.badgeCount, icon: '🏅' },
                { label: 'Tips Sent', value: `${userStats.tips.toFixed(1)}Ξ`, icon: '💝' },
                { label: 'NFTs Minted', value: userStats.nftMintsCount, icon: '🎨' },
              ].map((stat, idx) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl mb-1">{stat.icon}</p>
                  <p className="text-sm font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 border-t border-white/10 pt-6"
            >
              {[
                { label: '👤 View Profile', color: 'from-paws-mauve to-paws-rose' },
                { label: '📊 My Journey', color: 'from-paws-electric to-paws-violet' },
                { label: '🏅 Achievements', color: 'from-paws-rose to-paws-pink' },
              ].map((btn, idx) => (
                <motion.button
                  key={btn.label}
                  custom={idx}
                  variants={buttonVariants}
                  initial="initial"
                  animate="animate"
                  whileHover={!prefersReducedMotion ? 'hover' : {}}
                  className={`flex-1 px-4 py-3 rounded-lg bg-gradient-to-r ${btn.color} text-white font-semibold text-sm sm:text-base transition-all hover:shadow-lg`}
                >
                  {btn.label}
                </motion.button>
              ))}
            </motion.div>

            {/* Wallet Address */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-xs text-gray-500 border-t border-white/10 pt-4"
            >
              Connected: {userAddress.slice(0, 10)}...{userAddress.slice(-8)}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserStatsCard;
