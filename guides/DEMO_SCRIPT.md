# PSL PULSE — Demo Script

> **Ref:** ARCHIVE_BLUEPRINT.md §Demo-First, §Visual Wow, §Instant Clarity, §Showstopper, §Demo Resilience, §Pitch-Ready  
> **Ref:** CODEBASE_FILEMAP.md §Demo & Win Protocols, §DEMO_SCRIPT.md Protocol Update, L212  
> **Runtime:** ~5 minutes live demo · 2-minute pitch variant included  
> **Chain:** WireFluid Testnet (Chain ID 92533)

---

## Pre-Demo Checklist

Run **before every demo session** to ensure all services are live and contracts are funded.

```bash
# 1. Run the automated health check
node scripts/demo-health-check.js

# 2. Verify Oracle backend is running
curl http://localhost:3001/api/live/health

# 3. Verify frontend dev server
curl http://localhost:3000

# 4. Confirm MetaMask is on WireFluid Testnet (Chain ID 92533)
#    RPC: https://evm.wirefluid.com
#    Currency: WIRE

# 5. Ensure demo wallet has ≥5 WIRE for staking/tipping/minting
```

| Check | Command / Action | Expected Result |
|-------|-----------------|-----------------|
| Oracle health | `GET /api/live/health` | `{ "status": "ok", "mode": "LIVE" or "DEMO" }` |
| WebSocket | `node oracle/scripts/smoke-live-ws.js` | INIT handshake received, all checks pass |
| Frontend build | `npm run build` (in `frontend/`) | No errors |
| Wallet funded | Check MetaMask balance | ≥5 WIRE |
| Contracts deployed | Check WireFluidScan | PSLImpactMarket, ImpactBadge, PSLTicket verified |

---

## Act 1 — The Hook (0:00–0:30)

### 1.1 Open the Landing Page

**Action:** Navigate to `http://localhost:3000`

**What judges see:**
- Dark gradient background with animated WireFluid network lines pulsing in the PSL brand palette
- Team logo centered with a neon accent glow ring (soft blur, team-colored)
- **"PULSE"** text vertically and horizontally centered within the logo's bounding box
- Typewriter tagline cycling through:
  - *"8 Teams. One Infinity Legacy."*
  - *"Every Fan. Every Action. On-Chain."*
  - *"The Heartbeat of PSL 2026."*
- Glassmorphic "Explore Matches" and "Impact Hub" action buttons below
- Team name (e.g., "LAHORE QALANDARS") in neon accent below the buttons

**What to say:**
> "PSL just expanded to 8 teams for the first time — two brand-new franchises. PSL Pulse is the official fan engagement platform for this new era. Everything you're about to see is live on the WireFluid blockchain."

**Demo checklist:**
- [ ] Hero loads within 2 seconds
- [ ] Typewriter animation cycles smoothly
- [ ] Glow ring is visible and proportional
- [ ] Animated WireFluid network lines are subtle and performant

### 1.2 Scroll to "What is PSL Pulse?"

**Action:** Scroll down slowly until the paragraph section enters the center of the viewport.

**What judges see:**
- The paragraph text smoothly transitions from dim (#444) to full white (#fff) using a 600ms cubic-bezier ease-in-out fill animation
- The animation triggers when the section enters the middle 30% of the viewport
- Resets if the user scrolls away and returns

**What to say:**
> "Every interaction in PSL Pulse has a purpose — and the app explains its value in ten seconds or less."

**Demo checklist:**
- [ ] Scroll fill animation triggers cleanly
- [ ] No text truncation or overflow
- [ ] Animation resets on scroll-away

### 1.3 Show the Core Pillars Teaser

**Action:** Continue scrolling to the four Core Impact Pillars cards.

**What judges see:**
- Four glassmorphic cards with neon accents:
  1. **Grassroots Development** — Fund franchise academies
  2. **Player Welfare** — Direct tipping for emerging players
  3. **Fan Access & Collectibles** — NFT tickets and badges
  4. **The Infinity Legacy** — On-chain leaderboard for top contributors

**What to say:**
> "PSL Pulse is built on four Core Impact Pillars. Every WIRE spent goes toward one of these causes — and it's all auditable on-chain."

---

## Act 2 — Connect & Interact (0:30–1:30)

### 2.1 Connect Wallet

**Action:** Click the **"Connect Wallet"** button in the navbar.

**What judges see:**
- Glassmorphic modal slides in with connector options (MetaMask, WalletConnect)
- Pulse ripple animation on button click
- MetaMask popup → approve connection
- If on wrong network: auto-switch prompt to WireFluid Testnet (92533)
- After connection: navbar shows truncated address, account popover available

**What to say:**
> "One click to connect. If the user is on the wrong chain, we auto-prompt a switch to WireFluid — no confusion, no manual RPC entry."

**Demo checklist:**
- [ ] Modal opens with glassmorphic styling
- [ ] Pulse ripple fires on click
- [ ] Connection completes in <3 seconds
- [ ] Wrong-network auto-switch works

### 2.2 Show Account Popover

**Action:** Click the connected address in the navbar.

**What judges see:**
- Account popover with:
  - Full address (copyable)
  - WIRE balance
  - **"Copy Address"** button with checkmark feedback
  - **"View on Explorer"** link → opens WireFluidScan
  - **"Switch Network"** button
  - **"Disconnect"** button with confirmation
- All sub-buttons are fully functional, not stubs

**What to say:**
> "Full wallet management — copy, explore, switch, disconnect — all in a single popover with real-time balance."

**Demo checklist:**
- [ ] Copy address shows checkmark
- [ ] Explorer link opens WireFluidScan
- [ ] Disconnect fully resets state
- [ ] Balance updates in real time

---

## Act 3 — The Glassmorphic Stadium (1:30–2:30)

### 3.1 Navigate to Match Center

**Action:** Click **"Explore Matches"** or navigate to `/match/1`

**What judges see:**
- Match cards with team logos, names, venue, date
- Glassmorphic card styling with neon team accents
- Framer Motion Layout ID transition: card expands seamlessly into full Match Center

**What to say:**
> "This is the Glassmorphic Stadium — every match card is a portal. Watch this transition."

### 3.2 Show Live Match Data

**Action:** Open Match 1 (Lahore Qalandars vs. Hyderabad Houston Kingsmen at Gaddafi Stadium, March 26)

**What judges see:**
- Live scorecard powered by Cricbuzz via the Pulse Oracle
- Real-time event feed (sixes, wickets, boundaries)
- Fan heatmap overlay — glowing dots showing live staking/tipping activity
- Impact Sparks burst when a major event occurs (e.g., a six → confetti in team color)
- All data refreshes via WebSocket push (BATCH_RESULT events)

**What to say:**
> "Live cricket data streams through our Oracle, hits the blockchain, and shows up here in real time. Those sparks? That's a six — and the heatmap shows fans around the world reacting."

**Demo checklist:**
- [ ] Live scorecard updates in real time
- [ ] Fan heatmap glowing dots are visible
- [ ] Impact Sparks fire on events
- [ ] WebSocket reconnects on drop (Demo Resilience)

### 3.3 Stake to a Funding Pool

**Action:** Click **"Stake"** on the Grassroots Development pool.

**What judges see:**
- Stake modal with pool breakdown, contribution chart
- Pre-flight gas estimation (estimateGas) before confirmation
- Pulse ripple on stake button
- MetaMask transaction popup → confirm
- Pool balance updates in real time after tx confirmation
- "Transaction Confirmed" toast with WireFluidScan link

**What to say:**
> "Staking is a one-click action with pre-flight gas checks. Your contribution goes straight to the academy fund — and the pool updates on-chain instantly."

**Demo checklist:**
- [ ] Pre-flight gas estimation runs
- [ ] Pulse ripple fires on stake
- [ ] Pool balance updates after confirmation
- [ ] Explorer link in success toast

---

## Act 4 — Impact Tipping & The Infinity Wall (2:30–3:30)

### 4.1 Tip a Player

**Action:** Click **"Tip Player"** on a featured player card.

**What judges see:**
- Tip modal with player name, avatar, team
- Tip amount input (e.g., 0.1 WIRE)
- Pulse ripple on tip button
- MetaMask confirmation
- Player Welfare pillar contribution counter increments
- Impact Sparks on successful tip

**What to say:**
> "Direct tipping — no middlemen. The player's welfare fund gets it immediately, recorded on-chain forever."

**Demo checklist:**
- [ ] Tip modal renders correctly
- [ ] Transaction completes successfully
- [ ] Sparks fire on tip confirmation

### 4.2 Show the Infinity Wall

**Action:** Navigate to `/leaderboard` (or Impact Hub → Infinity Wall section)

**What judges see:**
- Horizontally or vertically scrolling wall of contributor avatars and names
- Soft glow parallax effect on scroll
- Top contributors have animated crowns/auras
- Real-time tip animation — when a tip lands, the contributor's entry glows and shifts position
- The recently tipped player's contributor entry (yours) is highlighted

**What to say:**
> "The Infinity Wall. Every contributor is here, ranked on-chain. Tip a player and watch your name rise in real time. This is your legacy in PSL's 8-team era."

**Demo checklist:**
- [ ] Infinity Wall renders with parallax glow
- [ ] Top contributors show animated crowns
- [ ] Recent tip animates into the wall
- [ ] Smooth scroll on all screen sizes

---

## Act 5 — NFT Minting & Badges (3:30–4:15)

### 5.1 Mint a PSLTicket NFT

**Action:** Navigate to the ticket minting flow (Match Center → "Buy Ticket").

**What judges see:**
- 4 seat tiers: General, Premium, VIP, Hospitality
- Each tier has distinct pricing and visual styling
- Pulse ripple on "Mint" button
- MetaMask confirmation
- Minting animation with confetti/sparks
- Ticket appears in user's Profile Locker Room

**What to say:**
> "Digital match tickets — ERC-721 NFTs on WireFluid. Choose your tier, mint in one click, and it shows up in your locker room as a collectible."

### 5.2 Show an ImpactBadge

**Action:** Navigate to `/profile` (Locker Room) to see earned badges.

**What judges see:**
- Impact Badges earned across the four Core Pillars
- Each badge shows: pillar, match, mint date, metadata URI
- Badges are ERC-721 NFTs with IPFS-backed metadata

**What to say:**
> "Impact Badges reward top contributors — one for each Core Pillar. These are permanent, on-chain proof of your impact."

**Demo checklist:**
- [ ] Ticket mint completes with animation
- [ ] Badge appears in profile with correct pillar
- [ ] Metadata loads from IPFS

---

## Act 6 — Resilience & Admin (4:15–4:45)

### 6.1 Show Demo Resilience

**Action:** (If safe to demo) Simulate an API failure via JudgeModePanel or by temporarily stopping the Oracle.

**What judges see:**
- GlassStadium shows fallback state with "Connection Degraded" message
- Last-known cached data still displays (stale cache fallback)
- "Retry" button is available and functional
- Error boundary wraps gracefully — no blank screen or crash
- Oracle auto-reconnects when service resumes

**What to say:**
> "What if the API goes down mid-match? We've got fallback states, cached data, and auto-reconnect. The app never crashes."

**Demo checklist:**
- [ ] Fallback state renders (not blank)
- [ ] Stale data is visible
- [ ] Retry button works
- [ ] Auto-reconnect restores live feed

### 6.2 Show Admin / Judge Mode

**Action:** Navigate to `/admin` or activate JudgeModePanel.

**What judges see:**
- Admin panel for injecting test events
- Batch event processing (≤25 events per batch)
- Gas estimation display
- Oracle mode switcher (LIVE ↔ DEMO ↔ REPLAY ↔ PAUSED)

**What to say:**
> "For judges and admins — inject events, switch Oracle modes, and see gas costs in real time. Full control over the demo."

---

## Act 7 — The Close (4:45–5:00)

### 7.1 Return to Landing Page

**Action:** Navigate back to `/`

**What judges see:**
- Full hero with team cycling, glow ring, typewriter tagline
- Smooth transitions throughout the entire demo

**What to say:**
> "PSL Pulse — built for 8 teams, 44 matches, and millions of fans. Every action on-chain. Every impact transparent. This is the future of fan engagement."

---

## 2-Minute Pitch Script (Condensed Variant)

> **[Ref: Blueprint Pitch-Ready Protocol — must open with 8-Team Expansion story]**

### 0:00–0:20 — The Story

> "PSL just expanded to 8 teams for the first time in history. Two new franchises — Hyderabad Houston Kingsmen and Pindiz. PSL Pulse is the official fan engagement platform for this new era. Built on WireFluid."

### 0:20–0:40 — The Platform

> "Four Core Impact Pillars: Grassroots academy funding, Player Welfare tipping, NFT tickets and badges, and The Infinity Wall — an on-chain leaderboard for top contributors. Every WIRE spent is auditable, transparent, and meaningful."

### 0:40–1:10 — The Tech

> "Real-time Oracle streaming live cricket data from Cricbuzz, batching Impact Events on-chain with gas-optimized batch processing. Glassmorphic Stadium with Framer Motion transitions. WebSocket push for zero-latency updates. Three production smart contracts — PSLImpactMarket, ImpactBadge, PSLTicket — all on WireFluid."

### 1:10–1:40 — The Demo

> *(Live: connect wallet, show auto-switch, stake to a pool, tip a player, show Infinity Wall update, show Impact Sparks)*

> "One click to connect, one click to stake, one click to tip. Watch the Infinity Wall update in real time. Those sparks? That's a six being recorded on-chain right now."

### 1:40–2:00 — Why We Win

> "PSL Pulse isn't just a dApp. It's infrastructure for the biggest expansion in Pakistan cricket history. Smart contract security, gas-efficient batching, demo resilience with fallback states, and visual polish that sets a new bar for sports dApps. Eight teams. One Infinity Legacy. This is PSL Pulse."

---

## Demo UI/UX Master Checklist

> **[Ref: Blueprint Demo-First Protocol, Filemap §DEMO_SCRIPT.md Protocol Update]**

### Visual & Animation Checks

- [ ] Pulse ripple fires on every major click (stake, tip, mint, connect)
- [ ] Live fan heatmap overlay is visible on Match Center
- [ ] Infinity Wall scrolls with parallax glow effect
- [ ] AR Trophy / Infinity Trophy 3D motif is visible and performant
- [ ] Impact Sparks fire on major events (6, wicket, tip)
- [ ] Animated WireFluid network lines pulse in hero background
- [ ] Typewriter tagline cycles smoothly without truncation
- [ ] Scroll-triggered text fill animation works cleanly
- [ ] Glassmorphic card transitions are seamless (Framer Layout)
- [ ] Neon glow ring around team logo is proportional and clean

### Resilience & Error Handling Checks

- [ ] Fallback states render on API failure (no blank screens)
- [ ] Stale cache data displays when Oracle is degraded
- [ ] Retry buttons are functional
- [ ] Error boundaries catch and display graceful messages
- [ ] WebSocket auto-reconnects after disconnection
- [ ] Wrong-network auto-switch prompt fires correctly

### Accessibility & Responsiveness Checks

- [ ] Mobile/responsive layout is correct on all screen sizes
- [ ] All text remains readable over logos and backgrounds
- [ ] Reduced motion preference is respected (animations disabled/slowed)
- [ ] High-contrast mode is supported
- [ ] All interactive elements are keyboard-navigable
- [ ] ARIA roles and labels are present on wallet controls

### On-Chain Action Checks

- [ ] Wallet connects and shows correct WIRE balance
- [ ] Stake transaction completes with pre-flight gas check
- [ ] Tip transaction completes with Impact Sparks
- [ ] NFT ticket mints successfully (ERC-721)
- [ ] Impact Badge appears with correct pillar metadata
- [ ] All transactions link to WireFluidScan explorer
- [ ] Pool balances update in real time after staking
- [ ] Leaderboard updates in real time after tipping

### Pitch Mode Checks

- [ ] Pitch Mode toggle or /pitch route activates guided auto-demo
- [ ] Non-essential UI is hidden in Pitch Mode
- [ ] Core flows are highlighted with animated overlays
- [ ] Demo completes within 2-minute pitch window

---

## Judging Pillar Matrix — Demo Alignment

| Judging Criterion | Feature Demoed | Technical Flex Shown | Demo Act |
|-------------------|---------------|---------------------|----------|
| Smart Contract Security | Infinity Wall | On-chain leaderboard, AccessControl, ReentrancyGuard | Act 4 |
| Gas Efficiency | Pulse Oracle | Batch event processing (≤25), storage packing, gas estimation | Act 3, 6 |
| Real-Time UX | Glassmorphic Stadium | Framer Motion Layout ID, zero-latency transitions, WebSocket push | Act 3 |
| Demo Resilience | Fallback States | Stale cache, error boundaries, auto-reconnect, retry buttons | Act 6 |
| Visual Polish | All Signature Effects | Pulse ripple, Impact Sparks, glow ring, glassmorphism, heatmap | Acts 1–5 |
| Community / Expansion | Infinity Wall + Pillars | PSL 8-team expansion, on-chain leaderboard, 4 Core Pillars | Acts 1, 4 |
| NFT Innovation | PSLTicket + ImpactBadge | ERC-721 on WireFluid, tiered tickets, pillar-based badges | Act 5 |
| Blockchain Choice | WireFluid Integration | Chain ID 92533, instant finality, low gas, auto-switch | Acts 2, 7 |

---

## Troubleshooting During Demo

| Issue | Immediate Fix |
|-------|--------------|
| Oracle not responding | Switch to DEMO mode: `POST /api/live/mapping` or use JudgeModePanel |
| WebSocket disconnected | App auto-reconnects; fallback to REST polling (`GET /api/live/:matchId` every 3-5s) |
| MetaMask not connecting | Clear MetaMask cache, refresh page, retry — ConnectWallet has retry logic |
| Wrong network | App auto-prompts chain switch; manual: MetaMask → Networks → Add WireFluid |
| Transaction stuck | Check gas price on WireFluidScan; increase gas via MetaMask "Speed Up" |
| Blank screen | Error boundary should catch; hard refresh (Ctrl+Shift+R) as last resort |
| Heatmap not showing | Ensure WebSocket is connected (check Oracle `/health`); fallback dots still render |
| Sparks not firing | Verify Oracle is pushing BATCH_RESULT events; check browser console for WS messages |

---

## Environment Quick Reference

| Item | Value |
|------|-------|
| Chain | WireFluid Testnet |
| Chain ID | 92533 |
| RPC | https://evm.wirefluid.com |
| WebSocket | wss://ws.wirefluid.com |
| Currency | WIRE (18 decimals) |
| Explorer | https://wirefluidscan.com |
| Oracle API | http://localhost:3001 |
| Frontend | http://localhost:3000 |
| Contracts | PSLImpactMarket, ImpactBadge, PSLTicket |
| Oracle Modes | LIVE, DEMO, REPLAY, PAUSED |

---

*PSL PULSE — 8 Teams. One Infinity Legacy. Every fan on-chain.*
