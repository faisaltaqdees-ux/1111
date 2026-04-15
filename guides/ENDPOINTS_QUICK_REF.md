# API Endpoints Quick Reference
## Copy-Paste Configuration

---

## 🚀 For Your `.env.local`

```bash
# ============================================
# CRICKET DATA
# ============================================
NEXT_PUBLIC_CRICKET_API=https://api.cricketdata.com


# ============================================
# SUPABASE (PSL PULSE DATABASE)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://vdliftxhaeerckexudos.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=sb_publishable_NIKgt-S1ZDIKOKnx1jeKPg_VOnMXs_l


# ============================================
# WIREFLUID BLOCKCHAIN (Chain ID: 92533)
# ============================================
NEXT_PUBLIC_WIREFLUID_RPC=https://evm.wirefluid.com
NEXT_PUBLIC_WIREFLUID_WS=wss://ws.wirefluid.com

# Optional: NFT Ticket Smart Contract
# NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
```

---

## 📊 Service Matrix

| Service | Endpoint | Type | Purpose |
|---------|----------|------|---------|
| **Cricket Data** | https://api.cricketdata.com | REST | Live scores, schedules, player stats |
| **Supabase REST** | https://vdliftxhaeerckexudos.supabase.co/rest/v1 | REST | User data, badges, leaderboard |
| **Supabase Realtime** | https://vdliftxhaeerckexudos.supabase.co/realtime/v1 | WebSocket | Live updates to tables |
| **WireFluid RPC** | https://evm.wirefluid.com | JSON-RPC | NFT verification, smart contracts |
| **WireFluid WS** | wss://ws.wirefluid.com | WebSocket | Real-time blockchain events |
| **Block Explorer** | https://wirefluidscan.com | Web UI | View blocks, txs, contracts |

---

## 🧪 Quick Test Commands

### Test WireFluid RPC
```bash
curl https://evm.wirefluid.com \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }'
```

### Test Supabase
```bash
curl https://vdliftxhaeerckexudos.supabase.co/rest/v1/users \
  -H "apikey: sb_publishable_NIKgt-S1ZDIKOKnx1jeKPg_VOnMXs_l"
```

### Test Cricket API (if available)
```bash
curl https://api.cricketdata.com/matches/live
```

---

## 🔧 Integration Points in Code

### Supabase Connection
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vdliftxhaeerckexudos.supabase.co',
  'sb_publishable_NIKgt-S1ZDIKOKnx1jeKPg_VOnMXs_l'
);
```

### WireFluid RPC
```typescript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(
  'https://evm.wirefluid.com'
);
```

### WireFluid WebSocket
```typescript
const ws = new WebSocket('wss://ws.wirefluid.com');
```

---

## ✅ Verification Checklist

- [ ] Copied `.env.local` template
- [ ] WireFluid RPC accessible: `https://evm.wirefluid.com`
- [ ] Supabase auth key valid: `sb_publishable_...`
- [ ] Cricket API endpoint configured
- [ ] WebSocket URL set: `wss://ws.wirefluid.com`
- [ ] No `.env.local` committed to git
- [ ] Environment variables loaded in app
- [ ] Tested API connections
- [ ] Ready for deployment ✅

---

## 📞 Reference Info

**WireFluid Network:**
- Chain ID: `92533`
- RPC: `https://evm.wirefluid.com`
- Currency: WIRE
- Explorer: https://wirefluidscan.com
- Status: Testnet (Production-grade)

**Supabase Project:**
- ID: vdliftxhaeerckexudos
- URL: https://vdliftxhaeerckexudos.supabase.co
- Type: PostgreSQL
- Status: Active

**Cricket Data:**
- API: https://api.cricketdata.com
- Format: REST JSON
- Status: Ready to integrate

---

## 🚀 Deploy Steps

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Verify setup
npm run env:check

# 3. Build
npm run build

# 4. Test
npm run test

# 5. Deploy
npm run deploy
```

---

**Version**: 2.0  
**Updated**: April 15, 2026  
**Status**: ✅ Ready to Use
