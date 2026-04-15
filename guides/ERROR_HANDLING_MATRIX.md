# Error Handling Matrix & Recovery Strategies

## Complete Error Scenario Reference

For **EVERY** possible error, this document shows:
1. **When it happens** — Exact conditions
2. **What user sees** — Exact toast message
3. **Where it's caught** — Which component/hook
4. **How we recover** — Step-by-step
5. **Code location** — Where to implement fix

---

## SECTION 1: WALLET & CONNECTION ERRORS

### 1.1 User Rejects Connection

**When:** MetaMask popup → User clicks "Reject"
**Error Code:** 4001 (UserRejectedRequestError)

```javascript
// Where it's caught
const { connect } = useConnect();
// Throws: UserRejectedRequestError

// What user sees
Toast (yellow): "Connection rejected. Try again."

// Code to catch it
function ConnectButton() {
  const { connect, isPending } = useConnect();
  
  return (
    <button 
      onClick={async () => {
        try {
          await connect({ connector: connectors[0] });
        } catch (error) {
          if (error.code === 4001) {
            showToast({ message: "Connection rejected. Try again.", type: "warning" });
          }
        }
      }}
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
```

**Recovery:** User can click "Connect Wallet" again and accept

---

### 1.2 Wrong Network (User on Ethereum, not WireFluid)

**When:** User connected to MetaMask but on wrong chain
**Detection:** chainId !== 92533

```javascript
// Where it's caught
const { chainId } = useAccount();

// What user sees
Toast (red): "Wrong network! Switch to WireFluid."
UI: Stake button disabled until correct chain

// Code to catch it
function PoolCard() {
  const { chainId } = useAccount();
  
  useEffect(() => {
    if (chainId && chainId !== 92533) {
      setToast({ 
        message: "Wrong network. Please switch to WireFluid Chain (ID: 92533)", 
        type: "error" 
      });
      // Optionally suggest: "Switch now?" with link to auto-switch
    }
  }, [chainId]);

  return (
    <button 
      disabled={chainId !== 92533}
      onClick={handleStake}
    >
      {chainId !== 92533 ? "Switch Network First" : "Stake"}
    </button>
  );
}
```

**Recovery:** User manually switches in MetaMask dropdown → App auto-detects chainId change → Button re-enables

---

### 1.3 MetaMask Not Installed

**When:** User clicks Connect, no wallet found
**Error Code:** No connector available

```javascript
// Where it's caught
const { connectors } = useConnect();

// What user sees
Toast (red): "MetaMask not installed. Install or use WalletConnect."

// Code to catch it
function ConnectButton() {
  const { connectors } = useConnect();
  
  const hasMetaMask = connectors.some(c => c.name === 'MetaMask');
  
  if (!hasMetaMask) {
    return (
      <a href="https://metamask.io" target="_blank">
        Install MetaMask
      </a>
    );
  }
  
  return <button onClick={() => connect()}>Connect Wallet</button>;
}
```

**Recovery:** User installs MetaMask → Refresh page → Connect button works

---

### 1.4 Wallet Connection Timeout

**When:** MetaMask popup never responds (stuck)
**Error Code:** -32603 (Internal JSON-RPC error)
**Timeout:** 60 seconds

```javascript
// Where it's caught
const { connect } = useConnect();
// Throws after ~60s

// What user sees
Toast (yellow): "Connection timeout. Try again."

// Code to catch it
function ConnectButton() {
  const [isTimeout, setIsTimeout] = useState(false);
  
  const handleConnect = async () => {
    const timeoutId = setTimeout(() => {
      setIsTimeout(true);
      showToast({ message: "Connection timeout. Try again.", type: "warning" });
    }, 60000);
    
    try {
      await connect({ connector: connectors[0] });
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
    }
  };
  
  return <button onClick={handleConnect}>Connect</button>;
}
```

**Recovery:** Click "Connect Wallet" again

---

## SECTION 2: INPUT VALIDATION ERRORS

### 2.1 Empty Input (No Amount)

**When:** User clicks Stake without entering amount
**Detection:** Synchronous validation

```javascript
const [amount, setAmount] = useState("");

const validationError = useMemo(() => {
  if (!amount) return null; // Allow submit to be blocked, no error message
  // ... other validations
}, [amount]);

// What user sees
Button disabled. No toast (user just hasn't entered amount yet).

// Code to catch it
<input 
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  placeholder="Enter amount (WIRE)"
/>

<button 
  disabled={!amount || !!validationError || isTxLoading}
  onClick={handleStakeClick}
>
  Stake
</button>
```

**Recovery:** User types an amount → Button enables

---

### 2.2 Negative Amount (e.g., "-0.5")

**When:** User enters negative value
**Detection:** Synchronous validation

```javascript
const validationError = useMemo(() => {
  if (!amount) return null;
  
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) {
    return "Enter a positive amount.";
  }
  
  return null;
}, [amount]);

// What user sees
Toast (red): "Enter a positive amount."
Button disabled

// Code location
<p className="text-red-400 text-xs mt-1">
  {validationError}
</p>
```

**Recovery:** User clears and enters valid amount

---

### 2.3 Less Than Minimum Stake (e.g., 0.00005 WIRE when min is 0.0001)

**When:** amount < minStakeAmount (from contract)
**Detection:** Synchronous validation

```javascript
const validationError = useMemo(() => {
  if (!amount) return null;
  
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) return "Enter a positive amount.";
  
  try {
    const wei = parseEther(amount);
    if (wei < minStake) {
      return `Minimum stake is ${minStakeDisplay} WIRE.`;
    }
  } catch {
    return "Invalid amount.";
  }
  
  return null;
}, [amount, minStake, minStakeDisplay]);

// What user sees
Toast (red): "Minimum stake is 0.0001 WIRE."
Input field: red border
Button disabled
```

**Recovery:** User increases amount to ≥ 0.0001 WIRE

---

### 2.4 Invalid Format (e.g., "abc" or "0.5.5")

**When:** User enters non-numeric value
**Detection:** Synchronous validation + parseEther() catch

```javascript
const validationError = useMemo(() => {
  if (!amount) return null;
  
  try {
    const wei = parseEther(amount);
    // If parseEther succeeds, format is valid
  } catch (err) {
    return "Invalid amount format.";
  }
  
  return null;
}, [amount]);

// What user sees
Toast (red): "Invalid amount format."
Button disabled
```

**Recovery:** User clears and enters valid number

---

### 2.5 Too Many Decimals (e.g., "0.123456789123456789123456789")

**When:** User enters more decimals than WIRE supports
**Detection:** parseEther() throws

```javascript
try {
  const wei = parseEther(amount); // WIRE has 18 decimals
} catch (err) {
  // Throws if too many decimals or invalid format
  validationError = "Invalid amount.";
}

// What user sees
Toast (red): "Invalid amount."
```

**Recovery:** User enters amount with ≤18 decimal places

---

## SECTION 3: BALANCE & GAS ERRORS

### 3.1 Insufficient Balance (User has 0.2 WIRE, tries to stake 0.5)

**When:** balanceData.value < amount
**Detection:** Synchronous validation

```javascript
const validationError = useMemo(() => {
  if (!amount) return null;
  
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) return "Enter a positive amount.";
  
  if (balanceData && wei > balanceData.value) {
    return "Insufficient WIRE balance.";
  }
  
  return null;
}, [amount, balanceData]);

// What user sees
Toast (red): "Insufficient WIRE balance."
Low Balance Warning box appears:
  "⚠️ Low WIRE balance (0.2 WIRE). You need at least 0.0001 WIRE to stake. Get WIRE →"
Button disabled

// Code location
{hasLowBalance && (
  <div className="mb-2 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-500/30 text-amber-400 text-xs">
    ⚠️ Low WIRE balance ({formatWF(balanceData.value)} WIRE).
    You need at least {minStakeDisplay} WIRE to stake.
    <a href="https://faucet.wirefluid.com" target="_blank" className="ml-2 underline">
      Get WIRE →
    </a>
  </div>
)}
```

**Recovery:** User gets WIRE from faucet → Refreshes page → Tries again

---

### 3.2 Gas Estimation RPC Timeout (takes >5s)

**When:** publicClient.estimateContractGas() stalls
**Detection:** 5-second timer in useEffect

```javascript
// Gas estimation runs in background
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
  } catch (err) {
    setGasEstimate(null);
  } finally {
    setIsEstimating(false);
  }
}, [publicClient, address, amount, matchId, pillarId, validationError]);

// 5-second timeout for "Network Busy"
useEffect(() => {
  if (!amount || validationError) {
    setGasEstimate(null);
    return;
  }
  
  const t = setTimeout(runGasEstimate, 500); // Debounce by 500ms
  return () => clearTimeout(t);
}, [amount, runGasEstimate, validationError]);

// Monitor loading state
useEffect(() => {
  let timeout;
  if (isEstimating) {
    timeout = setTimeout(() => {
      setNetworkBusy(true);
      setToast({ 
        message: "WireFluid node is congested, hang tight...", 
        type: "warning" 
      });
    }, 5000);
  } else {
    setNetworkBusy(false);
  }
  return () => clearTimeout(timeout);
}, [isEstimating]);

// Auto-reset after 7 seconds
useEffect(() => {
  if (!networkBusy) return;
  const resetTimer = setTimeout(() => {
    setNetworkBusy(false);
  }, 7000);
  return () => clearTimeout(resetTimer);
}, [networkBusy]);

// What user sees
- At 0-5s: Loading spinner on Stake button
- At 5s: Toast appears "WireFluid node is congested, hang tight..."
- At 7s: Toast auto-disappears
- Gas badge remains blank (couldn't estimate)
- User can still try to stake (will fail on writeContract if RPC still down)
```

**Recovery:** 
- Wait 7+ seconds for auto-reset
- If RPC comes back, gas estimate will populate
- If RPC stays down, user can try to stake anyway → Will fail with "RPC error"

---

### 3.3 Gas Estimation Contract Revert

**When:** Contract reverts during gas simulation (e.g., pool closed)
**Error:** "Pool is not open" (revert reason)

```javascript
try {
  const gas = await publicClient.estimateContractGas({
    // ...
  });
} catch (err) {
  if (err.message.includes("Pool is not open")) {
    setValidationError("Pool is closed. Cannot stake.");
  } else if (err.message.includes("Invalid pillar")) {
    setValidationError("Invalid pillar.");
  } else {
    // Generic gas error
    setGasEstimate(null);
  }
}

// What user sees
Toast (red): "Pool is closed. Cannot stake."
Button disabled
```

**Recovery:** Admin must reopen pool OR user must wait for next match

---

## SECTION 4: WRITE TRANSACTION ERRORS

### 4.1 User Clicks "Reject" in MetaMask Signing Popup

**When:** User sees signing modal, clicks "Reject"
**Error Code:** 4001 (UserRejectedRequestError)

```javascript
const { writeContract, error: writeError } = useWriteContract();

useEffect(() => {
  if (writeError) {
    txGuardRef.current = false; // Allow retry
    
    const isUserRejection = 
      writeError.name === "UserRejectedRequestError" ||
      writeError?.code === 4001 ||
      /user rejected|user denied/i.test(writeError.message || "");
    
    const msg = isUserRejection
      ? "Transaction cancelled"
      : writeError.shortMessage || writeError.message || "Transaction failed";
    
    setToast({ 
      message: msg, 
      type: isUserRejection ? "warning" : "error" 
    });
  }
}, [writeError]);

// What user sees
Toast (yellow): "Transaction cancelled"
Stake button re-enables
Input amount stays filled (user can try again)
```

**Recovery:** User clicks "Stake" again → New signing popup

---

### 4.2 Wallet Not Connected When Trying to Stake

**When:** User was connected, but wallet disconnected (MetaMask closed)
**Detection:** isConnected === false in handleStakeClick

```javascript
const handleStakeClick = useCallback(() => {
  if (!amount || validationError || !isConnected) {
    if (!isConnected) {
      showToast({ message: "Please connect wallet first.", type: "warning" });
    }
    return;
  }
  setShowConfirm(true);
}, [amount, validationError, isConnected]);

// What user sees
Toast (yellow): "Please connect wallet first."
Button either disabled or says "Connect Wallet"
```

**Recovery:** User clicks "Connect Wallet" button

---

### 4.3 Transaction Signed But Nonce Too Low (Duplicate Submit)

**When:** User submits same tx twice (rare edge case)
**Error:** "Nonce too low" from RPC

```javascript
useEffect(() => {
  if (writeError && writeError.message.includes("nonce too low")) {
    // This tx was already confirmed
    // Check if first tx succeeded
    showToast({ 
      message: "Transaction already processed.", 
      type: "info" 
    });
    // User likely already staked, check leaderboard
  }
}, [writeError]);

// What user sees
Toast (blue): "Transaction already processed."
```

**Recovery:** 
- Check leaderboard (if this was a stake, you should see +amount)
- Or check profile page for the stake
- Or check WireFluidScan explorer with first tx hash

---

### 4.4 Insufficient Gas for Transaction

**When:** estimatedGas + current gas price > user's balance
**Detection:** This should be caught at INPUT_VALIDATION stage

```javascript
// Gas cost should already be checked
const gasInWire = estimatedGas * currentGasPrice;
if (amount + gasInWire > balanceData.value) {
  validationError = "Insufficient balance for stake + gas.";
}

// What user sees
Red error: "Insufficient balance for stake + gas."
Button disabled
"Get WIRE" link appears
```

**Recovery:** User gets WIRE from faucet

---

## SECTION 5: ON-CHAIN TRANSACTION ERRORS

### 5.1 Transaction Reverted: Pool Already Closed

**When:** Transaction sent, but pool status changed to "Locked"
**When it's caught:** useWaitForTransactionReceipt() → status: 0 (reverted)

```javascript
const { isSuccess, isError, error } = useWaitForTransactionReceipt({ hash: txHash });

useEffect(() => {
  if (isError) {
    txGuardRef.current = false; // Allow retry
    
    const revertReason = error?.details || "Transaction failed";
    
    setToast({ 
      message: `Stake failed: ${revertReason}`, 
      type: "error" 
    });
  }
}, [isError, error]);

// What user sees
Toast (red): "Stake failed: Pool is locked"
Stake button re-enables
"Try again" is possible but will fail with same error
```

**Recovery:** Admin must reopen pool OR wait for next match

---

### 5.2 Transaction Reverted: Reentrancy Guard

**When:** Payment sent but reentrant call detected
**Error:** "ReentrancyGuard: reentrant call"

```javascript
// This is caught by smart contract, returned as revert reason
useEffect(() => {
  if (error?.details.includes("reentrant")) {
    setToast({ 
      message: "Security check failed. Please try again.", 
      type: "error" 
    });
  }
}, [error]);

// What user sees
Toast (red): "Security check failed. Please try again."
```

**Recovery:** Click "Stake" again (very rare in normal usage)

---

### 5.3 Transaction Reverted: Invalid Pillar ID

**When:** pillarId > 3 (contract only accepts 0-3)
**Should not happen:** Component validates before sending

```javascript
// But if it does happen somehow:
useEffect(() => {
  if (error?.details.includes("Invalid pillar")) {
    setToast({ 
      message: "Invalid pillar. Contact support.", 
      type: "error" 
    });
  }
}, [error]);
```

**Recovery:** Refresh page (component will re-initialize)

---

## SECTION 6: NETWORK & RPC ERRORS

### 6.1 RPC Connection Lost (Internet Drops Mid-Transaction)

**When:** Transaction submitted (SUBMITTED state), then socket closes
**Detection:** useWaitForTransactionReceipt() times out

```javascript
const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({ 
  hash: txHash,
  timeout: 60000 // 60 second timeout
});

useEffect(() => {
  if (error?.message.includes("timeout")) {
    // TX might still be on chain, but we lost connection
    showToast({ 
      message: "Lost connection. TX may still be processing. Check explorer.", 
      type: "error" 
    });
    
    // Provide tx hash so user can check manually
    showToast({
      message: `TX Hash: ${txHash}`,
      type: "info",
      autoClose: false, // Don't auto-close, user needs to copy
    });
  }
}, [error, txHash]);

// What user sees
Toast (red): "Lost connection. TX may still be processing."
Toast (blue): "TX Hash: 0x123...789" [does not auto-close]
Stake button re-enables
User guided to WireFluidScan explorer
```

**Recovery:**
- If WiFi returns quickly → TX likely confirmed → Leaderboard auto-updates
- If WiFi stays down → User checks WireFluidScan manually → Can see if TX confirmed
- User can navigate away and come back later → Leaderboard will show updated balance

---

### 6.2 RPC Returns Invalid Response

**When:** RPC response malformed or unexpected
**Error:** "Invalid response from RPC"

```javascript
try {
  const response = await publicClient.waitForTransactionReceipt({ hash: txHash });
  // Validate response
  if (!response.status || !response.blockNumber) {
    throw new Error("Invalid RPC response");
  }
} catch (err) {
  showToast({ 
    message: "Network error. Try again.", 
    type: "error" 
  });
}

// What user sees
Toast (red): "Network error. Try again."
```

**Recovery:** Wait a moment, click "Stake" again

---

### 6.3 RPC Gateway Rate Limit (Too Many Requests)

**When:** RPC provider blocks due to rate limiting
**Error:** 429 Too Many Requests

```javascript
if (error?.code === 429) {
  showToast({ 
    message: "Too many requests. Wait a moment and try again.", 
    type: "warning" 
  });
}

// What user sees
Toast (yellow): "Too many requests. Wait a moment and try again."
```

**Recovery:** Wait 10+ seconds, try again

---

## SECTION 7: STATE MANAGEMENT GUARD RAILS

### 7.1 txGuardRef - Prevent Double-Submit

**Location:** PoolCard.jsx line ~410
**Purpose:** Only one transaction can be in-flight

```javascript
const txGuardRef = useRef(false);

const executeStake = useCallback(() => {
  if (txGuardRef.current) return; // Already submitting, ignore
  
  txGuardRef.current = true; // Lock
  setShowConfirm(false);
  
  writeContract({
    address: MARKET_ADDRESS,
    abi: MARKET_ABI,
    functionName: "stake",
    args: [BigInt(matchId), pillarId],
    value: parseEther(amount),
  });
}, [amount, matchId, pillarId, writeContract]);

// Reset lock on error or success
useEffect(() => {
  if (txSuccess || writeError) {
    txGuardRef.current = false;
  }
}, [txSuccess, writeError]);

// What it prevents
User clicks Stake twice → First tx submitted → Second click ignored ✅
Result: Only 1 tx on chain, not 2
```

---

### 7.2 networkBusy State - Prevent RPC Spam

**Location:** PoolCard.jsx + InfinityWall.jsx
**Purpose:** Show warning if RPC is slow

```javascript
const [networkBusy, setNetworkBusy] = useState(false);

// Set to true after 5 seconds of loading
useEffect(() => {
  let timeout;
  if (isLoading) {
    timeout = setTimeout(() => {
      setNetworkBusy(true);
    }, 5000);
  } else {
    setNetworkBusy(false);
  }
  return () => clearTimeout(timeout);
}, [isLoading]);

// Auto-reset after 7 seconds (prevent ghost toasts)
useEffect(() => {
  if (!networkBusy) return;
  const resetTimer = setTimeout(() => {
    setNetworkBusy(false);
  }, 7000);
  return () => clearTimeout(resetTimer);
}, [networkBusy]);

// What it prevents
RPC down for 2 minutes → No toast appears after 7s → User doesn't see old warning ✅
```

---

## SECTION 8: TOAST MESSAGE REFERENCE

All exact messages users can see:

| Scenario | Message | Type | Duration |
|----------|---------|------|----------|
| Connection rejected | "Connection rejected. Try again." | warning | 10s |
| Wrong network | "Wrong network. Switch to WireFluid." | error | 12s |
| MetaMask not found | "MetaMask not installed. Install or use WalletConnect." | error | 12s |
| Connection timeout | "Connection timeout. Try again." | warning | 10s |
| Empty amount | (no toast, button disabled) | — | — |
| Negative amount | "Enter a positive amount." | error | 12s |
| Below minimum | "Minimum stake is 0.0001 WIRE." | error | 12s |
| Invalid format | "Invalid amount format." | error | 12s |
| Low balance | (warning box appears in UI) | — | — |
| RPC timeout | "WireFluid node is congested, hang tight..." | warning | Auto-dismiss 7s |
| TX rejected | "Transaction cancelled" | warning | 10s |
| TX reverted | "Stake failed: Pool is locked" | error | 12s |
| TX submitted | "Transaction submitted! 0x123...789" | info | 5s |
| TX success | "Staked in Grassroots! ✅" | success | 5s |
| Network error | "Network error. Try again." | error | 12s |
| No wallet | "Please connect wallet first." | warning | 10s |

---

## SECTION 9: RECOVERY CHECKLIST

**If user reports issue:**

- [ ] Ask: What TX hash? (Check WireFluidScan)
- [ ] Ask: What toast did you see? (Match to table above)
- [ ] Ask: Did you click "Connect Wallet" first? (Many issues are connection)
- [ ] Ask: What network in MetaMask? (Must be chain 92533)
- [ ] Ask: How much WIRE do you have? (Balance check)
- [ ] Ask: Did the button ever enable? (Validation check)
- [ ] If TX shows on chain but UI doesn't: Hard refresh page (Ctrl+Shift+R)
- [ ] If leaderboard didn't update: Event listener may be failing, check chainId first
- [ ] If "node congested" for >30s: RPC is down, try again later or use Vault RPC

