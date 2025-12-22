
import React, { useState, useMemo } from 'react';
import { SalesLink, Order, Currency } from '../../types';

interface OrderManagerProps {
  activeLink: SalesLink;
  onUpdateOrder?: (linkId: string, orderId: string, updates: Partial<Order>) => void;
}

const OrderManager: React.FC<OrderManagerProps> = ({ activeLink, onUpdateOrder }) => {
  const [sortField, setSortField] = useState<'date' | 'status' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const getExplorerLink = (hash: string, network: string = 'TRC20') => {
    if (network.toUpperCase() === 'TRC20') return `https://tronscan.org/#/transaction/${hash}`;
    if (network.toUpperCase() === 'ERC20') return `https://etherscan.io/tx/${hash}`;
    return `https://google.com/search?q=${hash}`;
  };

  const sortedOrders = useMemo(() => {
    const orders = [...(activeLink.orders || [])];
    return orders.sort((a, b) => {
      let comp = 0;
      if (sortField === 'date') comp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortField === 'amount') comp = a.amount - b.amount;
      return sortDirection === 'desc' ? -comp : comp;
    });
  }, [activeLink.orders, sortField, sortDirection]);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-300">
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-2xl font-black">مدیریت سفارشات</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">پیگیری فروش و تحلیل منابع ورودی مشتریان</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right" dir="rtl">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="p-6">محصول</th>
              <th className="p-6">مشتری و آدرس</th>
              <th className="p-6">منبع فروش</th>
              <th className="p-6">مبلغ و درگاه</th>
              <th className="p-6">تایید واریز (TXID)</th>
              <th className="p-6">وضعیت</th>
              <th className="p-6">تاریخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedOrders.length === 0 ? (
              <tr><td colSpan={7} className="p-20 text-center text-slate-300 font-bold italic">سفارشی ثبت نشده است.</td></tr>
            ) : sortedOrders.map(o => (
              <tr key={o.id} className="hover:bg-slate-50/80 transition-all">
                <td className="p-6 font-black text-slate-800">{o.productName}</td>
                <td className="p-6">
                  <div className="font-bold text-slate-700">{o.customerEmail}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{o.customerPhone}</div>
                  <div className="text-[9px] text-indigo-400 mt-1 truncate max-w-[150px]">{o.customerAddress}</div>
                </td>
                <td className="p-6">
                  {o.source === 'marketplace' ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black">
                      <span>🛒</span> ویترین عمومی
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black">
                      <span>🔗</span> لینک مستقیم
                    </div>
                  )}
                </td>
                <td className="p-6">
                   <div className="font-black text-indigo-600">
                      {o.amount.toLocaleString()} <span className="text-[10px]">{o.currency}</span>
                   </div>
                   <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${o.currency === Currency.CRYPTO ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {o.currency === Currency.CRYPTO ? 'کریپتو' : 'ریالی'}
                   </span>
                </td>
                <td className="p-6">
                   {o.currency === Currency.CRYPTO && o.transactionHash ? (
                      <div className="space-y-1">
                        <div className="font-mono text-[9px] text-slate-500 bg-slate-100 p-2 rounded-lg break-all select-all">{o.transactionHash}</div>
                        <a href={getExplorerLink(o.transactionHash, activeLink.bankDetails?.network)} target="_blank" rel="noreferrer" className="text-[9px] font-black text-indigo-600 hover:underline flex items-center gap-1">
                          بررسی در بلاک‌چین <span dir="ltr">→</span>
                        </a>
                      </div>
                   ) : (
                      <span className="text-slate-300 text-xs font-bold">---</span>
                   )}
                </td>
                <td className="p-6">
                  <select 
                    value={o.status} 
                    onChange={e => onUpdateOrder?.(activeLink.id, o.id, { status: e.target.value as any })}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-xl border-none outline-none cursor-pointer ${
                      o.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                      o.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}
                  >
                    <option value="pending">در انتظار</option>
                    <option value="shipped">ارسال شده</option>
                    <option value="delivered">تحویل شده</option>
                    <option value="cancelled">لغو شده</option>
                  </select>
                </td>
                <td className="p-6 text-[10px] font-mono text-slate-400">
                  {new Date(o.date).toLocaleDateString('fa-IR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManager;
