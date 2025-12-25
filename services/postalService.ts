
import { Order, ShippingLabel } from '../types';

export const PostalService = {
  /** 
   * اتصال به پنل پستی و دریافت بارنامه
   * این تابع در محیط واقعی با APIهایی مثل Post.ir یا تاپین ارتباط می‌گیرد.
   */
  async issueShippingLabel(order: Order): Promise<ShippingLabel> {
    console.log(`[POSTAL API] Requesting label for order ${order.id}...`);
    
    // شبیه‌سازی تاخیر شبکه
    await new Promise(resolve => setTimeout(resolve, 2000));

    // تولید دیتای فرضی بارنامه
    const trackingCode = "IR" + Math.floor(100000000 + Math.random() * 900000000) + "PS";
    
    return {
      trackingCode,
      serviceType: "پست پیشتاز",
      weight: 500, // گرم
      cost: 45000,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${trackingCode}`,
      issuedAt: new Date().toISOString()
    };
  },

  /** پیگیری وضعیت مرسوله */
  async trackPackage(trackingCode: string) {
    // شبیه‌سازی استعلام وضعیت از سامانه رهگیری پست
    return {
      status: 'در حال پردازش در مرکز مبدا',
      lastUpdate: new Date().toISOString()
    };
  }
};
