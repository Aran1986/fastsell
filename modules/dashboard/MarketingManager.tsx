
import React, { useState, useMemo } from 'react';
import { SalesLink, Product, Order } from '../../types';
import { GoogleGenAI } from "@google/genai";

interface MarketingManagerProps {
  activeLink: SalesLink;
}

interface Campaign {
  id: string;
  title: string;
  content: string;
  type: 'sms' | 'email';
  audience: string;
  date: string;
  status: 'sent' | 'scheduled';
}

const MarketingManager: React.FC<MarketingManagerProps> = ({ activeLink }) => {
  const [activeSubTab, setActiveSubTab] = useState<'campaign' | 'automation' | 'history' | 'global'>('campaign');
  
  // User Plan Mock
  const userPlan = 'Max+';

  // Campaign States
  const [content, setContent] = useState('');
  const [type, setType] = useState<'sms' | 'email'>('sms');
  const [audience, setAudience] = useState<'all' | 'repeat' | 'specific' | 'manual'>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [manualSelectedEmails, setManualSelectedEmails] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Global Target States
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [globalDiscoveryResult, setGlobalDiscoveryResult] = useState<{ count: number; matches: string[] } | null>(null);

  // Automation States
  const [autoThankYou, setAutoThankYou] = useState(true);
  const [thankYouTemplate, setThankYouTemplate] = useState(
    "{customer} عزیز، بابت خرید {product} از فروشگاه {store} صمیمانه سپاسگزاریم. سفارش شما در حال پردازش است.\nبا تشکر - سایت فست‌سل"
  );
  const [autoTracking, setAutoTracking] = useState(true);

  // History (Mock)
  const [history, setHistory] = useState<Campaign[]>([
    { id: 'c1', title: 'تخفیف آخر هفته', content: 'سلام، تخفیف ۲۰ درصدی برای محصولات جدید فعال شد...', type: 'sms', audience: 'همه مشتریان', date: '1402/11/01', status: 'sent' }
  ]);

  // Aggregate Customers for Manual Selection
  const allUniqueCustomers = useMemo(() => {
    const orders = activeLink.orders || [];
    const customerMap: Record<string, { email: string; phone: string }> = {};
    orders.forEach(o => {
      customerMap[o.customerEmail] = { email: o.customerEmail, phone: o.customerPhone };
    });
    return Object.values(customerMap);
  }, [activeLink.orders]);

  const customerCount = useMemo(() => {
    if (audience === 'manual') return manualSelectedEmails.size;
    return allUniqueCustomers.length;
  }, [allUniqueCustomers, audience, manualSelectedEmails]);

  const handleAISuggestion = async () => {
    setIsGenerating(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const prompt = `شما یک متخصص بازاریابی پیامکی هستید. یک متن کوتاه و جذاب حداکثر ۱۵۰ کاراکتری برای تبلیغ فروشگاه "${activeLink.title}" بنویسید که شامل یک دعوت به اقدام (CTA) باشد. فقط متن فارسی برگردانید.`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      setContent(response.text?.trim() || "");
    } catch (e) {
      setContent("سلام! محصولات جدید در فروشگاه ما موجود شد. همین حالا از ویترین ما دیدن کنید.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleManualSelection = (email: string) => {
    const newSet = new Set(manualSelectedEmails);
    if (newSet.has(email)) newSet.delete(email);
    else newSet.add(email);
    setManualSelectedEmails(newSet);
  };

  const handleGlobalDiscovery = async () => {
    if (!selectedProduct) return alert('لطفاً ابتدا یک محصول را انتخاب کنید تا هوش مصنوعی خریداران مرتبط را پیدا کند.');
    setIsDiscovering(true);
    setTimeout(() => {
      setGlobalDiscoveryResult({
        count: Math.floor(Math.random() * 500) + 100,
        matches: ['خریداران لوازم دیجیتال', 'علاقه مندان به تکنولوژی', 'مشتریان وفادار پلتفرم']
      });
      setIsDiscovering(false);
    }, 2500);
  };

  const handleSend = () => {
    if (!content.trim()) return alert('لطفاً متن پیام را وارد کنید.');
    if (audience === 'manual' && manualSelectedEmails.size === 0) return alert('لطفاً حداقل یک مشتری را انتخاب کنید.');
    
    setIsSending(true);
    setTimeout(() => {
      const newCampaign: Campaign = {
        id: Math.random().toString(36).substr(2, 9),
        title: content.substring(0, 20) + '...',
        content,
        type,
        audience: audience === 'manual' ? `${manualSelectedEmails.size} نفر انتخابی` : 'همه مشتریان',
        date: new Date().toLocaleDateString('fa-IR'),
        status: 'sent'
      };
      setHistory([newCampaign, ...history]);
      setContent('');
      setIsSending(false);
      alert('کمپین تبلیغاتی با موفقیت ارسال شد.');
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* Sub-Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm w-fit mx-auto lg:mx-0">
        <button onClick={() => setActiveSubTab('campaign')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'campaign' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>کمپین جدید 🚀</button>
        <button onClick={() => setActiveSubTab('automation')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'automation' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>اتوماسیون هوشمند ✨</button>
        <button onClick={() => setActiveSubTab('global')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeSubTab === 'global' ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>هدف‌گیری سراسری (AI) <span className="bg-amber-400 text-black text-[8px] px-1.5 py-0.5 rounded-full">Max+</span></button>
        <button onClick={() => setActiveSubTab('history')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>تاریخچه ارسال 📜</button>
      </div>

      {activeSubTab === 'campaign' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">ایجاد کمپین تبلیغاتی</h3>
                <button onClick={handleAISuggestion} disabled={isGenerating} className="text-[10px] font-black text-indigo-600 flex items-center gap-1 hover:underline">
                  {isGenerating ? 'در حال ایده پردازی...' : '✨ دستیار هوشمند تبلیغات'}
                </button>
             </div>
             <textarea rows={6} value={content} onChange={e => setContent(e.target.value)} placeholder="متن پیامک یا ایمیل خود را اینجا بنویسید..." className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm resize-none focus:ring-2 focus:ring-indigo-100 transition-all" />
             
             <div className="flex gap-4">
                <button onClick={() => setType('sms')} className={`flex-1 py-4 rounded-2xl font-black text-xs border transition-all ${type === 'sms' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-400'}`}>ارسال پیامک (SMS)</button>
                <button onClick={() => setType('email')} className={`flex-1 py-4 rounded-2xl font-black text-xs border transition-all ${type === 'email' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-400'}`}>ارسال ایمیل (Email)</button>
             </div>

             <button onClick={handleSend} disabled={isSending || customerCount === 0} className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all ${isSending ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200'}`}>
               {isSending ? 'در حال ارسال...' : `ارسال نهایی برای ${customerCount} مخاطب`}
             </button>
          </div>

          <div className="space-y-6">
             <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                <h4 className="text-sm font-black text-slate-900 mb-6">مخاطبین هدف</h4>
                <div className="space-y-3">
                   <button onClick={() => setAudience('all')} className={`w-full p-4 rounded-2xl text-right text-xs font-bold border transition-all ${audience === 'all' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-500'}`}>همه خریداران ({allUniqueCustomers.length})</button>
                   <button onClick={() => setAudience('repeat')} className={`w-full p-4 rounded-2xl text-right text-xs font-bold border transition-all ${audience === 'repeat' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-500'}`}>مشتریان وفادار</button>
                   <button onClick={() => setAudience('manual')} className={`w-full p-4 rounded-2xl text-right text-xs font-bold border transition-all ${audience === 'manual' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-500'}`}>انتخاب دستی مخاطبین ({manualSelectedEmails.size})</button>
                </div>

                {audience === 'manual' && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl max-h-48 overflow-y-auto space-y-2 border border-slate-100">
                    {allUniqueCustomers.map(c => (
                      <label key={c.email} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white rounded-lg transition-all">
                        <input 
                          type="checkbox" 
                          checked={manualSelectedEmails.has(c.email)} 
                          onChange={() => toggleManualSelection(c.email)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                        />
                        <span className="text-[10px] font-bold text-slate-600 truncate">{c.email}</span>
                      </label>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {activeSubTab === 'automation' && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
           <div>
              <h3 className="text-2xl font-black">اتوماسیون هوشمند 🤖</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">تنظیم پیام‌های خودکار سیستمی برای مشتریان</p>
           </div>

           <div className="space-y-8">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">✉️</div>
                       <div>
                          <div className="text-sm font-black text-slate-800">پیام تشکر بعد از خرید</div>
                          <p className="text-[10px] text-slate-400 font-bold">ارسال خودکار بلافاصله پس از پرداخت موفق.</p>
                       </div>
                    </div>
                    <button onClick={() => setAutoThankYou(!autoThankYou)} className={`w-14 h-8 rounded-full relative transition-all ${autoThankYou ? 'bg-green-500' : 'bg-slate-300'}`}>
                       <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${autoThankYou ? 'right-7' : 'right-1'}`}></div>
                    </button>
                 </div>

                 {autoThankYou && (
                    <div className="space-y-4 animate-in slide-in-from-top-2">
                       <div className="flex justify-between items-center px-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase">متن پیامک تشکر</label>
                          <div className="flex gap-2">
                             <span className="text-[8px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{"{customer}"}: نام مشتری</span>
                             <span className="text-[8px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{"{product}"}: نام کالا</span>
                             <span className="text-[8px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{"{store}"}: نام فروشگاه</span>
                          </div>
                       </div>
                       <textarea 
                          rows={4} 
                          value={thankYouTemplate} 
                          onChange={e => setThankYouTemplate(e.target.value)}
                          className="w-full p-6 rounded-2xl bg-white border border-slate-100 outline-none font-bold text-xs resize-none shadow-inner"
                       />
                       <p className="text-[9px] text-slate-400 font-bold">این متن به صورت خودکار برای هر خریدار جایگذاری و ارسال می‌شود.</p>
                    </div>
                 )}
              </div>

              <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-indigo-100 transition-all opacity-60">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">📦</div>
                    <div><div className="text-sm font-black text-slate-800">اطلاع‌رسانی کد رهگیری</div><p className="text-[10px] text-slate-400 font-bold">ارسال خودکار کد مرسوله پستی پس از آپدیت توسط شما.</p></div>
                 </div>
                 <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[8px] font-black">به زودی</span>
              </div>
           </div>
        </div>
      )}

      {activeSubTab === 'global' && (
        <div className="space-y-8">
           {userPlan !== 'Max+' ? (
             <div className="bg-slate-900 text-white p-20 rounded-[4rem] text-center border-4 border-amber-400/20">
                <div className="text-6xl mb-6">👑</div>
                <h3 className="text-3xl font-black mb-4">پلن خود را به Max+ ارتقا دهید</h3>
                <p className="text-slate-400 font-bold max-w-md mx-auto mb-10">تبلیغ محصولات شما در کل شبکه خریداران فست‌سل.</p>
                <button className="bg-amber-400 text-black px-12 py-5 rounded-3xl font-black">ارتقای آنی به Max+</button>
             </div>
           ) : (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border-4 border-slate-900 shadow-2xl space-y-8">
                   <h3 className="text-2xl font-black">هدف‌گیری سراسری (AI Discovery)</h3>
                   <div className="space-y-4">
                      <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-black outline-none text-sm">
                         <option value="">انتخاب محصول برای تحلیل...</option>
                         {activeLink.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <button onClick={handleGlobalDiscovery} disabled={isDiscovering} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs">تحلیل شبکه خریداران پلتفرم</button>
                   </div>
                   {globalDiscoveryResult && <div className="p-6 bg-green-50 rounded-3xl border border-green-100 font-black text-xs text-green-800">تعداد {globalDiscoveryResult.count} خریدار مشابه یافت شد.</div>}
                </div>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
                   <textarea rows={5} value={content} onChange={e => setContent(e.target.value)} placeholder="متن پیام تبلیغاتی..." className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm" />
                   <button onClick={handleSend} disabled={!globalDiscoveryResult || isSending} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black">ارسال سراسری (پلتفرمی)</button>
                </div>
             </div>
           )}
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
           <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase">
                 <tr><th className="p-6">محتوای پیام</th><th className="p-6">مخاطبین</th><th className="p-6">تاریخ</th><th className="p-6">وضعیت</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {history.map(campaign => (
                   <tr key={campaign.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="p-6 font-black text-sm text-slate-700 truncate max-w-[200px]">{campaign.content}</td>
                      <td className="p-6 font-black text-[10px]">{campaign.audience}</td>
                      <td className="p-6 font-bold text-slate-500 text-[10px]">{campaign.date}</td>
                      <td className="p-6 text-green-500 font-black text-[10px]">ارسال شد</td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default MarketingManager;
