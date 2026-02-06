-- Create payment_settings table for storing seller payment configurations
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  seller_email TEXT NOT NULL,
  
  -- ZarinPal / Iranian Banking
  card_number TEXT,
  account_number TEXT,
  iban TEXT,
  holder_name TEXT,
  zarinpal_merchant_id TEXT,
  
  -- Stripe
  stripe_key TEXT,
  
  -- PayPal
  paypal_email TEXT,
  paypal_client_id TEXT,
  
  -- Crypto
  crypto_enabled BOOLEAN DEFAULT false,
  wallet_address TEXT,
  network TEXT,
  
  -- General
  notes TEXT,
  active_gateways TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(seller_id)
);

-- Create transactions table for tracking all payments
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Transaction Info
  tx_hash TEXT,
  payment_method TEXT NOT NULL, -- 'zarinpal', 'stripe', 'paypal', 'crypto'
  amount DECIMAL(20, 8) NOT NULL,
  currency TEXT NOT NULL, -- 'IRR', 'USD', 'USDT', 'BTC', etc.
  
  -- Parties
  seller_id UUID NOT NULL,
  buyer_email TEXT,
  buyer_wallet TEXT,
  
  -- Product Info
  product_id UUID,
  product_name TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'failed', 'refunded'
  verification_attempts INTEGER DEFAULT 0,
  verified_at TIMESTAMPTZ,
  
  -- Crypto specific
  network TEXT, -- 'TRC20', 'ERC20', 'BEP20', 'SOL'
  block_number BIGINT,
  from_address TEXT,
  to_address TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create crypto_wallets table for multi-wallet support
CREATE TABLE IF NOT EXISTS crypto_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  
  network TEXT NOT NULL, -- 'TRC20', 'ERC20', 'BEP20', 'SOL'
  wallet_address TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  enabled BOOLEAN DEFAULT true,
  
  -- Stats
  total_received DECIMAL(20, 8) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(seller_id, network, wallet_address)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_settings_seller ON payment_settings(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_seller ON crypto_wallets(seller_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_address ON crypto_wallets(wallet_address);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_payment_settings_updated_at BEFORE UPDATE ON payment_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crypto_wallets_updated_at BEFORE UPDATE ON crypto_wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_settings
CREATE POLICY "Users can view their own payment settings"
  ON payment_settings FOR SELECT
  USING (seller_id = auth.uid() OR seller_email = auth.jwt()->>'email');

CREATE POLICY "Users can insert their own payment settings"
  ON payment_settings FOR INSERT
  WITH CHECK (seller_id = auth.uid() OR seller_email = auth.jwt()->>'email');

CREATE POLICY "Users can update their own payment settings"
  ON payment_settings FOR UPDATE
  USING (seller_id = auth.uid() OR seller_email = auth.jwt()->>'email');

-- RLS Policies for transactions
CREATE POLICY "Sellers can view their transactions"
  ON transactions FOR SELECT
  USING (seller_id = auth.uid());

CREATE POLICY "Anyone can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sellers can update their transactions"
  ON transactions FOR UPDATE
  USING (seller_id = auth.uid());

-- RLS Policies for crypto_wallets
CREATE POLICY "Users can view their own wallets"
  ON crypto_wallets FOR SELECT
  USING (seller_id = auth.uid());

CREATE POLICY "Users can insert their own wallets"
  ON crypto_wallets FOR INSERT
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can update their own wallets"
  ON crypto_wallets FOR UPDATE
  USING (seller_id = auth.uid());

CREATE POLICY "Users can delete their own wallets"
  ON crypto_wallets FOR DELETE
  USING (seller_id = auth.uid());
