
import React from 'react';
import Header from '../components/Header';

const DatabaseSchema: React.FC = () => {
  const sqlCode = `-- FASTSell Supabase Schema
-- یادآوری: قبل از اجرای کدهای جدید، اگر تغییری در ساختار قبلی وجود دارد، ابتدا جداول را DROP کنید.

-- 1. جدول کاربران
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier TEXT UNIQUE NOT NULL,
    auth_type TEXT DEFAULT 'email',
    password TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    referral_code TEXT UNIQUE NOT NULL,
    referred_by TEXT,
    notifications JSONB DEFAULT '[]'::jsonb,
    bridge_prefs JSONB DEFAULT '{"telegram": "neutral", "whatsapp": "neutral", "sms": "neutral", "email": "neutral"}'::jsonb
);

-- 2. جدول فروشگاه‌ها
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_email TEXT REFERENCES public.users(identifier),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    bio TEXT,
    theme_color TEXT DEFAULT '#6366f1',
    buy_button_color TEXT DEFAULT '#6366f1',
    shipping_fee NUMERIC DEFAULT 0,
    default_currency TEXT DEFAULT 'IRR',
    categories TEXT[] DEFAULT '{عمومی}',
    bank_details JSONB DEFAULT '{}'::jsonb,
    integrations JSONB DEFAULT '{}'::jsonb,
    trust_score NUMERIC DEFAULT 5.0,
    reputation_points INTEGER DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE,
    total_sales NUMERIC DEFAULT 0
);

-- 3. جدول محصولات
CREATE TABLE IF NOT EXISTS public.products (
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
    review_count INTEGER DEFAULT 0
);

-- 4. جدول سفارشات
CREATE TABLE IF NOT EXISTS public.orders (
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
    status TEXT DEFAULT 'pending',
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    traffic_source TEXT,
    selected_variants JSONB
);`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">ساختار دیتابیس (Supabase SQL) 🗄️</h1>
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] text-amber-800 font-bold text-xs leading-relaxed">
            💡 یادآوری برای توسعه‌دهنده: تمامی مدل‌های داده‌ای باید با رابط‌های (Interfaces) تعریف شده در <code className="bg-amber-100 px-1 rounded">types.ts</code> مطابقت داشته باشند. در صورت تغییر در فیلدها، حتماً ابتدا جداول قدیمی را Drop کرده و اسکریپت جدید را در SQL Editor سوپابیس اجرا کنید تا از ناسازگاری دیتا جلوگیری شود.
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-4 left-8 text-slate-500 font-mono text-[10px] uppercase tracking-widest">PostgreSQL Schema</div>
          <pre className="text-indigo-300 font-mono text-xs leading-relaxed overflow-x-auto p-4 bg-black/30 rounded-2xl border border-white/5 mt-8" dir="ltr">
            {sqlCode}
          </pre>
          <button 
            onClick={() => { navigator.clipboard.writeText(sqlCode); alert('کد SQL کپی شد!'); }}
            className="mt-6 w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all border border-white/10"
          >
            کپی کل کد SQL 📋
          </button>
        </div>
      </main>
    </div>
  );
};

export default DatabaseSchema;
