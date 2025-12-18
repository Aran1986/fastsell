
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
    case Currency.IRR: return 'ریال';
    case Currency.CRYPTO: return '₮';
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
        const timer = setTimeout(() => setShowWelcome(true), 1200);
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-center min-h-[400px]">
        <h1 className="text-6xl font-black text-slate-900 mb-6">۴۰۴</h1>
        <p className="text-slate-600 text-xl font-bold mb-8">فروشگاه مورد نظر پیدا نشد.</p>
        <Link to="/" className="text-indigo-600 font-black border-b-2 border-indigo-600 pb-1">می‌خواهید لینک خود را بسازید؟ ←</Link>
      </div>
    );
  }

  const displayProducts = productId 
    ? link.products.filter(p => p.id === productId) 
    : link.products;

  const mainColor = link.themeColor || '#6366f1';
  const buyBtnColor = link.buyButtonColor || mainColor;

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-4 max-w-md mx-auto w-full relative" dir="rtl">
      
      {/* Welcome Message Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-700">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-xs shadow-2xl relative animate-in zoom-in-95 duration-500 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8 mx-auto shadow-inner relative overflow-hidden" style={{ backgroundColor: `${mainColor}15`, color: mainColor }}>
               <div className="absolute inset-0 opacity-10" style={{ backgroundColor: mainColor }}></div>
               <svg className="w-10 h-10 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z"></path></svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 text-center mb-4">خوش آمدید! ✨</h2>
            <p className="text-slate-500 text-center text-sm leading-relaxed mb-10 font-bold">
              به فروشگاه <span className="font-black" style={{ color: mainColor }}>«{link.title}»</span> خوش آمدید. ما بهترین محصولات خود را برای شما آماده کرده‌ایم.
            </p>
            <button 
              onClick={dismissWelcome}
              style={{ backgroundColor: buyBtnColor }}
              className="w-full py-5 text-white font-black rounded-2xl shadow-2xl transition-all active:scale-95 hover:brightness-110"
            >
              متوجه شدم، بریم خرید!
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12 w-full">
        <div className="w-28 h-28 rounded-full mx-auto mb-6 border-4 border-white shadow-2xl flex items-center justify-center text-white text-5xl font-black ring-4 ring-slate-50 transition-transform hover:scale-105 duration-500" style={{ background: `linear-gradient(135deg, ${mainColor}, #a855f7)` }}>
            {link.title.charAt(0)}
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">{link.title}</h1>
        <p className="text-slate-500 px-8 text-sm leading-relaxed font-bold">{link.bio}</p>
        {productId && (
            <Link to={`/s/${slug}`} className="mt-6 inline-block text-[11px] font-black uppercase px-6 py-2.5 rounded-full border transition-all hover:shadow-lg" style={{ color: mainColor, backgroundColor: `${mainColor}08`, borderColor: `${mainColor}25` }}>مشاهده کاتالوگ کامل فروشگاه</Link>
        )}
      </div>

      {/* Products Grid/List */}
      <div className="w-full space-y-6">
        {displayProducts.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              هنوز محصولی در این فروشگاه لیست نشده است.
            </div>
        ) : displayProducts.map(product => (
          <Link 
            to={`/checkout/${link.slug}/${product.id}`}
            key={product.id} 
            className={`block bg-white border ${product.isFeatured ? 'border-indigo-200 ring-2 ring-indigo-50' : 'border-slate-200'} p-5 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative`}
          >
            {product.isFeatured && (
              <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[8px] px-3 py-1 rounded-bl-2xl font-black uppercase tracking-widest z-10 shadow-lg">ویژه</div>
            )}
            <div className="flex items-center gap-6">
                <div className="w-28 h-28 rounded-[2rem] overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-50">
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                </div>
                <div className="flex-1 text-right">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-black text-slate-900 text-xl group-hover:text-indigo-600 transition-colors" style={{ color: mainColor }}>{product.name}</h3>
                      <span className="text-[9px] bg-slate-50 px-2 py-0.5 rounded-full font-bold text-slate-300">{product.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-bold">{product.description}</p>
                    <div className="mt-5 flex items-center justify-between">
                        <span className="font-black text-slate-900 text-2xl" style={{ color: mainColor }} dir="ltr">{getCurrencySymbol(product.currency)} {product.price.toLocaleString()}</span>
                        <div style={{ backgroundColor: buyBtnColor }} className="text-white px-7 py-3 rounded-[1.4rem] text-[12px] font-black shadow-lg transition-transform group-active:scale-95">
                            خرید سریع
                        </div>
                    </div>
                </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer Branding */}
      <div className="mt-20 text-center pb-12">
        <Link to="/" className="inline-flex flex-col items-center gap-3 text-slate-300 hover:text-slate-500 transition-colors group">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Powered by</span>
            <div className="flex items-center gap-2" dir="ltr">
                <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center text-xs text-white font-black group-hover:bg-indigo-500 transition-colors">F</div>
                <span className="text-sm font-bold tracking-tighter">
                  <span className="font-black text-slate-400 group-hover:text-slate-900 transition-colors">FAS</span>
                  <span className="logo-t text-slate-400 group-hover:text-indigo-500 transition-colors">t</span>
                  <span className="font-black text-slate-400 group-hover:text-slate-900 transition-colors">Sell</span>
                </span>
            </div>
        </Link>
      </div>
    </div>
  );
};

export default PublicLinkView;
