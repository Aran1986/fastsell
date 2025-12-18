
import React, { useState } from 'react';
import { SalesLink, Order } from '../types';
import { useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  links: SalesLink[];
  onUpdateSlug?: (linkId: string, newSlug: string) => void;
  onUpdateOrder?: (linkId: string, orderId: string, updates: Partial<Order>) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ links, onUpdateSlug, onUpdateOrder }) => {
  const navigate = useNavigate();
  const [editingLink, setEditingLink] = useState<{id: string, slug: string} | null>(null);
  const [selectedLinkOrders, setSelectedLinkOrders] = useState<SalesLink | null>(null);
  
  const platformStats = {
    totalVolume: links.reduce((acc, curr) => acc + (curr.totalSales || 0), 0),
    totalCommission: links.reduce((acc, curr) => acc + ((curr.totalSales || 0) * 0.03), 0),
    totalSellers: links.length,
    totalProducts: links.reduce((acc, curr) => acc + curr.products.length, 0)
  };

  const handleSlugUpdate = () => {
    if (editingLink && onUpdateSlug) {
      onUpdateSlug(editingLink.id, editingLink.slug);
      setEditingLink(null);
      alert('آدرس فروشگاه با موفقیت تغییر کرد.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                    پنل مدیریت پلتفرم 
                    <span className="flex items-center text-indigo-400" dir="ltr">
                        <span>FAS</span>
                        <span className="logo-t">t</span>
                        <span>Sell</span>
                    </span>
                </h1>
                <p className="text-slate-400 mt-1 font-bold text-xs">نظارت بر عملکرد کلیه فروشگاه‌های عضو</p>
            </div>
            <button onClick={() => navigate('/')} className="bg-slate-800 px-6 py-2 rounded-xl text-sm font-bold border border-slate-700 hover:bg-slate-700 transition-colors">بازگشت به سایت</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
                { label: 'حجم کل معاملات', val: `$${platformStats.totalVolume.toLocaleString()}`, color: 'text-white' },
                { label: 'سود پلتفرم (۳٪)', val: `$${platformStats.totalCommission.toLocaleString()}`, color: 'text-indigo-400' },
                { label: 'فروشندگان', val: platformStats.totalSellers, color: 'text-white' },
                { label: 'کل محصولات', val: platformStats.totalProducts, color: 'text-white' }
            ].map((s, i) => (
                <div key={i} className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
                    <div className="text-slate-500 text-[10px] font-black mb-2 uppercase tracking-widest">{s.label}</div>
                    <div className={`text-4xl font-black ${s.color}`}>{s.val}</div>
                </div>
            ))}
        </div>

        <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-700 bg-slate-800/50">
                <h3 className="text-xl font-bold">لیست فروشگاه‌ها و آخرین وضعیت</h3>
            </div>
            <table className="w-full text-right">
                <thead className="bg-slate-800 text-slate-500 text-xs font-black">
                    <tr><th className="p-6">نام فروشگاه</th><th className="p-6">آدرس (Slug)</th><th className="p-6">سفارشات</th><th className="p-6">فروش خالص</th><th className="p-6">عملیات</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {links.map(link => (
                        <tr key={link.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="p-6 font-bold">{link.title}</td>
                            <td className="p-6">
                                {editingLink?.id === link.id ? (
                                    <div className="flex gap-2">
                                        <input 
                                            value={editingLink.slug} 
                                            onChange={(e) => setEditingLink({...editingLink, slug: e.target.value})} 
                                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono outline-none" 
                                            dir="ltr"
                                        />
                                        <button onClick={handleSlugUpdate} className="bg-green-600 px-2 py-1 rounded text-[10px] font-bold">ذخیره</button>
                                        <button onClick={() => setEditingLink(null)} className="bg-slate-600 px-2 py-1 rounded text-[10px] font-bold">لغو</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-indigo-400 text-sm">/s/{link.slug}</span>
                                        <button onClick={() => setEditingLink({id: link.id, slug: link.slug})} className="text-[9px] text-slate-500 hover:text-white underline">ویرایش</button>
                                    </div>
                                )}
                            </td>
                            <td className="p-6 font-bold">
                                <button onClick={() => setSelectedLinkOrders(link)} className="hover:text-indigo-400 transition-colors">
                                    {(link.orders || []).length} سفارش
                                </button>
                            </td>
                            <td className="p-6 font-black text-green-400">${link.totalSales || 0}</td>
                            <td className="p-6">
                                <button onClick={() => window.open(`/#/s/${link.slug}`, '_blank')} className="text-[10px] font-black bg-slate-700 px-4 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-600 transition-colors">مشاهده زنده</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Orders Details Modal for Admin */}
      {selectedLinkOrders && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[600] flex items-center justify-center p-6 animate-in fade-in">
              <div className="bg-slate-800 border border-slate-700 rounded-[3rem] p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
                  <button onClick={() => setSelectedLinkOrders(null)} className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                  <h2 className="text-3xl font-black mb-10 text-right">سفارشات فروشگاه: {selectedLinkOrders.title}</h2>
                  
                  <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                          <thead className="bg-slate-900/50 text-slate-500 font-black">
                              <tr>
                                  <th className="p-4">محصول</th>
                                  <th className="p-4">خریدار</th>
                                  <th className="p-4">ارسال و پستی</th>
                                  <th className="p-4">مبلغ</th>
                                  <th className="p-4">رهگیری</th>
                                  <th className="p-4">وضعیت</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                              {(selectedLinkOrders.orders || []).map(order => (
                                  <tr key={order.id} className="hover:bg-slate-700/20">
                                      <td className="p-4 font-bold">{order.productName}</td>
                                      <td className="p-4">
                                          <div className="font-bold">{order.customerEmail}</div>
                                          <div className="text-[10px] text-indigo-400 font-mono">{order.customerPhone}</div>
                                      </td>
                                      <td className="p-4">
                                          <div className="text-[10px] max-w-[200px] leading-relaxed mb-1">{order.customerAddress}</div>
                                          <div className="text-[10px] text-slate-500">کدپستی: {order.customerPostalCode}</div>
                                      </td>
                                      <td className="p-4 font-black">${order.amount}</td>
                                      <td className="p-4 font-mono text-indigo-300">{order.trackingNumber || '---'}</td>
                                      <td className="p-4">
                                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                              {order.status === 'pending' ? 'در انتظار' : order.status === 'shipped' ? 'ارسال شده' : order.status === 'delivered' ? 'تحویل شده' : 'لغو شده'}
                                          </span>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
