/**
 * useCricketMatches Hook
 * Fetches and manages cricket match data with caching and real-time updates
 * @file hooks/useCricketMatches.ts
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAllMatches,
  getMatchById,
  getMatchesByStatus,
  getLiveMatches,
  getUpcomingMatches,
  type Match,
} from '@/lib/services/cricapi.service';

export interface UseCricketMatchesOptions {
  status?: 'upcoming' | 'live' | 'completed' | 'all';
  matchType?: 'odi' | 't20' | 'test';
  seriesId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseCricketMatchesResult {
  matches: Match[];
  allMatches: Match[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  getMatchById: (id: string) => Match | undefined;
  filterByStatus: (status: 'upcoming' | 'live' | 'completed') => Match[];
  filterByType: (type: 'odi' | 't20' | 'test') => Match[];
}

/**
 * Hook for fetching cricket matches
 */
export function useCricketMatches(options: UseCricketMatchesOptions = {}): UseCricketMatchesResult {
  const {
    status = 'all',
    matchType,
    seriesId,
    autoRefresh = true,
    refreshInterval = status === 'live' ? 10000 : 300000, // 10s for live, 5min otherwise
  } = options;

  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch matches
   */
  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let matches: Match[] = [];

      if (status === 'all') {
        matches = await getAllMatches();
      } else if (status === 'live') {
        matches = await getLiveMatches();
      } else if (status === 'upcoming') {
        matches = await getUpcomingMatches();
      } else {
        matches = await getMatchesByStatus(status);
      }

      // Apply filters
      matches = matches.filter((m) => {
        if (matchType && m.matchType !== matchType) return false;
        if (seriesId && m.seriesId !== seriesId) return false;
        return true;
      });

      setAllMatches(matches);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch matches';
      setError(errorMessage);
      console.error('useCricketMatches fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [status, matchType, seriesId]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  /**
   * Auto-refresh
   */
  useEffect(() => {
    if (!autoRefresh) return;

    refreshTimeoutRef.current = setInterval(() => {
      fetchMatches();
    }, refreshInterval);

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchMatches]);

  /**
   * Get match by ID
   */
  const getMatch = useCallback(
    (id: string): Match | undefined => {
      return allMatches.find((m) => m.id === id);
    },
    [allMatches]
  );

  /**
   * Filter by status
   */
  const filterByStatus = useCallback(
    (filterStatus: 'upcoming' | 'live' | 'completed'): Match[] => {
      return allMatches.filter((m) => m.status === filterStatus);
    },
    [allMatches]
  );

  /**
   * Filter by type
   */
  const filterByType = useCallback(
    (type: 'odi' | 't20' | 'test'): Match[] => {
      return allMatches.filter((m) => m.matchType === type);
    },
    [allMatches]
  );

  /**
   * Manual refresh
   */
  const refresh = useCallback(async () => {
    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearInterval(refreshTimeoutRef.current);
    }

    await fetchMatches();

    // Restart auto-refresh if enabled
    if (autoRefresh) {
      refreshTimeoutRef.current = setInterval(() => {
        fetchMatches();
      }, refreshInterval);
    }
  }, [autoRefresh, refreshInterval, fetchMatches]);

  return {
    matches: allMatches,
    allMatches,
    loading,
    error,
    lastUpdated,
    refresh,
    getMatchById: getMatch,
    filterByStatus,
    filterByType,
  };
}

/**
 * Hook to get live matches with auto-refresh
 */
export function useLiveMatches() {
  return useCricketMatches({
    status: 'live',
    autoRefresh: true,
    refreshInterval: 10000, // 10 seconds for live
  });
}

/**
 * Hook to get upcoming matches
 */
export function useUpcomingMatches() {
  return useCricketMatches({
    status: 'upcoming',
    autoRefresh: true,
    refreshInterval: 600000, // 10 minutes
  });
}

/**
 * Hook to get specific match with polling
 */
export function useMatchDetails(matchId: string) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const foundMatch = await getMatchById(matchId);
      setMatch(foundMatch);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch match';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchMatch();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMatch, 30000);
    return () => clearInterval(interval);
  }, [fetchMatch]);

  return { match, loading, error, refresh: fetchMatch };
}
