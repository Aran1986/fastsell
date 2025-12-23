
import { SalesLink, Product, Order, Currency, BankDetails, AppUser, AppNotification } from '../types';
import { FinanceService } from './financeService';
import { INITIAL_STORES } from '../constants/mockData';

const STORES_KEY = 'fastsell_stores_v4';
const USERS_KEY = 'fastsell_users_v4';
const SESSION_KEY = 'fastsell_current_user_v4';

const networkDelay = () => new Promise(resolve => setTimeout(resolve, 500));

export const ApiService = {
  _init() {
    if (!localStorage.getItem(STORES_KEY)) {
      localStorage.setItem(STORES_KEY, JSON.stringify(INITIAL_STORES));
    }
  },

  async getCurrentUser(): Promise<AppUser | null> {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    const basicUser = JSON.parse(data);
    const usersRaw = localStorage.getItem(USERS_KEY);
    if (usersRaw) {
      const users: AppUser[] = JSON.parse(usersRaw);
      return users.find(u => u.identifier === basicUser.identifier) || basicUser;
    }
    return basicUser;
  },

  async register(data: { identifier: string, password?: string, authType: 'email' | 'phone', referredBy?: string }): Promise<AppUser> {
    await networkDelay();
    const usersRaw = localStorage.getItem(USERS_KEY);
    let users: AppUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    if (users.find(u => u.identifier === data.identifier)) throw new Error("این کاربر قبلاً ثبت‌نام کرده است.");
    const user: AppUser = {
      id: Math.random().toString(36).substr(2, 9),
      identifier: data.identifier, password: data.password, authType: data.authType,
      registeredAt: new Date().toISOString(), referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
      referredBy: data.referredBy, notifications: []
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

  async logout() { localStorage.removeItem(SESSION_KEY); },

  async getAllStores(): Promise<SalesLink[]> {
    this._init();
    const data = localStorage.getItem(STORES_KEY);
    return data ? JSON.parse(data) : [];
  },

  async saveStore(store: SalesLink): Promise<void> {
    const stores = await this.getAllStores();
    const index = stores.findIndex(s => s.id === store.id);
    if (index > -1) stores[index] = store; else stores.push(store);
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  },

  async addNotification(identifier: string, notif: Omit<AppNotification, 'id' | 'isRead' | 'date'>) {
    const usersRaw = localStorage.getItem(USERS_KEY); if (!usersRaw) return;
    let users: AppUser[] = JSON.parse(usersRaw);
    const userIdx = users.findIndex(u => u.identifier === identifier);
    if (userIdx > -1) {
      const newNotif: AppNotification = { ...notif, id: Math.random().toString(36).substr(2, 5), isRead: false, date: new Date().toISOString() };
      users[userIdx].notifications = [...(users[userIdx].notifications || []), newNotif];
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      const session = localStorage.getItem(SESSION_KEY);
      if (session && JSON.parse(session).identifier === identifier) localStorage.setItem(SESSION_KEY, JSON.stringify(users[userIdx]));
    }
  },

  async createOrder(storeSlug: string, orderData: Omit<Order, 'id' | 'date' | 'status' | 'systemFee' | 'affiliateReward' | 'sellerNet' | 'shippingMethod'>): Promise<Order> {
    const stores = await this.getAllStores();
    const store = stores.find(s => s.slug === storeSlug);
    if (!store) throw new Error("فروشگاه یافت نشد");
    const product = store.products.find(p => p.id === orderData.productId);
    if (!product) throw new Error("محصول یافت نشد");
    product.stock -= 1; product.salesCount += 1;
    const breakdown = FinanceService.calculateOrderBreakdown(orderData.amount, orderData.source);
    const newOrder: Order = { ...orderData, ...breakdown, shippingMethod: product.shippingMethod || 'post', id: 'ORD-' + Math.random().toString(36).substr(2, 7).toUpperCase(), date: new Date().toISOString(), status: 'pending' };
    store.orders = [...(store.orders || []), newOrder];
    store.totalSales += newOrder.totalPaid;
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    await this.addNotification(store.ownerEmail, { text: `سفارش جدید برای ${product.name} ثبت شد! مبلغ: ${newOrder.totalPaid.toLocaleString()}`, type: 'sale' });
    await this.addNotification(orderData.customerEmail, { text: `سفارش شما برای ${product.name} در فروشگاه ${store.title} ثبت شد.`, type: 'status_update' });
    return newOrder;
  }
};
