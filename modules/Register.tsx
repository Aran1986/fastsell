
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SalesLink, AppUser, StoreMode } from '../types';
import { ApiService } from '../services/apiService';
import Header from '../components/Header';

interface RegisterProps {
  onLogin: (user: AppUser) => void;
  onCreateLink: (data: { title: string; slug: string; mode: StoreMode }) => void;
  existingLinks: SalesLink[];
  user: AppUser | null;
}

const Register: React.FC<RegisterProps> = ({ onLogin, onCreateLink, existingLinks, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [authType, setAuthType] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [shopName, setShopName] = useState('');
  const [slug, setSlug] = useState('');
  const [mode, setMode] = useState<StoreMode>(StoreMode.PRODUCT);

  const queryParams = new URLSearchParams(location.search);
  const refCode = queryParams.get('ref');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        if (password !== confirmPassword) throw new Error("رمز عبور و تاییدیه مطابقت ندارند.");
        const newUser = await ApiService.register({ identifier, password, authType, referredBy: refCode || undefined });
        
        if (newUser) {
          onLogin(newUser);
        }
      } else {
        const user = await ApiService.login(identifier, password);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !slug) return;
    onCreateLink({ title: shopName, slug, mode });
    navigate('/dashboard');
  };

  if (user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-[3rem] p-10 sm:p-12 shadow-2xl border border-slate-200">
             <div className="mb-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl mb-4 shadow-xl shadow-indigo-100">🚀</div>
                <h2 className="text-3xl font-black text-slate-900">ساخت موتور فروش جدید</h2>
                <p className="text-slate-400 text-sm font-bold mt-2">چه چیزی برای فروش دارید؟</p>
             </div>
             
             <form onSubmit={handleCreateShop} noValidate className="space-y-8 text-right" dir="rtl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase mr-2 tracking-widest">نام برند یا کسب‌وکار</label>
                     <input required type="text" value={shopName} onChange={e => {
                       setShopName(e.target.value);
                       if(!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                     }} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-black focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="مثلاً: آکادمی هنر" />
                   </div>
                   <div className="space-y-2">
                     <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase mr-2 tracking-widest">آدرس اختصاصی (URL)</label>
                     <input required type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase())} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-mono text-left focus:ring-2 focus:ring-indigo-100 transition-all" dir="ltr" />
                   </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase mr-2 tracking-widest">انتخاب مود فعالیت (Vertical Mode)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     {[
                       { id: StoreMode.PRODUCT, title: 'کالای فیزیکی', desc: 'انبارداری و ارسال پستی', icon: '🛒' },
                       { id: StoreMode.SERVICE, title: 'خدمات / کلاس', desc: 'فایل یا لینک آنلاین', icon: '🎓' },
                       { id: StoreMode.BOOKING, title: 'رزرو نوبت', desc: 'تقویم و اسلات زمانی', icon: '📅' }
                     ].map(m => (
                       <button 
                        key={m.id}
                        type="button"
                        onClick={() => setMode(m.id)}
                        className={`p-6 rounded-[2.5rem] border-2 transition-all text-right flex flex-col gap-3 group ${mode === m.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                       >
                          <div className="text-3xl group-hover:scale-110 transition-transform">{m.icon}</div>
                          <div>
                             <div className={`font-black text-sm ${mode === m.id ? 'text-indigo-600' : 'text-slate-900'}`}>{m.title}</div>
                             <div className="text-[10px] font-bold text-slate-400 mt-1">{m.desc}</div>
                          </div>
                       </button>
                     ))}
                  </div>
                </div>

                <button type="submit" className="w-full py-6 bg-slate-900 text-white font-black text-xl rounded-[2rem] shadow-2xl hover:bg-indigo-600 transition-all transform hover:-translate-y-1">تایید و شروع پیکربندی</button>
             </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95">
          <div className="flex justify-center mb-8">
             <div className="bg-slate-50 p-1 rounded-2xl flex gap-1">
                <button onClick={() => setAuthMode('register')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${authMode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>ثبت‌نام</button>
                <button onClick={() => setAuthMode('login')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>ورود</button>
             </div>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2 text-center">{authMode === 'register' ? 'خوش آمدید! ✨' : 'بازگشت دوباره 🔐'}</h2>
          <p className="text-slate-400 text-center text-sm font-bold mb-8">برای شروع فعالیت اطلاعات زیر را تکمیل کنید.</p>

          <form onSubmit={handleAuth} noValidate className="space-y-5">
             <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setAuthType('email')} className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${authType === 'email' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>ایمیل</button>
                <button type="button" onClick={() => setAuthType('phone')} className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${authType === 'phone' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>شماره موبایل</button>
             </div>

             <input 
               required 
               type="text" 
               name="identifier"
               value={identifier} 
               onChange={e => setIdentifier(e.target.value)} 
               placeholder={authType === 'email' ? 'نام کاربری یا ایمیل' : '0912XXXXXXX'} 
               className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none font-bold text-center" 
             />

             <input 
               required 
               type="password" 
               name="password"
               value={password} 
               onChange={e => setPassword(e.target.value)} 
               placeholder="رمز عبور" 
               className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none font-bold text-center" 
             />

             {authMode === 'register' && (
               <input 
                 required 
                 type="password" 
                 value={confirmPassword} 
                 onChange={e => setConfirmPassword(e.target.value)} 
                 placeholder="تکرار رمز عبور" 
                 className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none font-bold text-center" 
               />
             )}

             {error && <p className="text-[10px] text-red-500 font-bold text-center">{error}</p>}

             <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all">
               {loading ? 'در حال پردازش...' : (authMode === 'register' ? 'ایجاد حساب کاربری' : 'ورود به پنل')}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
