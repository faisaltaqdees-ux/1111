# Admin Workflows

**How admins deploy matches, set up the oracle, distribute payouts** — Complete step-by-step guides

---

## Core Principle

Admin workflows are the mechanisms that set up matches, manage pools, and distribute rewards. They're separate from user workflows (staking/tipping) but critical to system operation.

**Admin roles**:
- **ADMIN_ROLE**: Can deploy matches, update pool settings, pause/resume
- **ORACLE_ROLE**: Can submit live scores, update match status
- **OWNER**: Can grant roles, withdraw funds
- **ORCHESTRATOR**: Backend service that automates match setup

---

## Admin Workflow 1: Deploy 44 PSL 2026 Matches

### When This Happens

At the start of PSL 2026 season, admin needs to deploy 44 cricket matches as pools.

### Step-by-Step Process

#### Step 1: Prepare Match Data

**File**: `contracts/scripts/deploy.js`

```javascript
// PSL 2026 schedule (example)
const matches = [
  {
    id: 1,
    team1: "Karachi Kings",
    team2: "Multan Sultans",
    scheduledStartTime: Math.floor(new Date("2026-02-15 14:00 UTC").getTime() / 1000),
    venue: "National Stadium Karachi",
    teams: {
      0x1111111111111111111111111111111111111111: "Karachi Kings", // team address
      0x2222222222222222222222222222222222222222: "Multan Sultans"
    }
  },
  // ... 43 more matches
];
```

**Why Each Field?**
- `id`: Unique identifier (1-44)
- `team1 / team2`: Human-readable (for UI)
- `scheduledStartTime`: Unix timestamp (contract logic for match status)
- `venue`: For UI display
- `teams`: Mapping of team addresses to names (for Oracle to identify teams)

#### Step 2: Connect to WireFluid as Admin

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying matches as:", deployer.address);
  
  // Verify this address has ADMIN_ROLE
  const market = await hre.ethers.getContractAt(
    "PSLImpactMarket",
    "0xMARKET_ADDRESS"
  );
  
  const hasAdminRole = await market.hasRole(
    hre.ethers.id("ADMIN_ROLE"),
    deployer.address
  );
  console.log("Has ADMIN_ROLE:", hasAdminRole);
  
  if (!hasAdminRole) {
    throw new Error("❌ Not an admin!");
  }
}

main().catch(console.error);
```

**Output**:
```
Deploying matches as: 0xABCD...
Has ADMIN_ROLE: true
✓ Ready to deploy
```

#### Step 3: Create Match Pools (One Per Match)

```javascript
// scripts/deploy.js
async function deployMatches() {
  const market = await hre.ethers.getContractAt(
    "PSLImpactMarket",
    "0xMARKET_ADDRESS"
  );
  
  const matches = [
    { id: 1, team1: "Karachi Kings", team2: "Multan Sultans", time: ... },
    // ... 43 more
  ];
  
  for (const match of matches) {
    console.log(`\n📅 Deploying Match ${match.id}: ${match.team1} vs ${match.team2}`);
    
    // Call deployMatch on contract
    const tx = await market.deployMatch(
      match.id,                    // matchId
      [0.1, 0.1, 0.1, 0.1],       // minStakAmount for each pillar (0.1 WIRE)
      [100, 100, 100, 100],        // maxStakAmount for each pillar (100 WIRE)
      [2.5, 2.5, 2.5, 2.5],        // rewardMultiplier for each pillar (2.5x)
      match.scheduledStartTime,
      { gasLimit: 300000 }
    );
    
    console.log(`  TX: ${tx.hash}`);
    await tx.wait();
    console.log(`  ✓ Match ${match.id} deployed`);
  }
  
  console.log("\n✓ All 44 matches deployed!");
}
```

**What This Does**:
- Calls `deployMatch()` on PSLImpactMarket contract (requires ADMIN_ROLE)
- Creates 4 pools per match (one for each pillar: Bowler, Batter, Fielder, AllRounder)
- Sets min/max stake (0.1 - 100 WIRE per pillar)
- Sets reward multiplier (2.5x for impact pools)

**Cost**: ~30-40 WF per match (~1320-1760 WF total = ~$0.40-0.50 at $0.0003/WF)

#### Step 4: Verify Deployment

```javascript
async function verifyDeployment() {
  const market = await hre.ethers.getContractAt("PSLImpactMarket", "0xMARKET_ADDRESS");
  
  for (let matchId = 1; matchId <= 44; matchId++) {
    const pools = [];
    for (let pillarId = 0; pillarId < 4; pillarId++) {
      const pool = await market.getPool(matchId, pillarId);
      pools.push({
        pillar: ["Bowler", "Batter", "Fielder", "AllRounder"][pillarId],
        isOpen: pool.isOpen,
        totalStaked: hre.ethers.formatEther(pool.totalStaked),
        minStake: hre.ethers.formatEther(pool.minStakAmount)
      });
    }
    console.log(`Match ${matchId}:`, pools);
  }
}
```

**Output**:
```
Match 1:
  Bowler: isOpen=true, totalStaked=0, minStake=0.1
  Batter: isOpen=true, totalStaked=0, minStake=0.1
  Fielder: isOpen=true, totalStaked=0, minStake=0.1
  AllRounder: isOpen=true, totalStaked=0, minStake=0.1
Match 2: ...
```

#### Step 5: Push to Production

```
npm run deploy
✓ All 44 matches deployed to WireFluid
✓ Frontend now displays matches in MatchCenter
```

---

## Admin Workflow 2: Grant ORACLE_ROLE to Backend

### When This Happens

Backend service (PulseOracle) needs permission to submit live scores.

### Step-by-Step Process

#### Step 1: Identify Oracle Backend Address

```javascript
// From oracle server logs
const ORACLE_ADDRESS = "0x..."; // The address running PulseOracle service

// Verify it's the right address
console.log("Oracle address to grant role:", ORACLE_ADDRESS);
```

#### Step 2: Connect as Owner

```javascript
// scripts/grant-admin.js
const hre = require("hardhat");

async function grantOracleRole() {
  const [owner] = await hre.ethers.getSigners();
  console.log("Connected as owner:", owner.address);
  
  const market = await hre.ethers.getContractAt("PSLImpactMarket", "0xMARKET_ADDRESS");
  
  // Get ORACLE_ROLE identifier
  const ORACLE_ROLE = hre.ethers.id("ORACLE_ROLE");
  
  // Grant role
  const tx = await market.grantRole(ORACLE_ROLE, "0xORACLE_ADDRESS");
  console.log("TX:", tx.hash);
  
  await tx.wait();
  console.log("✓ ORACLE_ROLE granted to PulseOracle backend");
}

grantOracleRole().catch(console.error);
```

#### Step 3: Verify Role Granted

```javascript
async function verifyOracleRole() {
  const market = await hre.ethers.getContractAt("PSLImpactMarket", "0xMARKET_ADDRESS");
  
  const ORACLE_ROLE = hre.ethers.id("ORACLE_ROLE");
  const hasRole = await market.hasRole(ORACLE_ROLE, "0xORACLE_ADDRESS");
  
  if (hasRole) {
    console.log("✓ Oracle role verified");
  } else {
    console.log("❌ Oracle role grant failed");
  }
}
```

---

## Admin Workflow 3: Seed Match Data (Pre-Tournament)

### When This Happens

Before tournament starts, populate match details (teams, venues, dates).

### Step-by-Step Process

```javascript
// oracle/scripts/seed-matches.js
const hre = require("hardhat");

async function seedMatches() {
  const market = await hre.ethers.getContractAt("PSLImpactMarket", "0xMARKET_ADDRESS");
  
  const matches = [
    {
      id: 1,
      team1Address: "0x1111111111111111111111111111111111111111",
      team2Address: "0x2222222222222222222222222222222222222222",
      team1Name: "Karachi Kings",
      team2Name: "Multan Sultans",
      scheduledTime: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
      venue: "National Stadium Karachi"
    },
    // ... 43 more
  ];
  
  for (const match of matches) {
    // Call seedMatch (if contract has this function)
    const tx = await market.seedMatch(
      match.id,
      match.team1Address,
      match.team2Address,
      match.scheduledTime
    );
    
    await tx.wait();
    console.log(`✓ Seeded match ${match.id}`);
  }
}
```

---

## Admin Workflow 4: Distribute Payouts at Match End

### When This Happens

Match ends (e.g., Karachi Kings beat Multan Sultans). Admin calculates rewards and distributes to winners.

### Step-by-Step Process

#### Step 1: Finalize Match Result

```javascript
// oracle backend finishes the match
const result = {
  matchId: 1,
  winningPillarId: 0, // Bowler had most impact
  manOfMatch: "0xPLAYER_ADDRESS",
  finalScore: { team1: 165, team2: 142 }
};
```

#### Step 2: Calculate Payouts

```javascript
// From PSLImpactMarket.sol (admin calls this)
async function finalizeMatch() {
  const market = await hre.ethers.getContractAt("PSLImpactMarket", "0xMARKET_ADDRESS");
  
  const tx = await market.finalizeMatch(
    matchId,        // 1
    winningPillarId // 0 (Bowler pillar wins)
  );
  
  // Contract does:
  // 1. Fetch all stakes in winning pillar
  // 2. Calculate total staked: 450 WIRE
  // 3. Calculate rewards: 450 * 2.5 = 1125 WIRE
  // 4. Distribute to each staker proportionally
  // 5. Emit MatchFinalized event
  
  await tx.wait();
  console.log("✓ Match finalized, rewards distributed");
}
```

#### Step 3: Verify Payouts

```javascript
// User who staked 10 WIRE in winning pillar:
// Share: 10 / 450 = 2.22%
// Reward: 1125 * 2.22% = 25 WIRE (10 original + 15 gain)

const userReward = await market.getUserReward(matchId, "0xUSER_ADDRESS");
console.log("User reward:", ethers.formatEther(userReward));
```

---

## Admin Workflow 5: Close Pool Early (Emergency)

### When This Happens

Pool needs to close without waiting for match end (e.g., security issue, data corruption).

### Step-by-Step Process

```javascript
// scripts/emergency-close.js
async function closePoolEmergency() {
  const market = await hre.ethers.getContractAt("PSLImpactMarket", "0xMARKET_ADDRESS");
  
  const ADMIN_ROLE = hre.ethers.id("ADMIN_ROLE");
  const [signer] = await hre.ethers.getSigners();
  
  // Verify admin
  const isAdmin = await market.hasRole(ADMIN_ROLE, signer.address);
  if (!isAdmin) throw new Error("Not admin");
  
  // Close pool
  const tx = await market.closePool(
    matchId,   // 1
    pillarId   // 0 (Bowler)
  );
  
  console.log("Closing pool early...");
  await tx.wait();
  console.log("✓ Pool closed");
  
  // Result: Users can withdraw stakes, no new stakes accepted
}
```

---

## Admin Workflow 6: Manage Uptime & Failover

### When This Happens

RPC node goes down, need to switch to backup.

### Step-by-Step Process

#### Current Setup

```javascript
// ore/lib/contract.js
const publicClient = createPublicClient({
  chain: wirefluid,
  transport: http("https://rpc.wirefluid.com") // Primary RPC
});
```

#### Failover Process

```javascript
// oracle/servers/health-check.js
async function checkRPC() {
  try {
    const blockNumber = await publicClient.getBlockNumber();
    console.log("✓ RPC healthy, block:", blockNumber);
  } catch (error) {
    console.error("❌ RPC down, switching to backup");
    // Switch to backup RPC
    publicClient = createPublicClient({
      chain: wirefluid,
      transport: http("https://backup-rpc.wirefluid.com")
    });
    console.log("✓ Switched to backup RPC");
    // Also notify admin
    notifyAdmin("RPC failover triggered");
  }
}

// Run every 30 seconds
setInterval(checkRPC, 30000);
```

---

## Admin Workflow 7: Monitor System Health

### Metrics to Monitor

```javascript
// oracle/scripts/demo-health-check.js
async function healthCheck() {
  const checks = {
    "RPC Connection": await checkRPC(),
    "Oracle Balance": await checkOracleBalance(),
    "Event Listener": await checkEventListener(),
    "Match Status": await checkMatchStatus(),
    "Pending Payouts": await checkPendingPayouts()
  };
  
  return checks;
}
```

#### Example Health Check Dashboard

| Metric | Status | Action |
|--------|--------|--------|
| ✓ RPC Connected | ✓ Healthy | — |
| ✓ Event Listener | ✓ Active (50 events/hr) | — |
| ⚠ Oracle Balance | ⚠ Low (50 WF) | Top up |
| ✓ Matches | ✓ 44 deployed | — |
| ⚠ Pending Payouts | ⚠ 3 matches waiting | Finalize manually |

---

## Admin Workflow 8: Database Maintenance

### Backup Matches

```javascript
// scripts/backup-matches.js
async function backupMatches() {
  const market = await hre.ethers.getContractAt("PSLImpactMarket", "0xMARKET_ADDRESS");
  
  const backup = {};
  for (let i = 1; i <= 44; i++) {
    const pools = [];
    for (let p = 0; p < 4; p++) {
      pools.push(await market.getPool(i, p));
    }
    backup[`match_${i}`] = pools;
  }
  
  fs.writeFileSync("backups/matches-" + Date.now() + ".json", JSON.stringify(backup, null, 2));
  console.log("✓ Backed up all matches");
}
```

### Reset Match (Development Only)

```javascript
async function resetMatch(matchId) {
  const market = await hre.ethers.getContractAt("PSLImpactMarket", "0xMARKET_ADDRESS");
  
  // Careful: Only in dev!
  if (process.env.NETWORK !== "localhost") {
    throw new Error("❌ Reset only allowed on localhost");
  }
  
  const tx = await market.resetMatch(matchId);
  await tx.wait();
  console.log("✓ Match reset");
}
```

---

## Admin Checklist

Before PSL 2026 starts:

- [ ] Deploy 44 matches (Workflow 1)
- [ ] Grant ORACLE_ROLE to PulseOracle backend (Workflow 2)
- [ ] Seed match data (Workflow 3)
- [ ] Set up monitoring dashboard (Workflow 7)
- [ ] Perform test finalization (Workflow 4)
- [ ] Verify backup process (Workflow 8)
- [ ] Test failover (Workflow 6)

During PSL 2026:

- [ ] Monitor RPC health (30s intervals)
- [ ] Monitor events (check if arriving)
- [ ] Finalize matches as they complete (Workflow 4)
- [ ] Handle emergency closures if needed (Workflow 5)
- [ ] Daily backups

---

## Common Admin Issues & Fixes

### Issue 1: Not Admin, Can't Deploy

```
❌ Error: "PSLImpactMarket: AccessControl"

Fix:
1. Verify address has ADMIN_ROLE
2. If not, owner must grant role first:
   market.grantRole(ADMIN_ROLE, addressToGrant)
3. Retry deployment
```

### Issue 2: Out of Gas

```
❌ Error: "Out of gas"

Fix:
1. Increase gasLimit
2. Batch deployments (deploy 10 matches per TX instead of 44)
3. Deploy during low-traffic time
```

### Issue 3: Oracle Behind on Payouts

```
⚠️ Matches completed but payouts not distributed

Fix:
1. Check oracle health (Event listeners active?)
2. Manually call finalizeMatch for each completed match
3. Verify oracle has balance to pay gas
```

---

## Scripts Reference

```bash
# Deploy 44 matches
npm run deploy

# Grant oracle role
npx hardhat run scripts/grant-admin.js --network wirefluid

# Check health
npm run health-check

# Backup matches
npx hardhat run scripts/backup-matches.js --network wirefluid

# Emergency close pool
npx hardhat run scripts/emergency-close.js --network wirefluid --matchId=1
```

