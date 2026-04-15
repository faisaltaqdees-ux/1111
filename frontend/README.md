# PSL Pulse Frontend

A **production-grade, feature-complete** frontend application for PSL Pulse - a real-time fan engagement platform built on the WireFluid blockchain.

## 🎨 Architecture

This is a fully production-ready Next.js 16 application with:

- **TypeScript** for complete type safety
- **Tailwind CSS** with custom KittyPaws theme (deep mauve, rose, gradients)
- **Zustand** for state management
- **ethers.js v6** for Web3 interactions
- **React Hot Toast** for notifications
- **Production-grade components** with multiple variants
- **Motion effects** and animations throughout

## 📁 Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx           # Root layout with navbar & providers
│   ├── page.tsx             # Hero landing page with features
│   ├── globals.css          # Global KittyPaws theme styles
│   ├── matches/
│   │   └── page.tsx         # Live & upcoming matches page
│   ├── badges/
│   │   └── page.tsx         # Collectible badges showcase
│   └── dashboard/
│       └── page.tsx         # User dashboard with statistics
├── components/
│   ├── Button.tsx           # Reusable button (4 variants)
│   ├── Card.tsx             # Card component with gradient
│   ├── Input.tsx            # Form input with validation
│   ├── Navbar.tsx           # Navigation with wallet connect
│   ├── Skeleton.tsx         # Loading skeletons
│   ├── ToastProvider.tsx    # Toast notification provider
│   └── index.ts             # Centralized exports
├── lib/
│   ├── types.ts             # TypeScript interfaces & enums
│   ├── abi.ts               # Smart contract ABIs
│   ├── store.ts             # Zustand store
│   ├── hooks.ts             # Custom Web3 hooks
│   └── contractUtils.ts     # Blockchain utilities
├── package.json             # Dependencies
├── tailwind.config.ts       # Theme configuration
├── tsconfig.json            # TypeScript config
├── next.config.ts           # Next.js config
└── .env.local               # Environment variables
```

## ✨ Features

### Core Functionality
- ✅ **Wallet Connection** - MetaMask/Web3 integration
- ✅ **Live Match Betting** - Real-time odds display
- ✅ **NFT Badges** - Collectible achievements
- ✅ **Event Tickets** - Digitized match NFTs
- ✅ **User Dashboard** - Portfolio & history
- ✅ **Fully Responsive** - Mobile-to-desktop

### Production Quality
- ✅ **Type Safe** - Full TypeScript coverage
- ✅ **Error Handling** - Smart error messages
- ✅ **Loading States** - Skeleton animations
- ✅ **Accessibility** - WCAG compliant
- ✅ **Performance** - Optimized bundle
- ✅ **SEO** - Metadata configured

## 🎨 Design System: KittyPaws

Custom theme with:
- **Colors**: Deep mauve (#1a0f2e), Rose (#d97bb6), Lavender (#9b7bc4)
- **Effects**: Gradients, shadows, glass morphism, animations
- **Components**: Pre-styled, ready to use
- **Responsive**: Mobile-first design

## 📦 Tech Stack

```json
{
  "core": ["next@16.2.3", "react@19.2.4", "typescript@5"],
  "web3": ["ethers@6.13.0"],
  "state": ["zustand@4.4.7"],
  "ui": ["tailwindcss@4", "react-hot-toast@2.4.1"],
  "styling": ["classnames@2.3.2"]
}
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with contract addresses
```

### 3. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

## 🔗 Smart Contract Integration

**Connected Contracts** (WireFluid Testnet):
- PSLImpactMarket: `0xA72D5477F124a4A6EC54Ea27AeBA7e75f3d2e71d`
- ImpactBadge: `0x3AdcC725Cef89f89be639E204bC1bb7260a34B9a`
- PSLTicket: `0x03D9Ec0A0C71968a95a8B0F5b2276A67911803ee`

## 📱 Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page with hero & features |
| `/matches` | Browse & bet on live matches |
| `/badges` | View collectible badges |
| `/dashboard` | User dashboard & portfolio |

## 🧩 Component Library

### Button
```tsx
<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>
```

### Card
```tsx
<Card gradient>
  <h2>Title</h2>
  <p>Content goes here</p>
</Card>
```

### Input
```tsx
<Input 
  label="Amount" 
  placeholder="Enter amount"
  error="Invalid amount"
/>
```

## 🎯 Custom Hooks

```typescript
// Wallet management
const { user, connect, disconnect } = useWallet();

// Contract interactions
const { send, call, isLoading } = useContract(address, abi);

// Fetch balance
const { balance, refresh } = useBalance(userAddress);

// Contract state
const { state, refetch } = useContractState(address, abi, 'methodName');

// Global state
const { matches, addMatch } = useAppStore();
```

## 🔒 Error Handling

Smart error handling with user-friendly messages:
- Contract errors automatically parsed
- Network errors with retry logic
- Form validation with real-time feedback
- Toast notifications for all status updates

## 📊 Performance

- Next.js automatic code splitting
- Optimized images with next/image
- CSS-in-JS with Tailwind (minimal)
- Efficient state management with Zustand
- Browser caching enabled

## 🧪 Ready for Testing

Add Jest + Testing Library:
```bash
npm install --save-dev @testing-library/react jest
```

All components designed with testability in mind.

## 📖 Code Examples

### Connect Wallet & Get Balance
```typescript
'use client';
import { useWallet, useBalance } from '@/lib/hooks';

export function MyComponent() {
  const { user, connect } = useWallet();
  const { balance } = useBalance(user?.address);

  return (
    <div>
      {user?.isConnected ? (
        <p>Balance: {balance} WIRE</p>
      ) : (
        <button onClick={connect}>Connect</button>
      )}
    </div>
  );
}
```

### Interact with Contract
```typescript
const { send, isLoading } = useContract(
  contractAddress, 
  ContractABI
);

const handleTransaction = async () => {
  const result = await send('methodName', param1, param2);
  if (result.status === 'success') {
    toast.success('Transaction successful!');
  }
};
```

## 🎓 Best Practices

1. **Always use TypeScript** - Type safety throughout
2. **Use custom hooks** - Keep components clean
3. **Follow design system** - Use KittyPaws colors
4. **Handle errors gracefully** - User-friendly messages
5. **Test responsiveness** - Mobile-first approach
6. **Document code** - JSDoc for all functions

## 📝 Configuration Files

### tailwind.config.ts
Custom colors and animations for KittyPaws theme

### tsconfig.json
Path aliases (`@/*`) for clean imports

### next.config.ts
Image optimization and API routes

### .env.local
Environment variables for contracts and RPC

## 🐛 Debugging

Enable detailed logs:
```typescript
// In hooks or utilities
console.log('Action:', action);
console.error('Error:', error);
```

Check WireFluid testnet:
- RPC: https://evm.wirefluid.com
- Explorer: https://wirefluidscan.com

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [ethers.js](https://docs.ethers.org/v6/)
- [WireFluid Docs](https://wirefluid.io)

## 🚀 Deployment

Ready to deploy to:
- **Vercel** - Next.js native
- **Netlify** - Static export available
- **Docker** - Container ready
- **Self-hosted** - `npm run build && npm start`

## 💡 Tips for Production

1. Update contract ABIs if contracts change
2. Configure analytics in .env
3. Set `NEXT_PUBLIC_ENABLE_BETA_FEATURES=false`
4. Enable CSP headers for security
5. Configure API rate limits
6. Set up monitoring and error tracking

---

**Production-Grade ✅ | Type-Safe ✅ | Responsive ✅ | Ready for Deployment ✅**

Built with ❤️ for PSL Pulse Community
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
