# Blockchain Payment Integration - Testing Guide

## Overview

This guide covers testing the complete WIRE blockchain payment integration. The system includes:
- **Backend API** (`/api/blockchain/payment/*`) - Handles blockchain transactions
- **Frontend Hook** (`useBlockchainPayment`) - State management for payments
- **UI Components** (`PaymentButton`, `PaymentModal`) - Ready-to-use payment UI

---

## 1. Prerequisites

### Get Test WIRE Tokens
1. Visit: https://faucet.wirefluid.com
2. Enter your testnet wallet address
3. Claim 10 WIRE (daily limit)
4. Wait 30 seconds for transfer

### Test Wallet Address
```
0x742d35Cc6634C0532925a3b844Bc416e4aE92894
```

### Network Configuration
- **Network**: WireFluid Testnet
- **Chain ID**: 92533
- **RPC**: https://evm.wirefluid.com
- **Explorer**: https://testnet-explorer.wirefluid.com

---

## 2. Health Check

### Test RPC Connection

**Request:**
```bash
curl http://localhost:3000/api/blockchain/health
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "blockchain": "WireFluid",
    "chainId": 92533,
    "rpc": "https://evm.wirefluid.com",
    "timestamp": "2024-04-15T10:30:45.123Z"
  }
}
```

**If RPC is down (503):**
```json
{
  "success": false,
  "error": "RPC_ERROR",
  "message": "Failed to fetch gas price",
  "details": {
    "endpoint": "https://evm.wirefluid.com",
    "chainId": 92533
  }
}
```

---

## 3. Single Payment Flow Test

### Step 1: Initiate Payment

**Request:**
```bash
curl -X POST http://localhost:3000/api/blockchain/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x742d35Cc6634C0532925a3b844Bc416e4aE92894",
    "wireAmount": "350000000000000000",
    "purpose": "donation",
    "metadata": {
      "matchId": "match_001",
      "description": "Support for local event"
    }
  }'
```

**Parameters:**
- `userAddress` - ETH address (0x...)
- `wireAmount` - Amount in wei (350000000000000000 = 0.35 WIRE)
- `purpose` - One of: "donation", "ticket", "tip", "badge"
- `metadata` - Optional object with additional data
- `pkrAmount` - Optional: PKR amount (backend converts to WIRE)

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "tx_1713199834567_abc123",
      "status": "pending",
      "userAddress": "0x742d35Cc6634C0532925a3b844Bc416e4aE92894",
      "amount": "350000000000000000",
      "amountDisplay": "0.35 WIRE",
      "purpose": "donation",
      "createdAt": "2024-04-15T10:30:45.123Z",
      "expiresAt": "2024-04-15T10:35:45.123Z"
    }
  }
}
```

**Save the transaction ID:** `tx_1713199834567_abc123`

---

### Step 2: Execute Payment

**Request:**
```bash
curl -X POST http://localhost:3000/api/blockchain/payment/execute \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "tx_1713199834567_abc123"
  }'
```

**Expected Response - Pending (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "tx_1713199834567_abc123",
      "status": "pending",
      "txHash": "0x4a5d9e7f2c8b1a3d5e7f9a2b4c6d8e0f1a3b5c7d",
      "amount": "350000000000000000",
      "amountDisplay": "0.35 WIRE",
      "message": "Transaction sent. Polling for confirmation...",
      "explorerUrl": "https://testnet-explorer.wirefluid.com/tx/0x4a5d9e7f2c8b1a3d5e7f9a2b4c6d8e0f1a3b5c7d"
    }
  }
}
```

**Save the txHash:** `0x4a5d9e7f2c8b1a3d5e7f9a2b4c6d8e0f1a3b5c7d`

---

### Step 3: Check Status (Pending)

**Request:**
```bash
curl "http://localhost:3000/api/blockchain/payment/status?txId=tx_1713199834567_abc123"
```

**Expected Response - Still Processing:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "tx_1713199834567_abc123",
      "status": "pending",
      "txHash": "0x4a5d9e7f2c8b1a3d5e7f9a2b4c6d8e0f1a3b5c7d",
      "amount": "350000000000000000",
      "amountDisplay": "0.35 WIRE",
      "message": "Transaction processing. Check again in 30 seconds",
      "explorerUrl": "https://testnet-explorer.wirefluid.com/tx/0x4a5d9e7f2c8b1a3d5e7f9a2b4c6d8e0f1a3b5c7d"
    }
  }
}
```

**Wait 30-60 seconds**, then repeat...

---

### Step 4: Check Status (Confirmed)

**Expected Response - Confirmed:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "tx_1713199834567_abc123",
      "status": "confirmed",
      "txHash": "0x4a5d9e7f2c8b1a3d5e7f9a2b4c6d8e0f1a3b5c7d",
      "blockNumber": 42857291,
      "blockHash": "0x8f2d1a9c3e5b7d1f4a2c6e8d0b3f5a7c9e1d3b5",
      "gasUsed": "21000",
      "amount": "350000000000000000",
      "amountDisplay": "0.35 WIRE",
      "message": "✅ Payment confirmed on blockchain",
      "explorerUrl": "https://testnet-explorer.wirefluid.com/tx/0x4a5d9e7f2c8b1a3d5e7f9a2b4c6d8e0f1a3b5c7d"
    }
  }
}
```

✅ **Payment successful!** Visit explorer link to verify.

---

## 4. Frontend Component Testing

### Using PaymentButton Component

**Location:** `/frontend/app/demo/blockchain-payment`

**Start Dev Server:**
```bash
cd frontend
npm run dev
```

**Navigate to:**
```
http://localhost:3000/demo/blockchain-payment
```

### Test Scenarios

#### Test 1: Basic Donation (0.35 WIRE)
1. Wallet shows: `0x742d...Bc416e4aE92894` ✓
2. Click "Donate 0.35 WIRE"
3. Button changes to "Creating transaction..."
4. Observe console logs:
   ```
   [Payment] Initiated: tx_1713199834567_abc123
   [Payment] Pending confirmation: 0x4a5d9e...
   ```
5. Wait 1-2 minutes for confirmation
6. Button changes to "✅ Payment Confirmed"
7. Click "View on WireScan" link
8. Verify transaction on explorer

#### Test 2: Modal Payment
1. Click "Open Payment Modal"
2. Modal shows "Amount: 0.5 WIRE"
3. Click "Pay with WIRE"
4. Follow same flow as Test 1
5. Modal closes after 2 seconds on success

#### Test 3: Custom Donation Amount
1. Scroll to "Support This Match"
2. Change "Donation Amount" to 0.1
3. Click "Pay with WIRE"
4. Check console: amount should be 0.1 WIRE
5. Confirm on blockchain

#### Test 4: Error Handling - Invalid Address
1. Clear wallet address field (if editable)
2. Click payment button
3. Should show error: "Invalid wallet address"
4. Button should be disabled

#### Test 5: Error Handling - RPC Down
1. Stop RPC (or modify connection)
2. Try to initiate payment
3. Should get error: "Failed to fetch gas price"
4. Should show retry option

---

## 5. Hook Testing (Advanced)

### Direct Hook Usage

**Test file:** `/frontend/lib/hooks/useBlockchainPayment.ts`

**Example usage in component:**
```typescript
function TestComponent() {
  const {
    initiatePayment,
    executePayment,
    checkStatus,
    paymentState,
    formatWire,
  } = useBlockchainPayment();

  const handleTest = async () => {
    // Test formatWire
    console.log(formatWire('350000000000000000')); // "0.35"

    // Test payment
    const txId = await initiatePayment({
      userAddress: '0x742d35Cc6634C0532925a3b844Bc416e4aE92894',
      wireAmount: ethers.parseEther('0.1'),
      purpose: 'donation',
    });

    const result = await executePayment(txId);
    console.log('Payment result:', result);

    // Check status
    const status = await checkStatus(txId);
    console.log('Status:', status);
  };

  return <button onClick={handleTest}>Test Payment</button>;
}
```

---

## 6. Error Scenarios

### Invalid Wallet Address
```bash
curl -X POST http://localhost:3000/api/blockchain/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "invalid_address",
    "wireAmount": "350000000000000000",
    "purpose": "donation"
  }'
```

**Expected (400 Bad Request):**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid Ethereum address format"
}
```

---

### Amount Too Small
```bash
curl -X POST http://localhost:3000/api/blockchain/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x742d35Cc6634C0532925a3b844Bc416e4aE92894",
    "wireAmount": "1000",
    "purpose": "donation"
  }'
```

**Expected (400 Bad Request):**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Amount too small. Minimum: 0.001 WIRE"
}
```

---

### Rate Limit (10/min per IP)
After 11 requests in 60 seconds:

```json
{
  "success": false,
  "error": "RATE_LIMIT",
  "message": "Too many requests",
  "retryAfter": 45
}
```

**HTTP Status:** 429 Too Many Requests

---

### RPC Connection Down
```json
{
  "success": false,
  "error": "RPC_ERROR",
  "message": "Network error: Failed to fetch",
  "details": {
    "endpoint": "https://evm.wirefluid.com",
    "attempt": 1,
    "maxRetries": 3
  }
}
```

**HTTP Status:** 503 Service Unavailable

---

## 7. Performance Benchmarks

### Expected Timings (Testnet)

| Operation | Time | Notes |
|-----------|------|-------|
| initiate | <100ms | API response |
| execute (sent) | 500-2000ms | TX sent, hash returned |
| Poll start | 1-2s | First receipt check |
| Confirmation | 30-120s | Varies by network load |
| **Total** | **~2-3min** | From initiate to confirmed |

### Simulated vs Real
- **Simulated**: 0ms (for demo purposes)
- **Real**: 2-3 minutes (actual blockchain)

---

## 8. WireScan Explorer Verification

### Check Transaction Details

1. **Get txHash** from payment response
2. **Visit Explorer**: https://testnet-explorer.wirefluid.com
3. **Search** the txHash
4. **Verify:**
   - ✅ From: Your wallet
   - ✅ To: Treasury (0xA72D5477F124a4A6EC54Ea27AeBA7e75f3d2e71d)
   - ✅ Value: 0.35 WIRE
   - ✅ Status: Success
   - ✅ Block: Number present

### Example Explorer URL
```
https://testnet-explorer.wirefluid.com/tx/0x4a5d9e7f2c8b1a3d5e7f9a2b4c6d8e0f1a3b5c7d
```

---

## 9. Load Testing

### Simulate Multiple Payments

**Script:**
```bash
#!/bin/bash

for i in {1..5}; do
  echo "Payment $i..."
  curl -X POST http://localhost:3000/api/blockchain/payment/initiate \
    -H "Content-Type: application/json" \
    -d "{
      \"userAddress\": \"0x742d35Cc6634C0532925a3b844Bc416e4aE92894\",
      \"wireAmount\": \"$((RANDOM % 1000000000000000000))\",
      \"purpose\": \"donation\"
    }"
  sleep 2
done
```

**Expectations:**
- ✅ All requests succeed (within rate limit)
- ✅ Each gets unique txId
- ✅ No duplicate transactions
- ✅ Nonce management prevents conflicts

---

## 10. Troubleshooting

### Issue: "Invalid wallet address"
**Solution:** Ensure address starts with `0x` and is 42 characters total

### Issue: "RPC connection failed"
**Solution:** Check https://evm.wirefluid.com in browser, verify network status

### Issue: Transaction pending forever
**Solution:** 
1. Wait 5+ minutes
2. Check `/api/blockchain/payment/status`
3. Verify txHash on WireScan explorer
4. If still pending, network may be congested

### Issue: "Rate limit exceeded"
**Solution:** Wait 60 seconds before next request (10/min limit)

### Issue: "Insufficient balance"
**Solution:** Get more WIRE from https://faucet.wirefluid.com

---

## 11. Debugging

### Enable Console Logs

All payment operations log to browser console:
```javascript
[Payment] Initiated: tx_1713199834567_abc123
[Payment] Pending confirmation: 0x4a5d9e...
[Payment] Confirmed: { txHash, blockNumber, gasUsed }
[Payment] Status check failed: timeout
```

### API Response Logging

Check network tab in DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Perform payment
4. Click `/api/blockchain/payment/initiate` request
5. View Response body

### Transaction Tracing

View full transaction details:
```bash
curl "http://localhost:3000/api/blockchain/payment/status?txId=tx_1713199834567_abc123"
```

---

## 12. Next Steps

After successful testing:
1. ✅ Connect to real wallet (MetaMask, Web3Modal)
2. ✅ Add database persistence (Supabase)
3. ✅ Create admin dashboard to track payments
4. ✅ Set up webhook for payment confirmations
5. ✅ Deploy to production mainnet

---

**Questions?** Check logs or revisit the implementation files!
