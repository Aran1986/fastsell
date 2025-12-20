
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

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  storeName?: string;
  storeSlug?: string;
  amount: number;
  currency: Currency;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerPostalCode: string;
  trackingNumber?: string;
  transactionHash?: string;
  orderNote?: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
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
  isFeatured?: boolean;
}

export interface SalesLink {
  id: string;
  ownerEmail: string; // کلید اتصال فروشگاه به کاربر
  slug: string;
  title: string;
  bio: string;
  products: Product[];
  orders: Order[];
  themeColor: string;
  buyButtonColor?: string;
  totalSales: number;
  defaultCurrency: Currency;
  categories: string[];
  bankDetails?: BankDetails;
}

export interface AppUser {
  email: string;
  name?: string;
  registeredAt: string;
}
