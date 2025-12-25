
import React, { useState } from 'react';
import { SalesLink, Order, ShippingLabel, StoreMode } from '../../types';
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

  const storeMode = activeLink.mode || StoreMode.PRODUCT;

  const handleCopyAllData = (o: Order) => {
    const text = `
🛒 مورد: ${o.productName}
${o.bookingTime ? `⏰ زمان: ${o.bookingTime}` : ''}
👤 مشتری: ${o.customerEmail}
📞 همراه: ${o.customerPhone}
${o.customerAddress ? `🏠 آدرس: ${o.customerAddress}` : ''}
💰 مبلغ: ${o.totalPaid.toLocaleString()}
    `.trim();
    navigator.clipboard.writeText(text).then(() => alert('اطلاعات کپی شد!'));
  };

  const handleUpdateStatus = (o: Order, status: 'shipped' | 'delivered') => {
    onUpdateOrder?.(activeLink.id, o.id, { status, trackingNumber: trackingInput });
    setTrackingInput('');
    setSelectedOrder(null);
  };

  const handleIssuePostalLabel = async (o: Order) => {
    setIsIssuingLabel(true);
    try {
      const label = await PostalService.issueShippingLabel(o);
      setShowLabelPreview(label);
      onUpdateOrder?.(activeLink.id, o.id, { 
        status: 'shipped', 
        trackingNumber: label.trackingCode,
        shippingLabel: label
      });
    } catch (e) {
      alert('خطا در سامانه پستی.');
    } finally {
      setIsIssuingLabel(false);
    }
  };

  const safeOrders = Array.isArray(activeLink.orders) ? activeLink.orders : [];

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm text-right" dir="rtl">
      <div className="p-8 border-b border-slate-50">
        <h3 className="text-2xl font-black">مدیریت {storeMode === StoreMode.PRODUCT ? 'فروش و ارسال' : 'رزروها و خدمات'}</h3>
        <p className="text-xs text-slate-400 font-bold mt-1">لیست تراکنش‌ها و درخواست‌های خریداران</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase">
            <tr>
              <th className="p-6">موضوع / مشتری</th>
              <th className="p-6">جزئیات</th>
              <th className="p-6">مبلغ نهایی</th>
              <th className="p-6">وضعیت</th>
              <th className="p-6">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {safeOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">دیتایی یافت نشد.</td>
              </tr>
            ) : safeOrders.slice().reverse().map(o => (
              <tr key={o.id} className="hover:bg-slate-50/50 transition-all">
                <td className="p-6">
                   <div className="font-black text-slate-800">{o.productName}</div>
                   <div className="text-[10px] text-slate-400 font-bold mt-1">{o.customerEmail}</div>
                </td>
                <td className="p-6">
                   {o.bookingTime ? (
                     <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-black">⏰ رزرو ساعت {o.bookingTime}</span>
                   ) : (
                     <span className="text-[10px] font-bold text-slate-400">{o.customerPhone}</span>
                   )}
                </td>
                <td className="p-6">
                   <div className="font-black text-indigo-600">{(o.totalPaid || 0).toLocaleString()} <span className="text-[9px]">تومان</span></div>
                </td>
                <td className="p-6">
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full ${
                    o.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                    o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {o.status === 'pending' ? 'در انتظار' : o.status === 'shipped' ? 'انجام شده' : 'تحویل شده'}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedOrder(o)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black">مدیریت</button>
                    <button onClick={() => handleCopyAllData(o)} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black">کپی دیتا</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[800] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 text-right">
              <h3 className="text-xl font-black mb-6">تغییر وضعیت سفارش</h3>
              <div className="space-y-6">
                 {selectedOrder.customerAddress && (
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">آدرس مقصد</p>
                      <p className="text-sm font-bold text-slate-800">{selectedOrder.customerAddress}</p>
                   </div>
                 )}

                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleUpdateStatus(selectedOrder, 'shipped')} className="bg-indigo-600 text-white py-4 rounded-xl font-black text-xs">ثبت به عنوان "انجام شده"</button>
                    <button onClick={() => handleUpdateStatus(selectedOrder, 'delivered')} className="bg-green-600 text-white py-4 rounded-xl font-black text-xs">تایید نهایی تحویل</button>
                 </div>

                 <button onClick={() => setSelectedOrder(null)} className="w-full bg-slate-100 text-slate-500 py-3 rounded-xl font-black text-xs">بستن</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;
