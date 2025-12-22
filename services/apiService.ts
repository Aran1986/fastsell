
import { SalesLink, Product, Order, Currency, BankDetails, AppUser } from '../types';
import { FinanceService } from './financeService';
import { INITIAL_STORES } from '../constants/mockData';

const STORES_KEY = 'fastsell_stores_v3';
const USERS_KEY = 'fastsell_users_v3';
const SESSION_KEY = 'fastsell_current_user_v3';

const networkDelay = () => new Promise(resolve => setTimeout(resolve, 500));

export const ApiService = {
  _init() {
    if (!localStorage.getItem(STORES_KEY)) {
      localStorage.setItem(STORES_KEY, JSON.stringify(INITIAL_STORES));
    }
  },

  async getCurrentUser(): Promise<AppUser | null> {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  async register(data: { identifier: string, password?: string, authType: 'email' | 'phone', referredBy?: string }): Promise<AppUser> {
    await networkDelay();
    const usersRaw = localStorage.getItem(USERS_KEY);
    let users: AppUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    if (users.find(u => u.identifier === data.identifier)) {
      throw new Error("این کاربر قبلاً ثبت‌نام کرده است.");
    }

    const user: AppUser = {
      id: Math.random().toString(36).substr(2, 9),
      identifier: data.identifier,
      password: data.password,
      authType: data.authType,
      registeredAt: new Date().toISOString(),
      referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
      referredBy: data.referredBy
    };

    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  async login(identifier: string, password?: string): Promise<AppUser> {
    await networkDelay();
    const usersRaw = localStorage.getItem(USERS_KEY);
    let users: AppUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    const user = users.find(u => u.identifier === identifier);

    if (!user) throw new Error("کاربری با این مشخصات یافت نشد.");
    if (password && user.password !== password) throw new Error("رمز عبور اشتباه است.");

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  async getAllStores(): Promise<SalesLink[]> {
    this._init();
    const data = localStorage.getItem(STORES_KEY);
    return data ? JSON.parse(data) : [];
  },

  async saveStore(store: SalesLink): Promise<void> {
    const stores = await this.getAllStores();
    const index = stores.findIndex(s => s.id === store.id);
    if (index > -1) stores[index] = store;
    else stores.push(store);
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  },

  async createOrder(storeSlug: string, orderData: Omit<Order, 'id' | 'date' | 'status' | 'systemFee' | 'affiliateReward' | 'sellerNet'>): Promise<Order> {
    const stores = await this.getAllStores();
    const store = stores.find(s => s.slug === storeSlug);
    if (!store) throw new Error("فروشگاه یافت نشد");

    const product = store.products.find(p => p.id === orderData.productId);
    if (!product) throw new Error("محصول یافت نشد");
    if (product.stock <= 0) throw new Error("موجودی کالا به اتمام رسیده است.");

    // Decrement stock
    product.stock -= 1;
    product.salesCount += 1;

    const breakdown = FinanceService.calculateOrderBreakdown(orderData.amount, orderData.source);

    const newOrder: Order = {
      ...orderData,
      ...breakdown,
      id: 'ORD-' + Math.random().toString(36).substr(2, 7).toUpperCase(),
      date: new Date().toISOString(),
      status: 'pending'
    };

    store.orders = [...(store.orders || []), newOrder];
    store.totalSales += newOrder.totalPaid;
    
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    return newOrder;
  }
};
