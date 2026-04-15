/**
 * TeamLeaderboard Component
 * Team-level rankings with aggregate statistics
 * @file TeamLeaderboard.tsx
 */

'use client';

import React, { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TeamLeaderboardEntry, LeaderboardEntry } from '@/lib/data/mockLeaderboard';

export interface TeamLeaderboardProps {
  /**
   * Team rankings data
   */
  teams: TeamLeaderboardEntry[];

  /**
   * All players for expanding team rows
   */
  players: LeaderboardEntry[];

  /**
   * Reduces animations if user prefers
   */
  prefersReducedMotion?: boolean;
}

/**
 * Team Leaderboard Row Component
 */
const TeamRow: FC<{
  team: TeamLeaderboardEntry;
  teamPlayers: LeaderboardEntry[];
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}> = ({ team, teamPlayers, index, isExpanded, onToggleExpand }) => {
  const rowVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { delay: index * 0.05 } },
  };

  const expandedVariants = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div variants={rowVariants} className="space-y-2">
      {/* Team Row */}
      <motion.button
        onClick={onToggleExpand}
        whileHover={{ x: 4 }}
        className="w-full rounded-xl border border-white/10 bg-white/3 backdrop-blur-xl p-4 hover:bg-white/5 transition-all"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Rank and Team Info */}
          <div className="flex-1 flex items-center gap-4 min-w-0">
            {/* Rank Badge */}
            <div className="flex-shrink-0 w-12 flex items-center justify-center">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{
                  background: `${team.teamColor}30`,
                  color: team.teamColor,
                }}
              >
                {team.teamId + 1}
              </div>
            </div>

            {/* Team Name and Stats */}
            <div className="flex-1 min-w-0 text-left">
              <p className="font-bold text-white truncate">{team.teamName}</p>
              <p className="text-xs text-gray-500">{team.playerCount} players</p>
            </div>
          </div>

          {/* Total Impact */}
          <div className="flex-shrink-0 text-right hidden sm:block">
            <p className="text-sm font-bold text-paws-rose">{team.totalImpact.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Impact</p>
          </div>

          {/* Avg Rating */}
          <div className="flex-shrink-0 text-right hidden md:block">
            <p className="text-sm font-bold text-paws-electric">{team.avgRating.toFixed(1)}/5</p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>

          {/* Badges */}
          <div className="flex-shrink-0 text-right hidden lg:block">
            <p className="text-sm font-bold">🏅 {team.badgeCount}</p>
            <p className="text-xs text-gray-500">Badges</p>
          </div>

          {/* Rank Change */}
          <div className="flex-shrink-0 text-right">
            <motion.p
              className={`text-sm font-bold ${
                team.rankChange > 0 ? 'text-green-400' : team.rankChange < 0 ? 'text-red-400' : 'text-gray-400'
              }`}
              animate={team.rankChange !== 0 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.6 }}
            >
              {team.rankChange > 0 ? '↑' : team.rankChange < 0 ? '↓' : '→'}
              {Math.abs(team.rankChange)}
            </motion.p>
            <p className="text-xs text-gray-500">Change</p>
          </div>

          {/* Expand Icon */}
          <motion.div
            className="flex-shrink-0 text-xl"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            ▼
          </motion.div>
        </div>
      </motion.button>

      {/* Expanded Team Players List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={expandedVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="pl-4 sm:pl-8 space-y-2 border-l-2"
            style={{ borderColor: `${team.teamColor}40` }}
          >
            {teamPlayers.slice(0, 5).map((player, idx) => (
              <motion.div
                key={player.playerId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-lg bg-white/3 border border-white/10 p-3 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      #{player.rank} {player.playerName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {player.impactPoints.toLocaleString()} points
                    </p>
                  </div>

                  <div className="flex-shrink-0 flex gap-1">
                    {player.badges.slice(0, 2).map((badge) => (
                      <span key={badge} className="text-sm">
                        {badge === 'elite'
                          ? '👑'
                          : badge === 'rising-star'
                            ? '⭐'
                            : badge === 'clutch-player'
                              ? '💪'
                              : '💎'}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}

            {teamPlayers.length > 5 && (
              <p className="text-xs text-gray-500 p-2 text-center">
                +{teamPlayers.length - 5} more players
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * TeamLeaderboard Component
 * @component
 */
export const TeamLeaderboard: FC<TeamLeaderboardProps> = ({ teams, players, prefersReducedMotion = false }) => {
  const [expandedTeams, setExpandedTeams] = React.useState<Set<number>>(new Set());

  const toggleTeamExpanded = (teamId: number) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-paws-electric to-paws-violet bg-clip-text text-transparent">
            ⚽ Team Rankings
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Click a team to see their top players. Updated in real-time.
          </p>
        </motion.div>

        {/* Teams List */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            initial: { opacity: 0 },
            animate: {
              opacity: 1,
              transition: { staggerChildren: 0.05 },
            },
          }}
          className="space-y-3"
        >
          {teams.map((team) => {
            const teamPlayers = players.filter((p) => p.teamId === team.teamId);

            return (
              <TeamRow
                key={team.teamId}
                team={team}
                teamPlayers={teamPlayers.sort((a, b) => a.rank - b.rank)}
                index={team.teamId}
                isExpanded={expandedTeams.has(team.teamId)}
                onToggleExpand={() => toggleTeamExpanded(team.teamId)}
              />
            );
          })}
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 rounded-lg bg-white/3 border border-white/10 text-center text-xs sm:text-sm text-gray-400"
        >
          📊 Total teams: {teams.length} • Combined impact: {teams.reduce((sum, t) => sum + t.totalImpact, 0).toLocaleString()} points
        </motion.div>
      </div>
    </div>
  );
};

export default TeamLeaderboard;
