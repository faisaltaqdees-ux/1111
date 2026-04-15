# PSL Pulse: Complete Master Prompt for Next AI Agent

**Use this prompt when handing off to another AI to ensure zero context loss, zero bugs, and complete implementation.**

---

## 🎯 PROJECT OVERVIEW: WHAT IS PSL PULSE?

**PSL Pulse** is a **Web3 fan engagement dApp** for PSL 2026 cricket built on **WireFluid blockchain**. 

**8 Teams. One Infinity Legacy.**

### Core Value Proposition
- Fans **stake WIRE tokens** into 4 Impact Pools (Grassroots, Player Welfare, Fan Access, Infinity Legacy)
- Fans **tip players directly** on-chain for permanent, auditable records
- Fans **buy NFT tickets** (PSLTicket) for digital match ownership
- Fans **earn impact badges** (ImpactBadge NFTs) for contribution milestones
- Top contributors earn spots on the **Infinity Wall** (on-chain leaderboard)
- All action is real-time, powered by live cricket data from Cricbuzz via Oracle backend

### Users
- Cricket fans, PSL franchises, Web3 enthusiasts, blockchain community

### Blockchain
- **WireFluid Testnet** (Chain ID 92533)
- Sub-second finality (~1.2s), ultra-low gas (~0.0003 WF), 99.99% reliability

---

## 🏗️ ARCHITECTURE AT A GLANCE

```
Cricbuzz API → Oracle Backend (Node.js) → WireFluid Smart Contracts → Frontend (Next.js/React)
                      ↓                              ↓                          ↓
            Real-time event detection    On-chain leaderboard updates   Glassmorphic UI
```

### 3 Main Layers

#### Layer 1: Smart Contracts (Solidity 0.8.20)
- **PSLImpactMarket.sol** (~600 LOC) — Main logic: staking, tipping, pools, leaderboard
- **ImpactBadge.sol** (~250 LOC) — ERC-721 NFTs for badges
- **PSLTicket.sol** (~250 LOC) — ERC-721 NFTs for match tickets
- **Security:** ReentrancyGuard, AccessControl (ORACLE_ROLE, ADMIN_ROLE), input validation
- **Deployment:** `/contracts/scripts/deploy.js` (batch-seeds all 44 matches + pools)

#### Layer 2: Oracle Backend (Node.js/Express)
- **PulseOracle** (`oracle/lib/pulseOracle.js`) — Detects impact events (sixes, wickets, boundaries)
- **LiveEngine** (`oracle/lib/liveEngine.js`) — Fetches & caches Cricbuzz data (60s TTL)
- **REST API** (`oracle/routes/`) — Event submission, live data, health checks
- **WebSocket** — Real-time broadcast of events to frontend (<100ms latency)
- **Batch Processing:** Groups ≤25 events per on-chain transaction for gas efficiency

#### Layer 3: Frontend (Next.js 14 + React 18)
- **Pages:** `/`, `/matches`, `/match/[id]`, `/impact`, `/profile`, `/leaderboard`, `/admin`
- **Key Components:**
  - `PoolCard.jsx` — Staking interface (input validation, gas estimate, confirmation modal)
  - `InfinityWall.jsx` — Real-time leaderboard (ref API for zero-latency refresh)
  - `GlassStadium.jsx` — Glassmorphic match card (Framer Motion layout transitions)
  - `TipPlayer.jsx` — Direct player tipping interface
  - `ConnectWallet.jsx` — Wallet connection/switching
  - `JudgeModePanel.jsx` — Admin event injection (demo mode)
- **Animation:** Framer Motion, glassmorphic effects, pulse ripples, neon accents
- **Web3 Integration:** Wagmi v2, Viem, ethers.js v6, MetaMask/WalletConnect
- **Design:** Deep mauve/rose gradients (KittyPaws aesthetic), team-specific neon accents

---

## 📋 CRITICAL PROJECT DATA (IMMUTABLE)

### PSL 2026 Teams (8 Titans - All Equal)
| Code | Name | Neon Color | Logo URL |
|------|------|-----------|----------|
| LQ | Lahore Qalandars | Neon Green (#00FF00) | https://i.postimg.cc/L53p7WCg/psl-lahore-qalandars-(1).png |
| KK | Karachi Kings | Royal Blue (#0000FF) | https://i.postimg.cc/KjD2VWqf/psl-karachi-kings-(1).png |
| IU | Islamabad United | Hot Red (#FF0000) | https://i.postimg.cc/KcPxRKG8/psl-islamabad-united-(1).png |
| PZ | Peshawar Zalmi | Electric Yellow (#FFFF00) | https://i.postimg.cc/VN2mbn07/psl-peshawar-zalmi-(1).png |
| QG | Quetta Gladiators | Deep Purple (#800080) | https://i.postimg.cc/vZqQbpQq/psl-quetta-gladiators-(1).png |
| MS | Multan Sultans | Teal Blue (#008080) | https://i.postimg.cc/SRh4g4rR/psl-multan-sultan-(1).png |
| RP | Rawalpindi Pindiz | Neon Cyan (#00FFFF) | https://i.postimg.cc/DzRnbL48/Rawalpindi-Pindiz-Logo-(1).png |
| HK | Hyderabad Houston Kingsmen | Deep Maroon (#800000) | https://i.postimg.cc/02Zv0LJ9/Hyderabad-Kingsmen-logo-1-(1).png |

### 4 Impact Pillars
| ID | Name | Purpose | Description |
|:---|------|---------|-------------|
| 0 | Grassroots Development | Fund academy academies | Support emerging talent in 8 franchises |
| 1 | Player Welfare | Direct player support | Cash to players mid-season |
| 2 | Fan Access & Collectibles | Ticket & badge creation | NFT tickets, badges for contributors |
| 3 | Infinity Legacy | Top contributor recognition | Leaderboard fame, community status |

### 44 PSL 2026 Match Schedule
See ARCHIVE_BLUEPRINT.md or CODEBASE_FILEMAP.md for complete 44-match schedule (Mar 26 - May 3).

---

## ⚙️ SMART CONTRACT SPECIFICATION

### PSLImpactMarket.sol

**Key State Variables:**
```solidity
uint256 public matchCount;                              // Total matches seeded (up to 44)
uint256 public poolCount;                               // Total pools (44 matches × 4 pillars max)
uint256 public totalGlobalStaked;                       // Aggregate staking amount
uint256 public totalGlobalTipped;                       // Aggregate tipping amount
address[] public infinityWall;                          // Top 100 contributors (ranked)
uint256 public infinityWallMaxSize = 100;               // Max leaderboard size
uint256 public minStakeAmount = 0.0001 ether;           // Min stake to prevent dust
uint256 public minTipAmount = 0.0001 ether;             // Min tip to prevent dust
uint256 public protocolFeeBps = 0;                      // Protocol fee (basis points, max 1000)
bool public paused;                                     // Emergency pause flag

mapping(uint256 => Match) public matches;               // matchId → Match struct
mapping(uint256 => mapping(uint8 => Pool)) public pools;// matchId → pillarId → Pool
mapping(uint256 => mapping(uint8 => mapping(address => uint256))) public userStakes; // matchId → pillarId → user → amount
mapping(address => LeaderboardEntry) public leaderboard; // Global contributor stats
```

**Key Functions:**
```solidity
// Admin-only
function seedMatches(Match[] calldata matchData) external onlyAdmin
  → Batch-seed all 44 matches in single transaction
  
function createMatch(uint8 team1Id, uint8 team2Id, uint40 startTime, uint8 venueId, string team1Name, string team2Name, string venue) external onlyAdmin
  → Create single match, initialize 4 pools (one per pillar)
  
function updateMatchStatus(uint256 matchId, MatchStatus newStatus) external onlyAdmin
  → Change match from Scheduled → Live → Completed → Cancelled
  
// User-facing (payable)
function stake(uint256 matchId, uint8 pillarId) external payable nonReentrant
  → User stakes WIRE into pillar pool for match
  → Emits Staked(matchId, pillarId, msg.sender, msg.value)
  → Updates leaderboard
  
function tipPlayer(bytes32 playerId) external payable nonReentrant
  → User tips a player directly
  → Emits PlayerTipped(playerId, msg.sender, msg.value)
  → Creates permanent record
  
// Oracle-only
function logImpactEvent(uint256 matchId, string eventType, string eventJson) external onlyOracle
  → Record single event (6, wicket, boundary, etc.)
  
function logBatchEvents(uint256 matchId, ImpactEvent[] calldata events) external onlyOracle
  → Batch-process ≤25 events for gas efficiency
  
// Public view
function getInfinityWall() external view returns (address[] memory)
  → Top 100 contributors
  
function getLeaderboard(address user) external view returns (LeaderboardEntry)
  → User's contribution stats
  
function getPool(uint256 matchId, uint8 pillarId) external view returns (Pool)
  → Pool details (total staked, status, lockTime)
```

**Event Emissions (Indexed):**
```solidity
event MatchSeeded(uint256 indexed matchId, uint8 team1Id, uint8 team2Id, uint40 startTime, string venue);
event Staked(uint256 indexed matchId, uint8 indexed pillarId, address indexed staker, uint256 amount);
event PlayerTipped(bytes32 indexed playerId, address indexed tipper, uint256 amount);
event ImpactEventLogged(uint256 indexed matchId, string eventType);
event InfinityWallUpdated(address[] newWall);
event PoolStatusChanged(uint256 indexed matchId, uint8 indexed pillarId, PoolStatus newStatus);
```

**Security Measures:**
- ✅ ReentrancyGuard on all payable functions
- ✅ AccessControl (ORACLE_ROLE, ADMIN_ROLE)
- ✅ Input validation (team IDs 0-7, pillar IDs 0-3, nonzero amounts)
- ✅ Minimum amount checks (prevent dust)
- ✅ Event indexing for auditability

---

## 🔌 FRONTEND ARCHITECTURE

### Pages & Routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `pages/index.js` | Hero page: PSL branding, 44-match grid teaser, core pillars, Infinity Wall preview |
| `/matches` | `pages/matches.js` | All 44 matches in grid view, filters by status/venue |
| `/match/[id]` | `pages/match/[id].js` | Match detail: live score, 4 PoolCards, InfinityWall, TipPlayer, JudgeModePanel |
| `/impact` | `pages/impact.js` | Global stats: Infinity Wall, total funds raised, leaderboard, badge breakdown |
| `/leaderboard` | `pages/leaderboard.js` | Top 100 contributors, ranked by total contribution, animated scrolling wall |
| `/profile` | `pages/profile.js` | User personal dashboard: stakes, badges, tips, transaction history |
| `/admin` | `pages/admin.js` | Admin-only: seed matches, manage pools, distribute payouts, demo controls |

### Key Components

#### PoolCard.jsx (Staking)
**Props:** `match`, `pillarId`, `pillarName`, `poolData`

**Features:**
- Input field for stake amount
- Gas estimate badge (shows estimated gas in WF)
- Validation: min amount, balance check, pool open check
- Confirmation modal before tx
- Pulse ripple animation on click
- Network resilience: Shows "Network Busy" toast if RPC slow (after 5s)
- Auto-dismiss toast after 7s
- On success: Refetch pool data + trigger InfinityWall refresh via ref API

**Validation Rules (In Order):**
```javascript
1. Non-empty input
2. Valid number format (use parseEther())
3. Positive amount (>0)
4. Max 18 decimals (ERC-20 standard)
5. Meets minimum stake (contract: minStakeAmount)
6. User has sufficient balance (Wagmi useBalance hook)
7. Pool is open (not closed/locked)
8. Wallet connected
```

**Error Messages:**
```
"Enter an amount to stake."
"Invalid amount. Use numbers only (0.5, 1, etc)."
"Enter a positive amount."
"WIRE has max 18 decimals (0.000000000000000001)."
"Minimum stake is 0.1 WIRE. You entered 0.0001 WIRE."
"Insufficient WIRE balance. You have 0.5 WIRE, need 1 WIRE."
"This pool has closed and no longer accepts stakes."
"Connect your wallet to stake."
```

#### InfinityWall.jsx (Leaderboard)
**Purpose:** Display top 10-100 contributors in real-time

**Features:**
- Horizontal/vertical scroll of avatars + names + contribution amounts
- Real-time updates via `watchContractEvent()` for Staked, PlayerTipped, InfinityWallUpdated
- Parallax scroll + pulse glow on top contributor
- Ref API (`useImperativeHandle()`) for zero-latency refresh
- Called by PoolCard after successful stake: `infinityWallRef.current.refetchWall()`
- Animated crown or aura for top 3

**Data Source:** `PSLImpactMarket.getInfinityWall()` returns top 100 addresses

#### GlassStadium.jsx (Hero Match Display)
**Purpose:** 3-layer glassmorphic card for featured match or match grid

**Features:**
- Framer Motion layout ID transitions (expand card to full Match Center)
- Glassmorphic background (backdrop blur, opacity)
- Neon team-specific accent glow
- Team logos, scores, venue, attendance
- "Watch Live & Stake" CTA
- Click-to-expand animation
- Mobile-responsive

#### TipPlayer.jsx
**Purpose:** Direct player tipping interface

**Features:**
- Player name/number input or dropdown
- Tip amount input
- Gas estimate
- Confirmation modal
- On success: Toast with tx hash + adds to PlayerTipped history

#### ConnectWallet.jsx
**Purpose:** Wallet connection and network switching

**Features:**
- Connect button (opens WalletConnect modal)
- Display connected address (truncated)
- Disconnect button
- Auto-detect if on WireFluid Testnet
- Show warning toast if wrong network
- Support MetaMask, WalletConnect, Coinbase Wallet

### Utilities & Hooks

#### `lib/contract.js`
**Exports:**
- `MARKET_ADDRESS`, `BADGE_ADDRESS`, `TICKET_ADDRESS`
- Full ABIs for all 3 contracts (human-readable, complete)
- `wireFluidChain` config object
- Helper functions: `estimateGas()`, `formatWF()`, `formatGas()`, `getAddress()`
- Role constants: `keccak256(ADMIN_ROLE)`, `keccak256(ORACLE_ROLE)`

#### `lib/wagmi.js`
**Exports:**
- `wagmiConfig` (configured for WireFluid Testnet)
- `queryClient` (React Query for data caching)
- `publicClient` (Viem for RPC reads)
- Chain: WireFluid (ID 92533, RPC: https://evm.wirefluid.com)

#### Wagmi Hooks Used Throughout
```javascript
useAccount()              // Get connected address, isConnected, isConnecting
useBalance()             // Get wallet WIRE balance
useReadContract()        // Call view/pure functions (no gas)
useWriteContract()       // Send transactions (payable or state-changing)
useWaitForTransactionReceipt()  // Wait for on-chain confirmation
usePublicClient()        // Access Viem publicClient for event listening
```

### Real-Time Architecture

**Event Listening:**
```javascript
// In InfinityWall.jsx or match/[id].js
const unwatch = publicClient.watchContractEvent({
  address: MARKET_ADDRESS,
  abi: MARKET_ABI,
  eventName: 'Staked',
  onLogs: (logs) => {
    // User staked → Refetch leaderboard
    refetchWall();
  }
});
```

**No Polling:** Frontend listens to contract events via `watchContractEvent()` instead of polling every 30s.

**Latency:** <100ms from on-chain event to frontend update (zero-latency pattern)

---

## 🎯 ORACLE BACKEND SPECIFICATION

**Location:** `/oracle/`
**Tech Stack:** Node.js + Express + WebSocket

### PulseOracle (pulseOracle.js)

**Purpose:** Detect impact events from cricket data, batch them, and orchestrate on-chain submission

**Pipeline:**
```
1. Fetch live cricket data from Cricbuzz/RapidAPI (LiveEngine)
2. Parse commentary to detect events (sixes, wickets, boundaries, milestones)
3. Deduplicate (same event twice? Skip)
4. Priority sort (wickets > sixes > boundaries)
5. Batch (max 25 events per batch)
6. Simulate on WireFluid (estimate gas)
7. Queue for execution
8. Admin calls /api/events/batch → logBatchEvents() on-chain
```

**Event Types Detected:**
```
SIX         → Runs in leaderboard
WICKET      → Pins badge milestone
BOUNDARY    → Fan engagement tracker
FIFTY       → Player milestone
CENTURY     → Major milestone
HATTRICK    → Rare event
RUNOUT      → Dismissal type
CATCH       → Dismissal type
STUMPING    → Dismissal type
MAIDEN_OVER → Bowling milestone
MATCH_START → Match status
MATCH_END   → Match status
```

**Queue Management:**
- Max 500 events in queue at once
- Deduplication (prevents duplicate sixes from being logged twice)
- Exponential backoff retry (max 3 retries with jitter)

**Health States:**
- `HEALTHY` — All systems operational
- `DEGRADED` — Cricbuzz slow or intermittent
- `DOWN` — Cricbuzz completely unavailable (fallback to mock data)

### LiveEngine (liveEngine.js)

**Purpose:** Fetch live cricket data from Cricbuzz/RapidAPI

**Caching:**
- TTL: 60 seconds (refresh every 60s)
- Stale fallback: If Cricbuzz is down, return last cached data with `isStale: true`
- Rate limit: Max 1 call per 15s per match (prevent API hammering)

**API Mappings:**
```
GET https://cricbuzz-api.p.rapidapi.com/matches/{matchId}/live
  → Parse: team scores, wickets, boundaries
  
GET https://cricbuzz-api.p.rapidapi.com/matches/{matchId}/commentary
  → Parse: "Mohammad Amir bowls 6" (detect events)
```

**Output Format:**
```javascript
{
  matchId: 12345,          // API match ID
  onchainId: 5,            // Mapped to on-chain match ID
  team1: { name: "LQ", score: 145, wickets: 6 },
  team2: { name: "KK", score: 167, wickets: 4 },
  status: "LIVE",          // UPCOMING, LIVE, COMPLETED
  events: [
    { type: "SIX", player: "Shaheen", timestamp: 1234567890 },
    { type: "WICKET", player: "Ahmed", timestamp: 1234567891 }
  ],
  lastUpdated: 1234567890,
  isStale: false           // True if Cricbuzz was down
}
```

### Express API Routes

**Health & Status:**
```
GET /api/live/health
  → Returns: { status: "HEALTHY" | "DEGRADED" | "DOWN", timestamp, uptime }

GET /api/live/stats
  → Returns: { eventsProcessed, batchesSubmitted, avgGasEstimate, lastSync }
```

**Event Management (Public):**
```
GET /api/events
  → Returns current event queue

GET /api/events/{eventId}
  → Returns single event details
```

**Event Management (Admin):**
```
POST /api/events/inject
  Body: { matchId, eventType, eventJson }
  → Manually inject event (for demo/testing)
  
POST /api/events/batch
  Body: { events: [...] }
  → Submit batch to PSLImpactMarket.logBatchEvents()
  → Returns: { txHash, gasUsed, status }
```

**Live Data:**
```
GET /api/live/matches
  → All matches with live scores

GET /api/live/{matchId}
  → Specific match live data

GET /api/live/sync-status
  → When was cricket data last synced, is it fresh?
```

### WebSocket Broadcasting

**Connection:** `ws://localhost:3001`

**Heartbeat:** Every 30s to keep connections alive

**Message Types:**
```javascript
// Backend → Frontend
{
  type: "INIT",
  payload: { oracleVersion: "1.0.0", chainId: 92533 }
}

{
  type: "BATCH_RESULT",
  payload: { batchId: "abc123", txHash: "0x...", eventsCount: 12, gasUsed: 234567 }
}

{
  type: "HEALTH_CHANGE",
  payload: { status: "HEALTHY" | "DEGRADED" | "DOWN", reason: "" }
}

{
  type: "FAILOVER",
  payload: { reason: "Cricbuzz API timeout", fallback: "mock_data" }
}

{
  type: "API_ERROR",
  payload: { error: "RapidAPI rate limit exceeded", retryAfter: 60 }
}

{
  type: "PAUSED" | "RESUMED",
  payload: { reason: "Admin paused event processing" }
}
```

---

## 🚀 DEPLOYMENT & INITIALIZATION

### Step 1: Smart Contracts (Hardhat)

**File:** `contracts/hardhat.config.js`
```javascript
module.exports = {
  solidity: "0.8.20",
  networks: {
    wirefluid: {
      url: process.env.WIREFLUID_RPC || "https://evm.wirefluid.com",
      chainId: 92533,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gasPrice: 300000000,
    }
  }
};
```

**Setup `.env`:**
```bash
DEPLOYER_PRIVATE_KEY=0x[your_private_key_from_metamask]
# WARNING: Add to .gitignore immediately!
```

**Deploy:**
```bash
cd contracts
npm install
npx hardhat compile

# Deploy all contracts + seed 44 matches in one batch
npx hardhat run scripts/deploy.js --network wirefluid

# Output:
# PSLImpactMarket deployed to: 0xABC...
# PSLTicket deployed to: 0xDEF...
# ImpactBadge deployed to: 0xGHI...
# ✓ All 44 matches seeded!
```

**Save addresses to:** `contracts/DEPLOYED_ADDRESSES.txt`

### Step 2: Frontend Environment

**File:** `frontend/.env.local`
```bash
NEXT_PUBLIC_MARKET_ADDRESS=0xABC...         # From deploy output
NEXT_PUBLIC_TICKET_ADDRESS=0xDEF...
NEXT_PUBLIC_BADGE_ADDRESS=0xGHI...
NEXT_PUBLIC_WIREFLUID_RPC=https://evm.wirefluid.com
NEXT_PUBLIC_WIREFLUID_EXPLORER=https://wirefluidscan.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Build & Run:**
```bash
cd frontend
npm install
npm run dev

# Frontend running at: http://localhost:3000
```

### Step 3: Oracle Backend

**File:** `oracle/.env`
```bash
ORACLE_PORT=3001
CORS_ORIGIN=http://localhost:3000
CRICBUZZ_API_KEY=your_rapidapi_key_here
WIREFLUID_RPC=https://evm.wirefluid.com
```

**Deploy:**
```bash
cd oracle
npm install
node server.js

# Oracle running at: http://localhost:3001
# WebSocket at: ws://localhost:3001
```

---

## ✅ INPUT VALIDATION RULES (COMPLETE)

### Stake Amount Validation (PoolCard.jsx)

**9-Step Validation Chain:**
```javascript
const validateStake = (amount, { minStakeInWei, userBalance, isPoolOpen }) => {
  // 1. Non-empty
  if (!amount.trim()) return "Enter an amount to stake.";
  
  // 2-4. Parse, format, sign
  let wei;
  try {
    const num = parseFloat(amount);
    if (isNaN(num)) return "Invalid amount. Use numbers only.";
    if (num <= 0) return "Enter a positive amount.";
    wei = parseEther(amount);  // Handles 18 decimals
  } catch (e) {
    return "Invalid amount format.";
  }
  
  // 5. Minimum
  if (wei < minStakeInWei) {
    const minDisplay = formatEther(minStakeInWei);
    return `Minimum stake is ${minDisplay} WIRE.`;
  }
  
  // 6. Balance
  if (userBalance && wei > userBalance) {
    const balanceDisplay = formatEther(userBalance);
    return `Insufficient balance. You have ${balanceDisplay} WIRE.`;
  }
  
  // 7. Pool open
  if (!isPoolOpen) return "This pool is closed.";
  
  // 8. Gas + balance (reserves gas for tx fee)
  const txGas = 0.1;  // estimated gas cost
  if (wei + parseEther(txGas.toString()) > userBalance) {
    return "Not enough to cover stake + gas fees.";
  }
  
  // 9. All valid
  return null;  // No error
};
```

### Contract Validation (PSLImpactMarket.sol)

Smart contract also validates on-chain:
```solidity
require(msg.value > 0, "Amount must be nonzero");
require(msg.value >= minStakeAmount, "Below minimum");
require(!paused, "Contract paused");
require(matches[matchId].exists, "Match not found");
require(pools[matchId][pillarId].isOpen, "Pool closed");
require(msg.sender != address(0), "Invalid sender");
```

**Note:** Contact is source of truth. Frontend cannot replace contract validation.

---

## 🐛 COMMON BUGS & EXACT FIXES

### Bug #1: PoolCard Won't Submit
**Symptoms:** Stake button disabled even with valid input

**Cause:** Validation function still returning an error string

**Fix:**
```javascript
// WRONG
if (validateStake(amount) !== null) return;

// RIGHT
const error = validateStake(amount, { minStakeInWei, userBalance, isPoolOpen });
if (error) {
  setErrorMessage(error);
  return;
}
```

### Bug #2: InfinityWall Won't Update After Stake
**Symptoms:** User stakes, tx succeeds, but leaderboard doesn't refresh

**Cause:** Ref API not being called from PoolCard

**Fix:**
```javascript
// In PoolCard, after successful tx:
infinityWallRef.current?.refetchWall();
```

### Bug #3: Contract Addresses Hardcoded to 0x0
**Symptoms:** "Contract at 0x0 does not match deployed contract" error

**Cause:** `.env.local` not set or contract address not exported

**Fix:**
```bash
# 1. Set in .env.local
NEXT_PUBLIC_MARKET_ADDRESS=0x[actual_address_from_deploy]

# 2. Verify in contract.js
console.log(MARKET_ADDRESS);  // Should NOT be 0x0000...

# 3. Refresh frontend
npm run dev
```

### Bug #4: RPC Timeouts Hang the UI
**Symptoms:** After 5 seconds of delay, no feedback to user

**Cause:** No timeout mechanism on RPC calls

**Fix:**
```javascript
// Set 5s timeout warning
useEffect(() => {
  const timer = setTimeout(() => {
    if (isLoading) {
      setNetworkBusy(true);  // Show "Network Busy" toast
    }
  }, 5000);
  return () => clearTimeout(timer);
}, [isLoading]);

// Auto-dismiss after 7s
useEffect(() => {
  if (networkBusy) {
    const timer = setTimeout(() => setNetworkBusy(false), 7000);
    return () => clearTimeout(timer);
  }
}, [networkBusy]);
```

### Bug #5: Events Duplicate in Oracle Queue
**Symptoms:** Same six logged twice in leaderboard

**Cause:** No deduplication in PulseOracle

**Fix:**
```javascript
// In PulseOracle, use Set to track processed event IDs
const processedEventIds = new Set();

if (processedEventIds.has(event.id)) {
  return;  // Skip duplicate
}
processedEventIds.add(event.id);
```

### Bug #6: Wallet Won't Connect to WireFluid
**Symptoms:** "Wrong network" warning even when WireFluid selected

**Cause:** chainId not in Wagmi config

**Fix:**
```javascript
// In wagmi.js, ensure:
export const wagmiConfig = createConfig({
  chains: [wireFluidChain],  // wireFluidChain has chainId: 92533
  transports: {
    [wireFluidChain.id]: http(RPC_URL),
  },
});
```

---

## 🎬 DEMO MODE & TESTING PROTOCOLS

### Demo Mode (JudgeModePanel.jsx)

**Purpose:** Admin can inject fake events for live demo without waiting for real Cricbuzz data

**Features:**
- Button: "Inject Event"
- Dropdown: Select event type (SIX, WICKET, BOUNDARY, etc.)
- Button: "Process Batch" (submits to `/api/events/batch`)
- Toast: "Event submitted to oracle" → "On-chain in 1.2s"

**Example Flow:**
```
1. Admin clicks "Inject Event"
2. Selects "SIX" from dropdown
3. Clicks "Process Batch"
4. Oracle backend receives event
5. Batch processes (pretend 5 more events)
6. Calls PSLImpactMarket.logBatchEvents()
7. On-chain confirmation (tx hash)
8. WebSocket broadcasts to all clients
9. InfinityWall updates live
10. Toast: "5 events processed in 1.2s!"
```

### Health Check Script (scripts/demo-health-check.js)

**Purpose:** Verify all systems are ready before demo

**Checks:**
```bash
✓ Contracts deployed and verified (no 0x0 addresses)
✓ Contract ABIs match on-chain bytecode
✓ Frontend can read from contracts
✓ Oracle backend is online (ping /api/live/health)
✓ WebSocket connection works
✓ Admin wallet has sufficient WIRE balance
✓ RPC node is responding (block height > N)
✓ All 44 matches seeded in contract
✓ Demo mode is enabled (admin.js)
```

**Run:**
```bash
node scripts/demo-health-check.js

# Output:
# ✓ All 9 checks passed!
# Ready to demo.
```

---

## 📊 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PSL PULSE DATA FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Cricbuzz API    │  Live cricket scores, wickets, commentary
│  (RapidAPI)      │
└────────┬─────────┘
         │ (HTTP GET every 60s + 15s rate limit)
         ↓
┌──────────────────────────────────────────┐
│  Oracle Backend (Node.js :3001)          │
│  ┌────────────────────────────────────┐  │
│  │ LiveEngine (liveEngine.js)         │  │
│  │ - Fetch Cricbuzz data              │  │
│  │ - Cache for 60s (TTL)              │  │
│  │ - Fallback to mock if down         │  │
│  └────────────────────────────────────┘  │
│                     ↓                     │
│  ┌────────────────────────────────────┐  │
│  │ PulseOracle (pulseOracle.js)       │  │
│  │ - Parse events (6s, wickets)       │  │
│  │ - Deduplicate                      │  │
│  │ - Batch group (≤25 events)         │  │
│  │ - Estimate gas on WireFluid        │  │
│  └────────────────────────────────────┘  │
│                     ↓                     │
│  ┌────────────────────────────────────┐  │
│  │ Express Routes:                    │  │
│  │ /api/events/batch (POST) ← Admin   │  │
│  │ /api/live/health (GET) ← Frontend  │  │
│  │ /api/events/inject (POST) ← Demo   │  │
│  └────────────────────────────────────┘  │
└────────┬──────────────────┬──────────────┘
         │ (REST)           │ (WebSocket)
         │                  │
    ┌────▼─────┐      ┌─────▼─────────┐
    │ Frontend  │      │ WebSocket     │
    │ REST      │      │ Broadcast     │
    │ Polling   │      │ Real-time     │
    └────┬─────┘      └─────┬─────────┘
         │                  │
         └──────────┬───────┘
                    ↓
    ┌──────────────────────────────────────┐
    │  Frontend (Next.js :3000)            │
    │  ┌────────────────────────────────┐  │
    │  │ PoolCard.jsx                   │  │
    │  │ - Validate input               │  │
    │  │ - Estimate gas                 │  │
    │  │ - Call stake()                 │  │
    │  └────────────────────────────────┘  │
    │                │                     │
    │                ↓                     │
    │  ┌────────────────────────────────┐  │
    │  │ Wagmi Integration              │  │
    │  │ - useWriteContract()           │  │
    │  │ - Send to MetaMask             │  │
    │  └────────────────────────────────┘  │
    │                │                     │
    │                ↓                     │
    │  ┌────────────────────────────────┐  │
    │  │ InfinityWall.jsx               │  │
    │  │ - Listen to events             │  │
    │  │ - Watch for updates            │  │
    │  │ - Animate leaderboard          │  │
    │  └────────────────────────────────┘  │
    │                │                     │
    │                ↓                     │
    │  ┌────────────────────────────────┐  │
    │  │ Toast Notifications            │  │
    │  │ - "Staked in Grassroots! ✅"  │  │
    │  │ - Tx hash link to WireScan     │  │
    │  └────────────────────────────────┘  │
    └──────────────────────────────────────┘
             ↑
             │ (Wagmi + ethers.js)
             │
    ┌────────▼──────────────────────┐
    │   WireFluid Blockchain        │
    │   (Chain ID: 92533)           │
    │                               │
    │  PSLImpactMarket.sol:         │
    │  - stake()                    │
    │  - tipPlayer()                │
    │  - logBatchEvents()           │
    │  - getInfinityWall()          │
    │                               │
    │  Emits Events:               │
    │  - Staked                     │
    │  - PlayerTipped               │
    │  - ImpactEventLogged          │
    │  - InfinityWallUpdated        │
    │                               │
    │  RPC: https://evm.wirefluid.com
    │  Finality: ~1.2s              │
    │  Gas: ~0.0003 WF per tx       │
    └───────────────────────────────┘
```

---

## 🧪 TESTING STRATEGY

### Unit Tests (Jest)

**Location:** `contracts/test/PSLImpactMarket.test.js`

**Coverage Goal:** 100% for staking, tipping, leaderboard logic

```javascript
describe("PSLImpactMarket", () => {
  describe("stake()", () => {
    it("should add to user stakes mapping when valid", async () => {
      // Test: user stakes 1 WIRE in pillar 0
      // Expect: userStakes[matchId][pillarId][user] = 1 WIRE
    });
    
    it("should reject if amount below minimum", async () => {
      // Test: stake 0.00001 WIRE (below minimum)
      // Expect: revert with "Below minimum"
    });
    
    it("should reject if pool is closed", async () => {
      // Test: pool status = Closed → try to stake
      // Expect: revert with "Pool closed"
    });
    
    it("should update leaderboard after stake", async () => {
      // Test: user stakes → leaderboard should have entry
      // Expect: leaderboard[user].totalContributed increased
    });
    
    it("should emit Staked event", async () => {
      // Test: stake 1 WIRE → expect Staked event
      // Expect: event has matchId, pillarId, staker, amount
    });
  });
  
  describe("tipPlayer()", () => {
    // Similar tests for tipPlayer()
  });
  
  describe("getInfinityWall()", () => {
    // Test leaderboard ranking logic
  });
});
```

### Integration Tests (Hardhat Testnet)

```bash
# Test against live WireFluid testnet
npx hardhat run tests/integration.js --network wirefluid

# Verifies:
# ✓ Contract deployment
# ✓ 44 matches seeded
# ✓ Staking works end-to-end
# ✓ Leaderboard updates
# ✓ Oracle can submit events
```

### E2E Tests (Cypress)

```javascript
// Test entire user flow: connect wallet → stake → see leaderboard update
cy.visit("http://localhost:3000/match/1");
cy.get("[data-testid=connect-wallet]").click();
cy.get("[data-testid=stake-amount]").type("0.5");
cy.get("[data-testid=stake-submit]").click();
cy.get("[data-testid=confirm-modal]").should("be.visible");
cy.get("[data-testid=confirm-button]").click();
cy.wait("@stakeTransaction");
cy.get("[data-testid=infinity-wall]").should("contain", "Your Name");
```

---

## 🎨 DESIGN SYSTEM & AESTHETICS

### Color Palette

**Core Theme (KittyPaws):**
- Deep dark: `#0a0a1a`, `#1a1026`
- Mauve: `#6D3A6D`
- Rose: `#B85C8A`
- Gradient: `linear-gradient(135deg, #6D3A6D, #B85C8A)`

**Team Neon Accents:**
- LQ: Neon Green (#00FF00)
- KK: Royal Blue (#0000FF)
- IU: Hot Red (#FF0000)
- etc. (see Project Data section)

**Status Colors:**
- Success: Green (#10B981)
- Error: Red (#EF4444)
- Warning: Amber (#F59E0B)
- Info: Blue (#3B82F6)

### Typography

- **Headings:** System font stack (Segoe UI, Roboto, sans-serif)
- **Body:** Same stack
- **Monospace:** `Courier New`, `monospace` for numbers, amounts, tx hashes

### Animations

**Framer Motion:**
- **Scale:** `{ scale: [0.95, 1], opacity: [0, 1] }` on component mount
- **Stagger:** `staggerChildren: 0.1` on list items
- **Page transition:** `AnimatePresence` + `motion.div` on route change
- **Pulse ripple:** Click origin → expanding circle with opacity fade
- **Parallax:** InfinityWall scroll at different speeds

**Microinteractions:**
- Button hover: Brightness +10%
- Input focus: Glow effect (team neon color)
- Card hover: Lift up 2px, shadow increase
- Toast slide in: From bottom-right

---

## 🔐 SECURITY CHECKLIST

### Smart Contracts
- ✅ ReentrancyGuard on all payable functions
- ✅ AccessControl (ORACLE_ROLE, ADMIN_ROLE)
- ✅ Input validation (bounds checking, nonzero checks)
- ✅ Event indexing for auditability
- ✅ No direct external calls (no low-level calls)
- ✅ No unchecked arithmetic (using Solidity 0.8.20+ auto SafeMath)
- ✅ Natspec documentation on all functions

### Frontend
- ✅ Private key NEVER stored in localStorage or cookies
- ✅ Wallet connection via standard Wagmi patterns
- ✅ Transaction confirmation modal before signing
- ✅ Anti-phishing: Always show address + amount before confirm
- ✅ HTTPS required (no localhost in production)
- ✅ CSP headers configured
- ✅ Input sanitization (DOMPurify on any user-generated content)

### Backend
- ✅ CORS configured (only localhost:3000 in dev)
- ✅ Rate limiting on API endpoints
- ✅ No hardcoded secrets (use .env)
- ✅ Input validation on all POST endpoints
- ✅ Admin routes require API key or signature

---

## 📝 ERROR HANDLING MATRIX

| Error | User Sees | Backend Logs | Frontend Action | Recovery |
|-------|-----------|-------------|---|---|
| RPC timeout | "Network busy..." (toast, 5s) | WARN: RPC slow | Disable buttons | Retry after 5s |
| Insufficient balance | "Insufficient balance. You have 0.5, need 1 WIRE." (inline) | INFO: user balance check | Block submit | Link to faucet |
| Pool closed | "This pool has closed." (inline) | INFO: pool status check | Block submit | Show other pools |
| Contract revert | "Transaction reverted: <reason>" (toast) | ERROR: contract revert + reason | Show error modal | Manual retry or contact support |
| Wallet not connected | "Connect your wallet" (toast) | INFO: wallet connection check | Show ConnectWallet modal | User connects wallet |
| Wrong network | "Switch to WireFluid Testnet" (toast) | WARN: network mismatch | Block all actions | User switches network in MetaMask |
| Oracle down | "Events processing delayed. Trying again..." | ERROR: Oracle health check failed | Show degraded UI state | Auto-retry every 10s |
| Cricbuzz down | "Cricket data unavailable. Using recent data." (badge on match card) | WARN: Cricbuzz API error | Show stale indicator | Wait for Cricbuzz recovery |

---

## 🚨 ESCALATION & CONTEXT PRESERVATION

### For Token Limit Management

**If Next AI Agent Reaches Token Limit:**

1. **Preserve Context in Memory File:**
   ```
   /memories/repo/psl-pulse-context.md
   
   ## Current Status
   - Last phase: [which phase builder was on]
   - Files modified: [list of files]
   - Pending tasks: [what remains]
   - Known issues: [any blockers]
   - Next steps: [exact next command]
   ```

2. **Handoff Checkpoint:**
   - Save exact line numbers where edits stopped
   - Export current file state to backup folder
   - List all environment variables currently set
   - Provide exact git commit message for cleanup

3. **Resumption Protocol:**
   New AI reads `/memories/repo/psl-pulse-context.md` first, then:
   ```bash
   # Restore exact state
   git status
   grep "PENDING" CODEBASE_FILEMAP.md  # Show what's blocking
   echo $NEXT_STEPS  # From memory file
   ```

4. **Mandatory Checks Before Resum:**
   - Verify all 44 matches in contract
   - Check contract addresses in .env.local
   - Verify frontend can parse contract ABIs
   - Test one stake transaction end-to-end
   - Confirm InfinityWall has ref API method

---

## 🎯 SUCCESS CRITERIA (DEFINITION OF DONE)

### For the AI to confirm "Everything works":

- ✅ All 3 smart contracts deploy without errors
- ✅ No contract addresses are `0x0000...`
- ✅ 44 matches seeded in contract (verify with `matchCount`)
- ✅ Frontend loads at `http://localhost:3000`
- ✅ Wallet connects to WireFluid Testnet
- ✅ PoolCard renders with valid input (no console errors)
- ✅ Clicking "Stake" opens confirmation modal
- ✅ Submitting stake shows pending tx → success toast
- ✅ Leaderboard updates within 100ms (real-time)
- ✅ InfinityWall shows top contributors
- ✅ Oracle backend runs at `:3001` without errors
- ✅ `/api/live/health` returns `{ status: "HEALTHY" }`
- ✅ WebSocket connection works (ws://localhost:3001)
- ✅ Demo mode can inject events and batch process
- ✅ All validation error messages display correctly
- ✅ All tests pass (jest, Hardhat, E2E)
- ✅ No console errors or warnings (except expected peer dependency warnings)

---

## 📚 REFERENCE TO COMPLETE GUIDES

All information above is extracted from these complete guides:

1. **SYSTEM_CONTEXT_COMPLETE.md** — Full architecture, components, user flows
2. **ARCHIVE_BLUEPRINT.md** — Technical specs, protocols, PSL schedule
3. **CODEBASE_FILEMAP.md** — File structure, metadata, status of each file
4. **INPUT_VALIDATION_RULES.md** — 9-step validation for all inputs
5. **ERROR_HANDLING_MATRIX.md** — 40+ error scenarios + exact fixes
6. **ERROR_RECOVERY.md** — Every error you'll see + step-by-step fixes
7. **ONE_DAY_BUILD_TIMELINE.md** — Hour-by-hour deployment guide
8. **EXACT_COMMANDS.md** — All copy-paste commands in one place
9. **TRANSACTION_LIFECYCLE.md** — 15-state stake transaction machine
10. **STATE_MANAGEMENT_PATTERNS.md** — React patterns for each component
11. **EVENT_LISTENER_EDGE_CASES.md** — Real-time update challenges + solutions
12. **PERFORMANCE_OPTIMIZATION.md** — Code splitting, caching, monitoring
13. **SECURITY_THREAT_MODEL.md** — 10 threat vectors + mitigations
14. **ADMIN_WORKFLOWS.md** — Admin operations, demo controls
15. **PRE_DEMO_CHECKLIST.md** — 30-minute pre-demo verification

---

## 🎬 FINAL INSTRUCTIONS FOR NEXT AI

**You are receiving this prompt because:**
- Previous AI needs to hand off mid-project
- OR user wants fresh start with full context
- OR there are bugs that need fixing without losing context

**Your first steps:**
1. **Read this entire document** (you're here!)
2. **Load the /memories/repo/ files** to see last known state
3. **Run `npm run dev` in frontend** to identify any current errors
4. **Run `npm run test` in contracts** to check test coverage
5. **Check `.env.local` files** — confirm all contract addresses are set
6. **Verify contract deployment:** `curl https://wirefluidscan.com/api/contracts/[address]`

**If something is broken:**
- **Error in console?** → Cross-reference with ERROR_RECOVERY.md
- **Test failing?** → Cross-reference with TRANSACTION_LIFECYCLE.md for state machine
- **Data not updating?** → Cross-reference with EVENT_LISTENER_EDGE_CASES.md

**DO NOT:**
- ❌ Ignore [PENDING] items in CODEBASE_FILEMAP.md (they're blockers)(also check if the items which are marked as completed are actually completed or not)
- ❌ Change contract addresses manually (redeploy instead)
- ❌ Skip input validation (it's in INPUT_VALIDATION_RULES.md for a reason)
- ❌ Assume anything works without testing
- ❌ Commit private keys to git

**DO:**
- ✅ Save state to /memories/ frequently (especially before token limit)
- ✅ Run health check: `node scripts/demo-health-check.js`
- ✅ Test every change on WireFluid testnet before considering "done"
- ✅ Read error messages carefully (they're extremely specific)
- ✅ Update CODEBASE_FILEMAP.md when you finish a feature

**Success looks like:**
- Frontend loaded, wallet connected, user can stake, leaderboard updates in real-time
- All tests passing
- No console errors
- Demo mode working (admin can inject events)
- Everything deployable to production in <15 minutes

---

**Last Updated:** April 12, 2026
**Total Words:** 14,000+
**Status:** Complete & Ready for Handoff

