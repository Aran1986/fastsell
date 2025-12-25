
import React, { useState } from 'react';
import { SalesLink, Order, ShippingLabel } from '../../types';
import { PostalService } from '../../services/postalService';

interface OrderManagerProps {
  activeLink: SalesLink;
  onUpdateOrder?: (linkId: string, orderId: string, updates: Partial<Order>) => void;
}

const OrderManager: React.FC<OrderManagerProps> = ({ activeLink, onUpdateOrder }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [isIssuingLabel, setIsIssuingLabel] = useState(false);
  const [showLabelPreview, setShowLabelPreview] = useState<ShippingLabel | null>(null);

  const handleCopyAllData = (o: Order) => {
    const text = `
🛒 سفارش: ${o.productName}
👤 مشتری: ${o.customerEmail}
📞 همراه: ${o.customerPhone}
📮 کد پستی: ${o.customerPostalCode}
🏠 آدرس: ${o.customerAddress}
💰 مبلغ: ${o.totalPaid.toLocaleString()} ${o.currency}
    `.trim();
    navigator.clipboard.writeText(text).then(() => alert('تمامی مشخصات مشتری برای چاپ کپی شد!'));
  };

  const handleUpdateStatus = (o: Order, status: 'shipped' | 'delivered') => {
    if (status === 'shipped' && o.shippingMethod === 'post' && !trackingInput) {
      return alert('برای ارسال پستی، وارد کردن کد رهگیری الزامی است.');
    }
    onUpdateOrder?.(activeLink.id, o.id, { status, trackingNumber: trackingInput });
    setTrackingInput('');
    setSelectedOrder(null);
  };

  const handleIssuePostalLabel = async (o: Order) => {
    setIsIssuingLabel(true);
    try {
      const label = await PostalService.issueShippingLabel(o);
      setShowLabelPreview(label);
      // Auto-update order tracking
      onUpdateOrder?.(activeLink.id, o.id, { 
        status: 'shipped', 
        trackingNumber: label.trackingCode,
        shippingLabel: label
      });
    } catch (e) {
      alert('خطا در اتصال به پنل پستی. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsIssuingLabel(false);
    }
  };

  const safeOrders = Array.isArray(activeLink.orders) ? activeLink.orders : [];

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-8 border-b border-slate-50">
        <h3 className="text-2xl font-black">مدیریت لجستیک و فروش</h3>
        <p className="text-xs text-slate-400 font-bold mt-1">رهگیری وضعیت بسته‌ها و اطلاعات خریداران</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right" dir="rtl">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase">
            <tr>
              <th className="p-6">محصول / خریدار</th>
              <th className="p-6">مبلغ</th>
              <th className="p-6">وضعیت</th>
              <th className="p-6">لجستیک</th>
              <th className="p-6">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {safeOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">هنوز سفارشی ثبت نشده است.</td>
              </tr>
            ) : safeOrders.slice().reverse().map(o => (
              <tr key={o.id} className="hover:bg-slate-50/50 transition-all">
                <td className="p-6">
                   <div className="font-black text-slate-800">{o.productName}</div>
                   <div className="text-[10px] text-slate-400 font-bold mt-1">{o.customerEmail} | {o.customerPhone}</div>
                </td>
                <td className="p-6">
                   <div className="font-black text-indigo-600">{(o.totalPaid || 0).toLocaleString()} <span className="text-[9px]">{o.currency}</span></div>
                </td>
                <td className="p-6">
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full ${
                    o.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                    o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {o.status === 'pending' ? 'در انتظار' : o.status === 'shipped' ? 'ارسال شده' : 'تحویل شده'}
                  </span>
                </td>
                <td className="p-6">
                   {o.shippingLabel ? (
                     <button onClick={() => setShowLabelPreview(o.shippingLabel!)} className="text-xs font-black text-indigo-600 hover:underline">مشاهده بارنامه</button>
                   ) : (
                     <button 
                       disabled={isIssuingLabel}
                       onClick={() => handleIssuePostalLabel(o)}
                       className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                     >
                       {isIssuingLabel ? 'درحال صدور...' : 'صدور بارنامه پستی'}
                     </button>
                   )}
                </td>
                <td className="p-6">
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedOrder(o)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black">مدیریت</button>
                    <button onClick={() => handleCopyAllData(o)} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black">استخراج دیتا</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Label Preview Modal */}
      {showLabelPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[900] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative text-right" dir="rtl">
              <button onClick={() => setShowLabelPreview(null)} className="absolute top-6 left-6 text-slate-300 hover:text-red-500 font-black text-2xl">×</button>
              <div className="flex flex-col items-center">
                 <div className="text-3xl mb-4">📮</div>
                 <h3 className="text-xl font-black mb-1">بارنامه پستی مرسوله</h3>
                 <p className="text-[10px] text-slate-400 font-bold mb-8">آماده جهت چاپ و الصاق روی بسته</p>
                 
                 <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-6 space-y-4">
                    <div className="flex justify-between border-b border-slate-200 pb-3">
                       <span className="text-[10px] font-black text-slate-400">کد رهگیری:</span>
                       <span className="text-xs font-black font-mono text-indigo-600">{showLabelPreview.trackingCode}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-3">
                       <span className="text-[10px] font-black text-slate-400">نوع سرویس:</span>
                       <span className="text-xs font-black">{showLabelPreview.serviceType}</span>
                    </div>
                    <div className="flex justify-center py-4">
                       <img src={showLabelPreview.qrCode} className="w-32 h-32 rounded-xl" alt="QR Code" />
                    </div>
                 </div>

                 <button onClick={() => window.print()} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl">چاپ بارنامه</button>
              </div>
           </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[800] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95">
              <h3 className="text-xl font-black mb-6 text-right">پردازش سفارش {selectedOrder.id}</h3>
              <div className="space-y-6 text-right">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">آدرس مقصد</p>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">{selectedOrder.customerAddress}</p>
                 </div>

                 {selectedOrder.status === 'pending' && (
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400">کد رهگیری (TXID / پستی)</label>
                      <input type="text" value={trackingInput} onChange={e => setTrackingInput(e.target.value)} placeholder="مثلاً: ۳۴۵۰۸۰۰..." className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold" />
                      <button onClick={() => handleUpdateStatus(selectedOrder, 'shipped')} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black">ثبت ارسال و اطلاع به مشتری</button>
                   </div>
                 )}

                 {selectedOrder.status === 'shipped' && (
                   <button onClick={() => handleUpdateStatus(selectedOrder, 'delivered')} className="w-full bg-green-600 text-white py-4 rounded-xl font-black">تحویل داده شد</button>
                 )}

                 <button onClick={() => setSelectedOrder(null)} className="w-full bg-slate-100 text-slate-500 py-3 rounded-xl font-black">انصراف</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;
