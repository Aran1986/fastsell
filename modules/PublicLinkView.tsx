
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SalesLink, Currency } from '../types';

interface PublicLinkViewProps {
  links: SalesLink[];
}

const getCurrencySymbol = (curr: Currency) => {
  switch (curr) {
    case Currency.USD: return '$';
    case Currency.EUR: return '€';
    case Currency.IRR: return 'تومان';
    case Currency.CRYPTO: return 'USDT';
    default: return '$';
  }
};

const PublicLinkView: React.FC<PublicLinkViewProps> = ({ links }) => {
  const { slug, productId } = useParams<{ slug: string, productId?: string }>();
  const link = links.find(l => l.slug === slug);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (link) {
      const storageKey = `welcome_dismissed_${link.slug}`;
      const isDismissed = localStorage.getItem(storageKey);
      if (!isDismissed) {
        const timer = setTimeout(() => setShowWelcome(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [link]);

  const dismissWelcome = () => {
    if (link) {
      localStorage.setItem(`welcome_dismissed_${link.slug}`, 'true');
      setShowWelcome(false);
    }
  };

  if (!link) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white text-center min-h-screen">
        <h1 className="text-8xl font-black text-slate-100 mb-6 select-none">404</h1>
        <p className="text-slate-600 text-xl font-bold mb-4">فروشگاه مورد نظر پیدا نشد.</p>
        <div className="bg-amber-50 text-amber-700 p-6 rounded-3xl border border-amber-100 text-sm font-bold mb-8 max-w-md">
           💡 نکته: چون این نسخه دمو از دیتابیس محلی (LocalStorage) استفاده می‌کند، مغازه‌هایی که روی یک دستگاه ساخته شده‌اند، روی دستگاه دیگر نمایش داده نمی‌شوند مگر اینکه از محصولات نمونه (Mock Data) باشند.
        </div>
        <Link to="/register" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl">ساخت فروشگاه در این دستگاه ←</Link>
      </div>
    );
  }

  const displayProducts = productId 
    ? link.products.filter(p => p.id === productId) 
    : link.products;

  const mainColor = link.themeColor || '#6366f1';
  const buyBtnColor = link.buyButtonColor || mainColor;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center relative overflow-x-hidden" dir="rtl">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-96 opacity-10 pointer-events-none" style={{ background: `linear-gradient(180deg, ${mainColor} 0%, transparent 100%)` }}></div>

      {/* Welcome Message Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[3.5rem] p-12 w-full max-w-sm shadow-2xl relative animate-in zoom-in-90 duration-300 flex flex-col items-center">
            <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${mainColor}, #a855f7)`, color: 'white' }}>
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            <h2 className="text-3xl font-black text-slate-900 text-center mb-4">خوش آمدید! ✨</h2>
            <p className="text-slate-500 text-center text-sm leading-relaxed mb-10 font-bold">
              ما در <span className="font-black" style={{ color: mainColor }}>«{link.title}»</span> آماده خدمت‌رسانی به شما هستیم. بهترین‌ها را انتخاب کنید.
            </p>
            <button 
              onClick={dismissWelcome}
              style={{ backgroundColor: buyBtnColor }}
              className="w-full py-5 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 hover:brightness-110"
            >
              مشاهده ویترین
            </button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <header className="w-full max-w-2xl pt-16 pb-12 px-6 text-center z-10">
        <div className="relative inline-block mb-8">
            <div className="w-32 h-32 rounded-[3rem] mx-auto border-8 border-white shadow-2xl flex items-center justify-center text-white text-5xl font-black ring-1 ring-slate-100 transform -rotate-3 transition-transform hover:rotate-0 duration-500" style={{ background: `linear-gradient(135deg, ${mainColor}, #a855f7)` }}>
                {link.title.charAt(0)}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-400 w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{link.title}</h1>
        <p className="text-slate-500 max-w-md mx-auto text-base leading-relaxed font-bold bg-white/50 backdrop-blur-sm py-3 px-6 rounded-2xl border border-white/50">{link.bio}</p>
        
        {productId && (
            <Link to={`/s/${slug}`} className="mt-8 inline-flex items-center gap-2 text-[11px] font-black uppercase px-8 py-3 rounded-full border-2 transition-all hover:bg-white hover:shadow-xl" style={{ color: mainColor, borderColor: `${mainColor}20` }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                بازگشت به کاتالوگ کامل
            </Link>
        )}
      </header>

      {/* Main Grid Content */}
      <main className="w-full max-w-2xl px-6 pb-24 space-y-8">
        {displayProducts.length === 0 ? (
            <div className="text-center py-24 text-slate-300 font-bold bg-white rounded-[3.5rem] border-4 border-dashed border-slate-100">
              هنوز کالا یا خدماتی اضافه نشده است.
            </div>
        ) : displayProducts.map(product => {
          const isOutOfStock = product.stock <= 0;
          return (
            <Link 
              to={isOutOfStock ? '#' : `/checkout/${link.slug}/${product.id}`}
              key={product.id} 
              className={`group block bg-white rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden ${isOutOfStock ? 'cursor-not-allowed grayscale-[0.5]' : ''}`}
            >
              <div className="flex flex-col sm:flex-row relative">
                  <div className="sm:w-56 h-56 overflow-hidden relative">
                      <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={product.name} />
                      {product.isFeatured && !isOutOfStock && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg">ویژه</div>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center">
                           <span className="text-white font-black text-xl border-2 border-white px-4 py-2 rounded-xl transform -rotate-12">اتمام موجودی</span>
                        </div>
                      )}
                  </div>
                  <div className="flex-1 p-8 flex flex-col justify-between">
                      <div>
                          <div className="flex items-start justify-between mb-2">
                             <h3 className="font-black text-slate-900 text-2xl group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                             <span className="text-[10px] bg-slate-50 px-3 py-1 rounded-full font-black text-slate-400 border border-slate-100">{product.category}</span>
                          </div>
                          <p className="text-sm text-slate-400 font-bold leading-relaxed line-clamp-2">{product.description}</p>
                      </div>
                      
                      <div className="mt-8 flex items-center justify-between">
                          <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">قیمت نهایی</span>
                              <span className="font-black text-slate-900 text-2xl" style={{ color: mainColor }}>
                                  {product.price.toLocaleString()} 
                                  <span className="text-sm mr-1">{getCurrencySymbol(product.currency)}</span>
                              </span>
                          </div>
                          <div 
                            style={{ backgroundColor: isOutOfStock ? '#cbd5e1' : buyBtnColor }} 
                            className="text-white px-8 py-4 rounded-[1.8rem] text-sm font-black shadow-lg transform group-hover:translate-x-[-8px] transition-all"
                          >
                              {isOutOfStock ? 'ناموجود' : 'خرید مستقیم'}
                          </div>
                      </div>
                  </div>
              </div>
            </Link>
          );
        })}
      </main>

      {/* Sticky Branding Footer */}
      <footer className="mt-auto py-12 w-full text-center">
        <Link to="/" className="inline-flex flex-col items-center gap-4 text-slate-300 hover:text-slate-600 transition-all group">
            <div className="flex items-center gap-3" dir="ltr">
                <div className="w-8 h-8 bg-slate-200 rounded-xl flex items-center justify-center text-sm text-white font-black group-hover:bg-indigo-600 transition-colors">F</div>
                <span className="text-lg font-black tracking-tighter">FASTSell</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50">Empowering Modern Sellers</span>
        </Link>
      </footer>
    </div>
  );
};

export default PublicLinkView;
