
import { SalesLink, Currency } from '../types';

const DEFAULT_FULL_CATS = [
  'عمومی', 'موبایل و تبلت', 'لپ‌تاپ و کامپیوتر', 'پوشاک مردانه', 'پوشاک زنانه', 
  'لوازم خانگی', 'آرایشی و بهداشتی', 'کتاب و لوازم‌التحریر', 'اسباب‌بازی و سرگرمی', 
  'ورزش و سفر', 'خودرو و ابزار', 'کالاهای سوپرمارکتی', 'صنایع دستی', 'پت‌شاپ', 
  'خدمات و آموزش', 'ساعت و اکسسوری', 'طلا و جواهر', 'لوازم دکوری'
];

export const INITIAL_STORES: SalesLink[] = [
  {
    id: 'store_1',
    ownerEmail: 'tech@fastsell.ir',
    slug: 'digital-hub',
    title: 'دیجیتال هاب آریا',
    bio: 'مرجع تخصصی گجت‌های روز دنیا و لوازم جانبی گیمینگ.',
    themeColor: '#4f46e5',
    buyButtonColor: '#4338ca',
    totalSales: 210000000,
    shippingFee: 45000,
    defaultCurrency: Currency.IRR,
    categories: DEFAULT_FULL_CATS,
    products: [
      { id: 'p1', name: 'هندزفری سونی XM5', description: 'حذف نویز فعال فوق‌العاده.', price: 15800000, discountPrice: 14200000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600', category: 'موبایل و تبلت', salesCount: 45, stock: 10, rating: 4.9, reviewCount: 12, isFeatured: true, shippingMethod: 'post' },
      { id: 'p2', name: 'کیبورد مکانیکال Razer', description: 'سوییچ‌های زرد بی‌صدا.', price: 6500000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600', category: 'لپ‌تاپ و کامپیوتر', salesCount: 22, stock: 5, rating: 4.2, reviewCount: 8, shippingMethod: 'post' },
      { id: 'p3', name: 'ساعت هوشمند Amazfit', description: 'باتری با دوام ۲۱ روزه.', price: 4200000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600', category: 'ساعت و اکسسوری', salesCount: 88, stock: 15, rating: 4.6, reviewCount: 34, shippingMethod: 'post' },
      { id: 'p4', name: 'پاوربانک ۲۰۰۰۰ شیائومی', description: 'شارژ سریع ۲۲.۵ وات.', price: 1350000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1609592806457-482a1e1d643f?w=600', category: 'موبایل و تبلت', salesCount: 150, stock: 40, rating: 3.5, reviewCount: 56, shippingMethod: 'post' },
      { id: 'p5', name: 'مانیتور ۲۷ اینچ گیمینگ', description: 'نرخ نوسازی ۱۶۵ هرتز.', price: 12500000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600', category: 'لپ‌تاپ و کامپیوتر', salesCount: 10, stock: 3, rating: 4.8, reviewCount: 5, shippingMethod: 'post' },
      { id: 'p6', name: 'ماوس لاجیتک MX Master', description: 'بهترین برای طراحان و برنامه‌نویسان.', price: 5900000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600', category: 'لپ‌تاپ و کامپیوتر', salesCount: 30, stock: 12, rating: 4.9, reviewCount: 19, shippingMethod: 'post' },
      { id: 'p7', name: 'کابل شارژ تایپ سی انکر', description: 'بسیار مقاوم و با کیفیت.', price: 450000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600', category: 'موبایل و تبلت', salesCount: 300, stock: 100, rating: 3.2, reviewCount: 80, shippingMethod: 'post' }
    ],
    orders: []
  },
  {
    id: 'store_2',
    ownerEmail: 'fashion@fastsell.ir',
    slug: 'modern-style',
    title: 'استایل مدرن',
    bio: 'مجموعه‌ای از بهترین پوشاک فصل برای خوش‌پوش‌ها.',
    themeColor: '#db2777',
    buyButtonColor: '#be185d',
    totalSales: 95000000,
    shippingFee: 0,
    defaultCurrency: Currency.IRR,
    categories: DEFAULT_FULL_CATS,
    products: [
      { id: 'p8', name: 'هودی نخی مردانه', description: 'مناسب فصل پاییز، ۱۰۰٪ پنبه.', price: 850000, discountPrice: 690000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', category: 'پوشاک مردانه', salesCount: 65, stock: 20, rating: 4.5, reviewCount: 22, isFeatured: true, shippingMethod: 'post' },
      { id: 'p9', name: 'کفش ورزشی نایکی', description: 'سبک و راحت برای پیاده‌روی.', price: 3400000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', category: 'ورزش و سفر', salesCount: 40, stock: 8, rating: 4.7, reviewCount: 15, shippingMethod: 'post' },
      { id: 'p10', name: 'کیف دستی چرمی زنانه', description: 'چرم طبیعی با دوخت ظریف.', price: 1800000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600', category: 'پوشاک زنانه', salesCount: 12, stock: 4, rating: 4.8, reviewCount: 6, shippingMethod: 'post' },
      { id: 'p11', name: 'تی‌شرت لانگ سفید', description: 'تن‌خور عالی و خنک.', price: 320000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', category: 'پوشاک مردانه', salesCount: 200, stock: 50, rating: 3.9, reviewCount: 45, shippingMethod: 'post' },
      { id: 'p12', name: 'شلوار جین تیره', description: 'پارچه ترک با ضمانت رنگ.', price: 1200000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600', category: 'پوشاک مردانه', salesCount: 88, stock: 25, rating: 4.1, reviewCount: 30, shippingMethod: 'post' },
      { id: 'p13', name: 'عینک آفتابی کلاسیک', description: 'عدسی پلاریزه با محافظت UV.', price: 2100000, discountPrice: 1850000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', category: 'ساعت و اکسسوری', salesCount: 15, stock: 6, rating: 3.6, reviewCount: 4, shippingMethod: 'post' },
      { id: 'p14', name: 'کلاه کپ اسپرت', description: 'بسیار شیک و با دوام.', price: 250000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1588850567047-1845a9ee02f6?w=600', category: 'پوشاک مردانه', salesCount: 50, stock: 30, rating: 4.0, reviewCount: 12, shippingMethod: 'post' }
    ],
    orders: []
  },
  {
    id: 'store_3',
    ownerEmail: 'home@fastsell.ir',
    slug: 'home-art',
    title: 'هنر و خانه',
    bio: 'اکسسوری‌های خاص برای دکوراسیون داخلی منزل شما.',
    themeColor: '#0f172a',
    buyButtonColor: '#1e293b',
    totalSales: 48000000,
    shippingFee: 75000,
    defaultCurrency: Currency.IRR,
    categories: DEFAULT_FULL_CATS,
    products: [
      { id: 'p15', name: 'آباژور مینیمال چوبی', description: 'نور ملایم برای اتاق خواب.', price: 950000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600', category: 'لوازم دکوری', salesCount: 20, stock: 7, rating: 4.6, reviewCount: 11, shippingMethod: 'post' },
      { id: 'p16', name: 'گلدان سرامیکی دست‌ساز', description: 'طراحی منحصر به فرد.', price: 420000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600', category: 'لوازم دکوری', salesCount: 35, stock: 15, rating: 4.4, reviewCount: 9, shippingMethod: 'post' },
      { id: 'p17', name: 'تابلو دکوراتور مدرن', description: 'چاپ بوم با کیفیت عالی.', price: 1500000, discountPrice: 1200000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600', category: 'لوازم دکوری', salesCount: 8, stock: 4, rating: 4.3, reviewCount: 3, shippingMethod: 'post' },
      { id: 'p18', name: 'قهوه‌ساز کوچک خانگی', description: 'آماده‌سازی قهوه در ۳ دقیقه.', price: 3800000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600', category: 'لوازم خانگی', salesCount: 14, stock: 2, rating: 4.7, reviewCount: 5, shippingMethod: 'post' },
      { id: 'p19', name: 'شمع معطر اسطوخودوس', description: 'آرامش‌بخش و خوشبو.', price: 180000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1596435707700-626456093193?w=600', category: 'لوازم دکوری', salesCount: 120, stock: 200, rating: 4.1, reviewCount: 40, shippingMethod: 'post' },
      { id: 'p20', name: 'کوسن مبل فانتزی', description: 'پارچه مخمل نرم.', price: 290000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600', category: 'لوازم دکوری', salesCount: 50, stock: 30, rating: 3.8, reviewCount: 15, shippingMethod: 'post' },
      { id: 'p21', name: 'ست جای ادویه پیرکس', description: 'مقاوم و شفاف.', price: 550000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1584990344321-27682ad0f1f7?w=600', category: 'لوازم خانگی', salesCount: 22, stock: 10, rating: 4.2, reviewCount: 7, shippingMethod: 'post' }
    ],
    orders: []
  }
];
