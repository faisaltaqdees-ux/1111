
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';

import Card from '../../components/Card';
import Button from '../../components/Button';
import { CardSkeleton } from '../../components/Skeleton';
import { Navbar } from '../../components/Navbar';
import { PaymentButton } from '../../components/PaymentButton';
import { useWallet } from '../../lib/hooks';
import type { MatchStatus } from '../../lib/types';

/**
 * PSL Pulse Matches Page
 * Displays all active and upcoming PSL matches with glassmorphic, animated cards.
 * All actions (Back, Details) are fully functional and animated.
 * @returns {React.ReactElement}
 */
export default function MatchesPage(): React.ReactElement {
  const [isLoading] = React.useState(false);
  const router = useRouter();
  const { user, connect, isConnecting } = useWallet();

  // Mock data for demo; replace with contract data in production
  const matches = [
    {
      id: '1',
      team1: 'HYK',
      team2: 'LAH',
      status: 'live' as MatchStatus,
      odds1: 1.85,
      odds2: 2.1,
      totalBets: '$5,200',
    },
    {
      id: '2',
      team1: 'KAR',
      team2: 'PES',
      status: 'upcoming' as MatchStatus,
      odds1: 1.95,
      odds2: 1.95,
      totalBets: '$3,100',
    },
    {
      id: '3',
      team1: 'MUL',
      team2: 'QUA',
      status: 'upcoming' as MatchStatus,
      odds1: 2.2,
      odds2: 1.73,
      totalBets: '$2,400',
    },
  ];

  /**
   * Handles navigation to the match details page.
   * @param matchId - The match ID to view details for
   */
  function handleDetails(matchId: string): void {
    router.push(`/matches/${matchId}`);
  }

  return (
    <main className="min-h-screen py-16 px-4 bg-linear-to-b from-mauve-950 to-rose-950">
      <Navbar />

      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto mb-12 text-center"
      >
        <h1 className="text-5xl font-bold bg-linear-to-r from-mauve-400 to-rose-400 bg-clip-text text-transparent mb-3">
          Active & Upcoming Matches
        </h1>
        <p className="text-lg text-mauve-200">Back your team, view live odds, and join the PSL Pulse action.</p>
        {!user?.isConnected && (
          <Button
            variant="primary"
            size="lg"
            className="mt-6"
            onClick={connect}
            isLoading={isConnecting}
            aria-label="Connect Wallet"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        )}
      </motion.header>

      <AnimatePresence>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.section
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.15 },
              },
            }}
          >
            {matches.map((match, idx) => (
              <motion.article
                key={match.id}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ type: 'spring', stiffness: 120, damping: 18, delay: idx * 0.1 }}
                whileHover={{ scale: 1.03, boxShadow: '0 0 0 4px #e0aaff44, 0 8px 32px #a084ee33' }}
                aria-label={`Match ${match.team1} vs ${match.team2}`}
              >
                <Card
                  gradient={match.status === 'live'}
                  className="hover:border-rose-400/70 hover:shadow-mauve-glow transition-all duration-300 focus-within:ring-2 focus-within:ring-rose-400"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-mauve-300 text-sm">Match #{match.id}</span>
                        {match.status === 'live' && (
                          <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-label="Live" />
                        )}
                      </div>
                      <h2 className="text-4xl font-bold text-white">
                        <span className="bg-linear-to-r from-mauve-400 to-rose-400 bg-clip-text text-transparent mr-2">{match.team1}</span>
                        <span className="text-mauve-300">vs</span>
                        <span className="bg-linear-to-r from-mauve-400 to-rose-400 bg-clip-text text-transparent ml-2">{match.team2}</span>
                      </h2>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm backdrop-blur-md ${
                          match.status === 'live'
                            ? 'border-green-400/50 bg-green-400/10 text-green-400 animate-pulse'
                            : 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400'
                        }`}
                        aria-label={match.status === 'live' ? 'Live' : 'Upcoming'}
                      >
                        {match.status === 'live' ? 'LIVE' : 'UPCOMING'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-mauve-800">
                    <div className="space-y-1">
                      <p className="text-mauve-300 text-xs uppercase tracking-wider">1 Odds</p>
                      <p className="text-3xl font-bold text-mauve-400 drop-shadow-glow">{match.odds1}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-mauve-300 text-xs uppercase tracking-wider">2 Odds</p>
                      <p className="text-3xl font-bold text-rose-400 drop-shadow-glow">{match.odds2}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-mauve-300 text-xs uppercase tracking-wider">Total Bets</p>
                      <p className="text-3xl font-bold text-rose-300 drop-shadow-glow">{match.totalBets}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-mauve-300 text-xs uppercase tracking-wider">Network</p>
                      <p className="text-3xl font-bold text-mauve-200">⚡</p>
                    </div>
                  </div>

                  <motion.div
                    className="flex flex-col sm:flex-row gap-3 mt-6"
                    initial={false}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex-1">
                      <PaymentButton
                        userAddress={user?.address}
                        wireAmount={ethers.parseEther('0.35')}
                        purpose="donation"
                        label={`Support ${match.team1}`}
                        size="md"
                        metadata={{ matchId: match.id }}
                        onSuccess={(txHash) => {
                          // Trigger leaderboard update
                          console.log('Donation successful:', txHash);
                        }}
                        disabled={!user?.isConnected}
                        variant="primary"
                      />
                    </div>
                    <div className="flex-1">
                      <PaymentButton
                        userAddress={user?.address}
                        wireAmount={ethers.parseEther('0.35')}
                        purpose="donation"
                        label={`Support ${match.team2}`}
                        size="md"
                        metadata={{ matchId: match.id }}
                        onSuccess={(txHash) => {
                          // Trigger leaderboard update
                          console.log('Donation successful:', txHash);
                        }}
                        disabled={!user?.isConnected}
                        variant="secondary"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      className="flex-1"
                      aria-label="View Details"
                      onClick={() => handleDetails(match.id)}
                    >
                      Details
                    </Button>
                  </motion.div>
                </Card>
              </motion.article>
            ))}
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
