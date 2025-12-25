
import React, { useState, useEffect } from 'react';
import { SalesLink, Integrations, PreferenceState, EventPrefs } from '../../types';

interface CommunicationBridgesProps {
  activeLink: SalesLink;
  onUpdateIntegrations: (linkId: string, data: Integrations) => void;
}

const CommunicationBridges: React.FC<CommunicationBridgesProps> = ({ activeLink, onUpdateIntegrations }) => {
  const [data, setData] = useState<Integrations>(activeLink.integrations || {
    telegramChatId: '',
    whatsappNumber: '',
    customDomain: '',
    prefs: { telegram: 'neutral', whatsapp: 'neutral', sms: 'neutral', email: 'neutral' },
    eventPrefs: { orderUpdates: true, newsletters: true, promotions: true, security: true }
  });

  useEffect(() => {
    setData(activeLink.integrations || {
      telegramChatId: '',
      whatsappNumber: '',
      customDomain: '',
      prefs: { telegram: 'neutral', whatsapp: 'neutral', sms: 'neutral', email: 'neutral' },
      eventPrefs: { orderUpdates: true, newsletters: true, promotions: true, security: true }
    });
  }, [activeLink]);

  const handleSave = () => {
    // Safety Net: Check if at least one channel is NOT "no"
    const allDisabled = Object.values(data.prefs).every(v => v === 'no');
    if (allDisabled) {
      alert('خطا: برای دریافت اطلاعات حیاتی (مانند کد رهگیری)، حداقل یک راه ارتباطی باید باز بماند.');
      return;
    }

    onUpdateIntegrations(activeLink.id, data);
    alert('تنظیمات پل‌های ارتباطی با موفقیت ذخیره شد! 🔌');
  };

  const setPref = (channel: keyof typeof data.prefs, state: PreferenceState) => {
    setData({
      ...data,
      prefs: { ...data.prefs, [channel]: state }
    });
  };

  const toggleEvent = (key: keyof EventPrefs) => {
    setData({
      ...data,
      eventPrefs: { ...data.eventPrefs, [key]: !data.eventPrefs[key] }
    });
  };

  const PreferenceButtons = ({ channel, label }: { channel: keyof typeof data.prefs, label: string }) => {
    const state = data.prefs[channel];
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 shadow-sm gap-4">
        <span className="text-xs font-black text-slate-700">{label}</span>
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
           <button 
              onClick={() => setPref(channel, 'yes')}
              className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all ${state === 'yes' ? 'bg-green-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
           >
              بله
           </button>
           <button 
              onClick={() => setPref(channel, 'neutral')}
              className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all ${state === 'neutral' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
           >
              فرقی ندارد
           </button>
           <button 
              onClick={() => setPref(channel, 'no')}
              className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all ${state === 'no' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
           >
              خیر
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-200 space-y-10 animate-in fade-in" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-8">
        <div>
           <h3 className="text-2xl font-black text-slate-900">پل‌های ارتباطی هوشمند 🔌</h3>
           <p className="text-xs text-slate-400 font-bold mt-1">مدیریت حریم خصوصی و نحوه دریافت پیام‌های سیستمی و تبلیغاتی</p>
        </div>
        <button onClick={handleSave} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all text-sm">ذخیره نهایی تنظیمات</button>
      </div>

      <div className="p-6 bg-indigo-900 text-indigo-100 rounded-[2rem] border border-indigo-700 shadow-inner">
         <div className="flex items-start gap-4">
            <div className="text-2xl mt-1">⚖️</div>
            <div>
               <h4 className="font-black text-white text-sm mb-2">قانون اولویت حاکمیتی پل ارتباطی</h4>
               <p className="text-[10px] leading-relaxed font-bold opacity-80 text-justify">
                  تنظیمات شما در این بخش بر تمامی بخش‌های دیگر (مانند بازاریابی هوشمند) اولویت دارد. اگر راهی را «خیر» انتخاب کنید، هیچ فروشنده‌ای در کل پلتفرم قادر نخواهد بود از آن طریق به شما پیام دهد. 
                  <span className="text-amber-400 mr-1 italic underline">نکته: شما نمی‌توانید تمامی راه‌ها را مسدود کنید، زیرا سیستم باید بتواند کد رهگیری خریدتان را به دست شما برساند.</span>
               </p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Step 1: Channels */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">۱</div>
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">کانال‌های ارتباطی (چطوری؟)</h4>
           </div>
           <div className="grid grid-cols-1 gap-4">
              <PreferenceButtons channel="telegram" label="ربات تلگرام" />
              <PreferenceButtons channel="whatsapp" label="پیام‌رسان واتساپ" />
              <PreferenceButtons channel="sms" label="پیامک مستقیم (SMS)" />
              <PreferenceButtons channel="email" label="ایمیل" />
           </div>
        </div>

        {/* Step 2: Event Types */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">۲</div>
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">نوع پیام‌ها (چه مواردی؟)</h4>
           </div>
           <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 space-y-5">
              {[
                { key: 'orderUpdates', label: 'اطلاع‌رسانی سفارش و کد رهگیری', desc: 'ارسال وضعیت بسته و رسید خرید (الزامی)', locked: true },
                { key: 'newsletters', label: 'خبرنامه و مطالب آموزشی', desc: 'اخبار جدید پلتفرم و نکات فروشگاهی' },
                { key: 'promotions', label: 'تخفیفات و پیشنهادهای ویژه', desc: 'کدهای تخفیف دوره‌ای و جشنواره‌ها' },
                { key: 'security', label: 'اعلان‌های امنیتی و ورود', desc: 'گزارش ورود به پنل و تغییر رمز عبور' }
              ].map(item => (
                <label key={item.key} className={`flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer ${data.eventPrefs[item.key as keyof EventPrefs] ? 'bg-white border-indigo-200 shadow-sm border' : 'bg-transparent border-transparent opacity-60'}`}>
                   <div>
                      <div className="text-xs font-black text-slate-800">{item.label}</div>
                      <div className="text-[9px] text-slate-400 font-bold mt-1">{item.desc}</div>
                   </div>
                   <input 
                      type="checkbox" 
                      disabled={item.locked}
                      checked={data.eventPrefs[item.key as keyof EventPrefs]} 
                      onChange={() => toggleEvent(item.key as keyof EventPrefs)}
                      className="w-6 h-6 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500"
                   />
                </label>
              ))}
           </div>
        </div>
      </div>

      {/* Inputs Integration */}
      <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
         <h4 className="text-sm font-black text-slate-900 mb-8 border-b border-slate-200 pb-4">اطلاعات اتصال فیزیکی</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">آی‌دی تلگرام</label>
               <input type="text" value={data.telegramChatId || ''} onChange={e => setData({...data, telegramChatId: e.target.value})} placeholder="@username" className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold text-xs" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">شماره واتساپ</label>
               <input type="tel" value={data.whatsappNumber || ''} onChange={e => setData({...data, whatsappNumber: e.target.value})} placeholder="98912XXXXXXX" className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold text-xs text-left" dir="ltr" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">دامنه اختصاصی (White-label)</label>
               <input type="text" value={data.customDomain || ''} onChange={e => setData({...data, customDomain: e.target.value})} placeholder="mybrand.ir" className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold text-xs text-left" dir="ltr" />
            </div>
         </div>
      </div>
    </div>
  );
};

export default CommunicationBridges;
