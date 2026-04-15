/**
 * ============================================================================
 * USEUNIFIEDMASTER - PRODUCTION REACT HOOK
 * ============================================================================
 * 
 * Custom hook that handles the unified master system with:
 * - Auto-initialization on first use
 * - Error boundaries
 * - Automatic retry with exponential backoff
 * - Loading states
 * - Proper cleanup
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { ensureSystemReady, getSystemStatus } from './SystemInitializer';
import UNIFIED_MASTER from './UNIFIED_MASTER';

interface UseUnifiedMasterReturn {
  // System state
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
  systemHealth: any;

  // Query methods
  processQuery: (query: string, userId: string, options?: any) => Promise<any>;
  queryKnowledge: (domain: string, topic: string) => Promise<any>;

  // Security methods
  authenticateUser: (userId: string) => Promise<string | null>;
  validateSession: (sessionId: string) => Promise<boolean>;

  // System methods
  resetSystem: () => Promise<void>;
  getCapabilities: () => any;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function useUnifiedMaster(): UseUnifiedMasterReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  // Initialize system on mount
  useEffect(() => {
    let isMounted = true;
    isMountedRef.current = true;

    const initializeWithRetry = async () => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          setIsLoading(true);
          const ready = await ensureSystemReady();

          if (ready && isMounted) {
            const status = getSystemStatus();
            setIsReady(true);
            setError(null);
            setSystemHealth(UNIFIED_MASTER.getSystemHealth());
            retryCountRef.current = 0;
            setIsLoading(false);
            return;
          }
        } catch (err) {
          lastError = err as Error;
          if (attempt < MAX_RETRIES - 1) {
            await new Promise(r => setTimeout(r, RETRY_DELAY * Math.pow(2, attempt)));
          }
        }
      }

      if (isMounted) {
        setIsReady(false);
        setError(lastError || new Error('System failed to initialize'));
        setIsLoading(false);
      }
    };

    initializeWithRetry();

    return () => {
      isMounted = false;
      isMountedRef.current = false;
    };
  }, []);

  // Process query with error handling
  const processQuery = useCallback(
    async (query: string, userId: string, options?: any) => {
      if (!isReady) {
        const ready = await ensureSystemReady();
        if (!ready) {
          throw new Error('System not initialized');
        }
      }

      try {
        const result = await UNIFIED_MASTER.processQuery(query, userId, options);
        if (isMountedRef.current) {
          setError(null);
        }
        return result;
      } catch (err) {
        const queryError = err as Error;
        if (isMountedRef.current) {
          setError(queryError);
        }
        throw queryError;
      }
    },
    [isReady]
  );

  // Query knowledge
  const queryKnowledge = useCallback(async (domain: string, topic: string) => {
    if (!isReady) {
      const ready = await ensureSystemReady();
      if (!ready) throw new Error('System not initialized');
    }

    return UNIFIED_MASTER.queryKnowledge(domain, topic);
  }, [isReady]);

  // Authenticate user
  const authenticateUser = useCallback(async (userId: string) => {
    if (!isReady) {
      const ready = await ensureSystemReady();
      if (!ready) throw new Error('System not initialized');
    }

    return UNIFIED_MASTER.authenticateUser(userId);
  }, [isReady]);

  // Validate session
  const validateSession = useCallback(async (sessionId: string) => {
    if (!isReady) {
      const ready = await ensureSystemReady();
      if (!ready) throw new Error('System not initialized');
    }

    return UNIFIED_MASTER.validateSession(sessionId);
  }, [isReady]);

  // Reset system
  const resetSystem = useCallback(async () => {
    setIsLoading(true);
    try {
      const { resetSystem: resetFn } = await import('./SystemInitializer');
      await resetFn();
      setIsReady(true);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      const resetError = err as Error;
      if (isMountedRef.current) {
        setError(resetError);
        setIsLoading(false);
      }
    }
  }, []);

  // Get capabilities
  const getCapabilities = useCallback(() => {
    return UNIFIED_MASTER.getCapabilities();
  }, []);

  return {
    isReady,
    isLoading,
    error,
    systemHealth,
    processQuery,
    queryKnowledge,
    authenticateUser,
    validateSession,
    resetSystem,
    getCapabilities,
  };
}

export default useUnifiedMaster;
