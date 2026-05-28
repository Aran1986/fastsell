
import React, { useState, useMemo } from 'react';
import { SalesLink, Product, Order, AppUser } from '../../types';
import { GoogleGenAI } from "@google/genai";

interface MarketingManagerProps {
  activeLink: SalesLink;
}

interface Campaign {
  id: string;
  title: string;
  content: string;
  type: 'sms' | 'email' | 'whatsapp' | 'telegram';
  audience: string;
  date: string;
  status: 'sent' | 'scheduled';
}

interface AutomationRule {
  id: string;
  title: string;
  desc: string;
  icon: string;
  active: boolean;
  stats: string;
}

const MarketingManager: React.FC<MarketingManagerProps> = ({ activeLink }) => {
  const [activeSubTab, setActiveSubTab] = useState<'campaign' | 'automation' | 'history' | 'global'>('campaign');
  
  // --- Campaign States ---
  const [content, setContent] = useState('');
  const [type, setType] = useState<'sms' | 'email' | 'whatsapp' | 'telegram'>('sms');
  const [audience, setAudience] = useState<'all' | 'repeat' | 'specific' | 'manual'>('all');
  const [manualSelectedEmails, setManualSelectedEmails] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Automation States ---
  const [automations, setAutomations] = useState<AutomationRule[]>([
    { id: 'welcome', title: 'پیام خوش‌آمدگویی', desc: 'ارسال خودکار کد تخفیف ۵٪ پس از اولین ثبت‌نام یا خرید.', icon: '👋', active: true, stats: '۱۲۵ ارسال' },
    { id: 'cart', title: 'بازیابی سبد خرید', desc: 'یادآوری به مشتریانی که خرید را نهایی نکردند (۱ ساعت بعد).', icon: '🛒', active: false, stats: '۰ ارسال' },
    { id: 'review', title: 'درخواست ثبت نظر', desc: 'ارسال لینک نظرسنجی ۳ روز پس از تحویل موفق سفارش.', icon: '⭐', active: true, stats: '۸۴ ارسال' },
    { id: 'winback', title: 'بازگشت مشتری', desc: 'ارسال پیشنهاد ویژه به مشتریانی که ۴۵ روز خرید نکرده‌اند.', icon: 'k', active: false, stats: '۰ ارسال' },
  ]);

  // --- Global AI States ---
  const [aiStatus, setAiStatus] = useState<'idle' | 'scanning' | 'ready'>('idle');

  // Aggregated Customers Logic
  const allUniqueCustomers = useMemo(() => {
    const orders = activeLink.orders || [];
    const customerMap: Record<string, { email: string; phone: string; optedOut?: boolean }> = {};
    orders.forEach(o => {
      const hasOptedOut = Math.random() < 0.2; // Simulation
      customerMap[o.customerEmail] = { email: o.customerEmail, phone: o.customerPhone, optedOut: hasOptedOut };
    });
    return Object.values(customerMap);
  }, [activeLink.orders]);

  const reachableCustomers = useMemo(() => {
    if (audience === 'manual') {
      return Array.from(manualSelectedEmails).filter(email => {
        const cust = allUniqueCustomers.find(c => c.email === email);
        return cust && !cust.optedOut;
      });
    }
    return allUniqueCustomers.filter(c => !c.optedOut);
  }, [allUniqueCustomers, audience, manualSelectedEmails]);

  const optedOutCount = useMemo(() => {
    if (audience === 'manual') {
      return Array.from(manualSelectedEmails).filter(email => {
        const cust = allUniqueCustomers.find(c => c.email === email);
        return cust && cust.optedOut;
      }).length;
    }
    return allUniqueCustomers.filter(c => c.optedOut).length;
  }, [allUniqueCustomers, audience, manualSelectedEmails]);

  // --- Handlers ---

  const handleAISuggestion = async () => {
    setIsGenerating(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `یک پیامک تبلیغاتی جذاب برای فروشگاه "${activeLink.title}" بنویسید. حداکثر ۱۰۰ کاراکتر. فقط فارسی.`
      });
      setContent(response.text?.trim() || "");
    } catch (e) {
      setContent("سلام! محصولات جدید در فروشگاه ما موجود شد. همین حالا از ویترین ما دیدن کنید.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleManualSelection = (email: string) => {
    const cust = allUniqueCustomers.find(c => c.email === email);
    if (cust?.optedOut) {
      alert('این کاربر دریافت پیام‌های تبلیغاتی را مسدود کرده است.');
      return;
    }
    const newSet = new Set(manualSelectedEmails);
    if (newSet.has(email)) newSet.delete(email);
    else newSet.add(email);
    setManualSelectedEmails(newSet);
  };

  const handleSend = () => {
    if (!content.trim()) return alert('لطفاً متن پیام را وارد کنید.');
    if (reachableCustomers.length === 0) return alert('هیچ مخاطب در دسترس برای ارسال پیام یافت نشد.');
    
    setIsSending(true);
    setTimeout(() => {
      setContent('');
      setIsSending(false);
      alert(`ارسال با موفقیت انجام شد. (${reachableCustomers.length} پیام ارسال گردید)`);
    }, 2000);
  };

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const startAiScan = () => {
    setAiStatus('scanning');
    setTimeout(() => {
      setAiStatus('ready');
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm w-fit mx-auto lg:mx-0">
        <button onClick={() => setActiveSubTab('campaign')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'campaign' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>کمپین جدید 🚀</button>
        <button onClick={() => setActiveSubTab('automation')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'automation' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>اتوماسیون ✨</button>
        <button onClick={() => setActiveSubTab('global')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeSubTab === 'global' ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>هدف‌گیری سراسری (AI)</button>
        <button onClick={() => setActiveSubTab('history')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>تاریخچه 📜</button>
      </div>

      {/* --- TAB: NEW CAMPAIGN --- */}
      {activeSubTab === 'campaign' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">ایجاد کمپین بازاریابی</h3>
                <button onClick={handleAISuggestion} disabled={isGenerating} className="text-[10px] font-black text-indigo-600 flex items-center gap-1 hover:underline">
                  {isGenerating ? 'در حال نگارش...' : '✨ نویسنده هوشمند'}
                </button>
             </div>
             
             <textarea rows={6} value={content} onChange={e => setContent(e.target.value)} placeholder="پیام خود را بنویسید..." className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm resize-none focus:ring-2 focus:ring-indigo-100 transition-all" />
             
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">انتخاب کانال ارسال</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                   {[
                     { id: 'sms', label: 'پیامک', icon: '📱' },
                     { id: 'whatsapp', label: 'واتساپ', icon: '💬' },
                     { id: 'telegram', label: 'تلگرام', icon: '✈️' },
                     { id: 'email', label: 'ایمیل', icon: '✉️' }
                   ].map(ch => (
                     <button key={ch.id} onClick={() => setType(ch.id as any)} className={`p-4 rounded-2xl font-black text-[10px] border transition-all flex flex-col items-center gap-2 ${type === ch.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                        <span className="text-xl">{ch.icon}</span>
                        {ch.label}
                     </button>
                   ))}
                </div>
             </div>

             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs font-black">
                   <span className="text-slate-500">مخاطبین قابل دریافت پیام:</span>
                   <span className="text-green-600">{reachableCustomers.length} نفر</span>
                </div>
                {optedOutCount > 0 && (
                  <div className="flex justify-between text-[10px] font-bold text-red-400 italic">
                    <span>محروم از دریافت (توسط Bridge):</span>
                    <span>{optedOutCount} کاربر مسدود کرده‌اند</span>
                  </div>
                )}
             </div>

             <button onClick={handleSend} disabled={isSending || reachableCustomers.length === 0} className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all ${isSending ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}>
               {isSending ? 'در حال پردازش...' : `ارسال نهایی برای ${reachableCustomers.length} مخاطب`}
             </button>
          </div>

          <div className="space-y-6">
             <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                <h4 className="text-sm font-black text-slate-900 mb-6">لیست مشتریان</h4>
                <div className="space-y-3">
                   <button onClick={() => setAudience('all')} className={`w-full p-4 rounded-2xl text-right text-xs font-bold border transition-all ${audience === 'all' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-500'}`}>تمامی خریداران</button>
                   <button onClick={() => setAudience('manual')} className={`w-full p-4 rounded-2xl text-right text-xs font-bold border transition-all ${audience === 'manual' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-500'}`}>انتخاب دستی</button>
                </div>

                {audience === 'manual' && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl max-h-48 overflow-y-auto space-y-2 border border-slate-100">
                    {allUniqueCustomers.map(c => (
                      <label key={c.email} className={`flex items-center gap-2 p-1 rounded-lg transition-all ${c.optedOut ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-white'}`}>
                        <input 
                          type="checkbox" 
                          disabled={c.optedOut}
                          checked={manualSelectedEmails.has(c.email)} 
                          onChange={() => toggleManualSelection(c.email)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                        />
                        <span className="text-[10px] font-bold text-slate-600 truncate">{c.email}</span>
                        {c.optedOut && <span className="text-[8px] bg-red-100 text-red-500 px-1 rounded">مسدود</span>}
                      </label>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* --- TAB: AUTOMATION --- */}
      {activeSubTab === 'automation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
          {automations.map(auto => (
            <div key={auto.id} className={`p-8 rounded-[3rem] border-2 transition-all duration-300 ${auto.active ? 'bg-white border-indigo-600 shadow-xl' : 'bg-slate-50 border-transparent opacity-80'}`}>
               <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${auto.active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                    {auto.icon}
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name={`toggle-${auto.id}`} id={`toggle-${auto.id}`} checked={auto.active} onChange={() => toggleAutomation(auto.id)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300" style={{ right: auto.active ? '0' : '50%', borderColor: auto.active ? '#4f46e5' : '#cbd5e1' }}/>
                    <label htmlFor={`toggle-${auto.id}`} className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${auto.active ? 'bg-indigo-600' : 'bg-slate-300'}`}></label>
                  </div>
               </div>
               <h4 className={`text-lg font-black mb-2 ${auto.active ? 'text-slate-900' : 'text-slate-500'}`}>{auto.title}</h4>
               <p className="text-xs text-slate-500 font-bold leading-relaxed mb-6 h-10">{auto.desc}</p>
               <div className={`text-[10px] font-black px-4 py-2 rounded-xl inline-block ${auto.active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                  وضعیت: {auto.stats}
               </div>
            </div>
          ))}
          
          <div className="col-span-1 md:col-span-2 p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-start gap-4">
             <span className="text-2xl">⚡</span>
             <div>
                <h4 className="font-black text-amber-900 text-sm">نکته مهم</h4>
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed mt-1">
                  اتوماسیون‌ها به صورت خودکار و بدون نیاز به دخالت شما اجرا می‌شوند. هزینه هر پیامک به صورت خودکار از موجودی کیف پول کسر می‌گردد.
                </p>
             </div>
          </div>
        </div>
      )}

      {/* --- TAB: GLOBAL AI TARGETING --- */}
      {activeSubTab === 'global' && (
        <div className="bg-slate-900 text-white rounded-[3.5rem] p-12 relative overflow-hidden shadow-2xl animate-in zoom-in-95">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[150px] rounded-full"></div>
           
           <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-5xl shadow-[0_0_50px_rgba(99,102,241,0.5)] animate-pulse">
                 {aiStatus === 'scanning' ? '📡' : '🧠'}
              </div>
              
              <div>
                 <h2 className="text-4xl font-black mb-4">هدف‌گیری هوشمند سراسری (Global AI)</h2>
                 <p className="text-indigo-200 font-bold text-lg leading-relaxed">
                   هوش مصنوعی ما با تحلیل رفتار خریداران در کل پلتفرم، مشتریانی را که الگوی خرید مشابه با محصولات شما دارند شناسایی و تبلیغ شما را فقط برای آن‌ها ارسال می‌کند.
                 </p>
              </div>

              {aiStatus === 'idle' && (
                <button onClick={startAiScan} className="bg-white text-slate-900 px-12 py-5 rounded-[2rem] font-black text-xl hover:scale-105 transition-transform shadow-xl">
                  شروع اسکن شبکه مشتریان 🔎
                </button>
              )}

              {aiStatus === 'scanning' && (
                <div className="space-y-4 w-full">
                   <div className="h-2 bg-slate-800 rounded-full overflow-hidden w-full max-w-md mx-auto">
                      <div className="h-full bg-indigo-500 animate-[progress_2s_ease-in-out_infinite]" style={{ width: '50%' }}></div>
                   </div>
                   <p className="text-xs font-mono text-indigo-300">در حال تحلیل ۱۲,۴۵۰ نقطه داده...</p>
                </div>
              )}

              {aiStatus === 'ready' && (
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 w-full animate-in slide-in-from-bottom-4">
                   <div className="flex justify-around mb-8 text-center">
                      <div>
                         <div className="text-3xl font-black text-green-400">۱,۴۲۰</div>
                         <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">مخاطب بالقوه</div>
                      </div>
                      <div>
                         <div className="text-3xl font-black text-indigo-400">۸۵٪</div>
                         <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">تطابق سلیقه</div>
                      </div>
                   </div>
                   <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-500 transition-colors">
                      ارسال کمپین هوشمند (۳۵۰,۰۰۰ تومان)
                   </button>
                </div>
              )}
           </div>
        </div>
      )}

      {/* --- TAB: HISTORY --- */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in">
           <div className="p-8 border-b border-slate-50">
              <h3 className="text-xl font-black text-slate-900">تاریخچه کمپین‌ها</h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-right">
                 <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase">
                    <tr>
                       <th className="p-6">عنوان کمپین</th>
                       <th className="p-6">کانال</th>
                       <th className="p-6">تعداد مخاطب</th>
                       <th className="p-6">تاریخ</th>
                       <th className="p-6">وضعیت</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/50">
                       <td className="p-6 font-bold text-slate-800">تخفیف یلدایی</td>
                       <td className="p-6"><span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-lg text-[10px] font-black">SMS</span></td>
                       <td className="p-6 font-mono text-slate-600">124 نفر</td>
                       <td className="p-6 text-xs text-slate-500">1402/09/30</td>
                       <td className="p-6"><span className="text-green-600 text-[10px] font-black">✅ انجام شده</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                       <td className="p-6 font-bold text-slate-800">معرفی محصول جدید</td>
                       <td className="p-6"><span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-[10px] font-black">Whatsapp</span></td>
                       <td className="p-6 font-mono text-slate-600">45 نفر</td>
                       <td className="p-6 text-xs text-slate-500">1402/10/15</td>
                       <td className="p-6"><span className="text-green-600 text-[10px] font-black">✅ انجام شده</span></td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default MarketingManager;
