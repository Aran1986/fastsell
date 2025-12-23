
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
    slug: 'digital-world',
    title: 'دنیای دیجیتال آریا',
    bio: 'تخصصی‌ترین مرکز تامین قطعات گیمینگ و گجت‌های پوشیدنی در ایران.',
    themeColor: '#4f46e5',
    buyButtonColor: '#4338ca',
    totalSales: 154000000,
    shippingFee: 55000,
    defaultCurrency: Currency.IRR,
    categories: DEFAULT_FULL_CATS,
    products: [
      { id: 'p1', name: 'هندزفری سونی WF-1000XM5', description: 'بهترین نویز کنسلینگ دنیا.', price: 14500000, discountPrice: 12900000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80', category: 'موبایل و تبلت', salesCount: 85, stock: 12, rating: 4.9, reviewCount: 42, isFeatured: true, shippingMethod: 'post' },
      { id: 'p2', name: 'ماوس گیمینگ ریزر DeathAdder', description: 'دقت بالا و ارگونومی عالی.', price: 3200000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80', category: 'لپ‌تاپ و کامپیوتر', salesCount: 120, stock: 5, rating: 4.7, reviewCount: 56, shippingMethod: 'post' },
      { id: 'p4', name: 'کیبورد مکانیکال Keychron K2', description: 'کیبورد وایرلس با سوییچ قهوه‌ای.', price: 5800000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&q=80', category: 'لپ‌تاپ و کامپیوتر', salesCount: 45, stock: 8, rating: 4.8, reviewCount: 15, shippingMethod: 'post' },
      { id: 'p5', name: 'پاوربانک شیائومی ۲۰۰۰۰', description: 'ظرفیت بالا و فست شارژ.', price: 1200000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1609592806457-482a1e1d643f?w=600&q=80', category: 'موبایل و تبلت', salesCount: 200, stock: 50, rating: 4.2, reviewCount: 88, shippingMethod: 'post' },
      { id: 'p6', name: 'مانیتور ال‌جی ۲۷ اینچ 4K', description: 'پنل IPS با رنگ‌های زنده.', price: 18500000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80', category: 'لپ‌تاپ و کامپیوتر', salesCount: 12, stock: 3, rating: 4.6, reviewCount: 9, shippingMethod: 'post' },
      { id: 'p7', name: 'ساعت هوشمند اپل واچ ۹', description: 'جدیدترین نسخه با قابلیت‌های سلامتی.', price: 21000000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1544117518-30ed3f0a59b7?w=600&q=80', category: 'ساعت و اکسسوری', salesCount: 30, stock: 10, rating: 4.9, reviewCount: 22, shippingMethod: 'post' },
      { id: 'p8', name: 'هارد اکسترنال وسترن ۲ ترابایت', description: 'امنیت بالا برای اطلاعات شما.', price: 3500000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1531492746377-26be35129873?w=600&q=80', category: 'لپ‌تاپ و کامپیوتر', salesCount: 65, stock: 25, rating: 4.4, reviewCount: 34, shippingMethod: 'post' }
    ],
    orders: []
  },
  {
    id: 'store_2',
    ownerEmail: 'fashion@fastsell.ir',
    slug: 'ziba-mod',
    title: 'مزون زیبا مد',
    bio: 'طراحی و دوخت لباس‌های شب و مجلسی با پارچه‌های ترک و اروپایی.',
    themeColor: '#ec4899',
    buyButtonColor: '#be185d',
    totalSales: 89000000,
    shippingFee: 0,
    defaultCurrency: Currency.IRR,
    categories: DEFAULT_FULL_CATS,
    products: [
      { id: 'p3', name: 'پالتو فوتر یقه انگلیسی', description: 'مناسب فصل پاییز و زمستان.', price: 4800000, discountPrice: 3900000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80', category: 'پوشاک زنانه', salesCount: 24, stock: 5, rating: 4.5, reviewCount: 12, isFeatured: true, shippingMethod: 'post' },
      { id: 'p9', name: 'تی‌شرت نخی آستین کوتاه', description: '۱۰۰٪ پنبه، ضد حساسیت.', price: 450000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', category: 'پوشاک مردانه', salesCount: 150, stock: 100, rating: 3.8, reviewCount: 45, shippingMethod: 'post' },
      { id: 'p10', name: 'شلوار جین جذب زنانه', description: 'پارچه کشی با دوام بالا.', price: 850000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80', category: 'پوشاک زنانه', salesCount: 88, stock: 40, rating: 4.1, reviewCount: 32, shippingMethod: 'post' },
      { id: 'p11', name: 'کفش کتانی نایکی مدل ایر', description: 'مناسب پیاده‌روی و ورزش.', price: 2900000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', category: 'ورزش و سفر', salesCount: 55, stock: 15, rating: 4.6, reviewCount: 28, shippingMethod: 'post' },
      { id: 'p12', name: 'کیف چرم طبیعی دست‌دوز', description: 'چرم گاوی درجه یک.', price: 1800000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', category: 'صنایع دستی', salesCount: 15, stock: 4, rating: 4.8, reviewCount: 6, shippingMethod: 'post' },
      { id: 'p13', name: 'عینک آفتابی ری‌بن کلاسیک', description: 'عدسی UV400 اصل.', price: 3200000, discountPrice: 2800000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80', category: 'ساعت و اکسسوری', salesCount: 42, stock: 12, rating: 3.5, reviewCount: 20, shippingMethod: 'post' },
      { id: 'p14', name: 'شال نخی بهاره طرح‌دار', description: 'بسیار سبک و خنک.', price: 220000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&q=80', category: 'پوشاک زنانه', salesCount: 95, stock: 60, rating: 3.2, reviewCount: 18, shippingMethod: 'post' }
    ],
    orders: []
  },
  {
    id: 'store_3',
    ownerEmail: 'home@fastsell.ir',
    slug: 'home-design',
    title: 'خانه و دکوراسیون مدرن',
    bio: 'تجهیزات دکوری و اکسسوری‌های خاص برای منزل شما.',
    themeColor: '#0f172a',
    buyButtonColor: '#1e293b',
    totalSales: 42000000,
    shippingFee: 85000,
    defaultCurrency: Currency.IRR,
    categories: DEFAULT_FULL_CATS,
    products: [
      { id: 'p15', name: 'آباژور رومیزی مدرن', description: 'پایه چوبی با نور ملایم.', price: 950000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80', category: 'لوازم دکوری', salesCount: 18, stock: 7, rating: 4.7, reviewCount: 10, shippingMethod: 'post' },
      { id: 'p16', name: 'ست قابلمه چدن ۷ پارچه', description: 'پوشش نچسب و مقاوم.', price: 3800000, discountPrice: 3450000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1584990344321-27682ad0f1f7?w=600&q=80', category: 'لوازم خانگی', salesCount: 22, stock: 6, rating: 4.3, reviewCount: 14, shippingMethod: 'post' },
      { id: 'p17', name: 'گلدان سرامیکی فانتزی', description: 'طرح مینیمال، مناسب دکور.', price: 350000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&q=80', category: 'لوازم دکوری', salesCount: 50, stock: 30, rating: 2.8, reviewCount: 25, shippingMethod: 'post' },
      { id: 'p18', name: 'قهوه‌ساز خانگی دلونگی', description: 'اسپرسوساز حرفه‌ای کوچک.', price: 7200000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&q=80', category: 'لوازم خانگی', salesCount: 35, stock: 4, rating: 4.8, reviewCount: 19, shippingMethod: 'post' },
      { id: 'p19', name: 'تابلو دکوراتور ۳ تکه', description: 'چاپ بوم با کیفیت بالا.', price: 1200000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80', category: 'لوازم دکوری', salesCount: 28, stock: 15, rating: 3.9, reviewCount: 11, shippingMethod: 'post' },
      { id: 'p20', name: 'شمع معطر اسطوخودوس', description: 'زمان سوخت بالا، آرامش‌بخش.', price: 150000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1596435707700-626456093193?w=600&q=80', category: 'لوازم دکوری', salesCount: 120, stock: 200, rating: 4.5, reviewCount: 40, shippingMethod: 'post' },
      { id: 'p21', name: 'کوسن مبل طرح سنتی', description: 'پارچه مخمل با گلدوزی.', price: 280000, currency: Currency.IRR, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80', category: 'لوازم دکوری', salesCount: 44, stock: 35, rating: 3.4, reviewCount: 12, shippingMethod: 'post' }
    ],
    orders: []
  }
];
