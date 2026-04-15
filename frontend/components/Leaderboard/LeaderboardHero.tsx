/**
 * LeaderboardHero Component
 * Hero section with title animation, gradient text, filter buttons, and stats
 * @file LeaderboardHero.tsx
 */

'use client';

import React, { useState, useCallback, FC, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

export interface LeaderboardHeroProps {
  /**
   * Period type: 'week' or 'season'
   */
  period: 'week' | 'season';

  /**
   * Callback when period changes
   */
  onPeriodChange: (period: 'week' | 'season') => void;

  /**
   * Total player count for animation
   */
  playerCount: number;

  /**
   * Total team count
   */
  teamCount: number;

  /**
   * Filter view: 'players' or 'teams'
   */
  view: 'players' | 'teams';

  /**
   * Callback when view changes
   */
  onViewChange: (view: 'players' | 'teams') => void;

  /**
   * Reduces animations if user prefers
   */
  prefersReducedMotion?: boolean;
}

/**
 * CharacterReveal animation component
 * Staggered character-by-character reveal effect
 */
const CharacterReveal: FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  return (
    <div className="flex flex-wrap justify-center">
      {text.split('').map((char, idx) => (
        <motion.span
          key={`char-${idx}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: delay + idx * 0.03,
            ease: 'easeOut',
          }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </div>
  );
};

/**
 * Animated counter component
 */
const AnimatedCounter: FC<{ value: number; duration?: number; suffix?: string }> = ({
  value,
  duration = 1.5,
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setDisplayValue(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className="font-bold text-paws-rose">
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

/**
 * LeaderboardHero Component
 * @component
 */
export const LeaderboardHero: FC<LeaderboardHeroProps> = ({
  period,
  onPeriodChange,
  playerCount,
  teamCount,
  view,
  onViewChange,
  prefersReducedMotion = false,
}) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + custom * 0.1,
        duration: 0.6,
        ease: 'easeInOut' as const,
      },
    }),
    hover: {
      y: -4,
      boxShadow: '0 20px 40px rgba(184, 92, 138, 0.4)',
      transition: { duration: 0.3 },
    },
  };

  const statsVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: (custom: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.5 + custom * 0.15,
        duration: 0.6,
      },
    }),
  };

  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 -z-10 bg-gradient-to-b from-paws-dark via-paws-dark/80 to-paws-dark pointer-events-none"
      />

      {/* Hero Content */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          {/* Hero Emoji and Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center gap-3 text-5xl sm:text-6xl lg:text-7xl font-black"
          >
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>
              🏆
            </span>
            <span className="bg-gradient-to-r from-paws-mauve via-paws-rose to-paws-electric bg-clip-text text-transparent">
              LEADERBOARD
            </span>
          </motion.div>

          {/* Subtitle with Character Reveal */}
          {!prefersReducedMotion ? (
            <CharacterReveal text="Pure Impact, Pure Ranking" delay={0.3} />
          ) : (
            <h2 className="text-lg sm:text-xl text-gray-300">Pure Impact, Pure Ranking</h2>
          )}

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto"
          >
            Real-time rankings across {teamCount} teams and{' '}
            <AnimatedCounter value={playerCount} suffix=" players" duration={1.5} />
          </motion.p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial="initial"
          animate="animate"
          className="flex flex-wrap justify-center gap-3 sm:gap-4"
        >
          {/* View Toggle */}
          {(['players', 'teams'] as const).map((v, idx) => (
            <motion.button
              key={v}
              custom={idx}
              variants={buttonVariants}
              whileHover={!prefersReducedMotion ? 'hover' : {}}
              onClick={() => onViewChange(v)}
              onMouseEnter={() => setHoveredButton(v)}
              onMouseLeave={() => setHoveredButton(null)}
              className={`relative px-6 py-3 rounded-xl font-semibold transition-all ${
                view === v
                  ? 'bg-gradient-to-r from-paws-mauve to-paws-rose text-white shadow-lg shadow-paws-rose/40'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {v === 'players' ? '👥 Players' : '⚽ Teams'}

              {/* Glow effect on hover */}
              {view === v && (
                <motion.div
                  layoutId="active-button-border"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-paws-mauve to-paws-rose opacity-20 blur"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="h-8 w-px bg-gradient-to-b from-transparent via-paws-rose to-transparent"
          />

          {/* Period Toggle */}
          {(['week', 'season'] as const).map((p, idx) => (
            <motion.button
              key={p}
              custom={idx + 2}
              variants={buttonVariants}
              whileHover={!prefersReducedMotion ? 'hover' : {}}
              onClick={() => onPeriodChange(p)}
              onMouseEnter={() => setHoveredButton(p)}
              onMouseLeave={() => setHoveredButton(null)}
              className={`relative px-6 py-3 rounded-xl font-semibold transition-all ${
                period === p
                  ? 'bg-gradient-to-r from-paws-electric to-paws-violet text-white shadow-lg shadow-paws-electric/40'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {p === 'week' ? '📅 This Week' : '🏆 Season'}

              {period === p && (
                <motion.div
                  layoutId="active-period-border"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-paws-electric to-paws-violet opacity-20 blur"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8"
        >
          {[
            { icon: '🎯', label: 'Active Players', value: playerCount },
            { icon: '⚽', label: 'Teams', value: teamCount },
            { icon: '🔥', label: 'Trending', value: '↑ +15%' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              variants={statsVariants}
              className="group bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/8 transition-all backdrop-blur-sm hover:border-paws-rose/30"
            >
              <div className="text-2xl sm:text-3xl mb-2 transform group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">{stat.label}</p>
              <p className="text-lg sm:text-xl font-bold text-paws-rose">
                {typeof stat.value === 'number' ? (
                  <AnimatedCounter value={stat.value} duration={2} />
                ) : (
                  stat.value
                )}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LeaderboardHero;
