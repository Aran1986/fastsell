
import React, { useState, useEffect } from 'react';
import { SalesLink, Integrations, ChannelPrefs, EventPrefs } from '../../types';

interface IntegrationSettingsProps {
  activeLink: SalesLink;
  onUpdateIntegrations: (linkId: string, data: Integrations) => void;
}

const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ activeLink, onUpdateIntegrations }) => {
  // Define default values clearly to satisfy TypeScript
  const defaultPrefs: ChannelPrefs = { 
    telegram: 'neutral', 
    whatsapp: 'neutral', 
    sms: 'neutral', 
    email: 'neutral' 
  };
  
  const defaultEventPrefs: EventPrefs = { 
    orderUpdates: true, 
    newsletters: false, 
    promotions: false, 
    security: true 
  };

  const initialIntegrations: Integrations = {
    telegramChatId: '',
    whatsappNumber: '',
    customDomain: '',
    prefs: defaultPrefs,
    eventPrefs: defaultEventPrefs
  };

  const [data, setData] = useState<Integrations>(activeLink.integrations || initialIntegrations);

  useEffect(() => {
    setData(activeLink.integrations || initialIntegrations);
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
        {/* Telegram */}
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
                 <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase">Chat ID / Username</label>
                 <input 
                    type="text" 
                    value={data.telegramChatId || ''} 
                    onChange={e => setData({...data, telegramChatId: e.target.value})}
                    placeholder="@your_username" 
                    className="w-full px-5 py-4 rounded-xl border border-sky-200 outline-none font-bold text-sm bg-white" 
                 />
              </div>
           </div>
        </div>

        {/* WhatsApp */}
        <div className="p-8 bg-green-50/50 rounded-[2.5rem] border border-green-100 space-y-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">💬</div>
              <div>
                 <h4 className="font-black text-green-900">پل ارتباطی واتساپ</h4>
                 <p className="text-[10px] text-green-600 font-bold">ارسال پیام مستقیم به مشتری</p>
              </div>
           </div>
           <div className="space-y-4">
              <div>
                 <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase">شماره واتساپ شما</label>
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
                    checked={data.eventPrefs.orderUpdates} 
                    onChange={e => setData({
                        ...data, 
                        eventPrefs: { ...data.eventPrefs, orderUpdates: e.target.checked }
                    })}
                    className="w-5 h-5 rounded border-green-300 text-green-600"
                 />
                 <span className="text-[10px] font-black text-green-700">فعال‌سازی اعلان سفارش</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings;
