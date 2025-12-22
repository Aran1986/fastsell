
import React from 'react';
import { SalesLink } from '../../types';

interface LinkManagerProps {
  activeLink: SalesLink;
}

const LinkManager: React.FC<LinkManagerProps> = ({ activeLink }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => alert('لینک مستقیم با موفقیت کپی شد!'));
  };

  const getBaseUrl = () => {
    // Ensuring the base URL ends with /#/ for HashRouter consistency
    const loc = window.location;
    return `${loc.protocol}//${loc.host}/#`;
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 space-y-10 animate-in fade-in duration-300">
      <div>
        <h3 className="text-2xl font-black text-slate-900">لینک‌های تبدیل مستقیم</h3>
        <p className="text-slate-500 font-bold text-sm mt-2">از این لینک‌ها در بیو اینستاگرام، استوری‌ها یا دایرکت برای فروش مستقیم یک محصول خاص استفاده کنید.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeLink.products.length === 0 ? (
          <div className="text-center py-20 text-slate-300 font-bold italic">ابتدا محصولاتی را اضافه کنید تا لینک‌های مستقیم آن‌ها در اینجا نمایش داده شود.</div>
        ) : activeLink.products.map(p => {
          const directLink = `${getBaseUrl()}/checkout/${activeLink.slug}/${p.id}`;
          return (
            <div key={p.id} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center gap-6 group hover:bg-white hover:shadow-2xl transition-all">
                <img src={p.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform" alt="" />
                <div className="flex-1 text-center md:text-right">
                  <div className="font-black text-slate-900 text-lg">{p.name}</div>
                  <div className="text-[10px] font-black text-indigo-400 mt-1 uppercase tracking-widest">{p.category}</div>
                </div>
                <div className="flex-1 w-full md:w-auto">
                    <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 group-hover:border-indigo-200 transition-all" dir="ltr">
                        <span className="flex-1 text-[11px] font-mono text-slate-400 truncate text-left">{directLink}</span>
                        <button onClick={() => handleCopy(directLink)} className="ml-4 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all">کپی لینک</button>
                    </div>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LinkManager;
