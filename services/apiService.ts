
import { SalesLink, Product, Order, Currency, BankDetails, AppUser } from '../types';

const STORES_KEY = 'fastsell_stores_v2';
const USERS_KEY = 'fastsell_users_v2';
const SESSION_KEY = 'fastsell_current_user';

const networkDelay = () => new Promise(resolve => setTimeout(resolve, 500));

export const ApiService = {
  
  // --- [ بخش کاربران ] ---
  async getCurrentUser(): Promise<AppUser | null> {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  async login(email: string): Promise<AppUser> {
    await networkDelay();
    const usersRaw = localStorage.getItem(USERS_KEY);
    let users: AppUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    let user = users.find(u => u.email === email);
    if (!user) {
      user = { email, registeredAt: new Date().toISOString() };
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  // --- [ بخش فروشگاه‌ها ] ---
  async getAllStores(): Promise<SalesLink[]> {
    const data = localStorage.getItem(STORES_KEY);
    return data ? JSON.parse(data) : [];
  },

  async getMyStores(email: string): Promise<SalesLink[]> {
    const all = await this.getAllStores();
    return all.filter(s => s.ownerEmail === email);
  },

  async saveStore(store: SalesLink): Promise<void> {
    await networkDelay();
    const stores = await this.getAllStores();
    const index = stores.findIndex(s => s.id === store.id);
    
    if (index > -1) {
      stores[index] = store;
    } else {
      stores.push(store);
    }
    
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  },

  async createOrder(storeSlug: string, orderData: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order> {
    await networkDelay();
    const stores = await this.getAllStores();
    const storeIndex = stores.findIndex(s => s.slug === storeSlug);
    
    if (storeIndex === -1) throw new Error("Store not found");

    const newOrder: Order = {
      ...orderData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      status: 'pending'
    };

    stores[storeIndex].orders = [...(stores[storeIndex].orders || []), newOrder];
    stores[storeIndex].totalSales += newOrder.amount;
    
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    return newOrder;
  }
};
