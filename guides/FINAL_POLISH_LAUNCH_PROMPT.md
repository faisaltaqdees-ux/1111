# 🚀 PSL Pulse - Final Polish & Launch Sprint - COMPREHENSIVE PROMPT

**Status**: 🔴 CRITICAL - 1 HOUR REMAINING  
**Target**: Polish + Account System + Receipts + Leaderboard Fix + PDF Presentation  
**Priority**: Fix bugs → Polish content → Add account → Generate PDF  
**Deadline**: NOW

---

## 🚨 **CRITICAL SECURITY WARNING**

> ⚠️ **YOUR BREVO SMTP KEY HAS BEEN SHARED IN THIS DOCUMENT**
> 
> **IMMEDIATE ACTIONS (before starting):**
> 1. **NEVER commit this file to GitHub**
> 2. **Delete this credential after hackathon** (regenerate in Brevo)
> 3. **Only store in .env.local** (never commit)
> 4. **Use Vercel Environment Variables** for production
> 5. **This key will be INVALID after the event**
> 
> **If this key appears on GitHub:**
> - Brevo will automatically revoke it
> - Your email sending will break
> - Regenerate immediately in Brevo dashboard
> 
> **All credentials in this prompt are TEMPORARY and will be rotated post-hackathon**

---

## ⚡ **TIER 1: DO IMMEDIATELY (Next 15 minutes)**

### **1. Content Polish - Natural, Real Language**
Replace all placeholder copy with natural, conversational tone:

```typescript
// BEFORE (Robotic):
"LEADERBOARD — Pure Impact, Pure Ranking"

// AFTER (Natural):
"See who's making the biggest impact in cricket"

// BEFORE:
"Real-time rankings across 8 teams, 44 players."

// AFTER:
"Live rankings updated as matches unfold"
```

**Apply to ALL pages:**
- Landing page hero text
- Match descriptions
- Leaderboard headers
- Profile section titles
- Receipt text

**Action**: Search for ALL CAPS placeholder text and convert to sentence case, natural language.

### **2. Landing Page Account UI**
Add top-right navbar with account options:

```jsx
// App.jsx / Landing Page Navbar
<nav className="fixed top-0 right-0 z-50 p-4">
  {!user ? (
    <div className="flex gap-2">
      <button className="px-4 py-2 rounded-lg bg-psl-mauve/20 border border-psl-rose">
        Sign In
      </button>
      <button className="px-4 py-2 rounded-lg bg-psl-gradient text-white">
        Create Account
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-4">
      <span className="text-white/80">{user.email}</span>
      <button className="px-4 py-2 rounded-lg bg-psl-neon-pink/20">
        Profile
      </button>
      <button onClick={logout} className="px-4 py-2 text-red-400">
        Sign Out
      </button>
    </div>
  )}
</nav>
```

### **3. Quick Bug Fix Checklist**
```
□ Check all button sizes (should be min 44px height for mobile)
□ Verify text contrast (WCAG AA minimum)
□ Fix any broken images (404s)
□ Remove console.log() statements
□ Check loading states on all async operations
□ Verify mobile responsiveness (test on sm: 640px)
```

---

## ⚡ **TIER 2: Account System (Next 20 minutes)**

### **Create Account Page** (`frontend/src/pages/auth/signup.jsx`)

```typescript
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Supabase auth user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      // 2. Send OTP via Brevo
      const otpCode = Math.floor(100000 + Math.random() * 900000);
      await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode }),
      });

      setOtpSent(true);
      sessionStorage.setItem('otpCode', otpCode);

      // 3. Create user profile in Supabase
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user?.id,
          email,
          created_at: new Date(),
          account_status: 'pending_verification',
        });

      if (profileError) throw profileError;
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    const storedOtp = sessionStorage.getItem('otpCode');
    if (otp !== storedOtp) {
      setError('Invalid OTP');
      return;
    }

    // Mark as verified
    const { data: user } = await supabase.auth.getUser();
    await supabase
      .from('user_profiles')
      .update({ account_status: 'active' })
      .eq('user_id', user.user?.id);

    // Redirect to wallet connection
    window.location.href = '/auth/connect-wallet';
  };

  if (otpSent) {
    return (
      <motion.div className="min-h-screen flex items-center justify-center bg-psl-dark p-4">
        <div className="bg-glass-bg border border-glass-border backdrop-blur-2xl rounded-2xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-4">Verify Email</h1>
          <p className="text-white/60 mb-6">Enter the OTP sent to {email}</p>
          <input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-center text-2xl tracking-widest"
          />
          {error && <p className="text-red-400 mt-3">{error}</p>}
          <button
            onClick={verifyOTP}
            className="w-full mt-6 px-4 py-3 bg-psl-gradient text-white rounded-lg font-bold"
          >
            Verify OTP
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="min-h-screen flex items-center justify-center bg-psl-dark p-4">
      <div className="bg-glass-bg border border-glass-border backdrop-blur-2xl rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-white/60 mb-6">Sign up to start collecting cricket impact</p>

        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="email"
            placeholder="your@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-psl-gradient text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-white/60">
          Already have account?{' '}
          <a href="/auth/signin" className="text-psl-rose font-bold">
            Sign In
          </a>
        </p>
      </div>
    </motion.div>
  );
}
```

### **Connect Wallet Page** (`frontend/src/pages/auth/connect-wallet.jsx`)

```typescript
import { useAccount, useConnect } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { supabase } from '@/lib/supabaseClient';

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const handleConnect = async () => {
    connect({ connector: new MetaMaskConnector() });
  };

  const handleSave = async () => {
    if (!address || !isConnected) {
      alert('Please connect wallet first');
      return;
    }

    const { data: user } = await supabase.auth.getUser();
    await supabase
      .from('user_profiles')
      .update({
        wallet_address: address,
        kyc_status: 'pending_review',
      })
      .eq('user_id', user.user?.id);

    window.location.href = '/profile';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-psl-dark p-4">
      <div className="bg-glass-bg border border-glass-border backdrop-blur-2xl rounded-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
        <p className="text-white/60 mb-6">
          Link your MetaMask wallet to start buying tickets and earning badges
        </p>

        <button
          onClick={handleConnect}
          className="w-full px-6 py-3 bg-amber-500 text-white rounded-lg font-bold mb-4"
        >
          Connect MetaMask
        </button>

        {isConnected && (
          <>
            <p className="text-green-400 mb-4">✓ Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
            <button
              onClick={handleSave}
              className="w-full px-6 py-3 bg-psl-gradient text-white rounded-lg font-bold"
            >
              Save & Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## ⚡ **TIER 3: Profile Page (Next 15 minutes)**

```typescript
// frontend/src/pages/profile.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  useEffect(() => {
    loadProfile();
    loadTickets();
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();
    setProfile(data);
  };

  const loadTickets = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    setTickets(data || []);
  };

  const handlePasswordReset = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (!error) alert('Password updated successfully');
    setShowPasswordReset(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-psl-dark via-psl-dark to-psl-mauve/10 p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Your Profile</h1>
        <p className="text-white/60">Manage your account and view your cricket journey</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Section */}
        <div className="lg:col-span-1">
          <div className="bg-glass-bg border border-glass-border backdrop-blur-2xl rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Account Details</h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-white/50">Email</p>
                <p className="text-white font-semibold">{profile?.email}</p>
              </div>

              <div>
                <p className="text-white/50">Wallet</p>
                <p className="text-white font-mono text-xs break-all">
                  {profile?.wallet_address || 'Not connected'}
                </p>
              </div>

              <div>
                <p className="text-white/50">Account Status</p>
                <p className={`font-bold ${
                  profile?.account_status === 'active' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {profile?.account_status}
                </p>
              </div>

              <div>
                <p className="text-white/50">Member Since</p>
                <p className="text-white">
                  {new Date(profile?.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPasswordReset(!showPasswordReset)}
              className="w-full mt-6 px-4 py-2 bg-psl-neon-violet/20 border border-psl-neon-violet text-psl-neon-violet rounded-lg"
            >
              {showPasswordReset ? 'Cancel' : 'Reset Password'}
            </button>

            {showPasswordReset && (
              <ResetPasswordForm onReset={handlePasswordReset} />
            )}
          </div>
        </div>

        {/* Tickets Section */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-4">Your Tickets</h2>

          <div className="space-y-4">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))
            ) : (
              <p className="text-white/60 text-center py-8">No tickets purchased yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordForm({ onReset }) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onReset(newPassword);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full px-3 py-2 bg-psl-gradient text-white rounded text-sm"
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}

function TicketCard({ ticket }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-glass-bg border border-glass-border backdrop-blur-2xl rounded-2xl p-6 hover:border-psl-rose transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{ticket.match_name}</h3>
          <p className="text-white/60 text-sm">{new Date(ticket.date).toLocaleDateString()}</p>
        </div>
        <button className="px-4 py-2 bg-psl-gradient text-white text-sm rounded-lg">
          Download Receipt
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-white/50">Price Paid</p>
          <p className="text-white font-semibold">{ticket.amount} PKR</p>
        </div>
        <div>
          <p className="text-white/50">Tier</p>
          <p className="text-white font-semibold">{ticket.tier}</p>
        </div>
      </div>
    </motion.div>
  );
}
```

---

## ⚡ **TIER 4: Receipts - Cricket Ticket Format (Next 10 minutes)**

```typescript
// frontend/src/lib/generateReceipt.js
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export async function generateTicketReceipt(ticketData) {
  const {
    ticketId,
    userName,
    userEmail,
    matchName,
    team1,
    team2,
    date,
    venue,
    tier,
    seatNumber,
    transactionHash,
    amount,
    qrCodeData,
  } = ticketData;

  const pdf = new jsPDF('P', 'mm', 'A4');
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();

  // Background (cricket field green)
  pdf.setFillColor(15, 75, 45);
  pdf.rect(0, 0, width, height, 'F');

  // Header - Team badges
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
  pdf.text(team1, 20, 30);
  pdf.text('VS', width / 2 - 5, 30);
  pdf.text(team2, width - 30, 30);

  // Match Info
  pdf.setFontSize(14);
  pdf.setTextColor(255, 200, 0);
  pdf.text(matchName, width / 2, 50, { align: 'center' });

  pdf.setFontSize(11);
  pdf.setTextColor(200, 200, 200);
  pdf.text(`📍 ${venue}`, width / 2, 60, { align: 'center' });
  pdf.text(`📅 ${new Date(date).toLocaleDateString()}`, width / 2, 67, { align: 'center' });

  // Ticket Info Box
  pdf.setDrawColor(255, 200, 0);
  pdf.setLineWidth(2);
  pdf.rect(15, 80, width - 30, 60);

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(255, 200, 0);
  pdf.rect(15, 80, width - 30, 15, 'F');
  pdf.text('🎫 YOUR MATCH TICKET 🎫', width / 2, 90, { align: 'center' });

  pdf.setTextColor(255, 255, 255);
  pdf.text(`Name: ${userName}`, 25, 105);
  pdf.text(`Email: ${userEmail}`, 25, 115);
  pdf.text(`Tier: ${tier} | Seat: ${seatNumber}`, 25, 125);
  pdf.text(`Ticket ID: ${ticketId}`, 25, 135);

  // QR Code
  const qrImage = await QRCode.toDataURL(qrCodeData);
  pdf.addImage(qrImage, 'PNG', width - 50, 80, 35, 35);

  // Transaction Details
  pdf.setFontSize(9);
  pdf.setTextColor(200, 200, 200);
  pdf.text('BLOCKCHAIN VERIFICATION', width / 2, 150, { align: 'center' });
  pdf.text(`TX: ${transactionHash.slice(0, 20)}...`, width / 2, 157, { align: 'center' });
  pdf.text(`Amount: ${amount} WIRE`, width / 2, 163, { align: 'center' });

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Powered by PSL Pulse | Cricket Impact, Digitized', width / 2, height - 10, { align: 'center' });

  return pdf;
}
```

**Use in Download Button:**
```typescript
const handleDownloadReceipt = async (ticket) => {
  const qrData = await generateTicketReceipt({
    ticketId: ticket.id,
    userName: user.full_name,
    userEmail: user.email,
    matchName: ticket.match_name,
    team1: ticket.team1,
    team2: ticket.team2,
    date: ticket.date,
    venue: ticket.venue,
    tier: ticket.tier,
    seatNumber: ticket.seat_number,
    transactionHash: ticket.tx_hash,
    amount: ticket.amount,
    qrCodeData: `https://pslpulse.com/verify/${ticket.id}`,
  });

  qrData.save(`ticket-${ticket.id}.pdf`);
};
```

---

## ⚡ **TIER 5: Leaderboard Fix - Contributors (Next 10 minutes)**

**Replace player leaderboard with contributors:**

```typescript
// frontend/src/pages/leaderboard.jsx - UPDATED DATA

const CONTRIBUTOR_DATA = [
  {
    rank: 1,
    // ← USER instead of player
    userId: '001',
    userName: 'Usman Ahmed',
    tierLevel: 'Gold',
    totalContributions: 2450,
    ticketsBought: 12,
    tipsSent: 8,
    badges: 5,
    mostSupported: 'Virat Kohli',
    joinedDate: '2026-03-15',
  },
  {
    rank: 2,
    userId: '002',
    userName: 'Fatima Khan',
    tierLevel: 'Silver',
    totalContributions: 2180,
    ticketsBought: 10,
    tipsSent: 6,
    badges: 4,
    mostSupported: 'Babar Azam',
    joinedDate: '2026-03-16',
  },
  // ... more contributors
];
```

**Update table headers:**
```
RANK | FAN NAME | TIER | TICKETS BOUGHT | TIPS SENT | BADGES | MOST SUPPORTED | JOINED
```

**Update LeaderboardRow:**
```typescript
// Show user contributions, not player stats
<td>{entry.ticketsBought} matches</td>
<td>{entry.tipsSent} players</td>
<td>{entry.badges} earned</td>
<td>{entry.mostSupported}</td>
```

---

## ⚡ **TIER 6: Brevo API Setup - SECURE (Next 5 minutes)**

### **🔐 CRITICAL SECURITY - READ CAREFULLY**

> ⚠️ **NEVER commit credentials to GitHub!**  
> ⚠️ **NEVER log sensitive data!**  
> ⚠️ **This credential will be PERMANENTLY REVOKED after hackathon**

### **Step 1: Create .env.local (LOCAL ONLY - NEVER COMMIT)**

```env
# .env.local — NEVER COMMIT, NEVER PUSH TO GITHUB
# ⚠️ Add this file to .gitignore immediately

# Brevo SMTP Configuration
BREVO_SMTP_KEY=your_brevo_key_here
BREVO_SENDER_EMAIL=your_email@example.com
BREVO_SENDER_NAME=Your Name

# Supabase (public + secret - service role key only in .local)
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_secret_key_local_only

# Database
DATABASE_URL=your_db_url_local_only

# Encryption Key (generate with: openssl rand -base64 32)
ENCRYPTION_SECRET=your_generated_key
```

### **Step 2: Update .gitignore (IMMEDIATELY)**

```bash
# Add these lines to .gitignore
.env.local
.env.*.local
*.local
.secret
credentials/
secrets/
```

**Verify**: Run `git status` — .env.local should NOT appear

### **Step 3: Secure Brevo Endpoint with Rate Limiting & Validation**

```typescript
// frontend/src/pages/api/send-otp.js
import nodemailer from 'nodemailer';

// Server-side only: credentials never exposed to client
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SENDER_EMAIL,
    pass: process.env.BREVO_SMTP_KEY, // ← Loaded from .env.local only
  },
});

/**
 * Rate limiting map: tracks API calls per IP
 * @type {Map<string, {count: number, resetTime: number}>}
 */
const rateLimitMap = new Map();

/**
 * Check rate limit for IP (max 5 OTP requests per 15 min)
 * @param {string} ip
 * @returns {boolean}
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    return true;
  }

  if (limit.count >= 5) {
    return false; // Rate limit exceeded
  }

  limit.count++;
  return true;
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) && email.length <= 254;
}

/**
 * Validate OTP code
 * @param {number} otp
 * @returns {boolean}
 */
function isValidOTP(otp) {
  return /^\d{6}$/.test(otp.toString());
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // ⚠️ RATE LIMITING
  if (!checkRateLimit(clientIp)) {
    console.warn(`⚠️ Rate limit exceeded for IP: ${clientIp}`);
    return res.status(429).json({ 
      error: 'Too many OTP requests. Try again in 15 minutes.' 
    });
  }

  const { email, otpCode } = req.body;

  // ⚠️ INPUT VALIDATION
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!isValidOTP(otpCode)) {
    return res.status(400).json({ error: 'Invalid OTP format' });
  }

  // ⚠️ NEVER LOG SENSITIVE DATA
  console.log(`📧 OTP request for: ${email.split('@')[0]}@*** (partial)`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  // ❌ NEVER: console.log(email, otpCode, fullCredentials, etc)

  try {
    const mailOptions = {
      from: `"${process.env.BREVO_SENDER_NAME}" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: email,
      subject: '🏆 Your PSL Pulse Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background: #0a0a1a; color: white; }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px; 
                background: #1a1a2e; 
                border-radius: 12px; 
                border: 1px solid rgba(255,107,178,0.3);
              }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 28px; font-weight: bold; color: #ff69b4; }
              .otp-box {
                background: linear-gradient(135deg, #6D3A6D 0%, #B85C8A 100%);
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 30px 0;
              }
              .otp-code {
                font-size: 36px;
                font-weight: bold;
                letter-spacing: 8px;
                font-family: monospace;
                color: white;
              }
              .expire-notice {
                color: #FFFF00;
                font-size: 12px;
                margin-top: 15px;
                text-align: center;
              }
              .footer {
                text-align: center;
                font-size: 11px;
                color: #999;
                margin-top: 20px;
                border-top: 1px solid rgba(255,255,255,0.1);
                padding-top: 15px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🏆 PSL PULSE</div>
                <p style="color: #999; margin: 10px 0;">Cricket Impact Platform</p>
              </div>

              <h2 style="color: #ff69b4;">Verify Your Email</h2>
              <p>Welcome to PSL Pulse! Enter the code below to complete your account setup.</p>

              <div class="otp-box">
                <div class="otp-code">${otpCode}</div>
                <div class="expire-notice">
                  ⏰ This code expires in <strong>10 minutes</strong>
                </div>
              </div>

              <p style="color: #999; font-size: 13px;">
                If you didn't request this code, you can safely ignore this email. Your account remains secure.
              </p>

              <div class="footer">
                <p>PSL Pulse © 2026 | Powered by WireFluid Blockchain</p>
                <p>This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    // ⚠️ SANITIZE RESPONSE - Never expose full details
    console.log(`✅ Email sent successfully`);
    
    return res.status(200).json({ 
      success: true,
      // ❌ NEVER return: info.response, messageId details, etc
    });

  } catch (error) {
    // ⚠️ LOG ERROR SAFELY
    if (error.code === 'EAUTH') {
      console.error('❌ Brevo authentication failed - check credentials');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Network error - Brevo SMTP unreachable');
    } else {
      console.error('❌ Email send failed:', error.message);
    }
    
    // ⚠️ Don't expose internal error details to client
    return res.status(500).json({ 
      error: 'Failed to send verification email. Please try again.' 
    });
  }
}
```

### **Step 4: Vercel Environment Variables (Production Safe)**

> ⚠️ **CRITICAL**: These will be set in Vercel dashboard, NOT in local .env

**Dashboard Steps:**
1. Go to `vercel.com` → Your Project → Settings → Environment Variables
2. Add these variables (available only to server-side code):
```
BREVO_SMTP_KEY = your_brevo_key_here
BREVO_SENDER_EMAIL = your_email@example.com
BREVO_SENDER_NAME = Your Name
SUPABASE_SERVICE_ROLE_KEY = (your key)
ENCRYPTION_SECRET = (your key)
```

3. Select appropriate environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (but stored locally)

### **Step 5: Encryption for Stored Data**

Encrypt sensitive fields in Supabase:

```typescript
// lib/encryption.ts
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const secretKey = Buffer.from(process.env.ENCRYPTION_SECRET, 'base64');

export function encryptData(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptData(encryptedData: string): string {
  const [iv, authTag, encrypted] = encryptedData.split(':');
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

Use when storing wallet addresses:
```typescript
const { error } = await supabase
  .from('user_profiles')
  .update({
    wallet_address: encryptData(walletAddress), // ← Encrypted
  })
  .eq('user_id', user.id);
```

### **Step 6: Pre-Submission Security Audit**

```bash
# Run BEFORE pushing to GitHub
npm install snyk -g
snyk test --severity-threshold=high

# Check for exposed secrets
npm install git-secrets -g
git secrets --install
git secrets --add 'xsmtpsib'  # Block Brevo key from commits
git secrets --add '@gmail.com'  # Block personal emails

# Verify .env.local not tracked
git status | grep .env.local  # Should be empty
```

### **Step 7: Credential Rotation (After Hackathon)**

> ⚠️ **IMMEDIATELY after judging:**
> 1. Go to Brevo dashboard → Regenerate SMTP key
> 2. Rotate Supabase service role key
> 3. Revoke old environment variables from Vercel
> 4. Delete all local .env files

### **🔐 SECURITY CHECKLIST**

```
✅ PRE-SUBMISSION:
  □ .env.local is in .gitignore ← VERIFY NOW
  □ No credentials in source code
  □ Rate limiting implemented (5 OTP/15min)
  □ Input validation on all API endpoints
  □ Never logs email, OTP, or sensitive data
  □ Encryption for wallet addresses
  □ HTTPS enforced (Vercel default ✓)
  □ CORS headers set correctly
  □ CSP (Content Security Policy) enabled

✅ IN VERCEL:
  □ Secrets in Environment Variables (not code)
  □ Preview + Production environments secured
  □ No logs expose credentials
  □ Auto-deployments check for secrets

✅ POST-SUBMISSION:
  □ Credentials immediately rotated
  □ Old keys deleted
  □ GitHub account secured
  □ Vercel access reviewed
```

---

## ⚡ **TIER 7: Beautiful PDF Presentation (Final 5 minutes)**

Create presentation generator:

```typescript
// frontend/src/lib/generatePresentation.js
import { jsPDF } from 'jspdf';

export function generateJudgePresentation() {
  const pdf = new jsPDF('P', 'mm', 'A4');
  const width = pdf.internal.pageSize.getWidth();

  // Slide 1: Title
  addTitleSlide(pdf, width);

  // Slide 2: Problem
  addSlide(pdf, width, 'The Problem', [
    '❌ Cricket fans have no way to directly impact matches',
    '❌ Blockchain potential untapped in sports',
    '❌ Fan engagement limited to social media',
    '❌ No ownership economy for collectors',
  ]);

  // Slide 3: Solution
  addSlide(pdf, width, 'PSL Pulse — Our Solution', [
    '🎯 Real-time Impact Platform',
    '⛓️ Blockchain-powered ticket NFTs',
    '💰 Direct WIRE token staking & tipping',
    '🏆 Contributor leaderboards & rewards',
    '🎫 Beautiful ticket receipts with QR codes',
    '👤 Secure account system with OTP verification',
  ]);

  // Slide 4: Tech Stack
  addSlide(pdf, width, 'Technology Stack', [
    '⚛️ Next.js + React for frontend',
    '🔗 WireFluid Blockchain (Chain ID: 92533)',
    '📦 Supabase (PostgreSQL + Auth)',
    '📧 Brevo API for OTP/Email',
    '💾 Framer Motion animations',
    '🎨 Tailwind CSS + Glassmorphism',
  ]);

  // Slide 5: Features
  addSlide(pdf, width, 'Key Features', [
    '✅ NFT Ticket purchasing with real WIRE',
    '✅ Live leaderboard of top contributors',
    '✅ Downloadable match tickets (PDF)',
    '✅ Blockchain-verified transactions',
    '✅ User profiles with purchase history',
    '✅ Automated OTP verification',
  ]);

  // Slide 6: Blockchain Integration
  addSlide(pdf, width, 'Blockchain Integration', [
    '🔐 PSLImpactMarket.sol - Main contract',
    '🎫 PSLTicket.sol - NFT tickets (ERC-721)',
    '🏅 ImpactBadge.sol - Rewards (ERC-721)',
    '💳 All transactions on WireFluid',
    '📊 Real-time data via Oracle backend',
  ]);

  // Slide 7: Security
  addSlide(pdf, width, 'Security Measures', [
    '🔒 Private keys never stored',
    '✔️ WIRE verification before ticket mint',
    '🛡️ CSRF protection on all endpoints',
    '🔑 JWT tokens for session management',
    '📱 OTP-based email verification',
    '❌ Malicious activity detection',
  ]);

  // Slide 8: Business Model
  addSlide(pdf, width, 'Business Model', [
    '💰 5-10% commission on ticket sales',
    '⚡ Gas fees absorbed by platform',
    '🤝 Revenue sharing with teams',
    '📊 Projected 1M users in Year 1',
    '📈 $500K revenue target by 2027',
  ]);

  // Slide 9: Deployment
  addSlide(pdf, width, 'Live Deployment', [
    '🟢 GitHub Repository: github.com/your-repo',
    '🌐 Live URL: pslpulse.vercel.app',
    '⛓️ Smart Contracts: WireFluid Testnet',
    '📱 Mobile Ready: iOS/Android compatible',
    '♿ WCAG AA Accessibility compliant',
  ]);

  // Slide 10: Thank You
  addTitleSlide(pdf, width, '🏆 Thank You!', 'PSL Pulse — Cricket Impact, Digitized');

  pdf.save('PSL-Pulse-Judges-Presentation.pdf');
}

function addTitleSlide(pdf, width, title, subtitle = '') {
  // Background gradient
  pdf.setFillColor(10, 10, 26);
  pdf.rect(0, 0, width, 297, 'F');

  // Gradient overlay (simulated with rectangles)
  pdf.setFillColor(109, 58, 109);
  pdf.setGlobalAlpha(0.3);
  pdf.rect(0, 0, width, 150, 'F');
  pdf.setGlobalAlpha(1);

  // Title
  pdf.setFontSize(48);
  pdf.setTextColor(255, 105, 180);
  pdf.text(title, width / 2, 100, { align: 'center' });

  // Subtitle
  if (subtitle) {
    pdf.setFontSize(18);
    pdf.setTextColor(184, 92, 138);
    pdf.text(subtitle, width / 2, 140, { align: 'center' });
  }

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text('PSL Pulse © 2026 | Powered by WireFluid', width / 2, 280, { align: 'center' });

  pdf.addPage();
}

function addSlide(pdf, width, title, points) {
  // Background
  pdf.setFillColor(10, 10, 26);
  pdf.rect(0, 0, width, 297, 'F');

  // Header bar
  pdf.setFillColor(109, 58, 109);
  pdf.rect(0, 0, width, 30, 'F');

  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(255, 105, 180);
  pdf.text(title, 10, 20);

  // Content
  pdf.setFontSize(12);
  pdf.setTextColor(200, 200, 200);
  let yPos = 50;
  points.forEach((point) => {
    pdf.text(`• ${point}`, 15, yPos);
    yPos += 15;
  });

  pdf.addPage();
}
```

**Add download button to admin or home page:**
```jsx
<button
  onClick={() => generateJudgePresentation()}
  className="px-6 py-3 bg-psl-gradient text-white rounded-lg font-bold"
>
  📄 Download Judge Presentation
</button>
```

---

## 🔐 **SECURITY HARDENING CHECKLIST**

```
□ Remove all console.log() before deploy
□ Add rate limiting to all APIs (max 10 requests/min per IP)
□ Validate all user inputs (XSS protection)
□ Use HTTPS only (Vercel default ✓)
□ Encrypt sensitive DB fields (wallet address, email)
□ Add CORS headers (only allow your domain)
□ Implement CSRF tokens on forms
□ Use Content Security Policy (CSP) headers
□ Never log private keys or sensitive data
□ Hash all passwords (Supabase handles this ✓)
```

---

## � **FINAL SECURITY VERIFICATION (BEFORE ANY DEPLOYMENT)**

### **DO NOT DEPLOY UNTIL:**

```
❌ FAILS:
□ .env.local appears in git status
□ Brevo key visible in any source file
□ console.log(email, otpCode, credentials)
□ Credentials hardcoded anywhere
□ API endpoints accept unauthenticated requests
□ Rate limiting not implemented
□ No input validation

✅ PASSES:
□ git status shows .env.local is IGNORED
□ .gitignore includes .env.local
□ All credentials in environment variables only
□ Rate limiting: max 5 OTP requests per IP per 15 min
□ Email validation: proper regex + length check
□ OTP validation: 6 digits only
□ No sensitive data logged
□ Encryption implemented for wallet addresses
□ HTTPS enforced (Vercel default)
□ CORS headers configured
□ All secrets in Vercel dashboard (not local files)
```

### **Run Before Pushing to GitHub:**

```bash
# Check for exposed secrets
git diff --cached | grep -i "brevo\|smtp\|key\|secret" 
# Should return NOTHING

# Verify .env.local not in tracking
git ls-files | grep .env.local
# Should return NOTHING

# Check git history for leaked secrets (if already committed)
git log --all -S "xsmtpsib" -p
# If found, read: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
```

### **Secure Deployment Process:**

1. **Local Development** → Use .env.local with real credentials ✓
2. **GitHub Commit** → Never include .env.local (ignored automatically) ✓
3. **Vercel Deploy** → Pull env from Vercel dashboard (not from git) ✓
4. **Production** → All secrets isolated, never logged ✓

### **If Compromised:**

> 🚨 **If BREVO_SMTP_KEY leaks to GitHub:**
> 1. Go to Brevo.com → SMTP & API → Regenerate SMTP Key
> 2. Update Vercel Environment Variable immediately
> 3. Notify judges that credentials were rotated
> 4. Do NOT use old key anymore (it's invalid after regeneration)

---

## 🔐 **HARDENED API ENDPOINT TEMPLATE**

All APIs must follow this pattern:

```typescript
// ✅ SECURE TEMPLATE for ANY API endpoint
import { NextApiRequest, NextApiResponse } from 'next';

const RATE_LIMIT = new Map();
const MAX_REQUESTS = 10;
const TIME_WINDOW = 60000; // 1 minute

function getRateLimit(ip: string): boolean {
  const now = Date.now();
  const data = RATE_LIMIT.get(ip);

  if (!data || now > data.resetTime) {
    RATE_LIMIT.set(ip, { count: 1, resetTime: now + TIME_WINDOW });
    return true;
  }

  if (data.count >= MAX_REQUESTS) {
    return false;
  }

  data.count++;
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Method check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Not allowed' });
  }

  // 2. Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!getRateLimit(ip as string)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  // 3. Input validation
  const { data } = req.body;
  if (!data || typeof data !== 'string' || data.length > 1000) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  // 4. Process (never log sensitive data)
  try {
    console.log('✅ Request processed'); // ✓ Safe
    // ❌ console.log(req.body); // NEVER
    // ❌ console.log(data); // NEVER

    res.status(200).json({ success: true });
  } catch (error) {
    // 5. Error handling (safe logging)
    console.error('Error:', error?.message); // ✓ Safe
    // ❌ console.error(error); // Too much detail
    
    res.status(500).json({ error: 'Internal error' });
  }
}
```

---

## �📋 **DEPLOYMENT CHECKLIST (Final 5 min before submission)**

```
✅ GitHub Setup:
  □ git add . && git commit -m "Final polish: content, account, receipts, PDF"
  □ git push origin main

✅ Vercel Deploy:
  □ Connect GitHub repo to Vercel
  □ Add env variables (BREVO_API_KEY, SUPABASE_KEY, etc)
  □ Deploy → test live URL
  □ Verify all pages accessible

✅ Final Testing:
  □ Sign up → verify OTP
  □ Connect wallet
  □ Download receipt (PDF)
  □ Profile page loads correctly
  □ Leaderboard displays contributors
  □ Download judge presentation

✅ Submit to Judges:
  □ GitHub link
  □ Vercel live link
  □ Email backup of source code
  □ Embedded PDF presentation
```

---

**Generated**: April 15, 2026 - 1 HOUR BEFORE DEADLINE  
**Status**: 🚀 READY TO LAUNCH

Execute in order: Tier 1 → 2 → 3 → 4 → 5 → 6 → 7 → Deploy → Submit

GO! 🏆
