/**
 * Cricket API Integration Service
 * Handles all CricAPI calls for live cricket match data
 * @file services/cricapi.service.ts
 */

const CRICAPI_BASE_URL = 'https://api.cricapi.com/v1';
const CRICAPI_KEY = '1e283f07-d4bc-4af2-b983-52dca8c6ae18';

export interface Match {
  id: string;
  name: string;
  matchType: 'odi' | 't20' | 'test';
  status: 'upcoming' | 'live' | 'completed';
  venue?: string;
  startTime: string;
  team1: string;
  team2: string;
  seriesId: string;
  teams?: [string, string];
  score?: {
    team1?: { score?: number; wickets?: number; overs?: string };
    team2?: { score?: number; wickets?: number; overs?: string };
  };
  teamImages?: { [key: string]: string };
}

interface CricAPIMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue?: string;
  date?: string;
  dateTimeGMT?: string;
  teams?: string[];
  team1?: { name?: string };
  team2?: { name?: string };
  series_id?: string;
  score?: any;
  tossWon_by?: string;
  fantasyEnabled?: boolean;
}

interface CricAPIResponse {
  status: string;
  data?: CricAPIMatch | CricAPIMatch[];
  info?: string;
}

/**
 * Cache for API responses
 */
const matchCache = new Map<string, { data: Match[]; timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes for regular matches, 10 seconds for live

/**
 * Fetch all cricket matches
 */
export async function getAllMatches(): Promise<Match[]> {
  try {
    // Check cache
    const cached = matchCache.get('all_matches');
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return cached.data;
    }

    const response = await fetch(`${CRICAPI_BASE_URL}/matches`, {
      headers: {
        Authorization: `Bearer ${CRICAPI_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`CricAPI error: ${response.statusText}`);
    }

    const data: CricAPIResponse = await response.json();

    if (data.status !== 'success' || !data.data) {
      throw new Error('Failed to fetch matches');
    }

    const matches = Array.isArray(data.data) ? data.data : [data.data];
    const transformedMatches = matches.map(transformMatch).filter(Boolean) as Match[];

    // Cache results
    matchCache.set('all_matches', {
      data: transformedMatches,
      timestamp: Date.now(),
    });

    return transformedMatches;
  } catch (error) {
    console.error('getAllMatches error:', error);
    throw error;
  }
}

/**
 * Get match by ID
 */
export async function getMatchById(matchId: string): Promise<Match | null> {
  try {
    const response = await fetch(`${CRICAPI_BASE_URL}/match/${matchId}`, {
      headers: {
        Authorization: `Bearer ${CRICAPI_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`CricAPI error: ${response.statusText}`);
    }

    const data: CricAPIResponse = await response.json();

    if (data.status !== 'success' || !data.data) {
      return null;
    }

    return transformMatch(data.data as CricAPIMatch);
  } catch (error) {
    console.error('getMatchById error:', error);
    return null;
  }
}

/**
 * Get matches by status
 */
export async function getMatchesByStatus(status: 'upcoming' | 'live' | 'completed'): Promise<Match[]> {
  try {
    const cacheKey = `matches_${status}`;

    // Check cache (shorter TTL for live matches)
    const cached = matchCache.get(cacheKey);
    const ttl = status === 'live' ? 10 * 1000 : CACHE_DURATION_MS;
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    const allMatches = await getAllMatches();
    const filtered = allMatches.filter((m) => m.status === status);

    matchCache.set(cacheKey, {
      data: filtered,
      timestamp: Date.now(),
    });

    return filtered;
  } catch (error) {
    console.error('getMatchesByStatus error:', error);
    throw error;
  }
}

/**
 * Get live matches only
 */
export async function getLiveMatches(): Promise<Match[]> {
  return getMatchesByStatus('live');
}

/**
 * Get upcoming matches
 */
export async function getUpcomingMatches(): Promise<Match[]> {
  return getMatchesByStatus('upcoming');
}

/**
 * Transform CricAPI match to internal format
 */
function transformMatch(cricMatch: CricAPIMatch): Match | null {
  try {
    if (!cricMatch.id || !cricMatch.name) {
      return null;
    }

    const startTime = cricMatch.dateTimeGMT || cricMatch.date || new Date().toISOString();
    const teams = cricMatch.teams || [cricMatch.team1?.name, cricMatch.team2?.name].filter(Boolean);

    let status: 'upcoming' | 'live' | 'completed' = 'upcoming';
    if (cricMatch.status?.toLowerCase().includes('completed')) status = 'completed';
    else if (cricMatch.status?.toLowerCase().includes('live')) status = 'live';

    const match: Match = {
      id: cricMatch.id,
      name: cricMatch.name,
      matchType: (cricMatch.matchType?.toLowerCase() as any) || 't20',
      status,
      venue: cricMatch.venue,
      startTime,
      team1: teams[0] || 'Team A',
      team2: teams[1] || 'Team B',
      seriesId: cricMatch.series_id || 'unknown',
      teams: [teams[0] || 'Team A', teams[1] || 'Team B'],
    };

    // Add score if available
    if (cricMatch.score) {
      match.score = {
        team1: {
          score: cricMatch.score.team1?.score,
          wickets: cricMatch.score.team1?.wickets,
          overs: cricMatch.score.team1?.overs,
        },
        team2: {
          score: cricMatch.score.team2?.score,
          wickets: cricMatch.score.team2?.wickets,
          overs: cricMatch.score.team2?.overs,
        },
      };
    }

    return match;
  } catch (error) {
    console.error('transformMatch error:', error);
    return null;
  }
}

/**
 * Get series by ID
 */
export async function getSeriesById(seriesId: string): Promise<any> {
  try {
    const response = await fetch(`${CRICAPI_BASE_URL}/series/${seriesId}`, {
      headers: {
        Authorization: `Bearer ${CRICAPI_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`CricAPI error: ${response.statusText}`);
    }

    const data: CricAPIResponse = await response.json();

    if (data.status !== 'success') {
      return null;
    }

    return data.data;
  } catch (error) {
    console.error('getSeriesById error:', error);
    return null;
  }
}

/**
 * Get all series
 */
export async function getAllSeries(): Promise<any[]> {
  try {
    const cached = matchCache.get('all_series');
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS * 3) {
      return cached.data as any[];
    }

    const response = await fetch(`${CRICAPI_BASE_URL}/series`, {
      headers: {
        Authorization: `Bearer ${CRICAPI_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`CricAPI error: ${response.statusText}`);
    }

    const data: CricAPIResponse = await response.json();

    if (data.status !== 'success' || !data.data) {
      return [];
    }

    const series = Array.isArray(data.data) ? data.data : [data.data];

    matchCache.set('all_series', {
      data: series as any, // CricAPIMatch[] - will be transformed to Match[] by caller
      timestamp: Date.now(),
    });

    return series as any;
  } catch (error) {
    console.error('getAllSeries error:', error);
    throw error;
  }
}

/**
 * Clear cache manually
 */
export function clearMatchCache(): void {
  matchCache.clear();
}

/**
 * Get cache status
 */
export function getCacheInfo(): { size: number; entries: string[] } {
  return {
    size: matchCache.size,
    entries: Array.from(matchCache.keys()),
  };
}
