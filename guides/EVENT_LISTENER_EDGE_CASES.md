# Event Listener Edge Cases

**Deduplication, ordering guarantees, reconnection, memory leaks, race conditions** — All scenarios documented

---

## Core Principle

Event listeners are the backbone of real-time updates. But they can fail silently:
- Event fires twice (user sees duplicate notification)
- Events arrive out of order (leaderboard shows wrong ranking)
- RPC disconnects (listener stops, user doesn't know)
- Component unmounts while listening (memory leak)
- Multiple components listen to same event (conflicting handlers)

---

## Edge Case 1: Duplicate Events (Same Event Fires Twice)

### When This Happens

```
Blockchain emits event: "Staked(matchId=1, amount=0.5, address=0x123)"
  ├─ Event propagates to public RPC node 1
  │   └─> InfinityWall hears it → calls refetchWall()
  │
  └─> Event propagates to public RPC node 2 (data resilience)
      └─> InfinityWall hears it again → calls refetchWall() again
      
Result: refetchWall() called TWICE for same stake
```

### Without Deduplication

```javascript
// ❌ BROKEN: No deduplication
publicClient.watchContractEvent({
  eventName: "Staked",
  onLogs: (logs) => {
    logs.forEach(log => {
      refetchWall(); // Called once per event, but events may duplicate
    });
  }
});

// User sees: 
// Toast: "Leaderboard updated ✓"
// Toast: "Leaderboard updated ✓" (duplicate!)
// Console: "Refetching..." (twice)
```

### With Deduplication

```javascript
// ✅ CORRECT: Deduplicate using event signature
const seenEventsRef = useRef(new Set());

useEffect(() => {
  if (!publicClient) return;
  
  const unsub = publicClient.watchContractEvent({
    address: MARKET_ADDRESS,
    abi: MARKET_ABI,
    eventName: "Staked",
    onLogs: (logs) => {
      logs.forEach(log => {
        // Create signature: "matchId_pillarId_addresss_txHash"
        const signature = `${log.args.matchId}_${log.args.pillarId}_${log.args.address}_${log.transactionHash}`;
        
        if (seenEventsRef.current.has(signature)) {
          return; // Already processed, skip
        }
        
        seenEventsRef.current.add(signature);
        refetchWall(); // Only called once per unique event
      });
    }
  });
  
  // Cleanup old signatures (prevent memory leak)
  const cleanupInterval = setInterval(() => {
    if (seenEventsRef.current.size > 1000) {
      seenEventsRef.current.clear(); // Clear after reaching 1000 events
    }
  }, 300000); // Every 5 minutes
  
  return () => {
    unsub?.();
    clearInterval(cleanupInterval);
  };
}, [publicClient, refetchWall]);
```

### Why Use txHash in Signature?

```javascript
// Event data
{
  args: { matchId: 1, pillarId: 0, address: "0x123", amount: 0.5 },
  transactionHash: "0xabc123...",
  blockNumber: 12345,
}

// Signature combinations:
1. matchId + pillarId + address + amount:
   ❌ WRONG: What if user stakes EXACT same amount twice?
   └─> Two different txs, same args → Deduplicated incorrectly

2. matchId + pillarId + address + txHash:
   ✅ CORRECT: txHash is unique per transaction
   └─> Even if exact same args, different tx = different hash

3. blockNumber + transactionIndex:
   ✅ ALSO CORRECT: On-chain position is unique
   └─> But txHash is easier to understand
```

---

## Edge Case 2: Events Arriving Out of Order

### When This Happens

```
T0: Block 100: Player A stakes $10 (new leader)
T1: Block 101: Player B stakes $15 (new leader)
T2: RPC node processes events

Scenario 1 (Correct Order):
  - Event from block 100 arrives
  - Event from block 101 arrives
  - Leaderboard: [B: $15, A: $10] ✅

Scenario 2 (Out of Order):
  - Event from block 101 arrives (RPC slow)
  - Event from block 100 arrives
  - Leaderboard: [A: $10, B: $15] ❌ (reversed!)
```

### Without Ordering Guarantee

```javascript
// ❌ BROKEN: No ordering
const [leaderboard, setLeaderboard] = useState([]);

publicClient.watchContractEvent({
  eventName: "Staked",
  onLogs: (logs) => {
    // Just append events as they arrive
    const newLeaderboard = [...leaderboard];
    logs.forEach(log => {
      newLeaderboard.push({ 
        address: log.args.address, 
        amount: log.args.amount 
      });
    });
    setLeaderboard(newLeaderboard);
  }
});
// If events out of order → leaderboard is wrong
```

### With Ordering Guarantee

```javascript
// ✅ CORRECT: Refetch from contract instead of updating manually
publicClient.watchContractEvent({
  eventName: "Staked",
  onLogs: (logs) => {
    // Don't try to update leaderboard based on event args
    // Instead, refetch entire leaderboard from contract
    refetchWall(); // Contract getter sorts by total contribution (order is authoritative)
  }
});
```

**Why This Works**:
- Leaderboard is a getter that sorts by total contribution
- Can't get "out of order" if you fetch from authoritative source
- Event just triggers a refresh, doesn't update state directly

---

## Edge Case 3: RPC Disconnects, Listener Stops

### When This Happens

```
Setup:
  const unsub = publicClient.watchContractEvent({...});
  
T0: Listener active, receiving events
T1: RPC node goes down or network unstable
T2: Listener stops receiving events silently
T3: User sees "last update 5 minutes ago" (stale data)
T4: User doesn't know RPC is down
```

### Without Reconnect Logic

```javascript
// ❌ BROKEN: Silent failure
useEffect(() => {
  const unsub = publicClient.watchContractEvent({
    eventName: "Staked",
    onLogs: () => refetchWall()
  });
  return () => unsub?.();
}, [publicClient, refetchWall]);

// If RPC dies:
// - No error thrown
// - No console warning
// - Component just stops updating
// - User unaware
```

### With Reconnect Logic

```javascript
// ✅ CORRECT: Detect disconnect, show warning, auto-retry
const [rpcHealth, setRpcHealth] = useState('connected');
const healthCheckIntervalRef = useRef(null);

useEffect(() => {
  if (!publicClient) return;
  
  const unsub = publicClient.watchContractEvent({
    eventName: "Staked",
    onLogs: () => {
      refetchWall();
      setRpcHealth('connected'); // Update health on success
    }
  });
  
  // Health check: Try to read from contract every 30 seconds
  healthCheckIntervalRef.current = setInterval(async () => {
    try {
      await publicClient.getBlockNumber();
      if (rpcHealth === 'down') {
        setRpcHealth('connected'); // Recovered!
        refetchWall(); // Refresh data after reconnect
      }
    } catch (error) {
      setRpcHealth('down');
      setToast({ 
        type: 'warning', 
        message: '⚠️ Real-time updates paused (network issue)' 
      });
    }
  }, 30000);
  
  return () => {
    unsub?.();
    clearInterval(healthCheckIntervalRef.current);
  };
}, [publicClient, refetchWall, rpcHealth]);

// Show indicator in UI
{rpcHealth === 'down' && (
  <div className="text-red-400 text-sm">
    🔴 Real-time updates paused
  </div>
)}
```

---

## Edge Case 4: Memory Leak from Cleanup

### When This Happens

```
PoolCard mounts
  └─> watchContractEvent starts listening
  
PoolCard unmounts
  └─> useEffect cleanup runs
  └─> unsub?.() should be called
  └─> Listener should stop
  
If unsub() not called:
  ├─ Listener keeps running in background
  ├─ Memory increases over time
  ├─ If user navigates to pool 100 times:
  │  └─> 100 active listeners = 💥 memory leak
```

### Without Cleanup

```javascript
// ❌ BROKEN: Memory leak
useEffect(() => {
  publicClient.watchContractEvent({
    eventName: "Staked",
    onLogs: () => refetchWall()
  });
  // Missing: return () => unsub?.();
}, [publicClient, refetchWall]);

// User navigates:
// Pool → Home → Pool → Home → (5 times)
// Result: 5 active listeners, memory keeps growing
```

### With Cleanup

```javascript
// ✅ CORRECT: Cleanup prevents memory leak
useEffect(() => {
  const unsub = publicClient.watchContractEvent({
    eventName: "Staked",
    onLogs: () => refetchWall()
  });
  
  return () => unsub?.(); // Called when component unmounts or deps change
}, [publicClient, refetchWall]);

// User navigates:
// Pool → Home (unsub called on unmount)
// Pool → Home (unsub called on unmount)
// Pool → Home (unsub called on unmount)
// Result: Only 1 active listener at a time
```

### Testing for Memory Leaks

```javascript
test('listener cleans up on unmount', () => {
  const unsub = jest.fn();
  jest.spyOn(publicClient, 'watchContractEvent').mockReturnValue(unsub);
  
  const { unmount } = render(<PoolCard />);
  
  expect(unsub).not.toHaveBeenCalled();
  
  unmount();
  
  expect(unsub).toHaveBeenCalled(); // Listener stopped
});
```

---

## Edge Case 5: Multiple Components Listening to Same Event

### When This Happens

```
PoolCard mounts
  ├─> watchContractEvent("Staked") → refetchPool()
  └─> watchContractEvent("Staked") → refetchWall()

MatchCenter mounts
  └─> watchContractEvent("Staked") → refetchMatches()

InfinityWall mounts
  └─> watchContractEvent("Staked") → refetchWall()

Event fires: "Staked"
  ├─> PoolCard refetchPool()
  ├─> PoolCard refetchWall()
  ├─> MatchCenter refetchMatches()
  └─> InfinityWall refetchWall()
  
Result: 4 simultaneous contract reads (wasteful)
```

### Without Coordination

```javascript
// ❌ INEFFICIENT: Each component fetches independently
// PoolCard.jsx
useEffect(() => {
  const unsub = publicClient.watchContractEvent({
    eventName: "Staked",
    onLogs: () => {
      refetchPool(); // Contract read
      refetchWall(); // Contract read
    }
  });
  return () => unsub?.();
}, [publicClient]);

// InfinityWall.jsx
useEffect(() => {
  const unsub = publicClient.watchContractEvent({
    eventName: "Staked",
    onLogs: () => {
      refetchWall(); // Contract read (DUPLICATE)
    }
  });
  return () => unsub?.();
}, [publicClient]);
```

### With Deduplication (Batched Refetch)

```javascript
// ✅ BETTER: Event triggers one batched refetch
// At app level (e.g., in _app.js or top-level context)

const EventManager = ({ children }) => {
  const pendingRefetchRef = useRef(new Set());
  const batchTimeoutRef = useRef(null);
  
  const enqueuRefetch = useCallback((type) => {
    pendingRefetchRef.current.add(type);
    
    // Clear old timer
    clearTimeout(batchTimeoutRef.current);
    
    // Set new timer: wait 100ms for all refetches to queue, then batch
    batchTimeoutRef.current = setTimeout(async () => {
      const types = Array.from(pendingRefetchRef.current);
      pendingRefetchRef.current.clear();
      
      // Emit one event for all pending refetches
      window.dispatchEvent(new CustomEvent('batchRefetch', { 
        detail: { types } // ['pool', 'wall', 'matches']
      }));
    }, 100);
  }, []);
  
  useEffect(() => {
    const unsub = publicClient.watchContractEvent({
      eventName: "Staked",
      onLogs: () => {
        // Queue all affected data sources
        enqueuRefetch('pool');
        enqueuRefetch('wall');
        enqueuRefetch('matches');
        // After 100ms, single refetch batched
      }
    });
    return () => unsub?.();
  }, [publicClient, enqueuRefetch]);
  
  return (
    <EventContext.Provider value={{ enqueueRefetch }}>
      {children}
    </EventContext.Provider>
  );
};
```

Or simpler: Use context instead of events

```javascript
// ✅ SIMPLEST: Use React Context to share refetch trigger
import { createContext, useCallback } from 'react';

const RefetchContext = createContext();

export const RefetchProvider = ({ children }) => {
  const refetchTimerRef = useRef(null);
  const [refetchKey, setRefetchKey] = useState(0);
  
  const triggerRefetch = useCallback(() => {
    // Debounce: if called multiple times quickly, only refetch once
    clearTimeout(refetchTimerRef.current);
    refetchTimerRef.current = setTimeout(() => {
      setRefetchKey(k => k + 1); // Bump key to trigger all refetch deps
    }, 100);
  }, []);
  
  return (
    <RefetchContext.Provider value={{ refetchKey, triggerRefetch }}>
      {children}
    </RefetchContext.Provider>
  );
};

// In each component
const { refetchKey, triggerRefetch } = useContext(RefetchContext);

useEffect(() => {
  const unsub = publicClient.watchContractEvent({
    eventName: "Staked",
    onLogs: () => triggerRefetch() // Central trigger
  });
  return () => unsub?.();
}, [publicClient, triggerRefetch]);

// Data dependency re-fetches when refetchKey changes
const { data: poolData, refetch } = useReadContract({
  // ... other options
  queryKey: ['pool', refetchKey] // Refetch when key changes
});
```

---

## Edge Case 6: Event Filter Chain (Complex Filtering)

### When This Happens

```
Event fires: "Staked(matchId=1, pillarId=0, amount=0.5)"
PoolCard only cares about matchId=1, pillarId=0
Other pools' events should not trigger refetch
```

### Without Filtering

```javascript
// ❌ INEFFICIENT: Refetch for EVERY Staked event
publicClient.watchContractEvent({
  eventName: "Staked",
  onLogs: (logs) => {
    logs.forEach(() => {
      refetchPool(); // Refetches even if this stake is for different pool
    });
  }
});
```

### With Filtering

```javascript
// ✅ CORRECT: Only refetch if event is for THIS pool
publicClient.watchContractEvent({
  address: MARKET_ADDRESS,
  abi: MARKET_ABI,
  eventName: "Staked",
  onLogs: (logs) => {
    const isRelevant = logs.some(log => 
      log.args.matchId === matchId && 
      log.args.pillarId === pillarId
    );
    if (isRelevant) {
      refetchPool(); // Only refetch if relevant
    }
  }
});

// Better: Use contract event filters (more efficient)
publicClient.watchContractEvent({
  address: MARKET_ADDRESS,
  abi: MARKET_ABI,
  eventName: "Staked",
  args: {
    matchId: matchId, // Filter by matchId
    pillarId: pillarId, // Filter by pillarId
  },
  onLogs: () => {
    refetchPool(); // Already filtered by contract
  }
});
```

---

## Edge Case 7: User Switches Chains, Listeners Still Active

### When This Happens

```
User connected to WireFluid (chain 92533)
  └─> watchContractEvent listening on WireFluid

User switches to Ethereum in MetaMask
  └─> But PoolCard is still watching WireFluid events
  └─> Events still fire but wrong chain
  └─> Leaderboard updates but user is on wrong network
```

### Without Chain Guard

```javascript
// ❌ BROKEN: No chain validation
useEffect(() => {
  const unsub = publicClient.watchContractEvent({
    eventName: "Staked",
    onLogs: () => refetchWall() // Fires even if user switched chains
  });
  return () => unsub?.();
}, [publicClient, refetchWall]);
```

### With Chain Guard

```javascript
// ✅ CORRECT: Stop listening if user switches chains
const { chain } = useNetwork();

useEffect(() => {
  if (chain?.id !== WIRE_CHAIN_ID) {
    return; // Don't set up listener if wrong chain
  }
  
  const unsub = publicClient.watchContractEvent({
    eventName: "Staked",
    onLogs: () => refetchWall()
  });
  
  return () => unsub?.();
}, [publicClient, refetchWall, chain?.id]);

// Or warn user
{chain?.id !== WIRE_CHAIN_ID && (
  <div className="text-red-400">
    ⚠️ Switch to WireFluid to see real-time updates
  </div>
)}
```

---

## Edge Case 8: Wallet Disconnects While Listening

### When This Happens

```
User connected wallet
  └─> Listener active

User clicks MetaMask "disconnect"
  └─> address becomes undefined
  └─> But listener still active and event fires
  └─> Leaderboard still updates (doesn't need wallet address, OK)
```

### Dependent Listeners

```javascript
// If listener depends on user being connected:
const { address, isConnected } = useAccount();

useEffect(() => {
  if (!isConnected) return; // Don't listen if disconnected
  
  const unsub = publicClient.watchContractEvent({
    eventName: "PlayerTipped",
    args: { tipper: address }, // Filter for this user
    onLogs: () => {
      // Recalculate user stats
      refetchUserStats();
    }
  });
  
  return () => unsub?.();
}, [publicClient, address, isConnected]);

// Independent listeners (don't depend on user state)
useEffect(() => {
  const unsub = publicClient.watchContractEvent({
    eventName: "Staked",
    onLogs: () => {
      refetchWall(); // Leaderboard doesn't require connection
    }
  });
  return () => unsub?.();
}, [publicClient]);
```

---

## Edge Case 9: Race: Event Fires Before Component Ready

### When This Happens

```
T0: User navigates to /pool/1
T1: PoolCard mounts
T2: useEffect sets up listener
T3: RACE CONDITION:
    └─> Event "Staked" fires (T3.5ms)
    └─> But refetchPool not defined yet
    └─> Error: "refetchPool is not a function"
```

### Without Guard

```javascript
// ❌ BROKEN: Can crash if event fires during mount
useEffect(() => {
  const unsub = publicClient.watchContractEvent({
    eventName: "Staked",
    onLogs: () => {
      refetchPool(); // Could be undefined if called too early
    }
  });
  return () => unsub?.();
}, [publicClient]); // Missing refetchPool dependency!
```

### With Guard

```javascript
// ✅ CORRECT: Include all dependencies, guard against undefined
useEffect(() => {
  if (!publicClient || !refetchPool) return; // Guard
  
  const unsub = publicClient.watchContractEvent({
    eventName: "Staked",
    onLogs: () => {
      if (refetchPool) refetchPool(); // Extra guard
    }
  });
  
  return () => unsub?.();
}, [publicClient, refetchPool]); // Complete dependencies
```

---

## Edge Case 10: Backpressure: Events Fire Faster Than Refetch

### When This Happens

```
Normal: "Staked" fires → refetchPool() takes 2s → Done
  └─> New event can come in

High load: Events fire every 500ms
  └─> refetchPool() takes 2s
  └─> Before refetch finishes, 3 more events fire
  └─> Queue builds up: refetch, refetch, refetch, refetch
  └─> Memory usage spikes
```

### Without Backpressure Handling

```javascript
// ❌ BROKEN: Each event starts new refetch, no queueing
publicClient.watchContractEvent({
  eventName: "Staked",
  onLogs: () => {
    refetchPool(); // Waits 2s, but more events come immediately
  }
});
```

### With Backpressure Handling

```javascript
// ✅ CORRECT: Debounce to prevent cascade
const debouncedRefetchRef = useRef(null);

useEffect(() => {
  const unsub = publicClient.watchContractEvent({
    eventName: "Staked",
    onLogs: () => {
      // Clear old debounce timer
      clearTimeout(debouncedRefetchRef.current);
      
      // Set new timer: wait 100ms for multiple events to batch
      debouncedRefetchRef.current = setTimeout(() => {
        refetchPool(); // Only called once per 100ms
      }, 100);
    }
  });
  
  return () => {
    unsub?.();
    clearTimeout(debouncedRefetchRef.current);
  };
}, [publicClient, refetchPool]);
```

---

## Summary Checklist: Event Listener Best Practices

- [ ] Always call cleanup function: `return () => unsub?.()`
- [ ] Deduplicate events using txHash in signature
- [ ] Refetch from contract (don't update state directly) to ensure ordering
- [ ] Check RPC health periodically (30s interval)
- [ ] Filter events to only relevant ones (matchId, pillarId, etc.)
- [ ] Don't listen if data not applicable (user disconnected, wrong chain)
- [ ] Batch refetches with debounce (100ms)
- [ ] Include all dependencies in useEffect
- [ ] Test cleanup with unmount scenario
- [ ] Handle backpressure: don't let event queue explode

---

## Testing Event Listeners

```javascript
test('listener cleans up on unmount', () => {
  const unsub = jest.fn();
  jest.spyOn(publicClient, 'watchContractEvent').mockReturnValue(unsub);
  
  const { unmount } = render(<InfinityWall publicClient={publicClient} />);
  expect(unsub).not.toHaveBeenCalled();
  
  unmount();
  expect(unsub).toHaveBeenCalled();
});

test('deduplicates duplicate events', async () => {
  const refetch = jest.fn();
  render(<PoolCard refetch={refetch} />);
  
  fireEvent('Staked', { 
    matchId: 1, 
    transactionHash: '0xabc' 
  });
  fireEvent('Staked', { 
    matchId: 1, 
    transactionHash: '0xabc' // Same event
  });
  
  await waitFor(() => {
    expect(refetch).toHaveBeenCalledTimes(1); // Only once
  });
});

test('filters events by pool', async () => {
  const refetch = jest.fn();
  render(<PoolCard matchId={1} refetch={refetch} />);
  
  fireEvent('Staked', { matchId: 1 }); // Relevant
  fireEvent('Staked', { matchId: 2 }); // Not relevant
  
  await waitFor(() => {
    expect(refetch).toHaveBeenCalledTimes(1); // Only pool 1's event
  });
});
```

