/**
 * ============================================================================
 * SYSTEM INITIALIZER - AUTO-STARTS ON APP LOAD
 * ============================================================================
 * 
 * This file auto-initializes UNIFIED_MASTER when the app starts.
 * No manual initialization needed - everything works automatically.
 */

import UNIFIED_MASTER from './UNIFIED_MASTER';

// Global system state
let systemInitialized = false;
let systemError: Error | null = null;
let initializationPromise: Promise<boolean> | null = null;

/**
 * AUTO-INITIALIZE THE SYSTEM (runs once when module loads)
 */
async function autoInitializeSystem(): Promise<boolean> {
  // Only initialize once
  if (systemInitialized || initializationPromise) {
    return initializationPromise || Promise.resolve(systemInitialized);
  }

  initializationPromise = (async () => {
    try {
      console.log('🚀 Starting Unified Master System...');
      
      const success = await UNIFIED_MASTER.initialize();
      
      if (success) {
        systemInitialized = true;
        console.log('✅ System fully initialized and ready');
        
        // Log capabilities on startup
        const health = UNIFIED_MASTER.getSystemHealth();
        console.log(`📊 Active systems: ${health.initializedSystems.join(', ')}`);
        console.log(`📈 Status: ${health.status}`);
        
        return true;
      } else {
        throw new Error('System initialization returned false');
      }
    } catch (error) {
      systemError = error as Error;
      console.error('❌ System initialization failed:', error);
      
      // Attempt recovery
      try {
        console.log('🔄 Attempting automatic recovery...');
        await new Promise(r => setTimeout(r, 1000));
        const retry = await UNIFIED_MASTER.initialize();
        if (retry) {
          systemInitialized = true;
          systemError = null;
          console.log('✅ Recovery successful');
          return true;
        }
      } catch (recoveryError) {
        console.error('❌ Recovery failed:', recoveryError);
      }
      
      return false;
    }
  })();

  return initializationPromise;
}

/**
 * GET SYSTEM STATUS (use this to check if ready)
 */
export function getSystemStatus(): {
  initialized: boolean;
  error: Error | null;
  ready: boolean;
  system: typeof UNIFIED_MASTER;
} {
  return {
    initialized: systemInitialized,
    error: systemError,
    ready: systemInitialized && !systemError,
    system: UNIFIED_MASTER,
  };
}

/**
 * ENSURE SYSTEM IS INITIALIZED (call before using)
 */
export async function ensureSystemReady(): Promise<boolean> {
  if (systemInitialized && !systemError) return true;
  
  const success = await autoInitializeSystem();
  return success && systemInitialized && !systemError;
}

/**
 * FORCE RESET & REINITIALIZE (for emergencies)
 */
export async function resetSystem(): Promise<boolean> {
  systemInitialized = false;
  systemError = null;
  initializationPromise = null;
  return autoInitializeSystem();
}

/**
 * AUTO-START ON IMPORT
 * This runs immediately when this module is loaded
 */
if (typeof window !== 'undefined') {
  // Browser environment - start on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitializeSystem);
  } else {
    // Already loaded
    autoInitializeSystem();
  }
}

// Export the main system
export default UNIFIED_MASTER;
export * from './UNIFIED_MASTER';
