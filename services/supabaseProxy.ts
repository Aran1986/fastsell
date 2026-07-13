/**
 * Supabase Proxy Service
 * Handles all Supabase REST calls through this centralized service
 * to avoid CORS issues and centralize error handling
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';

export const supabaseProxy = {
  /**
   * Get all stores with related data
   */
  async getAllStores() {
    if (!isSupabaseConfigured) {
      console.warn('[v0] Supabase not configured - returning empty stores');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*, products(*), orders(*), reviews(*)');

      if (error) {
        console.error('[v0] Error fetching stores:', error.message);
        return [];
      }
      return data || [];
    } catch (err: any) {
      console.error('[v0] Stores fetch exception:', err.message);
      return [];
    }
  },

  /**
   * Register a new user
   */
  async registerUser(userData: {
    identifier: string;
    password?: string;
    auth_type: string;
    referral_code?: string;
    referred_by?: string;
  }) {
    if (!isSupabaseConfigured) {
      console.warn('[v0] Supabase not configured - skipping registration');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        console.error('[v0] Registration error:', error.message);
        return null;
      }
      return data;
    } catch (err: any) {
      console.error('[v0] Registration exception:', err.message);
      return null;
    }
  },

  /**
   * Get user by identifier
   */
  async getUser(identifier: string) {
    if (!isSupabaseConfigured) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('identifier', identifier)
        .single();

      if (error) {
        console.error('[v0] Get user error:', error.message);
        return null;
      }
      return data;
    } catch (err: any) {
      console.error('[v0] Get user exception:', err.message);
      return null;
    }
  },

  /**
   * Create an order
   */
  async createOrder(orderData: any) {
    if (!isSupabaseConfigured) {
      console.warn('[v0] Supabase not configured - skipping order creation');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error('[v0] Order creation error:', error.message);
        return null;
      }
      return data;
    } catch (err: any) {
      console.error('[v0] Order creation exception:', err.message);
      return null;
    }
  },

  /**
   * Get transactions for a seller
   */
  async getSellerTransactions(sellerId: string, limit = 100) {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('seller_id', sellerId)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[v0] Get transactions error:', error.message);
        return [];
      }
      return data || [];
    } catch (err: any) {
      console.error('[v0] Get transactions exception:', err.message);
      return [];
    }
  },

  /**
   * Update payment settings
   */
  async updatePaymentSettings(sellerId: string, settingsData: any) {
    if (!isSupabaseConfigured) {
      console.warn('[v0] Supabase not configured - skipping payment settings update');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .upsert(
          { seller_id: sellerId, ...settingsData },
          { onConflict: 'seller_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('[v0] Update payment settings error:', error.message);
        return null;
      }
      return data;
    } catch (err: any) {
      console.error('[v0] Update payment settings exception:', err.message);
      return null;
    }
  },
};
