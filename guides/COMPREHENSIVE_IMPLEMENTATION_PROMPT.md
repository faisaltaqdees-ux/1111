# Comprehensive Implementation Prompt: Cricket Ticket Platform Complete Overhaul

## 🎯 Project Overview

Transform the cricket ticket platform with:
1. **Live Cricket Data Integration** - Real-time matches from CricAPI
2. **Unified Authentication** - Email/password registration + wallet connection
3. **NFT Ticket System** - Blockchain-based ticket minting with QR codes
4. **Payment Verification** - WIRE token validation via WireScan
5. **Global Wallet Context** - Persistent wallet state across all pages
6. **Receipt System** - Downloadable, beautifully formatted receipts
7. **User Profiles** - Complete purchase history and account management
8. **Enterprise Security** - Multi-layer validation, rate limiting, monitoring

---

## 📋 PART 1: FRONTEND ARCHITECTURE

### 1.1 Global State Management Structure

**File:** `/frontend/context/GlobalAuthContext.tsx`

```
Purpose: Single source of truth for:
- User authentication state (email, userId, verified)
- Wallet connection (address, provider, network, balance)
- User metadata (profile, preferences)
- Persist across all pages and app reloads

Requirements:
- localStorage persistence with encryption
- Auto-reconnect wallet on app load
- Sync across browser tabs (localStorage events)
- Clear distinction between email auth and wallet connection
- Handle wallet disconnection gracefully
- Support multiple wallet providers (MetaMask, WalletConnect, etc.)

Context should provide:
- user: { id, email, walletAddress, isEmailVerified, createdAt }
- wallet: { address, isConnected, provider, chainId, balance, chainName }
- loading: boolean
- error: string | null
- methods: login(), logout(), connectWallet(), disconnectWallet(), updateProfile()
```

**File:** `/frontend/context/TicketPurchaseContext.tsx`

```
Purpose: Manage ticket purchase workflow state
- Selected match
- Quantity
- Total price (PKR and WIRE)
- Payment status
- NFT minting status
- Receipt data

Should handle:
- Transaction lifecycle
- NFT metadata generation
- QR code data
- Receipt PDF generation
```

### 1.2 Navbar Component Enhancement

**File:** `/frontend/components/GlobalNavbar.tsx`

```
Features:
- Display current user email (if logged in)
- Display connected wallet address (if connected)
- Disconnect buttons for both email and wallet
- Profile link (-> /profile)
- Login/Register link (if not authenticated)
- Responsive mobile hamburger menu
- Persist logout state
- Show wallet balance in WIRE tokens
- Network indicator (show which testnet)
- Loading states during connection

Styling:
- Use deep mauve/rose gradient theme from landing page
- Smooth transitions and animations
- Accessible contrast ratios
- Mobile-first responsive design
```

### 1.3 Page Structure Updates

**All payment pages must:**
```
1. Import GlobalAuthContext
2. Verify wallet is connected before payment
3. Display wallet address in header
4. Use consistent navbar from GlobalNavbar
5. Handle wallet disconnection mid-transaction
6. Show error if user is not email-authenticated
7. Validate user has completed KYC (if required)
```

---

## 📋 PART 2: CRICKET DATA INTEGRATION

### 2.1 CricAPI Integration Setup

**File:** `/frontend/lib/services/cricapi.service.ts`

```
API Details:
- Base URL: https://api.cricapi.com/v1
- API Key: 1e283f07-d4bc-4af2-b983-52dca8c6ae18
- Endpoints:
  - GET /matches?offset=0 - All matches
  - GET /series/{id} - Series details
  - GET /match/{id} - Match details
  - GET /series - All series

Response Mapping:
{
  id: string (Guid)
  name: string (Match name)
  matchType: 'odi' | 't20' | 'test'
  score: {
    team1: { team: string, inning: { runs, wickets, overs } }
    team2: { team: string, inning: { runs, wickets, overs } }
  }?
  status: string ('Not Started' | 'In Progress' | 'Completed')
  venue: string
  date: string (ISO format)
  dateTimeGMT: string (ISO format)
  teams: [string, string]
  series_id: string
  fantasyEnabled: boolean
}

Transform to local Match object:
{
  id: string
  team1: string
  team2: string
  venue: string
  startTime: ISO datetime
  status: 'upcoming' | 'live' | 'completed'
  matchType: 'odi' | 't20' | 'test'
  score1?: number
  score2?: number
  wickets1?: number
  wickets2?: number
  overs?: string
  seriesId: string
}

Caching Strategy:
- Cache matches for 5 minutes
- Invalidate on manual refresh
- Update live matches every 10 seconds
- Mark stale cache with timestamp
```

### 2.2 Matches Fetching Hook

**File:** `/frontend/lib/hooks/useCricketMatches.ts`

```
Hook: useCricketMatches(filters?: { status?, matchType?, series_id? })

Returns:
{
  matches: Match[]
  loading: boolean
  error: string | null
  lastUpdated: Date
  refresh: () => Promise<void>
  getMatchById: (id: string) => Match | undefined
}

Features:
- Auto-fetch on component mount
- Filter matches by status/type
- Real-time updates for live matches
- Error handling with retry logic
- Loading states
- Polling for live matches
```

### 2.3 Updated Matches Page

**File:** `/frontend/app/tickets/page.tsx`

```
Changes:
1. Replace MOCK_LEADERBOARD with useCricketMatches() hook
2. Display real matches from CricAPI
3. Show match status (upcoming/live/completed)
4. Display scores for live/completed matches
5. Only allow ticket purchase for upcoming/live matches
6. Show match venue and time
7. Display series information
8. Add match filters (by type, series, status)
9. Show last updated timestamp
10. Add refresh button

Error States:
- API down: Show fallback message
- No matches: Show empty state
- Network error: Show retry button

Match Card Display:
- Team names with logos/badges
- Match type (ODI/T20/Test)
- Date and time (user's timezone)
- Venue
- Current status
- If live: Show current score and overs
- If completed: Show final scores
- Buy Ticket button (primary CTA)
```

---

## 📋 PART 3: AUTHENTICATION SYSTEM

### 3.1 User Registration/Login

**File:** `/frontend/app/auth/register/page.tsx`

```
Form Fields:
- Email (required, unique, valid format)
- Password (min 12 chars, uppercase, number, special char)
- Confirm Password
- Full Name
- Phone Number (optional)
- Terms acceptance checkbox

Validation:
- Email uniqueness check (via API)
- Password strength meter (real-time)
- Password match validation
- Terms acceptance required

Submit Logic:
1. Client-side validation
2. Hash password with bcrypt
3. POST /api/auth/register with encrypted data
4. Backend creates user in Supabase
5. Auto-login user
6. Redirect to /wallet-connect page
7. Show success toast

Error Handling:
- Email already exists
- Password too weak
- Network errors
- Server validation errors

UI/UX:
- Real-time validation feedback
- Password strength indicator
- Loading spinner on submit
- Success animation
- Resend verification email option
```

**File:** `/frontend/app/auth/login/page.tsx`

```
Form Fields:
- Email
- Password
- "Remember me" checkbox

Validation:
- Valid email format
- Password not empty

Submit Logic:
1. Client-side validation
2. POST /api/auth/login with credentials
3. Server verifies password (bcrypt)
4. Return JWT and user object
5. Store JWT in secure httpOnly cookie
6. Update GlobalAuthContext
7. Redirect to /tickets or previous page
8. Show wallet status indicator

Features:
- Forgot password link
- Sign up link
- Social login? (optional for future)
- Session management with JWT expiry
- 2FA support (future)

Error Handling:
- Invalid credentials (generic message for security)
- Account not found
- Account locked (after failed attempts)
- Network errors
```

**File:** `/frontend/app/auth/verify-email/page.tsx`

```
Purpose: Verify email address from verification link

Flow:
1. User receives email with verification link
2. Link contains encrypted token with expiry
3. Page decrypts and verifies token
4. Auto-submit verification or manual button
5. Backend validates token and marks email as verified
6. Redirect to /wallet-connect

If token expired:
- Show error message
- Provide button to resend verification email
```

### 3.2 Wallet Connection Flow

**File:** `/frontend/app/wallet-connect/page.tsx`

```
Purpose: Connect user's crypto wallet to account

Features:
1. Detect available wallet providers
   - MetaMask
   - WalletConnect
   - Coinbase Wallet
   - Rainbow Wallet
   - Hardware wallets via WalletConnect

2. Connection Logic:
   - Request wallet connection via ethers.js
   - Get user's wallet address
   - Verify correct network (WireFluid testnet)
   - Check wallet balance (should have WIRE)
   - Sign message for verification
   - POST /api/auth/connect-wallet with {email, address, signature}
   - Save wallet address in Supabase
   - Update GlobalAuthContext
   - Show success message

3. Network Validation:
   - Check if on WireFluid testnet
   - If wrong network, prompt to switch
   - Provide easy switch button
   - Show network details

4. Balance Check:
   - Show current WIRE balance
   - Warn if balance < 0.1 WIRE
   - Provide faucet link for testnet WIRE
   - Calculate remaining balance after purchases

Display:
- Wallet provider buttons
- Current balance
- Network indicator
- Address display (masked)
- Connect button

Error States:
- Wallet not installed (show link to install)
- Wrong network (show switch prompt)
- User rejected request (show retry option)
- Low balance warning
```

---

## 📋 PART 4: PAYMENT & BLOCKCHAIN INTEGRATION

### 4.1 Payment Verification System

**File:** `/frontend/lib/services/paymentVerification.service.ts`

```
Payment Verification Flow:

1. Pre-Payment Validation:
   - Check user balance >= amount
   - Verify wallet connected
   - Validate recipient address format
   - Check rate limits (per user, per minute)
   - Verify user email verified

2. Payment Initiation:
   - Generate payment record in Supabase
   - Create transaction with status: 'pending'
   - Record timestamp, user ID, amount, purpose
   - Assign unique transaction reference

3. Transaction Submission:
   - Send transaction via ethers.js
   - Get txHash immediately
   - Store txHash in Supabase
   - Show in-progress UI

4. Transaction Confirmation (via WireScan):
   - Poll WireScan API every 3 seconds
   - Verify transaction exists
   - Wait for 1-3 block confirmations
   - Timeout after 5 minutes
   - Get gas used, block number, timestamp
   - Update Supabase with confirmation data

5. Verification Checks:
   - [ ] Correct amount received
   - [ ] Correct recipient address
   - [ ] Valid transaction hash format
   - [ ] Transaction not reversed
   - [ ] No duplicate transactions (same amount, same time)

6. Post-Confirmation:
   - Update payment status: 'confirmed'
   - Trigger relevant callback (NFT mint, etc.)
   - Send receipt email
   - Log event in Supabase

WireScan Integration:
- Base URL: https://wiregate.io (or equivalent explorer)
- Monitor transaction with address and txHash
- Parse explorer HTML/API for confirmation status
- Alternative: Use blockchain RPC to get receipt

Rate Limiting:
- 5 purchases per user per hour
- 10 purchases per IP per minute
- 100 purchases per contract per minute
```

### 4.2 NFT Ticket Minting

**File:** `/frontend/lib/services/nftMinting.service.ts`

```
NFT Ticket Implementation:

Contract Details:
- Contract: PSLTicket.sol (already deployed)
- Network: WireFluid testnet
- ABI: Load from artifacts/

Minting Process:

1. Pre-Mint Validation:
   - User completed email auth
   - User connected wallet
   - Payment confirmed
   - User owns 0 tickets for this match (or has capacity)
   - Check rate limits

2. Metadata Generation:
   - ticketId: uuid()
   - matchId: from purchase
   - buyer: user wallet address
   - quantity: number of tickets
   - price: WIRE amount paid
   - purchaseDate: ISO timestamp
   - expiryDate: match date + 2 days
   - qrCode: unique code linked to receipt
   - venue: match venue
   - teams: [team1, team2]

3. QR Code Generation:
   - Content: { ticketId, matchId, buyerAddress, qrToken }
   - Generate with qrcode.react library
   - Render as SVG
   - Store data URI in Supabase
   - Create public URL for download

4. Contract Interaction:
   - Connect to contract with ethers.js
   - Call mint(to, metadata) function
   - Pass metadata as JSON string
   - Handle gas estimation
   - Request user signature
   - Submit transaction
   - Get txHash
   - Store in Supabase

5. Monitoring:
   - Poll blockchain for mint confirmation
   - Get NFT token ID from receipt
   - Store token ID in Supabase
   - Verify metadata on-chain

Metadata Storage: Store both on-chain and Supabase
- On-chain: Contract
- Supabase: ticket_nfts table with:
  - id, user_id, match_id, token_id, qr_code, tx_hash, status, etc.

Error Recovery:
- If transaction fails: Mark as failed, allow retry
- If mint fails but payment succeeded: Manual intervention alert
- If QR fails: Regenerate and update
```

### 4.3 WireScan Verification

**File:** `/frontend/lib/services/wirescan.service.ts`

```
WireScan Monitoring:

Purpose: Verify WIRE token transfer received

Implementation Options:
1. Using blockchain RPC directly:
   - Use ethers.js provider
   - Call getTransactionReceipt(txHash)
   - Parse receipt for confirmed status
   - Get block number and gas used

2. Using WireScan Explorer (if API available):
   - Call WireScan API with txHash
   - Get transaction details
   - Verify status: success/failed
   - Get address and amount

Code Structure:

async function verifyPaymentReceived(
  txHash: string,
  expectedAmount: string,
  expectedRecipient: string
): Promise<{
  confirmed: boolean,
  confirmations: number,
  blockNumber: number,
  gasUsed: string,
  timestamp: Date,
  explorerUrl: string,
  blockConfirmation: boolean
}>

Steps:
1. Get current block number
2. Get transaction receipt
3. Calculate confirmations
4. Verify amount in transaction (filter Transfer events)
5. Verify recipient
6. Return verification object
7. Store in Supabase

Polling Logic:
- Start immediately after txHash received
- Poll every 3 seconds for 5 minutes
- Mark as confirmed when: receipt !== null AND confirmations >= 1
- Return status immediately for UI feedback
- Continue background polling until 3+ confirmations
```

---

## 📋 PART 5: RECEIPT SYSTEM

### 5.1 Receipt Generation

**File:** `/frontend/components/TicketReceipt.tsx`

```
Receipt Display Component:

Data Required:
{
  receiptId: string (uuid)
  purchaseDate: ISO datetime
  userEmail: string
  walletAddress: string (masked)
  matchId: string
  team1: string
  team2: string
  venue: string
  matchDate: ISO datetime
  quantity: number
  unitPrice: { pkr: number, wire: number }
  totalPrice: { pkr: number, wire: number }
  paymentMethod: 'WIRE'
  transactionHash: string
  nftTokenId?: string
  qrCode: string (data URI)
  ticketIds: string[]
  status: 'success' | 'pending' | 'failed'
}

Layout Design (KittyPaws Theme):
```
┌─────────────────────────────────────┐
│  [LOGO] Cricket Ticket Receipt      │
├─────────────────────────────────────┤
│ Receipt #: RCP-2024-0001287         │
│ Date: April 15, 2024, 2:45 PM      │
├─────────────────────────────────────┤
│ BUYER INFORMATION                   │
│ Email: user@example.com             │
│ Wallet: 0x7f8a...9c1E              │
├─────────────────────────────────────┤
│ MATCH DETAILS                       │
│ Team1 vs Team2                      │
│ Venue: Stadium Name                 │
│ Date: April 20, 2024, 8:00 PM      │
│ Match Type: T20                     │
├─────────────────────────────────────┤
│ TICKET DETAILS                      │
│ Quantity: 2 tickets                 │
│ Unit Price: 2500 PKR (0.15 WIRE)   │
│ Total: 5000 PKR (0.3 WIRE)         │
├─────────────────────────────────────┤
│ [   QR CODE IMAGE   ]               │
│ Scan to verify ticket               │
│ Token ID: #1234                     │
├─────────────────────────────────────┤
│ BLOCKCHAIN VERIFICATION             │
│ Transaction: 0x3f8a...c9a2         │
│ Status: Confirmed                   │
│ Confirmations: 3                    │
│ Block: 1,234,567                    │
│ Gas Used: 125,000                   │
├─────────────────────────────────────┤
│ TICKET IDS (Scan to verify each)    │
│ • TKT-001-xk9s2j                   │
│ • TKT-002-mn3a8k                   │
├─────────────────────────────────────┤
│ [DOWNLOAD PDF] [PRINT] [SHARE]     │
└─────────────────────────────────────┘
```

Styling Requirements:
- Deep mauve/rose gradient header
- Serif font for official look
- Clear hierarchy with sections
- QR code centered and scannable
- Responsive mobile layout
- Print-friendly CSS
- Smooth animations on load
```

### 5.2 PDF Generation & Download

**File:** `/frontend/lib/services/receiptPDF.service.ts`

```
PDF Generation using react-pdf/renderer:

Features:
- Generate professional PDF
- Include all receipt data
- Embed QR code as image
- Format currency correctly
- Page breaks for multiple tickets
- Header and footer on each page
- Print optimization

Implementation:
1. Convert receipt component to PDF using react-pdf
2. Add logo and branding
3. Create separate page per ticket (if requested)
4. Include blockchain verification details
5. Add watermark: "Original downloaded from platform"
6. Generate download link
7. Auto-open print dialog option

Download Flow:
1. User clicks "Download Receipt"
2. Show loading spinner
3. Generate PDF in background
4. Create blob URL
5. Auto-download with filename: RCP-{receiptId}-{date}.pdf
6. Show success toast
7. Offer print option

Alternative: Using html2pdf
- If react-pdf/renderer too complex
- Use html2pdf library
- Convert HTML receipt to PDF
- Similar functionality

Filename Format: RCP-{userId}-{matchId}-{date}.pdf
Example: RCP-usr123-m456-2024-04-15.pdf
```

### 5.3 QR Code Implementation

**File:** `/frontend/lib/services/qrcode.service.ts`

```
QR Code Features:

Data Encoded in QR:
{
  v: 1,  // Version
  r: string,  // Receipt ID
  t: string,  // Ticket ID(s)
  m: string,  // Match ID
  b: string,  // Buyer address
  ts: number,  // Timestamp
  sig: string  // Signature for verification
}

Compressed format for smaller QR code

Generation Process:
1. Create data object
2. Sign data with backend private key
3. Compress JSON to string
4. Encode to base64
5. Generate QR code SVG
6. Set error correction level: H (30% recovery)

Storage:
- SVG data URI in Supabase
- URL endpoint for public access
- Versioning if QR needs update

Verification Flow:
1. User/staff scans QR code
2. Redirects to /verify-ticket?qr={encoded}
3. Backend decrypts and verifies signature
4. Check ticket hasn't been used twice
5. Return ticket info
6. Update usage timestamp
7. Mark as verified

QR Code UI:
- Display on receipt
- Include text: "Scan to verify ticket"
- Add small logo in center
- Make printable (clear contrast)
- Accessible size (min 2cm x 2cm)
```

---

## 📋 PART 6: PROFILE PAGE

### 6.1 User Profile Page

**File:** `/frontend/app/profile/page.tsx`

```
Profile Components:

1. Profile Header:
   - User avatar (from email service like Gravatar)
   - Email address
   - Wallet address (masked)
   - Account creation date
   - Account status badge

2. Account Settings Section:
   - Change password
   - Update email
   - 2FA toggle (future)
   - Account deletion link

3. Wallet Section:
   - Connected wallet address (full)
   - Current balance in WIRE
   - Network information
   - Disconnect button
   - Change wallet button (connect different)
   - Add multiple wallets (future)

4. Purchase History Section:
   - Table/list of all tickets purchased
   - Columns:
     - Receipt ID
     - Match (Team1 vs Team2)
     - Purchase Date
     - Quantity
     - Total Amount (PKR and WIRE)
     - Transaction Hash (link to WireScan)
     - NFT Token ID
     - Status (Confirmed, Pending, Failed)
     - Actions (View Receipt, Download Receipt)
   - Sorting: Date desc (newest first)
   - Filtering: By date range, by status, by match
   - Pagination: 10 items per page
   - Search: Find by match name or receipt ID

5. Tickets Section:
   - Show NFT tickets owned
   - Display ticket IDs
   - Match information
   - Use status (available, used, expired)
   - Transfer ticket option (future)
   - View QR code

6. Statistics Section:
   - Total tickets purchased
   - Total spent (PKR and WIRE)
   - Favorite team
   - Member since

Layout Design:
- Sidebar navigation (Account, Wallet, Purchases, Tickets)
- Main content area
- KittyPaws theme: mauve/rose gradients
- Smooth transitions between sections
- Mobile-responsive (stack sections)
```

### 6.2 Profile Components

**File:** `/frontend/components/profile/AccountSettings.tsx`
```
Features:
- Display email
- Change password form
- Update profile info
- Verification status
- 2FA setup (show as coming soon)
- Account deletion warning
```

**File:** `/frontend/components/profile/WalletSection.tsx`
```
Features:
- Show connected wallet
- Display balance with refresh
- Network indicator
- Disconnect button (confirm)
- Add wallet button
- Wallet history (past connected wallets)
```

**File:** `/frontend/components/profile/PurchaseHistory.tsx`
```
Features:
- Table with all purchases
- Sort by date, amount, status
- Filter options
- Search functionality
- Pagination
- View/Download receipt
- View transaction on WireScan
- Show NFT status
```

**File:** `/frontend/components/profile/TicketInventory.tsx`
```
Features:
- Show all owned NFT tickets
- Display ticket metadata
- Show QR code
- Check ticket validity
- Transfer option (future)
```

---

## 📋 PART 7: SECURITY IMPLEMENTATION

### 7.1 Frontend Security Layer

```
Security Measures:

1. Authentication:
   - JWT stored in httpOnly cookies (not localStorage)
   - CSRF tokens for state-changing requests
   - Secure password hashing (bcrypt, 12+ rounds)
   - Password strength requirements enforced
   - Session timeout (30 minutes) with warning

2. Wallet Security:
   - Never store private keys (client-side)
   - Sign messages with wallet, not keys
   - Verify signatures server-side only
   - Display unmasked address only on user request
   - Warn before connecting to new network
   - Validate contract addresses

3. Transaction Security:
   - Confirm before sending > 0.1 WIRE
   - Show recipient address clearly
   - Prevent transaction replay attacks
   - Nonce management per user
   - Transaction hash verification
   - Check WireScan for confirmation

4. Data Security:
   - Input validation on all forms
   - Sanitize user inputs (XSS prevention)
   - HTTPS only (force redirect)
   - Content Security Policy headers
   - No sensitive data in localStorage
   - Encryption for sensitive data at rest

5. Rate Limiting:
   - 5 login attempts per IP per 15 min
   - 10 payment requests per user per hour
   - 3 registration attempts per IP per hour
   - API endpoint rate limits
   - DDoS protection via CDN

6. Monitoring:
   - Log all payment attempts
   - Alert on suspicious activity
   - Flag failed payments
   - Monitor wallet interactions
   - Track IP changes
   - Alert on multiple failed logins
```

### 7.2 Backend Security Layer

**File:** `/frontend/app/api/auth/register/route.ts`
```
Validation:
- Email format and uniqueness
- Password strength (12+ chars, mixed case, numbers, symbols)
- Rate limit per IP
- Input sanitization
- No script injection

Processing:
- Hash password with bcrypt (12 rounds)
- Generate salt per user
- Create verification token
- Send verification email
- Store encrypted in Supabase
- No plain text passwords anywhere

Response:
- Return only necessary data
- Never expose password hash
- Include verification pending message
- Provide resend link
```

**File:** `/frontend/app/api/auth/login/route.ts`
```
Validation:
- Email exists
- Password matches (bcrypt verify)
- Rate limiting by IP
- Account not locked
- Email verified

Security:
- Compare hashes securely
- Lock account after 5 failed attempts (15 min)
- Log login attempts
- Alert on suspicious patterns
- Invalidate old sessions

Response:
- Issue JWT token (15 min expiry)
- Return refresh token (7 days, httpOnly cookie)
- Include user data (id, email, wallet)
- Never expose password
```

**File:** `/frontend/app/api/blockchain/payment/verify/route.ts`
```
Payment Verification:

Checks:
1. User authenticated (JWT valid)
2. Payment record exists in database
3. Transaction hash format valid
4. Transaction confirmed on blockchain
5. Amount matches database record
6. Recipient address matches contract
7. No duplicate payment (same tx within last hour)
8. User balance correct before tx
9. User balance correct after tx
10. Payment not already verified

Verification Steps:
1. Get transaction receipt from RPC
2. Parse transaction details
3. Decode input data
4. Verify contract function call
5. Check event logs for Transfer
6. Confirm amount and recipient
7. Get block confirmations
8. Update database status
9. Trigger NFT minting callback
10. Send notification to user

Security Checks:
- Can't verify same tx twice
- Can't verify tx for different user
- Verify timestamp (same day only)
- Check gas limits reasonable
- Verify RPC response matches database
```

**File:** `/frontend/app/api/blockchain/nft/mint/route.ts`
```
NFT Minting:

Prerequisites:
1. User authenticated
2. Payment verified and confirmed
3. Metadata generated
4. QR code created and stored
5. Database record created

Validation:
- User owns contract call
- Metadata format valid
- Contract address correct
- Network correct
- Not already minted (check DB)
- User has capacity

Minting:
1. Build contract call data
2. Set from address (backend wallet)
3. Estimate gas
4. Create transaction
5. Sign with contract wallet (backend only)
6. Submit to RPC
7. Get txHash immediately
8. Store in DB with pending status
9. Return txHash to user

Monitoring:
- Poll for confirmation
- Update status when confirmed
- Extract token ID from receipt
- Store token ID in DB
- If fails: Notify user, refund logic

Error Handling:
- Insufficient gas: Retry with higher limit
- Contract error: Log and notify admin
- Network error: Retry with backoff
- Timeout: Queue for retry
```

### 7.3 Database Security (Supabase)

```
Tables Structure:

users:
- id (uuid, pk)
- email (text, unique, indexed)
- password_hash (text, bcrypt)
- full_name (text)
- phone (text)
- wallet_address (text, unique, nullable)
- email_verified (boolean)
- created_at (timestamp)
- updated_at (timestamp)
- last_login (timestamp)
- failed_login_attempts (int)
- account_locked_until (timestamp)

payments:
- id (uuid, pk)
- user_id (uuid, fk)
- match_id (text)
- amount_wire (decimal)
- amount_pkr (decimal)
- purpose (text: 'ticket', 'donation', 'tip')
- tx_hash (text, unique, indexed)
- status (text: 'pending', 'confirmed', 'failed')
- confirmations (int)
- gas_used (text)
- block_number (int)
- created_at (timestamp)
- confirmed_at (timestamp)
- metadata (jsonb)

nft_tickets:
- id (uuid, pk)
- user_id (uuid, fk)
- payment_id (uuid, fk)
- match_id (text)
- token_id (text, unique, nullable)
- quantity (int)
- qr_code (text, URL)
- qr_code_secure_token (text)
- tx_hash (text)
- status (text: 'minting', 'minted', 'failed')
- mint_confirmed_at (timestamp)
- created_at (timestamp)

receipts:
- id (uuid, pk)
- user_id (uuid, fk)
- payment_id (uuid, fk)
- nft_ticket_id (uuid, fk)
- receipt_number (text, unique)
- download_count (int)
- created_at (timestamp)

Row Level Security (RLS):
- Users can only view own records
- Users can only edit own profiles
- Payment records tied to authenticated user
- Receipts accessible only by owner or admin

Indexes:
- users.email
- users.wallet_address
- payments.user_id
- payments.tx_hash
- payments.created_at
- nft_tickets.user_id
- nft_tickets.match_id
- nft_tickets.token_id
- receipts.user_id
- receipts.created_at

Encryption:
- Wallet addresses encrypted in transit (HTTPS)
- Password hashes never logged
- API keys stored in environment (never in code)
- Sensitive metadata encrypted field-level (optional)
```

---

## 📋 PART 8: ERROR HANDLING & RECOVERY

### 8.1 Payment Error Scenarios

```
Scenario: User Disconnects Wallet During Payment
- [ ] Detect disconnection immediately
- [ ] Pause any pending transactions
- [ ] Show error: "Wallet disconnected"
- [ ] Offer to reconnect
- [ ] If failed: Show refund process
- [ ] Allow retry once reconnected

Scenario: RPC is Down
- [ ] Detect RPC unavailability
- [ ] Show timeout message
- [ ] Offer retry with exponential backoff
- [ ] Queue transaction for retry
- [ ] Show admin support link
- [ ] Eventually timeout (5 min)

Scenario: Transaction Pending > 5 Minutes
- [ ] Alert user to long wait
- [ ] Show transaction on explorer
- [ ] Offer to check in 5 more minutes
- [ ] Allow abort and retry
- [ ] Store pending state
- [ ] Check balance after abort

Scenario: NFT Minting Fails
- [ ] Payment confirmed
- [ ] User has balance
- [ ] NFT mint fails
- [ ] Mark as 'failed' in DB
- [ ] Escalate to admin
- [ ] Offer manual ticket issuance
- [ ] Prepare refund (if requested)

Scenario: User Invalid Address Format
- [ ] Validate before send
- [ ] Show clear error message
- [ ] Suggest correct format
- [ ] Don't send transaction
- [ ] Allow to fix and retry

Scenario: Insufficient Balance
- [ ] Check before payment
- [ ] Show current balance
- [ ] Calculate required amount
- [ ] Show deficit
- [ ] Link to faucet or buy crypto
- [ ] Block payment button

Scenario: Network Wrong
- [ ] Detect chain ID mismatch
- [ ] Show which network required
- [ ] Offer to switch network
- [ ] Show switch button in MetaMask
- [ ] Block payment until correct
```

### 8.2 UI Error States

```
Error Components:

PaymentError Component:
- Error icon animation
- Clear error message
- Suggested resolution
- Retry button
- Support contact link
- Error reference code (for support)

WalletError Component:
- Wallet icon
- Error description
- Action buttons (Connect, Switch Network, etc.)
- Status indicator
- Helpful link

AuthError Component:
- Message display
- Form reset option
- Back to login
- Support contact
```

---

## 📋 PART 9: TESTING & VALIDATION

### 9.1 End-to-End Testing Checklist

```
Authentication Flow:
- [ ] Register new user with email
- [ ] Verify email from link
- [ ] Login with correct credentials
- [ ] Login with incorrect password (3x locked)
- [ ] Forgot password flow
- [ ] Change password in profile

Wallet Connection:
- [ ] Connect wallet (MetaMask)
- [ ] Switch network to testnet
- [ ] Check balance display
- [ ] Disconnect wallet
- [ ] Reconnect wallet
- [ ] Verify state persists on reload
- [ ] Try to pay without wallet (blocked)

Payment Flow:
- [ ] View matches from CricAPI
- [ ] Select match and quantity
- [ ] See PKR price
- [ ] Click buy ticket
- [ ] See WIRE converted amount
- [ ] Approve transaction
- [ ] See pending status
- [ ] Payment confirmed
- [ ] Recieve receipt

Ticket & NFT:
- [ ] Verify NFT minted on blockchain
- [ ] Check token ID in database
- [ ] Scan QR code
- [ ] Verify ticket info
- [ ] Check ticket in profile
- [ ] Verify WireScan shows transaction

Receipt:
- [ ] Download receipt as PDF
- [ ] Print receipt
- [ ] Share receipt (optional)
- [ ] Verify all details correct
- [ ] QR code scans correctly

Profile Page:
- [ ] View account info
- [ ] View purchase history
- [ ] Filter by status/date
- [ ] View past tickets
- [ ] See wallet connected
- [ ] Change password
- [ ] View transaction hashes with links

Security:
- [ ] Can't access others' profiles
- [ ] Can't see others' payments
- [ ] Can't modify transaction data
- [ ] Session timeout works
- [ ] CSRF token validated
- [ ] XSS prevention (no script injection)
- [ ] Rate limiting works

Edge Cases:
- [ ] User purchases same match twice
- [ ] User purchases after NFT sells out (check match status)
- [ ] Payment succeeded but NFT failed
- [ ] User changes email mid-flow
- [ ] User loads profile while logged out
- [ ] QR code expires (set expiry)
- [ ] Multiple tabs open (sync state)
```

### 9.2 Security Testing

```
- [ ] Try SQL injection in login
- [ ] Try XSS in name field
- [ ] Try to modify payment amount in frontend
- [ ] Try to forge transaction hash
- [ ] Try to access others' receipts
- [ ] Try to use expired token
- [ ] Try CSRF attack (form without token)
- [ ] Check password hashes never logged
- [ ] Verify HTTPS enforced
- [ ] Check API keys not exposed
- [ ] Verify no default passwords
- [ ] Check rate limiting on endpoints
```

---

## 📋 PART 10: IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1)
- [ ] Set up GlobalAuthContext
- [ ] Create Auth pages (register, login, verify email)
- [ ] Create Wallet Connection page
- [ ] Update GlobalNavbar
- [ ] Set up Supabase tables

### Phase 2: Data Integration (Week 1-2)
- [ ] Integrate CricAPI
- [ ] Create useCricketMatches hook
- [ ] Update tickets page with real matches
- [ ] Add filtering and search

### Phase 3: Payment System (Week 2-3)
- [ ] Implement payment verification service
- [ ] Set up WireScan monitoring
- [ ] Create payment API endpoints
- [ ] Test payment flow end-to-end

### Phase 4: NFT System (Week 3)
- [ ] Implement NFT minting service
- [ ] Create QR code generation
- [ ] Test NFT minting on testnet
- [ ] Verify on blockchain

### Phase 5: Receipts (Week 3-4)
- [ ] Create Receipt component
- [ ] Implement PDF generation
- [ ] Add download functionality
- [ ] Make receipt downloadable

### Phase 6: Profile (Week 4)
- [ ] Create profile page layout
- [ ] Add purchase history table
- [ ] Add ticket inventory section
- [ ] Add account settings

### Phase 7: Security & Testing (Week 4-5)
- [ ] Implement all security measures
- [ ] Run security testing checklist
- [ ] Fix vulnerabilities
- [ ] End-to-end testing

### Phase 8: Polish & Deploy (Week 5)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Mobile testing
- [ ] Deployment to production

---

## 🔗 Key Technologies

```
Frontend:
- Next.js 13+ (React)
- TypeScript
- ethers.js (blockchain)
- WalletConnect / MetaMask
- Supabase (auth & DB)
- Tailwind CSS
- react-pdf (PDF generation)
- qrcode.react (QR codes)
- axios (HTTP)
- zustand (state management)
- react-toastify (notifications)

Backend:
- Next.js API routes
- Supabase PostgreSQL
- bcrypt (password hashing)
- JWT (tokens)
- ethers.js (blockchain)
- node-fetch (API calls)

Blockchain:
- WireFluid testnet
- PSLTicket.sol contract
- ethers.js provider
- WireScan explorer

External APIs:
- CricAPI (cricket data)
- WireScan (transaction verification)
- Gravatar (avatars)
```

---

## 📞 Support & Escalation

```
For User Issues:
- Email: support@cricketplatform.com
- In-app help: /help page
- FAQ: /faq page
- Contact form with category selection

For Payment Issues:
- Check WireScan explorer
- Verify wallet balance
- Check network configuration
- Contact blockchain support

For Technical Issues:
- Check server logs
- Verify API status
- Check blockchain RPC
- Escalate to dev team

For Bug Reports:
- Screenshot + error code
- Reproduce steps
- Browser/wallet version
- Network details
```

---

## ✅ Final Verification Checklist

Before marking complete:
- [ ] All auth flows working
- [ ] Cricket data displaying correctly
- [ ] Payments succeeding on testnet
- [ ] NFTs minting successfully
- [ ] WireScan confirmation working
- [ ] Receipts generating properly
- [ ] Profile showing correct data
- [ ] Mobile responsive
- [ ] Security validated
- [ ] Error handling comprehensive
- [ ] Documentation complete
- [ ] Performance acceptable

---

**Document Version:** 1.0  
**Last Updated:** April 15, 2024  
**Status:** Ready for Implementation  
**Estimated Duration:** 5 weeks with full-time development
