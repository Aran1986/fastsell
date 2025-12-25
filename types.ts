
export enum Currency {
  USD = 'USD',
  IRR = 'IRR',
  EUR = 'EUR',
  CRYPTO = 'CRYPTO'
}

export type PreferenceState = 'yes' | 'no' | 'neutral';

export interface EventPrefs {
  orderUpdates: boolean;
  newsletters: boolean;
  promotions: boolean;
  security: boolean;
}

export interface ChannelPrefs {
  telegram: PreferenceState;
  whatsapp: PreferenceState;
  sms: PreferenceState;
  email: PreferenceState;
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

export interface Integrations {
  telegramChatId?: string;
  whatsappNumber?: string;
  customDomain?: string;
  prefs: ChannelPrefs;
  eventPrefs: EventPrefs;
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
  type: 'sale' | 'status_update' | 'system' | 'message';
}

export interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  customerEmail: string;
  productName: string;
  messages: ChatMessage[];
  lastMessageAt: string;
  isUnread: boolean;
}

export interface ShippingLabel {
  trackingCode: string;
  serviceType: string;
  weight: number;
  cost: number;
  qrCode: string;
  issuedAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  date: string;
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
  trafficSource?: string;
  systemFee: number;
  affiliateReward: number;
  sellerNet: number;
  shippingLabel?: ShippingLabel;
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
  viewCount?: number;
  notifyMeCount?: number;
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
  reviews?: Review[];
  themeColor: string;
  buyButtonColor?: string;
  totalSales: number;
  shippingFee: number;
  defaultCurrency: Currency;
  categories: string[];
  bankDetails?: BankDetails;
  integrations?: Integrations;
  trustScore?: number;
  reputationPoints?: number;
  lastActiveAt?: string;
  avgResponseTimeMinutes?: number;
  deliverySuccessCount?: number;
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
  // Global Privacy preference for this user as a customer
  bridgePrefs?: ChannelPrefs;
}
