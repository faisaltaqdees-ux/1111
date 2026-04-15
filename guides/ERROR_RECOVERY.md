# Error Recovery Guide: Every Error + Exact Fix

**Comprehensive reference for every error you'll encounter, why it happens, and the exact fix**

---

## Quick Error Lookup

**Find your error message below and jump to the fix.**

| Error Text | Section |
|:-----------|---------|
| "Cannot connect to RPC" | 2.1 |
| "insufficient balance" | 2.2 |
| "transaction reverted" | 2.3 |
| "MetaMask not responding" | 3.1 |
| "Chain ID mismatch" | 3.2 |
| "contract code not found" | 4.1 |
| "npm: command not found" | 5.1 |
| "port already in use" | 5.2 |
| "ENOENT: no such file or directory" | 5.3 |
| "Module not found" | 5.4 |
| "Next.js build fails" | 6.1 |
| "Frontend won't connect to wallet" | 6.2 |
| "Leaderboard won't update" | 7.1 |
| "Oracle won't start" | 7.2 |
| "Stake disappears after 30s" | 8.1 |
| "Gas estimate too high" | 8.2 |

---

## Part 1: Smart Contract Errors

### 1.1: "Compiled successfully" but deployment fails

**Symptoms:**
```
Error: UNKNOWN
Contract at 0x0 does not match the one deployed
```

**Cause:** Contract code doesn't match compiled bytecode, or deploying to wrong address

**Fixes (in order):**

```bash
# 1. Clear old artifacts
cd contracts
rm -rf artifacts/
rm -rf cache/

# 2. Recompile
npx hardhat compile

# 3. Try deployment again
npx hardhat run scripts/deploy.js --network wirefluid
```

**If still fails:**

```bash
# Check that you're using correct network
npx hardhat run scripts/deploy.js --network wirefluid

# NOT:
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/deploy.js  # (no --network flag)
```

### 1.2: "insufficient funds for gas + value"

**Symptoms:**
```
ProviderError: insufficient funds for gas + value
```

**Cause:** Your account doesn't have enough WIRE to pay for gas + transaction

**Fix (exact steps):**

```bash
# 1. Check your current balance
curl https://wirefluidscan.com/api/accounts/YOUR_ADDRESS

# 2. Get more WIRE from faucet:
# Go to: https://faucet.wirefluid.com
# Paste your address
# Click "Request Tokens"
# Wait 1 minute

# 3. Verify balance increased
# Open MetaMask (WireFluid Testnet network)
# Should show increased balance

# 4. Try deployment again
npx hardhat run scripts/deploy.js --network wirefluid
```

**Cost breakdown:**
```
PSLTicket deploy: ~50k gas × 0.3 GWei = 0.015 WF
ImpactBadge deploy: ~50k gas = 0.015 WF
PSLImpactMarket deploy: ~150k gas = 0.045 WF
Total: ~0.1 WF

So you need at least 0.2 WF (with buffer)
Faucet gives 10-100 WF, so request if depleted
```

---

## Part 2: Blockchain Errors

### 2.1: "Cannot connect to RPC"

**Symptoms:**
```
fetch failed
Network error: connect ECONNREFUSED
```

**Cause:** RPC endpoint is unreachable or blocked

**Checks (in order):**

```bash
# 1. Test RPC directly
curl -X POST https://evm.wirefluid.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Should return: {"jsonrpc":"2.0","result":"0x...","id":1}
# NOT: error, timeout, or blank response
```

**If curl fails:**

```bash
# 2. Check internet connection
ping 8.8.8.8

# 3. Check if DNS works
nslookup evm.wirefluid.com

# 4. Try different DNS
# Windows: Settings → Network → DNS → Use 8.8.8.8
# Mac: System Preferences → Network → DNS → Add 8.8.8.8
# Linux: nano /etc/resolved.conf → Add nameserver 8.8.8.8
```

**If RPC is down:**

```bash
# 1. Check status: https://status.wirefluid.com (if available)
# 2. Use backup RPC endpoints (if provided)
# 3. Wait 5 minutes and retry
```

### 2.2: "insufficient balance" (staking)

**Symptoms:**
```
Error: contract call reverted
Reason: Insufficient balance
```

**Cause:** Your wallet doesn't have enough WIRE to cover stake + gas

**Fix:**

```bash
# 1. Get balance
# Open MetaMask → WireFluid Testnet network
# Look at top right (your balance)

# 2. If balance < amount_to_stake + 0.1:
# Go to https://faucet.wirefluid.com
# Request more WIRE
# Wait 1 minute

# 3. Try staking again (start with 0.1 WF)
```

**Common mistake:** Trying to stake 1.0 WF when you only have 0.5 WF

### 2.3: "transaction reverted" (staking)

**Symptoms:**
```
Error: reverted with reason string: 'Pool closed'
Error: reverted with reason string: 'Invalid pillar'
```

**Cause:** Contract rejected transaction for a specific reason

**Fixes by reason:**

| Reason | Fix |
|--------|-----|
| "Pool closed" | Try a different match. Current match betting closed. |
| "Invalid pillar" | Make sure pillar is one of: Environment, Social, Technology, Governance |
| "Amount too low" | Stake at least 0.01 WF (not 0.00001) |
| "Player not found" | User doesn't exist in contract. Join platform first. |
| "Insufficient allowance" | Approve token first: `approveToken()` |

**To find exact revert reason:**

```bash
# 1. Go to block explorer: https://wirefluidscan.com
# 2. Paste your transaction hash
# 3. Click "Logs" tab
# 4. Look for "Error" in logs
# 5. That's your exact reason
```

**Example fix for "Pool closed":**
```javascript
// In PoolCard.jsx, check pool status before rendering
if (pool.status === 'closed') {
  return <p>This pool is closed. Try another match.</p>;
}
```

---

## Part 3: MetaMask Errors

### 3.1: "MetaMask not responding"

**Symptoms:**
```
User denied transaction
MetaMask popup doesn't appear
```

**Cause:** MetaMask is locked, closed, or on wrong network

**Fixes (in order):**

```bash
# 1. Make sure MetaMask is UNLOCKED
# Open MetaMask icon → Enter password if needed

# 2. Make sure you're on CORRECT NETWORK
# MetaMask network dropdown (top left) should show "WireFluid Testnet"
# If not, click dropdown → Select "WireFluid Testnet"

# 3. Try transaction again (click "Stake Now")

# 4. If still no popup:
# Open Developer Console (F12)
# Look for errors mentioning MetaMask
# Common: "No MetaMask detected" → Extension not installed
```

**If MetaMask still broken:**

```bash
# 1. Refresh browser: Ctrl+R (or Cmd+R on Mac)
# 2. Close and reopen MetaMask
# 3. Restart browser completely
# 4. Restart computer (nuclear option)
```

### 3.2: "Chain ID mismatch" or "Wrong network"

**Symptoms:**
```
MetaMask says: "You're on the wrong network"
Transaction shows wrong chain
```

**Cause:** MetaMask is on Ethereum Mainnet, but should be on WireFluid

**Fix:**

```bash
# 1. Click MetaMask icon
# 2. Click network dropdown (top left)
# 3. Look for "WireFluid Testnet"
# 4. If found, click it → You're switched ✓
# 5. If NOT found, add it:
#    a) Click "Add network"
#    b) Fill in:
#       - Name: WireFluid Testnet
#       - RPC: https://evm.wirefluid.com
#       - Chain ID: 92533
#       - Currency: WF
#       - Explorer: https://wirefluidscan.com
#    c) Click "Save"
#    d) You should now see it in dropdown
# 6. Refresh page
```

### 3.3: "Transaction rejected by user"

**Symptoms:**
```
Error: user rejected transaction
```

**Cause:** You clicked "Reject" in MetaMask popup

**Fix:**

```bash
# 1. It's not a bug - you rejected it intentionally
# 2. Click "Stake Now" again
# 3. MetaMask popup appears
# 4. This time, click "Confirm" (not "Reject")
```

---

## Part 4: Contract/Blockchain Verification

### 4.1: "contract not verified on block explorer"

**Symptoms:**
```
Block explorer shows: "No contract code found"
Can't see Solidity code on wirefluidscan.com
```

**Cause:** Contract deployed but not indexed by explorer yet

**Fix:**

```bash
# 1. Wait 5 minutes (explorer needs time to index)
# 2. Go to https://wirefluidscan.com
# 3. Paste contract address
# 4. Refresh page (Ctrl+R)
# 5. Should now show "Contract" label and code
```

**If still no code after 10 minutes:**

```bash
# 1. Verify contract actually deployed:
curl -X POST https://evm.wirefluid.com \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_getCode",
    "params":["0xYOUR_CONTRACT_ADDRESS","latest"],
    "id":1
  }'

# Should return: "result": "0x6080..." (contract bytecode)
# If "result": "0x", contract doesn't exist at that address
```

---

## Part 5: Environment & Installation Errors

### 5.1: "npm: command not found"

**Symptoms:**
```
command not found: npm
npm not found
node_modules not found
```

**Cause:** Node.js not installed or not in PATH

**Fix:**

```bash
# 1. Verify Node.js is installed
node --version

# If "command not found":
# Go to https://nodejs.org
# Download LTS version
# Run installer
# RESTART COMPUTER (critical!)

# 2. After restart, verify again
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x
```

### 5.2: "port already in use" or "EADDRINUSE"

**Symptoms:**
```
Error: listen EADDRINUSE :::3000
Error: listen EADDRINUSE :::3001
port 3000 is already in use
```

**Cause:** Another process already using that port

**Fixes (in order):**

**Option A: Find and kill the process**

```bash
# Mac/Linux: Find process on port 3000
lsof -i :3000

# Output shows PID (process ID), e.g., "12345"
# Kill it:
kill -9 12345

# Windows: Find process on port 3000
netstat -ano | findstr :3000

# Output shows PID at the end
# Kill it:
taskkill /PID 12345 /F
```

**Option B: Use different port**

```bash
# Start on different port:
PORT=3002 npm run dev  # Frontend on 3002 instead of 3000
PORT=3002 npm start    # Oracle on 3002 instead of 3001
```

**Option C: Nuclear - kill all Node processes**

```bash
# Mac/Linux
pkill -9 node

# Windows (Admin terminal)
taskkill /F /IM node.exe

# Then restart:
npm run dev
npm start
```

### 5.3: "ENOENT: no such file or directory"

**Symptoms:**
```
Error: ENOENT: no such file or directory, open '.env'
Cannot find module './src/components/PoolCard'
```

**Cause:** File doesn't exist or path is wrong

**Fix:**

```bash
# 1. Check file exists
# Windows:
dir frontend\.env.local

# Mac/Linux:
ls -la frontend/.env.local

# If not found, create it:
# Follow instructions in BUILD_FROM_SCRATCH.md

# 2. Check import paths are correct
# Example in Next.js:
import PoolCard from '../components/PoolCard'  # ✓ Correct
import PoolCard from './PoolCard'              # ✗ Wrong (wrong path)
import { PoolCard } from '../components'       # ✗ Wrong (default export)
```

### 5.4: "Module not found" or "Cannot find module"

**Symptoms:**
```
ERROR in ./src/pages/index.js
Module not found: Error: Can't resolve 'wagmi'
Cannot find module 'express'
```

**Cause:** npm package not installed

**Fix:**

```bash
# 1. Check package.json has the module
cat package.json | grep wagmi

# If found but still error:

# 2. Reinstall dependencies
rm -rf node_modules
npm install

# 3. Try again
npm run dev
```

---

## Part 6: Frontend/Next.js Errors

### 6.1: "Next.js build fails"

**Symptoms:**
```
error ERR! code ELIFECYCLE
Build failed with 1 errors
TypeScript error in ./src/components/PoolCard.jsx
```

**Cause:** TypeScript/ESLint errors in code

**Fix:**

```bash
cd frontend

# 1. See type errors
npm run type-check

# 2. See lint errors  
npm run lint

# 3. Fix errors shown (compare to POOLCARD_RECONSTRUCTION.md)

# 4. Try build again
npm run build
```

**Common fixes:**

```javascript
// ❌ Error: JSX in utility function
const handleStake = async () => {
  return <div>Success</div>  // ← Can't return JSX here
}

// ✅ Fix: Only return data
const handleStake = async () => {
  return { success: true, hash: '0x...' }
}

// Show JSX in render only:
return (
  <div>
    {txStatus === 'confirmed' && <p>Success</p>}
  </div>
)
```

### 6.2: "Frontend won't connect to wallet"

**Symptoms:**
```
Click "Connect Wallet" → Nothing happens
MetaMask popup doesn't appear
Console error: "MetaMask not found"
```

**Cause:** Wallet connector not initialized or MetaMask not installed

**Fix:**

```bash
# 1. Make sure MetaMask extension installed
# Go to https://metamask.io
# Install for your browser
# Pin to toolbar

# 2. Make sure frontend .env.local has config
cat frontend/.env.local | grep NEXT_PUBLIC_WC_PROJECT_ID
# Should show a value starting with "NEXT_PUBLIC_WC_PROJECT_ID="

# 3. Check browser console for errors
# F12 → Console tab → Look for red errors
# Common: "Web3Modal not initialized"

# 4. If errors, check frontend imports are correct
# In src/lib/wagmi.js:
# Should import correct modules
# Compare to SYSTEM_CONTEXT_COMPLETE.md

# 5. Restart frontend
npm run dev

# 6. Clear browser cache
# Ctrl+Shift+Delete → Clear all → Reload page
```

---

## Part 7: Real-Time Features

### 7.1: "Leaderboard won't update"

**Symptoms:**
```
Place a stake
Leaderboard doesn't change
Info is stale (hours old)
```

**Cause:** Event listeners not working or Oracle backend crashed

**Fix (step by step):**

```bash
# 1. Check Oracle backend is running
# Should see in oracle terminal:
# ✓ Oracle server listening on http://localhost:3001
# If NOT running, start it:
cd oracle && npm start

# 2. Check Oracle health endpoint
curl http://localhost:3001/api/live/health

# Should return: {"status":"healthy",...}
# If error, check Oracle terminal for errors

# 3. Check frontend connected to Oracle
# Developer Console (F12) → Network tab
# Look for "ws://localhost:3001" (WebSocket)
# Should show "101 Switching Protocols" (connected)

# 4. Check event listeners are active
# In browser: F12 → Console → Type:
console.log(watchContractEvent)  # Should not be undefined

# 5. If still broken:
# Restart both:
pkill node  # Kill all Node processes
# Then in separate terminals:
npm run dev      # Terminal 1: Frontend
npm start        # Terminal 2: Oracle
```

### 7.2: "Oracle won't start"

**Symptoms:**
```
npm start in oracle/ hangs
Terminal shows: "starting server..."
Then nothing for 30 seconds
```

**Cause:** Possible hang in Cricbuzz API or database connection

**Fix:**

```bash
# 1. Ctrl+C to stop current attempt
# 2. Check .env is configured
cat oracle/.env | grep CRICBUZZ_API_KEY
# Should show your actual API key (not "your_api_key_here")

# 3. Check node_modules are good
rm -rf oracle/node_modules
npm install

# 4. Start with debug logging
DEBUG=* npm start

# 5. Watch for which step hangs
# If hangs at "Cricbuzz API", issue is there
# If hangs at "Database", issue there
# Look at the error message

# 6. If Cricbuzz API issue:
# Go to https://rapidapi.com/cricapi-t/api/cricketapi
# Check your API key is valid
# Test it manually:

curl -X GET "https://cricketapi-live.p.rapidapi.com/cricket/latest" \
  -H "X-RapidAPI-Key: YOUR_API_KEY" \
  -H "X-RapidAPI-Host: cricketapi-live.p.rapidapi.com"

# Should return cricket data (not 401 error)

# 7. If still won't start:
# Start with simpler version:
node server.js  # Instead of npm start
# Look for error message
```

---

## Part 8: Data & State Errors

### 8.1: "Stake disappears after 30 seconds"

**Symptoms:**
```
Place stake → Toast shows success
30s later → Leaderboard resets
Stake no longer visible
```

**Cause:** Cache invalidation or data not persisted to contract

**Fix:**

```bash
# 1. Check transaction actually confirmed
# Go to https://wirefluidscan.com
# Paste your wallet address
# Look for your recent transaction
# Status should be "Success" (green checkmark)

# 2. If transaction failed:
# It never actually staked
# Try again, watch MetaMask popup carefully

# 3. If transaction succeeded but stake disappeared:
# Check contract state on block explorer:
# https://wirefluidscan.com → [contract address] → State

# 4. If state looks wrong:
# Restart Oracle backend:
pkill node
npm start  # In oracle folder

# 5. Check EventListener in InfinityWall.jsx
# Reference EVENT_LISTENER_EDGE_CASES.md
# Possible: Duplicate events or missed events
```

### 8.2: "Gas estimate way too high"

**Symptoms:**
```
Gas cost: 99.99 WF (when stake is 0.1 WF)
Total cost: 100.09 WF
```

**Cause:** Gas calculation wrong in PoolCard.jsx

**Fix:**

```javascript
// In PoolCard.jsx, calculateGasEstimate():

// ❌ Wrong: Using raw gas price
const gasCostWei = estimatedGas * gasPrice;
const gasCostWF = gasCostWei;  // ← Forgot to divide by 1e18!

// ✅ Correct: Convert wei to WF properly
const gasCostWei = estimatedGas * gasPrice;
const gasCostWF = gasCostWei / 1e18;  // ← Divide by 1e18

// Quick check:
// estGas: 85,000
// gasPrice: 300,000,000 wei
// Cost: 85,000 * 300,000,000 = 25.5e12 wei = 0.0255 WF ✓
```

---

## Part 9: Terminal & Process Management

### 9.1: "How do I stop a process?"

```bash
# While process is running in terminal:
Ctrl+C

# If that doesn't work:
# Open new terminal and kill by port:
# Mac/Linux
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :3000 | findstr LISTENING
# Note the PID, then:
taskkill /PID <PID> /F
```

### 9.2: "How do I run multiple processes?"

```bash
# Option 1: Multiple terminal windows
# Terminal 1:
cd frontend && npm run dev

# Terminal 2:
cd oracle && npm start

# Option 2: One terminal with background jobs
npm run dev &      # Frontend runs in background
npm start          # Oracle runs in foreground
# To switch: Press Ctrl+Z, type 'fg', Enter

# Option 3: Use process manager (advanced)
npm install -g pm2
pm2 start "npm run dev" --name frontend
pm2 start "npm start" --name oracle
pm2 list  # See both running
```

---

## Part 10: Common Misconfigurations

### Issue: Contract addresses are 0x000...000

**Cause:** .env not loaded or never deployed

**Fix:**
```bash
# 1. Deploy contracts first:
cd contracts
npx hardhat run scripts/deploy.js --network wirefluid

# 2. Copy addresses to .env files:
# frontend/.env.local:
NEXT_PUBLIC_MARKET_ADDRESS=0x[PASTE_HERE]

# oracle/.env:
PSL_MARKET_ADDRESS=0x[PASTE_HERE]

# 3. Restart frontend/oracle:
pkill node
npm run dev    # Terminal 1
npm start      # Terminal 2
```

### Issue: MetaMask shows "No accounts connected"

**Cause:** Browser hasn't loaded MetaMask login state

**Fix:**
```bash
# 1. MetaMask icon → Click it
# 2. Enter password if needed
# 3. Make sure account is visible
# 4. Refresh browser (Ctrl+R)
# 5. Try connecting again
```

---

## Error Priority Matrix

**If multiple errors, fix in this order:**

1. **BLOCKER ERRORS** (fix first):
   - Cannot compile contracts
   - Cannot start frontend
   - Cannot start Oracle
   - MetaMask won't install

2. **CRITICAL ERRORS** (fix next):
   - RPC not responding
   - Cannot deploy contracts
   - Navigation broken

3. **MAJOR ERRORS** (then fix):
   - Cannot connect wallet
   - Transactions failing
   - Leaderboard not updating

4. **MINOR ERRORS** (fix last):
   - UI looks ugly
   - Toasts wrong color
   - Gas estimate slightly off

---

## If All Else Fails

**Nuclear reset (starts completely over):**

```bash
# 1. Kill all Node processes
pkill -9 node  # Mac/Linux
taskkill /F /IM node.exe  # Windows

# 2. Clear all caches
cd frontend && rm -rf .next node_modules
cd ../oracle && rm -rf node_modules
cd ../contracts && rm -rf node_modules artifacts cache

# 3. Reinstall everything
cd contracts && npm install
cd ../frontend && npm install  
cd ../oracle && npm install

# 4. Redeploy contracts
cd contracts
npx hardhat run scripts/deploy.js --network wirefluid

# 5. Update .env files with new addresses

# 6. Restart
npm run dev      # Frontend
npm start        # Oracle
```

**Still broken?** Check ERROR_HANDLING_MATRIX.md for exhaustive error list.

