# WireFluid Setup Guide for PSL Pulse Deployment

**Complete setup instructions for deploying PSL Pulse to WireFluid blockchain** — From zero to testnet ready

---

## Quick Facts About WireFluid

| Property | Value | Why It Matters |
|----------|-------|---|
| **Chain ID** | 92533 | Used in Hardhat config + MetaMask |
| **RPC Endpoint** | https://evm.wirefluid.com | Where transactions go |
| **Block Time** | ~5 seconds | Fast confirmations (good for demo) |
| **Finality** | Instant (single-block) | No re-orgs, data safe immediately |
| **Gas Price** | ~0.0003 WF per gas | 100-1000x cheaper than Ethereum |
| **TPS Capacity** | ~1,000 tx/sec | No congestion during demo |
| **Testnet Faucet** | https://faucet.wirefluid.com | Free WIRE for testing |
| **Block Explorer** | https://wirefluidscan.com | Verify deployments + debug |

---

## Part 1: Local Environment Setup (30 minutes)

### Step 1.1: Install Node.js & npm

**Windows:**
```bash
# Download from https://nodejs.org (LTS version)
# Run installer, accept defaults
# Verify installation
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

**macOS:**
```bash
brew install node
node --version
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install nodejs npm
node --version
```

### Step 1.2: Install Git

```bash
# Windows: https://git-scm.com/download/win
# macOS: brew install git
# Linux: sudo apt install git

# Verify
git --version
```

### Step 1.3: Install Hardhat (Smart Contract Framework)

```bash
npm install --save-dev hardhat

# Initialize Hardhat project in contracts/ folder
cd contracts
npx hardhat

# Choose "Create a TypeScript project" (or JavaScript if preferred)
# Accept all defaults
```

### Step 1.4: Install Frontend Dependencies

```bash
cd frontend
npm install

# Verify no errors
npm run build  # Should complete without errors
```

### Step 1.5: Install Oracle Backend Dependencies

```bash
cd oracle
npm install

# Verify
node --version
npm list wagmi viem  # Should show versions
```

---

## Part 2: MetaMask Wallet Setup (10 minutes)

### Step 2.1: Install MetaMask Extension

1. Go to https://metamask.io
2. Click "Install MetaMask"
3. Choose your browser (Chrome, Firefox, Safari, Edge)
4. Click "Add to [Browser]"
5. Pin extension to toolbar

### Step 2.2: Create or Import Wallet

**Option A: Create New Wallet**
1. Click MetaMask icon → "Get Started"
2. Click "Create a Wallet"
3. Accept terms
4. Set password (save this!)
5. Backup seed phrase (SAVE THIS IN PASSWORD MANAGER!)
6. Confirm seed phrase entered correctly
7. Done ✓

**Option B: Import Existing Wallet**
1. Click MetaMask icon → "Get Started"
2. Click "Import wallet"
3. Enter 12-word seed phrase
4. Set new password
5. Done ✓

### Step 2.3: Add WireFluid Network to MetaMask

**Method A: Automatic (Easiest)**

When you deploy contracts with Hardhat, a prompt will appear to add WireFluid. Click "Approve".

**Method B: Manual**

1. Click MetaMask icon
2. Click network dropdown (top left, currently shows "Ethereum Mainnet")
3. Click "Add network"
4. Fill in form:
   - **Network Name:** WireFluid Testnet
   - **RPC URL:** https://evm.wirefluid.com
   - **Chain ID:** 92533
   - **Currency Symbol:** WF
   - **Block Explorer:** https://wirefluidscan.com
5. Click "Save"
6. You should now see "WireFluid Testnet" in network dropdown

**Verify Connection:**
1. Click MetaMask → Network dropdown
2. Select "WireFluid Testnet"
3. Should show "Connected" (no errors)

---

## Part 3: Get Testnet Tokens (5 minutes)

### Step 3.1: Get Your Wallet Address

1. Open MetaMask
2. Make sure you're on "WireFluid Testnet" network
3. Click your address (0x123...ABC)
4. Copy it to clipboard

### Step 3.2: Request Tokens from Faucet

1. Go to https://faucet.wirefluid.com
2. Paste your wallet address
3. Click "Request Tokens"
4. Wait 30 seconds
5. Should see "✓ Tokens sent successfully"
6. You now have 10-100 free WIRE for testing

**Verify in MetaMask:**
1. Open MetaMask
2. Make sure network is "WireFluid Testnet"
3. Should show balance (e.g., "50 WF")
4. If not, wait 1 minute and refresh

---

## Part 4: Hardhat Configuration (15 minutes)

### Step 4.1: Update hardhat.config.js

**File:** `contracts/hardhat.config.js`

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    wirefluid: {
      url: "https://evm.wirefluid.com",
      chainId: 92533,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000"],
      gasPrice: 300000000, // 0.3 GWei (adjust if needed)
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      wirefluid: "any-key", // WireFluid explorer doesn't require API key
    },
    customChains: [
      {
        network: "wirefluid",
        chainId: 92533,
        urls: {
          apiURL: "https://wirefluidscan.com/api",
          browserURL: "https://wirefluidscan.com",
        },
      },
    ],
  },
};
```

### Step 4.2: Create .env File

**File:** `contracts/.env`

```bash
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# To get your private key:
# 1. Open MetaMask
# 2. Click menu (3 dots) → Account Details
# 3. Click "Export Private Key"
# 4. Enter password
# 5. Copy the 0x... string
# 6. Paste it above

# WARNING: Never commit this file to git!
# Add to .gitignore immediately
```

### Step 4.3: Add .env to .gitignore

**File:** `contracts/.gitignore`

```
.env
.env.local
.env.*.local
node_modules/
dist/
*.log
```

---

## Part 5: Smart Contract Deployment (20 minutes)

### Step 5.1: Verify Contracts Compile

```bash
cd contracts
npx hardhat compile

# Should output:
# Compiling 3 Solidity files
# Successfully compiled 3 contracts
```

**If errors:**
- Check Solidity version in contracts (should be ^0.8.20)
- Check imports are correct
- Run again

### Step 5.2: Deploy to WireFluid Testnet

```bash
cd contracts
npx hardhat run scripts/deploy.js --network wirefluid

# Output should show:
# PSLImpactMarket deployed to: 0x...
# PSLTicket deployed to: 0x...
# ImpactBadge deployed to: 0x...
# ✓ Deployment successful
```

**Save the contract addresses!** You'll need them in Step 6.

**If error: "insufficient funds"**
- You need more testnet WIRE
- Go to faucet again: https://faucet.wirefluid.com
- Request more tokens
- Wait 1 minute
- Try deployment again

### Step 5.3: Verify on Block Explorer

1. Go to https://wirefluidscan.com
2. Paste one of your contract addresses in search
3. Should see:
   - ✓ Contract code
   - ✓ Transactions
   - ✓ "Contract" label (not "Address")
4. Click "Contract" tab
5. Should see Solidity code

**If you don't see code:**
- Wait 5 minutes (indexing)
- Refresh page
- Try again

---

## Part 6: Frontend Configuration (15 minutes)

### Step 6.1: Create .env.local for Frontend

**File:** `frontend/.env.local`

```bash
NEXT_PUBLIC_MARKET_ADDRESS=0x[FROM_STEP_5.2]
NEXT_PUBLIC_BADGE_ADDRESS=0x[FROM_STEP_5.2]
NEXT_PUBLIC_TICKET_ADDRESS=0x[FROM_STEP_5.2]

NEXT_PUBLIC_WIREFLUID_RPC=https://evm.wirefluid.com
NEXT_PUBLIC_WIREFLUID_CHAIN_ID=92533
NEXT_PUBLIC_WIREFLUID_EXPLORER=https://wirefluidscan.com

# Wallet Connect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id_here

NEXT_PUBLIC_ORACLE_URL=http://localhost:3001
NEXT_PUBLIC_ORACLE_WS=ws://localhost:3001
```

### Step 6.2: Build Frontend

```bash
cd frontend
npm run build

# Should complete without errors
# Output: "✓ Build successful"
```

**If build fails:**
- Check all imports in src/ are correct
- Check no TypeScript errors: `npm run type-check`
- Check ESLint: `npm run lint`
- Fix errors and try again

### Step 6.3: Start Frontend Dev Server

```bash
cd frontend
npm run dev

# Output:
# ▲ Next.js 14.0.0
# - Local: http://localhost:3000
# 
# Ready in 1.2s
```

**Verify it works:**
1. Open http://localhost:3000
2. Should see PSL Pulse landing page
3. No errors in console
4. Click "Connect Wallet" → MetaMask popup appears

---

## Part 7: Oracle Backend Setup (15 minutes)

### Step 7.1: Create .env for Oracle

**File:** `oracle/.env`

```bash
# Cricbuzz API (sign up at https://rapidapi.com/cricapi-t/api/cricketapi)
CRICBUZZ_API_KEY=your_api_key_here

# WireFluid Network
WIREFLUID_RPC=https://evm.wirefluid.com
WIREFLUID_CHAIN_ID=92533

# Contract Addresses (from Step 5.2)
PSL_MARKET_ADDRESS=0x[FROM_STEP_5.2]

# Oracle Server
ORACLE_PORT=3001
ORACLE_HOST=localhost

# Private Key (same as Deployer, for signing batch events)
ORACLE_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

### Step 7.2: Start Oracle Server

```bash
cd oracle
npm start

# Output:
# ✓ Oracle server listening on http://localhost:3001
# ✓ WebSocket connected
# ✓ Cricbuzz API healthy
```

**Verify it works:**
```bash
curl http://localhost:3001/api/live/health

# Should return:
# {"status":"healthy","cacheAge":2,"lastFetch":1234567890}
```

---

## Part 8: End-to-End Test (10 minutes)

### Step 8.1: Test Wallet Connection

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. MetaMask popup appears
4. Click "Connect"
5. Should show your address in top right

### Step 8.2: Test Staking

1. Click on a match card
2. Enter stake amount (e.g., "0.1")
3. Should see gas estimate appear
4. Click "Stake"
5. MetaMask popup appears
6. Click "Confirm"
7. Transaction submitted
8. Wait 5-10 seconds
9. Should see "✓ Stake successful" toast

### Step 8.3: Test Leaderboard Update

1. Stake completes
2. Check Infinity Wall leaderboard
3. Your address should appear in top 10
4. Should update in <100ms

### Step 8.4: Verify on Block Explorer

1. Go to https://wirefluidscan.com
2. Paste your wallet address
3. Should see your stake transaction in "Transactions" list
4. Click transaction
5. Should show:
   - ✓ Status: Success
   - ✓ From: Your address
   - ✓ To: PSLImpactMarket contract
   - ✓ Function: stake()

---

## Part 9: Troubleshooting

### Issue: "Cannot connect to WireFluid"

**Solution:**
```bash
# Check RPC is responding
curl https://evm.wirefluid.com -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Should return a block number (no error)
```

### Issue: "Insufficient funds for gas"

**Solution:**
1. Get more testnet tokens from faucet
2. Wait 1 minute
3. Verify balance shows in MetaMask
4. Retry transaction

### Issue: "Transaction reverted"

**Solution:**
1. Check block explorer for revert reason
2. Common reasons:
   - Pool closed
   - Insufficient balance
   - Invalid pillar ID
3. Reference ERROR_HANDLING_MATRIX.md for all possible errors

### Issue: "MetaMask can't connect"

**Solution:**
1. Check MetaMask is on WireFluid network
2. Try MetaMask → Settings → Networks → WireFluid
3. Verify RPC URL is correct
4. Click "Edit" → Update → Save
5. Refresh page

### Issue: "Frontend shows blank page"

**Solution:**
```bash
# Check for build errors
cd frontend
npm run build

# Check .env.local has all required variables
cat .env.local

# Check frontend dev server is running
npm run dev

# Check no console errors
# Open Developer Tools (F12) → Console tab
```

---

## Part 10: Network Switching (Migration Path)

### Before Moving to Mainnet

1. **Complete all testing on testnet** (this guide)
2. **Get mainnet contract addresses** (from deployment team)
3. **Update .env.local:**
   ```bash
   NEXT_PUBLIC_MARKET_ADDRESS=0x[MAINNET_ADDRESS]
   NEXT_PUBLIC_WIREFLUID_RPC=https://mainnet.wirefluid.com  # TBD
   ```
4. **Switch MetaMask to mainnet network**
5. **Deploy with real WF tokens** (expensive, so test thoroughly first!)

---

## Quick Reference: Copy-Paste Commands

```bash
# 1. Install dependencies
npm install

# 2. Compile contracts
cd contracts && npx hardhat compile

# 3. Deploy to testnet
npx hardhat run scripts/deploy.js --network wirefluid

# 4. Start frontend
cd frontend && npm run dev

# 5. Start oracle backend
cd oracle && npm start

# 6. Check health
curl http://localhost:3001/api/live/health

# 7. View logs
tail -f oracle/logs/oracle.log
```

---

## Success Checklist

- [ ] Node.js installed (`node --version`)
- [ ] Git installed (`git --version`)
- [ ] MetaMask installed and unlocked
- [ ] WireFluid network added to MetaMask
- [ ] 10+ free WIRE in MetaMask
- [ ] Contracts deployed (`npx hardhat run scripts/deploy.js --network wirefluid`)
- [ ] Contract addresses saved
- [ ] .env.local created with contract addresses
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Frontend dev server running (`npm run dev`)
- [ ] Oracle backend running (`npm start`)
- [ ] Wallet connects successfully (http://localhost:3000)
- [ ] Can place a stake (0.1 WIRE)
- [ ] Stake appears on leaderboard (<100ms)
- [ ] Transaction visible on block explorer

**All green?** → Ready to demo!

