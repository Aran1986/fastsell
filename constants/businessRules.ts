
export const BUSINESS_RULES = {
  // Commission Rates
  COMMISSION_DIRECT: 0.03, // 3%
  COMMISSION_MARKETPLACE: 0.05, // 5%
  AFFILIATE_REWARD_RATE: 0.001, // 0.1%

  // Founder Seller Program
  FOUNDER_MAX_SELLERS: 1000, // Only first 1000 qualify
  FOUNDER_TERMINATION_LIMIT: 10000, // Program ends if platform reaches 10k sellers
  FOUNDER_PROFIT_POOL_PERCENT: 0.12, // 12% of Net Profit
  FOUNDER_DURATION_YEARS: 5,
  INFRASTRUCTURE_RESERVE_PERCENT: 0.20, // 20% reserved before profit pool
  INDIVIDUAL_PROFIT_CAP_PERCENT: 0.05, // Max 5% of pool per seller

  // Scoring Weights
  SCORE_PER_PRODUCT: 1,
  SCORE_MAX_PRODUCT_POINTS: 5,
  SCORE_PER_MILLION_SALES: 1, // 1 point per 1,000,000 units
  SCORE_PER_ACTIVE_REFERRAL: 3,

  // Payout Rules
  MIN_WITHDRAWAL_AMOUNT: 500000, // 500,000 Toman
  PAYOUT_DAYS: ['Saturday', 'Tuesday'],
  
  // Activity Check
  ACTIVITY_WINDOW_DAYS: 30
};
