# 🐾 Payment System Implementation Guide

## Overview
Complete payment system for KittyPaws cricket ticket platform. Includes:
- Payment session management
- Blockchain transaction verification (WireFluid testnet)
- NFT ticket minting with transaction hash tracking
- Digital receipt generation
- Match data integration from CricAPI

---

## Database Setup Instructions

### 1. Run SQL Schema
Execute the SQL file in your Supabase SQL editor:

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Click "New Query"
# 3. Copy entire contents of: frontend/database/kittypaws_schema.sql
# 4. Click "Run"
```

**What this creates:**
- 12 main tables
- 3 reporting views
- 2 database functions
- RLS policies for security
- Indexes for performance
- Sample match data

### 2. Verify Setup
```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show:
-- - users
-- - email_verifications
-- - payment_sessions
-- - transactions (CRITICAL)
-- - matches
-- - tickets
-- - nft_minting_records (CRITICAL)
-- - receipts
-- - ticket_reservations
-- - audit_logs
-- - payment_limits
-- - match_inventory
```

---

## File Structure

### 📁 Services (Business Logic)
```
frontend/lib/services/
├── paymentVerification.service.ts    // Blockchain verification
├── qrCode.service.ts                 // QR code generation
├── nftMinting.service.ts             // NFT minting + metadata
├── receipt.service.ts                // Receipt generation
└── matchTicket.service.ts            // Ticket creation from matches
```

### 📁 API Routes (Backend)
```
frontend/app/api/
├── blockchain/payment/
│   ├── initiate/route.ts             // Start payment session
│   └── confirm/route.ts              // Verify + mint NFT
└── services/receipt/
    └── generate/route.ts             // Create receipt
```

---

## Data Flow Diagram

```
User → Payment Initiation → Create Payment Session → User Sends WIRE
                                       ↓
                        Payment Session stored in DB
                              (10 min expiry)
                                   ↓
User sends WIRE → Blockchain → Transaction Hash
transaction                      ↓
                         Confirmation Route
                            ↓ (verifies on blockchain)
                        Transaction Confirmed
                              ↓
                   ← Save to transactions table
                   ← Record transaction_hash (CRITICAL)
                             ↓
                      Mint NFT Ticket(s)
                             ↓
          ← Save to nft_minting_records WITH transaction_hash
                             ↓
                    Generate Receipt
                             ↓
       ← QR Code ← Receipt with transaction details
                             ↓
                      User receives:
                   - NFT in wallet
                   - Receipt (HTML/CSV)
                   - QR Code ticket
```

---

## Key Tables & Transaction Hash Tracking

### 1. `transactions` Table (CRITICAL)
Stores ALL payment transactions with blockchain hashes:

```sql
-- Structure:
transaction_hash    VARCHAR(66)  -- Blockchain hash (0x + 64 hex chars)
block_number        INTEGER      -- Block confirmation
confirmations       INTEGER      -- Confirmation count
user_id             UUID         -- User reference
match_id            VARCHAR(50)  -- Match reference
status              VARCHAR(50)  -- pending/confirming/confirmed/failed
verified_at         TIMESTAMP    -- When verified
created_at          TIMESTAMP    -- When initiated

-- Unique constraint on transaction_hash
UNIQUE(transaction_hash)
```

**Why it's critical:**
- Single source of truth for all payments
- Links to all NFTs minted from this payment
- Enables refund tracking
- Audit trail for compliance

### 2. `nft_minting_records` Table (CRITICAL)
Tracks NFT minting with transaction reference:

```sql
-- Structure:
token_id            VARCHAR(255)  -- ERC721 token ID
transaction_hash    VARCHAR(66)   -- Links to transactions.transaction_hash
match_id            VARCHAR(50)   -- Which match
wallet_address      VARCHAR(42)   -- Who owns NFT
block_number        INTEGER       -- Minting block
gas_used            VARCHAR(50)   -- Gas cost
minting_status      VARCHAR(50)   -- initiated/pending/confirmed/failed
minted_at           TIMESTAMP     -- When minted

-- References transactions.transaction_hash
FOREIGN KEY(transaction_hash) REFERENCES transactions(transaction_hash),
UNIQUE(transaction_hash)
```

**Why it's critical:**
- Proves NFT was minted from valid payment
- Tracks gas costs
- Enables NFT ownership verification
- One-to-one relationship with transaction

### 3. `tickets` Table
Individual ticket records:

```sql
-- Structure:
ticket_id           VARCHAR(100)   -- Unique ticket ID
match_id            VARCHAR(50)    -- Match reference
transaction_hash    VARCHAR(66)    -- FOREIGN KEY to transactions
nft_token_id        VARCHAR(255)   -- UNIQUE link to NFT
status              VARCHAR(50)    -- pending/confirmed/used/cancelled
purchased_at        TIMESTAMP      -- When purchased
expires_at          TIMESTAMP      -- 24 hours after match
created_at          TIMESTAMP

-- One transaction can mint multiple tickets
-- Each ticket gets unique nft_token_id
```

---

## API Endpoints Reference

### 1. Initiate Payment
**POST** `/api/blockchain/payment/initiate`

**Request:**
```json
{
  "matchId": "match_001",
  "quantity": 2,
  "ticketType": "standard",
  "userEmail": "user@example.com",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f...",
  "totalAmount": 5.0
}
```

**Response:**
```json
{
  "message": "Payment session initiated",
  "session": {
    "sessionId": "PAY-LBMWO0-AB12CD",
    "matchId": "match_001",
    "amount": 5.0,
    "currency": "WIRE",
    "recipientAddress": "0x...",
    "expiresAt": "2026-04-15T14:35:00Z",
    "status": "pending"
  },
  "instructions": {
    "step1": "Send 5.0 WIRE tokens to: 0x...",
    "step2": "Wait for transaction to be mined",
    "step3": "Transaction will be verified automatically",
    "timeout": "Payment session expires in 10 minutes"
  }
}
```

**Database updates:**
- INSERT into `payment_sessions`
- SET status='pending', expires_at=NOW()+10min

---

### 2. Confirm Payment
**POST** `/api/blockchain/payment/confirm`

**Request:**
```json
{
  "sessionId": "PAY-LBMWO0-AB12CD",
  "transactionHash": "0x1234567890abcdef...",
  "matchId": "match_001",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f...",
  "quantity": 2
}
```

**Response:**
```json
{
  "message": "Payment confirmed. NFT minting initiated.",
  "data": {
    "confirmed": true,
    "transactionHash": "0x1234567890abcdef...",
    "blockNumber": 1234567,
    "confirmations": 6,
    "nftMintingStarted": true,
    "nftTokenIds": [
      "match_001_742d35cc_1",
      "match_001_742d35cc_2"
    ],
    "receipts": [
      "RCP-LBMWO0K-A1B2C3",
      "RCP-LBMWO0K-D4E5F6"
    ],
    "timestamp": "2026-04-15T14:25:00Z"
  }
}
```

**Database updates:**
- INSERT into `transactions` WITH transaction_hash
- INSERT into `nft_minting_records` (2 records) WITH transaction_hash
- INSERT into `tickets` (2 records) WITH transaction_hash
- UPDATE `payment_sessions` status='confirmed'

---

### 3. Generate Receipt
**POST** `/api/services/receipt/generate`

**Request:**
```json
{
  "transactionHash": "0x1234567890abcdef...",
  "matchId": "match_001",
  "matchData": {
    "team1": "Pakistan",
    "team2": "India",
    "date": "2026-04-22T14:00:00Z",
    "venue": "National Stadium, Karachi",
    "matchType": "odi"
  },
  "purchaseData": {
    "userEmail": "user@example.com",
    "walletAddress": "0x742d35Cc6634C0532...",
    "ticketType": "standard",
    "quantity": 2,
    "pricePerTicket": { "pkr": 2500, "wire": 2.5 },
    "totalPrice": { "pkr": 5000, "wire": 5.0 }
  },
  "nftTokenIds": ["match_001_742d35cc_1", "match_001_742d35cc_2"],
  "qrCode": "data:image/png;base64,..."
}
```

**Response:**
```json
{
  "message": "Receipt generated successfully",
  "data": {
    "receiptId": "RCP-LBMWO0K-A1B2C3",
    "transactionHash": "0x1234567890abcdef...",
    "html": "<html>...</html>",
    "csv": "Receipt ID,RCP-...",
    "qrCode": "data:image/png;base64,...",
    "timestamp": "2026-04-15T14:25:00Z"
  }
}
```

**Database updates:**
- INSERT into `receipts` WITH transaction_hash
- Save html_content & csv_content

---

## Environment Variables Required

```bash
# .env.local
NEXT_PUBLIC_PAYMENT_WALLET=0x742d35Cc6634C0532925a3b844Bc9e7595f...
NEXT_PUBLIC_NFT_CONTRACT=0x564c2D...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend environment (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anonymous-key

# For production
PINATA_JWT=your_pinata_jwt_token
NFT_STORAGE_KEY=your_nft_storage_key
```

---

## Implementation Checklist

### Phase 1: Database Setup ✅
- [ ] Run SQL schema in Supabase
- [ ] Verify all tables created
- [ ] Test sample queries
- [ ] Enable RLS policies
- [ ] Set up backups

### Phase 2: Services Implementation
- [ ] `paymentVerification.service.ts` - verify transactions
- [ ] `qrCode.service.ts` - generate QR codes
- [ ] `nftMinting.service.ts` - mint NFTs
- [ ] `receipt.service.ts` - create receipts
- [ ] `matchTicket.service.ts` - create tickets from matches

### Phase 3: API Routes
- [ ] `/api/blockchain/payment/initiate` - payment sessions
- [ ] `/api/blockchain/payment/confirm` - verification + minting
- [ ] `/api/services/receipt/generate` - receipt creation

### Phase 4: Integration
- [ ] Connect to CricAPI for match data
- [ ] Update match_inventory on CricAPI sync
- [ ] Link TicketPurchaseContext to payment API
- [ ] Test transaction hash retrieval
- [ ] Test NFT minting flow

### Phase 5: Testing
- [ ] Payment session creation
- [ ] Transaction verification
- [ ] NFT minting with hash saving
- [ ] Receipt generation
- [ ] QueryTransaction hashes for refunds
- [ ] Verify RLS policies work

---

## Query Examples

### Get all confirmed transactions
```sql
SELECT transaction_hash, user_id, amount, created_at
FROM transactions
WHERE status = 'confirmed'
ORDER BY created_at DESC
LIMIT 100;
```

### Get all NFTs minted from a transaction
```sql
SELECT token_id, wallet_address, minted_at
FROM nft_minting_records
WHERE transaction_hash = '0x1234567890abcdef...'
ORDER BY created_at;
```

### Get user's ticket purchases with transaction details
```sql
SELECT 
  t.ticket_id,
  t.match_id,
  t.nft_token_id,
  tr.transaction_hash,
  tr.status,
  t.purchased_at
FROM tickets t
JOIN transactions tr ON t.transaction_hash = tr.transaction_hash
WHERE t.user_id = 'user_uuid'
ORDER BY t.purchased_at DESC;
```

### Get match revenue (completed)
```sql
SELECT 
  m.match_id,
  m.team1,
  m.team2,
  COUNT(t.id) as tickets_sold,
  SUM(t.price_wire) as revenue_wire,
  SUM(t.price_pkr) as revenue_pkr
FROM matches m
LEFT JOIN tickets t ON m.match_id = t.match_id
WHERE m.match_status = 'completed'
GROUP BY m.match_id, m.team1, m.team2;
```

---

## Key Features Implemented

### ✅ Payment Verification Service
- Real-time blockchain verification
- Polling with automatic retry
- Confirmation counting (6 blocks)
- Gas cost tracking
- Transaction details retrieval
- Timeout handling (10 minutes)

### ✅ QR Code Service
- JSON payload encoding
- ColoredQR codes (paws-mauve)
- Data validation
- Parsing support for scanning
- Fallback implementations

### ✅ NFT Minting Service
- Metadata creation (match info, ticket details)
- IPFS upload ready (Pinata integration)
- Token ID generation
- Batch minting support
- Ownership verification
- Gas estimation

### ✅ Receipt Service
- HTML formatting (professional design)
- CSV export
- IndexedDB + localStorage storage
- Transaction hash inclusion
- NFT token ID display
- Match details embedding

### ✅ Match Ticket Service
- Ticket creation from CricAPI data
- Price calculation by type
- Validation with detailed errors
- Reservation system (10-min expiry)
- Availability checking
- Status management (pending → confirmed → used)

### ✅ Payment Session Management
- 10-minute session timeouts
- Rate limiting (1 per 60s per user)
- Status tracking
- Amount validation
- Wallet verification

---

## Transaction Hash Saving Strategy

### When Transaction Hash is Saved:

1. **On Confirmation** → `transactions` table
   - User sends WIRE on blockchain
   - We receive transaction hash
   - INSERT into `transactions` with status='pending'

2. **After Verification** → Update same row
   - Query blockchain to verify
   - Update `confirmations`, `block_number`, `status`='confirmed'

3. **NFT Minting** → `nft_minting_records` table
   - Smart contract mints NFT
   - Each NFT gets FOREIGN KEY to the original transaction_hash
   - Links payment → NFTs 1:Many

4. **Ticket Creation** → `tickets` table
   - Each ticket record references transaction_hash
   - Links payment → tickets 1:Many

5. **Receipt** → `receipts` table
   - Receipt record includes transaction_hash
   - Shows transaction in HTML/CSV formats

### Audit Trail Example:
```
User: alice@example.com
Transaction Hash: 0x123abc...

transactions table:
  ├─ transaction_hash: 0x123abc...
  ├─ amount: 5.0 WIRE
  ├─ status: confirmed
  └─ created_at: 2026-04-15 14:00:00

nft_minting_records table:
  ├─ Record 1: token_id=#1, transaction_hash: 0x123abc...
  └─ Record 2: token_id=#2, transaction_hash: 0x123abc...

tickets table:
  ├─ Ticket 1: transaction_hash: 0x123abc...
  └─ Ticket 2: transaction_hash: 0x123abc...

receipts table:
  ├─ receipt_id: RCP-XXX
  └─ transaction_hash: 0x123abc...
```

---

## Production Considerations

### Security
- [ ] Rate limiting per user & IP
- [ ] JWT validation on all routes
- [ ] RLS policies enforced
- [ ] Encryption for sensitive data
- [ ] CORS configuration

### Performance
- [ ] Index optimization for queries
- [ ] Caching for match data
- [ ] Database connection pooling
- [ ] Webhook for async NFT minting
- [ ] Queue system (Bull/BullMQ)

### Reliability
- [ ] Transaction hash logging
- [ ] Retry mechanism (exponential backoff)
- [ ] Error recovery procedures
- [ ] Data validation on all inputs
- [ ] Monitoring & alerting

### Compliance
- [ ] Audit trail for all transactions
- [ ] Tax reporting (revenue by region)
- [ ] AML/KYC requirements
- [ ] Refund procedures
- [ ] Data retention policies

---

## Next Steps

1. **Run SQL schema** in Supabase
2. **Set environment variables** for payment wallet + NFT contract
3. **Implement services** in this specific order:
   - paymentVerification.service.ts
   - matchTicket.service.ts
   - nftMinting.service.ts
   - qrCode.service.ts
   - receipt.service.ts
4. **Build API routes** with proper error handling
5. **Test payment flow** end-to-end
6. **Monitor transaction hashes** in database
7. **Deploy to production**

---

## Support

For issues or questions:
- Check audit_logs table for action history
- Query transactions table for payment status
- Review nft_minting_records for NFT details
- Monitor error messages in API responses

**Critical:** Always backup database before major updates!
