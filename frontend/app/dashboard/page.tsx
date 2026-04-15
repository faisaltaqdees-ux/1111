'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useWallet } from '@/lib/hooks';
import { useAppStore } from '@/lib/store';
import { formatEther } from 'ethers';

export default function DashboardPage() {
  const { user, connect } = useWallet();
  const { setUser } = useAppStore();

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  if (!user?.isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-gradient mb-4">Connect Your Wallet</h1>
          <p className="text-wire-text-secondary mb-8">
            Connect your wallet to view your dashboard, betting history, and portfolio.
          </p>
          <Button variant="primary" size="lg" onClick={connect}>
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  const userStats = {
    totalBets: '$12,450',
    winRate: '62%',
    totalWinnings: '$3,245',
    badges: 3,
    tickets: 5,
    balance: user.balance ? formatEther(BigInt(user.balance)) : '0',
  };

  const recentBets = [
    { id: '1', match: 'HYK vs LAH', amount: '$250', prediction: 'HYK', odds: 1.85, status: 'WON', payout: '$462.50' },
    { id: '2', match: 'KAR vs PES', amount: '$150', prediction: 'PES', odds: 1.95, status: 'PENDING', payout: '-' },
    { id: '3', match: 'MUL vs QUA', amount: '$100', prediction: 'QUA', odds: 1.73, status: 'WON', payout: '$173' },
  ];

  return (
    <div className="min-h-screen py-12 px-4 bg-linear-to-b from-wire-dark to-wire-darker">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-gradient mb-4">Dashboard</h1>
        <p className="text-wire-text-secondary mb-12">Welcome back, {user.address?.slice(0, 6)}...{user.address?.slice(-4)}</p>

        {/* Stats Cards with Framer Motion */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.12 },
            },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            whileHover={{ scale: 1.03 }}
          >
            <Card gradient>
              <p className="text-wire-text-secondary text-sm mb-2">Wallet Balance</p>
              <p className="text-3xl font-bold text-wire-primary mb-2">{userStats.balance} WIRE</p>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Top Up
              </Button>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.1 }}
            whileHover={{ scale: 1.03 }}
          >
            <Card>
              <p className="text-wire-text-secondary text-sm mb-2">Total Bet Amount</p>
              <p className="text-3xl font-bold text-wire-accent">{userStats.totalBets}</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.2 }}
            whileHover={{ scale: 1.03 }}
          >
            <Card gradient>
              <p className="text-wire-text-secondary text-sm mb-2">Win Rate</p>
              <p className="text-3xl font-bold text-wire-primary">{userStats.winRate}</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
          >
            <Card>
              <p className="text-wire-text-secondary text-sm mb-2">Total Winnings</p>
              <p className="text-3xl font-bold text-green-400">{userStats.totalWinnings}</p>
            </Card>
          </motion.div>
        </motion.div>

        {/* Collections with Framer Motion */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-wire-primary">My Badges</h2>
                <span className="text-2xl font-bold text-wire-accent">{userStats.badges}</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-wire-darker rounded-wire border border-wire-border">
                  <span>🟩 First Bet</span>
                  <span className="text-xs text-wire-text-secondary">COMMON</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-wire-darker rounded-wire border border-wire-border">
                  <span>🟦 Winning Streak</span>
                  <span className="text-xs text-wire-text-secondary">UNCOMMON</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-wire-darker rounded-wire border border-wire-border">
                  <span>🟪 High Roller</span>
                  <span className="text-xs text-wire-text-secondary">RARE</span>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4">
                View All Badges
              </Button>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card gradient>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-wire-primary">My Tickets</h2>
                <span className="text-2xl font-bold text-wire-accent">{userStats.tickets}</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-wire-darker/50 rounded-wire border border-wire-border">
                  <p className="font-semibold text-wire-text-primary">PSL Match #1 - HYK vs LAH</p>
                  <p className="text-xs text-wire-text-secondary mt-1">June 15, 2025 - Active</p>
                </div>
                <div className="p-3 bg-wire-darker/50 rounded-wire border border-wire-border">
                  <p className="font-semibold text-wire-text-primary">PSL Match #2 - KAR vs PES</p>
                  <p className="text-xs text-wire-text-secondary mt-1">June 22, 2025 - Upcoming</p>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4">
                View All Tickets
              </Button>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Bets with Framer Motion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.2 }}
        >
          <Card>
            <h2 className="text-2xl font-bold text-wire-primary mb-6">Recent Bets</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-wire-border">
                    <th className="text-left py-3 text-wire-text-secondary font-semibold">Match</th>
                    <th className="text-left py-3 text-wire-text-secondary font-semibold">Amount</th>
                    <th className="text-left py-3 text-wire-text-secondary font-semibold">Prediction</th>
                    <th className="text-left py-3 text-wire-text-secondary font-semibold">Odds</th>
                    <th className="text-left py-3 text-wire-text-secondary font-semibold">Status</th>
                    <th className="text-left py-3 text-wire-text-secondary font-semibold">Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBets.map((bet) => (
                    <motion.tr
                      key={bet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                      className="border-b border-wire-border/30 hover:bg-wire-darker/50 transition-colors"
                    >
                      <td className="py-3 text-wire-text-primary">{bet.match}</td>
                      <td className="py-3 font-semibold text-wire-primary">{bet.amount}</td>
                      <td className="py-3 text-wire-text-secondary">{bet.prediction}</td>
                      <td className="py-3 text-wire-text-secondary">{bet.odds}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          bet.status === 'WON'
                            ? 'bg-green-500/20 text-green-400'
                            : bet.status === 'PENDING'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {bet.status}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-wire-accent">{bet.payout}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="secondary" className="w-full mt-6">
              View Full History
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
