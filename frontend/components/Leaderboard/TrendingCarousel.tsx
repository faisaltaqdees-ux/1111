/**
 * TrendingCarousel Component
 * Horizontal carousel of trending players this week
 * @file TrendingCarousel.tsx
 */

'use client';

import React, { FC, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '@/lib/data/mockLeaderboard';

export interface TrendingCarouselProps {
  /**
   * Trending players
   */
  trending: LeaderboardEntry[];

  /**
   * Reduces animations if user prefers
   */
  prefersReducedMotion?: boolean;
}

/**
 * Individual trending card
 */
const TrendingCard: FC<{ player: LeaderboardEntry; index: number }> = ({ player, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    className="flex-shrink-0 w-48 sm:w-56 lg:w-64"
  >
    <div
      className="rounded-xl p-4 border-2 backdrop-blur-xl relative overflow-hidden group cursor-pointer"
      style={{
        borderColor: player.teamColor,
        background: `linear-gradient(135deg, ${player.teamColor}10 0%, ${player.teamColor}05 100%)`,
      }}
    >
      {/* Animated border glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          boxShadow: `inset 0 0 20px ${player.teamColor}60, 0 0 30px ${player.teamColor}40`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 space-y-3">
        {/* Trending Badge */}
        <motion.div
          className="flex items-center gap-2"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-2xl">🔥</span>
          <span
            className="text-xs font-bold px-2 py-1 rounded-full"
            style={{
              background: `${player.teamColor}30`,
              color: player.teamColor,
            }}
          >
            TRENDING
          </span>
        </motion.div>

        {/* Rank and Name */}
        <div>
          <p className="text-xs text-gray-400">#{player.rank}</p>
          <p className="font-bold text-white truncate">{player.playerName}</p>
          <p
            className="text-xs font-semibold"
            style={{ color: player.teamColor }}
          >
            {player.teamAbbreviation} • {player.teamName}
          </p>
        </div>

        {/* Points and Change */}
        <div className="border-t border-white/10 pt-3">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-400">Impact Points</p>
            <motion.p
              className="font-bold text-lg bg-gradient-to-r from-paws-mauve to-paws-rose bg-clip-text text-transparent"
              key={player.impactPoints}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
            >
              {player.impactPoints.toLocaleString()}
            </motion.p>
          </div>

          {/* Points Change */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">This Week</p>
            <motion.p
              className={`font-bold text-sm ${
                player.pointsChange > 0 ? 'text-green-400' : 'text-red-400'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {player.pointsChange > 0 ? '+' : ''}{player.pointsChange.toLocaleString()}
            </motion.p>
          </div>
        </div>

        {/* Badges preview */}
        {player.badges.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {player.badges.slice(0, 2).map((badge) => (
              <span key={badge} className="text-sm">
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
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

/**
 * TrendingCarousel Component
 * @component
 */
export const TrendingCarousel: FC<TrendingCarouselProps> = ({
  trending,
  prefersReducedMotion = false,
}) => {
  const [scrollContainer, setScrollContainer] = React.useState<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (scrollContainer) {
      setCanScrollLeft(scrollContainer.scrollLeft > 0);
      setCanScrollRight(
        scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth - 10
      );
    }
  }, [scrollContainer]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainer) {
      const scrollAmount = 300;
      scrollContainer.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });

      setTimeout(checkScroll, 300);
    }
  };

  React.useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    scrollContainer?.addEventListener('scroll', checkScroll);

    return () => {
      window.removeEventListener('resize', checkScroll);
      scrollContainer?.removeEventListener('scroll', checkScroll);
    };
  }, [scrollContainer, checkScroll]);

  if (trending.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex items-center justify-between"
        >
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-paws-rose to-paws-pink bg-clip-text text-transparent">
            🔥 Trending This Week
          </h2>

          <p className="hidden sm:block text-sm text-gray-400">
            Top risers and movers
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Scroll Button */}
          <motion.button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gradient-to-r from-paws-mauve to-paws-rose disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-white font-bold shadow-lg transition-all"
          >
            ←
          </motion.button>

          {/* Right Scroll Button */}
          <motion.button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gradient-to-r from-paws-rose to-paws-pink disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-white font-bold shadow-lg transition-all"
          >
            →
          </motion.button>

          {/* Scrollable Content */}
          <div
            ref={setScrollContainer}
            className="flex gap-4 overflow-x-auto scroll-smooth px-6 pb-4 [scrollbar-width:thin] [scrollbar-color:rgba(184,92,138,0.3)_transparent]"
            onScroll={checkScroll}
          >
            {trending.map((player, idx) => (
              <TrendingCard key={player.playerId} player={player} index={idx} />
            ))}
          </div>
        </div>

        {/* Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-gray-500 mt-4"
        >
          💡 Players ranked by points earned this week. Click a card to see full profile.
        </motion.p>
      </div>
    </div>
  );
};

export default TrendingCarousel;
