/**
 * User Leaderboard Data Fetcher
 * Fetches user donation and ticket purchase rankings from Supabase
 * Ranks users by total donations (£) and tickets purchased
 * @file userLeaderboard.ts
 */

import { createClient } from '@supabase/supabase-js';

/**
 * User Rank Entry - represents a user's donation and ticket stats
 */
export interface UserRankEntry {
  rank: number;
  userId: string;
  email: string;
  fullName?: string;
  totalDonated: number; // Total donation amount in WIRE
  totalDonationCount: number; // Count of donation transactions
  totalTicketsPurchased: number; // Total tickets bought
  combinedScore: number; // weighted score for ranking
  walletAddress: string;
  lastActivityDate?: string;
  isCurrentUser?: boolean;
}

/**
 * Fetch user leaderboard from Supabase
 * Groups transactions by user and calculates donation/ticket stats
 * @returns {Promise<UserRankEntry[]>} Array of users ranked by impact
 */
export async function fetchUserLeaderboard(): Promise<UserRankEntry[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  try {
    // Fetch all transactions (donations and tickets)
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('user_id, email, wallet_address, amount_wire, purpose, quantity, created_at')
      .in('purpose', ['charity_donation', 'ticket']);

    if (txError || !transactions) {
      console.error('❌ [UserLeaderboard] Failed to fetch transactions:', txError);
      return [];
    }

    console.log('🟢 [UserLeaderboard] Fetched transactions:', {
      total: transactions.length,
      distinctUsers: new Set(transactions.map(t => t.user_id)).size,
    });

    // Group by user and calculate stats
    const userStats = new Map<string, {
      userId: string;
      email: string;
      walletAddress: string;
      totalDonated: number;
      totalDonationCount: number;
      totalTicketsPurchased: number;
      lastActivityDate: string;
    }>();

    for (const tx of transactions) {
      const userId = tx.user_id || tx.email || 'unknown';
      const existing = userStats.get(userId);

      const isDonation = tx.purpose === 'charity_donation';
      const isTicket = tx.purpose === 'ticket';

      let updated = {
        userId,
        email: tx.email || '',
        walletAddress: tx.wallet_address || '',
        totalDonated: existing?.totalDonated || 0,
        totalDonationCount: existing?.totalDonationCount || 0,
        totalTicketsPurchased: existing?.totalTicketsPurchased || 0,
        lastActivityDate: tx.created_at || new Date().toISOString(),
      };

      if (isDonation) {
        updated.totalDonated += tx.amount_wire || 0;
        updated.totalDonationCount += 1;
      }

      if (isTicket) {
        updated.totalTicketsPurchased += (tx.quantity || 1);
      }

      userStats.set(userId, updated);
    }

    console.log('🟢 [UserLeaderboard] Grouped users:', userStats.size);

    // Convert to ranked array
    const ranked: UserRankEntry[] = Array.from(userStats.values())
      .map((stats) => {
        // Calculate combined score
        // 1 point per £ donated + 2 points per ticket purchased
        const combinedScore = stats.totalDonated * 1 + stats.totalTicketsPurchased * 2;

        return {
          rank: 0, // Will be set after sorting
          userId: stats.userId,
          email: stats.email,
          totalDonated: Math.round(stats.totalDonated * 100) / 100, // Round to 2 decimals
          totalDonationCount: stats.totalDonationCount,
          totalTicketsPurchased: stats.totalTicketsPurchased,
          combinedScore,
          walletAddress: stats.walletAddress,
          lastActivityDate: stats.lastActivityDate,
        };
      })
      .sort((a, b) => {
        // Sort by combined score DESC, then by total donated DESC
        if (b.combinedScore !== a.combinedScore) {
          return b.combinedScore - a.combinedScore;
        }
        return b.totalDonated - a.totalDonated;
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    console.log('🟢 [UserLeaderboard] Ranked leaderboard:', {
      totalUsers: ranked.length,
      topUser: ranked[0],
    });

    return ranked;
  } catch (error) {
    console.error('❌ [UserLeaderboard] Error fetching leaderboard:', error);
    return [];
  }
}
