
import { SalesLink, Currency, Order, Review } from '../types';

const DEFAULT_FULL_CATS = [
  'عمومی', 'موبایل و تبلت', 'لپ‌تاپ و کامپیوتر', 'پوشاک مردانه', 'پوشاک زنانه', 
  'لوازم خانگی', 'آرایشی و بهداشتی', 'کتاب و لوازم‌التحریر', 'اسباب‌بازی و سرگرمی', 
  'ورزش و سفر', 'خودرو و ابزار', 'کالاهای سوپرمارکتی', 'صنایع دستی', 'پت‌شاپ', 
  'خدمات و آموزش', 'ساعت و اکسسوری', 'طلا و جواهر', 'لوازم دکوری'
];

const generateMockOrders = (storeSlug: string, count: number): Order[] => {
  const sources = ['Instagram', 'Telegram', 'Google', 'Direct', 'Twitter/X'];
  return Array.from({ length: count }).map((_, i) => ({
    id: `ord_${Math.random().toString(36).substr(2, 9)}`,
    productId: `p${(i % 20) + 1}`,
    productName: 'محصول شبیه‌سازی شده',
    amount: 150000 + Math.random() * 2000000,
    shippingFee: 45000,
    totalPaid: 200000 + Math.random() * 2000000,
    currency: Currency.IRR,
    customerEmail: `customer${i}@test.com`,
    customerPhone: `0912${Math.floor(1000000 + Math.random() * 9000000)}`,
    customerAddress: 'تهران، خیابان ولیعصر، فرعی ۱۰، پلاک ۴',
    customerPostalCode: '1234567890',
    shippingMethod: 'post',
    status: i % 5 === 0 ? 'delivered' : 'shipped',
    date: new Date(Date.now() - i * 86400000).toISOString(),
    source: 'direct',
    trafficSource: sources[Math.floor(Math.random() * sources.length)],
    systemFee: 5000,
    affiliateReward: 200,
    sellerNet: 145000
  }));
};

const MOCK_REVIEWS: Review[] = [
  { id: 'rev1', orderId: 'ord1', productId: 'p1', customerName: 'علی رضایی', customerEmail: 'ali@test.com', rating: 5, comment: 'عالی بود، خیلی سریع به دستم رسید و کیفیتش حرف نداره.', date: new Date().toISOString() },
  { id: 'rev2', orderId: 'ord2', productId: 'p1', customerName: 'مریم حسینی', customerEmail: 'maryam@test.com', rating: 4, comment: 'نسبت به قیمتش واقعا می‌ارزه. فقط بسته‌بندی می‌تونست بهتر باشه.', date: new Date().toISOString() }
];

export const INITIAL_STORES: SalesLink[] = [
  {
    id: 'store_1',
    ownerEmail: 'admin@fastsell.ir',
    slug: 'digital-hub',
    title: 'دیجیتال هاب آریا',
    bio: 'مرجع تخصصی گجت‌های روز دنیا و لوازم جانبی گیمینگ با گارانتی معتبر.',
    themeColor: '#4f46e5',
    buyButtonColor: '#4338ca',
    totalSales: 450000000,
    shippingFee: 45000,
    defaultCurrency: Currency.IRR,
    categories: DEFAULT_FULL_CATS,
    trustScore: 4.8,
    avgResponseTimeMinutes: 24,
    deliverySuccessCount: 1420,
    reviews: MOCK_REVIEWS,
    products: [
      { id: 'p1', name: 'هندزفری سونی XM5', description: 'حذف نویز فعال فوق‌العاده و صدای شفاف.', price: 15800000, discountPrice: 14200000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600', category: 'موبایل و تبلت', salesCount: 45, stock: 0, rating: 4.9, reviewCount: 12, viewCount: 450, isFeatured: true, shippingMethod: 'post' },
      { id: 'p2', name: 'کیبورد Razer BlackWidow', description: 'سوییچ‌های مکانیکی زرد مخصوص گیمینگ.', price: 8500000, discountPrice: 7900000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600', category: 'لپ‌تاپ و کامپیوتر', salesCount: 22, stock: 0, rating: 4.2, reviewCount: 8, viewCount: 850, notifyMeCount: 124, shippingMethod: 'post' },
      { id: 'p3', name: 'ساعت هوشمند Amazfit GTR', description: 'نمایشگر AMOLED و باتری ۲۱ روزه.', price: 4200000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600', category: 'ساعت و اکسسوری', salesCount: 88, stock: 15, rating: 4.6, reviewCount: 34, viewCount: 610, shippingMethod: 'post' },
      { id: 'p4', name: 'ماوس Logitech MX Master 3', description: 'بهترین انتخاب برای طراحان و برنامه‌نویسان.', price: 3400000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600', category: 'لپ‌تاپ و کامپیوتر', salesCount: 15, stock: 5, rating: 4.8, reviewCount: 10, viewCount: 200, shippingMethod: 'post' },
      { id: 'p5', name: 'هدست SteelSeries Arctis 7', description: 'صدای ۷.۱ کاناله وایرلس بدون تاخیر.', price: 7200000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600', category: 'موبایل و تبلت', salesCount: 30, stock: 12, rating: 4.7, reviewCount: 15, viewCount: 340, shippingMethod: 'post' },
      { id: 'p6', name: 'شارژر وایرلس سامسونگ', description: 'شارژ سریع ۱۵ وات با فن خنک‌کننده.', price: 1200000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=600', category: 'موبایل و تبلت', salesCount: 110, stock: 40, rating: 4.5, reviewCount: 50, viewCount: 1200, shippingMethod: 'post' },
      { id: 'p7', name: 'پاوربانک شیائومی ۲۰۰۰۰', description: 'نسخه ۳ با خروجی ۱۸ وات.', price: 950000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1609592806457-41e97686522c?w=600', category: 'موبایل و تبلت', salesCount: 200, stock: 80, rating: 4.4, reviewCount: 95, viewCount: 3000, shippingMethod: 'post' },
      { id: 'p8', name: 'اسپیکر JBL Flip 6', description: 'ضد آب با صدای بیس کوبنده.', price: 3800000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=600', category: 'عمومی', salesCount: 40, stock: 8, rating: 4.9, reviewCount: 22, viewCount: 550, shippingMethod: 'post' },
      { id: 'p9', name: 'هارد اکسترنال WD 2TB', description: 'سری My Passport با امنیت بالا.', price: 2950000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1531492746076-1a1bd9b29fc0?w=600', category: 'لپ‌تاپ و کامپیوتر', salesCount: 65, stock: 20, rating: 4.6, reviewCount: 18, viewCount: 430, shippingMethod: 'post' },
      { id: 'p10', name: 'دسته PS5 DualSense', description: 'تکنولوژی Haptic Feedback.', price: 3200000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1605906302484-3c39f8bb1520?w=600', category: 'اسباب‌بازی و سرگرمی', salesCount: 55, stock: 15, rating: 4.8, reviewCount: 40, viewCount: 900, shippingMethod: 'post' },
      { id: 'p11', name: 'وب‌کم Logitech C920', description: 'کیفیت Full HD 1080p.', price: 4100000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600', category: 'لپ‌تاپ و کامپیوتر', salesCount: 12, stock: 4, rating: 4.7, reviewCount: 5, viewCount: 180, shippingMethod: 'post' },
      { id: 'p12', name: 'مودم TP-Link Archer', description: 'دو بانده AC1200 با برد عالی.', price: 1850000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600', category: 'لپ‌تاپ و کامپیوتر', salesCount: 28, stock: 10, rating: 4.3, reviewCount: 12, viewCount: 300, shippingMethod: 'post' },
      { id: 'p13', name: 'کوله پشتی لپ‌تاپ Xiaomi', description: 'پارچه ضد آب و طراحی شیک.', price: 850000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', category: 'ورزش و سفر', salesCount: 44, stock: 18, rating: 4.5, reviewCount: 20, viewCount: 420, shippingMethod: 'post' },
      { id: 'p14', name: 'کابل HDMI 4K Anker', description: 'سرعت انتقال ۱۸ گیگابیت.', price: 450000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600', category: 'لپ‌تاپ و کامپیوتر', salesCount: 150, stock: 100, rating: 4.9, reviewCount: 60, viewCount: 2100, shippingMethod: 'post' },
      { id: 'p15', name: 'پنل نوری Nanoleaf', description: 'نورپردازی هوشمند محیط گیمینگ.', price: 11500000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600', category: 'لوازم دکوری', salesCount: 5, stock: 2, rating: 5.0, reviewCount: 2, viewCount: 500, shippingMethod: 'post' },
      { id: 'p16', name: 'میکروفون Blue Yeti', description: 'بهترین کیفیت برای استریم و پادکست.', price: 8900000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600', category: 'لپ‌تاپ و کامپیوتر', salesCount: 10, stock: 3, rating: 4.8, reviewCount: 4, viewCount: 240, shippingMethod: 'post' },
      { id: 'p17', name: 'میز گیمینگ Eureka', description: 'سطح فیبر کربن با نگهدارنده لیوان.', price: 14200000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1598550476439-6847785fce66?w=600', category: 'لوازم خانگی', salesCount: 3, stock: 1, rating: 4.9, reviewCount: 3, viewCount: 350, shippingMethod: 'post' },
      { id: 'p18', name: 'لایت بار مانیتور BenQ', description: 'محافظت از چشم و نور عالی میز.', price: 5600000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=600', category: 'لپ‌تاپ و کامپیوتر', salesCount: 18, stock: 6, rating: 4.7, reviewCount: 8, viewCount: 410, shippingMethod: 'post' },
      { id: 'p19', name: 'استند هدفون RGB', description: 'دارای ۲ پورت USB اضافی.', price: 780000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1616120621453-2946c1b3f7f4?w=600', category: 'ساعت و اکسسوری', salesCount: 35, stock: 14, rating: 4.4, reviewCount: 10, viewCount: 190, shippingMethod: 'post' },
      { id: 'p20', name: 'فن خنک‌کننده مانیتور', description: 'نصب آسان پشت مانیتور.', price: 420000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600', category: 'لپ‌تاپ و کامپیوتر', salesCount: 12, stock: 50, rating: 4.1, reviewCount: 4, viewCount: 150, shippingMethod: 'post' },
    ],
    orders: generateMockOrders('digital-hub', 30)
  }
];
