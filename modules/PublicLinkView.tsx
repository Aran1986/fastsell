
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SalesLink, Currency, Review } from '../types';
import { TrackingService } from '../services/trackingService';
import { summarizeReviews } from '../services/geminiService';

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
  const [notifiedProds, setNotifiedProds] = useState<Set<string>>(new Set());
  const [reviewSummary, setReviewSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    if (link) {
      if (productId) {
        TrackingService.trackView(link.slug, productId);
      } else {
        link.products.forEach(p => TrackingService.trackView(link.slug, p.id));
      }

      const storageKey = `welcome_dismissed_${link.slug}`;
      const isDismissed = localStorage.getItem(storageKey);
      if (!isDismissed) {
        const timer = setTimeout(() => setShowWelcome(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [link, productId]);

  const handleSummarize = async () => {
    if (!link?.reviews || link.reviews.length === 0) return;
    setIsSummarizing(true);
    const comments = link.reviews.map(r => r.comment);
    const summary = await summarizeReviews(comments);
    setReviewSummary(summary);
    setIsSummarizing(false);
  };

  const handleNotifyMe = async (e: React.MouseEvent, pId: string) => {
    e.preventDefault();
    if (link) {
      await TrackingService.requestStockNotification(link.slug, pId, 'Anonymous User');
      setNotifiedProds(prev => new Set(prev).add(pId));
      alert('درخواست شما ثبت شد. به محض موجودی، اطلاع‌رسانی می‌شود.');
    }
  };

  if (!link) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white text-center min-h-screen">
        <h1 className="text-8xl font-black text-slate-100 mb-6 select-none">404</h1>
        <p className="text-slate-600 text-xl font-bold mb-4">فروشگاه مورد نظر پیدا نشد.</p>
        <Link to="/register" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl">ساخت فروشگاه ←</Link>
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
      {/* Background Decorative */}
      <div className="absolute top-0 left-0 w-full h-96 opacity-10 pointer-events-none" style={{ background: `linear-gradient(180deg, ${mainColor} 0%, transparent 100%)` }}></div>

      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white rounded-[3.5rem] p-12 w-full max-w-sm shadow-2xl relative flex flex-col items-center">
            <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${mainColor}, #a855f7)`, color: 'white' }}>
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">خوش آمدید! ✨</h2>
            <p className="text-slate-500 text-center text-sm leading-relaxed mb-10 font-bold">به «{link.title}» خوش آمدید.</p>
            <button onClick={() => setShowWelcome(false)} style={{ backgroundColor: buyBtnColor }} className="w-full py-5 text-white font-black rounded-2xl shadow-xl">مشاهده ویترین</button>
          </div>
        </div>
      )}

      <header className="w-full max-w-2xl pt-16 pb-12 px-6 text-center z-10">
        <div className="w-32 h-32 rounded-[3rem] mx-auto border-8 border-white shadow-2xl flex items-center justify-center text-white text-5xl font-black mb-8" style={{ background: `linear-gradient(135deg, ${mainColor}, #a855f7)` }}>
            {link.title.charAt(0)}
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{link.title}</h1>
        <p className="text-slate-500 max-w-md mx-auto text-base leading-relaxed font-bold bg-white/50 backdrop-blur-sm py-3 px-6 rounded-2xl border border-white/50 mb-8">{link.bio}</p>

        {/* Trust Layer UI */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="bg-white/60 backdrop-blur p-4 rounded-3xl border border-white/50 shadow-sm">
                <div className="text-indigo-600 font-black text-xl mb-1">⭐ {link.trustScore || '4.5'}</div>
                <div className="text-[9px] font-bold text-slate-400">امتیاز اعتماد</div>
            </div>
            <div className="bg-white/60 backdrop-blur p-4 rounded-3xl border border-white/50 shadow-sm">
                <div className="text-green-600 font-black text-xl mb-1">%{link.deliverySuccessCount ? '99' : '100'}</div>
                <div className="text-[9px] font-bold text-slate-400">تحویل موفق</div>
            </div>
            <div className="bg-white/60 backdrop-blur p-4 rounded-3xl border border-white/50 shadow-sm">
                <div className="text-orange-600 font-black text-lg mb-1">~{link.avgResponseTimeMinutes || '30'}m</div>
                <div className="text-[9px] font-bold text-slate-400">پاسخگویی</div>
            </div>
        </div>
      </header>

      <main className="w-full max-w-2xl px-6 pb-24 space-y-8">
        {displayProducts.map(product => {
          const isOutOfStock = product.stock <= 0;
          return (
            <div 
              key={product.id} 
              className={`group block bg-white rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden`}
            >
              <div className="flex flex-col sm:flex-row relative">
                  <div className="sm:w-56 h-56 overflow-hidden relative">
                      <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt={product.name} />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                           <span className="text-white font-black text-sm border-2 border-white px-4 py-2 rounded-xl transform -rotate-12">ناموجود</span>
                        </div>
                      )}
                  </div>
                  <div className="flex-1 p-8 flex flex-col justify-between">
                      <div>
                          <div className="flex items-start justify-between mb-2">
                             <h3 className="font-black text-slate-900 text-2xl">{product.name}</h3>
                             <span className="text-[10px] bg-slate-50 px-3 py-1 rounded-full font-black text-slate-400">{product.category}</span>
                          </div>
                          <p className="text-sm text-slate-400 font-bold leading-relaxed line-clamp-2">{product.description}</p>
                      </div>
                      
                      <div className="mt-8 flex items-center justify-between">
                          <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-300 uppercase">قیمت</span>
                              <div className="flex flex-col items-start">
                                  {product.discountPrice && (
                                    <span className="text-sm text-slate-300 line-through font-bold">
                                        {product.price.toLocaleString()}
                                    </span>
                                  )}
                                  <span className="font-black text-slate-900 text-2xl leading-none" style={{ color: mainColor }}>
                                      {(product.discountPrice || product.price).toLocaleString()} 
                                      <span className="text-sm mr-1">{getCurrencySymbol(product.currency)}</span>
                                  </span>
                              </div>
                          </div>
                          {isOutOfStock ? (
                            <button 
                              onClick={(e) => handleNotifyMe(e, product.id)}
                              disabled={notifiedProds.has(product.id)}
                              className={`px-8 py-4 rounded-[1.8rem] text-sm font-black shadow-lg transition-all ${notifiedProds.has(product.id) ? 'bg-green-100 text-green-600' : 'bg-slate-900 text-white'}`}
                            >
                              {notifiedProds.has(product.id) ? 'ثبت شد ✓' : 'موجود شد خبرم کن'}
                            </button>
                          ) : (
                            <Link 
                              to={`/checkout/${link.slug}/${product.id}`}
                              style={{ backgroundColor: buyBtnColor }} 
                              className="text-white px-8 py-4 rounded-[1.8rem] text-sm font-black shadow-lg transform group-hover:-translate-x-2 transition-all"
                            >
                              خرید مستقیم
                            </Link>
                          )}
                      </div>
                  </div>
              </div>
            </div>
          );
        })}

        {/* Smart Review Section */}
        <section className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-slate-100 mt-12">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h3 className="text-2xl font-black text-slate-900">نظرات خریداران 💬</h3>
                <button 
                  onClick={handleSummarize}
                  disabled={isSummarizing || !link.reviews?.length}
                  className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all"
                >
                  {isSummarizing ? 'در حال تحلیل...' : '✨ خلاصه هوشمند نظرات (AI)'}
                </button>
            </div>

            {reviewSummary && (
                <div className="bg-indigo-900 text-white p-6 rounded-[2rem] mb-10 shadow-xl relative animate-in zoom-in-95">
                    <div className="absolute -top-3 right-8 bg-indigo-500 text-white px-3 py-1 rounded-full text-[8px] font-black">تحلیل هوشمند</div>
                    <p className="text-sm leading-relaxed font-bold italic">«{reviewSummary}»</p>
                </div>
            )}

            <div className="space-y-6">
                {!link.reviews?.length ? (
                    <div className="text-center py-12 text-slate-300 font-bold italic">هنوز نظری ثبت نشده است.</div>
                ) : link.reviews.map(rev => (
                    <div key={rev.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-400 text-xs">{rev.customerName.charAt(0)}</div>
                                <div>
                                    <div className="text-sm font-black text-slate-800">{rev.customerName}</div>
                                    <div className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                        خریدار تایید شده
                                    </div>
                                </div>
                            </div>
                            <div className="text-amber-500 font-black text-sm">{'⭐'.repeat(rev.rating)}</div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-bold">{rev.comment}</p>
                    </div>
                ))}
            </div>
        </section>
      </main>

      <footer className="mt-auto py-12 w-full text-center">
        <Link to="/" className="inline-flex flex-col items-center gap-4 text-slate-300 hover:text-slate-600 group">
            <div className="flex items-center gap-3" dir="ltr">
                <div className="w-8 h-8 bg-slate-200 rounded-xl flex items-center justify-center text-sm text-white font-black group-hover:bg-indigo-600 transition-colors">F</div>
                <span className="text-lg font-black tracking-tighter">FASTSell</span>
            </div>
        </Link>
      </footer>
    </div>
  );
};

export default PublicLinkView;
