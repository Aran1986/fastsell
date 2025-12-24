
import { ApiService } from './apiService';

export const TrackingService = {
  // شبیه‌سازی ثبت بازدید محصول
  async trackView(storeSlug: string, productId: string) {
    const stores = ApiService.getLocalStores();
    const store = stores.find(s => s.slug === storeSlug);
    if (store) {
      const product = store.products.find(p => p.id === productId);
      if (product) {
        product.viewCount = (product.viewCount || 0) + 1;
        ApiService.saveLocalStores(stores);
      }
    }
  },

  // ثبت درخواست اطلاع‌رسانی موجودی
  async requestStockNotification(storeSlug: string, productId: string, customerContact: string) {
    const stores = ApiService.getLocalStores();
    const store = stores.find(s => s.slug === storeSlug);
    if (store) {
      const product = store.products.find(p => p.id === productId);
      if (product) {
        product.notifyMeCount = (product.notifyMeCount || 0) + 1;
        // در دنیای واقعی اینجا ایمیل مشتری در دیتابیس ذخیره می‌شود
        ApiService.saveLocalStores(stores);
        return true;
      }
    }
    return false;
  }
};
