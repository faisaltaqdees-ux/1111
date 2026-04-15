# Build From Scratch: Zero to PSL Pulse

**Complete walkthrough for building PSL Pulse when you have NOTHING. Starts from blank folders. No assumptions about prior knowledge.**

---

## What You Need Before Starting

1. **A computer** (Windows, Mac, or Linux)
2. **Internet connection**
3. **15-30 minutes of free time**
4. **Willingness to copy-paste commands**

That's it. Everything else you'll download/install.

---

## Step 0: Create Project Folder

Open a terminal/command prompt and run:

```bash
# Create main folder
mkdir psl-pulse
cd psl-pulse

# Create subfolders
mkdir contracts
mkdir frontend
mkdir oracle
mkdir docs

# You now have:
# psl-pulse/
# ├── contracts/
# ├── frontend/
# ├── oracle/
# └── docs/
```

---

## Step 1: Download Source Files

You should have received these files. Copy them into the folders you just created:

### Get Smart Contracts

**Files needed:**
- `PSLImpactMarket.sol` → `contracts/`
- `PSLTicket.sol` → `contracts/`
- `ImpactBadge.sol` → `contracts/`
- `hardhat.config.js` → `contracts/`
- `deploy.js` → `contracts/scripts/`

If you don't have them, copy from SYSTEM_CONTEXT_COMPLETE.md

### Get Frontend Code

**Files needed:**
- `src/` folder → `frontend/src/`
- `pages/` folder → `frontend/src/pages/`
- `components/` folder → `frontend/src/components/`
- `hooks/` folder → `frontend/src/hooks/`
- `lib/` folder → `frontend/src/lib/`
- `styles/` folder → `frontend/src/styles/`
- `package.json` → `frontend/`
- `next.config.js` → `frontend/`
- `tailwind.config.js` → `frontend/`
- `postcss.config.js` → `frontend/`
- `jsconfig.json` → `frontend/`

### Get Oracle Code

**Files needed:**
- `server.js` → `oracle/`
- `package.json` → `oracle/`
- `lib/` folder → `oracle/lib/`
- `routes/` folder → `oracle/routes/`
- `scripts/` folder → `oracle/scripts/`

### Get Documentation

**Files needed:**
- All `.md` files → `docs/` folder

**Your folder structure should now look like:**

```
psl-pulse/
├── contracts/
│   ├── PSLImpactMarket.sol
│   ├── PSLTicket.sol
│   ├── ImpactBadge.sol
│   ├── hardhat.config.js
│   ├── scripts/
│   │   └── deploy.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── jsconfig.json
├── oracle/
│   ├── server.js
│   ├── package.json
│   ├── lib/
│   ├── routes/
│   └── scripts/
└── docs/
    ├── SYSTEM_CONTEXT_COMPLETE.md
    ├── WIREFLUID_SETUP_GUIDE.md
    └── [all other .md files]
```

---

## Step 2: Install Node.js & npm

### Windows

1. Go to https://nodejs.org
2. Download **LTS version** (currently 20.x)
3. Run installer (.msi file)
4. Click "Next" for all options
5. Check "Add to PATH" (should be checked by default)
6. Click "Install"
7. **Restart your computer** ← Important

### macOS

```bash
# Using Homebrew (easiest)
brew install node

# If you don't have Homebrew:
# Go to https://brew.sh and follow instructions first
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install nodejs npm
```

### Verify Installation

Open new terminal/command prompt and run:

```bash
node --version
npm --version

# Should show versions like:
# v20.10.0
# 9.2.0
```

---

## Step 3: Initialize Project Folders

```bash
# Go to contracts folder
cd psl-pulse/contracts

# Create package.json (press Enter for all prompts)
npm init -y

# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv

# Create Hardhat config (select "Create a JavaScript project")
npx hardhat

# Go to frontend
cd ../frontend

# Create package.json
npm init -y

# Install Next.js and dependencies
npm install next react react-dom wagmi viem @web3modal/wagmi@4 @wagmi/connectors @tanstack/react-query@5 tailwindcss postcss autoprefixer framer-motion axios zustand

npm install --save-dev eslint-config-next

# Go to oracle
cd ../oracle

# Create package.json
npm init -y

# Install dependencies
npm install express dotenv axios cors ws ethers

# Go back to root
cd ..
```

---

## Step 4: Create Environment Files

### Create `contracts/.env`

```bash
# Get private key from MetaMask:
# 1. Open MetaMask
# 2. Click 3-dot menu → "Account Details"
# 3. Click "Export Private Key"
# 4. Enter password
# 5. Copy the 0x... string
# 6. Paste it in the value below

DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

### Create `.gitignore` in psl-pulse/

```bash
.env
.env.local
.env.*.local
node_modules/
.next/
dist/
build/
*.log
.DS_Store
.vscode/
```

---

## Step 5: Configure Hardhat

### Update `contracts/hardhat.config.js`

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
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
};
```

---

## Step 6: Create deploy.js Script

### File: `contracts/scripts/deploy.js`

Copy from SYSTEM_CONTEXT_COMPLETE.md or use this template:

```javascript
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  // Deploy PSLTicket (NFT for tickets)
  const PSLTicket = await hre.ethers.getContractFactory("PSLTicket");
  const ticket = await PSLTicket.deploy();
  await ticket.deployed();
  console.log(`PSLTicket deployed to: ${ticket.address}`);

  // Deploy ImpactBadge (NFT for badges)
  const ImpactBadge = await hre.ethers.getContractFactory("ImpactBadge");
  const badge = await ImpactBadge.deploy();
  await badge.deployed();
  console.log(`ImpactBadge deployed to: ${badge.address}`);

  // Deploy PSLImpactMarket (main contract)
  const PSLImpactMarket = await hre.ethers.getContractFactory("PSLImpactMarket");
  const market = await PSLImpactMarket.deploy(ticket.address, badge.address);
  await market.deployed();
  console.log(`PSLImpactMarket deployed to: ${market.address}`);

  // Save addresses
  console.log("\n=== Deployment Complete ===");
  console.log(`MARKET_ADDRESS=${market.address}`);
  console.log(`TICKET_ADDRESS=${ticket.address}`);
  console.log(`BADGE_ADDRESS=${badge.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

---

## Step 7: Create Frontend .env.local

### File: `frontend/.env.local`

```bash
# You'll fill these in after deploying contracts
NEXT_PUBLIC_MARKET_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_TICKET_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_BADGE_ADDRESS=0x0000000000000000000000000000000000000000

NEXT_PUBLIC_WIREFLUID_RPC=https://evm.wirefluid.com
NEXT_PUBLIC_WIREFLUID_CHAIN_ID=92533
NEXT_PUBLIC_WIREFLUID_EXPLORER=https://wirefluidscan.com

NEXT_PUBLIC_ORACLE_URL=http://localhost:3001
NEXT_PUBLIC_ORACLE_WS=ws://localhost:3001

NEXT_PUBLIC_WC_PROJECT_ID=test_project_id_123
```

---

## Step 8: Create Oracle .env

### File: `oracle/.env`

```bash
# Contract addresses (you'll fill these after deployment)
PSL_MARKET_ADDRESS=0x0000000000000000000000000000000000000000

# WireFluid Network
WIREFLUID_RPC=https://evm.wirefluid.com
WIREFLUID_CHAIN_ID=92533

# Cricbuzz API (sign up at https://rapidapi.com/cricapi-t/api/cricketapi)
CRICBUZZ_API_KEY=your_api_key_here

# Oracle Settings
ORACLE_PORT=3001
ORACLE_HOST=localhost

# Your private key (same as deployer)
ORACLE_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

---

## Step 9: Setup MetaMask

### Install MetaMask

1. Go to https://metamask.io
2. Click "Download"
3. Choose your browser
4. Click "Install"
5. Click "Add to [Browser]"
6. Pin extension to toolbar

### Create or Import Wallet

**If new user:**
1. Click MetaMask icon
2. Click "Create a Wallet"
3. Accept terms
4. Create password
5. Backup seed phrase (SAVE THIS!)
6. Verify seed phrase
7. Done

**If existing wallet:**
1. Click MetaMask icon
2. Click "Import wallet"
3. Enter 12-word seed phrase
4. Set password
5. Done

### Add WireFluid Network

1. Click MetaMask → Network dropdown (top left)
2. Click "Add network"
3. Fill in form:

| Field | Value |
|-------|-------|
| Network Name | WireFluid Testnet |
| RPC URL | https://evm.wirefluid.com |
| Chain ID | 92533 |
| Currency Symbol | WF |
| Explorer | https://wirefluidscan.com |

4. Click "Save"
5. You should now see "WireFluid Testnet" in dropdown

### Get Free Testnet Tokens

1. Go to https://faucet.wirefluid.com
2. Copy your wallet address from MetaMask
3. Paste into faucet
4. Click "Request Tokens"
5. Wait confirmation
6. Check MetaMask balance (should show 10+ WF)

---

## Step 10: Deploy Smart Contracts

```bash
cd psl-pulse/contracts

# Compile contracts
npx hardhat compile

# Expected output:
# Compiling 3 Solidity files...
# ✓ Compiled 3 contracts

# Deploy to WireFluid testnet
npx hardhat run scripts/deploy.js --network wirefluid

# Expected output:
# Deploying with account: 0x...
# PSLTicket deployed to: 0x...
# ImpactBadge deployed to: 0x...
# PSLImpactMarket deployed to: 0x...
#
# === Deployment Complete ===
# MARKET_ADDRESS=0x...
# TICKET_ADDRESS=0x...
# BADGE_ADDRESS=0x...
```

**IMPORTANT:** Copy the 3 contract addresses. You'll need them next.

---

## Step 11: Update Environment Variables

### Update `frontend/.env.local`

Replace the 0x0000... addresses with your actual contract addresses:

```bash
NEXT_PUBLIC_MARKET_ADDRESS=0xPASTEMARKETADDRESSHERE
NEXT_PUBLIC_TICKET_ADDRESS=0xPASTETICKETADDRESSHERE
NEXT_PUBLIC_BADGE_ADDRESS=0xPASTEBADGEADDRESSHERE

# Rest stays the same
```

### Update `oracle/.env`

```bash
PSL_MARKET_ADDRESS=0xPASTEMARKETADDRESSHERE

# Get API key from https://rapidapi.com/cricapi-t/api/cricketapi
CRICBUZZ_API_KEY=your_actual_api_key_here

# Rest stays the same
```

---

## Step 12: Start Frontend

Open a new terminal/command prompt:

```bash
cd psl-pulse/frontend

npm run dev

# Expected output:
# ▲ Next.js 14.0.0
# - Local: http://localhost:3000
# Ready in 2.3s
```

**Keep this running.** Open your browser to http://localhost:3000

You should see:
- ✓ PSL Pulse homepage loads
- ✓ Match cards visible
- ✓ "Connect Wallet" button in top right

---

## Step 13: Start Oracle Backend

Open a NEW terminal (keep frontend running):

```bash
cd psl-pulse/oracle

npm start

# Expected output:
# ✓ Oracle server listening on http://localhost:3001
# ✓ WebSocket server connected
# ✓ Cricbuzz API healthy
```

**Keep this running.**

---

## Step 14: Test Everything

1. Go to http://localhost:3000
2. Click "Connect Wallet"
3. MetaMask popup appears
4. Click "Connect"
5. Your wallet address should appear in top right
6. Click on a match card
7. Enter "0.1" as stake amount
8. Click "Stake"
9. MetaMask popup appears
10. Click "Confirm"
11. Wait 5-10 seconds
12. Should see "✓ Stake confirmed!" toast

**If you see that:**
### Success! 🎉 You've built PSL Pulse from scratch!

---

## If Something Goes Wrong

### "Cannot find node"
**Solution:** Node.js not installed. Go to Step 2 and install it.

### "npm: command not found"
**Solution:** Path issue. Restart computer after installing Node.js.

### "Contracts won't compile"
**Solution:** Check Solidity version in .sol files (should be ^0.8.20). Compare to SYSTEM_CONTEXT_COMPLETE.md

### "Deployment fails with 'insufficient funds'"
**Solution:** Get more WIRE from faucet (https://faucet.wirefluid.com). Wait 1 minute. Try again.

### "Frontend shows blank page"
**Solution:** Check:
1. Terminal shows no errors
2. .env.local has contract addresses filled in
3. Try: Refresh browser (Ctrl+R or Cmd+R)

### "Can't connect wallet"
**Solution:**
1. MetaMask should be on "WireFluid Testnet" network
2. Try: MetaMask → Settings → Networks → Edit WireFluid → RPC = https://evm.wirefluid.com
3. Try: Close and reopen MetaMask

### "Stake transaction reverts"
**Solution:**
1. Check block explorer: https://wirefluidscan.com
2. Paste transaction hash
3. Click "Logs" tab
4. Look for error message
5. Most common: Pool closed or invalid pillar

---

## Common Command Reference

```bash
# Navigate to folder
cd psl-pulse

# Install dependencies
npm install (in contracts/ frontend/ oracle/)

# Compile contracts
npx hardhat compile

# Deploy contracts
npx hardhat run scripts/deploy.js --network wirefluid

# Start frontend
npm run dev

# Start oracle
npm start

# Check if port in use
# Windows: netstat -ano | findstr :3000 (or :3001)
# Mac/Linux: lsof -i :3000 (or :3001)

# Kill process using port
# Windows: taskkill /PID <PID> /F
# Mac/Linux: kill -9 <PID>
```

---

## You're Done! 🚀

From zero files to fully functional demo - complete!

Next steps:
- Read additional docs in `docs/` folder for deep-dive knowledge
- Join the team working on improvements
- Deploy to mainnet (when ready)

Questions? Check docs/ folder for answers.

