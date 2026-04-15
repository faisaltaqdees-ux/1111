/**
 * PlayerLeaderboard Component
 * Main ranked player list with pagination and virtualization support
 * @file PlayerLeaderboard.tsx
 */

'use client';

import React, { FC, useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LeaderboardRow from './LeaderboardRow';
import type { LeaderboardEntry } from '@/lib/data/mockLeaderboard';

export interface PlayerLeaderboardProps {
  /**
   * All players to display
   */
  players: LeaderboardEntry[];

  /**
   * Whether data is loading
   */
  isLoading?: boolean;

  /**
   * Current user's rank (for highlighting)
   */
  currentUserRank?: number;

  /**
   * Current user's address
   */
  currentUserAddress?: string;

  /**
   * Callback when player is tipped
   */
  onTip: (playerId: string, playerName: string) => void;

  /**
   * Items per page for pagination
   */
  itemsPerPage?: number;

  /**
   * Reduces animations if user prefers
   */
  prefersReducedMotion?: boolean;
}

/**
 * Skeleton Loading Row Component
 */
const SkeletonRow: FC<{ index: number }> = ({ index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.05 }}
    className="rounded-xl border border-white/10 bg-white/3 backdrop-blur-xl p-4 animate-pulse"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-white/10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/10 rounded w-40" />
        <div className="h-3 bg-white/10 rounded w-24" />
      </div>
      <div className="h-10 w-20 bg-white/10 rounded-lg" />
    </div>
  </motion.div>
);

/**
 * PlayerLeaderboard Component
 * @component
 */
export const PlayerLeaderboard: FC<PlayerLeaderboardProps> = ({
  players,
  isLoading = false,
  currentUserRank,
  currentUserAddress,
  onTip,
  itemsPerPage = 20,
  prefersReducedMotion = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(players.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlayers = players.slice(startIndex, endIndex);

  // Reset page on data change
  useEffect(() => {
    setCurrentPage(1);
  }, [players]);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  // Generate page numbers to display (ellipsis support)
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
      },
    },
  };

  const listVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  };

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-paws-mauve to-paws-rose bg-clip-text text-transparent">
            Player Rankings
          </h2>

          <p className="text-sm text-gray-400 mt-2 sm:mt-0">
            Showing {startIndex + 1}–{Math.min(endIndex, players.length)} of {players.length} players
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {Array.from({ length: 5 }).map((_, idx) => (
              <SkeletonRow key={idx} index={idx} />
            ))}
          </motion.div>
        ) : (
          <>
            {/* Player List */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${currentPage}`}
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-3"
              >
                {currentPlayers.length > 0 ? (
                  currentPlayers.map((player, idx) => (
                    <LeaderboardRow
                      key={player.playerId}
                      entry={{
                        ...player,
                        isCurrentUser:
                          player.rank === currentUserRank ||
                          player.walletAddress === currentUserAddress,
                      }}
                      isCurrentUser={
                        player.rank === currentUserRank ||
                        player.walletAddress === currentUserAddress
                      }
                      onTip={onTip}
                      index={idx}
                      prefersReducedMotion={prefersReducedMotion}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <p className="text-gray-400">No players found</p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2"
              >
                {/* Previous Button */}
                <motion.button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  ← Previous
                </motion.button>

                {/* Page Numbers */}
                <div className="flex flex-wrap justify-center gap-2">
                  {pageNumbers.map((page, idx) => (
                    <motion.button
                      key={`${page}-${idx}`}
                      onClick={() => {
                        if (typeof page === 'number') {
                          setCurrentPage(page);
                        }
                      }}
                      disabled={typeof page === 'string'}
                      whileHover={typeof page === 'number' ? { scale: 1.1 } : {}}
                      whileTap={typeof page === 'number' ? { scale: 0.95 } : {}}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                        page === currentPage
                          ? 'bg-gradient-to-r from-paws-mauve to-paws-rose text-white shadow-lg shadow-paws-rose/40'
                          : typeof page === 'number'
                            ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                            : 'text-gray-500 cursor-default'
                      }`}
                    >
                      {page}
                    </motion.button>
                  ))}
                </div>

                {/* Next Button */}
                <motion.button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  Next →
                </motion.button>
              </motion.div>
            )}
          </>
        )}

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 rounded-lg bg-white/3 border border-white/10 text-center text-xs sm:text-sm text-gray-400"
        >
          💡 Interact with players to send WIRE tips and unlock badges. Rankings update in real-time based on blockchain activity.
        </motion.div>
      </div>
    </div>
  );
};

export default PlayerLeaderboard;
