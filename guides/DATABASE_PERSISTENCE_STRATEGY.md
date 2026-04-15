# Database & Persistence Strategy

**Where data lives, what's immutable, backup/restore, migration paths** — On-chain vs off-chain, localStorage strategy, data durability

---

## Core Principle

**Single Source of Truth (SSOT)**: For each data type, exactly ONE system is authoritative, others are copies.

```
User Stake:
  ├─ ON-CHAIN (Source of Truth): PSLImpactMarket.getUserStakes()
  │   └─ Immutable once written
  │   └─ Survives server downtime
  │   └─ Can always recover by re-reading contract
  │
  └─ OFF-CHAIN (Cache): Frontend state, localStorage
      └─ Temporary, can be stale
      └─ Cleared if browser cache deleted
      └─ Only reads from, never writes to
```

---

## 1. Data Classification

### Category A: Immutable On-Chain Data

| Data | Storage | Retrievable | Modifiable |
|------|---------|-------------|-----------|
| **Match schedule** | Contract state (deployMatch) | ✓ Yes (getMatch) | ❌ No (immutable) |
| **Team addresses** | Contract state | ✓ Yes (getTeams) | ❌ No |
| **Pool settings** (min/max stake) | Contract state | ✓ Yes (getPool) | ⚠ Only by owner |
| **All stakes** | Contract state (mapping) | ✓ Yes (getUserStakes) | ❌ No (settled) |
| **All tips** | On-chain events | ✓ Yes (queryFilter) | ❌ No (settled) |
| **Leaderboard** | Derived from stakes | ✓ Yes (computed) | ❌ No (compute-time) |

**Persistence**: ✅ 100% durable (survives all failures)

### Category B: Semi-Mutable On-Chain Data

| Data | Storage | Retrievable | Modifiable |
|------|---------|-------------|-----------|
| **Match status** | Contract state | ✓ Yes (getMatch) | ⚠ Owner only (finalize, close) |
| **Pool isOpen flag** | Contract state | ✓ Yes (getPool) | ⚠ Owner on close/finalize |
| **Reward multiplier** | Contract state | ✓ Yes (getPool) | ⚠ Owner before match |

**Persistence**: ✅ 100% durable (updates are transactions)

**Update Pattern**:
```solidity
// Admin calls
function finalizeMatch(uint256 _matchId, uint8 _pillarId) external onlyOwner {
  // Changes: pools[matchId][pillarId].isOpen = false
  // Changes: All payouts calculated and distributed
  // Event: MatchFinalized emitted
}
```

### Category C: Transient Off-Chain Data

| Data | Storage | Retrievable | Modifiable | Persistence |
|------|---------|-------------|-----------|---|
| **Live scores** from Cricbuzz | Oracle cache (RAM) | ✓ Yes | ✅ Yes (poll 60s) | ⚠ Lost on server restart |
| **Last update timestamp** | Oracle cache (RAM) | ✓ Yes | ✅ Yes (auto) | ⚠ Lost on restart |
| **Network status** | Frontend state | ✓ Yes | ✅ Yes (polling) | ❌ Lost on page reload |
| **Modal open/close state** | Frontend state | ✓ Yes | ✅ Yes (user) | ❌ Lost on reload |

**Persistence**: ❌ Not durable (lost on failure)

**Backup Strategy**: None (transient, can be recomputed)

### Category D: Persistent Off-Chain Data (localStorage)

| Data | Storage | Purpose | TTL | Persistence |
|------|---------|---------|-----|---|
| **Connected wallet address** | localStorage | Auto-reconnect | Never expires | ✓ Until cache clear |
| **Last entered amount** | localStorage | UX convenience | 7 days | ✓ Until cache clear |
| **User theme preference** | localStorage | UX preference | Never expires | ✓ Until cache clear |

**Example**:
```javascript
// In frontend
useEffect(() => {
  if (isConnected) {
    localStorage.setItem('connectedAddress', address);
  }
}, [isConnected, address]);

useEffect(() => {
  const saved = localStorage.getItem('connectedAddress');
  if (saved) {
    // Auto-connect on page reload
    connect({ address: saved });
  }
}, []);
```

**Persistence**: ⚠ Until browser cache cleared (user can delete)

---

## 2. Where Each Data Type Lives

### Diagram: Data Flow

```
Cricbuzz (Live Scores)
  ↓
Oracle (PulseOracle in RAM cache)
  ├─ Refreshes every 60s
  ├─ Lost on server restart
  └─→ Events to Contract
       ├─ Match status updated (on-chain)
       └─→ Users read from contract (SSOT)

Smart Contract (PSLImpactMarket)
  ├─ Immutable: Match ID, Team addresses, Pool creation
  ├─ Semi-mutable: Match status, Pool isOpen, Rewards
  ├─ Events: All transactions (Staked, Tipped, etc.)
  └─→ Data for UI

localStorage
  ├─ Connected address (auto-reconnect)
  ├─ Theme preference
  └─ NOT for stakes (too risky)

Frontend State (React)
  ├─ Modal open/close
  ├─ Form input values
  ├─ Temporary UI state
  └─ Lost on page reload (OK)
```

---

## 3. On-Chain Data: Storage Patterns

### Smart Contract Storage Layout

```solidity
contract PSLImpactMarket {
  // IMMUTABLE (set once, never change)
  uint256 constant SEASON = 2026;
  
  // MUTABLE (owner can change before season starts)
  mapping(uint256 matchId => Match) public matches;
  
  // MUTABLE (auto-updated on stake)
  mapping(uint256 matchId => mapping(uint8 pillarId => Pool)) public pools;
  
  // EVENTS (immutable history)
  event Staked(uint256 indexedmatchId, address indexed staker, uint256 amount);
  
  // WITHDRAWALS (users can claim)
  mapping(address user => uint256) public withdrawablefunds;
}
```

### Querying On-Chain Data

```javascript
// 1. Direct state reads (fast, free)
const poolData = await contract.getPool(matchId, pillarId);

// 2. Event queries (slower, can scan history)
const allStakesForUser = await contract.queryFilter(
  contract.filters.Staked(null, userAddress),
  fromBlock,
  toBlock
);

// 3. Computed data (gas-free getter)
const leaderboard = await contract.getInfinityWall();
```

---

## 4. Off-Chain Data: Database Strategy

### Current Architecture (Minimal Database)

```
No traditional database (PostgreSQL, MongoDB)
Reason: Blockchain is the source of truth, no need for DB

Instead:
├─ Contract state = data storage
├─ Contract events = audit log
└─ Oracle cache (RAM) = temporary state
```

### If Adding Off-Chain Database Later

#### Use Case: Indexing for Speed

```
Why: Querying "All stakes in match 1" requires scanning events
     Takes 5-10 seconds if many events
     
Solution: Database index
```

```javascript
// PostgreSQL schema for indexing
CREATE TABLE stakes (
  id SERIAL PRIMARY KEY,
  user_address VARCHAR(42),
  match_id INT,
  pillar_id INT,
  amount BIGINT, // In Wei
  timestamp INT,
  transaction_hash VARCHAR(66) UNIQUE,
  block_number INT,
  FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE INDEX idx_stakes_user ON stakes(user_address);
CREATE INDEX idx_stakes_match ON stakes(match_id, pillar_id);
```

#### Syncing Database from Blockchain

```javascript
// Event syncer (runs continuously)
class EventSyncer {
  async syncStakes() {
    const lastSyncedBlock = await db.query('SELECT max(block_number) FROM stakes');
    const currentBlock = await publicClient.getBlockNumber();
    
    // Query events in batches (prevent rate limit)
    for (let block = lastSyncedBlock; block <= currentBlock; block += 1000) {
      const logs = await publicClient.getLogs({
        address: MARKET_ADDRESS,
        event: Staked,
        fromBlock: block,
        toBlock: Math.min(block + 1000, currentBlock)
      });
      
      // Insert into DB
      for (const log of logs) {
        await db.query(
          `INSERT INTO stakes (user_address, match_id, pillar_id, amount, timestamp, transaction_hash, block_number)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [log.args.staker, log.args.matchId, log.args.pillarId, log.args.amount, log.args.timestamp, log.transactionHash, log.blockNumber]
        );
      }
    }
  }
}
```

**Important**: Database is a CACHE only
- Truth is always on-chain
- Database can be deleted, re-synced from scratch
- If DB and contract disagree → Contract wins

---

## 5. Backup & Restore Strategy

### What to Backup

| Data | How Often | Storage | Recovery Time |
|------|-----------|---------|---|
| Contract bytecode | After deployment | GitHub + IPFS | Instant (immutable) |
| Contract state snapshots | Monthly | AWS S3 | Instant (query contract) |
| Event logs | Continuous | Blockchain (immutable) | N/A (always available) |
| localStorage data | N/A | Browser | N/A (user-local) |

### Backup Process

```javascript
// Monthly snapshot
async function backupContractState() {
  const snapshot = {
    timestamp: Date.now(),
    network: 'wirefluid',
    matches: [],
    pools: {}
  };
  
  // Snapshot all matches
  for (let matchId = 1; matchId <= 44; matchId++) {
    const match = await contract.getMatch(matchId);
    snapshot.matches.push(match);
    
    // Snapshot all pools for this match
    for (let pillarId = 0; pillarId < 4; pillarId++) {
      const pool = await contract.getPool(matchId, pillarId);
      snapshot.pools[`${matchId}_${pillarId}`] = pool;
    }
  }
  
  // Upload to S3
  await s3.putObject({
    Bucket: 'psl-pulse-backups',
    Key: `snapshot-${Date.now()}.json`,
    Body: JSON.stringify(snapshot)
  });
  
  console.log('✓ Backup complete');
}
```

### Recovery Procedure (If Contract Destroyed)

**Scenario**: PSLImpactMarket contract compromised, need to redeploy

```javascript
// Step 1: Deploy new contract
const newMarket = await PSLImpactMarket.deploy();

// Step 2: Replay all history into new contract
const backupSnapshot = require('s3://backup-latest.json');

async function recoverFromBackup(backup) {
  // 1. Re-deploy all 44 matches
  for (const match of backup.matches) {
    await newMarket.deployMatch(
      match.id,
      match.minStakes,
      match.maxStakes,
      match.rewardMultipliers,
      match.scheduledTime
    );
  }
  
  // 2. Replay all staked events (re-credit users)
  const logs = await publicClient.getLogs({
    address: oldMarketAddress,
    event: Staked,
    fromBlock: 0
  });
  
  for (const log of logs) {
    // Mint rewards back to user (admin function)
    await newMarket.creditStake(
      log.args.staker,
      log.args.matchId,
      log.args.pillarId,
      log.args.amount
    );
  }
  
  console.log('✓ Recovery complete, all stakes restored');
}
```

**User Impact**: Stakes fully restored (on-chain data is immutable)

---

## 6. Data Migration (Contract Upgrade)

### Scenario: PSL 2027 Season, New Contract Features

```
Old Contract (PSLImpactMarket_v1): All 44 matches done
New Contract (PSLImpactMarket_v2): New features, same matches

Users have stakes in v1, need to migrate to v2
```

### Migration Process

#### Option 1: User-Initiated Migration (30-day window)

```javascript
// In PSLImpactMarket_v2
function migrateFromOldContract(
  address oldContractAddress,
  uint256[] calldata matchIds,
  uint8[] calldata pillarIds
) external {
  // 1. Query user's stakes in old contract
  IPSLImpactMarket_v1 oldContract = IPSLImpactMarket_v1(oldContractAddress);
  Stake[] memory oldStakes = oldContract.getUserStakes(msg.sender);
  
  // 2. Update user's stakes in new contract
  for (Stake memory stake in oldStakes) {
    stakes[msg.sender].push(stake);
  }
  
  // 3. Optionally transfer funds
  // (if new contract uses WIRE instead of direct ETH)
}
```

**User Steps**:
1. Receive notification: "Migrate your stakes to v2"
2. Visit app, click "Migrate"
3. Approve transaction (one-time)
4. Stakes automatically transferred

#### Option 2: Admin-Initiated Migration (Snapshot)

```javascript
// Admin calls after 30-day window
function migrateUnclaimedStakes(address user) 
  external 
  onlyOwner 
{
  // 1. Query user's stakes in old contract
  Stake[] memory stakes = oldContract.getUserStakes(user);
  
  // 2. Credit user in new contract + send email
  for (Stake memory stake in stakes) {
    newContract.creditStake(user, stake);
  }
  
  notifyUser(user, 'Your stakes have been migrated');
}
```

**Timeline**:
- T0: v2 deployed, migration window opens
- T0+30d: User-initiated migration closes
- T0+31d: Admin migrates unclaimed stakes
- All stakes preserved ✓

---

## 7. Data Consistency Guarantees

### What's Guaranteed

| Guarantee | Level | Meaning |
|-----------|-------|---------|
| **Atomicity** | ✅ Strong | Stake either fully succeeds or fully fails (no partial) |
| **Consistency** | ✅ Strong | After stake, totalStaked updated before returning |
| **Isolation** | ✅ Strong | Two simultaneous stakes don't interfere |
| **Durability** | ✅ Strong | Once confirmed on-chain, survives all failures |

### What's NOT Guaranteed

| Issue | Level | Meaning |
|-------|-------|---------|
| **Frontend state matches contract** | ⚠ Eventual | Might lag 5-10 seconds while updating |
| **Event arrives immediately** | ⚠ Eventual | Might delay 2-5 seconds due to RPC |
| **User sees updated leaderboard** | ⚠ Eventual | Refetches on event, but event might delay |
| **localStorage matches contract** | ❌ No guarantee | localStorage can be stale or missing |

---

## 8. Data Durability Levels

### Level 1: Immutable (Blockchain)

```
Survival: Server down, RPC down, frontend down =
           Still recoverable by querying blockchain
           
Example: User stake of 0.5 WIRE
  └─ Survives everything, can recover with just address
```

### Level 2: Durable (Events)

```
Survival: Short outages, temporary RPC issues

Example: Oracle processes stake event, updates leaderboard
  └─ Event recorded on-chain, even if frontend crashes
  └─ On recovery, re-read events, rebuild leaderboard
```

### Level 3: Semi-Durable (Indexed)

```
Survival: Only while database is running

Example: PostgreSQL stakes table
  └─ If DB server crashes, data is lost
  └─ BUT can be re-synced from blockchain events
```

### Level 4: Volatile (In-Memory)

```
Survival: Only while server is running

Example: Oracle cache of live cricket scores
  └─ Lost on server restart
  └─ Fetch fresh from Cricbuzz on recovery
```

### Level 5: Local (Browser)

```
Survival: Only while browser open, localStorage until cleared

Example: Form input "0.5 WIRE" in amount field
  └─ Lost on page reload (reload form is empty)
  └─ localStorage persists unless user clears cache
```

---

## 9. Data Retention Policy

### How Long to Keep Data

| Data | Keep Duration | Why | Storage |
|------|---|---|---|
| Smart contract state | Forever | Source of truth | On-chain |
| Block events | Forever | Immutable history | On-chain |
| User stakes | Forever | Needed for rewards | Contract |
| Backup snapshots | 2 years | Recovery if needed | S3/IPFS |
| Oracle logs | 30 days | Debugging RPC issues | Oracle server |
| localStorage | Until cleared | User option | Browser |

### Pruning Policy

```javascript
// Cleanup old backups (keep only 12 most recent)
async function pruneOldBackups() {
  const backups = await s3.listObjects({
    Bucket: 'psl-pulse-backups',
    Prefix: 'snapshot-'
  });
  
  const sorted = backups.sort((a, b) => 
    new Date(b.LastModified) - new Date(a.LastModified)
  );
  
  // Delete backups older than 12
  for (let i = 12; i < sorted.length; i++) {
    await s3.deleteObject({
      Bucket: 'psl-pulse-backups',
      Key: sorted[i].Key
    });
  }
}
```

---

## 10. Disaster Recovery Checklist

**Before PSL 2026**:

- [ ] Deploy contract on mainnet (WireFluid)
- [ ] Verify contract address publicly
- [ ] Store ABI in multiple places (GitHub, IPFS)
- [ ] Set up monthly backup snapshots
- [ ] Test recovery procedure (on testnet)
- [ ] Document migration path for contract upgrades

**During PSL 2026**:

- [ ] Monitor backup job (run monthly)
- [ ] Keep RPC health checks running
- [ ] Archive oracle logs
- [ ] Verify no data corruption

**If Disaster Occurs**:

1. **RPC Down**: Failover to backup RPC node (pre-configured)
2. **Oracle Down**: Restart oracle service, re-fetch events since crash
3. **Contract Hack**: Deploy new contract, use backup snapshot to recover state
4. **User Funds Lost**: Replay events, restore stakes from on-chain history

---

## Summary: Data Lifespan

```
Match 1 Stake:
  T0: User stakes 0.5 WIRE
      ├─ Stored: Frontend useState
      ├─ Stored: localStorage (last amount)
      ├─ Stored: Oracle cache (temporary)
  
  T1: TX submitted to blockchain
      ├─ Stored: Mempool (pending)
      ├─ Stored: Block (on-chain)
      └─ Stored: Event logs (immutable forever)
  
  T2-5s: User sees success notification
      ├─ Stored: Frontend state (success)
      ├─ Stored: localStorage (connected address, amount)
      └─ Stored: Leaderboard cache (event refetch)
  
  T10+: Event processed, leaderboard updated
      ├─ Stored: Contract state (totalStaked updated)
      └─ Stored: Any database index
  
  T1-year: PSL 2026 ends
      ├─ Match finalized
      ├─ Rewards distributed
      ├─ Stake record archived
      └─ Always retrievable on-chain forever
```

