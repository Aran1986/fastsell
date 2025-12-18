
import React, { useState, useEffect } from 'react';
import { SalesLink, Currency } from '../../types';

interface ProfileManagerProps {
  activeLink: SalesLink;
  onUpdateProfile?: (linkId: string, data: { title: string; bio: string; defaultCurrency: Currency; categories: string[] }) => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ activeLink, onUpdateProfile }) => {
  const [title, setTitle] = useState(activeLink.title);
  const [bio, setBio] = useState(activeLink.bio);
  const [currency, setCurrency] = useState<Currency>(activeLink.defaultCurrency || Currency.USD);
  const [cats, setCats] = useState<string[]>(activeLink.categories || []);
  const [newCat, setNewCat] = useState('');

  useEffect(() => {
    setTitle(activeLink.title);
    setBio(activeLink.bio);
    setCurrency(activeLink.defaultCurrency || Currency.USD);
    setCats(activeLink.categories || []);
  }, [activeLink]);

  const handleSave = () => {
    onUpdateProfile?.(activeLink.id, { title, bio, defaultCurrency: currency, categories: cats });
    alert('Profile updated successfully!');
  };

  const addCat = () => {
    if (newCat && !cats.includes(newCat)) {
      setCats([...cats, newCat]);
      setNewCat('');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 space-y-10 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-slate-900">Profile & Shop Identity</h3>
        <button onClick={handleSave} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Save Profile</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Shop Name</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-black text-lg focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Short Bio</label>
            <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm resize-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Default Catalog Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-black text-sm">
              <option value={Currency.USD}>US Dollar (PayPal)</option>
              <option value={Currency.EUR}>Euro (Stripe)</option>
              <option value={Currency.CRYPTO}>Crypto (USDT)</option>
              <option value={Currency.IRR}>Persian Rial (ZarinPal)</option>
            </select>
          </div>
          <div className="space-y-4">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Product/Service Categories</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {cats.map((c, i) => (
                <span key={i} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-black border border-indigo-100 flex items-center gap-2">
                  {c}
                  <button onClick={() => setCats(cats.filter(item => item !== c))} className="text-indigo-300 hover:text-red-500 font-bold">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New Category..." className="flex-1 px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm" />
              <button onClick={addCat} className="bg-slate-900 text-white px-5 py-3 rounded-xl font-black text-sm">Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;
