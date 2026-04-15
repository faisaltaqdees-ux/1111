/**
 * PART 2: Real-Time Data Integration Service
 * Provides live cricket data, user context, leaderboard, and blockchain data
 * Integrated with: Cricket APIs, Supabase, WireFluid blockchain
 */

// Mock interfaces - replace with actual API responses
interface LiveMatchData {
  matchId: string;
  team1: string;
  team2: string;
  status: 'live' | 'upcoming' | 'completed';
  currentScore?: { team1: number; team2: number; overs: string };
  venue: string;
  startTime: string;
}

interface UserProfileData {
  userId: string;
  username: string;
  badgePoints: number;
  badges: string[];
  donationsCount: number;
  totalTipped: number;
  leaderboardRank: number;
  academiesSupported: string[];
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  badges: string[];
  contribution: { tips: number; donations: number; tickets: number };
}

interface PlayerStats {
  playerId: string;
  name: string;
  team: string;
  recent: { runs?: number; wickets?: number; matches: number };
  totalCareerStats: { runs: number; wickets: number; matches: number };
}

interface NFTTicketData {
  ticketId: string;
  matchId: string;
  owner: string;
  seatNumber: string;
  verified: boolean;
  transferCount: number;
}

interface AcademyData {
  academyId: string;
  name: string;
  location: string;
  kitsReceived: number;
  studentsImpacted: number;
  focus: string; // 'Spin', 'Fast', 'Batting', etc.
}

/**
 * API Configuration with retry logic
 * 
 * ENV VARS REQUIRED:
 * - NEXT_PUBLIC_CRICKET_API: Cricket data API endpoint
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_KEY: Supabase anonymous public key
 * - NEXT_PUBLIC_WIREFLUID_RPC: WireFluid EVM JSON-RPC endpoint
 * - NEXT_PUBLIC_WIREFLUID_WS: WireFluid WebSocket for real-time events
 */
const API_CONFIG = {
  CRICKET_API_BASE: process.env.NEXT_PUBLIC_CRICKET_API || 'https://api.cricketdata.com',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vdliftxhaeerckexudos.supabase.co',
  SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_KEY || '',
  WIREFLUID_RPC: process.env.NEXT_PUBLIC_WIREFLUID_RPC || 'https://evm.wirefluid.com',
  WIREFLUID_WS: process.env.NEXT_PUBLIC_WIREFLUID_WS || 'wss://ws.wirefluid.com',
  WIREFLUID_CHAIN_ID: 92533,
  WIREFLUID_EXPLORER: 'https://wirefluidscan.com',
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  CACHE_TTL_MS: 30000, // 30 second cache for live data
};

/**
 * Cache storage for real-time data (prevents excessive API calls)
 */
class DataCache {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();

  set(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > API_CONFIG.CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

const dataCache = new DataCache();

/**
 * Retry wrapper with exponential backoff
 * Handles transient API failures gracefully
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  attempts: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < attempts - 1) {
        const delayMs = API_CONFIG.RETRY_DELAY_MS * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

/**
 * CRICKET DATA SERVICE
 * Fetches live match scores, schedules, player stats
 */
export const cricketDataService = {
  async getLiveMatches(): Promise<LiveMatchData[]> {
    const cacheKey = 'live_matches';
    const cached = dataCache.get(cacheKey);
    if (cached) return cached as LiveMatchData[];

    try {
      const data = await retryWithBackoff(async () => {
        const response = await fetch(`${API_CONFIG.CRICKET_API_BASE}/matches/live`);
        if (!response.ok) throw new Error(`Cricket API error: ${response.status}`);
        return response.json();
      });

      dataCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      return [];
    }
  },

  async getMatchSchedule(): Promise<LiveMatchData[]> {
    const cacheKey = 'match_schedule';
    const cached = dataCache.get(cacheKey);
    if (cached) return cached as LiveMatchData[];

    try {
      const data = await retryWithBackoff(async () => {
        const response = await fetch(`${API_CONFIG.CRICKET_API_BASE}/schedule`);
        if (!response.ok) throw new Error(`Cricket API error: ${response.status}`);
        return response.json();
      });

      dataCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return [];
    }
  },

  async getPlayerStats(playerId: string): Promise<PlayerStats | null> {
    const cacheKey = `player_${playerId}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached as PlayerStats;

    try {
      const data = await retryWithBackoff(async () => {
        const response = await fetch(`${API_CONFIG.CRICKET_API_BASE}/players/${playerId}`);
        if (!response.ok) throw new Error(`Cricket API error: ${response.status}`);
        return response.json();
      });

      dataCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  },

  async getTeamStats(teamId: string): Promise<{ name: string; wins: number; losses: number } | null> {
    try {
      const data = await retryWithBackoff(async () => {
        const response = await fetch(`${API_CONFIG.CRICKET_API_BASE}/teams/${teamId}`);
        if (!response.ok) throw new Error(`Cricket API error: ${response.status}`);
        return response.json();
      });
      return data;
    } catch (error) {
      console.error('Error fetching team stats:', error);
      return null;
    }
  },
};

/**
 * USER PROFILE SERVICE
 * Fetches Supabase user data: badges, donations, tipping history, rankings
 */
export const userProfileService = {
  async getUserProfile(userId: string): Promise<UserProfileData | null> {
    const cacheKey = `user_${userId}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached as UserProfileData;

    try {
      const data = await retryWithBackoff(async () => {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error(`User API error: ${response.status}`);
        return response.json();
      });

      dataCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async getUserBadges(userId: string): Promise<string[]> {
    try {
      const response = await fetch(`/api/users/${userId}/badges`);
      if (!response.ok) throw new Error('Badge fetch failed');
      const { badges } = await response.json();
      return badges;
    } catch (error) {
      console.error('Error fetching badges:', error);
      return [];
    }
  },

  async getUserDonationHistory(userId: string): Promise<{ academy: string; kits: number; date: string }[]> {
    try {
      const response = await fetch(`/api/users/${userId}/donations`);
      if (!response.ok) throw new Error('Donation history fetch failed');
      const { donations } = await response.json();
      return donations;
    } catch (error) {
      console.error('Error fetching donations:', error);
      return [];
    }
  },
};

/**
 * LEADERBOARD SERVICE
 * Real-time leaderboard rankings with live updates
 */
export const leaderboardService = {
  async getGlobalLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const cacheKey = 'leaderboard_global';
    const cached = dataCache.get(cacheKey);
    if (cached) return cached as LeaderboardEntry[];

    try {
      const data = await retryWithBackoff(async () => {
        const response = await fetch(`/api/leaderboard?limit=${limit}`);
        if (!response.ok) throw new Error(`Leaderboard API error: ${response.status}`);
        return response.json();
      });

      dataCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  async getUserRank(userId: string): Promise<LeaderboardEntry | null> {
    try {
      const data = await retryWithBackoff(async () => {
        const response = await fetch(`/api/leaderboard/user/${userId}`);
        if (!response.ok) throw new Error(`User rank API error: ${response.status}`);
        return response.json();
      });
      return data;
    } catch (error) {
      console.error('Error fetching user rank:', error);
      return null;
    }
  },

  async initializeRealtimeLeaderboard(callback: (entries: LeaderboardEntry[]) => void): Promise<(() => void) | null> {
    try {
      // Simulated real-time subscription (replace with actual WebSocket/Supabase subscription)
      const interval = setInterval(async () => {
        const data = await this.getGlobalLeaderboard(50);
        if (data.length > 0) {
          dataCache.clear('leaderboard_global');
          callback(data);
        }
      }, 5000); // Update every 5 seconds

      // Return unsubscribe function
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error initializing realtime leaderboard:', error);
      return null;
    }
  },
};

/**
 * NFT TICKET SERVICE
 * Blockchain integration for ticket verification and ownership
 */
export const nftTicketService = {
  async getUserTickets(walletAddress: string): Promise<NFTTicketData[]> {
    const cacheKey = `tickets_${walletAddress}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached as NFTTicketData[];

    try {
      const data = await retryWithBackoff(async () => {
        // Connect to WireFluid RPC and query NFT contract
        const response = await fetch(`/api/nft/tickets/${walletAddress}`);
        if (!response.ok) throw new Error(`NFT API error: ${response.status}`);
        return response.json();
      });

      dataCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching NFT tickets:', error);
      return [];
    }
  },

  async verifyTicket(ticketId: string): Promise<boolean> {
    try {
      const response = await retryWithBackoff(async () => {
        const res = await fetch(`/api/nft/verify/${ticketId}`);
        if (!res.ok) throw new Error('Ticket verification failed');
        return res.json();
      });
      return response.verified;
    } catch (error) {
      console.error('Error verifying ticket:', error);
      return false;
    }
  },

  async getTicketMetadata(ticketId: string): Promise<{ matchDate: string; venue: string; seatValue: number } | null> {
    try {
      const response = await fetch(`/api/nft/metadata/${ticketId}`);
      if (!response.ok) throw new Error('Metadata fetch failed');
      return response.json();
    } catch (error) {
      console.error('Error fetching ticket metadata:', error);
      return null;
    }
  },
};

/**
 * ACADEMY SERVICE
 * Real-time tracking of donations and impact per academy
 */
export const academyService = {
  async getAllAcademies(): Promise<AcademyData[]> {
    const cacheKey = 'academies_all';
    const cached = dataCache.get(cacheKey);
    if (cached) return cached as AcademyData[];

    try {
      const data = await retryWithBackoff(async () => {
        const response = await fetch('/api/academies');
        if (!response.ok) throw new Error('Academies fetch failed');
        return response.json();
      });

      dataCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching academies:', error);
      return [];
    }
  },

  async getAcademyStats(academyId: string): Promise<AcademyData | null> {
    const cacheKey = `academy_${academyId}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached as AcademyData;

    try {
      const data = await retryWithBackoff(async () => {
        const response = await fetch(`/api/academies/${academyId}`);
        if (!response.ok) throw new Error('Academy stats fetch failed');
        return response.json();
      });

      dataCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching academy stats:', error);
      return null;
    }
  },
};

/**
 * CONTEXT BUILDER
 * Combines multiple data sources to create personalized AI context
 */
export const contextBuilder = {
  async buildUserContext(userId: string, walletAddress?: string): Promise<string> {
    try {
      const profile = await userProfileService.getUserProfile(userId);
      const rank = await leaderboardService.getUserRank(userId);
      const tickets = walletAddress ? await nftTicketService.getUserTickets(walletAddress) : [];

      const context = `
**User Context:**
${profile ? `Current Rank: #${rank?.rank || 'N/A'} | Badge Points: ${profile.badgePoints} | Donations: ${profile.donationsCount}` : 'Not logged in'}
${tickets.length > 0 ? `NFT Tickets Owned: ${tickets.length}` : ''}
      `.trim();

      return context;
    } catch (error) {
      console.error('Error building user context:', error);
      return '';
    }
  },

  async buildLiveContext(): Promise<string> {
    try {
      const matches = await cricketDataService.getLiveMatches();
      const leaderboard = await leaderboardService.getGlobalLeaderboard(5);

      const matchInfo =
        matches.length > 0
          ? `Currently ${matches.filter((m) => m.status === 'live').length} live matches`
          : 'No live matches right now';

      const topContributor = leaderboard[0]
        ? `Top Contributor: ${leaderboard[0].username} (${leaderboard[0].points} points)`
        : '';

      return `**Live Platform Status:** ${matchInfo}\n${topContributor}`;
    } catch (error) {
      console.error('Error building live context:', error);
      return '';
    }
  },
};

/**
 * NFT CONTRACT SERVICE
 * Interact with WireFluid blockchain for ticket verification
 * Uses EVM JSON-RPC at https://evm.wirefluid.com (Chain ID: 92533)
 */
export const nftContractService = {
  async verifyTicketOnChain(ticketId: string, contractAddress: string): Promise<boolean> {
    try {
      // Call smart contract via JSON-RPC
      const response = await retryWithBackoff(async () => {
        return fetch(API_CONFIG.WIREFLUID_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: contractAddress,
                data: `0x${Buffer.from(`isValidTicket(${ticketId})`).toString('hex')}`,
              },
              'latest',
            ],
            id: 1,
          }),
        });
      });

      const result = await response.json();
      return result.result !== '0x0';
    } catch (error) {
      console.error('NFT verification failed:', error);
      return false;
    }
  },

  async getNFTBalance(walletAddress: string, contractAddress: string): Promise<number> {
    try {
      const response = await retryWithBackoff(async () => {
        return fetch(API_CONFIG.WIREFLUID_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: contractAddress,
                data: `0x70a08231000000000000000000000000${walletAddress.slice(2)}`,
              },
              'latest',
            ],
            id: 1,
          }),
        });
      });

      const result = await response.json();
      return parseInt(result.result || '0', 16);
    } catch (error) {
      console.error('NFT balance fetch failed:', error);
      return 0;
    }
  },
};

/**
 * ANALYTICS SERVICE
 * Track chatbot interactions, user satisfaction, improvement areas
 */
export const analyticsService = {
  async logInteraction(data: {
    userId?: string;
    intent: string;
    question: string;
    responseQuality: 'good' | 'poor' | 'needs_improvement';
    responseTime: number;
    timestamp: number;
  }): Promise<void> {
    try {
      await fetch('/api/analytics/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  },

  async trackUserSatisfaction(interactionId: string, rating: 1 | 2 | 3 | 4 | 5, feedback?: string): Promise<void> {
    try {
      await fetch('/api/analytics/satisfaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interactionId, rating, feedback, timestamp: Date.now() }),
      });
    } catch (error) {
      console.error('Error tracking satisfaction:', error);
    }
  },

  async getMetrics(): Promise<{
    totalInteractions: number;
    avgResponseTime: number;
    satisfactionScore: number;
    topIntents: { intent: string; count: number }[];
  } | null> {
    try {
      const response = await fetch('/api/analytics/metrics');
      if (!response.ok) throw new Error('Metrics fetch failed');
      return response.json();
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return null;
    }
  },
};

/**
 * A/B Testing Framework
 * Compare different response variations to optimize quality
 */
export const abTestingService = {
  async getTestVariant(userId: string, testName: string): Promise<'A' | 'B'> {
    // Deterministic variant assignment (same variant for same user)
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash + testName.length) % 2 === 0 ? 'A' : 'B';
  },

  async recordTestResult(testName: string, variant: 'A' | 'B', result: { success: boolean; metric: number }): Promise<void> {
    try {
      await fetch('/api/analytics/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testName, variant, result, timestamp: Date.now() }),
      });
    } catch (error) {
      console.error('Error recording test result:', error);
    }
  },
};

/**
 * WIREFLUID BLOCKCHAIN CONFIG
 * Network information for integration
 * Chain: WireFluid Testnet (Chain ID: 92533)
 * RPC: https://evm.wirefluid.com
 * Explorer: https://wirefluidscan.com
 * Currency: WIRE
 */
export const WIREFLUID_CONFIG = {
  chainId: API_CONFIG.WIREFLUID_CHAIN_ID,
  rpcUrl: API_CONFIG.WIREFLUID_RPC,
  wsUrl: API_CONFIG.WIREFLUID_WS,
  explorerUrl: API_CONFIG.WIREFLUID_EXPLORER,
  nativeCurrency: 'WIRE',
};

/**
 * Clear all cached data (useful on logout or data refresh)
 */
export const clearAllCache = (): void => {
  dataCache.clear();
};
