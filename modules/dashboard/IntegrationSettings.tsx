
import React, { useState, useEffect } from 'react';
import { SalesLink, Integrations } from '../../types';

interface IntegrationSettingsProps {
  activeLink: SalesLink;
  onUpdateIntegrations: (linkId: string, data: Integrations) => void;
}

const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ activeLink, onUpdateIntegrations }) => {
  const [data, setData] = useState<Integrations>(activeLink.integrations || {
    enableOrderNotifs: true,
    telegramChatId: '',
    whatsappNumber: '',
    customDomain: ''
  });

  useEffect(() => {
    setData(activeLink.integrations || {
      enableOrderNotifs: true,
      telegramChatId: '',
      whatsappNumber: '',
      customDomain: ''
    });
  }, [activeLink]);

  const handleSave = () => {
    onUpdateIntegrations(activeLink.id, data);
    alert('تنظیمات اتصال با موفقیت ذخیره شد! 🚀');
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-200 space-y-10 animate-in fade-in" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-8">
        <div>
           <h3 className="text-2xl font-black text-slate-900">اتصال به پیام‌رسان‌ها و دامنه 🔌</h3>
           <p className="text-xs text-slate-400 font-bold mt-1">مدیریت اعلان‌های فروش و شخصی‌سازی آدرس فروشگاه</p>
        </div>
        <button onClick={handleSave} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all text-sm">ذخیره تنظیمات</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Telegram Integration */}
        <div className="p-8 bg-sky-50/50 rounded-[2.5rem] border border-sky-100 space-y-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">✈️</div>
              <div>
                 <h4 className="font-black text-sky-900">ربات اطلاع‌رسانی تلگرام</h4>
                 <p className="text-[10px] text-sky-600 font-bold">دریافت آنی جزئیات سفارش در تلگرام</p>
              </div>
           </div>
           <div className="space-y-4">
              <div>
                 <label className="block text-[10px] font-black text-sky-400 mb-2 uppercase">Chat ID / Username</label>
                 <input 
                    type="text" 
                    value={data.telegramChatId || ''} 
                    onChange={e => setData({...data, telegramChatId: e.target.value})}
                    placeholder="@your_username" 
                    className="w-full px-5 py-4 rounded-xl border border-sky-200 outline-none font-bold text-sm bg-white" 
                 />
              </div>
              <p className="text-[9px] text-sky-400 leading-relaxed">
                * ابتدا در تلگرام ربات <span className="font-black">@FastSellNotify_Bot</span> را استارت کنید و سپس آی‌دی خود را اینجا وارد نمایید.
              </p>
           </div>
        </div>

        {/* WhatsApp Integration */}
        <div className="p-8 bg-green-50/50 rounded-[2.5rem] border border-green-100 space-y-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">💬</div>
              <div>
                 <h4 className="font-black text-green-900">پل ارتباطی واتساپ</h4>
                 <p className="text-[10px] text-green-600 font-bold">ارسال پیام مستقیم به مشتری پس از خرید</p>
              </div>
           </div>
           <div className="space-y-4">
              <div>
                 <label className="block text-[10px] font-black text-green-400 mb-2 uppercase">شماره واتساپ شما</label>
                 <input 
                    type="tel" 
                    value={data.whatsappNumber || ''} 
                    onChange={e => setData({...data, whatsappNumber: e.target.value})}
                    placeholder="98912XXXXXXX" 
                    className="w-full px-5 py-4 rounded-xl border border-green-200 outline-none font-bold text-sm bg-white text-left" 
                    dir="ltr"
                 />
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-green-100">
                 <input 
                    type="checkbox" 
                    checked={data.enableOrderNotifs} 
                    onChange={e => setData({...data, enableOrderNotifs: e.target.checked})}
                    className="w-5 h-5 rounded border-green-300 text-green-600"
                 />
                 <span className="text-[10px] font-black text-green-700">فعال‌سازی ارسال خودکار رسید به مشتری</span>
              </div>
           </div>
        </div>

        {/* Custom Domain Integration */}
        <div className="lg:col-span-2 p-8 bg-indigo-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -ml-20 -mt-20"></div>
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                 <h4 className="text-2xl font-black mb-4">دامنه اختصاصی (White-label) 🌐</h4>
                 <p className="text-indigo-200 text-sm font-bold leading-relaxed mb-6">
                    برند خود را حرفه‌ای‌تر کنید. با اتصال دامنه شخصی، مشتریان شما دیگر نامی از FASTSell نخواهند دید و مستقیماً وارد سایت شما می‌شوند.
                 </p>
                 <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                       <span className="text-[10px] font-black uppercase text-indigo-300 block mb-2">رکورد جهت تنظیم در پنل دامنه:</span>
                       <code className="text-xs font-mono text-white block">A Record -> 1.2.3.4 (FastSell Server)</code>
                    </div>
                 </div>
              </div>
              <div className="space-y-4">
                 <label className="block text-[10px] font-black text-indigo-300 uppercase mr-2">آدرس دامنه شما</label>
                 <input 
                    type="text" 
                    value={data.customDomain || ''} 
                    onChange={e => setData({...data, customDomain: e.target.value})}
                    placeholder="mybrand.ir" 
                    className="w-full px-6 py-5 rounded-2xl bg-white/10 border border-white/20 outline-none font-black text-lg text-left placeholder:text-white/20" 
                    dir="ltr"
                 />
                 <div className="bg-indigo-500/30 p-4 rounded-2xl text-center border border-indigo-400/30">
                    <span className="text-[10px] font-black">گواهی SSL (HTTPS) به صورت خودکار صادر می‌شود 🔒</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings;
