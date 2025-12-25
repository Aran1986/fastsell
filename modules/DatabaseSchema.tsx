
import React from 'react';
import Header from '../components/Header';

const DatabaseSchema: React.FC = () => {
  const sqlCode = `-- FASTSell Complete Database Schema (v2.0)
-- هشدار: اجرای این اسکریپت تمامی داده‌های قبلی را پاک کرده و ساختار جدید را جایگزین می‌کند.

-- ۰. پاکسازی جداول قدیمی (DROP)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.stores CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ۱. جدول کاربران (احراز هویت و تنظیمات کلی)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier TEXT UNIQUE NOT NULL, -- ایمیل یا شماره موبایل
    auth_type TEXT DEFAULT 'email',
    password TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    referral_code TEXT UNIQUE NOT NULL,
    referred_by TEXT,
    bridge_prefs JSONB DEFAULT '{"telegram": "neutral", "whatsapp": "neutral", "sms": "neutral", "email": "neutral"}'::jsonb
);

-- ۲. جدول فروشگاه‌ها (تنظیمات برند و ویترین)
CREATE TABLE public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_email TEXT REFERENCES public.users(identifier) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    bio TEXT,
    theme_color TEXT DEFAULT '#6366f1',
    buy_button_color TEXT DEFAULT '#6366f1',
    shipping_fee NUMERIC DEFAULT 0,
    default_currency TEXT DEFAULT 'IRR',
    categories TEXT[] DEFAULT '{عمومی}',
    bank_details JSONB DEFAULT '{}'::jsonb,
    integrations JSONB DEFAULT '{}'::jsonb, -- شامل تنظیمات Bridge و دامنه
    trust_score NUMERIC DEFAULT 5.0,
    reputation_points INTEGER DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_sales NUMERIC DEFAULT 0
);

-- ۳. جدول محصولات
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    detailed_description TEXT,
    price NUMERIC NOT NULL,
    discount_price NUMERIC,
    currency TEXT DEFAULT 'IRR',
    image TEXT,
    category TEXT,
    stock INTEGER DEFAULT 10,
    sales_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    notify_me_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    shipping_method TEXT DEFAULT 'post',
    variants JSONB DEFAULT '[]'::jsonb, -- رنگ، سایز و...
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0
);

-- ۴. جدول سفارشات (لجستیک و مالی)
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id),
    product_id UUID REFERENCES public.products(id),
    product_name TEXT,
    product_image TEXT,
    amount NUMERIC,
    discount_amount NUMERIC DEFAULT 0,
    shipping_fee NUMERIC DEFAULT 0,
    total_paid NUMERIC,
    currency TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    customer_postal_code TEXT,
    selected_variants JSONB,
    tracking_number TEXT,
    shipping_method TEXT DEFAULT 'post',
    transaction_hash TEXT,
    status TEXT DEFAULT 'pending',
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT DEFAULT 'direct', -- direct | marketplace
    traffic_source TEXT, -- Instagram, Telegram, etc.
    system_fee NUMERIC DEFAULT 0,
    affiliate_reward NUMERIC DEFAULT 0,
    seller_net NUMERIC DEFAULT 0,
    shipping_label JSONB -- اطلاعات بارنامه صادر شده
);

-- ۵. جدول اعلان‌ها (نوتیفیکیشن‌های پنل)
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.users(identifier) ON DELETE CASCADE,
    text TEXT NOT NULL,
    type TEXT DEFAULT 'system', -- sale | status_update | system | message
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ۶. جدول جلسات چت (گفتگوی خریدار و فروشنده)
CREATE TABLE public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_email TEXT NOT NULL,
    product_name TEXT,
    messages JSONB DEFAULT '[]'::jsonb,
    is_unread BOOLEAN DEFAULT true,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ۷. جدول نظرات (Reviews)
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_slug TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    order_id TEXT, -- برای تایید خریدار واقعی بودن
    customer_name TEXT,
    customer_email TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">مدیریت دیتابیس (Supabase SQL) 🗄️</h1>
          <div className="bg-red-50 border border-red-200 p-6 rounded-[2rem] text-red-800 font-bold text-xs leading-relaxed">
            ⚠️ یادآوری بسیار مهم: قبل از اجرای کد زیر، حتماً از دیتای فعلی خود بک‌آپ بگیرید. این اسکریپت شامل دستورات <code className="bg-red-100 px-1 rounded">DROP</code> است که تمامی جداول قبلی را حذف و ساختار مدرن و کامل را جایگزین می‌کند تا با تمامی قابلیت‌های جدید اپلیکیشن (چت، نظرات، Bridge) سازگار باشد.
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-4 left-8 text-slate-500 font-mono text-[10px] uppercase tracking-widest">Full Platform Schema v2.0</div>
          <pre className="text-indigo-300 font-mono text-xs leading-relaxed overflow-x-auto p-4 bg-black/30 rounded-2xl border border-white/5 mt-8 max-h-[600px]" dir="ltr">
            {sqlCode}
          </pre>
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => { navigator.clipboard.writeText(sqlCode); alert('کد SQL کامل کپی شد!'); }}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl"
            >
              کپی اسکریپت کامل برای SQL Editor 📋
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DatabaseSchema;
