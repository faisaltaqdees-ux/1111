# State Management Patterns & Rules

**"When to use useState vs useRef vs useCallback vs useMemo"** — Complete decision tree

---

## Core Principle

| When to Use | Purpose | Example |
|-----------|---------|---------|
| **useState** | Value changes → UI re-renders | `const [amount, setAmount] = useState()` |
| **useRef** | Value changes → NO re-render (sync guard) | `const txGuardRef = useRef(false)` |
| **useCallback** | Function doesn't change → prevent infinite loops | `const handleStake = useCallback(() => {}, [deps])` |
| **useMemo** | Expensive calc → only run if deps change | `const hasError = useMemo(() => complex(), [deps])` |
| **useEffect** | Side effect (fetch, listen, cleanup) | After component renders, do X |

---

## Decision Tree: What Hook Should I Use?

```
Do I need to store a value?
├─ YES → Is it reflected in the UI?
│  ├─ YES → useState (re-render on change)
│  └─ NO → useRef (no re-render on change)
└─ NO → Is it an expensive computation?
   ├─ YES → useMemo (cache result)
   └─ NO → const variable (recalculate every render)

Do I have a function that depends on props/state?
└─ YES → useCallback (cache function reference)

Do I need to do something as a side effect?
└─ YES → useEffect (runs after render)
```

---

## PoolCard.jsx State Management Breakdown

### State Variables (useState)

```javascript
// Input state — changes as user types
const [amount, setAmount] = useState("");
// WHY useState?: User types → UI updates immediately to show new value

// UI state — show/hide modals
const [showConfirm, setShowConfirm] = useState(false);
// WHY useState?: When true, modal renders → Need re-render

// Error state — from validation
const [validationError, setValidationError] = useState(null);
// WHY useState?: Updates as amount changes → UI shows red error text

// Gas estimation
const [gasEstimate, setGasEstimate] = useState(null);
const [isEstimating, setIsEstimating] = useState(false);
// WHY useState?: Shows/hides gas badge → Need re-render

// Network resilience
const [networkBusy, setNetworkBusy] = useState(false);
// WHY useState?: Shows/hides "node congested" toast → Need re-render

// Ripple animation
const [ripple, setRipple] = useState(null);
// WHY useState?: Animation component reads ripple state → Need re-render

// Toast notifications
const [toast, setToast] = useState(null);
// WHY useState?: Shows/hides success/error toast → Need re-render
```

### Ref Variables (useRef)

```javascript
// DOM reference — to measure click position
const cardRef = useRef(null);
// WHY useRef?: Need to access DOM directly (getBoundingClientRect()) → No re-render needed

// Transaction guard — prevent double-submit
const txGuardRef = useRef(false);
// WHY useRef?: toggles but should NOT trigger re-render. We check it synchronously in executeStake()
//   If it were useState, toggling it would re-render the whole PoolCard every tx, unnecessary
```

### Memoized Values (useMemo)

```javascript
// Pillar metadata — stay same unless pillarId changes
const pillar = useMemo(
  () => pillarOverride || DEFAULT_PILLARS[pillarId] || DEFAULT_PILLARS[0],
  [pillarOverride, pillarId]
);
// WHY useMemo?: Pillar object used in multiple renders, only recalculate when pillarId changes
// If we didn't memoize, pillar would be new object every render → InfinityWall would re-render

// Input validation — expensive logic
const validationError = useMemo(() => {
  if (!amount) return null;
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) return "Enter a positive amount.";
  
  try {
    const wei = parseEther(amount);
    if (wei < minStake) return `Minimum stake is ${minStakeDisplay} WIRE.`;
    if (balanceData && wei > balanceData.value) return "Insufficient WIRE balance.";
  } catch {
    return "Invalid amount.";
  }
  
  return null;
}, [amount, minStake, minStakeDisplay, balanceData]);
// WHY useMemo?: Validation runs on every keystroke. Memoizing means:
//   - If amount didn't change → return cached result (no re-validation)
//   - If amount changed → re-validate once
// Without memo, validation runs multiple times per keystroke

// Interest check
const hasLowBalance = useMemo(() => {
  if (!balanceData) return false;
  return balanceData.value < minStake;
}, [balanceData, minStake]);
// WHY useMemo?: Used to show/hide warning box. Memoize to avoid recalc every render
```

### Callbacks (useCallback)

```javascript
// Gas estimation function
const runGasEstimate = useCallback(async () => {
  if (!publicClient || !address || !amount || validationError) {
    setGasEstimate(null);
    return;
  }
  
  setIsEstimating(true);
  try {
    const gas = await publicClient.estimateContractGas({
      account: address,
      address: MARKET_ADDRESS,
      abi: MARKET_ABI,
      functionName: "stake",
      args: [BigInt(matchId), pillarId],
      value: parseEther(amount),
    });
    setGasEstimate(formatGas(gas));
  } catch {
    setGasEstimate(null);
  } finally {
    setIsEstimating(false);
  }
}, [publicClient, address, amount, matchId, pillarId, validationError]);
// WHY useCallback?: 
//   - Function is passed as dependency to useEffect (line: useEffect(() => { t = setTimeout(runGasEstimate, 500) }))
//   - Without useCallback, runGasEstimate recreated every render
//   - Every render → useEffect sees new runGasEstimate → useEffect runs → setTimeout called again
//   - Result: Gas estimating runs 5+ times per keystroke (TERRIBLE)
//   - With useCallback: runGasEstimate only recreates when deps change → useEffect runs once → clean

// Stake handler
const handleStakeClick = useCallback(() => {
  if (!amount || validationError || !isConnected) return;
  setShowConfirm(true);
}, [amount, validationError, isConnected]);
// WHY useCallback?: Passed to onClick handlers, passed to other components
// Without memo, handleStakeClick recreated every render → onClick always points to new function

// Ripple effect
const handleRippleClick = useCallback((e) => {
  const rect = cardRef.current?.getBoundingClientRect();
  if (!rect) return;
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  setRipple({ x, y, key: Date.now() });
  setTimeout(() => setRipple(null), 600);
  handleStakeClick();
}, [handleStakeClick]);
// WHY useCallback?: 
//   - Depends on handleStakeClick
//   - handleStakeClick is a useCallback
//   - So handleRippleClick must also be useCallback (to prevent cascading re-renders)

// Execute stake
const executeStake = useCallback(() => {
  if (txGuardRef.current) return; // Prevent double-submit
  txGuardRef.current = true;
  setShowConfirm(false);
  const value = parseEther(amount);
  writeContract({
    address: MARKET_ADDRESS,
    abi: MARKET_ABI,
    functionName: "stake",
    args: [BigInt(matchId), pillarId],
    value,
  });
}, [amount, matchId, pillarId, writeContract]);
// WHY useCallback?: Passed as onConfirm to StakeConfirmModal component
// If recreated every render → Modal re-renders + modal animation re-triggers
```

---

## useEffect Dependency Rules

### Rule 1: Dependencies Must Be Exhaustive

```javascript
// ❌ WRONG: Missing 'amount' dependency
useEffect(() => {
  const t = setTimeout(() => {
    runGasEstimate(); // Uses 'amount', but 'amount' not in deps
  }, 500);
  return () => clearTimeout(t);
}, [runGasEstimate, validationError]); // Missing 'amount'!

// ✅ CORRECT: All dependencies listed
useEffect(() => {
  const t = setTimeout(() => {
    runGasEstimate();
  }, 500);
  return () => clearTimeout(t);
}, [amount, runGasEstimate, validationError]);
// Now: When user types → amount changes → useEffect runs → gas re-estimates
```

### Rule 2: Cleanup Functions

```javascript
// Use cleanup to prevent memory leaks
useEffect(() => {
  if (!amount || validationError) {
    setGasEstimate(null);
    return; // Early return, no cleanup needed
  }
  
  const t = setTimeout(runGasEstimate, 500);
  
  return () => clearTimeout(t); // Cleanup: cancel timer if component unmounts or deps change
}, [amount, runGasEstimate, validationError]);

// Real scenario: User types amount A → timer set for 500ms → User types amount B immediately
// Without cleanup: Still calls runGasEstimate for amount A, then for amount B (WRONG)
// With cleanup: When deps change, clearTimeout cancels old timer → only estimates for amount B
```

### Rule 3: Avoid useEffect Chains

```javascript
// ❌ ANTI-PATTERN: useEffect triggers another useEffect
useEffect(() => {
  setAmount("0.5"); // State change
}, []);

useEffect(() => {
  runGasEstimate(); // Runs because amount changed
}, [amount, runGasEstimate]);

// ✅ BETTER: Combine into one useEffect
useEffect(() => {
  setAmount("0.5");
  runGasEstimate();
}, []);
```

---

## Wagmi Hooks (useReadContract, useWriteContract, etc.)

### Wagmi Manages Its Own State

```javascript
// These are NOT useState — Wagmi manages state internally
const { data: fetchedPoolData, isLoading: poolLoading } = useReadContract({
  address: MARKET_ADDRESS,
  abi: MARKET_ABI,
  functionName: "getPool",
  args: [BigInt(matchId), pillarId],
  enabled: !!matchId && !externalPoolData, // Only fetch if enabled
  query: {
    staleTime: 60000, // Cache for 60 seconds
    refetchInterval: false, // Don't poll, use events instead
  }
});

// What Wagmi does internally:
// ├─ On mount: Fetch data
// ├─ Store in internal state
// ├─ Return: { data: fetchedPoolData, isLoading: true }
// ├─ On success: { data: fetchedPoolData, isLoading: false }
// ├─ On error: { data: undefined, error: Error, isLoading: false }
// └─ On refetch(): Fetch again, update data

// We should NOT do:
// ❌ const [poolData, setPoolData] = useReadContract(...) ← WRONG! useReadContract returns object, not array
// ✅ const { data: poolData } = useReadContract(...) ← RIGHT! Destructure object
```

### Combining External & Fetched Data

```javascript
// Component receives optional pre-fetched data (from parent)
function PoolCard({ externalPoolData, ...props }) {
  // Fetch from contract if not provided
  const { data: fetchedPoolData } = useReadContract({
    enabled:!!matchId && externalPoolData === undefined, // Only fetch if not provided
  });
  
  // Use external if provided, otherwise use fetched
  const poolData = externalPoolData ?? fetchedPoolData;
  // ?? = nullish coalescing (use right side only if left is null/undefined)
  
  // Example:
  // ├─ Parent passes poolData → Use it (don't fetch)
  // └─ Parent doesn't pass → Fetch from contract
}
```

---

## Ref vs State: When to Choose

### Ref: Transaction Guard (txGuardRef)

```javascript
const txGuardRef = useRef(false);

const executeStake = useCallback(() => {
  if (txGuardRef.current) return; // Check synchronously
  txGuardRef.current = true; // Set synchronously
  
  writeContract(...);
}, [writeContract]);

// Why useRef?
// ├─ Toggling it should NOT re-render component
// ├─ We check it synchronously (not in render)
// ├─ It's a "hidden" state that doesn't affect UI
// └─ If it were useState, every toggle would re-render PoolCard (unnecessary)
```

### State: Validation Error (validationError)

```javascript
const [validationError, setValidationError] = useState(null);

// Calculated with useMemo (not useState)
const validationError = useMemo(() => {
  // ... validation logic
}, [amount, balanceData, minStake]);

// Then rendered:
{validationError && (
  <p className="text-red-400">{validationError}</p>
)}

// Why not useRef?
// ├─ Changes must trigger re-render (show/hide error text)
// ├─ Needs to be memoized (expensive calc)
// └─ useState + useMemo combination is correct
```

---

## InfinityWall State Management

```javascript
// Real-time leaderboard state
const [showAll, setShowAll] = useState(false); // Show all vs top 10
const [networkBusy, setNetworkBusy] = useState(false); // Network warning
const [toast, setToast] = useState(null); // Toast notification

// Memoized derived values
const leaderboardData = useMemo(() => {
  if (!wallAddresses) return [];
  return wallAddresses.slice(0, showAll ? 100 : 10);
}, [wallAddresses, showAll]);

// Event listener useEffect
useEffect(() => {
  if (!publicClient) return;
  
  const unsub = publicClient.watchContractEvent({
    address: MARKET_ADDRESS,
    abi: ABI,
    eventName: "Staked",
    onLogs: () => {
      refetchWall(); // Triggers read hook
    }
  });
  
  return () => unsub?.(); // Cleanup: Stop listening
}, [publicClient, refetchWall]);

// Exposed ref API
useImperativeHandle(ref, () => ({
  refetchWall // Parent (PoolCard) calls this
}), [refetchWall]);

// Why useImperativeHandle?
// ├─ Child (InfinityWall) exposes function to parent (PoolCard)
// ├─ PoolCard calls: infinityWallRef.current.refetchWall()
// ├─ This triggers zero-latency leaderboard refresh after stake
// └─ Without it, PoolCard can't trigger leaderboard update
```

---

## MatchCenter State Management

```javascript
const [selectedMatchId, setSelectedMatchId] = useState(null);

// Memoized derived value
const matchesByStatus = useMemo(() => {
  const grouped = { live: [], pending: [], completed: [] };
  (matchesData.matches || []).forEach(match => {
    if (grouped[match.status]) {
      grouped[match.status].push(match);
    }
  });
  return grouped;
}, [matchesData.matches]); // Only recalculate if matchesData changes

// Why useMemo?
// ├─ Grouping logic runs on every render
// ├─ Without memo: every keystroke in parent → re-group matches (inefficient)
// ├─ With memo: matches only re-grouped when data actually changes
```

---

## Common Mistakes

### Mistake 1: Putting useCallback in Wrong Place

```javascript
// ❌ WRONG: useCallback inside if statement
function PoolCard() {
  if (isOpen) {
    const handleStake = useCallback(() => {
      writeContract(...);
    }, [writeContract]); // Hooks can't be inside conditionals!
  }
  return null;
}

// ✅ CORRECT: useCallback at top level
function PoolCard() {
  const handleStake = useCallback(() => {
    writeContract(...);
  }, [writeContract]);
  
  if (!isOpen) return null;
  return <button onClick={handleStake}>Stake</button>;
}
```

### Mistake 2: Invalid Dependencies

```javascript
// ❌ WRONG: Function in dependency array
useEffect(() => {
  console.log(amount);
}, [amount, handleStake]); // handleStake is a function reference, changes every render

// ✅ CORRECT: Memoized function in dependency array
const handleStake = useCallback(() => {
  writeContract(...);
}, [writeContract]);

useEffect(() => {
  console.log(amount);
}, [amount, handleStake]); // Now handleStake is stable (memoized)
```

### Mistake 3: Missing Cleanup

```javascript
// ❌ WRONG: No cleanup for listeners
useEffect(() => {
  const unsub = publicClient.watchContractEvent({
    address: MARKET_ADDRESS,
    eventName: "Staked",
    onLogs: () => refetchWall(),
  });
  // Missing: return () => unsub?.();
}, [publicClient, refetchWall]);
// Result: Listener keeps firing even after component unmounts (memory leak!)

// ✅ CORRECT: Return cleanup function
useEffect(() => {
  const unsub = publicClient.watchContractEvent({
    address: MARKET_ADDRESS,
    eventName: "Staked",
    onLogs: () => refetchWall(),
  });
  return () => unsub?.(); // Stop listening when component unmounts or deps change
}, [publicClient, refetchWall]);
```

### Mistake 4: Expensive Computation Without Memoization

```javascript
// ❌ INEFFICIENT: Recalculate every render
function PoolCard() {
  // This runs 100 times per second if parent re-renders
  const isValid = amount > 0 && parseFloat(amount) < MAX_STAKE;
  return <button disabled={!isValid}>Stake</button>;
}

// ✅ OPTIMIZED: Use useMemo for expensive logic
function PoolCard() {
  const isValid = useMemo(() => {
    const num = parseFloat(amount);
    return num > 0 && num < MAX_STAKE;
  }, [amount, MAX_STAKE]);
  return <button disabled={!isValid}>Stake</button>;
}
```

---

## Testing State Management

### How to Test setState Logic

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

test('Gas estimate updates when amount changes', async () => {
  render(<PoolCard matchId={1} pillarId={0} />);
  
  const input = screen.getByPlaceholderText(/enter amount/i);
  const gasBadge = screen.queryByText(/gas/i);
  
  // Initially no gas estimate
  expect(gasBadge).not.toBeInTheDocument();
  
  // User types amount
  fireEvent.change(input, { target: { value: '0.5' } });
  
  // Wait for debounce (500ms) + gas estimation (1-2s)
  await waitFor(() => {
    expect(screen.getByText(/~84,210/)).toBeInTheDocument();
  }, { timeout: 3000 });
});
```

---

## Summary: State Management Decision Matrix

| Variable | Hook | Reason |
|----------|------|--------|
| User input (amount) | useState | Re-render on change |
| Validation error | useMemo | Expensive calc, cache result |
| Gas estimate | useState | Re-render badge |
| Show/hide modal | useState | Re-render modal |
| Transaction guard | useRef | No re-render, sync guard |
| DOM access | useRef | Access element directly |
| Function callback | useCallback | Cache function reference |
| Fetch pool data | useReadContract | Wagmi manages state |
| Write tx | useWriteContract | Wagmi manages state |
| Event listener | useEffect + cleanup | Subscribe/unsubscribe |
| Memoized callback | useCallback + useRef deps | Guard against infinite loops |

