## WireFluid DApp - Wallet Connection Flow

### User Journey

#### 1. **Landing Page (`/`)**
- User sees full homepage
- NO account required
- Can browse without wallet

#### 2. **Connect Wallet (via MetaMask)**
```
User clicks "Get Started" or "Start Supporting Cricket"
    ↓
handleConnectWallet() triggered
    ↓
Calls user.connect() from useWallet() hook
    ↓
MetaMask popup appears
    ↓
User approves connection
    ↓
Wallet address stored in `user` state
    ↓
Navbar shows connected wallet address
    ↓
User can now perform transactions
```

#### 3. **Browse Tickets/Donate/Tip (Purchase Flow)**
```
User selects action (buy ticket, donate, tip player)
    ↓
Page/Modal component renders
    ↓
User confirms action
    ↓
Transaction sent via WireFluid RPC
    ↓ 
User approves in MetaMask
    ↓
Transaction confirmed on WireFluid testnet (Chain ID: 92533)
    ↓
Receipt shown to user
```

---

### Important Files

#### Wallet Management
- **`lib/hooks.ts`** - `useWallet()` hook
  - Provides: `user`, `connect()`, `isConnecting`
  - Manages MetaMask connection

#### State Management  
- **`lib/store.ts`** - Zustand store
  - Provides: `useAppStore()` for global state

#### Pages Using Wallet
- **`app/page.tsx`** - Landing page (check `user?.isConnected`)
- **`app/dashboard/page.tsx`** - Requires wallet
- **`app/browse/page.tsx`** - Optional wallet
- **`app/matches/page.tsx`** - Optional wallet

---

### Contract Interactions

All contract functions now use `user.address` (wallet address) instead of `user.id`:

```typescript
// Old (removed):
// sendTicket(userId, matchId, amount)

// New (wallet-based):
sendTicket(user.address, matchId, amount)
```

---

### Key Change: No Backend Needed

**Before:** Account system
- Email/password signup → Generate custodial wallet → Store on backend

**Now:** Pure DApp
- Connect MetaMask → Direct transaction signing → WireFluid blockchain
- All state is on-chain or in user's wallet
- No server-side auth or account management

---

### Testing Checklist

- [ ] Landing page loads without wallet
- [ ] "Get Started" button shows MetaMask popup
- [ ] Wallet connects successfully
- [ ] Navbar shows truncated wallet address
- [ ] Can navigate to dashboard
- [ ] Dashboard requires connected wallet
- [ ] Browse page works without wallet
- [ ] Transactions send correctly to WireFluid
- [ ] Balance updates after transactions
