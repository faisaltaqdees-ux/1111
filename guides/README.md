# PSL Pulse

> **The All-in-One Fan Impact Platform for PSL 2026 — Built on WireFluid Blockchain**

![Build Status](https://img.shields.io/badge/build-pass-brightgreen)
![Test Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)
![Lint Status](https://img.shields.io/badge/lint-pass-brightgreen)
![Security Review](https://img.shields.io/badge/security-passed-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## What is PSL Pulse?

PSL Pulse is a next-generation fan engagement dApp built for the PSL 2026 season. Fans can buy digital match tickets, support their favorite teams and academies by staking in funding pools, and tip players directly—all on the WireFluid blockchain. Every action is transparent and auditable, with live match data powering real-time rewards and impact badges.

**8 Teams. One Infinity Legacy.**

---

## Core Impact Pillars

| Pillar | Description |
|--------|-------------|
| 🌱 **Grassroots Development** | Fund the 8 franchise academies |
| 🤝 **Player Welfare** | Direct tipping mechanism for emerging players |
| 🎟️ **Fan Access & Collectibles** | PSLTicket NFTs for verifiable match access |
| ♾️ **The Infinity Legacy** | Top contributors etched on the digital Infinity Wall |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contracts** | Solidity ^0.8.20, OpenZeppelin (AccessControl, ReentrancyGuard, ERC-721) |
| **Blockchain** | WireFluid Testnet (Chain ID 92533, instant finality, ultra-low gas) |
| **Oracle Backend** | Node.js, Express, EventEmitter, ethers.js v6, WebSocket |
| **Frontend** | Next.js 14, React 18, Framer Motion, Tailwind CSS |
| **Wallet** | Wagmi v2, Viem, MetaMask/WalletConnect |
| **NFTs** | ERC-721 (ImpactBadge, PSLTicket), IPFS metadata |

---

## Project Structure

```
├── contracts/                  # Solidity smart contracts
│   ├── PSLImpactMarket.sol     # Main market: staking, tipping, pools, leaderboard
│   ├── ImpactBadge.sol         # ERC-721 impact badge NFTs
│   ├── PSLTicket.sol           # ERC-721 match ticket NFTs
│   ├── hardhat.config.js       # Hardhat compilation & deployment config
│   ├── scripts/deploy.js       # Full deployment & seeding script
│   ├── scripts/grant-admin.js  # Admin role & ownership transfer
│   └── test/                   # Contract test suite
├── frontend/                   # Next.js frontend
│   ├── src/pages/              # Page routes (/, /matches, /match/[id], /impact, /profile, /admin, /leaderboard)
│   ├── src/components/         # React components (GlassStadium, InfinityWall, PitchMode, etc.)
│   ├── src/lib/                # Utilities (wagmi, contract, teamBranding, config)
│   ├── src/hooks/              # Custom React hooks
│   └── src/styles/             # Tailwind CSS globals
├── oracle/                     # Pulse Oracle backend
│   ├── server.js               # Express + WebSocket server
│   ├── lib/pulseOracle.js      # Real-time event streamer engine
│   ├── lib/liveEngine.js       # Cricbuzz data fetcher/cacher
│   ├── lib/contract.js         # Contract ABIs for backend
│   ├── routes/                 # REST API routes (events, live)
│   └── scripts/                # Smoke tests
├── scripts/                    # Utility scripts
│   ├── demo-health-check.js    # Pre-demo health verification
│   └── cleanup.js              # Build artifact cleanup
├── docs/                       # Documentation
│   ├── data-flow.mmd           # Mermaid data flow diagram
│   └── judging-pillar-matrix.md # Judging criteria mapping
├── ARCHIVE_BLUEPRINT.md        # Master blueprint (all requirements)
├── CODEBASE_FILEMAP.md         # File index with metadata
└── DEMO_SCRIPT.md              # Step-by-step demo script
```

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- MetaMask or WalletConnect-compatible wallet

### 1. Install Dependencies

```bash
# Frontend
cd frontend && npm install

# Oracle
cd oracle && npm install

# Contracts
cd contracts && npm install
```

### 2. Environment Setup

Create `.env.local` at the project root:

```env
NEXT_PUBLIC_MARKET_ADDRESS=0x...
NEXT_PUBLIC_BADGE_ADDRESS=0x...
NEXT_PUBLIC_TICKET_ADDRESS=0x...
NEXT_PUBLIC_WIREFLUID_RPC=https://evm.wirefluid.com
NEXT_PUBLIC_WIREFLUID_EXPLORER=https://wirefluidscan.com
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
DEPLOYER_PRIVATE_KEY=0x...
```

### 3. Deploy Contracts

```bash
cd contracts
npx hardhat run scripts/deploy.js --network wirefluid
```

### 4. Run Frontend

```bash
cd frontend
npm run dev
```

### 5. Run Oracle (optional, for live data)

```bash
cd oracle
npm start
```

---

## Smart Contract Security

| Measure | Implementation |
|---------|----------------|
| Reentrancy Protection | OpenZeppelin `ReentrancyGuard` on all payable functions |
| Role-Based Access Control | `AccessControl` with `ORACLE_ROLE`, `ADMIN_ROLE`, `DEFAULT_ADMIN_ROLE` |
| ERC-721 Standard | Full OpenZeppelin ERC721 + ERC721URIStorage compliance |
| Minter Gating | `MINTER_ROLE` required for badge/ticket minting |
| Input Validation | Match ID bounds, tier enum validation, zero-address checks |
| Event Emission | Indexed events for all state changes |
| On-Chain Auditability | All transactions verifiable on WireFluidScan |

---

## Gas Efficiency

| Optimization | Impact |
|-------------|--------|
| `external` over `public` | Avoids ABI encoding overhead |
| `seedMatches()` batch | Seed all 44 matches in one tx |
| `logBatchEvents()` ≤25/batch | Amortize base tx cost |
| Storage packing | Pack status enum + timestamps into single slots |
| Event indexing | Efficient off-chain filtering |
| Pre-flight `estimateGas` | Prevent failed transactions |

---

## WireFluid Network

| Field | Value |
|-------|-------|
| Chain ID | 92533 |
| RPC | https://evm.wirefluid.com |
| WebSocket | wss://ws.wirefluid.com |
| Explorer | https://wirefluidscan.com |
| Currency | WIRE (18 decimals) |
| Block Time | Sub-second |
| Gas Cost | ~0.0003 WIRE per tx |

---

## Demo

Run the pre-demo health check:

```bash
node scripts/demo-health-check.js
```

Follow the step-by-step demo script in [DEMO_SCRIPT.md](./DEMO_SCRIPT.md).

See the [Judging Pillar Matrix](./docs/judging-pillar-matrix.md) for how each feature maps to hackathon judging criteria.

---

## License

MIT
