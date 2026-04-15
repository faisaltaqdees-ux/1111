# Environment Configuration Guide
## WireFluid RPC + Supabase Setup

---

## Quick Setup

Create `.env.local` in your frontend directory:

```bash
# Cricket Data - Live Match Info
NEXT_PUBLIC_CRICKET_API=https://api.cricketdata.com

# Supabase - PSL Pulse Database
NEXT_PUBLIC_SUPABASE_URL=https://vdliftxhaeerckexudos.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=sb_publishable_NIKgt-S1ZDIKOKnx1jeKPg_VOnMXs_l

# WireFluid Blockchain RPC - NFT Tickets & Smart Contracts
NEXT_PUBLIC_WIREFLUID_RPC=https://evm.wirefluid.com
NEXT_PUBLIC_WIREFLUID_WS=wss://ws.wirefluid.com

# NFT Ticket Smart Contract Address (Optional)
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
```

---

## Detailed Configuration

### 1️⃣ WireFluid RPC Endpoint

**Primary RPC**: `https://evm.wirefluid.com`

**Purpose:**
- Verify NFT ticket authenticity
- Execute smart contract calls
- Query blockchain data
- Connect MetaMask wallet

**Network Details:**
```
Network Name: WireFluid Testnet
Chain ID: 92533
Currency Symbol: WIRE
RPC URL: https://evm.wirefluid.com
Block Explorer: https://wirefluidscan.com
```

**Supported Methods:**
```
✅ eth_blockNumber
✅ eth_getBalance
✅ eth_call (smart contract reads)
✅ eth_sendRawTransaction (signed transactions)
✅ eth_getTransactionReceipt
✅ eth_estimateGas
✅ eth_gasPrice
✅ eth_getLogs (event filtering)
```

**Example Usage in Code:**
```typescript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://evm.wirefluid.com");

// Get current block
const blockNumber = await provider.getBlockNumber();
console.log(`Block: ${blockNumber}`);

// Verify ticket on blockchain
const ticketValid = await contract.isValidTicket(ticketId);
```

---

### 2️⃣ WireFluid WebSocket

**WebSocket Endpoint**: `wss://ws.wirefluid.com`

**Purpose:**
- Real-time event listening
- NFT transfer notifications
- Live transaction confirmations
- Future: Real-time leaderboard updates

**Example Real-Time Subscription:**
```typescript
// Monitor NFT transfers in real-time
const ws = new WebSocket("wss://ws.wirefluid.com");

ws.addEventListener("open", () => {
  const subscription = {
    jsonrpc: "2.0",
    method: "eth_subscribe",
    params: ["logs", {
      address: "0xNFT_CONTRACT_ADDRESS",
      topics: ["0xTransferEventHash"]
    }]
  };
  ws.send(JSON.stringify(subscription));
});

ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.method === "eth_subscription") {
    console.log("NFT Transfer Detected:", msg.params.result);
  }
});
```

---

### 3️⃣ Supabase Database

**URL**: `https://vdliftxhaeerckexudos.supabase.co`  
**Anon Public Key**: `sb_publishable_NIKgt-S1ZDIKOKnx1jeKPg_VOnMXs_l`

**Purpose:**
- Store user profiles & badges
- Track donations per academy
- Leaderboard rankings
- Academy statistics
- Analytics & interaction logs

**Available Tables:**
```sql
-- User profiles
SELECT * FROM users;

-- Badge earnings
SELECT * FROM badges;

-- Donation records
SELECT * FROM donations;

-- Leaderboard
SELECT * FROM leaderboard;

-- PSL Academies
SELECT * FROM academies;

-- Analytics logs
SELECT * FROM analytics_interactions;
```

**Real-Time Subscriptions (Enabled):**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vdliftxhaeerckexudos.supabase.co',
  'sb_publishable_NIKgt-S1ZDIKOKnx1jeKPg_VOnMXs_l'
);

// Listen to leaderboard updates in real-time
supabase
  .from('leaderboard')
  .on('*', (payload) => {
    console.log('Leaderboard updated:', payload);
  })
  .subscribe();
```

---

## Environment Variable Reference

| Variable | Value | Required | Purpose |
|----------|-------|----------|---------|
| `NEXT_PUBLIC_CRICKET_API` | https://api.cricketdata.com | ✅ Yes | Cricket match data |
| `NEXT_PUBLIC_SUPABASE_URL` | https://vdliftxhaeerckexudos.supabase.co | ✅ Yes | Database connection |
| `NEXT_PUBLIC_SUPABASE_KEY` | sb_publishable_... | ✅ Yes | Supabase auth |
| `NEXT_PUBLIC_WIREFLUID_RPC` | https://evm.wirefluid.com | ✅ Yes | Blockchain RPC |
| `NEXT_PUBLIC_WIREFLUID_WS` | wss://ws.wirefluid.com | 🟡 Recommended | Real-time events |
| `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` | 0x... | 🟡 Recommended | NFT contract address |

---

## Testing Your Configuration

### 1. Test WireFluid RPC Connection

```bash
# Test endpoint accessibility
curl https://evm.wirefluid.com -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }'

# Expected response includes current block number
```

### 2. Test Supabase Connection

```bash
# Test Supabase API
curl https://vdliftxhaeerckexudos.supabase.co/rest/v1/users \
  -H "apikey: sb_publishable_NIKgt-S1ZDIKOKnx1jeKPg_VOnMXs_l" \
  -H "Authorization: Bearer sb_publishable_NIKgt-S1ZDIKOKnx1jeKPg_VOnMXs_l"

# Returns user records if connection successful
```

### 3. Test from Node.js

```javascript
// test-connection.js
import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";

// Test WireFluid
const provider = new ethers.JsonRpcProvider("https://evm.wirefluid.com");
const blockNumber = await provider.getBlockNumber();
console.log(`✅ WireFluid: Block ${blockNumber}`);

// Test Supabase
const supabase = createClient(
  "https://vdliftxhaeerckexudos.supabase.co",
  "sb_publishable_NIKgt-S1ZDIKOKnx1jeKPg_VOnMXs_l"
);
const { data, error } = await supabase.from("users").select("count");
console.log(`✅ Supabase: ${data?.length || 0} users`);
```

```bash
node test-connection.js
```

---

## Security Notes

### ⚠️ Public Keys (Safe to Expose)
- `NEXT_PUBLIC_WIREFLUID_RPC` ✅ Public endpoint
- `NEXT_PUBLIC_SUPABASE_KEY` ✅ Anon public key (read-only)
- All `NEXT_PUBLIC_*` variables are public

### 🔐 Keep Secret (Do NOT expose)
- Private wallet keys
- Supabase service role key
- Database passwords
- Admin credentials

### Best Practices
1. Never commit `.env.local` to git
2. Use `.env.example` for template
3. Use different credentials for dev/prod
4. Rotate keys regularly
5. Monitor API usage for rate limits

---

## Rate Limiting & Capacity

### WireFluid RPC
- Rate Limit: ~100 requests/second
- If hit: Implement request throttling
- Backoff: Exponential (1s, 2s, 4s, 8s...)

### Supabase
- Free Tier: 50,000 rows
- Real-time connections: 200
- Auth tokens: 24-hour expiry
- If hitting limits: Upgrade plan

---

## Troubleshooting

### Issue: "429 Too Many Requests"
**Solution:** Reduce request frequency or implement caching
```typescript
// Cache responses for 30 seconds
const cache = new Map();
const TTL = 30000;

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < TTL) {
    return entry.data;
  }
  return null;
}
```

### Issue: "Connection Timeout"
**Solution:** Check endpoint URL and network
```bash
# Verify endpoint is reachable
curl -I https://evm.wirefluid.com
# Should return HTTP 200
```

### Issue: "Invalid Chain ID"
**Solution:** Verify chain ID is 92533
```typescript
const provider = new ethers.JsonRpcProvider(
  "https://evm.wirefluid.com"
);
const network = await provider.getNetwork();
console.log(`Chain ID: ${network.chainId}`); // Should be 92533
```

### Issue: "Supabase Auth Failed"
**Solution:** Check anon key is correct
```typescript
// Log key for verification (DO NOT share)
console.log(process.env.NEXT_PUBLIC_SUPABASE_KEY);
// Should start with: sb_publishable_
```

---

## Documentation Links

- 📖 [WireFluid RPC Docs](./RPC_ENDPOINTS.md)
- 📖 [Implementation Guide](./PARTS_2_3_IMPLEMENTATION.md)
- 📖 [Architecture Summary](./PARTS_2_3_SUMMARY.md)
- 🔗 [WireFluid Explorer](https://wirefluidscan.com)
- 🔗 [Supabase Console](https://supabase.co)

---

## Next Steps

1. ✅ Copy `.env.local` template above
2. ✅ Verify all endpoints are accessible
3. ✅ Run test script to validate
4. ✅ Review security checklist
5. ✅ Deploy to production

---

**Last Updated**: April 15, 2026  
**Status**: Production Ready ✅
