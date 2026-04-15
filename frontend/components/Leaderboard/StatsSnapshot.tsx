/**
 * StatsSnapshot Component
 * Three glassmorphic cards displaying key metrics
 * @file StatsSnapshot.tsx
 */

'use client';

import React, { FC, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '@/lib/data/mockLeaderboard';

export interface StatsSnapshotProps {
  /**
   * All players for calculating stats
   */
  players: LeaderboardEntry[];

  /**
   * Number of teams
   */
  teamCount: number;

  /**
   * Top trending players this week
   */
  trending: LeaderboardEntry[];

  /**
   * Reduces animations if user prefers
   */
  prefersReducedMotion?: boolean;
}

interface StatCard {
  icon: string;
  label: string;
  value: string | React.ReactNode;
  subtext: string;
  gradient: string;
  glowColor: string;
}

/**
 * StatsSnapshot Component
 * @component
 */
export const StatsSnapshot: FC<StatsSnapshotProps> = ({
  players,
  teamCount,
  trending,
  prefersReducedMotion = false,
}) => {
  const stats = useMemo((): StatCard[] => {
    const topTrendingName = trending.length > 0 ? trending[0].playerName : 'N/A';
    const topTrendingRank = trending.length > 0 ? `#${trending[0].rank}` : '-';

    return [
      {
        icon: '🎯',
        label: 'Active Players',
        value: players.length.toLocaleString(),
        subtext: `→↑ +${Math.floor(Math.random() * 50 + 10)} this week`,
        gradient: 'from-paws-mauve to-paws-rose',
        glowColor: 'rgba(184, 92, 138, 0.3)',
      },
      {
        icon: '⚽',
        label: 'Teams',
        value: teamCount,
        subtext: 'All Active',
        gradient: 'from-paws-electric to-paws-violet',
        glowColor: 'rgba(59, 130, 246, 0.3)',
      },
      {
        icon: '🔥',
        label: 'Trending',
        value: topTrendingName,
        subtext: `${topTrendingRank} this week • +${trending.length > 0 ? trending[0].pointsChange : 0} pts`,
        gradient: 'from-paws-rose to-paws-pink',
        glowColor: 'rgba(255, 105, 180, 0.3)',
      },
    ];
  }, [players, teamCount, trending]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants: any = {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
      },
    },
    hover: {
      y: -10,
      boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="w-full py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            custom={idx}
            variants={cardVariants}
            whileHover={!prefersReducedMotion ? 'hover' : {}}
            className="group relative"
          >
            {/* Glassmorphic Card Background */}
            <div
              className="absolute inset-0 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
              style={{
                boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.06), 0 20px 40px ${stat.glowColor}`,
              }}
            />

            {/* Animated Gradient Border on Hover */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, ${stat.glowColor} 0%, transparent 100%)`,
                filter: 'blur(8px)',
              }}
            />

            {/* Content */}
            <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-between">
              {/* Icon */}
              <motion.div
                className="text-4xl mb-4 transform group-hover:scale-110 transition-transform"
                animate={!prefersReducedMotion ? { y: [0, -5, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {stat.icon}
              </motion.div>

              {/* Label */}
              <div className="space-y-2 flex-1">
                <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">
                  {stat.label}
                </p>

                {/* Value with Gradient */}
                <p className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>

              {/* Subtext */}
              <motion.p
                className="text-gray-500 text-xs sm:text-sm mt-3 border-t border-white/10 pt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                {stat.subtext}
              </motion.p>
            </div>

            {/* Spark Effect on Mount */}
            <motion.div
              className="absolute -top-2 -right-2 w-1 h-1 bg-paws-rose rounded-full"
              animate={!prefersReducedMotion ? { scale: [1, 4, 0], opacity: [1, 0.5, 0] } : {}}
              transition={{ duration: 1.5, delay: 0.5 + idx * 0.2 }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StatsSnapshot;
