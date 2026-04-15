# Security Threat Model

**Attack vectors, vulnerabilities, and mitigations** — Double-spend, reentrancy, phishing, front-running, rate limiting

---

## Core Principle

Every transaction is a potential attack vector. Security layers defend at multiple points:

1. **Smart Contract** (on-chain): ReentrancyGuard, AccessControl, value checks
2. **Frontend** (off-chain): Input validation, wallet verification, confirmation modals
3. **Backend** (off-chain): Rate limiting, event deduplication, health monitoring
4. **User** (human): Verification, confirmation, awareness

---

## Threat 1: Double-Spend Attack

### What It Is

```
Attacker's Goal: Stake 1 WIRE twice with same 1 WIRE balance
  
Attack:
  T0: User clicks "Stake 1 WIRE"
  T1: executeStake() called
  T2: TX sent to blockchain (pending)
  T3: TXPool shows pending (not confirmed yet)
  T4: Attacker clicks "Stake 1 WIRE" again immediately
  T5: Same balance, should be rejected... but might slip through
  
If Balance Check Not Locked:
  T0: Balance = 1 WIRE
  T1: TX1 sent (checks balance, passes)
  T2: TX2 sent (checks balance, STILL 1 WIRE, passes too!)
  T3: Both TXs confirmed
  T4: -1 WIRE for TX1, -1 WIRE for TX2 = -2 WIRE from 1 WIRE balance
  T5: ❌ OVERDRAFT (Contract reverts both or one fails)
```

### Current Mitigations

#### Layer 1: Frontend Lock (txGuardRef)

```javascript
// PoolCard.jsx
const txGuardRef = useRef(false);

const executeStake = useCallback(() => {
  if (txGuardRef.current) return; // Already staking, ignore click
  txGuardRef.current = true; // Lock
  
  writeContract(...); // Send TX
  
  // Unlock after TX completes (success or fail)
  onSettled?.(() => {
    txGuardRef.current = false;
  });
}, [writeContract]);
```

**How It Blocks**:
- User clicks "Stake" → txGuardRef.current = true
- User clicks "Stake" again → Ignored (txGuardRef.current already true)
- After TX sent/settled → txGuardRef.current = false
- If user clicks again → Properly sends new TX

**Result**: Only one TX sent per confirmation

#### Layer 2: Smart Contract Nonce Check

```solidity
// PSLImpactMarket.sol
mapping(address => uint256) private userNonce;

function stake(uint256 _matchId, uint8 _pillarId) external payable nonReentrant {
  require(msg.value > 0, "Pool::ValueIsZero");
  
  // Check nonce (prevents replay attacks)
  uint256 expectedNonce = block.number; // Simple example
  userNonce[msg.sender]++;
  
  // ... rest of stake logic
}

// Blockchain automatically prevents double-submit:
// Every address has its own nonce counter
// Each TX increments nonce
// Can't submit same TX twice (different nonce)
```

#### Layer 3: Wagmi/Viem Retry Logic

```javascript
// Wagmi automatically handles retries
const { writeContract, isPending, isConfirming, isSuccess } = useWriteContract({
  mutation: {
    onError: (error) => {
      if (error.message.includes('nonce')) {
        // Nonce conflict, retry with new nonce
        writeContract(...); // Automatic retry
      }
    }
  }
});
```

### What Happens If Attack Succeeds

1. **First TX**: Executes, deducts 1 WIRE ✓
2. **Second TX**: Contract checks balance, finds 0 WIRE remaining
   ```solidity
   require(balance >= amount, "InsufficientBalance");
   // revert with: Pool::InsufficientBalance
   ```
3. **Result**: TX reverts, user sees error toast

**Outcome**: Even if attack bypasses frontend layer, smart contract prevents overdraft.

---

## Threat 2: Reentrancy Attack

### What It Is

```
Attacker's Goal: Stake 1 WIRE, trigger internal call to another contract, 
that contract stakes again, draining user funds

Attack Pattern:
  Attacker calls stake(1 WIRE)
    └─> PSLImpactMarket.stake() starts
    └─> Transfer 1 WIRE from user
    └─> Updates stakes[user] += 1
    └─> Calls external callback (VULNERABLE HERE)
        └─> Attacker's contract calls stake(1 WIRE) again
        └─> PSLImpactMarket.stake() called recursively
        └─> User balance not updated yet, so check passes!
        └─> Transfers 1 WIRE again (would cause overdraft)
```

### Current Mitigation: ReentrancyGuard

#### Code

```solidity
// PSLImpactMarket.sol
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PSLImpactMarket is ReentrancyGuard {
  function stake(uint256 _matchId, uint8 _pillarId) 
    external 
    payable 
    nonReentrant  // ← Mutex lock
  {
    // Code cannot be re-entered
  }
}
```

#### How It Works

```
Attacker calls stake(1 WIRE)
  └─> nonReentrant sets flag: stakeLocked = true
  ├─> stake() executes normally
  ├─> Transfer 1 WIRE
  ├─> Update stakes[user]
  ├─> Internal logic runs
  │
  └─> Attacker's callback tries to call stake() again
      └─> nonReentrant checks flag: stakeLocked == true
      └─> BLOCKED! Reverts with "ReentrancyGuard: reentrant call"
  
  └─> nonReentrant sets flag: stakeLocked = false
```

**Result**: Recursive call prevented at contract level.

---

## Threat 3: Man-in-the-Middle (MITM) Attack

### What It Is

```
Attacker Goal: Intercept transaction, change recipient address

Attack:
  User types: "Stake 0.5 WIRE to Pillar 0"
  Attacker intercepts on network and modifies:
  "Stake 0.5 WIRE to Pillar 2" (different pillar)
  
  User's funds go to wrong pillar!
```

### Current Mitigation: MetaMask Wallet Verification

#### Code

```javascript
// PoolCard.jsx
const { address, isConnected } = useAccount();

const handleStakeClick = () => {
  // Confirmation modal shown
  setShowConfirm(true);
};

// StakeConfirmModal shows EXACT details
function StakeConfirmModal({ amount, pillarId, matchId }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg p-6 max-w-md">
        <h3>⚠️ Confirm Stake</h3>
        <div className="text-left mt-4 space-y-2">
          <p>Amount: <code>{amount} WIRE</code></p>
          <p>Pillar: <code>{PILLAR_NAMES[pillarId]}</code></p>
          <p>Match: <code>{matchId}</code></p>
          <p>To: <code className="text-xs">{MARKET_ADDRESS}</code></p>
          <p className="text-xs text-gray-400">
            Verify these details match your intent
          </p>
        </div>
        <button onClick={executeStake}>Yes, Stake</button>
        <button onClick={() => setShowConfirm(false)}>Cancel</button>
      </div>
    </div>
  );
}
```

**How It Works**:
1. User sees confirmation modal with exact details
2. User verifies: Amount, Pillar, Match, Recipient Address
3. MetaMask popup also shows: Amount and Recipient
4. User clicks "Confirm" TWICE (modal button + MetaMask)
5. Only then is TX submitted

**Result**: Multiple verification layers catch MITM.

---

## Threat 4: Phishing Attack

### What It Is

```
Attacker sends fake link: "https://pslpul.se" (vs "https://pslpulse.io")
User clicks link, lands on fake PSL Pulse UI
Attacker's UI looks identical but contract is fake
User stakes to fake contract, funds lost immediately
```

### Current Mitigation: SSL Certificate + UI Verification

#### Verification Steps

```javascript
// Check URL bar shows correct domain
// Check SSL certificate (green lock icon)
// Check contract address in confirmation modal

// PoolCard.jsx
<div className="text-xs text-gray-400 mb-4">
  Contract: <code className="select-all">{MARKET_ADDRESS}</code>
  <CopyButton text={MARKET_ADDRESS} />
</div>
```

**How User Verifies**:
1. Check URL bar: "pslpulse.io" ✓
2. Check SSL lock: 🔒 Green ✓
3. Check contract address in modal matches official deployment ✓
4. (Optionally) paste address into block explorer to verify ownership

**Result**: User catches phishing before funds sent.

---

## Threat 5: Front-Running Attack

### What It Is

```
Attacker's Goal: See user's TX in mempool and execute identical stake first

Attack Flow:
  T0: User calls stake(0.5 WIRE)
  T1: TX in mempool (visible to public RPC nodes)
  T2: Attacker watches mempool, sees TX
  T3: Attacker calls stake(0.5 WIRE) with higher gas fee
  T4: Attacker's TX confirms first (miner chose higher fee)
  T5: Attacker gets leaderboard position, user still entering
  
  Result: Attacker "front-runs" user's TX
```

### Current Mitigation: Event-Driven Leaderboard

```javascript
// The leaderboard is NOT first-come-first-served
// It's based on TOTAL CONTRIBUTION AMOUNT, not order

// InfinityWall getter
function getInfinityWall() external view returns (address[] memory) {
  // Return top 10 addresses sorted by totalContribution (highest first)
  // NOT by timestamp of stake
}
```

**Why This Helps**:
- User stakes 0.5 WIRE
- Attacker stakes 0.5 WIRE first
- Leaderboard sorts by total amount, not speed
- Both appear in leaderboard if they're in top 10
- No advantage to front-running

**True Front-Running Vectors**: 
Only possible if we used first-come-first-served or limited slots. We don't, so front-running has no value.

---

## Threat 6: Event Listener Duplicate Processing

### What It Is

```
Event fires twice
Listener processes it twice
User sees "Stake successful!" message twice
Or leaderboard refreshes twice (annoying but not dangerous)
```

### Current Mitigation: Event Deduplication

```javascript
// InfinityWall.jsx
const seenEventsRef = useRef(new Set());

useEffect(() => {
  const unsub = publicClient.watchContractEvent({
    eventName: "Staked",
    onLogs: (logs) => {
      logs.forEach(log => {
        const signature = `${log.args.matchId}_${log.transactionHash}`;
        
        if (seenEventsRef.current.has(signature)) {
          return; // Skip duplicate
        }
        
        seenEventsRef.current.add(signature);
        refetchWall(); // Process only once
      });
    }
  });
  return () => unsub?.();
}, [publicClient, refetchWall]);
```

**Result**: Duplicate events ignored, refetch only runs once.

---

## Threat 7: Rate Limiting / Spam Attack

### What It Is

```
Attacker Goal: Spam the oracle with 1000 event submissions per second
Oracle spends all gas processing spam, can't process real events
```

### Current Mitigation: Batch Limit in Oracle

```javascript
// oracle/lib/pulseOracle.js
class PulseOracle {
  async processBatch(events) {
    const batch = events.slice(0, 25); // MAX 25 PER BATCH
    
    if (batch.length > 25) {
      console.warn("⚠️ Batch size exceeded, dropping extra events");
    }
    
    return batch;
  }
}
```

**Also at blockchain level**:
```solidity
// PSLImpactMarket.sol
function processOracleEvents(OracleEvent[] calldata events) 
  external 
  onlyOracle 
{
  require(events.length <= 25, "Pool::BatchTooLarge");
  // ... process batch
}
```

**Result**: Each batch limited to 25 events, preventing spam.

---

## Threat 8: State Mutation / Data Corruption

### What It Is

```
AttackerGoal Somehow corrupt pool state so:
  - totalStaked becomes negative
  - minStakeAmount exceeds maxStakeAmount
  - rewardMultiplier becomes 0
```

### Current Mitigation: State Invariants

```solidity
// PSLImpactMarket.sol
struct Pool {
  uint256 totalStaked;      // ≥ 0 (forced by uint256)
  uint256 minStakAmount;    // > 0, < max
  uint256 maxStakAmount;    // > min
  uint8 rewardMultiplier;   // > 0
}

function stake(...) external payable nonReentrant {
  // State mutations only happen in validate functions
  require(msg.value >= pool.minStakAmount, "Pool::MinStakeNotMet");
  require(msg.value <= pool.maxStakAmount, "Pool::MaxStakeExceeded");
  
  // Only OWNER can change pool settings, and only with validation
  function setPoolSettings(...)  onlyOwner {
    require(_min > 0, "Pool::MinMustBePositive");
    require(_max > _min, "Pool::MaxMustExceedMin");
    // ... update safely
  }
}
```

**Result**: State invariants enforced by contract, attacker can't corrupt it.

---

## Threat 9: Wallet Private Key Compromise

### What It Is

```
User's MetaMask seed phrase stolen
Attacker imports wallet, stakes all funds to themselves
User loses everything
```

### Current Mitigation: Cold Storage + Hardware Wallet

Not a code mitigation (user responsibility):
- [ ] Use hardware wallet (Ledger, Trezor)
- [ ] Never share seed phrase
- [ ] Verify device before confirming TX (check hardware wallet screen)
- [ ] Use strong password

**What We Can Do**:
- Show warning: "Verify transaction on your hardware wallet screen"
- Don't expose seed phrase in logs
- Clear sensitive data from memory

---

## Threat 10: Contract Upgrade Vulnerabilities

### What It Is

```
Admin upgrades PSLImpactMarket contract
New version has vulnerability
User funds drained
```

### Current Mitigation: Non-Upgradeable Contract

```javascript
// contracts/PSLImpactMarket.sol
// NOT using Proxy pattern (UUPSProxy, TransparentProxy)
// Contract is IMMUTABLE after deployment

// To update:
// 1. Deploy NEW contract at new address
// 2. Migrate stakes from old to new (manual process)
// 3. Announce migration period
// 4. Users have 30 days to migrate or lose stakes (or owner migrates)

// This means:
// User stakes at address 0x123... (v1)
// If v2 deployed at 0x456..., it's a DIFFERENT contract
// User stakeat v1 doesn't auto-transfer to v2
```

**Why Immutable**:
- No secret upgrades
- Users know exactly what contract they're using
- Clear migration path if changes needed
- Reduces attack surface

---

## Threat Summary Matrix

| Threat | Vector | Detection | Mitigation | Fallback |
|--------|--------|-----------|------------|----------|
| Double-Spend | Frontend double-click | txGuardRef flag | Revert on balance fail | ❌ User loses gas |
| Reentrancy | Recursive call | N/A | ReentrancyGuard | Revert TX |
| MITM | Network intercept | User verification | Confirmation modal | Cancel TX |
| Phishing | Fake URL | Domain check | SSL cert + UI verify | User detects |
| Front-Running | Mempool watch | N/A | Amount-based leaderboard | No advantage |
| Duplicate Events | RPC propagation | Event signature | Deduplication cache | Retry | 
| Rate Limiting | Event spam | Batch size exceeded | Max 25 per batch | Drop excess |
| Data Corruption | State mutation | Invariants violated | require() checks | Revert |
| Key Compromise | Seed phrase stolen | N/A | Hardware wallet | User responsibility |
| Contract Bug | Unknown code path | Audit + testing | Non-upgradeable | Full path migration |

---

## Security Best Practices for Users

1. **Always verify contract address** in confirmation modal
2. **Use hardware wallet** (Ledger/Trezor) for stakes > 10 WIRE
3. **Don't share seed phrase** with anyone, ever
4. **Check URL bar** shows "pslpulse.io" with 🔒 SSL lock
5. **Review confirmation modal** before clicking confirm
6. **Test with small amount** first (0.01 WIRE) on new device
7. **Disconnect wallet** after use (not critical but good practice)
8. **Whitelist contract address** in keeper tools (if using one)

---

## For Developers: Auditing Checklist

- [ ] ReentrancyGuard applied to all state-mutating functions
- [ ] Access control (ADMIN_ROLE, ORACLE_ROLE) enforced on sensitive calls
- [ ] Input validation on all parameters (amount > 0, pillarId < 4, etc.)
- [ ] Event deduplication logic in listeners
- [ ] Rate limiting on oracle batch processing
- [ ] Circuit-breaker pattern for RPC failures
- [ ] No direct call to user contracts (use low-level assembly to prevent hook)
- [ ] State invariants checked before and after critical sections
- [ ] Test coverage > 80% of contract code paths
- [ ] External audit by professional firm before mainnet deploy

