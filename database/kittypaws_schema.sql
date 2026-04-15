-- ========================================
-- KittyPaws Cricket Ticket Platform
-- Complete Database Schema
-- For Supabase PostgreSQL
-- ========================================

-- ========== USERS TABLE ==========
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  bio VARCHAR(500),
  wallet_address VARCHAR(42) UNIQUE,
  chain_id INTEGER,
  wallet_provider VARCHAR(50),
  is_email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  wallet_connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_email CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  CONSTRAINT valid_wallet CHECK (wallet_address IS NULL OR wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- ========== EMAIL VERIFICATIONS TABLE ==========
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

-- ========== PAYMENT SESSIONS TABLE ==========
CREATE TABLE IF NOT EXISTS payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id VARCHAR(255) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  currency VARCHAR(10) DEFAULT 'WIRE',
  wallet_address VARCHAR(42) NOT NULL,
  status VARCHAR(50) CHECK (status IN ('pending', 'confirmed', 'failed', 'expired')) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== TRANSACTIONS TABLE ==========
-- CRITICAL: Stores all transaction hashes for payment tracking
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE REFERENCES payment_sessions(session_id),
  transaction_hash VARCHAR(66) UNIQUE NOT NULL,
  block_number INTEGER,
  confirmations INTEGER DEFAULT 0,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  currency VARCHAR(10) DEFAULT 'WIRE',
  status VARCHAR(50) CHECK (status IN ('pending', 'confirming', 'confirmed', 'failed')) DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== MATCHES TABLE ==========
-- Stores match data from CricAPI
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id VARCHAR(50) UNIQUE NOT NULL,
  team1 VARCHAR(255) NOT NULL,
  team2 VARCHAR(255) NOT NULL,
  match_type VARCHAR(20) CHECK (match_type IN ('test', 'odi', 't20')) NOT NULL,
  match_status VARCHAR(50) CHECK (match_status IN ('upcoming', 'live', 'completed')),
  venue VARCHAR(255),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  series_id VARCHAR(100),
  series_name VARCHAR(255),
  team1_score INTEGER,
  team1_wickets INTEGER,
  team1_overs DECIMAL(4, 1),
  team2_score INTEGER,
  team2_wickets INTEGER,
  team2_overs DECIMAL(4, 1),
  toss_winner VARCHAR(255),
  result VARCHAR(500),
  umpire1 VARCHAR(255),
  umpire2 VARCHAR(255),
  live_match BOOLEAN DEFAULT FALSE,
  api_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== TICKETS TABLE ==========
-- Individual ticket records
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id VARCHAR(50) NOT NULL REFERENCES matches(match_id),
  email VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  ticket_type VARCHAR(50) CHECK (ticket_type IN ('standard', 'vip', 'premium')) NOT NULL,
  quantity INTEGER DEFAULT 1,
  seat_number VARCHAR(50),
  section VARCHAR(50),
  price_pkr DECIMAL(20, 2) NOT NULL,
  price_wire DECIMAL(20, 8) NOT NULL,
  transaction_hash VARCHAR(66) REFERENCES transactions(transaction_hash),
  nft_token_id VARCHAR(255) UNIQUE,
  qr_code TEXT,
  receipt_id VARCHAR(100),
  status VARCHAR(50) CHECK (status IN ('pending', 'confirmed', 'used', 'cancelled')) DEFAULT 'pending',
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== NFT MINTING RECORDS TABLE ==========
-- Tracks all NFT minting with transaction hashes
CREATE TABLE IF NOT EXISTS nft_minting_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id VARCHAR(255) UNIQUE NOT NULL,
  ticket_id VARCHAR(100) REFERENCES tickets(ticket_id),
  match_id VARCHAR(50) NOT NULL REFERENCES matches(match_id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  transaction_hash VARCHAR(66) UNIQUE NOT NULL REFERENCES transactions(transaction_hash),
  contract_address VARCHAR(42),
  block_number INTEGER,
  gas_used VARCHAR(50),
  metadata_uri TEXT,
  minting_status VARCHAR(50) CHECK (minting_status IN ('initiated', 'pending', 'confirmed', 'failed')) DEFAULT 'initiated',
  minted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== RECEIPTS TABLE ==========
-- Digital receipts for purchases
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_hash VARCHAR(66) UNIQUE NOT NULL REFERENCES transactions(transaction_hash),
  match_id VARCHAR(50) NOT NULL REFERENCES matches(match_id),
  email VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  total_amount_pkr DECIMAL(20, 2) NOT NULL,
  total_amount_wire DECIMAL(20, 8) NOT NULL,
  quantity INTEGER NOT NULL,
  ticket_type VARCHAR(50) NOT NULL,
  html_content TEXT,
  csv_content TEXT,
  nft_token_ids TEXT[], -- Array of token IDs
  qr_code TEXT,
  status VARCHAR(50) CHECK (status IN ('draft', 'generated', 'sent', 'viewed')) DEFAULT 'generated',
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== TICKET RESERVATIONS TABLE ==========
-- Temporarily reserve tickets during purchase
CREATE TABLE IF NOT EXISTS ticket_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id VARCHAR(50) NOT NULL REFERENCES matches(match_id),
  quantity INTEGER NOT NULL,
  ticket_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) CHECK (status IN ('active', 'confirmed', 'expired', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ========== AUDIT LOGS TABLE ==========
-- Track all important actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== PAYMENT LIMITS TABLE ==========
-- Track user spending and set limits
CREATE TABLE IF NOT EXISTS payment_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  daily_limit_wire DECIMAL(20, 8) DEFAULT 100,
  daily_limit_pkr DECIMAL(20, 2) DEFAULT 1000000,
  monthly_limit_wire DECIMAL(20, 8) DEFAULT 500,
  monthly_limit_pkr DECIMAL(20, 2) DEFAULT 5000000,
  daily_spent_wire DECIMAL(20, 8) DEFAULT 0,
  daily_spent_pkr DECIMAL(20, 2) DEFAULT 0,
  monthly_spent_wire DECIMAL(20, 8) DEFAULT 0,
  monthly_spent_pkr DECIMAL(20, 2) DEFAULT 0,
  daily_reset_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  monthly_reset_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== MATCH INVENTORY TABLE ==========
-- Track ticket availability for each match
CREATE TABLE IF NOT EXISTS match_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id VARCHAR(50) NOT NULL REFERENCES matches(match_id),
  ticket_type VARCHAR(50) CHECK (ticket_type IN ('standard', 'vip', 'premium')) NOT NULL,
  total_capacity INTEGER NOT NULL,
  sold_count INTEGER DEFAULT 0,
  reserved_count INTEGER DEFAULT 0,
  available_count INTEGER DEFAULT 0,
  price_pkr DECIMAL(20, 2) NOT NULL,
  price_wire DECIMAL(20, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(match_id, ticket_type),
  CHECK (available_count >= 0)
);

-- ========== CREATE INDEXES ==========

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Email verification indexes
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_otp ON email_verifications(otp);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

-- Payment sessions indexes
CREATE INDEX IF NOT EXISTS idx_payment_sessions_user_id ON payment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_session_id ON payment_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_match_id ON payment_sessions(match_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON payment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_expires_at ON payment_sessions(expires_at);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_hash ON transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_match_id ON transactions(match_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_address);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_match_id ON matches(match_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(match_status);
CREATE INDEX IF NOT EXISTS idx_matches_start_time ON matches(start_time);
CREATE INDEX IF NOT EXISTS idx_matches_series_id ON matches(series_id);
CREATE INDEX IF NOT EXISTS idx_matches_type ON matches(match_type);
CREATE INDEX IF NOT EXISTS idx_matches_live ON matches(live_match);

-- Tickets indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_match_id ON tickets(match_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_id ON tickets(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_nft_token_id ON tickets(nft_token_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_transaction_hash ON tickets(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_tickets_purchased_at ON tickets(purchased_at);

-- NFT minting records indexes
CREATE INDEX IF NOT EXISTS idx_nft_token_id ON nft_minting_records(token_id);
CREATE INDEX IF NOT EXISTS idx_nft_match_id ON nft_minting_records(match_id);
CREATE INDEX IF NOT EXISTS idx_nft_user_id ON nft_minting_records(user_id);
CREATE INDEX IF NOT EXISTS idx_nft_transaction_hash ON nft_minting_records(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_nft_wallet_address ON nft_minting_records(wallet_address);
CREATE INDEX IF NOT EXISTS idx_nft_status ON nft_minting_records(minting_status);
CREATE INDEX IF NOT EXISTS idx_nft_minted_at ON nft_minting_records(minted_at);

-- Receipts indexes
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_id ON receipts(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_transaction_hash ON receipts(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_receipts_match_id ON receipts(match_id);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);

-- Ticket reservations indexes
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON ticket_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_match_id ON ticket_reservations(match_id);
CREATE INDEX IF NOT EXISTS idx_reservations_expires_at ON ticket_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON ticket_reservations(status);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);

-- Payment limits indexes
CREATE INDEX IF NOT EXISTS idx_payment_limits_user_id ON payment_limits(user_id);

-- Match inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_match_id ON match_inventory(match_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ticket_type ON match_inventory(ticket_type);

-- ========== VIEWS FOR REPORTING ==========

-- Active transactions view
CREATE OR REPLACE VIEW v_active_transactions AS
SELECT 
  t.id,
  t.transaction_hash,
  t.user_id,
  u.email,
  u.wallet_address,
  t.match_id,
  m.team1,
  m.team2,
  t.amount,
  t.status,
  t.confirmations,
  t.created_at
FROM transactions t
JOIN users u ON t.user_id = u.id
JOIN matches m ON t.match_id = m.match_id
WHERE t.status IN ('pending', 'confirming')
ORDER BY t.created_at DESC;

-- User ticket summary view
CREATE OR REPLACE VIEW v_user_tickets AS
SELECT 
  u.id,
  u.email,
  COUNT(DISTINCT t.id) as total_tickets,
  COUNT(DISTINCT CASE WHEN t.status = 'confirmed' THEN t.id END) as confirmed_tickets,
  COUNT(DISTINCT CASE WHEN t.status = 'used' THEN t.id END) as used_tickets,
  SUM(t.price_wire) as total_spent_wire,
  SUM(t.price_pkr) as total_spent_pkr
FROM users u
LEFT JOIN tickets t ON u.id = t.user_id
GROUP BY u.id, u.email;

-- Match revenue view
CREATE OR REPLACE VIEW v_match_revenue AS
SELECT 
  m.match_id,
  m.team1,
  m.team2,
  m.start_time,
  COUNT(DISTINCT t.id) as total_tickets_sold,
  COUNT(DISTINCT CASE WHEN t.status = 'confirmed' THEN t.id END) as confirmed_tickets,
  SUM(t.price_wire) as total_revenue_wire,
  SUM(t.price_pkr) as total_revenue_pkr
FROM matches m
LEFT JOIN tickets t ON m.match_id = t.match_id
GROUP BY m.match_id, m.team1, m.team2, m.start_time;

-- ========== FUNCTIONS ==========

-- Function to update ticket availability after sale
CREATE OR REPLACE FUNCTION update_inventory_after_sale()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    UPDATE match_inventory
    SET sold_count = sold_count + NEW.quantity,
        available_count = total_capacity - sold_count - NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE match_id = NEW.match_id AND ticket_type = NEW.ticket_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for inventory updates
CREATE OR REPLACE TRIGGER trg_update_inventory_after_sale
AFTER UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_inventory_after_sale();

-- Function to clean up expired payment sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS TABLE(deleted_count INT) AS $$
DECLARE
  _count INT;
BEGIN
  DELETE FROM payment_sessions
  WHERE status = 'pending' AND expires_at < CURRENT_TIMESTAMP;
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN QUERY SELECT _count;
END;
$$ LANGUAGE plpgsql;

-- ========== INITIAL DATA ==========

-- Insert sample match types
INSERT INTO matches (match_id, team1, team2, match_type, match_status, venue, start_time, series_id, series_name)
VALUES
  ('match_001', 'Pakistan', 'India', 'odi', 'upcoming', 'National Stadium, Karachi', CURRENT_TIMESTAMP + INTERVAL '7 days', 'series_001', 'Asia Cup 2026'),
  ('match_002', 'Australia', 'England', 't20', 'upcoming', 'MCG, Melbourne', CURRENT_TIMESTAMP + INTERVAL '14 days', 'series_002', 'T20 World Cup 2026'),
  ('match_003', 'South Africa', 'West Indies', 'test', 'upcoming', 'Wanderers Stadium, Johannesburg', CURRENT_TIMESTAMP + INTERVAL '21 days', 'series_003', 'Test Series 2026')
ON CONFLICT DO NOTHING;

-- Initialize match inventory
INSERT INTO match_inventory (match_id, ticket_type, total_capacity, price_pkr, price_wire)
SELECT 
  m.match_id,
  tt.ticket_type,
  CASE tt.ticket_type WHEN 'standard' THEN 10000 WHEN 'vip' THEN 2000 ELSE 500 END as capacity,
  CASE tt.ticket_type WHEN 'standard' THEN 2500 WHEN 'vip' THEN 5000 ELSE 10000 END as price_pkr,
  CASE tt.ticket_type WHEN 'standard' THEN 2.5 WHEN 'vip' THEN 5 ELSE 10 END as price_wire
FROM matches m
CROSS JOIN (VALUES ('standard'), ('vip'), ('premium')) AS tt(ticket_type)
WHERE m.match_id LIKE 'match_%'
ON CONFLICT DO NOTHING;

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_transactions_created_match_status ON transactions(match_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_user_status_match ON tickets(user_id, status, match_id);
CREATE INDEX IF NOT EXISTS idx_nft_user_confirmed ON nft_minting_records(user_id, minting_status);
CREATE INDEX IF NOT EXISTS idx_receipts_user_created ON receipts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action_created ON audit_logs(action, created_at DESC);

-- ========== ENABLE ROW LEVEL SECURITY (RLS) ==========

-- Enable RLS on sensitive tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_minting_records ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own transactions
CREATE POLICY transactions_user_policy ON transactions
  FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policy: Users can only see their own tickets
CREATE POLICY tickets_user_policy ON tickets
  FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policy: Users can only see their own receipts
CREATE POLICY receipts_user_policy ON receipts
  FOR SELECT
  USING (user_id = auth.uid());

-- ========== COMMENTS ==========

COMMENT ON TABLE transactions IS 'Stores all blockchain transactions with hashes for payment tracking';
COMMENT ON TABLE tickets IS 'Individual ticket records with NFT token IDs';
COMMENT ON TABLE nft_minting_records IS 'NFT minting records with transaction hashes for audit trail';
COMMENT ON TABLE receipts IS 'Digital receipts generated for all purchases';
COMMENT ON TABLE matches IS 'Cricket match data synced from CricAPI';
COMMENT ON COLUMN transactions.transaction_hash IS 'Blockchain transaction hash - CRITICAL for payment verification';
COMMENT ON COLUMN nft_minting_records.transaction_hash IS 'NFT minting transaction hash - links to blockchain';
COMMENT ON COLUMN tickets.nft_token_id IS 'ERC721 token ID for the minted ticket NFT';
