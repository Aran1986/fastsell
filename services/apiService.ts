
import { SalesLink, Product, Order, Currency, BankDetails, AppUser, AppNotification } from '../types';
import { FinanceService } from './financeService';
import { supabase } from './supabaseClient';

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const ApiService = {
  async getCurrentUser(): Promise<AppUser | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('identifier', session.user.email)
      .single();

    if (error || !user) return null;
    return {
      ...user,
      authType: user.auth_type as 'email' | 'phone',
      registeredAt: user.registered_at,
      referralCode: user.referral_code,
      referredBy: user.referred_by
    };
  },

  async register(data: { identifier: string, password?: string, authType: 'email' | 'phone', referredBy?: string }): Promise<AppUser> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.identifier,
      password: data.password || 'default-secret-123',
    });

    if (authError) throw authError;

    const newUser = {
      identifier: data.identifier,
      auth_type: data.authType,
      referral_code: Math.random().toString(36).substr(2, 6).toUpperCase(),
      referred_by: data.referredBy
    };

    const { data: user, error } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (error) throw error;
    return user as unknown as AppUser;
  },

  async login(identifier: string, password?: string): Promise<AppUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password: password || '',
    });

    if (error) throw error;
    
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error("User data not found");
    return currentUser;
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async getAllStores(): Promise<SalesLink[]> {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*, products(*)');

    if (error) return [];

    return (stores || []).map(s => ({
      ...s,
      ownerEmail: s.owner_email,
      themeColor: s.theme_color,
      buyButtonColor: s.buy_button_color,
      shippingFee: s.shipping_fee,
      defaultCurrency: s.default_currency as Currency,
      totalSales: s.total_sales,
      bankDetails: s.bank_details,
      products: (s.products || []).map((p: any) => ({
        ...p,
        discountPrice: p.discount_price,
        salesCount: p.sales_count,
        reviewCount: p.review_count,
        isFeatured: p.is_featured,
        shippingMethod: p.shipping_method
      }))
    }));
  },

  async saveStore(store: SalesLink): Promise<void> {
    const storeData = {
      owner_email: store.ownerEmail,
      slug: store.slug,
      title: store.title,
      bio: store.bio,
      theme_color: store.themeColor,
      buy_button_color: store.buyButtonColor,
      shipping_fee: store.shippingFee,
      default_currency: store.defaultCurrency,
      categories: store.categories,
      // Fixed: bank_details should be read from store.bankDetails (camelCase in TS)
      bank_details: store.bankDetails
    };

    // Only include ID if it's a valid UUID. If it's a mock ID like 'store_1', 
    // let Supabase generate a proper UUID.
    const payload = isUUID(store.id) ? { id: store.id, ...storeData } : storeData;

    const { error } = await supabase
      .from('stores')
      .upsert(payload)
      .select();

    if (error) throw error;
  },

  async createOrder(storeSlug: string, orderData: any): Promise<Order> {
    const { data: store } = await supabase.from('stores').select('id, owner_email').eq('slug', storeSlug).single();
    if (!store) throw new Error("Store not found");

    const dbOrder = {
      store_id: store.id,
      product_id: isUUID(orderData.productId) ? orderData.productId : undefined,
      product_name: orderData.productName,
      amount: orderData.amount,
      shipping_fee: orderData.shippingFee,
      total_paid: orderData.totalPaid,
      currency: orderData.currency,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      customer_address: orderData.customerAddress,
      customer_postal_code: orderData.customerPostalCode,
      selected_variants: orderData.selected_variants,
      source: orderData.source
    };

    const { data: order, error } = await supabase
      .from('orders')
      .insert(dbOrder)
      .select()
      .single();

    if (error) throw error;
    return order as unknown as Order;
  },

  async addNotification(identifier: string, notif: any) {
    await supabase.from('notifications').insert({
      user_id: identifier,
      text: notif.text,
      type: notif.type
    });
  }
};
