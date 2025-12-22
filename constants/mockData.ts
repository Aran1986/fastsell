
import { SalesLink, Currency } from '../types';

export const INITIAL_STORES: SalesLink[] = [
  {
    id: 'store_1',
    ownerEmail: 'demo-seller@fastsell.ir',
    slug: 'tech-gadgets',
    title: 'تکنولوژی و گجت‌های هوشمند',
    bio: 'ارائه دهنده جدیدترین لوازم جانبی موبایل و گجت‌های کاربردی با تضمین اصالت.',
    themeColor: '#4f46e5',
    buyButtonColor: '#4338ca',
    totalSales: 4500000,
    shippingFee: 0,
    defaultCurrency: Currency.IRR,
    categories: ['موبایل', 'لوازم جانبی', 'گیمینگ'],
    products: [
      {
        id: 'p1',
        name: 'هندزفری بلوتوثی Pro Max',
        description: 'صدای شفاف، نویز کنسلینگ فعال و ۲۰ ساعت شارژدهی مداوم.',
        price: 1250000,
        currency: Currency.IRR,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        category: 'موبایل',
        salesCount: 12,
        stock: 5,
        isFeatured: true
      },
      {
        id: 'p2',
        name: 'ساعت هوشمند سری Ultra',
        description: 'صفحه نمایش همیشه روشن و سنسورهای دقیق سلامتی.',
        price: 2800000,
        currency: Currency.IRR,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        category: 'لوازم جانبی',
        salesCount: 5,
        stock: 0
      }
    ],
    orders: []
  },
  {
    id: 'store_2',
    ownerEmail: 'art-studio@fastsell.ir',
    slug: 'minimal-art',
    title: 'استودیو هنر مینیمال',
    bio: 'فروش آثار هنری دیجیتال و فیزیکی برای دکوراسیون‌های مدرن.',
    themeColor: '#db2777',
    buyButtonColor: '#be185d',
    totalSales: 150,
    shippingFee: 0,
    defaultCurrency: Currency.CRYPTO,
    categories: ['تابلو', 'دیجیتال آرت'],
    products: [
      {
        id: 'p3',
        name: 'تابلو انتزاعی Blue Mist',
        description: 'فایل با کیفیت بالا جهت چاپ در ابعاد دلخواه.',
        price: 45,
        currency: Currency.CRYPTO,
        image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=600&q=80',
        category: 'دیجیتال آرت',
        salesCount: 3,
        stock: 99,
        isFeatured: true
      }
    ],
    orders: []
  }
];
