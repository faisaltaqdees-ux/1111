# Transaction Lifecycle & Wallet Connection Flow

## 1. Wallet Connection Flow (Step-by-Step)

### State Diagram
```
[Start]
  ↓
User clicks "Connect Wallet" button
  ↓
[Connecting]
  └─ UI shows loading spinner
  └─ wagmi triggers connection probe
  ↓
MetaMask popup appears (or WalletConnect modal)
  ↓
[User Action] — 3 Outcomes:
  ├─ A) User approves connection
  ├─ B) User rejects connection
  └─ C) No action (timeout)
  ↓
If (A) Approves:
  ├─ Wallet signs proof-of-ownership message
  ├─ address + signature returned to wagmi
  ├─ React state: { address, isConnected: true, chainId: 92533 }
  ├─ localStorage saves address (optional, for auto-reconnect)
  └─ UI shows: "Connected: 0x...c0ff"
  ↓
If (B) Rejects:
  ├─ Error code: 4001 (UserRejectedRequestError)
  ├─ React state: { address: null, isConnected: false }
  ├─ Toast: "Connection rejected. Try again."
  └─ UI shows: "Connect Wallet" button (back to start)
  ↓
If (C) Timeout:
  ├─ Error code: -32603 (Internal JSON-RPC error)
  ├─ Toast: "Connection timeout. Check your wallet."
  └─ UI shows: "Connect Wallet" button (back to start)
  ↓
[Connected]
  └─ User can now stake, tip, buy tickets
```

### Implementation (Code Flow)

```jsx
// frontend/src/lib/wagmi.js
import { createConfig, http, connect } from 'wagmi'
import { metaMask, walletConnect } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [wirefluid], // Chain ID 92533
  connectors: [
    metaMask(),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID })
  ],
  transports: {
    [wirefluid.id]: http('https://evm.wirefluid.com')
  }
})

// frontend/src/components/ConnectWalletButton.jsx
import { useConnect, useAccount, useDisconnect } from 'wagmi'

export function ConnectWalletButton() {
  const { connectors, connect } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <button onClick={() => disconnect()}>
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    )
  }

  return (
    <button onClick={() => connect({ connector: connectors[0] })}>
      Connect Wallet
    </button>
  )
}
```

### Event Flow (What Happens Behind Scenes)

1. **User clicks button** → `connect()` called
2. **wagmi detects MetaMask** → Asks: "Is MetaMask installed?"
3. ✅ Yes → Launch MetaMask popup
4. ✅ No → Try WalletConnect (QR code)
5. **MetaMask prompts user** → "Do you want to connect to PSL Pulse?"
6. ✅ Approve → Wallet sends `address` + `chainId` back
7. ✅ Reject → Wallet sends error `4001`
8. **wagmi updates state** → React re-renders with new `address`
9. **localStorage saved** → Next time user visits, auto-connect (optional)

---

## 2. Staking Transaction Lifecycle

### Complete State Machine

```
[INITIAL]
├─ User on PoolCard
├─ Amount: "" (empty)
├─ isConnected: false
└─ TX GUI state: button disabled

[INPUT_VALIDATION]
├─ User enters: "0.5"
├─ Validation runs (synchronously):
│  ├─ Is "0.5" a valid number? ✅
│  ├─ Is 0.5 > minStake (0.0001)? ✅
│  ├─ Does user have 0.5 WIRE balance? ✅ (assume yes)
│  └─ Result: validationError = null
├─ Button enabled (can click)
└─ Gas estimate triggered (debounced 500ms)

[GAS_ESTIMATING]
├─ publicClient.estimateContractGas():
│  ├─ Simulates stake(matchId=1, pillarId=0, value=0.5 WIRE)
│  ├─ RPC calculates gas needed: 84,210 units
│  └─ Converts to WIRE: 84,210 × 0.00000036 = ~0.0303 WF
├─ Component state: { isEstimating: true, gasEstimate: "84,210" }
├─ UI shows badge: "~84,210" (animated pulse)
└─ Gas estimate ready ✅

[WAITING_FOR_USER]
├─ User sees: amount input + gas badge + Stake button
├─ All validation passed ✅
├─ User clicks "Stake" button
└─ Next state: CONFIRMATION

[CONFIRMATION]
├─ Modal appears:
│  ├─ Pillar: "Grassroots Development"
│  ├─ Amount: "0.5 WIRE"
│  ├─ Est. Gas: "84,210"
│  └─ Warning: "This action sends a real on-chain transaction"
├─ User sees 2 buttons: Cancel, Confirm Stake
├─ Possible outcomes:
│  ├─ A) User clicks Cancel → Back to WAITING_FOR_USER
│  └─ B) User clicks Confirm Stake → Next state: SIGNING

[SIGNING]
├─ txGuardRef.current = true (prevent double-click)
├─ MetaMask popup appears:
│  ├─ "Sign Transaction"
│  ├─ To: 0x... (PSLImpactMarket)
│  ├─ Data: 0x... (encoded function call: stake(1, 0))
│  ├─ Value: 0.5 WIRE
│  └─ Gas Limit: 200000 (wagmi auto-estimates)
├─ Component state: { isWritePending: true }
├─ UI shows: Stake button with spinner "Sign..."
├─ Possible outcomes:
│  ├─ A) User approves (in wallet) → Next state: SUBMITTED
│  ├─ B) User rejects (clicks Reject) → Next state: ERROR_REJECTED
│  └─ C) Timeout (no action) → Next state: ERROR_TIMEOUT

[SUBMITTED]
├─ Wallet signed transaction ✅
├─ wagmi.writeContract() submitted to RPC: https://evm.wirefluid.com
├─ RPC validates:
│  ├─ Is nonce correct? ✅
│  ├─ Is value ≥ gas cost? ✅
│  ├─ Is function signature valid? ✅
│  └─ Returns: txHash = "0x123...789"
├─ Component state: { txHash: "0x123...789", isPending: false, isConfirming: true }
├─ UI shows: Stake button with spinner "Confirming..."
├─ Toast: "Transaction submitted! 0x123...789"
└─ Next state: CONFIRMING

[CONFIRMING]
├─ Mempool: Transaction sitting in validator queue
├─ WireFluid takes ~1.2s to include in block
├─ Block gets finalized (instant on WireFluid)
├─ useWaitForTransactionReceipt() polls every 1s:
│  └─ "Is tx in a block yet?"
├─ RPC responds: { blockNumber: 12345, status: "success" }
├─ Component state: { isSuccess: true }
├─ Cascade of effects:
│  ├─ Refetch pool data: { totalStaked now has +0.5 WIRE }
│  ├─ Refetch user stake: { userStake now shows 0.5 WIRE }
│  ├─ Trigger InfinityWall refresh: infinityWallRef.current.refetchWall()
│  ├─ Event listener fires: `watchContractEvent("Staked")` hears event
│  ├─ Leaderboard updates in real-time (<100ms)
│  └─ UI shows: Stake button back to enabled state
├─ Toast (green): "Staked in Grassroots! ✅"
├─ Toast shows: "tx: 0x123...789"
└─ Next state: SUCCESS

[SUCCESS]
├─ User sees updated pool total
├─ User sees their contribution on InfinityWall (if top 10)
├─ Wallet balance decreased by 0.5 WIRE
├─ Can stake again immediately
└─ END

=============== ERROR PATHS ===============

[ERROR_REJECTED]
├─ Cause: User clicked "Reject" in MetaMask
├─ Error code: 4001 (UserRejectedRequestError)
├─ Component state: { writeError: { code: 4001, name: "UserRejectedRequestError" } }
├─ txGuardRef.current = false (allow retry)
├─ UI shows: Stake button back to enabled
├─ Toast (yellow): "Transaction cancelled"
└─ User can try again

[ERROR_TIMEOUT]
├─ Cause: MetaMask didn't respond for 60s
├─ Error code: -32603
├─ Component state: { writeError: { code: -32603 } }
├─ txGuardRef.current = false
├─ UI shows: Stake button back to enabled
├─ Toast (yellow): "Connection timeout. Try again."
└─ User can retry

[ERROR_INSUFFICIENT_GAS]
├─ Cause: User doesn't have enough WIRE for tx + gas
├─ Error code: "Insufficient funds for gas"
├─ Component validation catches this at INPUT_VALIDATION stage
├─ validationError = "Insufficient WIRE balance."
├─ UI shows: Red error text + Low balance warning
├─ Toast (yellow): "Low WIRE balance. Get WIRE from faucet"
└─ User cannot stake until balance fixed

[ERROR_INSUFFICIENT_MIN_STAKE]
├─ Cause: User entered 0.00005 WIRE (< minimum 0.0001)
├─ Component validation: "Minimum stake is 0.0001 WIRE"
├─ validationError = "Minimum stake is 0.0001 WIRE"
├─ UI shows: Stake button disabled, red error text
└─ User must enter ≥ 0.0001 WIRE

[ERROR_RPC_DOWN]
├─ Cause: publicClient.estimateContractGas() fails (RPC unreachable)
├─ Trigger: networkBusy = true at 5 second mark
├─ Component state: { networkBusy: true }
├─ Toast (yellow): "WireFluid node is congested, hang tight..."
├─ UI: Button remains clickable but disabled?
├─ After 7 seconds: networkBusy auto-resets to false
├─ If user still tries to stake with no gas estimate:
│  └─ writeContract() will fail with "RPC error"
│  └─ Toast (red): "Network error. Try again."
└─ User can retry when RPC recovers

[ERROR_TX_REVERTED]
├─ Cause: Smart contract logic fails (edge case)
├─ Example: "Pool is locked" (shouldn't happen)
├─ Transaction succeeds in mempool but fails on execution
├─ useWaitForTransactionReceipt() gets: { status: "reverted" }
├─ Component state: { isSuccess: false, error: "Pool is locked" }
├─ txGuardRef.current = false (allow retry)
├─ UI shows: Stake button back to enabled
├─ Toast (red): "Stake failed: Pool is locked"
├─ User cannot proceed (pool issue, not user issue)
└─ Admin must investigate

[ERROR_NETWORK_DISCONNECT]
├─ Cause: User's internet connection drops mid-transaction
├─ Scenario: TX submitted (SUBMITTED state), then WiFi drops
├─ publicClient.waitForTransactionReceipt() times out
├─ Component catches error: "Network request failed"
├─ User stays at: "Confirming..." (UI doesn't know tx failed)
├─ User can:
│  ├─ Wait for WiFi to return (will auto-recover)
│  ├─ Or click "Cancel" → Reset everything
│  └─ Or manually check tx on WireFluidScan explorer
├─ Toast (red after timeout): "Loss connection. Check status."
└─ Retry will resubmit same tx (or get "nonce too low" if already mined)

[ERROR_POOL_CLOSED]
├─ Cause: Admin closed the pool (match completed)
├─ Smart contract rejects: require(poolStatus == Open)
├─ Component state: { writeError: "Pool is not open" }
├─ Toast (red): "Pool is closed. Cannot stake."
├─ UI shows: Stake button disabled, red error text
└─ User cannot proceed

[ERROR_DOUBLE_CLICK]
├─ Cause: User clicks Stake twice very quickly
├─ txGuardRef.current prevents this:
│  ├─ First click: txGuardRef = true → executeStake() runs
│  ├─ Second click: txGuardRef still true → executeStake() returns early
│  └─ Second click ignored (no duplicate tx)
├─ UI: Both clicks see "Confirming..." (only 1 tx in flight)
└─ Only 1 transaction submitted to blockchain ✅

[ERROR_WRONG_CHAIN]
├─ Cause: User's wallet is on Ethereum, not WireFluid
├─ Error code: "Wrong chain"
├─ Component detects in wagmi config: chainId must be 92533
├─ UI shows: "Wrong network. Switch to WireFluid."
├─ Toast: "Please switch to WireFluid network in your wallet."
├─ Stake button disabled until user switches
└─ User must manually switch in MetaMask network dropdown

[ERROR_CONTRACT_ADDRESS_MISSING]
├─ Cause: env.NEXT_PUBLIC_MARKET_ADDRESS not set
├─ Result: writeContract() has address: undefined
├─ Error: "Invalid contract address"
├─ This is caught at build time
├─ UI shows: "App misconfigured. Contact admin."
└─ Never reaches user (should be caught in deployment)
```

---

## 3. Detailed Error Recovery Matrix

| Error | Root Cause | User Sees | Recovery | Auto-Retry |
|-------|-----------|-----------|----------|-----------|
| UserRejectedRequestError | User clicks Reject | "Transaction cancelled" | Click Stake again | ❌ No |
| Gas Estimation Failed | RPC down | 5s timer → "Node congested" | Wait for node, auto-resets after 7s | ⏱️ Auto-reset |
| Insufficient Balance | User balance < amount + gas | "Insufficient WIRE" | Get WIRE from faucet | ❌ No |
| Insufficient Min Stake | amount < 0.0001 WIRE | "Minimum stake is 0.0001 WIRE" | Enter larger amount | ❌ No |
| Pool Not Open | Admin closed pool | "Pool is closed" | Cannot proceed | ❌ No |
| TX Reverted | Smart contract logic rejects | Error from contract | Try again later | ❌ No |
| Wrong Chain | User on wrong network | "Switch to WireFluid network" | Switch MetaMask | ❌ No |
| Network Disconnect | Internet drops | "Confirming..." → timeout | Reconnect, check tx on explorer | ⏱️ Retry when online |
| RPC Timeout | RPC doesn't respond | "Connection timeout" | Try again | ❌ No |
| Double Click | User clicks twice | Only 1 tx submitted | (Auto-prevented by txGuardRef) | ✅ Yes |
| Nonce Too Low | TX submitted twice with same nonce | "Nonce too low" or duplicate | Wait for first to confirm | ✅ Auto-recover |

---

## 4. Network Status Indicators

### RPC Timeout Logic (5s → 7s Reset)

```jsx
// At 5 seconds of loading: Show warning
setTimeout(() => {
  if (isLoading) {
    setNetworkBusy(true);
    setToast({ message: "WireFluid node is congested, hang tight...", type: "warning" });
  }
}, 5000);

// At 7 seconds: Auto-reset (prevent ghost toasts)
useEffect(() => {
  if (!networkBusy) return;
  const resetTimer = setTimeout(() => {
    setNetworkBusy(false);
  }, 7000);
  return () => clearTimeout(resetTimer);
}, [networkBusy]);
```

### What "Congested Node" Means
- RPC is responding but slowly (taking >5s)
- Maybe high traffic, maybe temporary hiccup
- Will likely recover within 7-30 seconds
- User should wait, not spam-click

---

## 5. Success State Details

### On Transaction Success
```javascript
useEffect(() => {
  if (txSuccess && txHash) {
    // 1. Unlock for retry (next stake)
    txGuardRef.current = false;

    // 2. Show success toast
    setToast({
      message: `Staked in ${pillar.name}!`,
      type: "success",
      txHash,
    });

    // 3. Clear input
    setAmount("");

    // 4. Refetch local pool data (if we fetched it)
    if (externalPoolData === undefined) refetchPool();

    // 5. Refetch user's stake (if we fetched it)
    if (externalUserStake === undefined) refetchUserStake();

    // 6. Trigger callback to parent component
    if (onStakeSuccess) onStakeSuccess({ matchId, pillarId, txHash });

    // 7. ZERO LATENCY SYNC: Trigger InfinityWall refresh immediately
    if (infinityWallRef && infinityWallRef.current) {
      infinityWallRef.current.refetchWall();
    }

    // Contract events fire instantly via watchContractEvent()
    // Leaderboard updates in <100ms (before user even sees success toast!)
  }
}, [txSuccess, txHash, ...deps]);
```

### Toast Auto-Dismiss
- Success: 5 seconds then auto-close
- Warning: 10 seconds then auto-close
- Error: 12 seconds then auto-close
- User can click X to close immediately

---

## 6. Special Cases

### Case 1: Stake Twice in Same Block
- User stakes 0.5 WIRE → Tx submitted → Immediately clicks Stake again (before confirmation)
- **txGuardRef prevents this** → 2nd click ignored
- Result: Only 1 transaction on chain ✅

### Case 2: Switch Network Mid-Stake
- User is on WireFluid → Clicks Stake → Switches to Ethereum in MetaMask
- **useAccount() detects chain change** → chainId changes
- **writeContract() fails** → "Wrong chain error"
- User must switch back to WireFluid → Try again

### Case 3: Close Tab Mid-Staking
- User stakes → Tab closes → Never sees confirmation
- **Transaction continues on-chain** (doesn't care if tab is open)
- User can check WireFluidScan later with tx hash (saved in toast if they saw it)
- Or check wallet balance (it decreased when tx confirmed)

### Case 4: Rejected Tx After Signing
- User signs in MetaMask → TX goes to mempool → RPC rejects it for business logic
- **useWaitForTransactionReceipt() gets status: 0 (reverted)**
- **Component catches:** isSuccess = false, error = contract message
- UI shows: "Stake failed: [reason from contract]"
- **txGuardRef is reset** → User can retry

---

## 7. Wallet State Persistence

### localStorage (Optional, for better UX)
```javascript
// On successful connection
if (isConnected) {
  localStorage.setItem("lastConnectedWallet", connectorName);
  localStorage.setItem("expectedUserAddress", address);
}

// On app load
useEffect(() => {
  const lastWallet = localStorage.getItem("lastConnectedWallet");
  if (lastWallet) {
    // Auto-reconnect to MetaMask (if user grants permission again)
    auto_connect(lastWallet);
  }
}, []);
```

### What localStorage Does NOT Store
- ❌ Private keys (NEVER)
- ❌ Tx hashes (browser-only, contracts have truth)
- ❌ User balances (fetched from contract each time)
- ❌ Pool data (fetched from contract each time)

### What Gets Persisted On-Chain
- ✅ User's total staked amount
- ✅ User's ranking on leaderboard
- ✅ All transaction history (immutable on blockchain)
- ✅ Badges earned (NFT ownership)

---

## 8. Complete Wagmi Hooks Reference for Staking

```javascript
// PoolCard.jsx uses these exact hooks:

// 1. Read pool data (no tx cost)
const { data: fetchedPoolData } = useReadContract({
  address: MARKET_ADDRESS,
  abi: MARKET_ABI,
  functionName: "getPool",
  args: [BigInt(matchId), pillarId],
  enabled: !!matchId && !externalPoolData, // Only fetch if not provided
});

// 2. Read user's stake (no tx cost)
const { data: fetchedUserStake } = useReadContract({
  address: MARKET_ADDRESS,
  abi: MARKET_ABI,
  functionName: "getUserStake",
  args: [BigInt(matchId), pillarId, address],
  enabled: !!matchId && !!address && !externalUserStake,
});

// 3. Read minimum stake (no tx cost)
const { data: minStakeRaw } = useReadContract({
  address: MARKET_ADDRESS,
  abi: MARKET_ABI,
  functionName: "minStakeAmount",
  enabled: true, // Always fetch
});

// 4. Write stake tx (costs gas)
const { writeContract, data: txHash, isPending } = useWriteContract();

// 5. Wait for tx confirmation (poll every 1s)
const { isLoading: isConfirming, isSuccess: txSuccess } = 
  useWaitForTransactionReceipt({ 
    hash: txHash 
  });

// 6. Get public client (for gas estimation + event listeners)
const publicClient = usePublicClient();

// 7. Listen to real-time events (no cost)
useEffect(() => {
  if (!publicClient) return;
  const unsub = publicClient.watchContractEvent({
    address: MARKET_ADDRESS,
    abi: MARKET_ABI,
    eventName: "Staked",
    onLogs: () => {
      refetchWall(); // Leaderboard updates instantly
    },
  });
  return () => unsub?.();
}, [publicClient]);
```

This is the **EXACT sequence** every staking transaction follows. No mystery, no black boxes.
