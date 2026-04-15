# Input Validation Rules

**Exact business logic for every input field in PoolCard.jsx** — Frontend vs Smart Contract validation, decision tree, error messages

---

## Core Principle

**Frontend validation = Instant user feedback** (100ms)
**Smart contract validation = Source of truth** (2-5 seconds)

Frontend validation should mirror contract validation but cannot replace it. If frontend says "OK", contract can still say "REJECT" (e.g., network state changed between validation and tx submission).

---

## Stake Amount Input (PoolCard.jsx)

### Validation Rules (In Order)

1. **Rule 1: Non-Empty**
   - **When**: User hasn't typed anything or types spaces
   - **Condition**: `!amount.trim()`
   - **Error Message**: `"Enter an amount to stake."`
   - **Show Error**: ❌ Don't show (no error while typing)
   - **Block Submit**: ✅ Yes (disable button)

```javascript
// Implementation
if (!amount.trim()) {
  return "Enter an amount to stake.";
}
```

2. **Rule 2: Valid Number Format**
   - **When**: User types "abc" or "1.2.3"
   - **Condition**: `isNaN(parseFloat(amount))`
   - **Error Message**: `"Invalid amount. Use numbers only (0.5, 1, etc)."`
   - **Show Error**: ✅ Yes
   - **Block Submit**: ✅ Yes

```javascript
const num = parseFloat(amount);
if (isNaN(num)) {
  return "Invalid amount. Use numbers only (0.5, 1, etc).";
}
```

3. **Rule 3: Positive Number**
   - **When**: User types "0" or "-5"
   - **Condition**: `num <= 0`
   - **Error Message**: `"Enter a positive amount."`
   - **Show Error**: ✅ Yes
   - **Block Submit**: ✅ Yes

```javascript
if (num <= 0) {
  return "Enter a positive amount.";
}
```

4. **Rule 4: Decimal Precision (18 decimals max)**
   - **When**: User types "0.123456789123456789123456789" (too many decimals)
   - **Condition**: Check digits after decimal point
   - **Error Message**: `"WIRE has max 18 decimals (0.000000000000000001)."`
   - **Show Error**: ✅ Yes
   - **Block Submit**: ✅ Yes
   - **Why**: ERC-20 tokens use 18 decimal places. Cannot send "0.0000000000000000001 WIRE" (would round to 0)

```javascript
const decimals = (amount.split('.')[1] || '').length;
if (decimals > 18) {
  return "WIRE has max 18 decimals (0.000000000000000001).";
}

// Better: Use Viem's parseEther which handles this
try {
  const wei = parseEther(amount);
} catch (e) {
  return "Invalid amount format.";
}
```

5. **Rule 5: Minimum Stake Amount**
   - **When**: User types "0.0001 WIRE" but minimum is "0.1 WIRE"
   - **Condition**: `wei < minStakeInWei`
   - **Error Message**: `"Minimum stake is 0.1 WIRE. You entered 0.0001 WIRE."`
   - **Show Error**: ✅ Yes
   - **Block Submit**: ✅ Yes
   - **Source**: From contract `poolData.minStakeAmount`

```javascript
try {
  const wei = parseEther(amount);
  if (wei < minStakeInWei) {
    const minStakeDisplay = formatEther(minStakeInWei); // e.g., "0.1"
    return `Minimum stake is ${minStakeDisplay} WIRE. You entered ${amount} WIRE.`;
  }
} catch (e) {
  return "Invalid amount.";
}
```

6. **Rule 6: Sufficient Balance**
   - **When**: User has "0.5 WIRE" but tries to stake "1 WIRE"
   - **Condition**: `wei > userBalance`
   - **Error Message**: `"Insufficient WIRE balance. You have 0.5 WIRE, need 1 WIRE."`
   - **Show Error**: ✅ Yes
   - **Block Submit**: ✅ Yes
   - **Source**: From Wagmi `useBalance({ address })`

```javascript
const { data: balanceData } = useBalance({ address, token: WIRE_ADDRESS });

if (balanceData && wei > balanceData.value) {
  const balanceDisplay = formatEther(balanceData.value);
  return `Insufficient WIRE balance. You have ${balanceDisplay} WIRE, need ${amount} WIRE.`;
}
```

7. **Rule 7: Maximum Stake Amount** (OPTIONAL, if contract has cap)
   - **When**: Contract says max stake is "100 WIRE", user tries "150 WIRE"
   - **Condition**: `wei > maxStakeInWei`
   - **Error Message**: `"Maximum stake is 100 WIRE."`
   - **Show Error**: ✅ Yes
   - **Block Submit**: ✅ Yes

```javascript
if (poolData?.maxStakeAmount && wei > poolData.maxStakeAmount) {
  const maxDisplay = formatEther(poolData.maxStakeAmount);
  return `Maximum stake is ${maxDisplay} WIRE.`;
}
```

8. **Rule 8: Pool Not Closed**
   - **When**: Pool is closed for new stakes
   - **Condition**: `poolData?.status === 'closed'` or `poolData?.isOpen === false`
   - **Error Message**: `"This pool has closed and no longer accepts stakes."`
   - **Show Error**: ✅ Yes
   - **Block Submit**: ✅ Yes
   - **Source**: From contract `poolData.isOpen`

```javascript
if (!poolData?.isOpen) {
  return "This pool has closed and no longer accepts stakes.";
}
```

9. **Rule 9: Wallet Connected**
   - **When**: User clicks stake but wallet is disconnected
   - **Condition**: `!isConnected || !address`
   - **Error Message**: `"Connect your wallet to stake."` (shown as toast, not inline error)
   - **Show Error**: ❌ No inline error (different flow)
   - **Block Submit**: ✅ Yes

```javascript
if (!isConnected) {
  setToast({ type: 'error', message: 'Connect your wallet to stake.' });
  return;
}
```

### Full Validation Function

```javascript
function validateStakeAmount(amount, { minStakeInWei, maxStakeInWei, isOpen, userBalance }) {
  // Step 1: Non-empty
  if (!amount.trim()) {
    return "Enter an amount to stake.";
  }
  
  // Step 2-4: Parse and validate format/precision
  try {
    const wei = parseEther(amount);
    const num = parseFloat(amount);
    
    if (isNaN(num)) {
      return "Invalid amount. Use numbers only (0.5, 1, etc).";
    }
    
    if (num <= 0) {
      return "Enter a positive amount.";
    }
    
    // Step 5: Minimum
    if (wei < minStakeInWei) {
      const minDisplay = formatEther(minStakeInWei);
      return `Minimum stake is ${minDisplay} WIRE.`;
    }
    
    // Step 6: Maximum (if exists)
    if (maxStakeInWei && wei > maxStakeInWei) {
      const maxDisplay = formatEther(maxStakeInWei);
      return `Maximum stake is ${maxDisplay} WIRE.`;
    }
    
    // Step 7: Balance
    if (userBalance && wei > userBalance) {
      const balanceDisplay = formatEther(userBalance);
      return `Insufficient WIRE balance. You have ${balanceDisplay} WIRE.`;
    }
    
    // Step 8: Pool open
    if (!isOpen) {
      return "This pool has closed and no longer accepts stakes.";
    }
    
    // All valid
    return null;
  } catch (error) {
    return "Invalid amount format.";
  }
}
```

---

## Error Message Mapping: As Shown to Users

| User Action | Frontend Error | Contract Revert Msg | Recovery |
|-------------|---|---|---|
| Types "abc" | "Invalid amount. Use numbers only." | N/A | Delete, type number |
| Types "0" | "Enter a positive amount." | N/A | Delete, type >0 |
| Types "0.00000000000000000000001" | "WIRE has max 18 decimals." | N/A | Clear, type valid |
| Enters "0.05" (min is 0.1) | "Minimum stake is 0.1 WIRE." | "Pool::MinStakeNotMet" | Increase amount |
| Balance is 0.5, enters "1" | "Insufficient WIRE balance. You have 0.5." | "Pool::InsufficientBalance" | Reduce amount or top up |
| Pool closed | "Pool closed." | "Pool::PoolClosed" | Wait for new pool |
| Wrong chain | "Connect wallet" (in toast) | N/A | Switch chain in MetaMask |
| Wallet not connected | "Connect wallet" | N/A | Click "Connect" button |

---

## Frontend vs Smart Contract: Authority & Timing

### Which Is Source of Truth?

| Scenario | Frontend Validates | Contract Validates | Who Wins? | Why? |
|----------|---|---|---|---|
| Amount format | ✅ Yes (instant feedback) | ✅ Yes | Contract | Contract is immutable |
| Min/max stake | ✅ Yes (from poolData) | ✅ Yes (hard-coded) | Must match | If not, frontend is lying |
| User balance | ✅ Yes (balance hook) | ✅ Yes (during tx) | Contract | User could spend elsewhere after check |
| Pool open | ✅ Yes (from poolData) | ✅ Yes (during tx) | Contract | Pool could close mid-keystroke |
| Wallet connected | ✅ Yes (isConnected) | ❌ No | Frontend | Contract can't check if user has wallet |

### Race Condition: What If State Changes Mid-TX?

```
Timeline:
T0:  User types "0.5 WIRE" → Frontend validates (✅ valid, balance=1.0)
T1:  User clicks "Stake" → Confirm modal shows
T2:  User clicks "Yes, confirm"
T3:  executeStake() starts → sends to blockchain
T4:  [DELAY: 2-5 seconds for network]
T5:  User sends 1 WIRE to friend on different app → balance now 0.4
T6:  Contract receives tx → Checks balance (now 0.4) → REVERT: "Insufficient balance"

Frontend said "OK✅" but contract says "REVERT❌"
Why? State changed between validation (T0) and execution (T6)
```

**Solution**: This is NORMAL. Frontend validation is best-effort, not guaranteed. Users see:
- Frontend check passes
- User reviews confirmation modal (re-verify there)
- Transaction submitted to blockchain
- On-chain check might fail (show error in toast)
- User can retry if they still have balance

---

## Error Handling: Frontend vs Smart Contract

### Frontend Error Handling (Instant, <100ms)

```javascript
const validationError = useMemo(() => {
  // ... validation logic
  return null; // or error string
}, [amount, balanceData, minStake, poolData]);

// If error exists, disable button & show red text
{validationError && (
  <>
    <button disabled className="opacity-50 cursor-not-allowed">
      Stake
    </button>
    <p className="text-red-400 text-sm mt-2">{validationError}</p>
  </>
)}
```

### Smart Contract Error Handling (On-chain, 2-5 seconds)

From PSLImpactMarket.sol:

```solidity
function stake(uint256 _matchId, uint8 _pillarId) external payable nonReentrant {
  require(msg.value > 0, "Pool::ValueIsZero");
  require(_pillarId < 4, "Pool::InvalidPillar");
  require(pools[_matchId][_pillarId].isOpen, "Pool::PoolClosed");
  require(msg.value >= pools[_matchId][_pillarId].minStakAmount, "Pool::MinStakeNotMet");
  require(msg.value <= pools[_matchId][_pillarId].maxStakAmount, "Pool::MaxStakeExceeded");
  // ... execution
}
```

When contract reverts, user sees:
```
❌ Transaction failed
Pool::MinStakeNotMet

The contract rejected your transaction. 
This usually means the pool settings changed.
```

---

## Validation Input Flow in PoolCard.jsx

```
User Types Amount
    ↓
useEffect debounces (500ms)
    ↓
runGasEstimate() called
    ↓
Gas estimate displays
    ↓
useMemo validates amount
    ↓
validationError updates
    ↓
Error message shows (if any)
    ↓
Button disabled/enabled based on validationError
    ↓
User clicks "Stake"
    ↓
Frontend check passes
    ↓
Confirmation modal shows
    ↓
User clicks "Yes"
    ↓
executeStake() sends to blockchain
    ↓
Smart contract validates again
    ↓
On-chain check passes or fails
    ↓
Success/Error toast shown
```

---

## Special Cases: When Validation Gets Tricky

### Case 1: Multiple Pools, User Types in One While Another Updates

```
User is on Pool A (min 0.1) and scrolls
Pool B updates its min to 10 WIRE
User clicks Pool B → sees 0.1 suggested amount
User enters 0.1 → "Minimum is 10 WIRE" error
```

✅ **Correct behavior**: Frontend caught it instantly. No unnecessary transaction sent.

### Case 2: User Disconnects/Reconnects Mid-Stake

```
T0: User types "0.5" → Valid ✅
T1: User exports private key → temporary disconnect
T2: User reconnects
T3: User amount still shows "0.5" but address changed
T4: User clicks "Stake" → New address tries to stake with new balance
```

✅ **Correct behavior**: Frontend re-validates on new address context. If new address has insufficient balance, error shows before tx sent.

### Case 3: Insufficient Gas (Edge Case)

```
User has 1 WIRE to stake
Gas fee for tx = 0.001 WIRE
User only has 1 WIRE total (not 1 + 0.001 WIRE)
Frontend validates: 1 WIRE ≥ min 0.1 WIRE ✅
User clicks Stake
Contract tries to transfer 1 WIRE
But account has 0 WIRE left after gas
Contract reverts: "InsufficientGas"
```

⚠️ **Current state**: Frontend doesn't validate gas fee. This could happen.

✅ **Fix**: Add gas estimate check:
```javascript
const gasEstimate = useMemo(() => {
  if (!amount) return null;
  try {
    const gas = publicClient.estimateContractGas({...});
    const gasCost = (gas * gasPrice);
    if (balanceData && (wei + gasCost) > balanceData.value) {
      return "Insufficient balance for transaction fee.";
    }
  } catch {}
  return null;
}, [amount, balanceData, publicClient]);
```

---

## Input Validation Checklist

When adding a new input field to PoolCard or other components:

- [ ] Non-empty check
- [ ] Type/format check (number, address, enum, etc.)
- [ ] Positive/negative check (if applicable)
- [ ] Min/max bounds check
- [ ] Available resource check (balance, gas, etc.)
- [ ] State check (pool open, wallet connected, etc.)
- [ ] Contract mirror check (does contract validate the same?)
- [ ] Error message is user-friendly (not technical)
- [ ] Error shown in UI (inline or toast)
- [ ] Button disabled when error exists
- [ ] Validation runs in useMemo (not on every render)
- [ ] Validation dependencies are exhaustive

---

## Testing Validation Logic

```javascript
import { render, screen, fireEvent } from '@testing-library/react';

describe('Stake Amount Validation', () => {
  test('shows error for negative amount', () => {
    render(<PoolCard />);
    const input = screen.getByPlaceholderText(/amount/i);
    
    fireEvent.change(input, { target: { value: '-5' } });
    
    expect(screen.getByText(/positive amount/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stake/i })).toBeDisabled();
  });
  
  test('shows error for insufficient balance', () => {
    render(<PoolCard balance={0.5} />);
    const input = screen.getByPlaceholderText(/amount/i);
    
    fireEvent.change(input, { target: { value: '1.0' } });
    
    expect(screen.getByText(/insufficient.*balance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stake/i })).toBeDisabled();
  });
  
  test('allows valid amount', () => {
    render(<PoolCard balance={2.0} minStake={0.1} />);
    const input = screen.getByPlaceholderText(/amount/i);
    
    fireEvent.change(input, { target: { value: '1.0' } });
    
    expect(screen.queryByText(/error|insufficient|minimum/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stake/i })).not.toBeDisabled();
  });
});
```

---

## Summary: Validation Rules Matrix

| Field | Required | Min | Max | Format | Smart Contract Match? |
|-------|----------|-----|-----|--------|---|
| Stake Amount | ✅ | minStakeAmount | maxStakeAmount | Wei (18 decimals) | ✅ Yes |
| Pillar ID | ✅ | 0 | 3 | Integer | ✅ Yes |
| Match ID | ✅ | 0 | ∞ | Integer | ✅ Yes |
| Wallet | ✅ | - | - | Valid address | ✅ Yes (implicit) |

