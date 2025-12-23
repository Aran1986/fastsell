
import { SalesLink, Product, Order, Currency, AppUser } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_STORES } from '../constants/mockData';

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
const LOCAL_STORES_KEY = 'fastsell_local_stores';

export const ApiService = {
  async getCurrentUser(): Promise<AppUser | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return null;

      // Use maybeSingle() instead of single() to avoid 406/404 errors in console when user profile doesn't exist yet
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('identifier', session.user.email)
        .maybeSingle();

      if (error || !user) return null;
      
      return {
        ...user,
        authType: user.auth_type as 'email' | 'phone',
        registeredAt: user.registered_at,
        referralCode: user.referral_code,
        referredBy: user.referred_by,
        notifications: user.notifications || []
      };
    } catch (e) {
      console.warn("Auth session check failed:", e);
      return null;
    }
  },

  async getAllStores(): Promise<SalesLink[]> {
    if (!isSupabaseConfigured) return this.getLocalStores();
    try {
      const { data: stores, error } = await supabase.from('stores').select('*, products(*)');
      if (error) return this.getLocalStores();
      const remoteStores = (stores || []).map(s => this.mapStoreData(s, s.products || []));
      if (remoteStores.length > 0) this.saveLocalStores(remoteStores);
      return remoteStores.length > 0 ? remoteStores : this.getLocalStores();
    } catch (e) {
      return this.getLocalStores();
    }
  },

  getLocalStores(): SalesLink[] {
    const saved = localStorage.getItem(LOCAL_STORES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  },

  saveLocalStores(stores: SalesLink[]) {
    localStorage.setItem(LOCAL_STORES_KEY, JSON.stringify(stores));
  },

  mapStoreData(s: any, products: any[]): SalesLink {
    return {
      ...s,
      ownerEmail: s.owner_email,
      themeColor: s.theme_color,
      buyButtonColor: s.buy_button_color,
      shippingFee: Number(s.shipping_fee) || 0,
      defaultCurrency: s.default_currency as Currency,
      totalSales: Number(s.total_sales) || 0,
      bankDetails: s.bank_details || {},
      orders: s.orders || [],
      products: products.map((p: any) => ({
        ...p,
        discountPrice: p.discount_price,
        salesCount: p.sales_count || 0,
        reviewCount: p.review_count || 0,
        isFeatured: p.is_featured,
        shippingMethod: p.shipping_method,
        variants: p.variants || []
      }))
    };
  },

  async saveStore(store: SalesLink): Promise<string> {
    if (!isSupabaseConfigured) {
      const stores = this.getLocalStores();
      const existingIdx = stores.findIndex(s => s.slug === store.slug);
      const newId = isUUID(store.id) ? store.id : Math.random().toString(36).substr(2, 9);
      const updatedStore = { ...store, id: newId };
      if (existingIdx > -1) stores[existingIdx] = updatedStore;
      else stores.push(updatedStore);
      this.saveLocalStores(stores);
      return newId;
    }
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
      bank_details: store.bankDetails,
      total_sales: store.totalSales || 0
    };
    const payload = isUUID(store.id) ? { id: store.id, ...storeData } : storeData;
    const { data, error } = await supabase.from('stores').upsert(payload).select('id').maybeSingle();
    if (error) throw error;
    return data?.id || '';
  },

  async saveProduct(linkId: string, product: Omit<Product, 'id' | 'salesCount'>): Promise<void> {
    if (!isSupabaseConfigured || !isUUID(linkId)) {
      const stores = this.getLocalStores();
      const store = stores.find(s => s.id === linkId || s.slug === linkId);
      if (store) {
        const newProd = { ...product, id: Math.random().toString(36).substr(2, 9), salesCount: 0 };
        store.products.push(newProd as Product);
        this.saveLocalStores(stores);
        return;
      }
      throw new Error("Store context lost.");
    }
    const productData = {
      store_id: linkId,
      name: product.name,
      description: product.description,
      price: product.price,
      discount_price: product.discountPrice,
      currency: product.currency,
      image: product.image,
      category: product.category,
      stock: product.stock,
      rating: product.rating,
      review_count: product.reviewCount,
      variants: product.variants || [],
      is_featured: product.isFeatured,
      shipping_method: product.shippingMethod
    };
    const { error } = await supabase.from('products').insert(productData);
    if (error) throw error;
  },

  async deleteProduct(productId: string): Promise<void> {
    if (!isSupabaseConfigured || !isUUID(productId)) {
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
      if (!store.orders) store.orders = [];
      store.orders.push(newOrder);
      this.saveLocalStores(stores);
      return newOrder;
    }
    const { data: store } = await supabase.from('stores').select('id').eq('slug', storeSlug).maybeSingle();
    if (!store) throw new Error("Store lookup failed.");
    const dbOrder = { store_id: store.id, product_id: isUUID(orderData.productId) ? orderData.productId : null, product_name: orderData.productName, amount: orderData.amount, shipping_fee: orderData.shippingFee, total_paid: orderData.totalPaid, currency: orderData.currency, customer_email: orderData.customerEmail, customer_phone: orderData.customerPhone, customer_address: orderData.customerAddress, customer_postal_code: orderData.customerPostalCode, selected_variants: orderData.selectedVariants, source: orderData.source, status: 'pending' };
    const { data: order, error } = await supabase.from('orders').insert(dbOrder).select().maybeSingle();
    if (error) throw error;
    return order as unknown as Order;
  },

  async register(data: { identifier: string, password?: string, authType: 'email' | 'phone', referredBy?: string }): Promise<AppUser | null> {
    if (!isSupabaseConfigured) throw new Error("Network connection required.");
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.identifier,
      password: data.password || 'default-secret-123',
    });
    
    if (authError) throw authError;

    const newUser = {
      identifier: data.identifier,
      auth_type: data.authType,
      referral_code: Math.random().toString(36).substr(2, 6).toUpperCase(),
      referred_by: data.referredBy,
      notifications: []
    };

    const { error: insertError } = await supabase.from('users').insert(newUser);
    if (insertError) throw insertError;

    if (authData.session) {
       return await this.getCurrentUser();
    }
    
    return null;
  },

  async login(identifier: string, password?: string): Promise<AppUser> {
    if (!isSupabaseConfigured) throw new Error("Network connection required.");
    const { error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password: password || '',
    });
    if (error) throw error;
    const user = await this.getCurrentUser();
    if (!user) throw new Error("Profile load failed.");
    return user;
  },

  async logout() {
    if (isSupabaseConfigured) await supabase.auth.signOut();
  }
};
