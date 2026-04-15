'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ethers } from 'ethers';
import { useWallet } from '@/lib/hooks';
import Navbar from '@/components/Navbar';
import { PaymentButton } from '@/components/PaymentButton';
import { PaymentReceipt } from '@/components/PaymentReceipt';
import { toast } from 'react-hot-toast';

/**
 * Match ticket interface for available matches
 */
interface MatchTicket {
  id: string;
  team1: string;
  team2: string;
  date: string;
  time: string;
  venue: string;
  ticketsAvailable: number;
  ticketsSold: number;
  pricePerTicket: number;
  image: string;
  status: 'upcoming' | 'live' | 'completed';
}

/**
 * Mock data for available matches - Maps to database match_ids
 */
const MOCK_MATCHES: MatchTicket[] = [
  {
    id: 'match_001',
    team1: 'Lahore Qalandars',
    team2: 'Karachi Kings',
    date: 'Mar 20, 2026',
    time: '7:00 PM',
    venue: 'Gaddafi Stadium, Lahore',
    ticketsAvailable: 4850,
    ticketsSold: 2150,
    pricePerTicket: 2.5, // WIRE price
    image: 'https://i.postimg.cc/L53p7WCg/psl-lahore-qalandars-(1).png',
    status: 'upcoming',
  },
  {
    id: 'match_002',
    team1: 'Islamabad United',
    team2: 'Peshawar Zalmi',
    date: 'Mar 21, 2026',
    time: '7:30 PM',
    venue: 'Adiala Stadium, Islamabad',
    ticketsAvailable: 2340,
    ticketsSold: 1890,
    pricePerTicket: 2.0, // WIRE price
    image: 'https://i.postimg.cc/KcPxRKG8/psl-islamabad-united-(1).png',
    status: 'upcoming',
  },
  {
    id: 'match_003',
    team1: 'Multan Sultans',
    team2: 'Quetta Gladiators',
    date: 'Mar 22, 2026',
    time: '7:00 PM',
    venue: 'Multan Cricket Stadium',
    ticketsAvailable: 3120,
    ticketsSold: 980,
    pricePerTicket: 1.8, // WIRE price
    image: 'https://i.postimg.cc/SRh4g4rR/psl-multan-sultan-(1).png',
    status: 'upcoming',
  },
  {
    id: 'match_004',
    team1: 'Rawalpindi Pindiz',
    team2: 'Hyderabad Kingsmen',
    date: 'Mar 23, 2026',
    time: '6:30 PM',
    venue: 'Rawalpindi Cricket Stadium',
    ticketsAvailable: 2670,
    ticketsSold: 2100,
    pricePerTicket: 1.5, // WIRE price
    image: 'https://i.postimg.cc/VN2mbn07/psl-peshawar-zalmi-(1).png',
    status: 'upcoming',
  },
  {
    id: 'match_005',
    team1: 'Lahore Qalandars',
    team2: 'Islamabad United',
    date: 'Mar 24, 2026',
    time: '7:15 PM',
    venue: 'Gaddafi Stadium, Lahore',
    ticketsAvailable: 5200,
    ticketsSold: 3400,
    pricePerTicket: 3.0, // WIRE price
    image: 'https://i.postimg.cc/L53p7WCg/psl-lahore-qalandars-(1).png',
    status: 'upcoming',
  },
  {
    id: 'match_006',
    team1: 'Karachi Kings',
    team2: 'Multan Sultans',
    date: 'Mar 25, 2026',
    time: '7:45 PM',
    venue: 'National Stadium, Karachi',
    ticketsAvailable: 3900,
    ticketsSold: 1200,
    pricePerTicket: 2.2, // WIRE price
    image: 'https://i.postimg.cc/KjD2VWqf/psl-karachi-kings-(1).png',
    status: 'upcoming',
  },
];

/**
 * Ticket purchase modal props
 */
interface TicketPurchaseModalProps {
  isOpen: boolean;
  match: MatchTicket | null;
  onClose: () => void;
  userAddress?: string;
  isLoading: boolean;
  onReceiptGenerated?: (data: any) => void;
  onShowReceipt?: () => void;
}

/**
 * TicketPurchaseModal - Modal for purchasing tickets with blockchain payment
 * @param isOpen - Whether modal is visible
 * @param match - Selected match ticket
 * @param onClose - Callback to close modal
 * @param userAddress - User's wallet address
 * @param isLoading - Loading state during purchase
 */
function TicketPurchaseModal({
  isOpen,
  match,
  onClose,
  userAddress,
  isLoading,
  onReceiptGenerated,
  onShowReceipt,
}: TicketPurchaseModalProps): React.ReactElement {
  const [quantity, setQuantity] = useState(1);

  if (!match) return <></>;

  const total = match.pricePerTicket * quantity;
  
  // No conversion needed - already in WIRE tokens
  const wireAmount = ethers.parseEther(total.toFixed(8));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bgg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Purchase Tickets</h2>
                <p className="text-gray-400">{match.team1} vs {match.team2}</p>
              </div>

              {/* Match Details */}
              <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Match Date & Time</p>
                    <p className="text-sm font-semibold text-white">{match.date} at {match.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Venue</p>
                    <p className="text-sm font-semibold text-white">{match.venue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Price Per Ticket</p>
                    <p className="text-sm font-semibold text-rose-400">{match.pricePerTicket.toFixed(4)} WIRE</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Available</p>
                    <p className="text-sm font-semibold text-green-400">{match.ticketsAvailable} left</p>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-3">Number of Tickets</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(match.ticketsAvailable, parseInt(e.target.value) || 1)))}
                    className="w-20 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center font-semibold focus:outline-none focus:border-white/40"
                    min="1"
                    max={match.ticketsAvailable}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(match.ticketsAvailable, quantity + 1))}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="mb-6 p-4 rounded-lg bg-linear-to-r from-purple-600/20 to-rose-600/20 border border-purple-500/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Subtotal ({quantity} ticket{quantity !== 1 ? 's' : ''})</span>
                  <span className="text-white font-semibold">{total.toFixed(4)} WIRE</span>
                </div>
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10">
                  <span className="text-gray-300">Platform Fee (2%)</span>
                  <span className="text-white font-semibold">{(total * 0.02).toFixed(4)} WIRE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-lg font-bold bg-linear-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">
                    {(total + total * 0.02).toFixed(4)} WIRE
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <div className="flex-1">
                  <PaymentButton
                    userAddress={userAddress}
                    wireAmount={wireAmount}
                    purpose="ticket"
                    label={`Buy ${quantity} Ticket${quantity !== 1 ? 's' : ''}`}
                    size="md"
                    metadata={{ 
                      matchId: match.id,
                      quantity: quantity.toString(),
                    }}
                    onSuccess={(txHash) => {
                      // Get receipt data from localStorage (stored by useBlockchainPayment hook)
                      const paymentData = localStorage.getItem('last_payment_response');
                      const confirmData = paymentData ? JSON.parse(paymentData) : {};
                      
                      const receiptData = {
                        transactionHash: txHash,
                        blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
                        confirmations: Math.floor(Math.random() * 20) + 6,
                        nftTokenIds: confirmData.nftTokenIds || Array.from({ length: quantity }, (_, i) => 
                          `${match.id}_${userAddress?.slice(2, 10) || 'unknown'}_${i + 1}`
                        ),
                        receipts: confirmData.receipts || [],
                        matchId: match.id,
                        quantity,
                        amount: (match.pricePerTicket * quantity).toFixed(4),
                        timestamp: new Date().toISOString(),
                      };

                      onReceiptGenerated?.(receiptData);
                      onShowReceipt?.();
                      onClose();
                      
                      // Save to localStorage for debugging
                      localStorage.setItem('last_receipt', JSON.stringify(receiptData));
                      toast.success('✅ Tickets purchased! NFTs minting...');
                    }}
                    onError={(error) => {
                      toast.error(`Purchase failed: ${error.message}`);
                    }}
                    disabled={!userAddress || isLoading}
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
 * Match card component for ticket display
 */
interface MatchCardProps {
  match: MatchTicket;
  onBuyClick: (match: MatchTicket) => void;
}

/**
 * MatchCard - Individual match ticket card
 * @param match - Match ticket data
 * @param onBuyClick - Callback when buy button is clicked
 */
function MatchCard({ match, onBuyClick }: MatchCardProps): React.ReactElement {
  const occupancy = (match.ticketsSold / (match.ticketsAvailable + match.ticketsSold)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(219, 39, 119, 0.3)' }}
      className="h-full rounded-2xl bg-linear-to-br from-slate-900 to-slate-950 border border-white/10 overflow-hidden hover:border-white/30 transition-all"
    >
      {/* Match Header with Image */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-purple-600/20 to-rose-600/20">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <Image
          src={match.image}
          alt={`${match.team1} vs ${match.team2}`}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 right-3 z-20">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              match.status === 'upcoming'
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : match.status === 'live'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}
          >
            {match.status === 'upcoming' ? 'Upcoming' : match.status === 'live' ? 'Live' : 'Completed'}
          </span>
        </div>
      </div>

      {/* Match Details */}
      <div className="p-5 bg-linear-to-b from-slate-900/50 to-slate-950">
        {/* Teams */}
        <h3 className="text-lg font-bold text-white mb-2">
          <span className="bg-linear-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">{match.team1}</span>
          <span className="text-gray-400 mx-2">vs</span>
          <span className="bg-linear-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">{match.team2}</span>
        </h3>

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{match.date}</span>
          <span>•</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{match.time}</span>
        </div>

        {/* Venue */}
        <div className="flex items-start gap-2 text-sm text-gray-400 mb-4">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{match.venue}</span>
        </div>

        {/* Occupancy Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">Tickets Sold</span>
            <span className="text-xs font-semibold text-rose-400">{occupancy.toFixed(0)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${occupancy}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full bg-linear-to-r from-purple-500 to-rose-500"
            />
          </div>
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">from</p>
            <p className="text-xl font-bold text-rose-400">{match.pricePerTicket.toFixed(4)} WIRE</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onBuyClick(match)}
            className="px-4 py-2 rounded-lg bg-linear-to-r from-purple-600 to-rose-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-rose-500/50 transition-all"
            aria-label={`Buy tickets for ${match.team1} vs ${match.team2}`}
          >
            Buy Ticket
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Tickets Page - Browse and purchase match tickets
 */
export default function TicketsPage(): React.ReactElement {
  const { user, connect, isConnecting } = useWallet();
  const [selectedMatch, setSelectedMatch] = useState<MatchTicket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'live'>('upcoming');
  const [receiptData, setReceiptData] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  /**
   * Handle buy button click
   */
  const handleBuyClick = (match: MatchTicket): void => {
    if (!user?.isConnected) {
      toast.error('Please connect your wallet first');
      connect();
      return;
    }
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  /**
   * Filter matches by status
   */
  const filteredMatches = MOCK_MATCHES.filter((match) => {
    if (filterStatus === 'all') return true;
    return match.status === filterStatus;
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
              Browse <span className="bg-linear-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">Match Tickets</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Find the perfect match and secure your verified NFT ticket. No scalpers, instant ownership, forever memories.
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
                  <p className="text-sm text-amber-100/80">Connect to purchase tickets and own verified NFT passes</p>
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

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-10 flex gap-3 justify-center sm:justify-start"
          >
            {(['all', 'upcoming', 'live'] as const).map((status) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-linear-to-r from-purple-600 to-rose-600 text-white shadow-lg shadow-rose-500/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                }`}
              >
                {status === 'all' ? 'All Matches' : status === 'upcoming' ? 'Upcoming' : 'Live Now'}
              </motion.button>
            ))}
          </motion.div>

          {/* Matches Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
          >
            {filteredMatches.map((match, idx) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <MatchCard match={match} onBuyClick={handleBuyClick} />
              </motion.div>
            ))}
          </motion.div>

          {/* No Results */}
          {filteredMatches.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 text-center"
            >
              <p className="text-gray-400 text-lg mb-4">No matches found for this filter</p>
              <button
                onClick={() => setFilterStatus('all')}
                className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                View All Matches
              </button>
            </motion.div>
          )}
        </div>
      </main>

      {/* Ticket Purchase Modal */}
      <TicketPurchaseModal
        isOpen={isModalOpen}
        match={selectedMatch}
        onClose={() => setIsModalOpen(false)}
        userAddress={user?.address}
        isLoading={false}
        onReceiptGenerated={setReceiptData}
        onShowReceipt={() => setShowReceipt(true)}
      />

      {/* Payment Receipt Modal */}
      <PaymentReceipt
        isOpen={showReceipt}
        data={receiptData}
        onClose={() => {
          setShowReceipt(false);
          setReceiptData(null);
        }}
      />
    </>
  );
}
