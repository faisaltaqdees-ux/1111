# PSL Pulse Accounts System - URL & Endpoint Map

## 🌐 Frontend URLs

### Public Pages
| URL | Purpose |
|-----|---------|
| `/auth/signup` | User registration |
| `/auth/login` | User login |
| `/auth/forgot-password` | Request password reset |
| `/auth/verify-email` | Email verification (token in query param) |
| `/auth/reset-password` | Reset password page (token in query param) |

### Protected Pages (Login Required)
| URL | Purpose |
|-----|---------|
| `/profile` | Main profile dashboard |
| `/profile?tab=overview` | Account overview |
| `/profile?tab=receipts` | Ticket receipts history |
| `/profile?tab=security` | Security settings |
| `/profile?tab=connected` | Wallet management |
| `/profile?tab=history` | Login history |
| `/profile?tab=settings` | User preferences |

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api/auth
```

### 1. Signup
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "MyPassword123",
  "confirmPassword": "MyPassword123"
}

Response (201):
{
  "success": true,
  "userId": "abc123",
  "message": "Check your email to verify"
}
```

### 2. Login
```
POST /api/auth/user-login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "MyPassword123"
}

Response (200):
{
  "success": true,
  "token": "eyJ...",
  "userId": "abc123",
  "message": "Login successful"
}

Response (200 with 2FA):
{
  "success": true,
  "requires2FA": true,
  "userId": "abc123",
  "message": "Enter the code sent to your email"
}
```

### 3. Verify Email
```
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_here"
}

Response (200):
{
  "success": true,
  "userId": "abc123",
  "email": "user@example.com",
  "message": "Email verified successfully!"
}

GET /api/auth/verify-email?token=verification_token_here
Response: Redirect to /auth/login?verified=true
```

### 4. Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response (200):
{
  "success": true,
  "message": "If account exists, reset email sent"
}
```

### 5. Reset Password
```
POST /api/auth/reset-pass
Content-Type: application/json

{
  "token": "reset_token_here",
  "password": "NewPassword123",
  "confirmPassword": "NewPassword123"
}

Response (200):
{
  "success": true,
  "message": "Password reset successfully!"
}
```

### 6. Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone_number": "123-456-7890",
    "wallet_address": "0x...",
    "avatar_url": null,
    "bio": "Cricket fan",
    "email_verified": true,
    "two_fa_enabled": false,
    "account_status": "active",
    "created_at": "2026-04-15T...",
    "updated_at": "2026-04-15T...",
    "last_login_at": "2026-04-15T..."
  }
}
```

### 7. Update Profile
```
POST /api/auth/update-profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "full_name": "John Updated",
  "phone_number": "987-654-3210",
  "bio": "Updated bio",
  "avatar_url": "https://..."
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ...updated user... }
}
```

### 8. Change Password
```
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 9. Setup 2FA - Get QR Code
```
POST /api/auth/setup-2fa
Authorization: Bearer {token}
Content-Type: application/json

{
  "token": "{token}"
}

Response (200):
{
  "success": true,
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "recoveryCodes": ["ABC12345", "XYZ67890", ...]
}
```

### 10. Setup 2FA - Verify & Enable
```
PUT /api/auth/setup-2fa
Authorization: Bearer {token}
Content-Type: application/json

{
  "token": "{token}",
  "secret": "JBSWY3DPEHPK3PXP",
  "verificationCode": "123456",
  "recoveryCodes": ["ABC12345", ...]
}

Response (200):
{
  "success": true,
  "message": "2FA enabled successfully!"
}
```

### 11. Connect Wallet
```
POST /api/auth/connect-wallet
Authorization: Bearer {token}
Content-Type: application/json

{
  "walletAddress": "0x1234567890abcdef...",
  "token": "{token}"
}

Response (200):
{
  "success": true,
  "message": "Wallet connected successfully!",
  "walletAddress": "0x1234567890abcdef..."
}
```

### 12. Disconnect Wallet
```
DELETE /api/auth/connect-wallet
Authorization: Bearer {token}
Content-Type: application/json

{
  "token": "{token}"
}

Response (200):
{
  "success": true,
  "message": "Wallet disconnected"
}
```

### 13. Get User Receipts
```
GET /api/auth/receipts
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "receipts": [
    {
      "id": "receipt123",
      "transaction_hash": "0x...",
      "wallet_address": "0x...",
      "match_id": "match1",
      "token_id": "token1",
      "seat_section": "A-001",
      "qr_code": "data:image/png;base64,...",
      "created_at": "2026-04-15T..."
    }
  ]
}
```

### 14. Get Login History
```
GET /api/auth/login-history
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "history": [
    {
      "id": "login123",
      "ip_address": "203.0.113.45",
      "device_info": "Chrome on Windows (Desktop)",
      "login_type": "password",
      "success": true,
      "created_at": "2026-04-15T..."
    }
  ]
}
```

### 15. Delete Account
```
POST /api/auth/delete-account
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## 📋 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Password must be at least 6 characters",
    "Must contain at least one uppercase letter"
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many login attempts. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🔑 Authentication Methods

### Using Token
```typescript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Using HttpOnly Cookie (automatic)
Cookies are set automatically by the API. No need to manually handle.

---

## 📱 Test with cURL

### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User",
    "password": "MyPassword123",
    "confirmPassword": "MyPassword123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/user-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "MyPassword123"
  }'
```

### Get Current User
```bash
TOKEN="eyJ..." # From login response
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔗 Frontend Integration Example

```typescript
// Using the useAuth hook (recommended)
import { useAuth } from '@/lib/hooks/useAuth';

export function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.full_name}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

---

## 📊 Flow Diagram

```
User Browser
    ↓
Navigation to /auth/signup
    ↓
Submit form → POST /api/auth/signup
    ↓
API creates user, generates token, sends email
    ↓
Brevo delivers verification email
    ↓
User clicks link → GET /api/auth/verify-email?token=...
    ↓
Email verified → Redirect to /auth/login
    ↓
User enters credentials → POST /api/auth/user-login
    ↓
Token returned → Stored in localStorage + cookie
    ↓
Redirect to /profile
    ↓
Frontend fetches user → GET /api/auth/me
    ↓
Display profile dashboard
```

---

## ✅ You're All Set!

All endpoints are production-ready and tested. Start using them in your frontend!
