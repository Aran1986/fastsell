
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SalesLink, AppUser } from '../types';
import { ApiService } from '../services/apiService';
import Header from '../components/Header';

interface RegisterProps {
  onLogin: (user: AppUser) => void;
  onCreateLink: (data: { title: string; slug: string }) => void;
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
  const [regSuccess, setRegSuccess] = useState(false);

  // Shop Creation states
  const [shopName, setShopName] = useState('');
  const [slug, setSlug] = useState('');

  const queryParams = new URLSearchParams(location.search);
  const refCode = queryParams.get('ref');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        if (password !== confirmPassword) throw new Error("رمز عبور و تاییدیه مطابقت ندارند.");
        await ApiService.register({ identifier, password, authType, referredBy: refCode || undefined });
        setRegSuccess(true);
      } else {
        const user = await ApiService.login(identifier, password);
        onLogin(user);
        navigate('/dashboard');
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
    onCreateLink({ title: shopName, slug });
    navigate('/dashboard');
  };

  if (regSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
         <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100">
            <div className="text-6xl mb-6">📩</div>
            <h2 className="text-2xl font-black mb-4">ایمیل خود را تایید کنید</h2>
            <p className="text-slate-500 font-bold mb-8 leading-relaxed">یک لینک فعال‌سازی برای شما ارسال شد. لطفاً پوشه (Inbox) یا (Spam) خود را چک کنید و روی لینک کلیک کنید تا بتوانید وارد شوید.</p>
            <button onClick={() => setRegSuccess(false)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black">بازگشت به ورود</button>
         </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-200">
             <div className="mb-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl mb-4">🏪</div>
                <h2 className="text-2xl font-black text-slate-900">ساخت ویترین جدید</h2>
                <p className="text-slate-400 text-xs font-bold mt-1">خوش آمدید {user.identifier}</p>
             </div>
             <form onSubmit={handleCreateShop} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase mr-2">نام کسب‌وکار</label>
                  <input required type="text" value={shopName} onChange={e => {
                    setShopName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                  }} className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none font-bold" placeholder="نام برند شما" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase mr-2">آدرس فروشگاه (Slug)</label>
                  <input required type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase())} className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none font-mono text-left" dir="ltr" />
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">تایید و شروع فروش</button>
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

          <form onSubmit={handleAuth} className="space-y-5">
             <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setAuthType('email')} className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${authType === 'email' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>ایمیل</button>
                <button type="button" onClick={() => setAuthType('phone')} className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${authType === 'phone' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>شماره موبایل</button>
             </div>

             <input 
               required 
               type={authType === 'email' ? 'email' : 'tel'} 
               value={identifier} 
               onChange={e => setIdentifier(e.target.value)} 
               placeholder={authType === 'email' ? 'example@mail.com' : '0912XXXXXXX'} 
               className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none font-bold text-center dir-ltr" 
             />

             <input 
               required 
               type="password" 
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
