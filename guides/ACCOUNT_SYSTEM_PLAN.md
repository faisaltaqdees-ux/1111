# Account System with Brevo OTP - Implementation Plan

## Overview

Build a secure user account system with email verification via Brevo API. This will power the personalized dashboard where users can see their purchases, receipts, and transaction history.

---

## Phase 1: Setup Brevo API

### 1. Create Brevo Account
1. Go to [Brevo.com](https://www.brevo.com)
2. Sign up for free account
3. Navigate to Settings → API Keys
4. Generate new API key
5. Copy the API key

### 2. Configure Frontend Environment
Add to `.env.local`:
```env
BREVO_API_KEY=your_api_key_abc123...
BREVO_SENDER_EMAIL=support@kittypaws.com
BREVO_SENDER_NAME=KittyPaws Tickets
```

### 3. Verify SMTP Settings in Brevo
- Go to Senders & Authenticity
- Add sender email (verify domain if doing production)
- For testing: Use any email, Brevo auto-accepts for testing

---

## Phase 2: Database Updates

### Add User Accounts Table

Already exists in schema as `users` table. The fields needed:

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  wallet_address VARCHAR(42) UNIQUE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Link existing transactions to users:
ALTER TABLE transactions ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE tickets ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE receipts ADD COLUMN user_id UUID REFERENCES users(id);
```

### Add OTP Verification Table

Already exists as `email_verifications` table:

```sql
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  otp VARCHAR(6),
  method VARCHAR(20) CHECK (method IN ('token', 'otp')),
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Phase 3: Backend API Routes

### Route 1: Register with Email & Password

**Endpoint**: `POST /api/auth/register`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE0" // optional
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent to email",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "otpExpiresIn": 600 // seconds
}
```

**Implementation**:
```typescript
// app/api/auth/register/route.ts
export async function POST(request: NextRequest) {
  const { email, password, fullName, walletAddress } = await request.json();

  // 1. Validate inputs
  // 2. Hash password with bcrypt
  // 3. Check if user exists
  // 4. Create user in Supabase
  // 5. Generate 6-digit OTP
  // 6. Save OTP to email_verifications table (expires in 10 min)
  // 7. Send OTP via Brevo API
  // 8. Return success
}
```

### Route 2: Verify OTP

**Endpoint**: `POST /api/auth/verify-otp`

**Request**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJhbGciOiJIUzI1NiIs..." // JWT token
}
```

**Implementation**:
```typescript
// app/api/auth/verify-otp/route.ts
export async function POST(request: NextRequest) {
  const { email, otp } = await request.json();

  // 1. Find user by email
  // 2. Get latest OTP from email_verifications
  // 3. Check if OTP matches and not expired
  // 4. Mark as used
  // 5. Update user.is_email_verified = true
  // 6. Generate JWT token
  // 7. Return token
}
```

### Route 3: Login

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Logged in successfully",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "John Doe",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE0",
    "isEmailVerified": true
  }
}
```

### Route 4: Get User Profile (Protected)

**Endpoint**: `GET /api/auth/profile`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "fullName": "John Doe",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE0",
  "isEmailVerified": true,
  "createdAt": "2026-04-15T00:00:00Z",
  "avatar": null
}
```

### Route 5: Update Profile (Protected)

**Endpoint**: `PUT /api/auth/profile`

**Request**:
```json
{
  "fullName": "John Doe Updated",
  "phone": "+923001234567",
  "walletAddress": "0x..."
}
```

### Route 6: Logout

**Endpoint**: `POST /api/auth/logout`

**Headers**:
```
Authorization: Bearer ...
```

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Phase 4: Brevo API Integration

### Setup Brevo Email Service

```typescript
// lib/brevoEmail.ts
import axios from 'axios';

const BREVO_API = 'https://api.brevo.com/v3';
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const SENDER_NAME = process.env.BREVO_SENDER_NAME;

export async function sendOTPEmail(
  email: string,
  otp: string,
  expiresIn: number
): Promise<boolean> {
  try {
    const response = await axios.post(
      `${BREVO_API}/smtp/email`,
      {
        sender: {
          email: SENDER_EMAIL,
          name: SENDER_NAME,
        },
        to: [
          {
            email: email,
          },
        ],
        subject: 'KittyPaws - Email Verification OTP',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #8B5A8E;">Welcome to KittyPaws! 🎫</h2>
            <p>Your One-Time Password (OTP) for email verification:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center;">
              <h1 style="color: #E84D89; letter-spacing: 2px;">${otp}</h1>
            </div>
            <p style="color: #666;">This OTP expires in ${expiresIn / 60} minutes.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
        },
      }
    );

    return response.status === 201;
  } catch (error) {
    console.error('[Brevo] Email send failed:', error);
    return false;
  }
}

export async function sendReceiptEmail(
  email: string,
  receiptId: string,
  receiptData: {
    matchTeams: string;
    ticketCount: number;
    totalAmount: string;
    transactionHash: string;
  }
): Promise<boolean> {
  try {
    const response = await axios.post(
      `${BREVO_API}/smtp/email`,
      {
        sender: {
          email: SENDER_EMAIL,
          name: SENDER_NAME,
        },
        to: [{ email }],
        subject: `KittyPaws Receipt #${receiptId}`,
        htmlContent: `
          <div style="font-family: Arial; padding: 20px;">
            <h2>Your Ticket Receipt</h2>
            <p>Match: ${receiptData.matchTeams}</p>
            <p>Tickets: ${receiptData.ticketCount}</p>
            <p>Total: ${receiptData.totalAmount} WIRE</p>
            <p>Transaction: <code>${receiptData.transactionHash}</code></p>
          </div>
        `,
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
        },
      }
    );

    return response.status === 201;
  } catch (error) {
    console.error('[Brevo] Receipt email failed:', error);
    return false;
  }
}
```

---

## Phase 5: Frontend Authentication Context

### Create Auth Context

```typescript
// context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  walletAddress?: string;
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });
    const data = await response.json();
    setIsLoading(false);
    // Show OTP verification screen
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string) => {
    setIsLoading(true);
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('auth_token', data.token);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('auth_token', data.token);
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  }, [token]);

  const getProfile = useCallback(async () => {
    const response = await fetch('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    setUser(data);
    return data;
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, isLoading, token, register, verifyOTP, login, logout, getProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

---

## Phase 6: Account Dashboard

### Create Dashboard Page

```typescript
// app/dashboard/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

interface PurchasedTicket {
  id: string;
  match: string;
  date: string;
  quantity: number;
  priceWire: string;
  status: 'pending' | 'confirmed';
  transactionHash: string;
  nftTokenIds: string[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserTickets();
  }, [user?.id]);

  const fetchUserTickets = async () => {
    const response = await fetch('/api/user/tickets', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
    });
    const data = await response.json();
    setTickets(data.tickets);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-mauve-950 to-rose-950 p-8">
      <h1 className="text-4xl font-bold text-white mb-8">My Tickets</h1>

      <div className="grid gap-6">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{ticket.match}</h3>
                <p className="text-gray-300">{ticket.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                ticket.status === 'confirmed'
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {ticket.status === 'confirmed' ? '✅ Confirmed' : '⏳ Pending'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm">Quantity</p>
                <p className="text-white font-semibold">{ticket.quantity} tickets</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Price</p>
                <p className="text-white font-semibold">{ticket.priceWire} WIRE</p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-gray-400 text-sm mb-2">Transaction Hash</p>
              <code className="text-green-400 text-xs break-all">{ticket.transactionHash}</code>
            </div>

            {ticket.nftTokenIds.length > 0 && (
              <div className="border-t border-white/10 pt-4 mt-4">
                <p className="text-gray-400 text-sm mb-2">NFT Token IDs</p>
                <div className="flex flex-wrap gap-2">
                  {ticket.nftTokenIds.map((id) => (
                    <span key={id} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-semibold">
                View Receipt
              </button>
              <button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg text-sm font-semibold">
                Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
```

---

## Security Checklist

- [ ] Passwords hashed with bcrypt (min 10 rounds)
- [ ] JWT tokens expire after 7 days
- [ ] OTP expires after 10 minutes
- [ ] Rate limiting on OTP requests (max 5 per hour)
- [ ] Rate limiting on login (max 10 failed attempts per 15 min)
- [ ] RLS policies prevent user cross-access
- [ ] Password recovery via OTP (separate flow)
- [ ] HTTPS only in production
- [ ] Secure httpOnly cookies for tokens
- [ ] CORS properly configured

---

## Testing Plan

1. **Unit Tests**
   - OTP generation & validation
   - Password hashing & comparison
   - JWT creation & verification

2. **Integration Tests**
   - Registration flow
   - OTP verification
   - Login/logout
   - Protected route access

3. **E2E Tests**
   - Full registration + OTP + login flow
   - Purchase ticket + see in dashboard
   - Download receipt

---

## Files to Create

```
frontend/app/api/auth/
├── register/route.ts
├── verify-otp/route.ts
├── login/route.ts
├── profile/route.ts
├── logout/route.ts
└── password-reset/route.ts

frontend/app/auth/
├── register/page.tsx
├── login/page.tsx
├── verify-otp/page.tsx
└── forgot-password/page.tsx

frontend/app/dashboard/
├── page.tsx
├── layout.tsx
├── purchases/page.tsx
├── receipts/page.tsx
└── settings/page.tsx

frontend/context/
└── AuthContext.tsx

frontend/lib/
└── brevoEmail.ts
```

---

## Timeline

- **Day 1**: Setup Brevo API + Backend routes (register, verify, login)
- **Day 2**: Frontend auth context + registration page
- **Day 3**: Dashboard + ticket history
- **Day 4**: Testing & security review
- **Day 5**: Polish + deployment

---

**Ready to start? Let me know when you're ready for Phase 1!** 🚀
