
import { Order, SalesLink, AppUser } from '../types';
import { BUSINESS_RULES } from '../constants/businessRules';

export const FinanceService = {
  /** Calculate breakdown for a single order */
  calculateOrderBreakdown(amount: number, source: 'direct' | 'marketplace') {
    const systemFee = amount * (source === 'marketplace' ? BUSINESS_RULES.COMMISSION_MARKETPLACE : BUSINESS_RULES.COMMISSION_DIRECT);
    const affiliateReward = amount * BUSINESS_RULES.AFFILIATE_REWARD_RATE;
    const sellerNet = amount - systemFee;

    return { systemFee, affiliateReward, sellerNet };
  },

  /** Determine if a seller is active based on 30-day history */
  isSellerActive(store: SalesLink): boolean {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - BUSINESS_RULES.ACTIVITY_WINDOW_DAYS));
    
    const hasActiveProduct = store.products.length > 0;
    const hasRecentSale = store.orders?.some(o => new Date(o.date) >= thirtyDaysAgo);

    return hasActiveProduct || !!hasRecentSale;
  },

  /** Calculate a seller's monthly score for the Founder Pool */
  calculateSellerScore(store: SalesLink, allUsers: AppUser[], allStores: SalesLink[]) {
    // A. Product Activity Score
    const productPoints = Math.min(
      store.products.length * BUSINESS_RULES.SCORE_PER_PRODUCT,
      BUSINESS_RULES.SCORE_MAX_PRODUCT_POINTS
    );

    // B. Sales Volume Score (Points per 1M units)
    const salesPoints = (store.totalSales / 1000000) * BUSINESS_RULES.SCORE_PER_MILLION_SALES;

    // C. Growth Contribution Score
    const owner = allUsers.find(u => u.email === store.ownerEmail);
    const referredSellers = allUsers.filter(u => u.referredBy === owner?.referralCode);
    const activeReferralPoints = referredSellers.reduce((acc, refUser) => {
      const refStore = allStores.find(s => s.ownerEmail === refUser.email);
      if (refStore && this.isSellerActive(refStore)) {
        return acc + BUSINESS_RULES.SCORE_PER_ACTIVE_REFERRAL;
      }
      return acc;
    }, 0);

    return {
      total: productPoints + salesPoints + activeReferralPoints,
      breakdown: { productPoints, salesPoints, activeReferralPoints }
    };
  },

  /** Distribute Founder Pool among eligible sellers */
  calculateFounderDistribution(totalNetProfit: number, eligibleStores: {id: string, score: number}[]) {
    const reserve = totalNetProfit * BUSINESS_RULES.INFRASTRUCTURE_RESERVE_PERCENT;
    const distributableProfit = (totalNetProfit - reserve) * BUSINESS_RULES.FOUNDER_PROFIT_POOL_PERCENT;
    
    const totalSystemScore = eligibleStores.reduce((acc, s) => acc + s.score, 0);
    if (totalSystemScore === 0) return [];

    return eligibleStores.map(store => {
      let share = (store.score / totalSystemScore) * distributableProfit;
      const cap = distributableProfit * BUSINESS_RULES.INDIVIDUAL_PROFIT_CAP_PERCENT;
      
      return {
        storeId: store.id,
        amount: Math.min(share, cap),
        isCapped: share > cap
      };
    });
  },

  getProductFinancials(productOrders: Order[]) {
    return productOrders.reduce((acc, order) => {
      acc.totalSales += order.amount;
      acc.totalNetProfit += order.sellerNet;
      acc.totalOrders += 1;
      return acc;
    }, { totalSales: 0, totalNetProfit: 0, totalOrders: 0 });
  },

  getAffiliateStats(allStores: SalesLink[], userReferralCode: string) {
    let totalEarning = 0;
    let referredSalesCount = 0;
    allStores.forEach(store => {
      if ((store as any).referredBy === userReferralCode) {
        store.orders?.forEach((o: Order) => {
          totalEarning += o.affiliateReward;
          referredSalesCount++;
        });
      }
    });
    return { totalEarning, referredSalesCount };
  }
};
