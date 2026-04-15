# Cache Invalidation Strategy

**When to refetch pool data, user stakes, leaderboard** — Race conditions, localStorage, stale data prevention

---

## Core Principle

**Cache is stale if**: The on-chain state changed but UI is still showing old value.

**Sources of staleness**:
1. User performs action (stake) → blockchain updates → UI doesn't know yet
2. Another tab/window stakes → blockchain updates → this tab doesn't know yet
3. Time passes (server updated prices, etc.) → stale data still showing
4. Network disconnects → can't refetch → showing cached old data

---

## Refetch Triggers: Decision Matrix

| Event | Pool Data | User Stakes | Leaderboard | How |
|-------|----------|-------------|-------------|-----|
| **User stakes successfully** | ✅ Refetch | ✅ Refetch | ✅ Refetch | Manual invalidation |
| **InfinityWallUpdated event fires** | ✅ Refetch | — | ✅ Auto-update | Event listener |
| **Staked event fires** | ✅ Refetch | — | ✅ Auto-update | Event listener |
| **PlayerTipped event fires** | ✅ Refetch | — | ✅ Auto-update | Event listener |
| **Manual refresh button clicked** | ✅ Refetch | ✅ Refetch | ✅ Refetch | User triggered |
| **networkBusy resets (7s timer)** | ✅ Refetch | — | ✅ Refetch | Timeout cleanup |
| **Tab regains focus** | ✅ Refetch | ✅ Refetch | — | Visibility change (optional) |
| **Page navigation** | — | — | — | useEffect cleanup |

---

## 1. Pool Data Refetching

### Pool Data: What Gets Cached

```javascript
// From PSLImpactMarket.getPool(matchId, pillarId)
{
  totalStaked: 45.5,       // Accumulates with each stake
  minStakAmount: 0.1,      // Static (doesn't change)
  maxStakAmount: 100,      // Static
  isOpen: true,            // Changes when match ends
  rewardMultiplier: 2.5,   // Static
  totalRewards: 112.5,     // Accumulates with stakesRewards
}
```

### What Changes & When

| Field | Changes When | Refetch |
|-------|---|---|
| totalStaked | Anyone stakes OR tips | ✅ Yes (event) |
| isOpen | Match ends (admin action) | ✅ Yes (3min poll) |
| rewardMultiplier | Admin updates | ✅ Yes (3min poll) |
| totalRewards | Anyone tips | ✅ Yes (event) |
| minStakAmount | Admin updates | ✅ Yes (3min poll) |

### Implementation: PoolCard.jsx

```javascript
const PoolCard = ({ matchId, pillarId, externalPoolData, infinityWallRef }) => {
  // 1. Fetch pool data (or use pre-fetched)
  const { data: fetchedPoolData, refetch: refetchPool } = useReadContract({
    address: MARKET_ADDRESS,
    abi: MARKET_ABI,
    functionName: "getPool",
    args: [BigInt(matchId), pillarId],
    enabled: matchId && !externalPoolData, // Only fetch if not provided
    query: {
      staleTime: 120000, // Cache for 2 min (balance between freshness & load)
      refetchInterval: false, // Don't poll (use events instead)
    }
  });

  const poolData = externalPoolData ?? fetchedPoolData; // Prefer external if provided
  
  // 2. Listen for events that invalidate pool
  useEffect(() => {
    if (!publicClient) return;
    
    // When someone stakes → pool total increases
    const unsubStaked = publicClient.watchContractEvent({
      address: MARKET_ADDRESS,
      abi: MARKET_ABI,
      eventName: "Staked",
      onLogs: (logs) => {
        // Check if event is for THIS pool
        const isThisPool = logs.some(log => 
          log.args.matchId === matchId && log.args.pillarId === pillarId
        );
        if (isThisPool) {
          refetchPool(); // Refetch pool data
          infinityWallRef?.current?.refetchWall?.(); // Also refetch leaderboard
        }
      }
    });
    
    // When someone tips → rewardMultiplier or totalRewards might change
    const unsubTipped = publicClient.watchContractEvent({
      address: MARKET_ADDRESS,
      abi: MARKET_ABI,
      eventName: "PlayerTipped",
      onLogs: (logs) => {
        const isThisPool = logs.some(log => 
          log.args.matchId === matchId && log.args.pillarId === pillarId
        );
        if (isThisPool) {
          refetchPool();
        }
      }
    });
    
    return () => {
      unsubStaked?.();
      unsubTipped?.();
    };
  }, [matchId, pillarId, publicClient, refetchPool]);
  
  // 3. Manual refresh button (for user to force refetch)
  const handleRefresh = useCallback(() => {
    refetchPool();
    infinityWallRef?.current?.refetchWall?.();
  }, [refetchPool]);
};
```

---

## 2. User Stakes Data Refetching

### User Stakes: What Gets Cached

```javascript
// From useReadContract({ functionName: "getUserStakes", args: [address] })
// Returns: array of { matchId, pillarId, amount, timestamp }

[
  { matchId: 1, pillarId: 0, amount: 0.5, timestamp: 123456 },
  { matchId: 2, pillarId: 2, amount: 1.0, timestamp: 123450 },
  // ... all stakes from this address
]
```

### What Changes & When

| Event | Change | Refetch |
|-------|--------|---------|
| User stakes → New entry added | ✅ Yes | Immediately |
| User tips → Doesn't add stake, but shows in history | — | N/A |
| Admin closes pool | ✅ Stake becomes "unclaimed" | Periodic (3min) |

### Implementation

```javascript
// In PoolCard.jsx
const { address, isConnected } = useAccount();

const { data: userStakes, refetch: refetchUserStakes } = useReadContract({
  address: MARKET_ADDRESS,
  abi: MARKET_ABI,
  functionName: "getUserStakes",
  args: [address],
  enabled: isConnected && address,
  query: {
    staleTime: 60000, // Cache for 1 min
    refetchInterval: false, // No polling
  }
});

// After successful stake, refetch
useEffect(() => {
  if (isSuccess && txHash) {
    // Wait for transaction to be confirmed (2-5s)
    setTimeout(() => {
      refetchUserStakes();
      refetchPool();
    }, 3000);
  }
}, [isSuccess, txHash, refetchUserStakes, refetchPool]);
```

---

## 3. Leaderboard Data Refetching

### Leaderboard: What Gets Cached

```javascript
// From InfinityWall (top 10 contributors)
// Fetched from: contract.InfinityWall getter

[
  { address: "0x123...", totalContribution: 15.5, ranking: 1 },
  { address: "0x456...", totalContribution: 12.3, ranking: 2 },
  // ... top 10
]
```

### What Changes & When

| Event | Change | Refetch |
|-------|--------|---------|
| Anyone stakes OR tips | Top 10 rankings shift | ✅ Yes (event) |
| Leaderboard reset (e.g., daily) | All data clears | ✅ Yes (periodic) |
| User joins a new address | New address might enter top 10 | ✅ Yes (event) |

### Implementation: InfinityWall.jsx

```javascript
const InfinityWall = forwardRef(({ publicClient, MARKET_ADDRESS }, ref) => {
  const { data: wallAddresses, refetch: refetchWall } = useReadContract({
    address: MARKET_ADDRESS,
    abi: MARKET_ABI,
    functionName: "getInfinityWall",
    enabled: !!publicClient,
    query: {
      staleTime: 0, // Don't cache (always fresh from contract)
      refetchInterval: false, // No polling
    }
  });

  // Event: Someone staked → wallet moved up leaderboard
  useEffect(() => {
    if (!publicClient) return;
    
    const unsub = publicClient.watchContractEvent({
      address: MARKET_ADDRESS,
      abi: MARKET_ABI,
      eventName: "Staked",
      onLogs: () => {
        refetchWall(); // Refetch immediately
      }
    });
    
    return () => unsub?.();
  }, [publicClient, refetchWall]);

  // Expose refetch to parent (PoolCard calls this after stake)
  useImperativeHandle(ref, () => ({
    refetchWall
  }), [refetchWall]);

  return <div>{renderLeaderboard(wallAddresses)}</div>;
});
```

---

## 4. Race Conditions & Prevention

### Race Condition 1: User Stakes, Then Immediately Clicks Refresh

```
T0: User stakes 0.5 WIRE
T1: executeStake() sends tx
T2: User clicks "Refresh" button immediately (before tx confirmed)
T3: refetchPool() runs but tx still pending
T4: Pool data hasn't updated yet (still wrong)
T5: User sees "refresh didn't work"

Fix: Block refresh button until tx confirmed
```

```javascript
const [isRefreshing, setIsRefreshing] = useState(false);

const handleRefresh = useCallback(async () => {
  if (isRefreshing || isPending) return; // Don't refresh if pending
  setIsRefreshing(true);
  try {
    await refetchPool();
    await infinityWallRef.current?.refetchWall?.();
  } finally {
    setIsRefreshing(false);
  }
}, [isRefreshing, isPending, refetchPool]);

<button onClick={handleRefresh} disabled={isRefreshing || isPending}>
  {isRefreshing ? "Refreshing..." : "Refresh"}
</button>
```

### Race Condition 2: Multiple Tabs, One Stakes

```
Tab A: User stakes 0.5 WIRE
  └─> Contract updates totalStaked from 10 to 10.5
  
Tab B: Showing cached poolData { totalStaked: 10 }
  └─> User doesn't know about Tab A's stake
  └─> Still shows old totalStaked: 10

Tab B doesn't refetch because:
  - No event listener (only Tab A has listener)
  - staleTime not expired yet (cache valid for 2 min)
  - No manual refresh
```

**Solution**: Listen for events in Tab B even if user doesn't interact

```javascript
// Both tabs should have event listeners
useEffect(() => {
  if (!publicClient) return;
  
  // This runs in ALL tabs
  const unsub = publicClient.watchContractEvent({
    eventName: "Staked",
    onLogs: () => {
      refetchPool(); // Both Tab A and B refetch
    }
  });
  
  return () => unsub?.();
}, [publicClient, refetchPool]);
```

### Race Condition 3: Refetch But Event Also Fires

```
T0: executeStake() completes on-chain
T1: Transaction confirmed
T2: User clicks "Refresh" manually
T3: refetchPool() called (manual)
T4: But event listener also fires (automatic)
T5: refetchPool() called again (event)
T6: Pool data fetched TWICE (wasteful)

Not a bug, but inefficient
```

**Solution**: Deduplicate refetch calls

```javascript
const refetchTimerRef = useRef(null);

const debouncedRefetch = useCallback(() => {
  clearTimeout(refetchTimerRef.current);
  refetchTimerRef.current = setTimeout(() => {
    refetchPool();
  }, 100); // Wait 100ms for all events to settle, then fetch once
}, [refetchPool]);

// Both manual and event-triggered call debouncedRefetch
const handleRefresh = () => debouncedRefetch();
publicClient.watchContractEvent({
  onLogs: () => debouncedRefetch()
});
```

---

## 5. localStorage Strategy: What Persists Where

### localStorage: Temporary User Preferences (NOT Stakes)

```javascript
// Save to localStorage
localStorage.setItem('walletAddress', userAddress);
localStorage.setItem('lastStakeAmount', '0.5');
localStorage.setItem('selectedPillarId', '0');

// Load on app start
const savedAddress = localStorage.getItem('walletAddress');
const savedAmount = localStorage.getItem('lastStakeAmount');
```

### What Should NOT Go in localStorage

```javascript
// ❌ WRONG: Storing stakes in localStorage
localStorage.setItem('userStakes', JSON.stringify(stakes));
// Problem: If user clears browser cache, stakes are gone (but on-chain stake is real!)
// localStorage is NOT source of truth

// ✅ CORRECT: Fetch stakes from contract
const { data: stakes } = useReadContract({
  functionName: "getUserStakes",
  args: [address]
});
// Stakes always come from contract (source of truth)
```

### localStorage Use Cases

| Data | localStorage? | Why |
|------|---|---|
| Connected address | ✅ Yes | For auto-reconnect on page reload |
| Last entered amount | ✅ Yes | UX: pre-fill on reload |
| Theme preference | ✅ Yes | User preference, not from chain |
| User stakes | ❌ No | Get from contract (source of truth) |
| Pool data | ❌ No | Get from contract (source of truth) |
| Leaderboard | ❌ No | Get from contract (source of truth) |

---

## 6. Stale Data Detection: How to Know Cache is Old

### Method 1: Checking `isStale` Flag

```javascript
const { data, isStale } = useReadContract({
  // ...
  query: {
    staleTime: 60000
  }
});

// isStale = true means 60 seconds have passed since last successful fetch
if (isStale) {
  refetchPool(); // Refetch if stale
}
```

### Method 2: Event-Driven Invalidation

```javascript
// When event fires, we know contract changed
publicClient.watchContractEvent({
  eventName: "Staked",
  onLogs: () => {
    refetchPool(); // Don't check isStale, just refetch
  }
});
```

### Method 3: Manual Check (User Button)

```javascript
const handleRefresh = () => {
  refetchPool(); // No staleness check, just fetch
};
```

---

## 7. Network Issues: What to Do If Refetch Fails

### Scenario: RPC Down, Refetch Fails

```javascript
const handleRefresh = useCallback(async () => {
  try {
    await refetchPool();
    setToast({ type: 'success', message: 'Refreshed ✓' });
  } catch (error) {
    setToast({ 
      type: 'error', 
      message: 'Network error. Showing cached data.',
      action: 'Retry'
    });
    // Keep showing old data from cache (better than nothing)
  }
}, [refetchPool]);
```

### Strategy: Show Stale Warning

```javascript
const [isStale, setIsStale] = useState(false);

useEffect(() => {
  if (poolData) {
    const t = setTimeout(() => {
      setIsStale(true); // After 3 min, show warning
    }, 180000);
    return () => clearTimeout(t);
  }
}, [poolData]);

{isStale && (
  <div className="text-yellow-400 text-sm">
    ⚠️ Data may be out of date. <button onClick={refetchPool}>Refresh</button>
  </div>
)}
```

---

## 8. Complete Refetch Decision Tree

```
Event Occurs
    ↓
Is it a "data-changing" event?
├─ YES: Stake / Tip / Admin Update
│   └─> Refetch immediately
│       ├─ poolData: YES
│       ├─ userStakes: YES (if user staked)
│       ├─ leaderboard: YES
│       └─ Notify user: "Updated ✓"
│       
├─ NO: User scrolls / types / hovers
│   └─> Do NOT refetch (waste)
│
└─ Is it a "time-based" event?
    └─ 3 minutes passed?
        ├─ YES: Background refetch
        │   ├─ poolData: update quietly
        │   ├─ Already using event listeners, so minimal
        │
        └─ NO: Do not refetch (yet)
```

---

## 9. Recommended Cache Timings

| Data | staleTime | refetchInterval | Refetch Triggers |
|------|-----------|---|---|
| Pool data | 120s | false | Event: Staked, Tipped; Manual: Refresh |
| User stakes | 60s | false | Manual: Refresh; Event: Staked (if own) |
| Leaderboard | 0s | false | Event: Staked, Tipped, InfinityWallUpdated |
| User balance | 30s | false | Manual: Refresh; Event: Transfer |
| Gas estimate | 60s | false | Event: Network congestion; Manual: Retry |

**Rationale**:
- Leaderboard: staleTime=0 (always fresh from contract)
- Pool: staleTime=120s (doesn't change often, events catch updates)
- Balance: staleTime=30s (could change from other apps)

---

## 10. Testing Cache Invalidation

```javascript
import { render, screen, waitFor } from '@testing-library/react';

test('pool data refetches after stake event', async () => {
  const refetchSpy = jest.fn();
  render(
    <PoolCard 
      matchId={1} 
      poolData={{ totalStaked: 10 }}
      onRefetch={refetchSpy}
    />
  );

  // Simulate Staked event on blockchain
  fireContractEvent('Staked', { 
    matchId: 1, 
    pillarId: 0, 
    amount: 0.5 
  });

  await waitFor(() => {
    expect(refetchSpy).toHaveBeenCalledWith('pool');
  });
  
  // Verify new data rendered
  expect(screen.getByText('10.5')).toBeInTheDocument();
});
```

---

## Summary: Refetch Checklist

When a user performs an action:
- [ ] Stake executed → Refetch pool, userStakes, leaderboard
- [ ] Refresh clicked → Refetch all three
- [ ] Event fired (Staked/Tipped) → Refetch affected data
- [ ] Network error → Keep cached data, show warning
- [ ] 3+ minutes passed → Consider refetch (but events should catch it)
- [ ] Multiple tabs → Both get events, both refetch (OK, dedup with setTimeout)
- [ ] User disconnects → Clear userData, keep poolData
- [ ] User reconnects → Refetch all (balance, stakes, leaderboard)

