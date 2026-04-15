# Code Changes Reference

## File 1: InfinityWall.jsx

### Change 1.1: Imports (Lines 1-17)
**FROM:**
```jsx
import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { formatEther } from "viem";
```

**TO:**
```jsx
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
} from "framer-motion";
import { useReadContract, useReadContracts, useAccount, usePublicClient } from "wagmi";
import { formatEther } from "viem";
```

### Change 1.2: Component Declaration (Around Line 850)
**FROM:**
```jsx
export default function InfinityWall({
  demoMode = false,
  compact = false,
  maxDisplay = INITIAL_DISPLAY_COUNT,
  mockData,
}) {
```

**TO:**
```jsx
const InfinityWall = forwardRef(function InfinityWall({
  demoMode = false,
  compact = false,
  maxDisplay = INITIAL_DISPLAY_COUNT,
  mockData,
}, ref) {
```

### Change 1.3: State Additions
**ADD** (after line 850):
```jsx
  const publicClient = usePublicClient();
  const [networkBusy, setNetworkBusy] = useState(false);
  const [toast, setToast] = useState(null);
```

### Change 1.4: Contract Read Hook (Lines 863-873)
**CHANGE:**
```jsx
const {
  data: wallAddresses,
  isLoading: wallLoading,
  isError: wallError,
  error: wallErrorMsg,
  refetch: refetchWall,
} = useReadContract({
  address: MARKET_ADDRESS,
  abi: MARKET_ABI,
  functionName: "getInfinityWall",
  query: {
    enabled: IS_MARKET_CONFIGURED && !demoMode && !mockData,
    staleTime: REFRESH_INTERVAL_MS,
    refetchInterval: false, // Disable polling — use events instead
  },
});

// Expose refetchWall via ref for external triggers
useImperativeHandle(ref, () => ({
  refetchWall,
}), [refetchWall]);

// Real-time event listeners for instant updates
useEffect(() => {
  if (!publicClient || !IS_MARKET_CONFIGURED || demoMode || mockData) return;
  const unsub = publicClient.watchContractEvent({
    address: MARKET_ADDRESS,
    abi: [
      "event InfinityWallUpdated(address indexed contributor, uint256 totalContributed, uint256 rank)",
      "event PlayerTipped(uint256 indexed matchId, bytes32 indexed playerId, address indexed tipper, uint256 amount)",
      "event Staked(uint256 indexed matchId, uint8 indexed pillarId, address indexed staker, uint256 amount)"
    ],
    onLogs: () => {
      refetchWall();
      setToast({ message: "Leaderboard updated in real-time! 🔄", type: "success" });
      setTimeout(() => setToast(null), 3000);
    },
  });
  return () => unsub?.();
}, [publicClient, refetchWall, demoMode, mockData]);

// Network Busy Toast logic — show warning after 5s of loading
useEffect(() => {
  let timeout;
  if (wallLoading) {
    timeout = setTimeout(() => {
      setNetworkBusy(true);
      setToast({ message: "WireFluid node is congested, hang tight...", type: "warning" });
    }, 5000);
  } else {
    setNetworkBusy(false);
  }
  return () => clearTimeout(timeout);
}, [wallLoading]);

// Toast notification component
const NetworkToast = () => {
  if (!toast) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className={`fixed bottom-4 left-4 z-50 max-w-sm p-4 rounded-xl border backdrop-blur-md cursor-pointer ${
          toast.type === "warning"
            ? "border-yellow-500/40 bg-yellow-900/20"
            : "border-green-500/40 bg-green-900/20"
        }`}
        role="alert"
        onClick={() => setToast(null)}
      >
        <p
          className={`text-sm font-semibold ${
            toast.type === "warning" ? "text-yellow-400" : "text-green-400"
          }`}
        >
          {toast.message}
        </p>
      </motion.div>
    </AnimatePresence>
  );
};
```

### Change 1.5: Render Return (Lines 1150+)
**ADD** (as first element inside `<section>`):
```jsx
<NetworkToast />
```

### Change 1.6: Component Export (Around Line 1270)
**FROM:**
```jsx
}

/**
 * Named sub-component exports...
 */
export {
```

**TO:**
```jsx
});

export default InfinityWall;

/**
 * Named sub-component exports...
 */
export {
```

---

## File 2: PoolCard.jsx

### Change 2.1: Props Addition
**FROM:**
```jsx
export default function PoolCard({
  matchId,
  pillarId,
  pillar: pillarOverride,
  poolData: externalPoolData,
  externalUserStake,
  onStakeSuccess,
  onStakeError,
  compact = false,
  className = "",
}) {
```

**TO:**
```jsx
export default function PoolCard({
  matchId,
  pillarId,
  pillar: pillarOverride,
  poolData: externalPoolData,
  externalUserStake,
  onStakeSuccess,
  onStakeError,
  compact = false,
  className = "",
  infinityWallRef,
}) {
```

### Change 2.2: Add Network Busy State (After other state declarations)
**ADD:**
```jsx
  // Network Busy Toast logic
  const [networkBusy, setNetworkBusy] = useState(false);
  useEffect(() => {
    let timeout;
    if (isLoading) {
      timeout = setTimeout(() => setNetworkBusy(true), 5000);
    } else {
      setNetworkBusy(false);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  function NetworkToast() {
    if (!networkBusy) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="fixed bottom-4 left-4 z-50 max-w-sm p-4 rounded-xl border border-yellow-500/40 bg-yellow-900/20 backdrop-blur-md"
        role="alert"
        onClick={() => setNetworkBusy(false)}
      >
        <p className="text-sm font-semibold text-yellow-400">WireFluid node is congested, hang tight...</p>
      </motion.div>
    );
  }
```

### Change 2.3: Update onStakeSuccess Hook
**CHANGE** (the useEffect that handles `txSuccess`):
```jsx
  useEffect(() => {
    if (txSuccess && txHash) {
      txGuardRef.current = false;
      setToast({
        message: `Staked in ${pillar.name}!`,
        type: "success",
        txHash,
      });
      setAmount("");
      // Refetch pool data and user stake
      if (externalPoolData === undefined) refetchPool();
      if (externalUserStake === undefined) refetchUserStake();
      if (onStakeSuccess) onStakeSuccess({ matchId, pillarId, txHash });
      
      // ADDED: Zero Latency — trigger InfinityWall refresh
      if (infinityWallRef && infinityWallRef.current && infinityWallRef.current.refetchWall) {
        infinityWallRef.current.refetchWall();
      }
    }
  }, [
    txSuccess,
    txHash,
    pillar.name,
    matchId,
    pillarId,
    onStakeSuccess,
    externalPoolData,
    externalUserStake,
    refetchPool,
    refetchUserStake,
    infinityWallRef  // ADDED
  ]);
```

### Change 2.4: Add NetworkToast to Render
**FIND** (around line 755):
```jsx
  // ── Render ──
  return (
    <>
      <motion.div
```

**CHANGE TO:**
```jsx
  // ── Render ──
  return (
    <>
      <NetworkToast />
      <motion.div
```

---

## File 3: MatchCenter.jsx (NEW)

**FULL FILE:**
```jsx
import React from "react";
import { motion } from "framer-motion";

/**
 * @file MatchCenter.jsx
 * @title PSL Pulse — Match Center
 * @notice Glassmorphic, 3-layer architecture for live matches, stadium view, and match stats.
 * @dev This is a placeholder. Integrate with match data and contract hooks as needed.
 */

export default function MatchCenter() {
  return (
    <section
      className="relative min-h-[60vh] w-full flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-[#1a1026] via-[#2c1a3a] to-[#1a1026]"
      aria-label="Match Center"
    >
      {/* Glassmorphic Layer 1: Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-3xl rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl p-8 flex flex-col items-center"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-400 to-rose-400 text-transparent">
          🏟️ PSL Match Center
        </h1>
        <p className="text-white/60 mb-6 text-center max-w-xl">
          View live matches, stadium stats, and real-time impact. This is your hub for all PSL action.
        </p>
        {/* Placeholder for live match list / stadium UI */}
        <div className="w-full flex flex-col gap-6">
          <div className="rounded-2xl bg-white/10 border border-white/10 p-6 flex flex-col items-center">
            <span className="text-2xl font-bold text-violet-300 mb-2">No live matches right now</span>
            <span className="text-white/40">Check back soon for real-time PSL action!</span>
          </div>
        </div>
      </motion.div>
      {/* Glassmorphic Layer 2: Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-fuchsia-500/20 via-violet-500/10 to-transparent blur-3xl" />
      </div>
      {/* Glassmorphic Layer 3: Subtle Grid Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </section>
  );
}
```

---

## Summary of Changes

| Component | Lines Changed | Key Changes |
|-----------|---------------|------------|
| InfinityWall.jsx | 1-17, 850, 863-920, 1150, 1270 | forwardRef, event listeners, toast |
| PoolCard.jsx | Props, state, useEffect, render | infinityWallRef, Network Busy, refetch call |
| MatchCenter.jsx | NEW FILE | 3-layer glassmorphic UI |
| PSLImpactMarket.sol | stake(), tipPlayer() | Zero-value checks |
| PSLTicket.sol | buyTicket() | Zero-value check |
| ImpactBadge.sol | Already complete | Team ID validation |

---

## Verification Checklist

- [ ] InfinityWall imports forwardRef, useImperativeHandle, usePublicClient
- [ ] PoolCard accepts infinityWallRef prop
- [ ] Both components have NetworkToast implementations
- [ ] Event listeners in InfinityWall watch correct events
- [ ] refetchWall exposed via useImperativeHandle
- [ ] PoolCard calls infinityWallRef.current.refetchWall() on stake success
- [ ] MatchCenter renders without errors
- [ ] No TypeScript/JSX errors in any file
- [ ] All test cases pass (see INTEGRATION_GUIDE.md)

---

For questions, refer to **INTEGRATION_GUIDE.md** and **FRONTEND_IMPROVEMENTS_SUMMARY.md**.
