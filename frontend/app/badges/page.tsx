"use client";

import React, { useState, useMemo, useCallback, FC, memo, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ethers } from "ethers";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { PaymentButton } from "@/components/PaymentButton";
import { useWallet } from "@/lib/hooks";
import type { Badge } from "@/lib/types";
import { BadgeRarity } from "@/lib/types";

/**
 * Badge interface extended with earned date and icon.
 * @typedef {object} BadgeWithEarned
 * @property {string} id - Unique badge identifier
 * @property {string} name - Badge display name
 * @property {string} description - Badge description
 * @property {string} imageUrl - Badge image URL
 * @property {BadgeRarity} rarity - Badge rarity level
 * @property {Date | null} earnedAt - Date badge was earned (null if not earned)
 * @property {string} icon - Icon class or name
 */
interface BadgeWithEarned extends Badge {
  earnedAt: Date | null;
  icon: string;
  // Re-declare to ensure override
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: BadgeRarity;
  tokenUri: string;
}

/**
 * Badge Card component properties.
 * @typedef {object} BadgeCardProps
 * @property {BadgeWithEarned} badge - Badge data
 * @property {number} index - Index for stagger animation
 * @property {(badge: BadgeWithEarned) => void} onBadgeClick - Click handler
 */
interface BadgeCardProps {
  badge: BadgeWithEarned;
  index: number;
  onBadgeClick: (badge: BadgeWithEarned) => void;
}

/**
 * Badge Modal component properties.
 * @typedef {object} BadgeModalProps
 * @property {BadgeWithEarned | null} badge - Badge to display
 * @property {boolean} open - Modal open state
 * @property {() => void} onClose - Close handler
 */
interface BadgeModalProps {
  badge: BadgeWithEarned | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Leaderboard entry for user ranking.
 * @typedef {object} LeaderboardEntry
 * @property {number} rank - User rank position
 * @property {string} username - Display username
 * @property {number} badgeCount - Number of earned badges
 * @property {BadgeWithEarned[]} badges - Array of badge objects
 * @property {number} totalPoints - Total score points
 * @property {number} rankChange - Change in rank (-1, 0, 1)
 * @property {string} userId - Unique user identifier for tipping
 */
interface LeaderboardEntry {
  rank: number;
  username: string;
  badgeCount: number;
  badges: BadgeWithEarned[];
  totalPoints: number;
  rankChange: number;
  userId: string;
}

/**
 * Leaderboard component properties.
 * @typedef {object} AnimatedLeaderboardProps
 * @property {LeaderboardEntry[]} entries - Leaderboard data
 * @property {string} userAddress - User's wallet address for tipping
 */
interface AnimatedLeaderboardProps {
  entries: LeaderboardEntry[];
  userAddress?: string;
}

/**
 * Badge Advisor component properties.
 * @typedef {object} BadgeAdvisorProps
 * @property {BadgeWithEarned[]} allBadges - All available badges
 */
interface BadgeAdvisorProps {
  allBadges: BadgeWithEarned[];
}

/**
 * Share Button component properties.
 * @typedef {object} ShareButtonProps
 * @property {BadgeWithEarned} badge - Badge to share
 */
interface ShareButtonProps {
  badge: BadgeWithEarned;
}

/**
 * Rarity styles mapping for visual effects.
 * @type {Record<string, { bg: string; text: string; border: string; glow: string }>}
 */
const rarityStyles = {
  COMMON: {
    bg: "from-green-500/20 to-green-400/10",
    text: "text-green-300",
    border: "border-green-500/40",
    glow: "shadow-green-500/30",
  },
  UNCOMMON: {
    bg: "from-blue-500/20 to-blue-400/10",
    text: "text-blue-300",
    border: "border-blue-500/40",
    glow: "shadow-blue-500/30",
  },
  RARE: {
    bg: "from-purple-500/20 to-purple-400/10",
    text: "text-purple-300",
    border: "border-purple-500/40",
    glow: "shadow-purple-500/30",
  },
  EPIC: {
    bg: "from-yellow-500/20 to-yellow-400/10",
    text: "text-yellow-300",
    border: "border-yellow-500/40",
    glow: "shadow-yellow-500/30",
  },
  LEGENDARY: {
    bg: "from-pink-500/30 to-pink-400/10",
    text: "text-pink-300",
    border: "border-pink-500/40",
    glow: "shadow-pink-500/40",
  },
};

/**
 * Mock badge data with 12+ varied badges.
 * @type {BadgeWithEarned[]}
 */
const MOCK_BADGES: BadgeWithEarned[] = [
  {
    id: "badge-001",
    name: "First Donation",
    description: "Made your first donation to PSL Pulse.",
    imageUrl: "https://images.unsplash.com/photo-1593642532400-2682a8c6f071?w=200&h=200&fit=crop",
    rarity: BadgeRarity.COMMON,
    tokenUri: "",
    earnedAt: new Date("2024-01-15"),
    icon: "gift",
  },
  {
    id: "badge-002",
    name: "Top Donor",
    description: "Ranked among the top 10 donors this month.",
    imageUrl: "https://images.unsplash.com/photo-1591594997549-f3f86515f318?w=200&h=200&fit=crop",
    rarity: BadgeRarity.UNCOMMON,
    tokenUri: "",
    earnedAt: new Date("2024-02-10"),
    icon: "star",
  },
  {
    id: "badge-003",
    name: "Ticket Master",
    description: "Purchased 5 event tickets.",
    imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200&h=200&fit=crop",
    rarity: BadgeRarity.UNCOMMON,
    tokenUri: "",
    earnedAt: new Date("2024-03-05"),
    icon: "ticket",
  },
  {
    id: "badge-004",
    name: "Impact Champion",
    description: "Achieved a major impact milestone.",
    imageUrl: "https://images.unsplash.com/photo-1553531088-bd3bca27ae4e?w=200&h=200&fit=crop",
    rarity: BadgeRarity.RARE,
    tokenUri: "",
    earnedAt: new Date("2024-03-20"),
    icon: "flame",
  },
  {
    id: "badge-005",
    name: "Legend",
    description: "Reached the top of the leaderboard.",
    imageUrl: "https://images.unsplash.com/photo-1579546929662-711aa287e517?w=200&h=200&fit=crop",
    rarity: BadgeRarity.LEGENDARY,
    tokenUri: "",
    earnedAt: new Date("2024-04-01"),
    icon: "crown",
  },
  {
    id: "badge-006",
    name: "Community Hero",
    description: "Help 10 other users reach their goals.",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop",
    rarity: BadgeRarity.RARE,
    tokenUri: "",
    earnedAt: null,
    icon: "heart",
  },
  {
    id: "badge-007",
    name: "Day Trader",
    description: "Complete 100 transactions.",
    imageUrl: "https://images.unsplash.com/photo-1518608019671-cf6f53fb330d?w=200&h=200&fit=crop",
    rarity: BadgeRarity.UNCOMMON,
    tokenUri: "",
    earnedAt: null,
    icon: "chart",
  },
  {
    id: "badge-008",
    name: "Milestone Reached",
    description: "Achieve $1000 in total support.",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f70504c6a?w=200&h=200&fit=crop",
    rarity: BadgeRarity.RARE,
    tokenUri: "",
    earnedAt: null,
    icon: "trophy",
  },
  {
    id: "badge-009",
    name: "Streak Master",
    description: "Maintain a 7-day donation streak.",
    imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=200&h=200&fit=crop",
    rarity: BadgeRarity.EPIC,
    tokenUri: "",
    earnedAt: null,
    icon: "fire",
  },
  {
    id: "badge-010",
    name: "Verifier",
    description: "Verify 50 fundraisers.",
    imageUrl: "https://images.unsplash.com/photo-1550258987-920cdbdf60a7?w=200&h=200&fit=crop",
    rarity: BadgeRarity.UNCOMMON,
    tokenUri: "",
    earnedAt: null,
    icon: "check",
  },
  {
    id: "badge-011",
    name: "Founder's Choice",
    description: "Receive a personal nomination from a founder.",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop",
    rarity: BadgeRarity.EPIC,
    tokenUri: "",
    earnedAt: null,
    icon: "star",
  },
  {
    id: "badge-012",
    name: "Eternal Guardian",
    description: "Reach lifetime membership milestone.",
    imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200&h=200&fit=crop",
    rarity: BadgeRarity.LEGENDARY,
    tokenUri: "",
    earnedAt: null,
    icon: "shield",
  },
];

/**
 * BadgeCard Component - Displays individual badge with glassmorphism and animations.
 * 
 * Features:
 * - Glassmorphic design with neon gradients
 * - Staggered entrance animation
 * - Hover/tap pop and glow effects
 * - Responsive layout
 * - Full interactivity with click handler
 * 
 * @param {BadgeCardProps} props - Component properties
 * @returns {JSX.Element} Rendered badge card
 */
const BadgeCard: FC<BadgeCardProps> = ({ badge, index, onBadgeClick }) => {
  const style = rarityStyles[badge.rarity.toUpperCase() as keyof typeof rarityStyles];
  const isEarned = badge.earnedAt !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        delay: index * 0.1,
      }}
      whileHover={isEarned ? { scale: 1.08, y: -8 } : {}}
      whileTap={isEarned ? { scale: 0.96 } : {}}
      onClick={() => isEarned && onBadgeClick(badge)}
      className={`cursor-${isEarned ? "pointer" : "not-allowed"} transition-all`}
    >
      <Card className={`relative overflow-hidden backdrop-blur-xl bg-gradient-to-br ${style.bg} border ${style.border} rounded-2xl p-6 flex flex-col items-center text-center space-y-3 transition-all ${isEarned ? style.glow : "opacity-50"}`}
        style={isEarned ? { boxShadow: `0 0 24px 0 rgba(${badge.rarity === BadgeRarity.LEGENDARY ? "236, 72, 153" : "147, 51, 234"}, 0.3)` } : {}}
      >
        {/* Badge Image */}
        <motion.div
          whileHover={isEarned ? { rotate: 6, scale: 1.05 } : {}}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative"
        >
          <Image
            src={badge.imageUrl}
            alt={badge.name}
            width={80}
            height={80}
            className="rounded-full border-2 border-white/30 shadow-lg"
            priority
          />
          {isEarned && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-0 right-0 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white"
            >
              <span className="text-white text-xs font-bold">✓</span>
            </motion.div>
          )}
        </motion.div>

        {/* Badge Name */}
        <h3 className={`font-bold text-lg ${style.text}`}>{badge.name}</h3>

        {/* Badge Description */}
        <p className="text-xs text-white/70 leading-relaxed">{badge.description}</p>

        {/* Rarity Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${style.text} ${style.border} bg-white/5`}>
          {badge.rarity}
        </div>

        {/* Earned Date */}
        {isEarned && badge.earnedAt && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-green-300 font-medium"
          >
            Earned {new Date(badge.earnedAt).toLocaleDateString()}
          </motion.p>
        )}

        {/* Action Button */}
        {isEarned ? (
          <Button
            variant="primary"
            size="sm"
            className="w-full mt-2 text-white"
            onClick={() => onBadgeClick(badge)}
          >
            View Details
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-2 opacity-50 cursor-not-allowed"
            disabled
          >
            Locked
          </Button>
        )}
      </Card>
    </motion.div>
  );
};

/**
 * ShareButton Component - Share badge to social media.
 * 
 * Features:
 * - Social media sharing (Twitter, LinkedIn, Facebook)
 * - Copy shareable link to clipboard
 * - Toast confirmation
 * - Animated icons
 * 
 * @param {ShareButtonProps} props - Component properties
 * @returns {JSX.Element} Rendered share button
 */
const ShareButton: FC<ShareButtonProps> = memo(({ badge }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopyLink = useCallback((): void => {
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/badges?badge=${badge.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [badge.id]);

  const handleShareSocial = useCallback((platform: string): void => {
    const text = `I just earned the "${badge.name}" badge on PSL Pulse! 🎉`;
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank");
  }, [badge.name]);

  return (
    <motion.div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-300/40 text-white text-sm font-medium hover:border-pink-300/60 transition-all"
      >
        Share
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-12 right-0 z-20 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-2 space-y-1 w-40"
          >
            <motion.button
              whileHover={{ x: 4 }}
              onClick={() => handleShareSocial("twitter")}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-white transition-all"
            >
              Share on Twitter
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              onClick={() => handleShareSocial("linkedin")}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-white transition-all"
            >
              Share on LinkedIn
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              onClick={() => handleShareSocial("facebook")}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-white transition-all"
            >
              Share on Facebook
            </motion.button>
            <div className="border-t border-white/10 my-1" />
            <motion.button
              whileHover={{ x: 4 }}
              onClick={handleCopyLink}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-white transition-all"
            >
              {copied ? "✓ Copied Link" : "Copy Link"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
ShareButton.displayName = "ShareButton";

/**
 * BadgeModal Component - Displays full badge details in an animated modal.
 * 
 * Features:
 * - Large, detailed badge display
 * - Glassmorphic modal with backdrop blur
 * - Smooth entrance/exit animations
 * - Full badge information
 * - Close button with hover effects
 * - Responsive design
 * 
 * @param {BadgeModalProps} props - Component properties
 * @returns {JSX.Element | null} Rendered modal or null
 */
const BadgeModal: FC<BadgeModalProps> = ({ badge, open, onClose }) => {
  if (!badge) return null;

  const style = rarityStyles[badge.rarity.toUpperCase() as keyof typeof rarityStyles];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            className={`relative w-full max-w-md p-8 rounded-3xl backdrop-blur-2xl bg-gradient-to-br ${style.bg} border ${style.border} shadow-2xl`}
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            >
              ×
            </motion.button>

            {/* Badge Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              <Image
                src={badge.imageUrl}
                alt={badge.name}
                width={140}
                height={140}
                className="rounded-full border-4 border-white/30 shadow-2xl"
                priority
              />
            </motion.div>

            {/* Badge Name */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`text-3xl font-bold text-center mb-2 ${style.text}`}
            >
              {badge.name}
            </motion.h2>

            {/* Rarity */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <span className={`px-4 py-1 rounded-full text-sm font-semibold border ${style.text} ${style.border} bg-white/5`}>
                {badge.rarity}
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-white/80 text-center mb-6 leading-relaxed"
            >
              {badge.description}
            </motion.p>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3 mb-6 bg-white/5 p-4 rounded-xl"
            >
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Rarity Level:</span>
                <span className={`font-semibold ${style.text}`}>{badge.rarity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Status:</span>
                <span className="font-semibold text-green-300">Owned</span>
              </div>
              {badge.earnedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Earned:</span>
                  <span className="font-semibold text-white">
                    {new Date(badge.earnedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex gap-3 w-full"
            >
              <ShareButton badge={badge} />
              <Button
                variant="secondary"
                className="flex-1"
                onClick={onClose}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * AnimatedLeaderboard Component - Displays ranked user leaderboard with animations and tipping.
 * 
 * Features:
 * - Slide-in row animations (staggered 100ms per row)
 * - Animated badge count transitions
 * - Rank change indicators (↑/↓ with color)
 * - Responsive table layout
 * - Tip button for supporting leaderboard players
 * - Smooth animations for all transitions
 * 
 * @param {AnimatedLeaderboardProps} props - Component properties
 * @returns {JSX.Element} Rendered leaderboard
 */
const AnimatedLeaderboard: FC<AnimatedLeaderboardProps> = memo(({ entries, userAddress }: AnimatedLeaderboardProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
      }}
      className="overflow-x-auto"
    >
      <div className="min-w-full">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/10 bg-white/5 sticky top-0 rounded-t-xl">
          <div className="col-span-1 text-xs font-semibold text-white/60 uppercase">Rank</div>
          <div className="col-span-3 text-xs font-semibold text-white/60 uppercase">Player</div>
          <div className="col-span-2 text-xs font-semibold text-white/60 uppercase">Badges</div>
          <div className="col-span-3 text-xs font-semibold text-white/60 uppercase">Points</div>
          <div className="col-span-3 text-xs font-semibold text-white/60 uppercase">Action</div>
        </div>

        {/* Leaderboard Rows */}
        {entries.map((entry: LeaderboardEntry, idx: number) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="grid grid-cols-12 gap-4 px-4 py-4 items-center border-b border-white/5 hover:bg-white/5 transition-colors"
          >
            {/* Rank */}
            <div className="col-span-1 flex items-center gap-2">
              <span className="text-lg font-bold text-pink-300">#{entry.rank}</span>
              {entry.rankChange !== 0 && (
                <motion.span
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: -4, opacity: 1 }}
                  className={`text-xs font-semibold ${entry.rankChange > 0 ? "text-green-300" : "text-red-300"}`}
                >
                  {entry.rankChange > 0 ? "↑" : "↓"}
                </motion.span>
              )}
            </div>

            {/* Player Name */}
            <div className="col-span-3 text-sm font-medium text-white">{entry.username}</div>

            {/* Badges */}
            <div className="col-span-2 flex gap-2 flex-wrap">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-500/30 border border-pink-300/40 text-xs font-semibold text-pink-300"
              >
                {entry.badgeCount}
              </motion.div>
            </div>

            {/* Points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="col-span-3 text-lg font-bold text-purple-300"
            >
              {entry.totalPoints.toLocaleString()}
            </motion.div>

            {/* Tip Button */}
            <div className="col-span-3 flex justify-end">
              <div className="w-32">
                <PaymentButton
                  userAddress={userAddress}
                  wireAmount={ethers.parseEther("0.1")}
                  purpose="tip"
                  label="Tip"
                  size="sm"
                  metadata={{
                    playerId: entry.userId,
                  }}
                  onSuccess={(txHash) => {
                    // Update leaderboard or show confirmation
                    console.log("Tip sent:", txHash);
                  }}
                  disabled={!userAddress}
                  variant="outline"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});
AnimatedLeaderboard.displayName = "AnimatedLeaderboard";

/**
 * BadgeAdvisor Component - AI-powered badge advisor with floating button and modal.
 * 
 * Features:
 * - Floating action button
 * - Badge query input
 * - Progress bar showing path to badge
 * - Actionable tips (3-5 steps)
 * - Animated tips entrance with stagger
 * - Responsive modal design
 * 
 * @param {BadgeAdvisorProps} props - Component properties
 * @returns {JSX.Element} Rendered badge advisor
 */
const BadgeAdvisor: FC<BadgeAdvisorProps> = memo(({ allBadges }: BadgeAdvisorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeWithEarned | null>(null);
  const [progress, setProgress] = useState(0);

  const tips: Record<string, string[]> = {
    "First Donation": ["Click Donate button", "Choose amount", "Complete payment", "Claim badge"],
    "Top Donor": ["Make consistent donations", "Reach $500 total", "Maintain monthly streak", "Earn automatically"],
    "Ticket Master": ["Browse upcoming events", "Select event", "Purchase ticket", "Claim event badge"],
    "Impact Champion": ["Complete support", "Reach milestone", "Verify completion", "Earn badge"],
    default: ["Stay active in community", "Support causes", "Participate in events", "Earn badges"],
  };

  const handleSelectBadge = useCallback((badge: BadgeWithEarned): void => {
    setSelectedBadge(badge);
    setProgress(Math.floor(Math.random() * 75) + 25);
  }, []);

  const currentTips = selectedBadge ? (tips[selectedBadge.name] || tips.default) : [];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-xl z-40 flex items-center justify-center font-bold text-xl hover:shadow-2xl transition-shadow"
        aria-label="Open badge advisor"
      >
        💡
      </motion.button>

      {/* Advisor Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              className="relative w-full max-w-lg p-8 rounded-2xl backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 to-purple-900/50 border border-white/20 shadow-2xl"
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                ×
              </motion.button>

              <h2 className="text-2xl font-bold text-pink-300 mb-4">Badge Advisor</h2>

              {!selectedBadge ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <p className="text-sm text-white/70 mb-4">Select a badge to see how to earn it:</p>
                  {allBadges.slice(5).map((badge: BadgeWithEarned) => (
                    <motion.button
                      key={badge.id}
                      whileHover={{ scale: 1.02, x: 4 }}
                      onClick={() => handleSelectBadge(badge)}
                      className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm text-white"
                    >
                      {badge.name}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src={selectedBadge.imageUrl}
                      alt={selectedBadge.name}
                      width={48}
                      height={48}
                      className="rounded-full border border-white/30"
                    />
                    <div>
                      <h3 className="font-bold text-white">{selectedBadge.name}</h3>
                      <p className="text-xs text-white/60">{selectedBadge.rarity}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-white/60">Progress</p>
                      <p className="text-xs font-semibold text-pink-300">{progress}%</p>
                    </div>
                    <motion.div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                      />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-white/70 uppercase">Steps to earn:</p>
                    {currentTips.map((tip, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3 text-sm text-white/80"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/30 border border-pink-300/40 flex items-center justify-center text-xs font-semibold text-pink-300">
                          {idx + 1}
                        </span>
                        <span>{tip}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedBadge(null)}
                    className="w-full mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-300/40 text-white text-sm font-medium hover:border-pink-300/60 transition-all"
                  >
                    Back to Badges
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
BadgeAdvisor.displayName = "BadgeAdvisor";

/**
 * Mock leaderboard data with 25 top players.
 * @type {LeaderboardEntry[]}
 */
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: "CryptoLegend", badgeCount: 8, badges: MOCK_BADGES.slice(0, 5), totalPoints: 5250, rankChange: 0, userId: "user_001" },
  { rank: 2, username: "DonationKing", badgeCount: 7, badges: MOCK_BADGES.slice(0, 4), totalPoints: 4890, rankChange: 1, userId: "user_002" },
  { rank: 3, username: "PulseHero", badgeCount: 6, badges: MOCK_BADGES.slice(0, 3), totalPoints: 4560, rankChange: -1, userId: "user_003" },
  { rank: 4, username: "SupportStar", badgeCount: 6, badges: MOCK_BADGES.slice(0, 3), totalPoints: 4210, rankChange: 0, userId: "user_004" },
  { rank: 5, username: "EventMaster", badgeCount: 5, badges: MOCK_BADGES.slice(0, 2), totalPoints: 3890, rankChange: 2, userId: "user_005" },
  { rank: 6, username: "ImpactVoice", badgeCount: 5, badges: MOCK_BADGES.slice(0, 2), totalPoints: 3650, rankChange: -1, userId: "user_006" },
  { rank: 7, username: "ChampionSoul", badgeCount: 4, badges: MOCK_BADGES.slice(0, 1), totalPoints: 3380, rankChange: 0, userId: "user_007" },
  { rank: 8, username: "TrueBeliever", badgeCount: 4, badges: MOCK_BADGES.slice(0, 1), totalPoints: 3120, rankChange: 1, userId: "user_008" },
  { rank: 9, username: "FutureFocus", badgeCount: 3, badges: [], totalPoints: 2890, rankChange: 0, userId: "user_009" },
  { rank: 10, username: "CommunityWave", badgeCount: 3, badges: [], totalPoints: 2650, rankChange: -2, userId: "user_010" },
  ...Array.from({ length: 15 }, (_, i) => ({
    rank: 11 + i,
    username: `Player${String(11 + i).padStart(3, "0")}`,
    badgeCount: Math.max(0, 3 - Math.floor(i / 5)),
    badges: [],
    totalPoints: Math.max(1000, 2500 - i * 80),
    rankChange: i % 3 === 0 ? 1 : -1,
    userId: `user_${String(11 + i).padStart(3, "0")}`,
  })),
];

/**
 * Particle interface for background animation particles.
 * @interface Particle
 */
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
}

/**
 * ParticleBackground Component - Animated particle field with parallax depth effect.
 * 
 * Features:
 * - Responsive particle count based on screen size
 * - Parallax depth layers for 3D effect
 * - Smooth velocity-based movement
 * - Opacity fade for immersion
 * - Performance-optimized with memo
 * 
 * @returns {JSX.Element} Rendered particle background
 */
const ParticleBackground: FC = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeParticles();
    };

    const initializeParticles = (): void => {
      const particleCount = Math.min(50, Math.max(20, Math.floor((canvas.width * canvas.height) / 20000)));
      particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        size: Math.random() * 2 + 1,
      }));
    };

    const animate = (): void => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.opacity *= 0.9985;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.fillStyle = `rgba(236, 72, 153, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    const handleResize = (): void => resizeCanvas();
    window.addEventListener("resize", handleResize);

    return (): void => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.3 }}
    />
  );
});
ParticleBackground.displayName = "ParticleBackground";

/**
 * ConfettiEffect Component - Triggered confetti animation for badge celebrations.
 * 
 * Features:
 * - 200+ animated particles
 * - Gravity and fade physics
 * - 1.5s animation duration
 * - Semi-transparent colors
 * - Memoized for performance
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.trigger - Whether to trigger confetti animation
 * @returns {JSX.Element} Rendered confetti effect
 */
interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

const ConfettiEffect: FC<ConfettiProps> = memo(({ trigger, onComplete }: ConfettiProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([]);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#ec4899", "#a855f7", "#6366f1", "#06b6d4"];
    particlesRef.current = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: -10,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 3 + 2,
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let frameCount = 0;
    const animate = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= 0.015;
        p.x += p.vx;

        if (p.life > 0) {
          ctx.globalAlpha = p.life * 0.7;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, 4, 4);
          return true;
        }
        return false;
      });

      ctx.globalAlpha = 1;

      frameCount += 1;
      if (frameCount < 100 && particlesRef.current.length > 0) {
        requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animate();
  }, [trigger, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ opacity: 1 }}
    />
  );
});
ConfettiEffect.displayName = "ConfettiEffect";

/**
 * FAQItem interface for About/FAQ accordion items.
 * @interface FAQItem
 */
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "badges" | "earning" | "community";
}

/**
 * FAQ data with comprehensive questions about badges and community.
 * @type {FAQItem[]}
 */
const FAQ_DATA: FAQItem[] = [
  {
    id: "1",
    category: "badges",
    question: "What are collectible badges?",
    answer: "Collectible badges are exclusive digital achievements that showcase your commitment to PSL Pulse. Each badge represents a milestone, contribution, or accomplishment in our community. Earn them through donations, ticket purchases, event attendance, and community engagement.",
  },
  {
    id: "2",
    category: "badges",
    question: "How do I view my earned badges?",
    answer: "Your earned badges are displayed prominently on this Badges page. Click any badge to see detailed information about when you earned it, its rarity level, and what milestone it represents.",
  },
  {
    id: "3",
    category: "earning",
    question: "How do I earn new badges?",
    answer: "There are multiple ways to earn badges: Make donations (First Donation, Top Donor, Impact Champion badges), purchase tickets to events (Ticket Master badge), participate in community discussions, and complete special challenges. Use the Badge Advisor to get personalized tips on earning specific badges.",
  },
  {
    id: "4",
    category: "earning",
    question: "What's the difference between rarity levels?",
    answer: "Badges have five rarity levels: COMMON (easy to earn), UNCOMMON (requires more engagement), RARE (significant milestone), EPIC (exclusive achievement), and LEGENDARY (prestigious accomplishment). Rarer badges are displayed with enhanced visual effects.",
  },
  {
    id: "5",
    category: "community",
    question: "Can I share my badges on social media?",
    answer: "Absolutely! Click the share button in any badge's detail modal to share on Twitter, LinkedIn, or Facebook. You can also copy a direct link to your badge to share with friends.",
  },
  {
    id: "6",
    category: "community",
    question: "How does the leaderboard work?",
    answer: "The leaderboard ranks community members by total earned badges and points. Your ranking is displayed in real-time based on your achievements. Check the Leaderboard section to see where you stand and get motivated to climb higher!",
  },
  {
    id: "7",
    category: "community",
    question: "What is the Badge Advisor?",
    answer: "The Badge Advisor is an AI-powered tool (access via the 💡 button) that provides personalized guidance on earning badges. Select any badge to receive step-by-step tips and a progress indicator showing how close you are to earning it.",
  },
  {
    id: "8",
    category: "earning",
    question: "Do badges expire or have time limits?",
    answer: "No, once you earn a badge, it's yours forever. There are no expiration dates or time limits. Your badges represent permanent milestones in your PSL Pulse journey.",
  },
  {
    id: "9",
    category: "community",
    question: "Can I unlock special rewards with badges?",
    answer: "Currently, badges provide recognition and leaderboard benefits. In future updates, we plan to unlock exclusive perks, discounts, and special access based on your badge collection.",
  },
  {
    id: "10",
    category: "badges",
    question: "What happens if my ranking changes?",
    answer: "Your ranking can fluctuate as community members earn new badges and points. The leaderboard updates in real-time. Rank changes are indicated by ↑ (moved up) and ↓ (moved down) arrows.",
  },
];

/**
 * AboutFAQ Component - Comprehensive about section with accordion FAQ.
 * 
 * Features:
 * - 10 accordion items with smooth expand/collapse
 * - Category filtering (badges, earning, community)
 * - Animated entrance and item transitions
 * - Responsive layout
 * - Dark theme with glassmorphism
 * 
 * @returns {JSX.Element} Rendered about/FAQ section
 */
const AboutFAQ: FC = memo(() => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "badges" | "earning" | "community">("all");

  const filteredFAQ = useMemo(
    () => FAQ_DATA.filter((item) => activeCategory === "all" || item.category === activeCategory),
    [activeCategory]
  );

  const categories = [
    { value: "all" as const, label: "All" },
    { value: "badges" as const, label: "Badges" },
    { value: "earning" as const, label: "Earning" },
    { value: "community" as const, label: "Community" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-24 scroll-mt-20"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-3">
            About Badges & FAQ
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Learn everything about earning badges, climbing the leaderboard, and celebrating your achievements in PSL Pulse.
          </p>
        </div>

        {/* Category Filter Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 justify-center mb-8"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeCategory === cat.value
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
          className="space-y-3"
        >
          {filteredFAQ.map((item) => (
            <motion.div
              key={item.id}
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl overflow-hidden hover:border-white/30 transition-all"
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-4">{item.question}</span>
                <motion.span
                  animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 text-pink-300 text-xl"
                >
                  ›
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/10 overflow-hidden"
                  >
                    <p className="px-6 py-4 text-white/80 leading-relaxed text-base">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Call-to-Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center p-8 backdrop-blur-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-300/20 rounded-2xl"
        >
          <h3 className="text-2xl font-bold text-pink-300 mb-3">Ready to earn more badges?</h3>
          <p className="text-white/70 mb-6 max-w-xl mx-auto">
            Start your PSL Pulse journey today. Learn more about our community and discover ways to make an impact.
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#"
            className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all"
          >
            Get Started
          </motion.a>
        </motion.div>
      </div>
    </motion.div>
  );
});
AboutFAQ.displayName = "AboutFAQ";

/**
 * BadgesPage - Main badges page component with grid, modals, leaderboard, and advisor.
 * 
 * Features:
 * - Animated badge grid with 12+ badges
 * - Modal system for badge details
 * - Share functionality
 * - Animated leaderboard (25 top players)
 * - Badge Advisor AI with floating button
 * - Responsive grid layout (4 desktop, 2 tablet, 1 mobile)
 * - Glassmorphic design with neon gradients
 * - Full animations using Framer Motion
 * - TypeScript strict mode with full JSDoc coverage
 * 
 * @returns {JSX.Element} Rendered badges page
 */
export default function BadgesPage() {
  const { user } = useWallet();
  const [selectedBadge, setSelectedBadge] = useState<BadgeWithEarned | null>(null);
  const [triggerConfetti, setTriggerConfetti] = useState(false);

  const handleBadgeClick = useCallback((badge: BadgeWithEarned): void => {
    setSelectedBadge(badge);
    setTriggerConfetti(true);
  }, []);

  const handleCloseModal = useCallback((): void => {
    setSelectedBadge(null);
  }, []);

  const handleConfettiComplete = useCallback((): void => {
    setTriggerConfetti(false);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 relative overflow-hidden">
      {/* Animated Particle Background */}
      <ParticleBackground />

      {/* Confetti Effect - Triggered on badge selection */}
      {triggerConfetti && (
        <ConfettiEffect trigger={triggerConfetti} onComplete={handleConfettiComplete} />
      )}

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-3">
            Collectible Badges
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            Earn exclusive badges by supporting PSL Pulse. Showcase your achievements and climb the leaderboard.
          </p>
        </motion.div>

        {/* Badge Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {MOCK_BADGES.map((badge, index) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              index={index}
              onBadgeClick={handleBadgeClick}
            />
          ))}
        </motion.div>

        {/* Badge Modal */}
        <BadgeModal
          badge={selectedBadge}
          open={selectedBadge !== null}
          onClose={handleCloseModal}
        />

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16"
        >
          {[
            { label: "Badges Earned", value: "5" },
            { label: "Total Score", value: "2,450" },
            { label: "Leaderboard Rank", value: "#42" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 text-center"
            >
              <p className="text-white/60 text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-pink-300">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Leaderboard Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-20"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-8">
            Leaderboard
          </h2>
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
            <AnimatedLeaderboard entries={MOCK_LEADERBOARD} userAddress={user?.address} />
          </div>
        </motion.div>

        {/* About/FAQ Section */}
        <AboutFAQ />
      </div>

      {/* Badge Advisor Floating Button */}
      <BadgeAdvisor allBadges={MOCK_BADGES} />
    </div>
  );
}
