# Pre-Demo Checklist: Final Health Check

**Complete verification checklist to ensure everything works before demoing to judges. Takes ~15 minutes.**

---

## 30 Minutes Before Demo

### Phase 1: Environment Check (5 minutes)

```bash
# 1. Verify Node.js is running
node --version
npm --version

# Expected: node v18+ npm 9+

# 2. Check all npm packages installed
cd contracts && npm list wagmi react
cd ../frontend && npm list next react wagmi
cd ../oracle && npm list express axios

# Expected: All packages listed with versions (no "missing" errors)
```

### Phase 2: Contract Verification (3 minutes)

```bash
# 1. Make sure contracts were deployed
cat contracts/DEPLOYED_ADDRESSES.txt  (or similar)

# Should show:
# MARKET_ADDRESS=0x...
# TICKET_ADDRESS=0x...
# BADGE_ADDRESS=0x...

# 2. Verify each address on block explorer
# https://wirefluidscan.com
# Paste each address
# Should see: "Contract" label + Solidity code
```

### Phase 3: Environment Files Check (2 minutes)

```bash
# 1. Verify frontend .env.local has values (not 0x000...000)
cat frontend/.env.local | grep NEXT_PUBLIC_MARKET
# Should NOT show: 0x0000000000000000000000000000000000000000

# 2. Verify oracle .env has values
cat oracle/.env | grep PSL_MARKET
# Should NOT show: 0x0000000000000000000000000000000000000000
```

---

## 20 Minutes Before Demo

### Phase 4: Start Services (5 minutes)

**Terminal 1: Frontend**
```bash
cd frontend
npm run build   # Quick recompile (should be <30 seconds)
npm run dev
# Wait for: "✓ Ready in 2.3s"
```

**Terminal 2: Oracle Backend**
```bash
cd oracle
npm start
# Wait for:
# ✓ Oracle server listening on http://localhost:3001
# ✓ WebSocket connected
# ✓ Cricbuzz API healthy
```

**Terminal 3: Watch logs**
```bash
# Monitor for errors
tail -f oracle/server.log  (if available)
# Or just watch oracle terminal for errors
```

---

## 10 Minutes Before Demo

### Phase 5: Frontend Visual Check (3 minutes)

**In browser (http://localhost:3000):**

```
☐ Page loads without blank screen
☐ Can see match cards with data
☐ Can see "Connect Wallet" button (top right)
☐ No red errors in console (F12)
☐ No "failed to fetch" messages
```

### Phase 6: Wallet Connection Test (2 minutes)

**In browser:**

```
☐ Click "Connect Wallet"
☐ MetaMask popup appears
☐ Click "Connect"
☐ Your wallet address appears (top right)
☐ MetaMask shows "WireFluid Testnet" network
☐ MetaMask shows balance (10+ WF)
```

### Phase 7: Test Stake (5 minutes)

**In browser:**

```
☐ Click on a match card
☐ Enter stake: "0.1"
☐ Select pillar: "Environment"
☐ Click "Stake Now"
☐ MetaMask popup appears
☐ Click "Confirm"
☐ Wait 5-10 seconds
☐ Toast shows: "✓ Stake submitted!"
☐ After 5 more seconds: "✓ Stake confirmed!"
☐ No red error toasts
```

### Phase 8: Leaderboard Verification (2 minutes)

**In browser:**

```
☐ Go to Leaderboard page
☐ Can see list of recent stakers
☐ Your address appears in list (with 0.1 WF)
☐ Last updated time shows recently
☐ List updates without page refresh
```

### Phase 9: Block Explorer Verification (2 minutes)

**In https://wirefluidscan.com:**

```
☐ Paste your wallet address
☐ Your recent stake transaction appears
☐ Status shows "Success" (green)
☐ Method shows "stake()"
☐ Value matches (0.1+ WF)
☐ Block number is recent
```

---

## Go/No-Go Decision

### ✓ DEMO READY if all of these are TRUE:

```
✓ Frontend loads without errors
✓ Can connect wallet successfully
✓ Can place a 0.1 WF stake
✓ Stake confirms within 15 seconds
✓ Stake visible on leaderboard within 30 seconds
✓ Stake visible on block explorer
✓ No "Network busy" or error toasts stuck on screen
✓ Oracle terminal shows no errors
✓ 10+ free WIRE in wallet
```

### ✗ DO NOT DEMO if any of these are TRUE:

```
✗ Frontend shows blank page
✗ MetaMask won't connect
✗ Stake transactions are reverting
✗ Leaderboard doesn't update
✗ Oracle terminal shows errors (red text)
✗ Contract addresses are 0x000...000
✗ MetaMask is on wrong network
✗ Wallet has <1 WIRE balance
```

---

## Last-Minute Fixes (If issues found)

### Issue: Frontend shows blank page

```bash
# Fix: Recompile and restart
cd frontend
rm -rf .next
npm run build
npm run dev
# Try browser again
```

### Issue: MetaMask won't connect

```bash
# Fix: Refresh and try again
# Browser: Ctrl+R (refresh)
# Wait 2 seconds
# Click "Connect Wallet" again
# If still fails:
# - Close MetaMask
# - Close browser
# - Restart browser
# - Click connect
```

### Issue: Stake reverts

```bash
# Fix: Check block explorer for reason
# https://wirefluidscan.com - paste transaction hash
# Click "Logs" tab
# Look for error message
# Most likely: Pool closed (try different match)
```

### Issue: Leaderboard doesn't update

```bash
# Fix: Restart Oracle backend
# In oracle terminal: Ctrl+C
# Then: npm start
# Wait for "✓ Oracle server listening"
# Try staking again
```

### Issue: Port conflict (3000 or 3001 already in use)

```bash
# Kill existing process:
# Mac/Linux:
lsof -i :3000 | awk 'NR>1 {print $2}' | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Then restart:
npm run dev
```

### Issue: 0 WIRE balance (can't stake)

```bash
# Quick fix during demo:
# 1. Go to https://faucet.wirefluid.com
# 2. Request more WIRE
# 3. Wait 1 minute
# 4. MetaMask should show updated balance
# 5. Resume demo with new stake
```

---

## Demo Script (What to Show)

### Opening (30 seconds)

```
"This is PSL Pulse - a decentralized prediction market 
for cricket with real-time leaderboards. First, let me 
connect my wallet..."

[Click "Connect Wallet" → MetaMask popup]
"MetaMask pops up, I authorize the connection..."
[Click "Confirm"]
"Now I'm connected as [show address]"
```

### Main Demo (2 minutes)

```
"Let me place a stake on the India vs Pakistan match.
I'll stake 0.1 WIRE on the Environment pillar..."

[Click match card]
"I enter the amount: 0.1"
[Type 0.1]
"Select the pillar: Environment"
[Click Environment]
"Now I submit the stake..."
[Click "Stake Now"]

"MetaMask asks me to confirm..."
[MetaMask popup appears]
"I click Confirm..."
[Click Confirm]

"The stake is submitted! See this toast?
Now let me check the leaderboard..."

[Go to Leaderboard page]
"See my address just appeared here with my 0.1 WF stake!
The leaderboard updates in real-time - no page refresh 
needed. That's powered by our Oracle backend listening 
to blockchain events."

[Show block explorer]
"Here on the WireFluid block explorer, you can see my 
transaction was confirmed. It cost only about 0.01 WF 
in gas - that's 1000x cheaper than Ethereum."
```

### Closing (30 seconds)

```
"The whole flow - from placing a bet to seeing results 
on the leaderboard - takes under 20 seconds. WireFluid's 
instant finality means users see real-time updates without 
waiting for multiple block confirmations. This creates 
an engaging betting experience for predictions on live 
cricket matches."
```

---

## Backup Plan (If something breaks during demo)

**Have these ready:**

1. **Screenshot of working leaderboard** (take before demo)
2. **Pre-recorded video** of staking flow (screen recording)
3. **Block explorer link** to real transaction (https://wirefluidscan.com)
4. **Talkie points** (what to say if unable to show live):

```
"Let me show you this real transaction on the block explorer...
[Point to working transaction]

And here's the leaderboard after several stakes...
[Show screenshot or pre-recorded video]

The key innovation here is that all of this runs on WireFluid's 
network, which gives us instant finality and minimal gas costs."
```

---

## Post-Demo Steps

### If demo went well:

```bash
# 1. Save the contract addresses
cp contracts/DEPLOYED_ADDRESSES.txt contracts/DEPLOYED_ADDRESSES.backup.txt

# 2. Take screenshots:
# - Screenshot of leaderboard
# - Screenshot of a successful transaction

# 3. Document the demo:
# - How many stakes were placed?
# - Which match was most popular?
# - Any issues encountered?
```

### If demo had issues:

```bash
# 1. Document the issue:
# - What went wrong?
# - When did it break?
# - What was the error message?

# 2. Check logs:
cat oracle/server.log | grep ERROR

# 3. Fix for next demo:
# Follow ERROR_RECOVERY.md for specific error
```

---

## Technical Specs for Judges

**You might be asked these questions. Have answers ready:**

| Question | Answer |
|----------|--------|
| What blockchain is this on? | WireFluid (instant finality, 100-1000x cheaper gas) |
| What tokens do you use? | WIRE token (18 decimals) |
| How many contracts? | 3: PSLImpactMarket, PSLTicket, ImpactBadge |
| Real-time update speed? | <100ms (event-driven) |
| Gas cost per stake? | ~0.01 WF (~$0.0003 at $0.03/WF) |
| How does Oracle work? | Watches contract events, fetches live cricket data from Cricbuzz API |
| Is testnet or mainnet? | Testnet (for demo purposes) |
| Can it scale? | Yes - WireFluid supports ~1000 TPS |

---

## Final Verification Checklist

**Print this out and check off each item:**

```
POV: 10 minutes before demo

FRONTEND:
  ☐ npm run dev is running
  ☐ http://localhost:3000 loads
  ☐ No blank screen
  ☐ Match cards visible with data
  ☐ "Connect Wallet" button visible

WALLET:
  ☐ MetaMask is open and unlocked
  ☐ On "WireFluid Testnet" network
  ☐ Shows 10+ WF balance
  ☐ Can click "Connect Wallet" and authenticate

STAKING:
  ☐ Can click match card
  ☐ Can enter 0.1 as stake
  ☐ Can select "Environment" pillar
  ☐ Can click "Stake Now"
  ☐ MetaMask popup appears
  ☐ Can click "Confirm"

CONFIRMATION:
  ☐ Toast shows "✓ Stake submitted!"
  ☐ After 10s: "✓ Stake confirmed!"
  ☐ No error toasts stuck on screen
  ☐ Leaderboard shows new stake within 30s

BLOCK EXPLORER:
  ☐ https://wirefluidscan.com is accessible
  ☐ Transaction visible
  ☐ Status: "Success"

ORACLE:
  ☐ npm start is running in separate terminal
  ☐ Shows "✓ Oracle server listening"
  ☐ Shows "✓ WebSocket connected"
  ☐ No error messages (red text)
  ☐ No "Cannot connect" errors

DEMO READINESS:
  ☐ All above checkmarks completed
  ☐ Wallet has fresh WIRE (from faucet)
  ☐ Have backup plan ready
  ☐ Practice story/talking points
  ☐ Know contract addresses
  ☐ Know WireFluid network specs

READY TO DEMO? ✓ YES ☐ NO

If any ☐ NO above, fix that issue first using ERROR_RECOVERY.md
```

---

## During Demo - Command Reference

**Keep these commands in a text editor, ready to copy-paste:**

```bash
# If frontend crashes during demo:
cd frontend
npm run dev

# If Oracle crashes during demo:
cd oracle  
npm start

# If port conflict during demo:
pkill node
npm run dev
npm start

# Check health during demo:
curl http://localhost:3001/api/live/health

# View recent transaction:
# https://wirefluidscan.com/address/[YOUR_ADDRESS]

# Get more test tokens (if balance runs out):
# https://faucet.wirefluid.com
```

---

## Success Indicators

**You're ready to demo when:**

✓ All 3 terminals clean (no errors)  
✓ Frontend loads instantly  
✓ Wallet connects in 1 click  
✓ Stake confirms in <20 seconds  
✓ No ghost toasts or stuck UI states  
✓ Leaderboard updates visibly  
✓ Block explorer shows real transaction  
✓ Oracle backend is humming along  

### 🎬 ACTION: Go demo! 🚀

