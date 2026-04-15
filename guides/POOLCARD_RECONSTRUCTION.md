# PoolCard.jsx Reconstruction Guide

**Complete guide to rebuild PoolCard.jsx with clean architecture: utility functions separated from JSX rendering**

---

## Why PoolCard Needs Rebuilding

The original PoolCard.jsx had JSX markup inside async utility functions, causing compiler errors. This guide rebuilds it with proper separation:

- **Utility functions** = pure data transformation
- **React hooks** = state management
- **JSX = clean UI rendering**

Result: 0 compilation errors, clean code, maintainable.

---

## Architecture Overview

```
PoolCard.jsx (main component)
├── Hooks (React state + effects)
├── Utility Functions (pure, no JSX)
├── Event Handlers (onClick, onChange)
└── JSX Render (clean UI markup)
```

---

## Complete PoolCard.jsx Code

Create file: `frontend/src/components/PoolCard.jsx`

```jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useContractWrite } from '../hooks/useContractWrite';
import { networkToast } from '../lib/toast';
import dynamic from 'next/dynamic';

// Optional: Advanced Gas UI (lazy load)
const GasEstimator = dynamic(() => import('./GasEstimator'), { ssr: false });

export default function PoolCard({
  pool,
  match,
  onStakeSuccess,
  infinityWallRef,
}) {
  // ==================
  // STATE MANAGEMENT
  // ==================

  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [gasEstimate, setGasEstimate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [networkBusy, setNetworkBusy] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [txStatus, setTxStatus] = useState(null); // 'pending' | 'confirmed' | 'failed'

  const { writeContract, isPending } = useContractWrite();
  const txGuardRef = useRef(false);
  const autoResetTimerRef = useRef(null);
  const stakingTimeoutRef = useRef(null);

  // ==================
  // UTILITY FUNCTIONS
  // ==================

  /**
   * Validate stake amount
   * Returns: { valid: boolean, errorMessage: string }
   */
  const validateStakeAmount = (amount) => {
    if (!amount) {
      return { valid: false, errorMessage: 'Please enter a stake amount' };
    }

    const parsed = parseFloat(amount);

    if (isNaN(parsed)) {
      return { valid: false, errorMessage: 'Invalid amount format' };
    }

    if (parsed <= 0) {
      return { valid: false, errorMessage: 'Stake must be greater than 0' };
    }

    if (parsed > 1000) {
      return { valid: false, errorMessage: 'Stake exceeds maximum (1000 WF)' };
    }

    if (!/^\d+\.?\d{0,4}$/.test(amount)) {
      return { valid: false, errorMessage: 'Maximum 4 decimal places' };
    }

    return { valid: true, errorMessage: null };
  };

  /**
   * Validate pillar selection
   * Returns: { valid: boolean, errorMessage: string }
   */
  const validatePillarSelection = (pillar) => {
    const validPillars = ['Environment', 'Social', 'Technology', 'Governance'];

    if (!pillar || !validPillars.includes(pillar)) {
      return { valid: false, errorMessage: 'Please select a valid impact pillar' };
    }

    return { valid: true, errorMessage: null };
  };

  /**
   * Calculate gas estimate (mock for now)
   * In production, call contract.estimateGas()
   * Returns: { gasLimit: string, gasCost: string, totalCost: string }
   */
  const calculateGasEstimate = (amount) => {
    const baseGas = 85000; // Base cost: PSLImpactMarket.stake() + events
    const perPillarGas = 5000; // Extra gas if badge awarded
    const estimatedGas = baseGas + perPillarGas;

    const gasPrice = 300_000_000; // 0.3 GWei (from hardhat.config.js)
    const gasCostWei = estimatedGas * gasPrice;
    const gasCostWF = gasCostWei / 1e18; // Convert wei to WF

    const totalWithTx = parseFloat(amount) + gasCostWF;

    return {
      gasLimit: estimatedGas.toString(),
      gasCost: gasCostWF.toFixed(6),
      totalCost: totalWithTx.toFixed(6),
    };
  };

  /**
   * Format error message for user display
   * Maps contract errors to human-readable text
   */
  const formatErrorMessage = (error) => {
    const message = error?.message || error?.toString() || 'Unknown error';

    if (message.includes('insufficient')) {
      return 'Insufficient balance. Get more WIRE from faucet.';
    }

    if (message.includes('Pool.*closed')) {
      return 'This pool has closed. Try another match.';
    }

    if (message.includes('Invalid.*pillar')) {
      return 'Invalid impact pillar selected.';
    }

    if (message.includes('user rejected')) {
      return 'Transaction rejected by user.';
    }

    if (message.includes('network')) {
      return 'Network error. Is WireFluid RPC responding?';
    }

    return `Error: ${message.slice(0, 100)}`;
  };

  /**
   * Convert Solidity pillar enum to display name
   */
  const getPillarName = (index) => {
    const names = ['Environment', 'Social', 'Technology', 'Governance'];
    return names[index] || 'Unknown';
  };

  /**
   * Format timestamp for display
   */
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  // ==================
  // EVENT HANDLERS
  // ==================

  /**
   * Handle stake amount input
   */
  const handleAmountChange = (e) => {
    const value = e.target.value;
    setStakeAmount(value);
    setError(null);

    // Optional: Auto-calculate gas when user enters amount
    if (value) {
      const gas = calculateGasEstimate(value);
      setGasEstimate(gas);
    } else {
      setGasEstimate(null);
    }
  };

  /**
   * Handle pillar selection
   */
  const handlePillarSelect = (pillar) => {
    setSelectedPillar(pillar);
    setError(null);
  };

  /**
   * Handle stake submission
   */
  const handleStakeSubmit = async (e) => {
    e.preventDefault();

    // Double-submit guard
    if (txGuardRef.current || isPending) {
      console.warn('Transaction already in progress');
      return;
    }

    // Validate inputs
    const amountValidation = validateStakeAmount(stakeAmount);
    if (!amountValidation.valid) {
      setError(amountValidation.errorMessage);
      return;
    }

    const pillarValidation = validatePillarSelection(selectedPillar);
    if (!pillarValidation.valid) {
      setError(pillarValidation.errorMessage);
      return;
    }

    // Set guard
    txGuardRef.current = true;
    setIsLoading(true);
    setError(null);
    setNetworkBusy(true);

    try {
      // Call contract
      const hash = await writeContract({
        functionName: 'stake',
        args: [
          pool.id,
          selectedPillar,
          parseFloat(stakeAmount) * 1e18, // Convert to wei
        ],
        value: parseFloat(stakeAmount) * 1e18,
      });

      setTxHash(hash);
      setTxStatus('pending');

      // Update infinity wall
      if (infinityWallRef?.current?.syncLeaderboard) {
        infinityWallRef.current.syncLeaderboard();
      }

      // Call parent callback
      if (onStakeSuccess) {
        onStakeSuccess({
          pool: pool.id,
          amount: stakeAmount,
          pillar: selectedPillar,
          hash,
        });
      }

      // Show success toast
      networkToast({
        type: 'success',
        title: '✓ Stake submitted!',
        message: `${stakeAmount} WF on ${selectedPillar}`,
      });

      // Reset form
      setStakeAmount('');
      setSelectedPillar(null);
      setGasEstimate(null);

      // Auto-reset network busy after 5 seconds
      clearTimeout(autoResetTimerRef.current);
      autoResetTimerRef.current = setTimeout(() => {
        setNetworkBusy(false);
      }, 5000);

      // Set confirmed status after 10 seconds
      clearTimeout(stakingTimeoutRef.current);
      stakingTimeoutRef.current = setTimeout(() => {
        setTxStatus('confirmed');
      }, 10000);
    } catch (err) {
      setError(formatErrorMessage(err));
      setTxStatus('failed');

      // Show error toast
      networkToast({
        type: 'error',
        title: 'Stake failed',
        message: formatErrorMessage(err),
      });
    } finally {
      txGuardRef.current = false;
      setIsLoading(false);
    }
  };

  /**
   * Handle manual reset
   */
  const handleReset = () => {
    setStakeAmount('');
    setSelectedPillar(null);
    setGasEstimate(null);
    setError(null);
    setTxHash(null);
    setTxStatus(null);
    setNetworkBusy(false);
    txGuardRef.current = false;
  };

  // ==================
  // EFFECTS
  // ==================

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearTimeout(autoResetTimerRef.current);
      clearTimeout(stakingTimeoutRef.current);
    };
  }, []);

  // ==================
  // RENDER
  // ==================

  if (!pool || !match) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
        <p className="text-red-300">Error: Missing pool or match data</p>
      </div>
    );
  }

  const isPoolClosed = pool.status === 'closed';
  const isFormValid =
    stakeAmount &&
    selectedPillar &&
    !isPoolClosed &&
    !networkBusy &&
    !isLoading;

  return (
    <div className="bg-gradient-to-b from-rose-500/5 to-purple-900/10 border border-rose-500/20 backdrop-blur-xl rounded-2xl p-6 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white">{match.name}</h3>
        <p className="text-sm text-gray-300">{match.time}</p>
      </div>

      {/* Status Badge */}
      {isPoolClosed && (
        <div className="mb-4 bg-red-500/20 border border-red-500/30 rounded-lg p-2 text-center">
          <p className="text-sm text-red-300 font-semibold">Pool Closed</p>
        </div>
      )}

      {/* Network Busy Indicator */}
      {networkBusy && (
        <div className="mb-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2 text-center">
          <p className="text-sm text-yellow-300">Processing...</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleStakeSubmit} className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Stake Amount (WF)
          </label>
          <input
            type="number"
            step="0.0001"
            min="0"
            max="1000"
            value={stakeAmount}
            onChange={handleAmountChange}
            placeholder="Enter amount..."
            disabled={isPoolClosed || networkBusy}
            className="w-full bg-gray-900/50 border border-rose-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/80 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Pillar Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Impact Pillar
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['Environment', 'Social', 'Technology', 'Governance'].map(
              (pillar) => (
                <button
                  key={pillar}
                  type="button"
                  onClick={() => handlePillarSelect(pillar)}
                  disabled={isPoolClosed || networkBusy}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedPillar === pillar
                      ? 'bg-rose-500/80 text-white'
                      : 'bg-gray-900/50 border border-rose-500/30 text-gray-300 hover:border-rose-500/60'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pillar}
                </button>
              )
            )}
          </div>
        </div>

        {/* Gas Estimate (if available) */}
        {gasEstimate && (
          <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-3 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Gas Cost:</span>
              <span>{gasEstimate.gasCost} WF</span>
            </div>
            <div className="flex justify-between mt-1 text-gray-300">
              <span className="font-semibold">Total:</span>
              <span className="font-semibold">{gasEstimate.totalCost} WF</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Transaction Status */}
        {txStatus === 'pending' && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-300">
            ⏳ Waiting for confirmation...
          </div>
        )}

        {txStatus === 'confirmed' && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-sm text-green-300">
            ✓ Stake confirmed!
          </div>
        )}

        {txStatus === 'failed' && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-sm text-red-300">
            ✗ Stake failed. Try again.
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!isFormValid || txGuardRef.current}
            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all"
          >
            {isLoading ? '♻ Staking...' : 'Stake Now'}
          </button>

          {(stakeAmount || selectedPillar || error) && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-gray-900/50 border border-gray-500/30 text-gray-300 rounded-lg hover:border-gray-500/60 transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-500/20 text-xs text-gray-400 space-y-1">
        <p>💜 Impact Badge chance: {pool.badgeChance}%</p>
        <p>🏆 Current pool: {pool.totalStaked} WF</p>
        <p>👥 Participants: {pool.participantCount}</p>
      </div>
    </div>
  );
}
```

---

## Component Props Documentation

```javascript
PoolCard.propTypes = {
  pool: {
    id: number,              // Unique pool identifier
    status: string,          // 'active' | 'closed' | 'completed'
    totalStaked: number,     // Total WF staked in pool
    participantCount: number, // Number of unique stakers
    badgeChance: number,     // Percentage chance to earn badge (0-100)
  },

  match: {
    name: string,            // e.g., "India vs Pakistan"
    time: string,            // e.g., "2:30 PM IST"
    status: string,          // 'scheduled' | 'live' | 'completed'
  },

  onStakeSuccess: function, // Called when stake succeeds
                           // Receives: { pool, amount, pillar, hash }

  infinityWallRef: ref,    // Ref to InfinityWall component
                           // Used to sync leaderboard
};
```

---

## Key Design Decisions

### 1. Separated Utilities from JSX

**❌ Bad:**
```javascript
const handleStake = async () => {
  // ... calculation logic ...
  return (
    <div>
      <p>{result}</p>
    </div>
  );
};
```

**✅ Good:**
```javascript
// Utility function (pure, no JSX)
const validateStakeAmount = (amount) => {
  return { valid: true, errorMessage: null };
};

// Event handler (no JSX, just side effects)
const handleStakeSubmit = async (e) => {
  const validation = validateStakeAmount(stakeAmount);
  // ... set state ...
};

// JSX only in return statement
return (
  <div>
    {error && <p>{error}</p>}
  </div>
);
```

### 2. Double-Submit Guard

```javascript
const txGuardRef = useRef(false);

const handleSubmit = () => {
  if (txGuardRef.current) return; // Already pending
  txGuardRef.current = true;
  
  // ... do work ...
  
  txGuardRef.current = false;
};
```

### 3. Auto-Reset Network Busy State

```javascript
const autoResetTimerRef = useRef(null);

// Set busy
setNetworkBusy(true);

// Auto-reset after 7 seconds
clearTimeout(autoResetTimerRef.current);
autoResetTimerRef.current = setTimeout(() => {
  setNetworkBusy(false);
}, 7000);

// Cleanup on unmount
useEffect(() => {
  return () => clearTimeout(autoResetTimerRef.current);
}, []);
```

---

## Testing This Component

### Unit Test: Validation Functions

```javascript
test('validateStakeAmount rejects zero', () => {
  const result = validateStakeAmount('0');
  expect(result.valid).toBe(false);
  expect(result.errorMessage).toContain('greater than 0');
});

test('validatePillarSelection accepts valid pillar', () => {
  const result = validatePillarSelection('Environment');
  expect(result.valid).toBe(true);
});
```

### Integration Test: Form Submission

```javascript
test('submits stake with valid form', async () => {
  const { getByPlaceholderText, getByText } = render(
    <PoolCard pool={mockPool} match={mockMatch} onStakeSuccess={mockCallback} />
  );

  fireEvent.change(getByPlaceholderText('Enter amount...'), {
    target: { value: '0.1' },
  });

  fireEvent.click(getByText('Environment')); // Select pillar
  fireEvent.click(getByText('Stake Now'));

  await waitFor(() => {
    expect(mockCallback).toHaveBeenCalled();
  });
});
```

---

## Where to Place This Component

```
frontend/src/components/PoolCard.jsx  ← CREATE THIS FILE
```

---

## How to Use It in a Parent Component

```jsx
// In pages/match/[id].js or similar

import PoolCard from '../components/PoolCard';
import { useRef } from 'react';

export default function MatchPage() {
  const infinityWallRef = useRef(null);

  const handleStakeSuccess = ({ pool, amount, pillar, hash }) => {
    console.log(`Staked ${amount} WF on ${pillar}`);
    console.log(`Transaction: ${hash}`);
  };

  return (
    <div>
      <PoolCard
        pool={{ id: 1, status: 'active', totalStaked: 50, participantCount: 10, badgeChance: 25 }}
        match={{ name: 'India vs Pakistan', time: '2:30 PM', status: 'live' }}
        onStakeSuccess={handleStakeSuccess}
        infinityWallRef={infinityWallRef}
      />

      <InfinityWall ref={infinityWallRef} />
    </div>
  );
}
```

---

## Compilation Checklist

After creating this file, verify:

```bash
cd frontend

# Should show 0 errors:
npm run type-check

# Should show 0 errors:
npm run lint

# Should build successfully:
npm run build

# Should compile without errors:
npm run dev
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `'useContractWrite' is not exported` | Hook import path wrong | Check hook exists in `src/hooks/` |
| `'networkToast' is not a function` | Toast utility missing | Create `src/lib/toast.js` |
| `Cannot read property 'current' of undefined` | Ref not passed properly | Check `infinityWallRef` is passed from parent |
| `Rendering JSX in utility function` | Bad architecture | Put JSX only in return statement |
| `Double-submit bug` | No guard | Use `txGuardRef.current` check |

---

## Success Criteria

When this component is working:

✓ Form renders without errors  
✓ Can input stake amount  
✓ Can select pillar  
✓ Gas estimate calculates  
✓ Submit button disabled until form valid  
✓ Click submit → MetaMask popup  
✓ Transaction confirms → Toast appears  
✓ Leaderboard updates  
✓ No double-submits  
✓ No "ghost" UI states  

