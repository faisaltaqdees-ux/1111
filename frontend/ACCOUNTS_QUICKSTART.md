# PSL Pulse Accounts System - Quick Start Guide

## ✅ Already Installed
All files have been created and npm packages installed. Here's what you have:

## 🎯 Next Steps to Make It Live

### 1. Create Supabase Tables
Run these SQL commands in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  wallet_address VARCHAR(42),
  avatar_url TEXT,
  bio TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_secret VARCHAR(255),
  account_status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  last_login_ip VARCHAR(45),
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP
);

-- Email verifications
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP
);

-- Password resets
CREATE TABLE password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255) UNIQUE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  ip_address VARCHAR(45)
);

-- Login history
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  device_info TEXT,
  login_type VARCHAR(20) DEFAULT 'password',
  success BOOLEAN DEFAULT TRUE,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2FA recovery codes
CREATE TABLE two_fa_recovery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(10) UNIQUE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_email_verifications_user ON email_verifications(user_id);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_password_resets_user ON password_resets(user_id);
CREATE INDEX idx_password_resets_token ON password_resets(reset_token);
CREATE INDEX idx_login_history_user ON login_history(user_id);
```

### 2. Enable Row Level Security (RLS) - Optional but recommended
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);
```

### 3. Test in Browser

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Go to signup**: http://localhost:3000/auth/signup
   
3. **Fill form**:
   - Full Name: John Doe
   - Email: test@example.com
   - Password: MyPass123 (meets requirements)
   
4. **Check Inbox**: Verify email link should arrive in a few seconds

5. **Click verification link**: Should redirect to login

6. **Login**: Use email and password

7. **Go to Profile**: http://localhost:3000/profile
   - Edit name, phone, bio
   - View receipts
   - Setup 2FA
   - View login history

## 📍 File Locations

**Auth Files**:
- Signup: `/auth/signup`
- Login: `/auth/login`
- Forgot Password: `/auth/forgot-password`
- Profile: `/profile`

**API Endpoints**:
- GET `/api/auth/me` - Get current user
- POST `/api/auth/signup` - Register
- POST `/api/auth/user-login` - Login
- POST `/api/auth/verify-email` - Verify email
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-pass` - Reset password
- POST `/api/auth/setup-2fa` - Setup 2FA
- POST `/api/auth/change-password` - Change password
- POST `/api/auth/update-profile` - Update profile
- GET `/api/auth/receipts` - Get user receipts
- GET `/api/auth/login-history` - Get login history
- DELETE `/api/auth/connect-wallet` - Disconnect wallet

## 🐛 Debugging

### Check console logs
```bash
# Terminal will show auth logs like:
[Auth/Signup] Processing request: ...
[Auth/Login] Login successful: ...
[Auth/ForgotPassword] Reset email sent: ...
```

### Check browser errors
- Open DevTools (F12)
- Check Console and Network tabs
- Look for 400/401/500 errors

### Test API directly
```bash
# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User",
    "password": "MyPass123",
    "confirmPassword": "MyPass123"
  }'
```

## 🔑 Key Routes

**Public** (no login needed):
- `/` - Home
- `/auth/signup` - Register
- `/auth/login` - Login
- `/auth/forgot-password` - Password reset
- `/tickets` - Browse tickets

**Protected** (login required):
- `/profile` - Profile dashboard
- `/account/*` - Account pages

## 💾 Data Flow

```
Frontend Form
    ↓
POST /api/auth/signup
    ↓
Validate input
    ↓  
Hash password (PBKDF2)
    ↓
Create user in Supabase
    ↓
Generate email token
    ↓
Send email via Brevo
    ↓
Return success to frontend
    ↓
Frontend redirects to verify email page
```

## 🚨 If Something Breaks

1. **Check .env.local has all keys**:
   - BREVO_API_KEY
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_KEY
   - JWT_SECRET

2. **Restart dev server**: `npm run dev`

3. **Clear browser cache**: DevTools → Storage → Clear All

4. **Check Supabase tables exist**: Open Supabase dashboard → Tables

5. **Check Brevo API key works**: Log into Brevo.com and verify key

## 📝 Ready to Go Features

✅ **Implemented**:
- Email verification (24h expiry)
- Password hashing (PBKDF2, 310k iterations)
- 2FA with authenticator apps
- Login history with device tracking
- Profile management (name, phone, bio)
- Password reset with email
- Wallet connection
- Account deletion
- Rate limiting
- Account locking after failed attempts

❌ **Not Implemented Yet** (Future):
- SMS 2FA
- Social login (Google, GitHub)
- Biometric auth
- Password reset confirmation email
- Session export
- IP whitelist

---

**That's it!** Your accounts system is ready. Users can now:
1. Sign up with email
2. Verify their email
3. Login securely
4. Manage their profile
5. Enable 2FA
6. Connect their wallet
7. Buy tickets!
