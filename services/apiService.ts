
import { SalesLink, Product, Order, Currency, BankDetails, AppUser } from '../types';
import { FinanceService } from './financeService';
import { INITIAL_STORES } from '../constants/mockData';

const STORES_KEY = 'fastsell_stores_v2';
const USERS_KEY = 'fastsell_users_v2';
const SESSION_KEY = 'fastsell_current_user';

const networkDelay = () => new Promise(resolve => setTimeout(resolve, 500));

export const ApiService = {
  // Initialize storage with mock data if it's the first visit
  _init() {
    if (!localStorage.getItem(STORES_KEY)) {
      localStorage.setItem(STORES_KEY, JSON.stringify(INITIAL_STORES));
    }
  },

  async getCurrentUser(): Promise<AppUser | null> {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  async login(email: string, referredBy?: string): Promise<AppUser> {
    await networkDelay();
    const usersRaw = localStorage.getItem(USERS_KEY);
    let users: AppUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    let user = users.find(u => u.email === email);

    if (!user) {
      user = { 
        email, 
        registeredAt: new Date().toISOString(),
        referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
        referredBy: referredBy || undefined
      };
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  async getAllStores(): Promise<SalesLink[]> {
    this._init();
    const data = localStorage.getItem(STORES_KEY);
    const stores: SalesLink[] = data ? JSON.parse(data) : [];
    
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: AppUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    return stores.map(s => {
      const owner = users.find(u => u.email === s.ownerEmail);
      return { ...s, referredBy: owner?.referredBy };
    });
  },

  async saveStore(store: SalesLink): Promise<void> {
    await networkDelay();
    const stores = await this.getAllStores();
    const index = stores.findIndex(s => s.id === store.id);
    const storeToSave = { ...store };
    delete (storeToSave as any).referredBy;

    if (index > -1) stores[index] = storeToSave;
    else stores.push(storeToSave);
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  },

  async createOrder(storeSlug: string, orderData: Omit<Order, 'id' | 'date' | 'status' | 'systemFee' | 'affiliateReward' | 'sellerNet'>): Promise<Order> {
    await networkDelay();
    const stores = await this.getAllStores();
    const storeIndex = stores.findIndex(s => s.slug === storeSlug);
    if (storeIndex === -1) throw new Error("Store not found");

    // خریدار را هم به لیست کاربران سیستم اضافه می‌کنیم (ورک‌فلو ثبت‌نام خودکار)
    await this.login(orderData.customerEmail);

    const breakdown = FinanceService.calculateOrderBreakdown(orderData.amount, orderData.source);

    const newOrder: Order = {
      ...orderData,
      ...breakdown,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      status: 'pending'
    };

    stores[storeIndex].orders = [...(stores[storeIndex].orders || []), newOrder];
    stores[storeIndex].totalSales += newOrder.amount;
    
    const storesToSave = stores.map(s => {
      const copy = { ...s };
      delete (copy as any).referredBy;
      return copy;
    });

    localStorage.setItem(STORES_KEY, JSON.stringify(storesToSave));
    return newOrder;
  }
};
