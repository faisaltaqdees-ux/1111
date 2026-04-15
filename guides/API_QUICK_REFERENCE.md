# API Quick Reference - WIRE Payment System

## Base URL
```
http://localhost:3000/api/blockchain
```

---

## 1. Health Check

**Endpoint:** `GET /health`

**Quick Test:**
```bash
curl http://localhost:3000/api/blockchain/health
```

**Response:**
```json
{
  "status": "connected",
  "blockchain": "WireFluid",
  "chainId": 92533,
  "rpc": "https://evm.wirefluid.com"
}
```

**Status Codes:**
- `200` - RPC connected ✅
- `503` - RPC down ❌

---

## 2. Initiate Payment

**Endpoint:** `POST /payment/initiate`

**Purpose:** Create a pending transaction record

**Request:**
```bash
curl -X POST http://localhost:3000/api/blockchain/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x742d35Cc6634C0532925a3b844Bc416e4aE92894",
    "wireAmount": "350000000000000000",
    "purpose": "donation",
    "metadata": { "matchId": "match_123" }
  }'
```

**Body Parameters:**

| Param | Type | Required | Example | Notes |
|-------|------|----------|---------|-------|
| `userAddress` | string | ✅ | `0x742d...` | Must be valid ETH address |
| `wireAmount` | string | ✅ | `350000000000000000` | In wei (1 WIRE = 1e18 wei) |
| `purpose` | string | ✅ | `donation` | One of: donation, ticket, tip, badge |
| `pkrAmount` | number | ❌ | `500` | Backend converts to WIRE |
| `metadata` | object | ❌ | `{matchId:"1"}` | Custom data for tracking |

**Response (201 Created):**
```json
{
  "transaction": {
    "id": "tx_1713199834567_abc123",
    "status": "pending",
    "userAddress": "0x742d35...",
    "amount": "350000000000000000",
    "amountDisplay": "0.35 WIRE",
    "purpose": "donation",
    "createdAt": "2024-04-15T10:30:45.123Z",
    "expiresAt": "2024-04-15T10:35:45.123Z"
  }
}
```

**Error Responses:**

| Error | Code | Reason |
|-------|------|--------|
| VALIDATION_ERROR | 400 | Invalid address or amount |
| RATE_LIMIT | 429 | >10 requests/min |
| RPC_ERROR | 503 | Network unreachable |

**Save `transaction.id` for execute & status checks**

---

## 3. Execute Payment

**Endpoint:** `POST /payment/execute`

**Purpose:** Send transaction to blockchain

**Request:**
```bash
curl -X POST http://localhost:3000/api/blockchain/payment/execute \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "tx_1713199834567_abc123"
  }'
```

**Body Parameters:**

| Param | Type | Required | Example |
|-------|------|----------|---------|
| `transactionId` | string | ✅ | `tx_1713199834567_abc123` |

**Response Scenarios:**

### Success - Pending (202 Accepted):
```json
{
  "transaction": {
    "id": "tx_1713199834567_abc123",
    "status": "pending",
    "txHash": "0x4a5d9e7f2c8b1a3d5e7f9a2b4c6d8e0f1a3b5c7d",
    "message": "Transaction sent. Polling for confirmation...",
    "explorerUrl": "https://testnet-explorer.wirefluid.com/tx/0x4a5d..."
  }
}
```

### Success - Confirmed (200 OK):
```json
{
  "transaction": {
    "id": "tx_1713199834567_abc123",
    "status": "confirmed",
    "txHash": "0x4a5d...",
    "blockNumber": 42857291,
    "gasUsed": "21000",
    "message": "✅ Payment confirmed",
    "explorerUrl": "https://testnet-explorer.wirefluid.com/tx/0x4a5d..."
  }
}
```

**⏱️ Expected Timing:**
- Response: <500ms
- Confirmation: 30-120s (testnet)

---

## 4. Check Status

**Endpoint:** `GET /payment/status?txId=<id>`

**Purpose:** Poll transaction status anytime

**Request:**
```bash
curl "http://localhost:3000/api/blockchain/payment/status?txId=tx_1713199834567_abc123"
```

**Query Parameters:**

| Param | Type | Required | Example |
|-------|------|----------|---------|
| `txId` | string | ✅ | `tx_1713199834567_abc123` |

**Response:**
```json
{
  "transaction": {
    "id": "tx_1713199834567_abc123",
    "status": "confirmed",
    "txHash": "0x4a5d...",
    "blockNumber": 42857291,
    "gasUsed": "21000",
    "explorerUrl": "https://testnet-explorer.wirefluid.com/tx/0x4a5d..."
  }
}
```

**Possible Status Values:**
- `pending` - Transaction initiated, not yet sent
- `processing` - Transaction sent, awaiting confirmation
- `confirmed` - ✅ On blockchain
- `failed` - ❌ Transaction failed
- `expired` - Transaction record expired

---

## Code Examples

### React Hook (Recommended)

```typescript
import { useBlockchainPayment } from '@/lib/hooks/useBlockchainPayment';
import { ethers } from 'ethers';

function MyComponent() {
  const {
    initiatePayment,
    executePayment,
    checkStatus,
    paymentState,
  } = useBlockchainPayment();

  const handlePayment = async () => {
    // Step 1: Initiate
    const txId = await initiatePayment({
      userAddress: '0x742d35Cc6634C0532925a3b844Bc416e4aE92894',
      wireAmount: ethers.parseEther('0.35'),
      purpose: 'donation',
      metadata: { matchId: 'match_001' }
    });

    // Step 2: Execute
    await executePayment(txId);

    // Step 3: Check status
    if (paymentState.status === 'confirmed') {
      console.log('✅ Payment successful!');
    }
  };

  return <button onClick={handlePayment}>Pay</button>;
}
```

### PaymentButton Component (Simplest)

```typescript
import { PaymentButton } from '@/components/PaymentButton';
import { ethers } from 'ethers';

<PaymentButton
  userAddress="0x742d35Cc6634C0532925a3b844Bc416e4aE92894"
  wireAmount={ethers.parseEther('0.35')}
  purpose="donation"
  onSuccess={(txHash) => console.log('Paid:', txHash)}
/>
```

### Direct Fetch (Advanced)

```typescript
// Step 1: Initiate
const initiateRes = await fetch('/api/blockchain/payment/initiate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userAddress: '0x742d...',
    wireAmount: '350000000000000000',
    purpose: 'donation'
  })
});
const { data } = await initiateRes.json();
const txId = data.transaction.id;

// Step 2: Execute
const executeRes = await fetch('/api/blockchain/payment/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ transactionId: txId })
});

// Step 3: Check status
const statusRes = await fetch(`/api/blockchain/payment/status?txId=${txId}`);
const status = await statusRes.json();
console.log(status.data.transaction.status);
```

---

## Constants

### Environment Variables
```bash
NEXT_PUBLIC_WIRE_RPC=https://evm.wirefluid.com
NEXT_PUBLIC_WIRE_CHAIN_ID=92533
NEXT_PUBLIC_TREASURY_ADDRESS=0xA72D5477F124a4A6EC54Ea27AeBA7e75f3d2e71d
NEXT_PUBLIC_MIN_PAYMENT_WIRE=0.001
NEXT_PUBLIC_MAX_PAYMENT_WIRE=1000
```

### Wei Conversions
```typescript
import { ethers } from 'ethers';

ethers.parseEther('0.35')    // 350000000000000000
ethers.formatEther('350000000000000000')  // "0.35"
```

### Purpose Enum
```typescript
type Purpose = 'donation' | 'ticket' | 'tip' | 'badge';
```

### Status Enum
```typescript
type TransactionStatus = 'pending' | 'processing' | 'confirmed' | 'failed' | 'expired';
```

---

## Common Errors & Fixes

| Error | HTTP | Cause | Fix |
|-------|------|-------|-----|
| Invalid address | 400 | Bad format | Use `ethers.isAddress()` |
| Amount too small | 400 | <0.001 WIRE | Increase amount |
| Rate limit exceeded | 429 | >10/min | Wait 60s |
| RPC error | 503 | Network down | Check WireFluid status |
| Transaction expired | 408 | >5min to confirm | Create new transaction |
| Insufficient balance | 400 | Out of WIRE | Get from faucet |

---

## Explorer Links

- **Testnet Explorer:** https://testnet-explorer.wirefluid.com
- **Faucet:** https://faucet.wirefluid.com
- **Get Test WIRE:** https://faucet.wirefluid.com

---

## Performance Targets

| Operation | Target | Typical |
|-----------|--------|---------|
| Health check | <100ms | 50ms |
| Initiate payment | <200ms | 100ms |
| Execute payment | <1s | 500ms |
| Confirm payment | 30-120s | 60s |
| Check status | <100ms | 50ms |

---

## Rate Limiting

**Limit:** 10 requests/minute per IP

**Headers Returned:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1713199834
```

**When Limited (429):**
```json
{
  "error": "RATE_LIMIT",
  "message": "Too many requests",
  "retryAfter": 45
}
```

---

## More Help

- 📖 [Full Testing Guide](./BLOCKCHAIN_PAYMENT_TESTING.md)
- 📋 [Integration Checklist](./BLOCKCHAIN_PAYMENT_FRONTEND_INTEGRATION_CHECKLIST.md)
- 🪙 [Payment Demo](http://localhost:3000/demo/blockchain-payment)
- 💾 [API Source Code](/frontend/app/api/blockchain/payment/route.ts)
- 🎣 [Hook Source Code](/frontend/lib/hooks/useBlockchainPayment.ts)

---

**Last Updated:** April 15, 2024
**Status:** ✅ Production Ready
