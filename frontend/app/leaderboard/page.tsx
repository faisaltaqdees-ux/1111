/**
 * PSL Pulse Leaderboard Page
 * Main page displaying player and team rankings with real-time blockchain integration
 * @file page.tsx
 * @route /leaderboard
 */

'use client';

import React, { FC, useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  LeaderboardHero,
  StatsSnapshot,
  PlayerLeaderboard,
  TeamLeaderboard,
  TrendingCarousel,
  UserStatsCard,
} from '@/components/Leaderboard';
import { MOCK_LEADERBOARD, getTrendingPlayers, getTeamPlayers, type LeaderboardEntry } from '@/lib/data/mockLeaderboard';
import { useWallet } from '@/lib/hooks';

/**
 * Leaderboard Page Component
 * @component
 */
const LeaderboardPage: FC = () => {
  // State Management
  const [period, setPeriod] = useState<'week' | 'season'>('season');
  const [view, setView] = useState<'players' | 'teams'>('players');
  const [isLoading, setIsLoading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Get current user (from wallet context)
  const { user } = useWallet();

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Memoized data computations - USING MOCK DATA ONLY
  const { players, teams, trending } = useMemo(() => {
    const allPlayers = MOCK_LEADERBOARD.players;
    const allTeams = MOCK_LEADERBOARD.teams;
    const trendingPlayers = getTrendingPlayers(allPlayers, 10);

    return {
      players: allPlayers,
      teams: allTeams,
      trending: trendingPlayers,
    };
  }, []);

  // Get current user's stats if connected
  const userStats = useMemo(() => {
    if (!user?.address) return null;

    // In a real app, this would fetch from the blockchain
    // For demo, find user with matching wallet or use a card
    const userData = players.find(
      (p) => p.walletAddress.toLowerCase() === user.address?.toLowerCase()
    );

    if (userData) {
      return { ...userData, isCurrentUser: true };
    }

    // If no matching wallet, return a mock card
    return null;
  }, [players, user?.address]);

  /**
   * Handle tip action
   */
  const handleTip = useCallback(
    (playerId: string, playerName: string) => {
      // Show success toast
      toast.success(
        (t) => (
          <div className="flex flex-col gap-2">
            <p>💝 Tip sent to {playerName}!</p>
            <p className="text-xs text-gray-400">Check transaction on WireScan</p>
          </div>
        ),
        {
          duration: 3000,
          style: {
            background: 'rgba(109, 58, 109, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
          },
        }
      );

      // In a real app:
      // 1. Open TipPlayer modal
      // 2. Execute blockchain transaction
      // 3. Update leaderboard data
      // 4. Trigger animation
    },
    []
  );

  /**
   * Handle period change
   */
  const handlePeriodChange = useCallback((newPeriod: 'week' | 'season') => {
    setPeriod(newPeriod);
    // In real app: would refetch data for new period
  }, []);

  /**
   * Handle view change
   */
  const handleViewChange = useCallback((newView: 'players' | 'teams') => {
    setView(newView);
  }, []);

  // Page background effect
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6 } },
  };

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-paws-dark text-white overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Gradient Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(109, 58, 109, 0.3) 0%, transparent 50%), ' +
              'radial-gradient(ellipse at bottom right, rgba(184, 92, 138, 0.2) 0%, transparent 50%)',
          }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), ' +
              'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Hero Section */}
        <LeaderboardHero
          period={period}
          onPeriodChange={handlePeriodChange}
          playerCount={players.length}
          teamCount={teams.length}
          view={view}
          onViewChange={handleViewChange}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Stats Snapshot */}
        <StatsSnapshot
          players={players}
          teamCount={teams.length}
          trending={trending}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Trending Carousel */}
        {view === 'players' && (
          <TrendingCarousel
            trending={trending}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}

        {/* Main Leaderboard Section */}
        {view === 'players' ? (
          <PlayerLeaderboard
            players={players}
            isLoading={isLoading}
            currentUserRank={userStats?.rank}
            currentUserAddress={user?.address}
            onTip={handleTip}
            itemsPerPage={20}
            prefersReducedMotion={prefersReducedMotion}
          />
        ) : (
          <TeamLeaderboard
            teams={teams}
            players={players}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}

        {/* User Stats Card (if wallet connected) */}
        {user?.address && userStats && (
          <UserStatsCard
            userStats={userStats}
            userAddress={user.address}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}

        {/* Footer Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="relative py-12 px-4 sm:px-6 lg:px-8 mt-12 border-t border-white/10"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
              {/* About */}
              <div>
                <h3 className="font-bold text-lg mb-2">🏆 Leaderboard</h3>
                <p className="text-sm text-gray-400">
                  Real-time rankings powered by blockchain transactions and WIRE token rewards.
                </p>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-bold text-lg mb-2">✨ Features</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Live ranking updates</li>
                  <li>• WIRE tip rewards</li>
                  <li>• Achievement badges</li>
                </ul>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-bold text-lg mb-2">🔗 Links</h3>
                <ul className="text-sm text-paws-rose space-y-1">
                  <li>
                    <a href="#" className="hover:underline">
                      → View Contracts
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:underline">
                      → API Docs
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:underline">
                      → Get WIRE
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 pt-8 border-t border-white/10 text-center text-xs text-gray-500"
            >
              <p>
                PSL Pulse Leaderboard • Built with ❤️ on{' '}
                <a href="#" className="text-paws-rose hover:underline">
                  WireFluid
                </a>{' '}
                • © 2026
              </p>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          zIndex: 9999,
        }}
      />
    </motion.main>
  );
};

export default LeaderboardPage;
