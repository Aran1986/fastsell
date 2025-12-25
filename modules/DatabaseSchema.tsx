
import React from 'react';
import Header from '../components/Header';

const DatabaseSchema: React.FC = () => {
  const sqlCode = `-- FASTSell Complete Database Schema (v2.3)
-- اضافه شدن ستون mode برای پشتیبانی از کالا، خدمات و رزرو

-- ۰. حذف جداول قدیمی برای نصب تمیز
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.stores CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ۱. جدول کاربران
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier TEXT UNIQUE NOT NULL,
    auth_type TEXT DEFAULT 'email',
    password TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    referral_code TEXT UNIQUE NOT NULL,
    referred_by TEXT,
    bridge_prefs JSONB DEFAULT '{"telegram": "neutral", "whatsapp": "neutral", "sms": "neutral", "email": "neutral"}'::jsonb
);

-- ۲. جدول فروشگاه‌ها (اضافه شدن mode)
CREATE TABLE public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_email TEXT REFERENCES public.users(identifier) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    bio TEXT,
    mode TEXT DEFAULT 'product', -- product | service | booking
    theme_color TEXT DEFAULT '#6366f1',
    buy_button_color TEXT DEFAULT '#6366f1',
    shipping_fee NUMERIC DEFAULT 0,
    default_currency TEXT DEFAULT 'IRR',
    categories TEXT[] DEFAULT '{عمومی}',
    bank_details JSONB DEFAULT '{}'::jsonb,
    integrations JSONB DEFAULT '{}'::jsonb,
    trust_score NUMERIC DEFAULT 5.0,
    reputation_points INTEGER DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_sales NUMERIC DEFAULT 0
);

-- ۳. جدول محصولات (با فیلدهای منعطف)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
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
    variants JSONB DEFAULT '[]'::jsonb,
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    -- فیلدهای جدید برای خدمات و رزرو
    duration_minutes INTEGER,
    is_online BOOLEAN DEFAULT true,
    available_slots TEXT[]
);

-- ۴. جدول سفارشات
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id),
    product_id UUID REFERENCES public.products(id),
    product_name TEXT,
    amount NUMERIC,
    shipping_fee NUMERIC,
    total_paid NUMERIC,
    currency TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    customer_postal_code TEXT,
    selected_variants JSONB,
    status TEXT DEFAULT 'pending',
    source TEXT DEFAULT 'direct',
    traffic_source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- فیلدهای رزرو
    booking_date DATE,
    booking_time TIME
);

-- ۵. جدول نوتیفیکیشن‌ها
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.users(identifier) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ۶. جدول جلسات چت
CREATE TABLE public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_email TEXT NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb,
    is_unread BOOLEAN DEFAULT true,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ۷. جدول نظرات
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">مدیریت دیتابیس (SQL) 🗄️</h1>
          <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-[2rem] text-indigo-800 font-bold text-xs leading-relaxed">
            ساختار جدید (v2.3) برای پشتیبانی از <b>مودهای کالا، خدمات و رزرو</b> آماده است. اسکریپت زیر را در Supabase اجرا کنید.
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
          <pre className="text-indigo-300 font-mono text-xs leading-relaxed overflow-x-auto p-4 bg-black/30 rounded-2xl border border-white/5 mt-8 max-h-[600px]" dir="ltr">
            {sqlCode}
          </pre>
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => { navigator.clipboard.writeText(sqlCode); alert('کد SQL کپی شد!'); }}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl"
            >
              کپی اسکریپت کامل 📋
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DatabaseSchema;
