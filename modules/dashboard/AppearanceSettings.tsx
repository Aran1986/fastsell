
import React, { useState, useEffect } from 'react';
import { SalesLink } from '../../types';

interface AppearanceSettingsProps {
  activeLink: SalesLink;
  onUpdateThemeColor?: (linkId: string, color: string, buyButtonColor?: string) => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ activeLink, onUpdateThemeColor }) => {
  const [theme, setTheme] = useState(activeLink.themeColor || '#6366f1');
  const [btn, setBtn] = useState(activeLink.buyButtonColor || activeLink.themeColor || '#6366f1');

  useEffect(() => {
    setTheme(activeLink.themeColor || '#6366f1');
    setBtn(activeLink.buyButtonColor || activeLink.themeColor || '#6366f1');
  }, [activeLink]);

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 space-y-10 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-slate-900">Custom Branding & Theme</h3>
        <button onClick={() => onUpdateThemeColor?.(activeLink.id, theme, btn)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Apply Visuals</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="space-y-4">
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Primary Brand Color</label>
             <div className="flex items-center gap-6">
                <input type="color" value={theme} onChange={e => setTheme(e.target.value)} className="w-24 h-24 rounded-[2rem] cursor-pointer shadow-lg border-4 border-white ring-1 ring-slate-200" />
                <div className="font-mono text-sm font-black text-slate-400">{theme.toUpperCase()}</div>
             </div>
             <p className="text-[10px] font-bold text-slate-400">This color will be used for headers, icons, and primary accents.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Buy Button Color</label>
             <div className="flex items-center gap-6">
                <input type="color" value={btn} onChange={e => setBtn(e.target.value)} className="w-24 h-24 rounded-[2rem] cursor-pointer shadow-lg border-4 border-white ring-1 ring-slate-200" />
                <div className="font-mono text-sm font-black text-slate-400">{btn.toUpperCase()}</div>
             </div>
             <p className="text-[10px] font-bold text-slate-400">Choose a high-contrast color to encourage customer conversion.</p>
          </div>
        </div>
      </div>
      
      <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
         <h4 className="font-black text-slate-900 mb-4">Preview Samples</h4>
         <div className="flex flex-wrap gap-4">
            <button style={{ backgroundColor: btn }} className="px-8 py-3 rounded-2xl text-white font-black text-sm shadow-xl">Quick Buy Sample</button>
            <div style={{ color: theme }} className="flex items-center gap-2 font-black text-sm border px-6 py-3 rounded-2xl border-current">
               Active State Accent
            </div>
         </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
