'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ethers } from 'ethers';
import { useWallet } from '@/lib/hooks';
import Navbar from '@/components/Navbar';
import { PaymentButton } from '@/components/PaymentButton';
import { toast } from 'react-hot-toast';
import { FEATURED_PLAYERS, getPlayersLeaderboard, type PlayerCharityData } from '@/lib/playerCharityData';

/**
 * Player image with fallback component
 */
interface PlayerImageProps {
  playerImage: string;
  teamLogo: string;
  playerName: string;
  className?: string;
}

/**
 * PlayerImageComponent - Displays player image with team logo fallback
 * @param playerImage - Primary player image URL
 * @param teamLogo - Fallback team logo URL (shown blurred if player image fails)
 * @param playerName - Player name for alt text
 * @param className - Tailwind classes
 */
function PlayerImageComponent({
  playerImage,
  teamLogo,
  playerName,
  className = '',
}: PlayerImageProps): React.ReactElement {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className={`relative bg-gradient-to-br from-purple-600/20 to-rose-600/20 overflow-hidden ${className}`}>
      {imageFailed && (
        <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center">
          <span className="text-xs font-semibold text-white/60">{playerName}</span>
        </div>
      )}
      <Image
        src={imageFailed ? teamLogo : playerImage}
        alt={playerName}
        fill
        className={`object-cover ${imageFailed ? 'blur-sm' : ''}`}
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}

/**
 * Tipping modal props
 */
interface TippingModalProps {
  isOpen: boolean;
  player: PlayerCharityData | null;
  onClose: () => void;
  userAddress?: string;
}

/**
 * TippingModal - Modal for sending tips to player charities with blockchain payment
 * @param isOpen - Whether modal is visible
 * @param player - Selected player charity
 * @param onClose - Callback to close modal
 * @param userAddress - User's wallet address
 */
function TippingModal({
  isOpen,
  player,
  onClose,
  userAddress,
}: TippingModalProps): React.ReactElement {
  const [amount, setAmount] = useState(100);

  if (!player) return <></>;

  const presets = [50, 100, 500, 1000, 5000];
  
  // Conversion: 1 PKR ≈ 0.00006 WIRE
  const exchangeRate = 0.00006;
  const wireAmount = ethers.parseEther((amount * exchangeRate).toFixed(8));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl bg-linear-to-br from-slate-900/95 to-slate-950/95 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors z-10"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Support {player.charityName}</h2>
                <p className="text-gray-400">Help {player.playerName}'s chosen charity make a difference</p>
              </div>

              {/* Player & Charity Info */}
              <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <PlayerImageComponent
                      playerImage={player.playerImage}
                      teamLogo={player.teamLogo}
                      playerName={player.playerName}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{player.playerName}</p>
                    <p className="text-sm text-gray-400">{player.team}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3">{player.charityDescription}</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-300">
                    {player.cause}
                  </span>
                </div>
              </div>

              {/* Amount Presets */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-3">Select Amount (PKR)</label>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {presets.map((preset) => (
                    <motion.button
                      key={preset}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAmount(preset)}
                      className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                        amount === preset
                          ? 'bg-linear-to-r from-purple-600 to-rose-600 text-white shadow-lg shadow-rose-500/50'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                      }`}
                    >
                      {preset}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-2">Custom Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₨</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(10, parseInt(e.target.value) || 10))}
                    className="w-full pl-8 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-white/40"
                    min="10"
                    placeholder="Enter custom amount"
                  />
                </div>
              </div>

              {/* Impact Preview */}
              <div className="mb-6 p-4 rounded-lg bg-linear-to-r from-purple-600/20 to-rose-600/20 border border-purple-500/30">
                <p className="text-xs text-gray-400 mb-1">Your Tip Amount</p>
                <p className="text-2xl font-bold bg-linear-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">
                  ₨{(amount).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-2">100% goes to {player.charityName}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <div className="flex-1">
                  <PaymentButton
                    userAddress={userAddress}
                    wireAmount={wireAmount}
                    purpose="tip"
                    label={`Send Tip ₨${amount.toLocaleString()}`}
                    size="md"
                    metadata={{
                      playerId: player.id,
                    }}
                    onSuccess={(txHash) => {
                      toast.success(`💝 Tip sent to ${player.charityName}!`);
                      onClose();
                    }}
                    onError={(error) => {
                      toast.error(`Tip failed: ${error.message}`);
                    }}
                    disabled={!userAddress}
                    variant="primary"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Player charity card component
 */
interface PlayerCardProps {
  player: PlayerCharityData;
  onTipClick: (player: PlayerCharityData) => void;
}

/**
 * PlayerCard - Individual player charity card
 * @param player - Player charity data
 * @param onTipClick - Callback when tip button is clicked
 */
function PlayerCard({ player, onTipClick }: PlayerCardProps): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(219, 39, 119, 0.3)' }}
      className="h-full rounded-2xl bg-linear-to-br from-slate-900 to-slate-950 border border-white/10 overflow-hidden hover:border-white/30 transition-all"
    >
      {/* Player Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-600/20 to-rose-600/20">
        <PlayerImageComponent
          playerImage={player.playerImage}
          teamLogo={player.teamLogo}
          playerName={player.playerName}
          className="h-full"
        />
      </div>

      {/* Content */}
      <div className="p-5 bg-linear-to-b from-slate-900/50 to-slate-950">
        {/* Player Name */}
        <h3 className="text-2xl font-bold text-white mb-1">{player.playerName}</h3>

        {/* Team Badge */}
        <p className="text-xs text-gray-400 mb-3 font-medium">{player.team}</p>

        {/* Charity */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-1">Supports</p>
          <p className="text-sm font-semibold text-rose-400">{player.charityName}</p>
          <p className="text-xs text-gray-500 mt-2">{player.charityDescription}</p>
        </div>

        {/* Cause Badge */}
        <div className="mb-4">
          <span className="inline-flex px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-300">
            {player.cause}
          </span>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-gray-400">Total Tipped</p>
            <p className="text-sm font-bold text-green-400">₨{(player.totalTipped / 100000).toFixed(1)}L</p>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-gray-400">Supporters</p>
            <p className="text-sm font-bold text-blue-400">{player.tippersCount.toLocaleString()}</p>
          </div>
        </div>

        {/* Tip Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onTipClick(player)}
          className="w-full px-4 py-3 rounded-lg bg-linear-to-r from-purple-600 to-rose-600 text-white font-semibold hover:shadow-lg hover:shadow-rose-500/50 transition-all"
          aria-label={`Tip to ${player.charityName}`}
        >
          Support Charity
        </motion.button>
      </div>
    </motion.div>
  );
}

/**
 * Tipping Leaderboard component
 */
interface LeaderboardEntry {
  rank: number;
  playerName: string;
  charityName: string;
  totalTipped: number;
}

/**
 * LeaderboardSection - Shows top charity tipping leaderboard
 */
function LeaderboardSection(): React.ReactElement {
  const leaderboard = getPlayersLeaderboard();
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ amount: 0.2 }}
      className="relative py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-slate-900/50 to-slate-950"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Top Charities by Support</h2>
          <p className="text-gray-400">See which charities are making the most impact</p>
        </div>

        <div className="space-y-3">
          {leaderboard.map((entry, idx) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              viewport={{ amount: 0.5 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center gap-4"
            >
              {/* Rank */}
              <div className="text-2xl font-bold text-transparent bg-linear-to-r from-purple-400 to-rose-400 bg-clip-text">
                #{entry.rank}
              </div>

              {/* Details */}
              <div className="flex-1">
                <p className="font-bold text-white">{entry.playerName}</p>
                <p className="text-sm text-gray-400">{entry.charityName}</p>
              </div>

              {/* Amount */}
              <div className="text-right">
                <p className="text-lg font-bold text-green-400">₨{(entry.totalTipped / 100000).toFixed(2)}L</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/**
 * Tipping Page - Support player's favorite charities
 */
export default function TippingPage(): React.ReactElement {
  const { user, connect, isConnecting } = useWallet();
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerCharityData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Handle tip button click
   */
  const handleTipClick = (player: PlayerCharityData): void => {
    if (!user?.isConnected) {
      toast.error('Please connect your wallet first');
      connect();
      return;
    }
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  /**
   * Filter players by search
   */
  const filteredPlayers = FEATURED_PLAYERS.filter((player) => {
    const search = searchTerm.toLowerCase();
    return (
      player.playerName.toLowerCase().includes(search) ||
      player.charityName.toLowerCase().includes(search) ||
      player.cause.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
              Your Favorite Player’s <span className="bg-linear-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">Choice of Charity</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Tip directly to the charities supported by Babar Azam, Mohammad Rizwan, Fakhar Zaman, Naseem Shah, and Shaheen Shah Afridi. Every rupee goes 100% to their chosen cause.
            </p>
          </motion.div>

          {/* Wallet Connection Banner */}
          {!user?.isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 sm:p-6 rounded-xl bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 backdrop-blur-sm"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-amber-200 mb-1">Connect Your Wallet</h3>
                  <p className="text-sm text-amber-100/80">Sign in to send tips and support charities</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={connect}
                  disabled={isConnecting}
                  className="px-6 py-2 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-50 transition-all whitespace-nowrap"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-10"
          >
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search players or charities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </motion.div>

          {/* Players Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
          >
            {filteredPlayers.map((player, idx) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <PlayerCard player={player} onTipClick={handleTipClick} />
              </motion.div>
            ))}
          </motion.div>

          {/* No Results */}
          {filteredPlayers.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 text-center"
            >
              <p className="text-gray-400 text-lg mb-4">No charities found matching your search</p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Clear Search
              </button>
            </motion.div>
          )}
        </div>
      </main>

      {/* Leaderboard Section */}
      <LeaderboardSection />

      {/* Tipping Modal */}
      <TippingModal
        isOpen={isModalOpen}
        player={selectedPlayer}
        onClose={() => setIsModalOpen(false)}
        userAddress={user?.address}
      />
    </>
  );
}
