# CricAPI Integration Guide

## Overview
CricAPI provides real-time cricket match data. This guide shows how to integrate it into your KittyPaws ticket system to display actual match schedules instead of mock data.

## API Documentation
- **CricAPI Website**: https://www.cricapi.com
- **API Endpoint**: `https://api.cricapi.com/v1/`
- **Free Tier**: 300 credits/month (30 API calls with 10 matches each)

## Step 1: Get API Key

1. Go to [cricapi.com](https://www.cricapi.com)
2. Click "Sign Up"
3. Create account (free)
4. Go to Dashboard → API Keys
5. Copy your API key
6. Add to `.env.local`:
```bash
NEXT_PUBLIC_CRICAPI_KEY=your_api_key_here
```

## Step 2: Available Endpoints

### List All Matches
```
GET /matches?apikey=YOUR_KEY
```

**Response:**
```json
{
  "status": "success",
  "info": {
    "oversCount": 50,
    "ballCount": 1,
    "runs": 5,
    "wickets": 0,
    "batsmanRuns": 230
  },
  "data": [
    {
      "id": "1235248",
      "name": "India vs Pakistan, ODI",
      "matchType": "ODI",
      "status": "completed",
      "venue": "Arun Jaitley Stadium, New Delhi",
      "date": "2026-04-15",
      "dateTimeGMT": "2026-04-15T09:30:00.000Z",
      "teams": ["India", "Pakistan"],
      "teamIds": [1, 2]
    }
  ]
}
```

### Get Match Info
```
GET /matchInfo?apikey=YOUR_KEY&id=MATCH_ID
```

**Response includes:**
- Match scores
- Player stats
- Venue details
- Match toss
- Match status

### Get Series Info
```
GET /series?apikey=YOUR_KEY
```

**Useful for:**
- Filtering IPL/PSL matches
- Getting tournament details
- Finding upcoming series

## Step 3: Create CricAPI Service

Create `lib/services/cricapi.ts`:

```typescript
/**
 * CricAPI Service
 * Fetch real cricket match data
 */

const API_BASE = 'https://api.cricapi.com/v1';
const API_KEY = process.env.NEXT_PUBLIC_CRICAPI_KEY;

export interface CricMatch {
  id: string;
  name: string;
  matchType: string;
  status: 'live' | 'upcoming' | 'completed';
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamIds: number[];
  tossWinnerId?: number;
  tossWinnerName?: string;
  tossMessage?: string;
}

export interface CricMatchDetail extends CricMatch {
  score?: Array<{
    inning: string;
    runs: number;
    wickets: number;
    overs: number;
  }>;
}

/**
 * Get all upcoming matches
 */
export async function getUpcomingMatches(): Promise<CricMatch[]> {
  try {
    const response = await fetch(`${API_BASE}/matches?apikey=${API_KEY}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`CricAPI error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status !== 'success') {
      console.error('CricAPI returned error:', data);
      return [];
    }

    // Filter for upcoming matches
    const upcoming = (data.data || []).filter(
      (match: CricMatch) => match.status === 'upcoming'
    );

    return upcoming;
  } catch (error) {
    console.error('[CricAPI] Failed to fetch matches:', error);
    return [];
  }
}

/**
 * Get match details including live score
 */
export async function getMatchDetails(matchId: string): Promise<CricMatchDetail | null> {
  try {
    const response = await fetch(
      `${API_BASE}/matchInfo?apikey=${API_KEY}&id=${matchId}`,
      {
        next: { revalidate: 60 } // Cache for 1 minute (live matches need frequent updates)
      }
    );

    if (!response.ok) {
      throw new Error(`CricAPI error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status !== 'success') {
      console.error('CricAPI returned error:', data);
      return null;
    }

    return data.data;
  } catch (error) {
    console.error('[CricAPI] Failed to fetch match details:', error);
    return null;
  }
}

/**
 * Get series (tournaments)
 */
export async function getSeries() {
  try {
    const response = await fetch(`${API_BASE}/series?apikey=${API_KEY}`, {
      next: { revalidate: 86400 } // Cache for 1 day
    });

    if (!response.ok) {
      throw new Error(`CricAPI error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('[CricAPI] Failed to fetch series:', error);
    return [];
  }
}

/**
 * Filter matches by series/tournament
 */
export async function getMatchesBySeries(seriesId: number): Promise<CricMatch[]> {
  try {
    const allMatches = await getUpcomingMatches();
    // Note: CricAPI doesn't directly filter by series in /matches endpoint
    // You may need to implement additional filtering logic
    return allMatches;
  } catch (error) {
    console.error('[CricAPI] Failed to filter matches:', error);
    return [];
  }
}

/**
 * Map CricAPI match to KittyPaws MatchTicket format
 */
export function mapCricMatchToTicket(
  cricMatch: CricMatch,
  pricePerTicket = 2.5,
  ticketsAvailable = 5000
) {
  const [team1, team2] = cricMatch.teams;
  const dateObj = new Date(cricMatch.dateTimeGMT);
  const date = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const time = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    id: `match_${cricMatch.id}`,
    team1,
    team2,
    date,
    time,
    venue: cricMatch.venue,
    ticketsAvailable,
    ticketsSold: Math.floor(ticketsAvailable * 0.3), // Mock 30% sold
    pricePerTicket,
    image: getTeamImage(team1), // See below
    status: cricMatch.status as 'upcoming' | 'live' | 'completed',
  };
}

/**
 * Get team logo/image URL
 */
function getTeamImage(teamName: string): string {
  const teamImages: Record<string, string> = {
    'India': 'https://i.postimg.cc/6pYt5KJd/india.png',
    'Pakistan': 'https://i.postimg.cc/MpqYxGjD/pakistan.png',
    'Australia': 'https://i.postimg.cc/rmX7v2FL/australia.png',
    'England': 'https://i.postimg.cc/pVkDNxs5/england.png',
    'Lahore Qalandars': 'https://i.postimg.cc/L53p7WCg/psl-lahore-qalandars-(1).png',
    'Karachi Kings': 'https://i.postimg.cc/76qX3XqZ/karachi-kings.png',
    'Islamabad United': 'https://i.postimg.cc/KcPxRKG8/psl-islamabad-united-(1).png',
    'Peshawar Zalmi': 'https://i.postimg.cc/90Z7JXB1/peshawar-zalmi.png',
    'Multan Sultans': 'https://i.postimg.cc/SRh4g4rR/psl-multan-sultan-(1).png',
    'Quetta Gladiators': 'https://i.postimg.cc/15yT1RCp/quetta.png',
  };

  return teamImages[teamName] || 'https://i.postimg.cc/SRh4g4rR/psl-multan-sultan-(1).png'; // Fallback
}
```

## Step 4: Update Ticket Page

Replace mock data with real CricAPI data:

```typescript
// app/tickets/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { getUpcomingMatches, mapCricMatchToTicket } from '@/lib/services/cricapi';

// ... existing imports ...

export default function TicketsPage() {
  const [matches, setMatches] = useState<MatchTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true);
        const cricMatches = await getUpcomingMatches();
        
        if (cricMatches.length === 0) {
          console.log('No CricAPI data, using mock data');
          // Fallback to MOCK_MATCHES
          setMatches(MOCK_MATCHES);
          return;
        }

        // Convert CricAPI matches to MatchTicket format
        const ticketMatches = cricMatches
          .slice(0, 6) // Limit to 6 matches for display
          .map(match => mapCricMatchToTicket(match, 2.5, 5000));

        setMatches(ticketMatches);
      } catch (error) {
        console.error('[Tickets] Failed to fetch matches:', error);
        // Fallback to mock data
        setMatches(MOCK_MATCHES);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();

    // Refresh every 10 minutes
    const interval = setInterval(fetchMatches, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading matches...</div>
      </div>
    );
  }

  // ... rest of existing component ...
}
```

## Step 5: Handle Rate Limits

CricAPI free tier: **300 credits/month** (30 calls with 10 matches each)

**Optimization strategies:**

1. **Cache aggressively**:
```typescript
const response = await fetch(url, {
  next: { revalidate: 3600 } // 1 hour cache
});
```

2. **Show cached data in modal**:
```typescript
// Load match details only when user clicks
async function loadMatchDetails(matchId: string) {
  const details = await getMatchDetails(matchId);
  // ...
}
```

3. **Use ISR (Incremental Static Regeneration)**:
```typescript
// app/tickets/page.tsx
export const revalidate = 3600; // Revalidate every hour
```

4. **Monitor API usage**:
```typescript
// Log every API call
console.log('[CricAPI] Remaining credits:', data.info?.credits);
```

## Step 6: Error Handling

Always fallback to mock data if CricAPI fails:

```typescript
const matches = await getUpcomingMatches()
  .catch(() => {
    console.warn('[Tickets] CricAPI failed, using mock data');
    return MOCK_MATCHES;
  });
```

## Testing

### Step 1: Verify API Key
```bash
curl "https://api.cricapi.com/v1/matches?apikey=YOUR_KEY"
```

### Step 2: Test in App
1. Add `NEXT_PUBLIC_CRICAPI_KEY` to `.env.local`
2. Restart dev server
3. Visit `/tickets`
4. Check browser console for CricAPI requests
5. Verify real match data appears (or mock data fallback works)

## Available Match Types
- **ODI** - One Day International (50 overs)
- **Test** - Test Match (up to 5 days)
- **T20** - T20 International (20 overs)
- **T20league** - Domestic T20 leagues (IPL, PSL, BBL, etc.)

## Cost Optimization

| Action | Credits Used | Frequency | Monthly Cost |
|--------|--------------|-----------|--------------|
| Fetch all matches | 10 | Once/hour | ~240 |
| Match details (live) | 10 | Every 10 min | ~4,320 |
| Series list | 5 | Once/day | ~5 |

**Recommendation**: Cache matches for 1 hour, only update match details when user clicks.

## Next Steps

1. **Add authentication** to protect API key
2. **Implement prediction** on match outcomes
3. **Add live score ticker** during matches
4. **Create match alerts** via email (Brevo integration)
5. **Analytics** on which matches sell most tickets

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No matches returned | Check that API key is correct and has remaining credits |
| Stale data | Reduce `revalidate` time or add manual refresh button |
| "API key invalid" | Verify NEXT_PUBLIC_CRICAPI_KEY in .env.local and dev server restarted |
| 404 errors | Verify endpoint URLs match current CricAPI API version |
| CORS errors | Use Next.js API route as proxy (see below) |

## API Route Proxy (Recommended for Production)

Create `app/api/cricapi/route.ts` to proxy requests:

```typescript
import { NextRequest, NextResponse } from 'next/server';

const CRICAPI_KEY = process.env.CRICAPI_KEY; // Server-side only

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'matches';

  try {
    const response = await fetch(
      `https://api.cricapi.com/v1/${endpoint}?apikey=${CRICAPI_KEY}&${searchParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cricket data' },
      { status: 500 }
    );
  }
}
```

Usage:
```typescript
const response = await fetch('/api/cricapi?endpoint=matches');
const data = await response.json();
```

This hides your API key and prevents rate limit issues from client-side calls.
