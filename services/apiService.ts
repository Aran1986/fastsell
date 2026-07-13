
import { SalesLink, Product, Order, Currency, AppUser, Review, StoreMode } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { supabaseProxy } from './supabaseProxy';
import { INITIAL_STORES } from '../constants/mockData';

const LOCAL_STORES_KEY = 'fastsell_local_stores';
const LOCAL_USER_KEY = 'fastsell_local_user';

export const ApiService = {
  // --- USER AUTH ---
  async getCurrentUser(): Promise<AppUser | null> {
    if (!isSupabaseConfigured) {
      const savedUser = localStorage.getItem(LOCAL_USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return null;
      const { data: user } = await supabase.from('users').select('*').eq('identifier', session.user.email).maybeSingle();
      if (!user) return null;
      return this.mapUserData(user);
    } catch (e) { return null; }
  },

  async register(data: { identifier: string, password?: string, authType: 'email' | 'phone', referredBy?: string }): Promise<AppUser | null> {
    // If Supabase not configured, use localStorage
    if (!isSupabaseConfigured) {
      const mockUser: AppUser = { 
        id: 'u_' + Math.random().toString(36).substr(2, 9), 
        identifier: data.identifier, 
        authType: data.authType, 
        registeredAt: new Date().toISOString(), 
        referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(), 
        referredBy: data.referredBy, 
        notifications: [] 
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
      console.log('[v0] User registered locally:', data.identifier);
      return mockUser;
    }
    
    try {
      const { data: newUser, error } = await supabase.from('users').insert([{
        identifier: data.identifier,
        password: data.password,
        auth_type: data.authType,
        referral_code: Math.random().toString(36).substr(2, 6).toUpperCase(),
        referred_by: data.referredBy
      }]).select().single();
      
      if (error) {
        console.error('[v0] Supabase registration error:', error);
        // Fallback to localStorage if Supabase fails
        const mockUser: AppUser = { 
          id: 'u_' + Math.random().toString(36).substr(2, 9), 
          identifier: data.identifier, 
          authType: data.authType, 
          registeredAt: new Date().toISOString(), 
          referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(), 
          referredBy: data.referredBy, 
          notifications: [] 
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
        return mockUser;
      }
      return this.mapUserData(newUser);
    } catch (err: any) {
      console.error('[v0] Registration error:', err.message);
      // Final fallback to localStorage
      const mockUser: AppUser = { 
        id: 'u_' + Math.random().toString(36).substr(2, 9), 
        identifier: data.identifier, 
        authType: data.authType, 
        registeredAt: new Date().toISOString(), 
        referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(), 
        referredBy: data.referredBy, 
        notifications: [] 
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
      return mockUser;
    }
  },

  async login(identifier: string, password?: string): Promise<AppUser> {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      if (saved) {
        const user = JSON.parse(saved);
        if (user.identifier === identifier) return user;
      }
      return await this.register({ identifier, authType: 'email' }) as AppUser;
    }
    
    const { data: user, error } = await supabase.from('users').select('*').eq('identifier', identifier).maybeSingle();
    if (!user) return await this.register({ identifier, password, authType: 'email' }) as AppUser;
    return this.mapUserData(user);
  },

  async logout() {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    localStorage.removeItem(LOCAL_USER_KEY);
  },

  // --- STORES & PRODUCTS ---
  async getAllStores(): Promise<SalesLink[]> {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem(LOCAL_STORES_KEY);
      return saved ? JSON.parse(saved) : INITIAL_STORES;
    }
    try {
      const stores = await supabaseProxy.getAllStores();
      
      if (!stores || stores.length === 0) return INITIAL_STORES;

      return stores.map(s => this.mapStoreData(s, s.products || [], s.orders || [], s.reviews || []));
    } catch (e) {
      console.error("[v0] Fetch Stores Error:", e);
      // Fallback to localStorage
      const saved = localStorage.getItem(LOCAL_STORES_KEY);
      return saved ? JSON.parse(saved) : INITIAL_STORES;
    }
  },

  async saveStore(store: SalesLink): Promise<string> {
    if (!isSupabaseConfigured) {
      const stores = this.getLocalStores();
      const existingIdx = stores.findIndex(s => s.slug === store.slug);
      const updatedStore = { ...store, id: store.id || Math.random().toString(36).substr(2, 9) };
      if (existingIdx > -1) stores[existingIdx] = updatedStore;
      else stores.push(updatedStore);
      this.saveLocalStores(stores);
      return updatedStore.id;
    }

    const dbData = {
      owner_email: store.ownerEmail,
      slug: store.slug,
      title: store.title,
      bio: store.bio,
      mode: store.mode,
      theme_color: store.themeColor,
      buy_button_color: store.buyButtonColor,
      shipping_fee: store.shippingFee,
      default_currency: store.defaultCurrency,
      categories: store.categories,
      bank_details: store.bankDetails,
      integrations: store.integrations
    };

    const { data, error } = await supabase.from('stores').upsert([dbData], { onConflict: 'slug' }).select().single();
    if (error) throw error;
    return data.id;
  },

  async saveProduct(linkId: string, product: Omit<Product, 'id' | 'salesCount'>): Promise<void> {
    if (!isSupabaseConfigured) {
      const stores = this.getLocalStores();
      const store = stores.find(s => s.id === linkId || s.slug === linkId);
      if (store) {
        const newProd = { ...product, id: 'p' + Math.random().toString(36).substr(2, 9), salesCount: 0 };
        store.products.push(newProd as Product);
        this.saveLocalStores(stores);
      }
      return;
    }

    // Smart lookup by ID (UUID) or Slug
    let query = supabase.from('stores').select('id');
    if (linkId.match(/^[0-9a-fA-F-]{36}$/)) {
        query = query.eq('id', linkId);
    } else {
        query = query.eq('slug', linkId);
    }
    
    const { data: store } = await query.maybeSingle();
    if (!store) throw new Error("Store not found");

    const { error } = await supabase.from('products').insert([{
      store_id: store.id,
      name: product.name,
      description: product.description,
      price: product.price,
      discount_price: product.discountPrice,
      currency: product.currency,
      image: product.image,
      category: product.category,
      stock: product.stock,
      is_featured: product.isFeatured,
      shipping_method: product.shippingMethod,
      variants: product.variants,
      duration_minutes: product.durationMinutes,
      is_online: product.isOnline,
      available_slots: product.availableSlots
    }]);
    if (error) throw error;
  },

  async deleteProduct(productId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      const stores = this.getLocalStores();
      stores.forEach(s => { s.products = s.products.filter(p => p.id !== productId); });
      this.saveLocalStores(stores);
      return;
    }
    await supabase.from('products').delete().eq('id', productId);
  },

  async createOrder(storeSlug: string, orderData: any): Promise<Order> {
    if (!isSupabaseConfigured) {
      const stores = this.getLocalStores();
      const store = stores.find(s => s.slug === storeSlug);
      if (!store) throw new Error("Store not found.");
      const newOrder: Order = { ...orderData, id: 'ord_' + Math.random().toString(36).substr(2, 9), status: 'pending', date: new Date().toISOString() };
      store.orders = store.orders || [];
      store.orders.push(newOrder);
      const prod = store.products.find(p => p.id === orderData.productId);
      if (prod) { prod.salesCount = (prod.salesCount || 0) + 1; prod.stock = Math.max(0, prod.stock - 1); }
      this.saveLocalStores(stores);
      return newOrder;
    }

    const { data: store } = await supabase.from('stores').select('id').eq('slug', storeSlug).single();
    if (!store) throw new Error("Store not found");

    const { data: order, error } = await supabase.from('orders').insert([{
      store_id: store.id,
      product_id: orderData.productId,
      product_name: orderData.productName,
      amount: orderData.amount,
      shipping_fee: orderData.shippingFee,
      total_paid: orderData.totalPaid,
      currency: orderData.currency,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      customer_address: orderData.customerAddress,
      customer_postal_code: orderData.customerPostalCode,
      selected_variants: orderData.selectedVariants,
      source: orderData.source,
      traffic_source: orderData.trafficSource,
      booking_date: orderData.bookingDate,
      booking_time: orderData.bookingTime
    }]).select().single();

    if (error) throw error;
    return order;
  },

  async addReview(storeSlug: string, review: Omit<Review, 'id' | 'date'>): Promise<void> {
    if (!isSupabaseConfigured) {
      const stores = this.getLocalStores();
      const store = stores.find(s => s.slug === storeSlug);
      if (store) {
        if (!store.reviews) store.reviews = [];
        store.reviews.push({ ...review, id: 'rev_' + Date.now(), date: new Date().toISOString() });
        this.saveLocalStores(stores);
      }
      return;
    }
    
    const { data: store } = await supabase.from('stores').select('id').eq('slug', storeSlug).single();
    if (!store) throw new Error("Store not found");

    await supabase.from('reviews').insert([{
      store_id: store.id,
      product_id: review.productId,
      customer_name: review.customerName,
      rating: review.rating,
      comment: review.comment
    }]);
  },

  // --- HELPERS ---
  getLocalStores(): SalesLink[] {
    const saved = localStorage.getItem(LOCAL_STORES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  },

  saveLocalStores(stores: SalesLink[]) {
    localStorage.setItem(LOCAL_STORES_KEY, JSON.stringify(stores));
  },

  mapUserData(u: any): AppUser {
    return {
      id: u.id,
      identifier: u.identifier,
      authType: u.auth_type,
      registeredAt: u.registered_at,
      referralCode: u.referral_code,
      referredBy: u.referred_by,
      notifications: u.notifications || []
    };
  },

  mapStoreData(s: any, products: any[], orders: any[], reviews: any[]): SalesLink {
    return {
      id: s.id,
      ownerEmail: s.owner_email,
      slug: s.slug,
      title: s.title,
      bio: s.bio,
      mode: (s.mode as StoreMode) || StoreMode.PRODUCT,
      themeColor: s.theme_color,
      buyButtonColor: s.buy_button_color,
      shippingFee: Number(s.shipping_fee) || 0,
      defaultCurrency: s.default_currency,
      categories: s.categories || [],
      bankDetails: s.bank_details || {},
      integrations: s.integrations || {},
      trustScore: Number(s.trust_score) || 5.0,
      reputationPoints: Number(s.reputation_points) || 0,
      totalSales: Number(s.total_sales) || 0,
      lastActiveAt: s.last_active_at,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        discountPrice: p.discount_price ? Number(p.discount_price) : undefined,
        currency: p.currency,
        image: p.image,
        category: p.category,
        stock: p.stock,
        salesCount: p.sales_count || 0,
        rating: p.rating || 5.0,
        reviewCount: p.review_count || 0,
        isFeatured: p.is_featured,
        variants: p.variants || [],
        shippingMethod: p.shipping_method || 'post',
        durationMinutes: p.duration_minutes,
        isOnline: p.is_online,
        availableSlots: p.available_slots
      })),
      orders: orders.map(o => ({
        id: o.id,
        productId: o.product_id,
        productName: o.product_name,
        amount: Number(o.amount),
        shippingFee: Number(o.shipping_fee) || 0,
        totalPaid: Number(o.total_paid),
        currency: o.currency,
        customerEmail: o.customer_email,
        customerPhone: o.customer_phone,
        customerAddress: o.customer_address,
        customerPostalCode: o.customer_postal_code,
        status: o.status || 'pending',
        date: o.created_at || o.date,
        source: o.source || 'direct',
        trafficSource: o.traffic_source,
        systemFee: Number(o.system_fee) || 0,
        affiliateReward: Number(o.affiliate_reward) || 0,
        sellerNet: Number(o.seller_net) || 0,
        shippingMethod: o.shipping_method || 'post',
        bookingDate: o.booking_date,
        bookingTime: o.booking_time
      })),
      reviews: reviews.map(r => ({
        id: r.id,
        orderId: r.order_id || 'N/A',
        productId: r.product_id,
        customerName: r.customer_name,
        customerEmail: r.customer_email || 'anonymous@test.com',
        rating: r.rating,
        comment: r.comment,
        date: r.date
      }))
    };
  },

  async getRecommendedProducts(currentProductId: string, currentStoreSlug: string): Promise<any[]> {
    const stores = await this.getAllStores();
    return stores.flatMap(s => s.products).filter(p => p.id !== currentProductId).slice(0, 2);
  },

  async verifyPurchase(identifier: string, productId: string): Promise<boolean> {
    const stores = await this.getAllStores();
    return stores.some(s => s.orders?.some(o => (o.customerEmail === identifier || o.customerPhone === identifier) && o.productId === productId));
  },

  async getLastCustomerDetails(identifier: string) {
    const stores = await this.getAllStores();
    const allOrders = stores.flatMap(s => s.orders || []);
    return allOrders
      .filter(o => o.customerEmail === identifier || o.customerPhone === identifier)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }
};
