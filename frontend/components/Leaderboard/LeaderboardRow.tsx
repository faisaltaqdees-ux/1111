/**
 * LeaderboardRow Component
 * Individual player entry with rank, team, impact points, badges, and actions
 * @file LeaderboardRow.tsx
 */

'use client';

import React, { FC, useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '@/lib/data/mockLeaderboard';

export interface LeaderboardRowProps {
  /**
   * Player leaderboard entry data
   */
  entry: LeaderboardEntry;

  /**
   * Whether this is the current user
   */
  isCurrentUser: boolean;

  /**
   * Callback when tip button is clicked
   */
  onTip: (playerId: string, playerName: string) => void;

  /**
   * Row index for stagger animation
   */
  index: number;

  /**
   * Reduces animations if user prefers
   */
  prefersReducedMotion?: boolean;
}

/**
 * Badge tooltip component
 */
const BadgeTooltip: FC<{ badge: string; children: React.ReactNode }> = ({ badge, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const badgeDescriptions: { [key: string]: string } = {
    elite: 'Elite • Top 10 performers',
    'rising-star': 'Rising Star • Fast climber',
    'clutch-player': 'Clutch Player • High pressure performer',
    mentor: 'Mentor • Helps team grow',
    legend: 'Legend • All-time great',
    momentum: 'Momentum • Hot streak',
    'impact-maker': 'Impact Maker • Strong contributor',
  };

  return (
    <div className="relative group">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="hover:scale-110 transition-transform"
      >
        {children}
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 border border-white/20 rounded-lg whitespace-nowrap text-xs text-white z-50">
          {badgeDescriptions[badge] || badge}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

/**
 * LeaderboardRow Component
 * @component
 */
export const LeaderboardRow: FC<LeaderboardRowProps> = memo(
  ({ entry, isCurrentUser, onTip, index, prefersReducedMotion = false }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isTipping, setIsTipping] = useState(false);

    const handleTipClick = useCallback(() => {
      setIsTipping(true);
      onTip(entry.playerId, entry.playerName);
      setTimeout(() => setIsTipping(false), 1000);
    }, [entry, onTip]);

    // Rank medal emoji
    const getRankMedal = (rank: number): string => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return '';
    };

    // Determine row styling based on rank
    const isTopThree = entry.rank <= 3;
    const rowGlowColor =
      entry.rank <= 3
        ? 'rgba(255, 105, 180, 0.2)'
        : entry.rank <= 10
          ? 'rgba(184, 92, 138, 0.15)'
          : 'rgba(255, 255, 255, 0.05)';

    const rowVariants: any = {
      initial: { opacity: 0, y: 20, x: -20 },
      animate: {
        opacity: 1,
        y: 0,
        x: 0,
        transition: {
          duration: 0.5,
          delay: index * 0.04,
          ease: 'easeOut',
        },
      },
      hover: {
        x: 8,
        boxShadow: `0 20px 40px ${rowGlowColor}`,
        transition: { duration: 0.3 },
      },
    };

    const rankChangeVariants = {
      initial: { scale: 1 },
      animate: { scale: [1, 1.2, 1] },
    };

    return (
      <motion.div
        variants={rowVariants}
        initial="initial"
        animate="animate"
        whileHover={!prefersReducedMotion ? 'hover' : {}}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative rounded-xl border transition-all duration-300 ${
          isCurrentUser
            ? 'bg-gradient-to-r from-paws-mauve/20 to-paws-rose/20 border-paws-rose/30'
            : 'border-white/10 hover:border-paws-rose/20'
        }`}
        style={{
          background: isCurrentUser
            ? undefined
            : `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
          backdropFilter: 'blur(10px)',
          boxShadow: isHovered
            ? `inset 0 1px 0 0 rgba(255,255,255,0.1), 0 0 30px ${rowGlowColor}`
            : 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Content Grid */}
        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
          {/* 1. Rank Badge */}
          <motion.div
            className="flex-shrink-0 w-12 sm:w-14 flex items-center justify-center"
            animate={entry.rankChange !== 0 ? 'animate' : 'initial'}
            variants={rankChangeVariants}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              {isTopThree ? (
                <div className="text-3xl sm:text-4xl">{getRankMedal(entry.rank)}</div>
              ) : (
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-black text-paws-rose">{entry.rank}</div>
                  <div className="text-xs text-gray-500">rank</div>
                </div>
              )}

              {/* Rank Change Indicator */}
              {entry.rankChange !== 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`absolute -top-1 -right-1 text-xs font-bold ${
                    entry.rankChange > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {entry.rankChange > 0 ? '↑' : '↓'}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* 2. Player Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white truncate text-sm sm:text-base">{entry.playerName}</p>

              {isCurrentUser && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-shrink-0 px-2 py-1 bg-paws-rose/20 border border-paws-rose/40 rounded-full text-xs font-bold text-paws-rose"
                >
                  YOU
                </motion.span>
              )}
            </div>

            {/* Wallet Address */}
            <p className="text-xs text-gray-500 truncate">{entry.walletAddress.slice(0, 10)}...{entry.walletAddress.slice(-6)}</p>
          </div>

          {/* 3. Team Badge */}
          <motion.div
            className="hidden sm:flex flex-shrink-0 items-center gap-2 px-3 py-1.5 rounded-lg border"
            style={{
              background: `${entry.teamColor}10`,
              borderColor: `${entry.teamColor}40`,
            }}
            animate={isHovered ? { boxShadow: `0 0 20px ${entry.teamColor}60` } : {}}
            transition={{ duration: 0.3 }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.teamColor }}
            />
            <span
              className="text-xs font-bold"
              style={{ color: entry.teamColor }}
            >
              {entry.teamAbbreviation}
            </span>
          </motion.div>

          {/* 4. Impact Points */}
          <div className="hidden md:flex flex-shrink-0 flex-col items-end">
            <motion.p
              className="text-lg font-bold bg-gradient-to-r from-paws-mauve to-paws-rose bg-clip-text text-transparent"
              key={entry.impactPoints}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
            >
              {entry.impactPoints.toLocaleString()}
            </motion.p>
            <p className="text-xs text-gray-500">points</p>
          </div>

          {/* 5. Badges Grid */}
          <div className="hidden lg:flex flex-shrink-0 gap-1.5">
            {entry.badges.slice(0, 3).map((badge, idx) => (
              <BadgeTooltip key={badge} badge={badge}>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                  className="text-lg hover:scale-125 transition-transform cursor-help"
                  whileHover={{ rotate: 10 }}
                >
                  {badge === 'elite'
                    ? '👑'
                    : badge === 'rising-star'
                      ? '⭐'
                      : badge === 'clutch-player'
                        ? '💪'
                        : badge === 'mentor'
                          ? '🎓'
                          : badge === 'legend'
                            ? '🐉'
                            : badge === 'momentum'
                              ? '🔥'
                              : '💎'}
                </motion.div>
              </BadgeTooltip>
            ))}

            {entry.badges.length > 3 && (
              <div className="text-xs font-bold text-gray-400 flex items-center px-1.5">
                +{entry.badges.length - 3}
              </div>
            )}
          </div>

          {/* 6. Action Buttons */}
          <div className="flex flex-shrink-0 gap-2">
            {/* Tip Button */}
            <motion.button
              onClick={handleTipClick}
              disabled={isTipping}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-paws-rose to-paws-pink text-white font-semibold text-sm hover:shadow-lg hover:shadow-paws-rose/40 disabled:opacity-50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={isTipping ? { scale: [1, 1.1, 1] } : {}}
            >
              💝 Tip
            </motion.button>

            {/* Profile Button */}
            <motion.button
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-semibold text-sm hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📋
            </motion.button>
          </div>
        </div>

        {/* Mobile Stats Row (shown on small screens) */}
        {entry.impactPoints && (
          <motion.div
            className="md:hidden px-3 sm:px-4 pb-2 flex items-center justify-between text-xs border-t border-white/5 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-gray-500">
              <span className="text-paws-rose font-bold">{entry.impactPoints.toLocaleString()}</span> points
            </span>
            <span className="text-gray-500">
              <span className={entry.rankChange > 0 ? 'text-green-400' : 'text-red-400'}>
                {entry.rankChange > 0 ? '+' : ''}{entry.rankChange}
              </span>{' '}
              this week
            </span>
          </motion.div>
        )}
      </motion.div>
    );
  }
);

LeaderboardRow.displayName = 'LeaderboardRow';

export default LeaderboardRow;
