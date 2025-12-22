
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
  name: string; // e.g., "Color"
  options: string[]; // e.g., ["Red", "Blue", "Green"]
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  storeName?: string;
  storeSlug?: string;
  amount: number;
  shippingFee: number; // Added shipping fee to order record
  totalPaid: number; // Final amount paid
  currency: Currency;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerPostalCode: string;
  selectedVariants?: Record<string, string>; // e.g., {"Color": "Red"}
  trackingNumber?: string;
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
  currency: Currency;
  image?: string;
  category: string;
  salesCount: number;
  stock: number;
  variants?: ProductVariant[]; // Added variants support
  isFeatured?: boolean;
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
  shippingFee: number; // Fixed shipping fee for the store
  defaultCurrency: Currency;
  categories: string[];
  bankDetails?: BankDetails;
}

export interface AppUser {
  id: string;
  identifier: string; // email or phone
  password?: string;
  authType: 'email' | 'phone';
  registeredAt: string;
  referralCode: string;
  referredBy?: string;
}
