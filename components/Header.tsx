
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2" dir="ltr">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg">F</div>
          <span className="text-2xl tracking-tighter flex items-center">
            <span className="font-black text-slate-900">FAS</span>
            <span className="logo-t font-black text-indigo-500">t</span>
            <span className="font-black text-slate-900">Sell</span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/docs" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">راهنما</Link>
          <Link to="/admin" className="text-[10px] font-bold text-slate-300 hover:text-indigo-600 transition-colors uppercase tracking-widest">Admin Panel</Link>
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
          <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            تراکنش‌ها
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;