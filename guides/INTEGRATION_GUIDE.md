/**
 * @file INTEGRATION_GUIDE.md
 * @title Integration Guide — Real-Time Frontend Updates
 * @notice Quick start for using the new InfinityWall ref API and network-resilient components.
 */

# Integration Guide: Real-Time PSL Pulse Frontend

## Quick Start: Connecting PoolCard to InfinityWall

### In Your Match Page (pages/match/[id].js or similar):

```jsx
import { useRef } from 'react';
import PoolCardGrid from '@/components/PoolCard';
import InfinityWall from '@/components/InfinityWall';

export default function MatchPage() {
  // Create ref for InfinityWall
  const infinityWallRef = useRef(null);

  return (
    <div className="w-full space-y-8">
      {/* Staking pools section */}
      <section>
        <h2>Active Funding Pools</h2>
        <PoolCardGrid 
          matchId={matchId}
          infinityWallRef={infinityWallRef}
        />
      </section>

      {/* Infinity Wall leaderboard section */}
      <section>
        <InfinityWall ref={infinityWallRef} />
      </section>
    </div>
  );
}
```

---

## What Changed?

### 1. InfinityWall Component
- **Now a forwardRef**: `forwardRef(function InfinityWall(...), ref)`
- **Exposed ref API**: `{ refetchWall }`
- **Event-driven**: Listens for `InfinityWallUpdated`, `PlayerTipped`, `Staked` events
- **Network Busy Toast**: 5s timeout warning if RPC is slow

### 2. PoolCard Component
- **New prop**: `infinityWallRef` (optional, but recommended)
- **New prop**: For `PoolCardGrid`, pass `infinityWallRef` to all cards
- **Network Busy Toast**: Shows if RPC takes >5s

### 3. MatchCenter Component
- **NEW**: `@/components/MatchCenter.jsx`
- Ready to integrate with live match data

---

## Event-Driven Update Flow

```
User clicks 'Stake' in PoolCard
    ↓
[PoolCard confirms transaction]
    ↓
[PoolCard calls infinityWallRef.current.refetchWall()]
    ↓
[InfinityWall watches contract events]
    ↓
[InfinityWallUpdated event fires]
    ↓
[InfinityWall refetches leaderboard data]
    ↓
[UI re-renders with new data in <100ms]
    ↓
"Leaderboard updated!" toast appears
```

---

## Network Resilience Behavior

### Scenario 1: Normal RPC
- User stakes
- Transaction confirms in <2s
- Leaderboard updates in <100ms
- No "Network Busy" toast

### Scenario 2: Slow RPC (>5s)
- User stakes
- RPC takes 5+ seconds
- "WireFluid node is congested, hang tight..." toast appears
- Transaction eventually confirms
- Leaderboard updates

### Scenario 3: RPC Failure
- User stakes
- Error toast appears: "Transaction failed"
- User can retry or cancel
- InfinityWall remains unchanged

---

## Using Individual Components

### PoolCard Standalone (without InfinityWall ref):

```jsx
import PoolCard from '@/components/PoolCard';

export default function StakingSection() {
  return (
    <PoolCard
      matchId={1}
      pillarId={0}
      onStakeSuccess={() => console.log('Staked!')}
      onStakeError={(err) => console.error(err)}
    />
  );
}
```

### InfinityWall Standalone (without PoolCard):

```jsx
import InfinityWall from '@/components/InfinityWall';

export default function LeaderboardPage() {
  return (
    <InfinityWall
      demoMode={false}
      compact={false}
      maxDisplay={20}
    />
  );
}
```

---

## Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_MARKET_ADDRESS=0x...  # PSLImpactMarket contract address
NEXT_PUBLIC_BADGE_ADDRESS=0x...   # ImpactBadge contract address
```

---

## Props Reference

### InfinityWall (forwardRef)

```typescript
interface InfinityWallProps {
  demoMode?: boolean;        // Use mock data instead of on-chain
  compact?: boolean;          // Hide stats, limit entries
  maxDisplay?: number;        // Max entries before "Show More" (default 20)
  mockData?: Array<{...}>;   // Override with mock entries
}

// Ref API:
// infinityWallRef.current.refetchWall()
```

### PoolCard

```typescript
interface PoolCardProps {
  matchId: number;
  pillarId: number;
  pillar?: ObjectMetadata;
  poolData?: [BigInt, number, number, number];  // Pre-fetched
  externalUserStake?: BigInt;                     // Pre-fetched
  onStakeSuccess?: (details) => void;
  onStakeError?: (error) => void;
  compact?: boolean;
  className?: string;
  infinityWallRef?: RefObject;  // NEW: Ref to InfinityWall
}
```

### PoolCardGrid

```typescript
interface PoolCardGridProps {
  matchId: number;
  onStakeSuccess?: (details) => void;
  onStakeError?: (error) => void;
  compact?: boolean;
  className?: string;
  infinityWallRef?: RefObject;  // NEW: Pass through to all cards
}
```

### MatchCenter

```typescript
// No props required - standalone component
// Integrate with live match data in the future
```

---

## Toasts & Error Handling

### Network Busy Toast
- Appears after **5 seconds** of loading
- Message: `"WireFluid node is congested, hang tight..."`
- Auto-learns: Shows/hides based on actual RPC performance
- Click to dismiss manually

### Transaction Toasts (existing)
- ✅ "Staked in [Pillar]!" (green)
- ⚠️ "Transaction cancelled" (yellow)
- ❌ "Transaction failed" (red)

### Auto-dismiss Times
- Success: 5 seconds
- Warning: 10 seconds
- Error: 12 seconds

---

## Testing the Integration

### Test 1: Basic Stake
1. Open match page
2. Stake 0.1 WIRE in any pillar
3. Watch InfinityWall update in real-time
4. Check console for no errors

### Test 2: Multiple Pillars
1. Stake in Grassroots (0.1 WIRE)
2. Stake in Player Welfare (0.2 WIRE)
3. Verify total shows on leaderboard (0.3 WIRE)

### Test 3: Slow RPC
1. Open DevTools Network tab
2. Simulate Slow 3G
3. Click Stake
4. Wait 5s
5. Verify "Network Busy" toast appears

### Test 4: Demo Mode
1. Render `<InfinityWall demoMode={true} />`
2. Verify it shows 15 mock contributors
3. Verify no RPC calls in Network tab

---

## Troubleshooting

### "InfinityWall ref is null"
- Check that InfinityWall is rendered **before** PoolCard tries to call it
- Or render both before passing ref

### "Leaderboard doesn't update after stake"
- Check browser console for errors
- Verify `NEXT_PUBLIC_MARKET_ADDRESS` is set
- Check if event listeners are active (Network tab → WebSocket)

### "Network Busy toast doesn't appear"
- RPC is probably fast (<5s)
- Simulate slow network in DevTools to test

### "MatchCenter has no content"
- Expected — it's a placeholder
- Integrate match data when ready

---

## Best Practices

✅ **DO:**
- Pass `infinityWallRef` from parent to PoolCard (even if not using directly)
- Render InfinityWall with `ref` first in DOM
- Use `onStakeSuccess` callback for analytics
- Test with slow/degraded network

❌ **DON'T:**
- Create multiple InfinityWall instances with same ref
- Pass ref before component mounts
- Ignore the Network Busy toast (indicates real performance issues)
- Use demoMode in production

---

## Advanced: Custom Event Listeners

If you need additional event handling:

```jsx
import { usePublicClient } from 'wagmi';

function MyComponent() {
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!publicClient) return;
    
    const unsub = publicClient.watchContractEvent({
      address: MARKET_ADDRESS,
      abi: ['event Staked(uint256 indexed matchId, uint8 indexed pillarId, address indexed staker, uint256 amount)'],
      onLogs: (logs) => {
        console.log('New stake:', logs);
        // Custom logic here
      },
    });

    return () => unsub?.();
  }, [publicClient]);
}
```

---

## Summary

With these changes, your PSL Pulse frontend now:

1. ✅ Updates **instantly** (event-driven)
2. ✅ Shows **network warnings** (5s timeout)
3. ✅ Syncs **zero-latency** between components
4. ✅ Handles **errors gracefully** (retry buttons)
5. ✅ Works in **demo mode** (for testing)

**Next time a fan stakes, they'll see their name on the Infinity Wall in milliseconds, not 30 seconds.**

🚀 Go live!
