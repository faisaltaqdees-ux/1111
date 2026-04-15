# PSL Pulse — AI Assistant Onboarding Package

## ⚡ Quick Answer: What to Give the New Bot

If you're handing off PSL Pulse to a new AI assistant, provide EXACTLY these files in this order:

---

## 📦 Tier 1: Critical Context (Read First)

### 1. **System Overview (THIS FILE)**
   - **Purpose:** High-level elevator pitch + component responsibilities
   - **Length:** 2-3 pages
   - **Contains:** What it is, who uses it, main flows, tech stack overview

### 2. **ARCHIVE_BLUEPRINT.md** (Full Requirements)
   - **Purpose:** Canonical source of all requirements, features, security measures
   - **Length:** 40+ pages
   - **Contains:** 
     - All 44 PSL 2026 match schedule (canonical)
     - 8-Titan branding protocol (team colors, logo URLs)
     - All UI/UX protocols (Pulse Ripple, Infinity Wall, glassmorphism)
     - Judging pillar matrix (how to win the hackathon)
     - All-in-one win protocol (demo scenarios)
   - **Critical for:** Understanding why decisions were made, what the judges care about

### 3. **CODEBASE_FILEMAP.md** (File Inventory)
   - **Purpose:** Every file's location, version, status, test coverage, security notes
   - **Length:** 20+ pages
   - **Contains:**
     - File name → Purpose → Status (Pending/In Progress/Complete)
     - Test coverage percentage per file
     - Lint/build/security status
     - Blueprint cross-references
   - **Critical for:** Finding files, understanding dependencies, avoiding breaking changes

### 4. **SYSTEM_CONTEXT_COMPLETE.md** (You Just Read This)
   - **Purpose:** Data flow, 3-layer architecture, user journeys, security model
   - **Length:** 20-30 pages
   - **Critical for:** Understanding how everything talks to everything else

---

## 🏗️ Tier 2: Technical Specs (Read Next - 10 Deep-Dive Documents)

### 5. **State Management Patterns**
   - **File**: STATE_MANAGEMENT_PATTERNS.md
   - **Purpose**: useState vs useRef vs useCallback decision tree, Wagmi memoization rules
   - **Critical for**: Writing efficient React components without unnecessary re-renders

### 6. **Input Validation Rules**
   - **File**: INPUT_VALIDATION_RULES.md
   - **Purpose**: Complete validation chain, frontend vs contract authority, all error messages
   - **Critical for**: Preventing bad data before sending to blockchain

### 7. **Cache Invalidation Strategy**
   - **File**: CACHE_INVALIDATION_STRATEGY.md
   - **Purpose**: When/how to refetch pool, user stakes, leaderboard; race conditions
   - **Critical for**: Real-time data consistency without stale data bugs

### 8. **Event Listener Edge Cases**
   - **File**: EVENT_LISTENER_EDGE_CASES.md
   - **Purpose**: Deduplication, ordering, RPC reconnect, memory leaks, batching, backpressure
   - **Critical for**: Robust real-time synchronization

### 9. **Transaction Lifecycle**
   - **File**: TRANSACTION_LIFECYCLE.md
   - **Purpose**: Complete wallet connection and staking flow (15-state machine)
   - **Critical for**: Understanding every step from "Connect Wallet" to "Success/Error"

### 10. **Error Handling Matrix**
   - **File**: ERROR_HANDLING_MATRIX.md
   - **Purpose**: 40+ error scenarios with exact user messages and recovery steps
   - **Critical for**: User-friendly error UX and support debugging

### 11. **Admin Workflows**
   - **File**: ADMIN_WORKFLOWS.md
   - **Purpose**: Deploy 44 matches, grant roles, payouts, failover, health monitoring
   - **Critical for**: Understanding admin-only operations and setup

### 12. **Security Threat Model**
   - **File**: SECURITY_THREAT_MODEL.md
   - **Purpose**: Double-spend, reentrancy, MITM, phishing, front-running, rate limiting
   - **Critical for**: Preventing exploits and writing secure code

### 13. **Performance Optimization**
   - **File**: PERFORMANCE_OPTIMIZATION.md
   - **Purpose**: Code splitting, memoization, bundle size, queries, virtual scrolling
   - **Critical for**: Fast app experience and low bandwidth usage

### 14. **Database & Persistence Strategy**
   - **File**: DATABASE_PERSISTENCE_STRATEGY.md
   - **Purpose**: On-chain vs cache vs localStorage, backup/restore, migrations
   - **Critical for**: Data durability and recovery procedures

### 15. **Contract ABIs & Function Signatures** (Reference)
```json
{
  "filePath": "/contracts/CONTRACT_SPEC.md",
  "purpose": "Every smart contract function with inputs/outputs/security notes",
  "example": {
    "contract": "PSLImpactMarket",
    "functions": [
      {
        "name": "stake",
        "signature": "stake(uint256 matchId, uint8 pillarId) payable nonReentrant",
        "inputs": {
          "matchId": "uint256 - Match ID (1-44)",
          "pillarId": "uint8 - Pillar ID (0-3)"
        },
        "requirements": [
          "Must be called with msg.value > 0",
          "Match must exist",
          "Pool must be Open",
          "Caller must have sufficient balance",
          "Prevents reentrancy via guard"
        ],
        "events": ["Staked(matchId, pillarId, staker, amount)"],
        "gas": "~84,210 gas (~0.0003 WF)"
      }
    ]
  }
}
```

### 6. **Frontend Component Tree** (NEW - Should Exist)
```
/frontend/src/components/
├── GlassStadium.jsx
│   ├── Props: { matchId, compact, onExpand }
│   ├── State: expanded, isLoading
│   ├── Wagmi Hooks: useReadContract (match data)
│   └── Dependencies: Framer Motion, Tailwind
├── PoolCard.jsx
│   ├── Props: { matchId, pillarId, pillar, poolData, externalUserStake, infinityWallRef, ... }
│   ├── State: amount, networkBusy, gasEstimate, toast, showConfirm, ripple
│   ├── Wagmi Hooks: useReadContract (pool data), useWriteContract (stake), usePublicClient (gas estimation)
│   ├── Key Functions: runGasEstimate(), handleStakeClick(), executeStake(), handleRippleClick()
│   ├── Real-Time Sync: infinityWallRef.current.refetchWall() on stake success
│   └── Network Resilience: 5s RPC timeout → 7s auto-reset
├── InfinityWall.jsx
│   ├── Exposed Ref API: { refetchWall() }
│   ├── Props: { demoMode, compact, maxDisplay, mockData }
│   ├── State: showAll, networkBusy, toast
│   ├── Wagmi Hooks: useReadContract (getInfinityWall), usePublicClient (watchContractEvent)
│   ├── Event Listeners: InfinityWallUpdated, PlayerTipped, Staked
│   ├── Polling: DISABLED (refetchInterval: false) — uses events instead
│   └── Animations: Framer Motion parallax, pulse glow on top contributor
├── MatchCenter.jsx
│   ├── Data Source: src/data/mockMatches.json
│   ├── Status States: LIVE (🔴), UPCOMING (⏳), COMPLETED (✅)
│   ├── Cards: Show team scores, attendance, impact multiplier, "Watch & Stake" button
│   └── UI: 3-layer glassmorphic (main card + radial glow + grid overlay)
└── [More components...]
```

### 7. **Wagmi/Viem Integration Points** (NEW - Should Exist)
```typescript
// File: frontend/src/lib/WAGMI_INTEGRATION.md

/**
 * How Wagmi/Viem connects React to WireFluid blockchain
 */

// 1. Read-Only Contracts (No gas, no transaction)
useReadContract({
  address: MARKET_ADDRESS,
  abi: MARKET_ABI,
  functionName: "getInfinityWall",
  query: {
    enabled: IS_MARKET_CONFIGURED && !demoMode,
    staleTime: 60000,
    refetchInterval: false, // Use events, not polling
  }
});

// 2. Write Contracts (Gas cost, transaction required)
useWriteContract({
  mutation: {
    onSuccess: (data) => {
      // Transaction submitted, wait for receipt
    }
  }
});

// 3. Real-Time Events (The new way)
publicClient.watchContractEvent({
  address: MARKET_ADDRESS,
  abi: ABI,
  eventName: "Staked",
  onLogs: (logs) => {
    refetchWall(); // Now leaderboard updates in <100ms
  }
});

// 4. Gas Estimation (Before submitting)
publicClient.estimateContractGas({
  account: address,
  address: MARKET_ADDRESS,
  abi: MARKET_ABI,
  functionName: "stake",
  args: [BigInt(matchId), pillarId],
  value: parseEther(amount),
});
```

### 16. **Oracle Backend API Contract** (Reference)
```
# Oracle Backend API Endpoints

## Public Endpoints

GET /api/live/matches
├─ Returns: Array of all PSL matches with live scores
├─ Response: [{ id: 1, homeTeam: "Hyderabad", awayTeam: "Lahore", homeScore: 145, awayScore: 142, status: "live" }, ...]
└─ Used by: MatchCenter.jsx, LeaderboardPage

GET /api/live/{matchId}
├─ Returns: Specific match with detailed live score
├─ Response: { matchId, teams, scores, wickets, overs, lastEvent, lastUpdate }
└─ Used by: GlassStadium.jsx, MatchDetail page

GET /api/live/health
├─ Returns: Oracle health status
├─ Response: { status: "healthy" | "degraded" | "down", cacheAge: 5, lastFetch: timestamp }
└─ Used by: Frontend status indicator

## Admin/Backend Endpoints

POST /api/events/inject
├─ Manually inject event (demo mode)
├─ Body: { matchId, eventType, eventJson }
└─ Owner: Admin only

POST /api/events/batch
├─ Submit batch of events to PSLImpactMarket.logBatchEvents()
├─ MaxEvents: 25 per batch
└─ Requires: ADMIN_ROLE on PSLImpactMarket

## WebSocket (ws://localhost:3001)

Messages:
├─ INIT: Oracle initialized
├─ BATCH_RESULT: { txHash, eventsProcessed, gasEstimate }
├─ HEALTH_CHANGE: { newStatus }
├─ FAILOVER: { reason: "Cricbuzz down, using cache" }
└─ API_ERROR: { endpoint, error }
```

---

## 🎨 Tier 3: Design & Branding (Read in Parallel)

### 17. **Design System & Branding** (Reference)
```
# PSL Pulse Design System

## Color Palette

### Dark Theme (Primary)
├─ Deep Black: #0a0a1a, #1a1026 (backgrounds)
├─ Mauve: #6D3A6D (primary accent)
├─ Rose: #B85C8A (secondary accent)
├─ Neon Violet: #D946EF (highlights)
└─ Neon Cyan: #00FFFF, Neon Green: #00FF00 (team-specific)

### Team Neon Mapping (8-Titan Protocol)
├─ LQ (Lahore): Neon Green (#00FF00)
├─ KK (Karachi): Royal Blue (#0000FF)
├─ IU (Islamabad): Hot Red (#FF0000)
├─ PZ (Peshawar): Electric Yellow (#FFFF00)
├─ QG (Quetta): Deep Purple (#800080)
├─ MS (Multan): Teal Blue (#008080)
├─ RP (Rawalpindi): Neon Cyan (#00FFFF)
└─ HK (Hyderabad): Deep Maroon (#800000)

## Typography
├─ Headings: System fonts (default)
├─ Body: System fonts (default)
├─ Monospace: For numbers, gas estimates, tx hashes
└─ Responsive: Mobile-first (rem-based scaling)

## Component Patterns

### Glassmorphic Card
├─ Background: rgba(255, 255, 255, 0.05)
├─ Backdrop: blur-xl
├─ Border: 1px solid rgba(255, 255, 255, 0.1)
├─ Shadow: shadow-xl
└─ Hover: border-opacity increases

### Radial Glow
├─ Layer 1: Large radial gradient (fuchsia/violet)
├─ Layer 2: Smaller radial gradient (rose)
├─ Opacity: 10-20% (subtle, not overwhelming)
└─ Animation: Pulse or breathe effect (optional)

### Framer Motion Patterns
├─ Page Entry: opacity 0→1, y: 20→0, stagger children
├─ Card Hover: scale 1→1.02
├─ Click Ripple: scale 0→5, opacity 0.4→0
├─ Toast Slide: y: 30→0, opacity 0→1
└─ Loading State: smooth spinner with border animation

## Accessibility
├─ WCAG AA compliant
├─ Keyboard navigation on all interactive elements
├─ ARIA labels on buttons, inputs, alerts
├─ Reduced motion support via prefers-reduced-motion
└─ Color contrast: ≥4.5:1 for text
```

### 18. **UI/UX Protocol Features** (From ARCHIVE_BLUEPRINT.md, Summarized)
```
# Must-Have UI/UX Features (for judges)

✅ Pulse Ripple: Every click (stake, tip, buy ticket) triggers animated ripple
✅ Infinity Wall: Scrolling leaderboard with parallax + crown on top contributor
✅ Glassmorphism: 3-layer cards (main + glow + grid overlay)
✅ Network Resilience: 5s timeout → "Node congested" toast → 7s auto-reset
✅ Zero-Latency Sync: Stake in PoolCard → Leaderboard updates in <100ms
✅ Real-Time Events: watchContractEvent instead of polling
✅ Demo Mode: Can replay matches without blockchain write
✅ Gas Badges: Show estimated gas cost before stake (~84,210 gas)
✅ Confirmation Modals: Anti-phishing (show amount + pillar before signing)
✅ Error Boundaries: Graceful fallbacks when RPC is down
```

---

## 📊 Tier 4: Deployment & Config (Reference)

### 19. **Environment Variables Template** (Reference)
```bash
# .env.local (NEVER commit this!)

# Contract Addresses (post-deployment)
NEXT_PUBLIC_MARKET_ADDRESS=0x...
NEXT_PUBLIC_BADGE_ADDRESS=0x...
NEXT_PUBLIC_TICKET_ADDRESS=0x...

# RPC & Explorer
NEXT_PUBLIC_WIREFLUID_RPC=https://evm.wirefluid.com
NEXT_PUBLIC_WIREFLUID_EXPLORER=https://wirefluidscan.com
NEXT_PUBLIC_WIREFLUID_CHAIN_ID=92533

# Wallet Connect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id_here

# Oracle Settings
NEXT_PUBLIC_ORACLE_URL=http://localhost:3001
NEXT_PUBLIC_ORACLE_WS=ws://localhost:3001

# Cricbuzz API (for oracle)
CRICBUZZ_API_KEY=your_api_key_here
CRICBUZZ_API_BASE=https://api.rapidapi.com/...

# Deployment Private Key (contracts only)
DEPLOYER_PRIVATE_KEY=0x...
```

### 20. **Deployment Checklist** (Reference)
```
# Deployment Sequence (for new bot to follow)

## Phase 1: Smart Contracts
- [ ] Review solidity code for reentrancy, overflow, access control
- [ ] Run: npx hardhat compile
- [ ] Run: npx hardhat test (coverage ≥90%)
- [ ] Deploy: npx hardhat run scripts/deploy.js --network wirefluid
- [ ] Seed 44 matches: yarn seed:matches
- [ ] Verify on WireFluidScan
- [ ] Copy addresses to .env.local

## Phase 2: Oracle Backend
- [ ] Install dependencies: npm install
- [ ] Test Cricbuzz API connectivity
- [ ] Run WebSocket server: npm start
- [ ] Test health endpoint: curl http://localhost:3001/api/live/health
- [ ] Run smoke tests: node scripts/smoke-live-ws.js

## Phase 3: Frontend
- [ ] Build: npm run build (no errors)
- [ ] Start dev: npm run dev
- [ ] Test wallet connection: Connect MetaMask → should show address
- [ ] Test staking flow: Stake 0.001 WIRE → should succeeed in <5s
- [ ] Test leaderboard: Stake → InfinityWall should update in <100ms
- [ ] Run Pagespeed: scores ≥85 (Lighthouse)

## Phase 4: Demo Readiness
- [ ] Run DEMO_SCRIPT.md scenarios end-to-end
- [ ] Record demo video (2 min)
- [ ] Test failover: Unplug internet → oracle should use stale cache
- [ ] Test slow RPC: Throttle connection → Network Busy toast appears after 5s
- [ ] Verify all error states have user-friendly toast messages
```

---

## 🧪 Tier 5: Testing & Validation (Reference)

### 21. **Test Coverage Map** (Reference)
```
# Unit Test Coverage Requirements

## Smart Contracts (100% critical flows)
├─ PSLImpactMarket.sol
│  ├─ ✅ stake() — normal flow, insufficient balance, zero value, reentrancy
│  ├─ ✅ tipPlayer() — normal flow, zero value, invalid player
│  ├─ ✅ getInfinityWall() — returns top 10, pagination
│  ├─ ✅ logBatchEvents() — max 25 events, deduplication
│  └─ ✅ Access control — oracle role required, admin role required
├─ ImpactBadge.sol
│  ├─ ✅ mintBadge() — normal flow, supply cap, minter role
│  └─ ✅ pillarOf() — returns correct pillar
└─ PSLTicket.sol
   ├─ ✅ buyTicket() — normal flow, capacity check
   └─ ✅ tierOf() — returns correct tier

## Frontend Components (80%+ coverage)
├─ PoolCard.jsx
│  ├─ Input validation (empty, negative, balance check)
│  ├─ Stake flow (happy path, cancel, error)
│  ├─ Gas estimation (displays, updates on amount change)
│  ├─ Network resilience (timeout, auto-reset)
│  └─ InfinityWall ref trigger (calls refetchWall())
├─ InfinityWall.jsx
│  ├─ Renders leaderboard from contract data
│  ├─ Event listeners fire on Staked event
│  ├─ Real-time update without page reload
│  └─ Ref API exposed correctly
└─ MatchCenter.jsx
   ├─ Renders mock matches from JSON
   ├─ Status indicators (LIVE, UPCOMING, COMPLETED)
   └─ 3-layer glassmorphic styling applied

## Oracle Backend (85%+ coverage)
├─ liveEngine.js
│  ├─ Fetches matches from Cricbuzz
│  ├─ Caching works (60s TTL)
│  ├─ Fallback to stale cache when API down
│  └─ Match ID mapping correct
├─ pulseOracle.js
│  ├─ Detects impact events (sixes, wickets)
│  ├─ Deduplicates events
│  ├─ Batches up to 25 events
│  └─ Gas estimation runs without error
└─ WebSocket
   ├─ BATCH_RESULT message sent after batch
   ├─ HEALTH_CHANGE broadcasts on failover
   └─ Multiple clients can subscribe

## Integration Tests
├─ Stake flow end-to-end (PoolCard → Contract → Leaderboard)
├─ Event listener triggers within 100ms
├─ Oracle failover gracefully (Cricbuzz down → stale cache)
└─ Network timeout handled (5s warning, 7s auto-reset)
```

---

## 🎯 Tier 6: Requirements Traceability (Navigation)

### 22. **Feature → Requirement → Implementation Map** (Reference)
```
# Traceability Matrix (for requirements validation)

Feature: Real-Time Leaderboard
├─ Blueprint Ref: §5, §52-53 (Infinity Wall Scroll of Fame)
├─ Requirements:
│  ├─ Top 10 contributors visible
│  ├─ Updates in <100ms after stake
│  ├─ Shows avatar, name, contribution amount, rank
│  └─ Top contributor has animated crown
├─ Implementation:
│  ├─ Component: InfinityWall.jsx (lines 1-1300)
│  ├─ Data Source: PSLImpactMarket.getInfinityWall()
│  ├─ Real-Time: publicClient.watchContractEvent("Staked", "PlayerTipped", "InfinityWallUpdated")
│  ├─ Animation: Framer Motion parallax + pulse glow
│  └─ Ref API: useImperativeHandle(ref, () => ({ refetchWall }))
├─ Testing:
│  ├─ Unit: LeaderboardSort(), RenderRank(), AnimateTop()
│  ├─ Integration: Stake → Event fires → Leaderboard updates
│  └─ Performance: <100ms update latency
├─ Demo Protocol: Show live tip → leaderboard updates → see name on wall
└─ Judging Pillar: Smart Contract Security (on-chain leaderboard, auditable)

Feature: Gas Estimation Badge
├─ Blueprint Ref: §5 lines 390-393
├─ Requirements:
│  ├─ Show estimated gas cost before stake
│  ├─ Update as user changes amount (debounced 500ms)
│  ├─ Display format: ~84,210 (comma-separated)
│  └─ animated pulse (visual pop)
├─ Implementation:
│  ├─ Component: PoolCard.jsx (runGasEstimate function)
│  ├─ Hook: publicClient.estimateContractGas()
│  ├─ UI: Badge at top-right of stake button
│  └─ Animation: animate-pulse (Tailwind)
├─ Testing:
│  ├─ Unit: formatGas(), estimateOnChange()
│  ├─ Integration: Amount input → gas updates
│  └─ Edge case: RPC timeout → badge disappears
├─ Demo Protocol: Enter amount → see gas badge appear
└─ Judging Pillar: Gas Efficiency (shows cost awareness)

[... repeat for all major features ...]
```

---

## 📋 Quick Reference Checklist for New Bot

**Tier 1: Critical Context (Must Read)**
- [ ] SYSTEM_CONTEXT_COMPLETE.md
- [ ] ARCHIVE_BLUEPRINT.md
- [ ] CODEBASE_FILEMAP.md

**Tier 2: Implementation Specs (Must Read)**
- [ ] STATE_MANAGEMENT_PATTERNS.md (React hooks best practices)
- [ ] INPUT_VALIDATION_RULES.md (frontend validation + contract checks)
- [ ] CACHE_INVALIDATION_STRATEGY.md (when to refetch)
- [ ] EVENT_LISTENER_EDGE_CASES.md (real-time edge cases)
- [ ] TRANSACTION_LIFECYCLE.md (wallet + stake flow)
- [ ] ERROR_HANDLING_MATRIX.md (40+ error scenarios)
- [ ] ADMIN_WORKFLOWS.md (admin operations)
- [ ] SECURITY_THREAT_MODEL.md (exploit prevention)
- [ ] PERFORMANCE_OPTIMIZATION.md (speed + bundle size)
- [ ] DATABASE_PERSISTENCE_STRATEGY.md (data durability)

**Tier 3-6: Reference (Skim as Needed)**
- [ ] Contract ABIs & Function Signatures
- [ ] Frontend Component Tree
- [ ] Wagmi Integration Points
- [ ] Oracle API Contract
- [ ] Design System
- [ ] UI/UX Protocol Features
- [ ] Environment Variables
- [ ] Deployment Checklist
- [ ] Test Coverage Map
- [ ] Traceability Matrix

---

## ✅ How to Use This Onboarding Package

**If you're handed off to a new AI assistant, give them:**

1. **All existing markdown files in this repo:**
   - README.md
   - ARCHIVE_BLUEPRINT.md
   - CODEBASE_FILEMAP.md
   - SYSTEM_CONTEXT_COMPLETE.md
   - DEMO_SCRIPT.md

2. **All 10 NEW Technical Specification Files:**
   - STATE_MANAGEMENT_PATTERNS.md ✅
   - INPUT_VALIDATION_RULES.md ✅
   - CACHE_INVALIDATION_STRATEGY.md ✅
   - EVENT_LISTENER_EDGE_CASES.md ✅
   - TRANSACTION_LIFECYCLE.md ✅
   - ERROR_HANDLING_MATRIX.md ✅
   - ADMIN_WORKFLOWS.md ✅
   - SECURITY_THREAT_MODEL.md ✅
   - PERFORMANCE_OPTIMIZATION.md ✅
   - DATABASE_PERSISTENCE_STRATEGY.md ✅

3. **Then say:** "Read Tier 1 first (System Context + Blueprint + Filemap). Then read all 10 Tier 2 Implementation Specs. Reference Tiers 3-6 as needed. These documents are your source of truth. If anything contradicts these, ask for clarification before changing it. Your job is to implement features listed in ARCHIVE_BLUEPRINT.md, map them to CODEBASE_FILEMAP.md entries, ensure SYSTEM_CONTEXT_COMPLETE.md data flow stays intact, and follow the 10 implementation specs."

---

## 🎓 Pro Tips for the New Bot

1. **Before coding:** Check if your change is in ARCHIVE_BLUEPRINT.md §Requirements. If not, ask for clarification.

2. **Before merging:** Update CODEBASE_FILEMAP.md with new file/version info + run error checks.

3. **When debugging:** Trace the data flow using SYSTEM_CONTEXT_COMPLETE.md diagrams. Most bugs are async state or event listener issues.

4. **When stuck:** Check TRACEABILITY_MATRIX.md to see if this feature is implemented elsewhere.

5. **When demoing:** Follow DEMO_SCRIPT.md exactly. Don't improvise.

6. **Gas optimization:** Check if your function calls are `external` (not `public`). Saves ~200 gas per call.

7. **UI consistency:** All new components must use the DESIGN_SYSTEM.md color palette, Framer Motion patterns, and Tailwind classes.

8. **Testing:** Hit 90%+ coverage. Critical flows must be 100%. Use test names from TEST_COVERAGE_MAP.md.

---

**In short:** These 23 documents (13 existing + 10 new deep-dive specs) make PSL Pulse fully documented and handoff-ready for any AI assistant. No more "Wait, why does this exist?" questions. Just "Implement this feature" → bot looks up blueprint → bot looks up implementation specs → bot codes with 100% confidence.

