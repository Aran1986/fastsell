
import { SalesLink, Product } from '../types';

export const ReputationService = {
  /** 
   * محاسبه امتیاز کشف (Discovery Score) برای یک محصول
   * این امتیاز تعیین‌کننده رتبه در ویترین عمومی است.
   */
  calculateDiscoveryScore(product: Product, store: SalesLink): number {
    const salesWeight = 2;
    const ratingWeight = 15;
    const viewWeight = 0.1;
    const reputationWeight = 1.5;

    // امتیاز پایه از خود محصول
    let score = (product.salesCount * salesWeight) + 
                (product.rating * ratingWeight) + 
                ((product.viewCount || 0) * viewWeight);

    // تاثیر اعتبار فروشنده (Boost)
    const sellerReputation = store.reputationPoints || 0;
    score += (sellerReputation * reputationWeight);

    // جریمه برای عدم موجودی
    if (product.stock <= 0) {
      score *= 0.1;
    }

    // پاداش برای فعالیت اخیر فروشنده (Activity Multiplier)
    if (store.lastActiveAt) {
      const lastActive = new Date(store.lastActiveAt).getTime();
      const hoursSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60);
      if (hoursSinceActive < 24) score *= 1.2; // ۲۰٪ پاداش برای فعالیت در ۲۴ ساعت گذشته
    }

    return score;
  },

  /** محاسبه امتیازات جدید بر اساس اتفاقات سیستم */
  calculatePointsEarned(action: 'sale' | 'review_positive' | 'review_negative' | 'fast_delivery'): number {
    switch(action) {
      case 'sale': return 5;
      case 'review_positive': return 10;
      case 'fast_delivery': return 15;
      case 'review_negative': return -20;
      default: return 0;
    }
  }
};
