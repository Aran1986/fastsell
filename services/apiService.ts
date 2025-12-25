
import { SalesLink, Product, Order, Currency, AppUser, Review } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_STORES } from '../constants/mockData';

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
const LOCAL_STORES_KEY = 'fastsell_local_stores';
const LOCAL_USER_KEY = 'fastsell_local_user';

export const ApiService = {
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
      return { ...user, authType: user.auth_type as 'email' | 'phone', registeredAt: user.registered_at, referralCode: user.referral_code, referredBy: user.referred_by, notifications: user.notifications || [] };
    } catch (e) { return null; }
  },

  async getAllStores(): Promise<SalesLink[]> {
    const local = this.getLocalStores();
    if (!isSupabaseConfigured) return local;
    try {
      const { data: stores } = await supabase.from('stores').select('*, products(*)');
      return (stores || []).map(s => this.mapStoreData(s, s.products || []));
    } catch (e) { return local; }
  },

  getLocalStores(): SalesLink[] {
    const saved = localStorage.getItem(LOCAL_STORES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  },

  saveLocalStores(stores: SalesLink[]) {
    localStorage.setItem(LOCAL_STORES_KEY, JSON.stringify(stores));
  },

  async verifyPurchase(identifier: string, productId: string): Promise<boolean> {
    const stores = await this.getAllStores();
    let hasPurchased = false;
    stores.forEach(s => {
      if (s.orders?.some(o => (o.customerEmail === identifier || o.customerPhone === identifier) && o.productId === productId)) {
        hasPurchased = true;
      }
    });
    return hasPurchased;
  },

  async addReview(storeSlug: string, review: Omit<Review, 'id' | 'date'>): Promise<void> {
    const stores = this.getLocalStores();
    const store = stores.find(s => s.slug === storeSlug);
    if (store) {
      if (!store.reviews) store.reviews = [];
      const newReview: Review = {
        ...review,
        id: 'rev_' + Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString()
      };
      store.reviews.push(newReview);
      this.saveLocalStores(stores);
    }
  },

  async getLastCustomerDetails(identifier: string) {
    const stores = await this.getAllStores();
    let allOrders: Order[] = [];
    stores.forEach(s => allOrders.push(...(s.orders || [])));
    
    return allOrders
      .filter(o => o.customerEmail === identifier || o.customerPhone === identifier)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  },

  async getRecommendedProducts(currentProductId: string, currentStoreSlug: string): Promise<(Product & { storeSlug: string, shippingFee: number })[]> {
    const stores = await this.getAllStores();
    const currentStore = stores.find(s => s.slug === currentStoreSlug);
    const results: any[] = [];
    if (currentStore) {
      currentStore.products
        .filter(p => p.id !== currentProductId && p.stock > 0)
        .slice(0, 2)
        .forEach(p => results.push({ ...p, storeSlug: currentStore.slug, shippingFee: 0 }));
    }
    if (results.length < 2) {
      stores.filter(s => s.slug !== currentStoreSlug).forEach(s => {
        s.products.filter(p => p.stock > 0).slice(0, 1).forEach(p => {
          results.push({ ...p, storeSlug: s.slug, shippingFee: s.shippingFee });
        });
      });
    }
    return results.slice(0, 2);
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
        viewCount: p.view_count || 0,
        notifyMeCount: p.notify_me_count || 0,
        isFeatured: p.is_featured,
        shippingMethod: p.shipping_method,
        variants: p.variants || []
      }))
    };
  },

  async saveStore(store: SalesLink): Promise<string> {
    const stores = this.getLocalStores();
    const existingIdx = stores.findIndex(s => s.slug === store.slug);
    const newId = isUUID(store.id) ? store.id : Math.random().toString(36).substr(2, 9);
    const updatedStore = { ...store, id: newId };
    if (existingIdx > -1) stores[existingIdx] = updatedStore;
    else stores.push(updatedStore);
    this.saveLocalStores(stores);
    return newId;
  },

  async saveProduct(linkId: string, product: Omit<Product, 'id' | 'salesCount'>): Promise<void> {
    const stores = this.getLocalStores();
    const store = stores.find(s => s.id === linkId || s.slug === linkId);
    if (store) {
      const newProd = { ...product, id: 'p' + Math.random().toString(36).substr(2, 9), salesCount: 0, viewCount: 0, notifyMeCount: 0 };
      store.products.push(newProd as Product);
      this.saveLocalStores(stores);
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    const stores = this.getLocalStores();
    stores.forEach(s => { s.products = s.products.filter(p => p.id !== productId); });
    this.saveLocalStores(stores);
  },

  async createOrder(storeSlug: string, orderData: any): Promise<Order> {
    const stores = this.getLocalStores();
    const store = stores.find(s => s.slug === storeSlug);
    if (!store) throw new Error("Store not found.");
    const newOrder: Order = { ...orderData, id: 'ord_' + Math.random().toString(36).substr(2, 9), status: 'pending', date: new Date().toISOString() };
    if (!store.orders) store.orders = [];
    store.orders.push(newOrder);
    const prod = store.products.find(p => p.id === orderData.productId);
    if (prod) { prod.salesCount = (prod.salesCount || 0) + 1; prod.stock = Math.max(0, prod.stock - 1); }
    this.saveLocalStores(stores);
    return newOrder;
  },

  async register(data: { identifier: string, password?: string, authType: 'email' | 'phone', referredBy?: string }): Promise<AppUser | null> {
    const mockUser: AppUser = { id: 'u_' + Math.random().toString(36).substr(2, 9), identifier: data.identifier, authType: data.authType, registeredAt: new Date().toISOString(), referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(), referredBy: data.referredBy, notifications: [] };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    return mockUser;
  },

  async login(identifier: string, password?: string): Promise<AppUser> {
    if (identifier === 'ادمین') {
      const adminUser: AppUser = { id: 'admin_root', identifier: 'admin@fastsell.ir', authType: 'email', registeredAt: new Date().toISOString(), referralCode: 'ADMIN77', notifications: [] };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(adminUser));
      const stores = this.getLocalStores();
      stores.forEach(s => { s.ownerEmail = adminUser.identifier; });
      this.saveLocalStores(stores);
      return adminUser;
    }
    const saved = localStorage.getItem(LOCAL_USER_KEY);
    if (saved) { const user = JSON.parse(saved); if (user.identifier === identifier) return user; }
    return await this.register({ identifier, authType: 'email' }) as AppUser;
  },

  async logout() { localStorage.removeItem(LOCAL_USER_KEY); }
};
