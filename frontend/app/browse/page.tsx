'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

/**
 * Browse Page
 * Graduated onboarding: Users can explore everything WITHOUT needing wallet/account
 * Action buttons show CTA: "Connect to [action]"
 * No wallet barrier until they actually want to perform action
 */
export default function BrowsePage(): React.ReactElement {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<'tickets' | 'donate' | 'tip'>('tickets');

  const matchesData = [
    {
      id: 1,
      team: 'Lahore Qalandars',
      opponent: 'Karachi Kings',
      date: '15 Mar 2026',
      time: '7:00 PM',
      venue: 'Gaddafi Stadium',
      tickets: 4850,
      image: 'https://i.postimg.cc/L53p7WCg/psl-lahore-qalandars-(1).png',
    },
    {
      id: 2,
      team: 'Islamabad United',
      opponent: 'Peshawar Zalmi',
      date: '16 Mar 2026',
      time: '7:30 PM',
      venue: 'Adiala Stadium',
      tickets: 2340,
      image: 'https://i.postimg.cc/KcPxRKG8/psl-islamabad-united-(1).png',
    },
    {
      id: 3,
      team: 'Multan Sultans',
      opponent: 'Quetta Gladiators',
      date: '17 Mar 2026',
      time: '7:00 PM',
      venue: 'Multan Cricket Stadium',
      tickets: 3120,
      image: 'https://i.postimg.cc/SRh4g4rR/psl-multan-sultan-(1).png',
    },
  ];

  const academiesData = [
    {
      id: 1,
      team: 'Lahore Qalandars',
      academy: 'Lahore Qalandars Youth Academy',
      impact: '847 kits distributed',
      kids: '320 kids trained',
      image: 'https://i.postimg.cc/L53p7WCg/psl-lahore-qalandars-(1).png',
      need: 'Fast bowlers training kit',
    },
    {
      id: 2,
      team: 'Karachi Kings',
      academy: 'Karachi Kings Academy',
      impact: '623 kits distributed',
      kids: '235 kids trained',
      image: 'https://i.postimg.cc/KjD2VWqf/psl-karachi-kings-(1).png',
      need: 'Batting equipment',
    },
    {
      id: 3,
      team: 'Peshawar Zalmi',
      academy: 'Peshawar Zalmi Development Program',
      impact: '756 kits distributed',
      kids: '412 kids trained',
      image: 'https://i.postimg.cc/VN2mbn07/psl-peshawar-zalmi-(1).png',
      need: 'Protective gear',
    },
  ];

  const playersData = [
    {
      id: 1,
      name: 'Babar Azam',
      team: 'Karachi Kings',
      tips: '3,240',
      charity: "Babar's Cricket Foundation",
      image: '🏏',
    },
    {
      id: 2,
      name: 'Shaheen Afridi',
      team: 'Lahore Qalandars',
      tips: '2,156',
      charity: 'Youth Cricket Academy Fund',
      image: '⚡',
    },
    {
      id: 3,
      name: 'Fakhar Zaman',
      team: 'Lahore Qalandars',
      tips: '1,893',
      charity: 'Women in Cricket Initiative',
      image: '⭐',
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      {/* Hero Banner */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative px-4 sm:px-6 lg:px-8 mb-20"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl font-bold text-white mb-6"
          >
            Explore Cricket Impact
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            Browse verified match tickets, academy support opportunities, and player tips. No wallet needed to explore. Connect when you're ready to act.
          </motion.p>

          {/* Category Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {[
              { id: 'tickets', icon: '🎫', label: 'Match Tickets' },
              { id: 'donate', icon: '💝', label: 'Donate Kits' },
              { id: 'tip', icon: '❤️', label: 'Tip Players' },
            ].map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-linear-to-r from-purple-600 to-rose-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Content Grid */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {selectedCategory === 'tickets' && (
            <motion.div
              key="tickets"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-3xl font-bold text-white mb-8">Upcoming Matches</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchesData.map((match, idx) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(219, 39, 119, 0.3)' }}
                    className="rounded-2xl bg-linear-to-br from-slate-900 to-slate-950 border border-white/10 overflow-hidden hover:border-white/30 transition-all"
                  >
                    {/* Header with Team */}
                    <div className="p-6 bg-linear-to-r from-purple-600/20 to-rose-600/20 border-b border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Image
                          src={match.image}
                          alt={match.team}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                        <div className="text-left">
                          <p className="font-semibold text-white">{match.team}</p>
                          <p className="text-sm text-gray-400">vs {match.opponent}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p className="text-gray-300">
                          📅 <span className="font-semibold">{match.date}</span> • {match.time}
                        </p>
                        <p className="text-gray-400">📍 {match.venue}</p>
                      </div>
                    </div>

                    {/* Ticket Info */}
                    <div className="p-6">
                      <p className="text-2xl font-bold text-white mb-4">{match.tickets} tickets</p>
                      <p className="text-sm text-gray-400 mb-6">Available for verified fans</p>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/auth?action=buy-ticket')}
                        className="w-full py-3 rounded-lg bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold transition-all"
                      >
                        Connect to Buy Ticket
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedCategory === 'donate' && (
            <motion.div
              key="donate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-3xl font-bold text-white mb-8">Support Grassroots Cricket</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {academiesData.map((academy, idx) => (
                  <motion.div
                    key={academy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(34, 197, 94, 0.3)' }}
                    className="rounded-2xl bg-linear-to-br from-slate-900 to-slate-950 border border-white/10 overflow-hidden hover:border-white/30 transition-all"
                  >
                    {/* Header */}
                    <div className="p-6 bg-linear-to-r from-green-600/20 to-emerald-600/20 border-b border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Image
                          src={academy.image}
                          alt={academy.team}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                        <div className="text-left">
                          <p className="font-semibold text-white">{academy.team}</p>
                          <p className="text-sm text-gray-400">Academy</p>
                        </div>
                      </div>
                    </div>

                    {/* Impact */}
                    <div className="p-6">
                      <h3 className="font-semibold text-white mb-3">{academy.academy}</h3>

                      <div className="space-y-2 mb-6 text-sm">
                        <p className="text-green-400">✓ {academy.impact}</p>
                        <p className="text-green-400">✓ {academy.kids}</p>
                        <p className="text-gray-400">📦 Need: {academy.need}</p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/auth?action=donate')}
                        className="w-full py-3 rounded-lg bg-linear-to-r from-green-600 to-emerald-600 text-white font-semibold transition-all"
                      >
                        Connect to Donate
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedCategory === 'tip' && (
            <motion.div
              key="tip"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-3xl font-bold text-white mb-8">Tip Your Favorite Players</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playersData.map((player, idx) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(244, 63, 94, 0.3)' }}
                    className="rounded-2xl bg-linear-to-br from-slate-900 to-slate-950 border border-white/10 overflow-hidden hover:border-white/30 transition-all"
                  >
                    {/* Avatar */}
                    <div className="p-8 bg-linear-to-r from-pink-600/20 to-rose-600/20 border-b border-white/10 text-center">
                      <div className="text-6xl mb-3">{player.image}</div>
                      <h3 className="text-2xl font-bold text-white">{player.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{player.team}</p>
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                        <p className="text-3xl font-bold text-rose-400">{player.tips}</p>
                        <p className="text-xs text-gray-400 mt-1">Fans have tipped</p>
                      </div>

                      <p className="text-sm text-gray-400 mb-6">Supports: <span className="text-white font-semibold">{player.charity}</span></p>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/auth?action=tip')}
                        className="w-full py-3 rounded-lg bg-linear-to-r from-rose-600 to-pink-600 text-white font-semibold transition-all"
                      >
                        Connect to Tip
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Info Footer */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto rounded-2xl bg-linear-to-r from-purple-600/20 to-rose-600/20 border border-white/10 p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Ready to Make an Impact?</h3>
          <p className="text-gray-300 mb-6">
            All transactions are powered by WireFluid blockchain (Testnet 92533). Instant, verified, transparent.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="px-8 py-3 rounded-lg bg-linear-to-r from-purple-600 to-rose-600 text-white font-semibold hover:shadow-lg transition-all"
          >
            Learn More
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}
