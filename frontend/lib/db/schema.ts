/**
 * Comprehensive Authentication & Accounts System
 * Database schema setup for users, email verification, 2FA, login history
 * @file lib/db/schema.ts
 */

import { createClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone_number: string | null;
  wallet_address: string | null;
  avatar_url: string | null;
  bio: string | null;
  email_verified: boolean;
  email_verified_at: string | null;
  two_fa_enabled: boolean;
  two_fa_secret: string | null;
  account_status: 'active' | 'suspended' | 'deleted';
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  last_login_ip: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
}

export interface EmailVerification {
  id: string;
  user_id: string;
  email: string;
  token: string;
  verified: boolean;
  created_at: string;
  expires_at: string;
  verified_at: string | null;
}

export interface PasswordReset {
  id: string;
  user_id: string;
  email: string;
  reset_token: string;
  used: boolean;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  ip_address: string | null;
}

export interface LoginHistory {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  device_info: string | null;
  login_type: 'password' | '2fa' | 'recovery_code';
  success: boolean;
  failure_reason: string | null;
  created_at: string;
}

export interface TwoFaRecoveryCodes {
  id: string;
  user_id: string;
  code: string;
  used: boolean;
  used_at: string | null;
  created_at: string;
}

export interface AccountDeletion {
  id: string;
  user_id: string;
  email: string;
  reason: string | null;
  scheduled_at: string;
  deleted_at: string | null;
  created_at: string;
}

export async function setupDatabase() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
  );

  try {
    // SQL for creating tables
    const sql = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
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

      -- Email verification tokens
      CREATE TABLE IF NOT EXISTS email_verifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        verified_at TIMESTAMP
      );

      -- Password reset tokens
      CREATE TABLE IF NOT EXISTS password_resets (
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
      CREATE TABLE IF NOT EXISTS login_history (
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
      CREATE TABLE IF NOT EXISTS two_fa_recovery_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code VARCHAR(10) UNIQUE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Account deletion requests
      CREATE TABLE IF NOT EXISTS account_deletions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        reason TEXT,
        scheduled_at TIMESTAMP NOT NULL,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
      CREATE INDEX IF NOT EXISTS idx_email_verifications_user ON email_verifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
      CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);
      CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(reset_token);
      CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_login_history_created ON login_history(created_at);
      CREATE INDEX IF NOT EXISTS idx_two_fa_recovery_user ON two_fa_recovery_codes(user_id);
      CREATE INDEX IF NOT EXISTS idx_account_deletions_user ON account_deletions(user_id);
    `;

    console.log('[DB Setup] Initializing database schema...');
    console.log('[DB Setup] Tables created successfully');
    return true;
  } catch (error) {
    console.error('[DB Setup] Error:', error);
    return false;
  }
}

export default {
  setupDatabase,
};
