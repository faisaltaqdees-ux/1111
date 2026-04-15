# One-Day Build Timeline: PSL Pulse to Demo Ready

**Hour-by-hour breakdown for deploying PSL Pulse from scratch to functioning testnet demo**

---

## Overview

| Phase | Duration | Tasks | Status by End |
|-------|----------|-------|---|
| **Phase 1: Setup** | 0:00-1:30 | Node, MetaMask, WireFluid network | PC ready for development |
| **Phase 2: Smart Contracts** | 1:30-3:00 | Deploy 3 contracts to testnet | All contracts live, addresses saved |
| **Phase 3: Environment** | 3:00-3:45 | .env files, RPC config | All systems know where contracts are |
| **Phase 4: Frontend Local** | 3:45-5:00 | Build & run frontend | Home page loads, wallet connects |
| **Phase 5: Oracle Backend** | 5:00-5:45 | Start oracle server + API | Real-time event processing working |
| **Phase 6: Integration Test** | 5:45-6:30 | End-to-end stake → leaderboard | User can place bets, see results |

**Total: ~6.5 hours to fully working demo**

---

## Phase 1: Environment Setup (1.5 hours)
**00:00 - 01:30**

### 00:00-00:15: Node.js & Git Installation

```bash
# Windows: Download & run installers from:
# - https://nodejs.org (LTS)
# - https://git-scm.com/download/win

# Verify installation
node --version
npm --version
git --version

# Expected output: All three commands return version numbers (no errors)
```

**If downloads slow:** Skip git download, clone will fail, continue with local setup for now.

### 00:15-00:30: Project Clone/Setup

```bash
# Option A: Clone from repo (if available)
git clone <REPO_URL> psl-pulse
cd psl-pulse

# Option B: Manual file copy (if no repo)
# Copy all folders: contracts/, frontend/, oracle/
# Copy all files: README.md, etc.
cd psl-pulse
```

### 00:30-00:45: MetaMask Installation & Wallet

1. Install MetaMask extension: https://metamask.io
2. Create new wallet OR import existing
3. **Save seed phrase in password manager** ← CRITICAL

### 00:45-01:00: Add WireFluid Network

1. MetaMask → Network dropdown
2. Click "Add network"
3. Fill in:
   - Network name: **WireFluid Testnet**
   - RPC URL: **https://evm.wirefluid.com**
   - Chain ID: **92533**
   - Currency: **WF**
   - Explorer: **https://wirefluidscan.com**
4. Save
5. **Verify:** Should see "WireFluid Testnet" in dropdown

### 01:00-01:15: Get Testnet Tokens

1. Go to https://faucet.wirefluid.com
2. Copy wallet address from MetaMask
3. Paste into faucet
4. Click "Request Tokens"
5. Wait for confirmation email/message
6. Should see 10-100 WIRE in MetaMask balance

**Status check:**
```bash
# MetaMask should show:
# ✓ Connected to WireFluid Testnet
# ✓ Balance: 10.0 WF (or similar)
```

### 01:15-01:30: Install Project Dependencies

```bash
# Install root dependencies (if needed)
npm install

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install oracle dependencies
cd ../oracle
npm install
```

**Expected output:** All three folders complete without major errors
(Small warnings about peer dependencies are OK)

---

## Phase 2: Smart Contract Deployment (1.5 hours)
**01:30 - 03:00**

### 01:30-01:45: Hardhat Configuration

**File:** `contracts/hardhat.config.js`

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    wirefluid: {
      url: "https://evm.wirefluid.com",
      chainId: 92533,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || "0x0"],
      gasPrice: 300000000,
    },
  },
};
```

### 01:45-02:00: Setup .env for Deployment

**File:** `contracts/.env`

```bash
# Get private key from MetaMask:
# 1. MetaMask icon → 3 dots menu → Account Details
# 2. "Export Private Key" → Enter password
# 3. Copy 0x... string
# 4. Paste below:

DEPLOYER_PRIVATE_KEY=0x[YOUR_PRIVATE_KEY]

# Add to .gitignore immediately!
```

### 02:00-02:15: Verify Contracts Compile

```bash
cd contracts
npx hardhat compile

# Expected output:
# Compiling 3 Solidity files...
# ✓ Successfully compiled 3 modules
```

**If errors:**
- Check Solidity version in .sol files (should be ^0.8.20)
- Check all imports are correct
- Copy exact contract code from SYSTEM_CONTEXT or documentation

### 02:15-02:45: Deploy Contracts to Testnet

```bash
npx hardhat run scripts/deploy.js --network wirefluid

# Expected output:
# Deploying to WireFluid Testnet (Chain ID: 92533)...
# 
# PSLImpactMarket deployed to: 0xABC...
# PSLTicket deployed to: 0xDEF...
# ImpactBadge deployed to: 0xGHI...
# 
# ✓ All contracts deployed successfully!
```

**IMPORTANT:** Copy the 3 contract addresses and **paste into a file** (you'll need them in Phase 3):

File: `contracts/DEPLOYED_ADDRESSES.txt`
```
MARKET_ADDRESS=0xABC...
TICKET_ADDRESS=0xDEF...
BADGE_ADDRESS=0xGHI...
```

### 02:45-03:00: Verify Deployment on Block Explorer

For each contract address:
1. Go to https://wirefluidscan.com
2. Paste address in search
3. Should show:
   - ✓ "Contract" label
   - ✓ Solidity source code
   - ✓ (No errors)

**Status after Phase 2:**
```
☑ MarketContract deployed + verified
☑ TicketContract deployed + verified  
☑ BadgeContract deployed + verified
☑ All addresses saved
```

---

## Phase 3: Environment Configuration (45 minutes)
**03:00 - 03:45**

### 03:00-03:15: Frontend .env Setup

**File:** `frontend/.env.local`

```bash
# Copy these from contracts/DEPLOYED_ADDRESSES.txt
NEXT_PUBLIC_MARKET_ADDRESS=0xABC...
NEXT_PUBLIC_TICKET_ADDRESS=0xDEF...
NEXT_PUBLIC_BADGE_ADDRESS=0xGHI...

# WireFluid Network
NEXT_PUBLIC_WIREFLUID_RPC=https://evm.wirefluid.com
NEXT_PUBLIC_WIREFLUID_CHAIN_ID=92533
NEXT_PUBLIC_WIREFLUID_EXPLORER=https://wirefluidscan.com

# Oracle Backend (will run on localhost:3001)
NEXT_PUBLIC_ORACLE_URL=http://localhost:3001
NEXT_PUBLIC_ORACLE_WS=ws://localhost:3001

# WalletConnect (optional for demo, can skip)
NEXT_PUBLIC_WC_PROJECT_ID=test_key_12345
```

### 03:15-03:30: Oracle .env Setup

**File:** `oracle/.env`

```bash
# Contracts (copy from contracts/DEPLOYED_ADDRESSES.txt)
PSL_MARKET_ADDRESS=0xABC...

# WireFluid
WIREFLUID_RPC=https://evm.wirefluid.com
WIREFLUID_CHAIN_ID=92533

# Cricbuzz API (for live cricket data)
# Sign up free at: https://rapidapi.com/cricapi-t/api/cricketapi
CRICBUZZ_API_KEY=your_api_key

# Oracle Server
ORACLE_PORT=3001
ORACLE_HOST=localhost

# Private Key (same as deployer)
ORACLE_PRIVATE_KEY=0x[YOUR_PRIVATE_KEY]
```

### 03:30-03:45: Quick Verification

```bash
# Check frontend .env has all vars
cd frontend
grep NEXT_PUBLIC .env.local | wc -l
# Should show 7+ lines

# Check oracle .env has all vars
cd ../oracle
grep -c "=" .env
# Should show 7+ lines
```

**Status after Phase 3:**
```
☑ Frontend knows where contracts are
☑ Oracle knows where contracts are
☑ Both can reach WireFluid RPC
```

---

## Phase 4: Frontend Build & Run (1.25 hours)
**03:45 - 05:00**

### 03:45-04:00: Install Frontend Dependencies (if not done)

```bash
cd frontend
npm install
```

### 04:00-04:15: Build Frontend

```bash
cd frontend
npm run build

# Expected output:
# ▲ Next.js 14.0.0
# ✓ Compiled successfully
# ✓ Linted successfully
```

**If build fails:**
- Check `frontend/src/` has no TypeScript errors
- Run `npm run type-check` to see errors
- Fix imports, re-run build
- If still fails, compare .jsx files to SYSTEM_CONTEXT_COMPLETE.md

### 04:15-04:30: Start Frontend Dev Server

```bash
cd frontend
npm run dev

# Expected output:
# ▲ Next.js 14.0.0
# - Local: http://localhost:3000
# Ready in 2.3s
# 
# 🎨 PSL Pulse Frontend Running on localhost:3000
```

**Keep this terminal running. Open new terminal for Phase 5.**

### 04:30-04:50: Verify Frontend Loading

1. Open browser: http://localhost:3000
2. Should see:
   - ✓ PSL Pulse header/logo
   - ✓ Match cards loading
   - ✓ No errors in Developer Console (F12)
3. Click "Connect Wallet"
4. MetaMask popup appears
5. Click "Connect"
6. Should show wallet address in top right

**Common issues & fixes:**

| Issue | Fix |
|-------|-----|
| Blank page | Check console for errors (F12). Check .env.local has NEXT_PUBLIC_* vars. |
| "RPC not found" | Verify NEXT_PUBLIC_WIREFLUID_RPC is correct in .env.local |
| "Connect Wallet" button missing | Check components/ConnectWallet.jsx exists |
| MetaMask not responding | Switch MetaMask to WireFluid network. Click "Connect" button again. |

### 04:50-05:00: Checkpoint

```bash
# In frontend terminal, you should see:
# ✓ Compiled /pages/index.js
# ✓ Compiled /components/PoolCard.jsx
# ✓ (no errors)
```

**Status after Phase 4:**
```
☑ Frontend running on localhost:3000
☑ Page loads without blank screen
☑ Wallet connects successfully
☑ No critical errors in console
```

---

## Phase 5: Oracle Backend Setup (45 minutes)
**05:00 - 05:45**

### 05:00-05:15: Install Oracle Dependencies (if not done)

```bash
cd oracle
npm install
```

### 05:15-05:30: Verify Oracle Configuration

```bash
# Check oracle/.env exists
cat oracle/.env

# Should show:
# PSL_MARKET_ADDRESS=0x...
# WIREFLUID_RPC=...
# CRICBUZZ_API_KEY=...
```

### 05:30-05:45: Start Oracle Server

```bash
cd oracle
npm start

# Expected output:
# ✓ Oracle server listening on http://localhost:3001
# ✓ WebSocket server listening on ws://localhost:3001
# ✓ Cricbuzz API healthy
# ✓ LiveEngine initialized
```

**Keep this terminal running. Open new terminal for Phase 6.**

**troubleshooting:**

| Error | Fix |
|-------|-----|
| `PORT 3001 already in use` | Kill process: `lsof -ti:3001 \| xargs kill -9` (Mac/Linux) or `netstat -ano \| findstr :3001` (Windows) |
| `Cannot connect to Cricbuzz` | Check CRICBUZZ_API_KEY in .env. Try signing up at https://rapidapi.com/cricapi-t/api/cricketapi |
| `WIREFLUID_RPC connection failed` | Verify RPC URL is correct: `curl https://evm.wirefluid.com -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'` |

**Status after Phase 5:**
```
☑ Oracle running on localhost:3001
☑ WebSocket connected
☑ Live cricket data fetching
☑ Ready to process bets
```

---

## Phase 6: Integration Testing (45 minutes)
**05:45 - 06:30**

### 05:45-06:00: Test 1 - Wallet Connected

**In browser (http://localhost:3000):**

1. Look at top right → Should show wallet address (0x...)
2. Click on it → MetaMask opens showing WireFluid network
3. Verify network is "WireFluid Testnet"
4. Verify balance shows (should be ~10 WF)

**Result:** ✓ Pass if all true

### 06:00-06:15: Test 2 - Place a Stake

1. On homepage, find a match card
2. Click on match → Match detail page opens
3. Enter stake: **0.1** WF
4. Click "Stake" button
5. MetaMask popup appears
6. Click "Confirm"
7. Wait 5-10 seconds
8. Should see toast: "✓ Stake submitted!"
9. After 10 seconds: "✓ Stake confirmed!"

**Common issues & fixes:**

| Issue | Fix |
|-------|-----|
| MetaMask popup doesn't appear | Check browser console for errors. Check MARKET_ADDRESS is set. |
| "Insufficient balance" | Get more WIRE from faucet: https://faucet.wirefluid.com |
| Transaction reverted | Check block explorer for reason. May need to wait for pool to be active. |

**Result:** ✓ Pass if transaction confirms in <20 seconds

### 06:15-06:25: Test 3 - Leaderboard Updates

1. After stake confirms, go to Leaderboard page
2. Should see your address in top 10
3. Amount should match your stake (0.1)
4. Last updated time should show now

**If leaderboard doesn't update:**
1. Refresh page
2. Wait 5 seconds
3. Should update
4. Check oracle server logs (should show event processing)

**Result:** ✓ Pass if your stake appears within 30 seconds

### 06:25-06:30: Test 4 - Verify on Block Explorer

1. Go to https://wirefluidscan.com
2. Paste your wallet address
3. Should see your stake transaction in list:
   - Status: "Success" (green checkmark)
   - Type: "Transfer" or "Contract Interaction"
   - Value: 0.1+ WF

4. Click on transaction
5. Should show:
   - From: Your address
   - To: PSLImpactMarket contract address
   - Method: "stake()"
   - Status: "Success"

**Result:** ✓ Pass if transaction visible + status "Success"

---

## Success Criteria

By 06:30, you should have:

```
PHASE 1 (Environment):
☑ Node.js v18+
☑ MetaMask with 10+ WIRE
☑ WireFluid network configured
☑ All npm dependencies installed

PHASE 2 (Contracts):
☑ 3 contracts deployed to testnet
☑ All addresses saved
☑ Verified on block explorer

PHASE 3 (Config):
☑ Frontend .env.local created
☑ Oracle .env created
☑ All contract addresses in place

PHASE 4 (Frontend):
☑ Homepage loads
☑ Wallet connects
☑ No blank screens or errors

PHASE 5 (Oracle):
☑ Server running on localhost:3001
☑ WebSocket connected
☑ Cricket data available

PHASE 6 (End-to-End):
☑ Can place 0.1 WIRE stake
☑ Stake visible on leaderboard (<30s)
☑ Transaction confirmed on block explorer
```

**If all checkboxes are ✓:**
### You're Demo Ready! 🚀

---

## If Something Breaks

| Error | What to Do |
|-------|-----------|
| Contract deploy fails | Check .env has DEPLOYER_PRIVATE_KEY. Check account has 2+ WIRE. |
| Frontend won't build | Run `npm run type-check` to see errors. Compare to correct files in documentation. |
| Wallet won't connect | MetaMask → Settings → WireFluid network → Edit RPC URL to https://evm.wirefluid.com |
| Stake transaction fails | Check block explorer for revert reason. Most likely: Pool closed or invalid pillar. |
| Leaderboard doesn't update | Refresh page. Check oracle server logs for errors. Restart oracle: `npm start` |
| Everything broken | Start Phase 1 over, but skip Steps 1-3 (keep MetaMask wallet). Go straight to npm install. |

---

## Pro Tips for Demos

1. **Pre-stake before showing judges:** Place a test stake first so it's confirmed when demo starts
2. **Keep terminals visible:** Show oracle logs updating in real-time (impressive!)
3. **Multiple browsers:** Open one with ETH prices, one with leaderboard, one with admin panel
4. **Have faucet ready:** If you need more WIRE during demo, have https://faucet.wirefluid.com open
5. **Know the docs:** Keep ERROR_HANDLING_MATRIX.md open for diagnosing issues on the fly

