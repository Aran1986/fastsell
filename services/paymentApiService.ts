import { supabase } from './supabaseClient';
import { BankDetails } from '../types';

export interface PaymentSettings {
  id?: string;
  seller_id: string;
  seller_email: string;
  card_number?: string;
  account_number?: string;
  iban?: string;
  holder_name?: string;
  zarinpal_merchant_id?: string;
  stripe_key?: string;
  paypal_email?: string;
  paypal_client_id?: string;
  crypto_enabled?: boolean;
  wallet_address?: string;
  network?: string;
  notes?: string;
  active_gateways?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id?: string;
  tx_hash?: string;
  payment_method: string;
  amount: number;
  currency: string;
  seller_id: string;
  buyer_email?: string;
  buyer_wallet?: string;
  product_id?: string;
  product_name?: string;
  status: 'pending' | 'verified' | 'failed' | 'expired';
  verification_attempts?: number;
  verified_at?: string;
  network?: string;
  block_number?: number;
  from_address?: string;
  to_address?: string;
  metadata?: Record<string, any>;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CryptoWallet {
  id?: string;
  seller_id: string;
  network: string;
  wallet_address: string;
  is_primary?: boolean;
  enabled?: boolean;
  total_received?: number;
  transaction_count?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Payment Settings API
 */
export const paymentSettingsApi = {
  // Get payment settings for current user
  async getSettings(userId: string): Promise<PaymentSettings | null> {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('seller_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  // Get payment settings by seller email (for buyers to see payment options)
  async getSettingsByEmail(email: string): Promise<PaymentSettings | null> {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('seller_email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  // Save or update payment settings
  async saveSettings(userId: string, email: string, settings: Partial<BankDetails>): Promise<PaymentSettings> {
    // Check if settings already exist
    const existing = await this.getSettings(userId);

    const payload: Partial<PaymentSettings> = {
      seller_id: userId,
      seller_email: email,
      card_number: settings.cardNumber,
      account_number: settings.accountNumber,
      iban: settings.iban,
      holder_name: settings.holderName,
      zarinpal_merchant_id: settings.zarinpalMerchantId,
      stripe_key: settings.stripeKey,
      paypal_email: settings.paypalEmail,
      paypal_client_id: settings.paypalClientId,
      crypto_enabled: settings.cryptoEnabled,
      wallet_address: settings.walletAddress,
      network: settings.network,
      notes: settings.notes,
      active_gateways: settings.activeGateways,
    };

    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from('payment_settings')
        .update(payload)
        .eq('seller_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from('payment_settings')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },
};

/**
 * Transactions API
 */
export const transactionsApi = {
  // Create a new transaction
  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get transaction by ID
  async getTransaction(transactionId: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  // Get transaction by TX hash
  async getTransactionByHash(txHash: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('tx_hash', txHash)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  // Update transaction status
  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all transactions for a seller
  async getSellerTransactions(sellerId: string, limit = 50): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get pending transactions for a seller
  async getPendingTransactions(sellerId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('seller_id', sellerId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

/**
 * Crypto Wallets API
 */
export const cryptoWalletsApi = {
  // Add a new wallet
  async addWallet(wallet: Omit<CryptoWallet, 'id' | 'created_at' | 'updated_at'>): Promise<CryptoWallet> {
    const { data, error } = await supabase
      .from('crypto_wallets')
      .insert(wallet)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get wallets for a seller
  async getWallets(sellerId: string): Promise<CryptoWallet[]> {
    const { data, error } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('seller_id', sellerId)
      .order('is_primary', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Update wallet
  async updateWallet(walletId: string, updates: Partial<CryptoWallet>): Promise<CryptoWallet> {
    const { data, error } = await supabase
      .from('crypto_wallets')
      .update(updates)
      .eq('id', walletId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete wallet
  async deleteWallet(walletId: string): Promise<void> {
    const { error } = await supabase
      .from('crypto_wallets')
      .delete()
      .eq('id', walletId);

    if (error) throw error;
  },
};
