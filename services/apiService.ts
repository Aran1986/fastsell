
/**
 * این فایل نقش بک‌اند (Backend) پلتفرم شما را ایفا می‌کند.
 * تمام درخواست‌های مربوط به دیتابیس از اینجا عبور می‌کنند.
 */

import { SalesLink, Product, Order, Currency, BankDetails } from '../types';

const DB_KEY = 'fastsell_cloud_db_v1';

// شبیه‌سازی تاخیر شبکه برای واقعی‌تر شدن تجربه کاربری
const networkDelay = () => new Promise(resolve => setTimeout(resolve, 800));

export const ApiService = {
  
  // --- [ بخش فروشگاه‌ها و محصولات ] ---

  /** دریافت تمام فروشگاه‌ها برای ویترین عمومی */
  async getAllStores(): Promise<SalesLink[]> {
    await networkDelay();
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  /** دریافت یک فروشگاه خاص با اسلاگ */
  async getStoreBySlug(slug: string): Promise<SalesLink | null> {
    const stores = await this.getAllStores();
    return stores.find(s => s.slug === slug) || null;
  },

  /** ذخیره یا بروزرسانی فروشگاه (نقش POST/PUT در بک‌اند) */
  async saveStore(store: SalesLink): Promise<void> {
    await networkDelay();
    const stores = await this.getAllStores();
    const index = stores.findIndex(s => s.id === store.id);
    
    if (index > -1) {
      stores[index] = store;
    } else {
      stores.push(store);
    }
    
    localStorage.setItem(DB_KEY, JSON.stringify(stores));
  },

  // --- [ بخش سفارشات و فروش ] ---

  /** ثبت سفارش جدید در دیتابیس مرکزی */
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

    // بروزرسانی موجودی و سفارشات فروشگاه در "دیتابیس"
    stores[storeIndex].orders = [...(stores[storeIndex].orders || []), newOrder];
    stores[storeIndex].totalSales += newOrder.amount;
    
    // بروزرسانی آمار محصول
    const productIndex = stores[storeIndex].products.findIndex(p => p.id === newOrder.productId);
    if (productIndex > -1) {
      stores[storeIndex].products[productIndex].salesCount += 1;
    }

    localStorage.setItem(DB_KEY, JSON.stringify(stores));
    return newOrder;
  },

  /** دریافت خریدهای یک کاربر خاص بر اساس ایمیل (Role: Buyer) */
  async getOrdersByCustomer(email: string): Promise<Order[]> {
    await networkDelay();
    const stores = await this.getAllStores();
    const allOrders: Order[] = [];
    
    stores.forEach(s => {
      const customerOrders = (s.orders || []).filter(o => o.customerEmail === email);
      allOrders.push(...customerOrders);
    });
    
    return allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
};
