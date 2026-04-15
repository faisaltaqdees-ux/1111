# Exact Commands: Copy-Paste Reference

**One place to find every command you need to run. All commands are testnet-ready. Copy-paste each one exactly as shown.**

---

## Phase 1: Setup & Installation

### 1.1 Install Node.js globally

**This is a one-time setup on your computer.**

Download from https://nodejs.org (LTS version), run installer, restart computer.

Then verify:
```bash
node --version
npm --version
```

### 1.2 Clone or copy project files

```bash
# Option A: Clone from GitHub
git clone <REPO_URL> psl-pulse
cd psl-pulse

# Option B: Manual copy
mkdir psl-pulse
cd psl-pulse
# Copy contracts/, frontend/, oracle/ folders here
```

### 1.3 Install all npm dependencies

```bash
# In contracts folder
cd contracts
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv

# In frontend folder
cd ../frontend
npm install next react react-dom wagmi viem @web3modal/wagmi@4 @wagmi/connectors @tanstack/react-query@5 tailwindcss postcss autoprefixer framer-motion axios zustand

# In oracle folder
cd ../oracle
npm install express dotenv axios cors ws ethers

# Go back to root
cd ..
```

---

## Phase 2: Configuration Files

### 2.1 Create contracts/.env

```bash
# Windows
echo DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE > contracts\.env

# Mac/Linux
echo "DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE" > contracts/.env

# Then edit the file and replace 0xYOUR_PRIVATE_KEY_HERE with your actual private key
```

### 2.2 Create frontend/.env.local

```bash
# Windows
cat > frontend\.env.local << 'EOF'
NEXT_PUBLIC_MARKET_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_TICKET_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_BADGE_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_WIREFLUID_RPC=https://evm.wirefluid.com
NEXT_PUBLIC_WIREFLUID_CHAIN_ID=92533
NEXT_PUBLIC_WIREFLUID_EXPLORER=https://wirefluidscan.com
NEXT_PUBLIC_ORACLE_URL=http://localhost:3001
NEXT_PUBLIC_ORACLE_WS=ws://localhost:3001
NEXT_PUBLIC_WC_PROJECT_ID=test_project_id
EOF

# Mac/Linux
cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_MARKET_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_TICKET_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_BADGE_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_WIREFLUID_RPC=https://evm.wirefluid.com
NEXT_PUBLIC_WIREFLUID_CHAIN_ID=92533
NEXT_PUBLIC_WIREFLUID_EXPLORER=https://wirefluidscan.com
NEXT_PUBLIC_ORACLE_URL=http://localhost:3001
NEXT_PUBLIC_ORACLE_WS=ws://localhost:3001
NEXT_PUBLIC_WC_PROJECT_ID=test_project_id
EOF

# Edit both files and replace 0x000...000 addresses with real ones after deploying
```

### 2.3 Create oracle/.env

```bash
# Windows
cat > oracle\.env << 'EOF'
PSL_MARKET_ADDRESS=0x0000000000000000000000000000000000000000
WIREFLUID_RPC=https://evm.wirefluid.com
WIREFLUID_CHAIN_ID=92533
CRICBUZZ_API_KEY=your_api_key_here
ORACLE_PORT=3001
ORACLE_HOST=localhost
ORACLE_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
EOF

# Mac/Linux
cat > oracle/.env << 'EOF'
PSL_MARKET_ADDRESS=0x0000000000000000000000000000000000000000
WIREFLUID_RPC=https://evm.wirefluid.com
WIREFLUID_CHAIN_ID=92533
CRICBUZZ_API_KEY=your_api_key_here
ORACLE_PORT=3001
ORACLE_HOST=localhost
ORACLE_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
EOF

# Edit both files and fill in actual values
```

---

## Phase 3: Smart Contracts

### 3.1 Compile contracts

```bash
cd contracts
npx hardhat compile
cd ..
```

### 3.2 Deploy to WireFluid testnet

```bash
cd contracts
npx hardhat run scripts/deploy.js --network wirefluid
cd ..

# Output will show:
# PSLImpactMarket deployed to: 0x...
# PSLTicket deployed to: 0x...
# ImpactBadge deployed to: 0x...
# Save these addresses!
```

### 3.3 Verify contracts on block explorer

**Use browser:**
1. Go to https://wirefluidscan.com
2. Paste each contract address from Step 3.2
3. Should show "Contract" label and your Solidity code

---

## Phase 4: Update Environment with Contract Addresses

### 4.1 Update frontend/.env.local with real addresses

**Edit the file `frontend/.env.local` and replace:**

```bash
NEXT_PUBLIC_MARKET_ADDRESS=0x[PASTE_MARKET_ADDRESS_FROM_3.2]
NEXT_PUBLIC_TICKET_ADDRESS=0x[PASTE_TICKET_ADDRESS_FROM_3.2]
NEXT_PUBLIC_BADGE_ADDRESS=0x[PASTE_BADGE_ADDRESS_FROM_3.2]

# Keep rest unchanged
NEXT_PUBLIC_WIREFLUID_RPC=https://evm.wirefluid.com
NEXT_PUBLIC_WIREFLUID_CHAIN_ID=92533
NEXT_PUBLIC_WIREFLUID_EXPLORER=https://wirefluidscan.com
NEXT_PUBLIC_ORACLE_URL=http://localhost:3001
NEXT_PUBLIC_ORACLE_WS=ws://localhost:3001
NEXT_PUBLIC_WC_PROJECT_ID=test_project_id
```

### 4.2 Update oracle/.env with real addresses

**Edit the file `oracle/.env` and replace:**

```bash
PSL_MARKET_ADDRESS=0x[PASTE_MARKET_ADDRESS_FROM_3.2]

# Keep rest unchanged
WIREFLUID_RPC=https://evm.wirefluid.com
WIREFLUID_CHAIN_ID=92533
CRICBUZZ_API_KEY=your_api_key_here
ORACLE_PORT=3001
ORACLE_HOST=localhost
ORACLE_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

---

## Phase 5: Frontend

### 5.1 Build frontend

```bash
cd frontend
npm run build
cd ..

# Should show:
# ✓ Compiled successfully
```

### 5.2 Start frontend dev server

```bash
cd frontend
npm run dev

# Keep this running in this terminal
# Output: http://localhost:3000
```

**Open new terminal for next steps, keep this one running.**

---

## Phase 6: Oracle Backend

### 6.1 Start oracle server (in new terminal)

```bash
cd oracle
npm start

# Keep this running in this terminal
# Output: ✓ Oracle server listening on http://localhost:3001
```

**Open new terminal for testing, keep this one running.**

---

## Phase 7: Testing

### 7.1 Check frontend loads

**Use browser:**
1. Open http://localhost:3000
2. Should see PSL Pulse homepage
3. No blank screen or errors

### 7.2 Check wallet connection works

**In browser:**
1. Click "Connect Wallet"
2. MetaMask popup appears
3. Click "Connect"
4. Should show your wallet address in top right

### 7.3 Check you can place a stake

**In browser:**
1. Click on a match card
2. Enter "0.1" as stake amount
3. Click "Stake"
4. MetaMask popup appears
5. Click "Confirm"
6. Wait 5-10 seconds
7. Should see "✓ Stake confirmed!" toast

### 7.4 Check leaderboard updates

**In browser:**
1. After stake confirms, go to Leaderboard page
2. Should show your address in top 10 with 0.1 WF stake
3. Should update within 30 seconds

### 7.5 Verify on block explorer

**Use browser:**
1. Go to https://wirefluidscan.com
2. Paste your wallet address (top right of PSL Pulse)
3. Should see your stake transaction in list
4. Status should show "Success" (green checkmark)

---

## Utility Commands

### Check if ports are in use

```bash
# Mac/Linux
lsof -i :3000    # Frontend
lsof -i :3001    # Oracle

# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

### Kill process using port (if needed)

```bash
# Mac/Linux
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

### Get MetaMask private key

```
1. Open MetaMask
2. Click 3-dot menu → "Account Details"
3. Click "Export Private Key"
4. Enter password
5. Copy the 0x... string
6. Use in contracts/.env and oracle/.env
```

### Get MetaMask wallet address

```
1. Open MetaMask
2. Click on address at top of popup
3. Address copied to clipboard
4. Paste when needed (e.g., faucet, testing)
```

### Get testnet WIRE tokens

```
1. Go to https://faucet.wirefluid.com
2. Paste your wallet address (from above)
3. Click "Request Tokens"
4. Wait for confirmation
5. Check balance in MetaMask (should add 10-100 WF)
```

### View real-time logs

```bash
# Frontend logs (in frontend terminal)
# Already showing - watch for errors

# Oracle logs (in oracle terminal)
# Already showing - watch for "Processing event" messages

# Contract deployments
cd contracts
npx hardhat run scripts/deploy.js --network wirefluid

# Smart contract calls (check block explorer)
https://wirefluidscan.com
```

### Clean up and restart

```bash
# Clear node_modules and reinstall (if dependencies broken)
cd contracts && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
cd ../oracle && rm -rf node_modules && npm install

# Clear Next.js cache
cd frontend && rm -rf .next
```

---

## Troubleshooting Commands

### Check Node.js is installed

```bash
node --version
npm --version
```

**If error:** Install Node.js from https://nodejs.org

### Check Solidity compiler

```bash
cd contracts
npx hardhat --version
```

**If error:** Run `npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox`

### Check RPC is responding

```bash
# Mac/Linux
curl -X POST https://evm.wirefluid.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Windows (PowerShell)
Invoke-RestMethod -Uri "https://evm.wirefluid.com" -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Should return a number (block height), not an error
```

### Check your contract balance

```bash
# Use block explorer:
# 1. Go to https://wirefluidscan.com
# 2. Search for your contract address
# 3. Should show "Contract" label and your code
```

### Check your wallet balance

```bash
# Use MetaMask:
# 1. Open MetaMask
# 2. Make sure on "WireFluid Testnet" network
# 3. Balance shown at top right
# 4. Should be 10+ WF (from faucet)

# Or use block explorer:
# 1. Go to https://wirefluidscan.com
# 2. Search for your wallet address (0x...)
# 3. Balance shown on page
```

### Check oracle server is responding

```bash
# Test health endpoint
curl http://localhost:3001/api/live/health

# Should return:
# {"status":"healthy","cacheAge":2,"errors":0}
```

---

## Step-by-Step Quick Reference

**First time setup:**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
cd ../frontend && npm install next react react-dom wagmi viem @web3modal/wagmi@4 @wagmi/connectors @tanstack/react-query@5 tailwindcss postcss autoprefixer framer-motion axios zustand
cd ../oracle && npm install express dotenv axios cors ws ethers
cd ..
```

**Before every demo:**
```bash
# Terminal 1
cd contracts && npx hardhat run scripts/deploy.js --network wirefluid

# Terminal 2
cd frontend && npm run dev

# Terminal 3
cd oracle && npm start

# Browser
http://localhost:3000
```

**If something breaks:**
```bash
# Kill all Node processes
pkill node

# Clear cache
cd frontend && rm -rf .next && npm run build

# Restart
npm run dev (in frontend)
npm start (in oracle)
```

---

## Success Indicators

✓ All commands complete without errors  
✓ Frontend loads on http://localhost:3000  
✓ Wallet connects successfully  
✓ Can place 0.1 WIRE stake  
✓ Transaction visible on https://wirefluidscan.com  
✓ Leaderboard updates within 30 seconds  

**All green?** Ready to demo! 🚀

