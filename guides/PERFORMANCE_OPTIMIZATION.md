# Performance Optimization

**Code splitting, memoization, bundle size, database queries** — Measuring and improving speed

---

## Core Principle

Performance is part of security: Slow app → User frustrated → User clicks multiple times → Double-submit attacks succeed.

**Key Metrics**:
- **FCP**: First Contentful Paint (< 1s) — When user sees something
- **LCP**: Largest Contentful Paint (< 2.5s) — When main content visible
- **CLS**: Cumulative Layout Shift (< 0.1) — How much layout jumps around
- **Memory**: Peak memory usage (< 100MB) — Browser doesn't crash
- **Bundle**: Total JS size (< 500KB gzipped) — Fast download

---

## Optimization 1: Code Splitting & Lazy Loading

### What It Is

```
Without splitting:
  app.js (5MB) loaded on page load
  User waits 3 seconds before any page loads
  
With splitting:
  landing.js (50KB) loads immediately
  pool.js loads only when user navigates to /pool
  User sees landing in 0.3s
```

### Implementation: Next.js Dynamic Imports

#### Before (All Components Loaded)

```javascript
// pages/_app.js
import PoolCard from '../components/PoolCard';
import InfinityWall from '../components/InfinityWall';
import MatchCenter from '../components/MatchCenter';

// ALL components loaded even if user never visits /pool
// Bundle size: 150KB
```

#### After (Lazy Load)

```javascript
// pages/_app.js
import dynamic from 'next/dynamic';

const PoolCard = dynamic(() => import('../components/PoolCard'), {
  loading: () => <div className="animate-pulse">Loading pool...</div>,
});

const InfinityWall = dynamic(() => import('../components/InfinityWall'), {
  loading: () => <div className="animate-pulse">Loading leaderboard...</div>,
});

const MatchCenter = dynamic(() => import('../components/MatchCenter'), {
  loading: () => <div className="animate-pulse">Loading matches...</div>,
});
```

**Result**:
- Landing page: 25KB (fast load)
- When user navigates to /pool: +75KB downloaded (cached after)
- Total: Same 150KB, but spread across navigation

### File Structure for Splitting

```
src/
  ├─ components/
  │   ├─ ConnectWallet.jsx (1KB) - Always load
  │   ├─ PoolCard.jsx (40KB) - Lazy load
  │   ├─ InfinityWall.jsx (35KB) - Lazy load
  │   ├─ MatchCenter.jsx (30KB) - Lazy load
  │   ├─ Navigation.jsx (2KB) - Always load
  │
  ├─ pages/
  │   ├─ index.js (2KB) - Landing (lightweight)
  │   ├─ pool/[id].js (5KB) - Pool detail page (loads PoolCard dynamically)
  │   ├─ matches.js (3KB) - Matches page (loads MatchCenter dynamically)
  │   ├─ leaderboard.js (2KB) - Leaderboard page (loads InfinityWall dynamically)
```

---

## Optimization 2: Memoization & Caching

### What It Is

```
Without memoization:
  User types in amount field
  Parent component re-renders
  All children re-render
  Gas estimate logic runs 500x per keystroke
  
With memoization:
  Gas estimate logic cached if deps didn't change
  Runs once per unique amount, not 500x
  50x faster interaction
```

### useMemo Implementation

```javascript
// PoolCard.jsx
// ❌ WITHOUT useMemo (recalculates every render)
function PoolCard() {
  const leaderboardData = leaderboard
    .map(entry => ({
      ...entry,
      rank: leaderboard.indexOf(entry) + 1 // Expensive
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
  
  // Calculation happens every keystroke in amount field
  // 500 calculations per 5 seconds = 100 calc/sec
}

// ✅ WITH useMemo (caches result)
const leaderboardData = useMemo(() => {
  return leaderboard
    .map(entry => ({
      ...entry,
      rank: leaderboard.indexOf(entry) + 1
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
}, [leaderboard]); // Only recalculate if leaderboard changes

// Calculation happens ONCE per unique leaderboard
// 1 calculation per 3 second block = 0.33 calc/sec
// 300x improvement!
```

### useCallback Implementation

```javascript
// ❌ WITHOUT useCallback (new reference every render)
const handleStake = () => {
  executeStake();
};

<button onClick={handleStake}>Stake</button>

// Every render: new handleStake function
// Button re-renders (different click handler reference)
// Animation re-triggers (CSS thinks it's a new button)

// ✅ WITH useCallback (stable reference)
const handleStake = useCallback(() => {
  executeStake();
}, [executeStake]);

<button onClick={handleStake}>Stake</button>

// Across renders: same handleStake function
// Button doesn't re-render (same handler)
// Animation is smooth
```

### Where to Apply useMemo

| Data | Benefit | Worth It? |
|------|---------|-----------|
| Calculated leaderboard rankings | Sorting 100 entries every render | Yes |
| Formatted dates (e.g., "2 hours ago") | Simple string operation | Maybe |
| Validation error string | Complex multi-step logic | Yes |
| Component style object | Simple {color: 'red'} | No (too simple) |
| API response after mapping | Large data transformation | Yes |

---

## Optimization 3: Bundle Size Analysis

### Measuring Bundle Size

```bash
# Generate bundle report
npm run build
# Outputs: Build info + bundle analysis

# Analyze what's in the bundle
npm install --save-dev webpack-bundle-analyzer
npm run analyze
# Opens interactive visualization
```

### Typical PSL Pulse Bundle

```
Total: 450KB (gzipped)
├─ Framer Motion (40KB) - Animations
├─ Wagmi + Viem (80KB) - Web3 stack
├─ Next.js (50KB) - Framework
├─ React (40KB) - React itself
├─ Tailwind CSS (25KB) - Styles
├─ App Code (90KB) - Our code
│  ├─ PoolCard (35KB)
│  ├─ InfinityWall (30KB)
│  ├─ MatchCenter (25KB)
│
└─ Other (85KB) - Dependencies
```

### Reducing Bundle Size

#### 1. Tree-Shaking (Remove Unused Code)

```javascript
// ❌ WASTEFUL: Importing entire lodash library
import _ from 'lodash';
const debounce = _.debounce(func, 500);
// Adds 70KB to bundle (entire library)

// ✅ CORRECT: Import only what you need
import debounce from 'lodash/debounce';
// Adds 5KB (just debounce function)
```

#### 2. Dynamic Imports

```javascript
// ❌ WASTEFUL: Always load Framer Motion (40KB)
import { motion } from 'framer-motion';

// ✅ BETTER: Load only on pool page
const MotionComponents = dynamic(() => import('./MotionComponents'), {
  ssr: false // Don't server-render animations
});
```

#### 3. CSS Purging

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}'
  ]
};

// Tailwind scans these files, removes unused CSS
// Result: 25KB → 8KB CSS output (60% reduction)
```

---

## Optimization 4: Database Queries

### What It Is

```
Each blockchain read = ~100-500ms network round-trip
Multiple reads = additive latency

Without optimization:
  1. Fetch pool data (200ms)
  2. Fetch user stakes (200ms)
  3. Fetch leaderboard (200ms)
  Total: 600ms

With optimization:
  1. Fetch all three in parallel (200ms)
  Total: 200ms
```

### Parallel Queries

```javascript
// ❌ SLOW: Sequential queries
const { data: poolData } = useReadContract({
  functionName: "getPool",
  args: [matchId, pillarId]
});

const { data: userStakes } = useReadContract({
  functionName: "getUserStakes",
  args: [address],
  enabled: !!poolData // Wait for poolData first!
});

// ✅ FAST: Parallel queries
const { data: poolData } = useReadContract({
  functionName: "getPool",
  args: [matchId, pillarId],
  enabled: !!matchId && !!pillarId // Enable immediately
});

const { data: userStakes } = useReadContract({
  functionName: "getUserStakes",
  args: [address],
  enabled: !!address // Don't wait for poolData
});

// Both fetch simultaneously
```

### Batching Queries

```javascript
// ❌ INEFFICIENT: 4 separate contract calls
for (let pillarId = 0; pillarId < 4; pillarId++) {
  const pool = await contract.getPool(matchId, pillarId);
  // Network round-trip per pillar = 4 round-trips
}

// ✅ EFFICIENT: 1 batched call
const pools = await contract.getPoolBatch(matchId);
// 1 network round-trip, returns all 4 pools

// OR: Use multicall (Viem feature)
import { multicall } from 'viem';

const results = await publicClient.multicall({
  contracts: [
    { functionName: 'getPool', args: [matchId, 0] },
    { functionName: 'getPool', args: [matchId, 1] },
    { functionName: 'getPool', args: [matchId, 2] },
    { functionName: 'getPool', args: [matchId, 3] }
  ]
});
// All in 1 request
```

---

## Optimization 5: Rendering Performance

### Virtual Scrolling for Large Lists

```javascript
// ❌ SLOW: Render all 1000 leaderboard entries at once
function FullLeaderboard(.leaderboarditems) {
  return (
    <div>
      {items.map((item, i) => (
        <LeaderboardRow key={i} item={item} />
      ))}
    </div>
  );
}
// Renders 1000 DOM nodes = janky scrolling

// ✅ FAST: Virtual scroll (only render visible + buffer)
import { FixedSizeList } from 'react-window';

function VirtualleaderboarditiesList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <LeaderboardRow item={items[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </FixedSizeList>
  );
}
// Renders only 15 visible rows + 5 buffer = 20 DOM nodes
// Smooth 60fps scrolling
```

### Debouncing User Input

```javascript
// ❌ SLOW: Run gas estimate on every keystroke
const handleAmountChange = (e) => {
  setAmount(e.target.value);
  runGasEstimate(); // Called 10 times per second while typing
};

// ✅ FAST: Debounce to 500ms
const debouncedEstimate = useCallback(
  debounce((amount) => {
    runGasEstimate(amount);
  }, 500),
  []
);

const handleAmountChange = (e) => {
  setAmount(e.target.value);
  debouncedEstimate(e.target.value); // Waits 500ms after typing stops
};
```

---

## Optimization 6: Image Optimization

### What It Is

```
Unoptimized image (team logo): 2MB
Optimized image: 50KB
Savings: 97.5% reduction
```

### Implementation: Next.js Image Component

```javascript
// ❌ HTML IMAGE (NOT optimized)
<img src="/team-logos/karachi.png" alt="Karachi Kings" />
// Loads full resolution, no lazy loading, no format optimization

// ✅ NEXT.JS IMAGE (optimized)
import Image from 'next/image';

<Image
  src="/team-logos/karachi.png"
  alt="Karachi Kings"
  width={100}
  height={100}
  loading="lazy" // Only load when visible
  quality={75} // Compress to 75% quality
/>

// Next.js automatically:
// 1. Converts to WebP (better format)
// 2. Creates multiple sizes for responsive design
// 3. Lazy loads below fold
// 4. Compresses
// Result: 2MB → 50KB
```

---

## Optimization 7: Network Performance

### CDN & Caching Headers

```javascript
// next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/images/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000', // Cache for 1 year
        }
      ]
    },
    {
      source: '/api/*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=60', // Cache API for 60 seconds
        }
      ]
    }
  ]
};
```

**Impact**:
- First load: 500KB (download all)
- Second load: 50KB (images cached, just fetch new data)

### Gzip Compression

```javascript
// next.config.js
module.exports = {
  compress: true // Default true, enables gzip
};

// Results:
// Uncompressed: 450KB
// Gzipped: 120KB
// Savings: 73%
```

---

## Optimization 8: Smart Caching

### What to Cache & How Long

| Data | Cache Duration | Strategy |
|------|---|---|
| User stakes | 1 minute | Refetch on event |
| Pool data | 2 minutes | Refetch on event |
| Leaderboard | 0 seconds | Always fresh (events trigger refetch) |
| Team logos | 1 year | CDN + browser cache |
| Contract ABI | Indefinite | Build-time static |
| Gas price | 30 seconds | Fallback if stale |

### Implementation

```javascript
const { data: poolData, refetch } = useReadContract({
  // ...
  query: {
    staleTime: 120000, // 2 minutes
    cacheTime: 600000, // Keep in memory 10 min
    refetchInterval: false, // Don't auto-poll
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    refetchOnMount: true // Refetch when component mounts
  }
});
```

---

## Optimization 9: Monitoring Performance

### Measuring Performance

```javascript
// Use Web Vitals API
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log); // Cumulative Layout Shift
getFID(console.log); // First Input Delay
getFCP(console.log); // First Contentful Paint
getLCP(console.log); // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte

// Output when user leaves page:
// FCP: 0.8s ✓
// LCP: 2.1s ✓
// CLS: 0.05 ✓ (good)
// FID: 0.05s ✓
```

### Dashboard Setup

```javascript
// pages/_app.js
import { getCLS, getFID, getFCP, getLCP } from 'web-vitals';

function MyApp() {
  useEffect(() => {
    getCLS(metric => console.log('CLS', metric));
    getFID(metric => console.log('FID', metric));
    getFCP(metric => console.log('FCP', metric));
    getLCP(metric => console.log('LCP', metric));
  }, []);
}
```

**Target Metrics**:
- FCP < 1.8s
- LCP < 2.5s
- CLS < 0.1
- FID < 100ms

---

## Performance Checklist

- [ ] Code-split components (lazy load > 30KB components)
- [ ] Memoize expensive calculations (useMemo)
- [ ] Memoize callbacks (useCallback)
- [ ] Optimize images (Next.js Image, WebP)
- [ ] Batch database queries (multicall)
- [ ] Parallelize queries (not sequential)
- [ ] Debounce user input (500ms for gas estimate)
- [ ] Virtual scroll large lists (if > 100 items)
- [ ] Enable gzip compression
- [ ] Set cache headers (1 year for images, 60s for API)
- [ ] Monitor web vitals (FCP, LCP, CLS)
- [ ] Keep bundle < 500KB gzipped
- [ ] Test on 4G network (throttle in Chrome DevTools)

---

## Common Bottlenecks & Fixes

### Issue: Stake confirmation modal janky

```
Root cause: Animation re-triggers on each render
Fix: useCallback on modal handlers
Result: 60fps animations
```

### Issue: Leaderboard scrolling laggy

```
Root cause: Rendering 100 rows, all have animations
Fix: Virtual scrolling (render visible + buffer)
Result: Smooth 60fps scroll
```

### Issue: Page takes 5 seconds to load

```
Root cause: Loading all component JS upfront
Fix: Dynamic imports (lazy load on route change)
Result: 1 second initial load
```

### Issue: High memory usage (> 200MB)

```
Root cause: Event listeners not cleaning up
Fix: Return cleanup function in useEffect
Result: Memory stable at ~100MB
```

