
export enum Currency {
  USD = 'USD',
  IRR = 'IRR',
  EUR = 'EUR',
  CRYPTO = 'CRYPTO'
}

export interface BankDetails {
  cardNumber?: string;
  accountNumber?: string;
  iban?: string;
  holderName?: string;
  paypalEmail?: string;
  stripeKey?: string;
  walletAddress?: string;
  network?: string;
  notes?: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface AppNotification {
  id: string;
  text: string;
  date: string;
  isRead: boolean;
  link?: string;
  type: 'sale' | 'status_update' | 'system';
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  storeName?: string;
  storeSlug?: string;
  amount: number;
  discountAmount?: number;
  shippingFee: number;
  totalPaid: number;
  currency: Currency;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerPostalCode: string;
  selectedVariants?: Record<string, string>;
  trackingNumber?: string;
  shippingMethod: 'post' | 'delivery' | 'digital';
  transactionHash?: string;
  orderNote?: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  source: 'direct' | 'marketplace';
  systemFee: number;
  affiliateReward: number;
  sellerNet: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  price: number;
  discountPrice?: number;
  currency: Currency;
  image?: string;
  category: string;
  salesCount: number;
  stock: number;
  rating: number;
  reviewCount: number;
  variants?: ProductVariant[];
  isFeatured?: boolean;
  shippingMethod?: 'post' | 'delivery' | 'digital';
}

export interface SalesLink {
  id: string;
  ownerEmail: string; 
  slug: string;
  title: string;
  bio: string;
  products: Product[];
  orders: Order[];
  themeColor: string;
  buyButtonColor?: string;
  totalSales: number;
  shippingFee: number;
  defaultCurrency: Currency;
  categories: string[];
  bankDetails?: BankDetails;
}

export interface AppUser {
  id: string;
  identifier: string;
  password?: string;
  authType: 'email' | 'phone';
  registeredAt: string;
  referralCode: string;
  referredBy?: string;
  notifications?: AppNotification[];
}
