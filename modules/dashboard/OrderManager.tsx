
import React, { useState, useMemo } from 'react';
import { SalesLink, Order, Currency } from '../../types';

interface OrderManagerProps {
  activeLink: SalesLink;
  onUpdateOrder?: (linkId: string, orderId: string, updates: Partial<Order>) => void;
}

type SortField = 'date' | 'status' | 'amount';
type SortDirection = 'asc' | 'desc';

const OrderManager: React.FC<OrderManagerProps> = ({ activeLink, onUpdateOrder }) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const statusPriority: Record<Order['status'], number> = {
    pending: 0,
    shipped: 1,
    delivered: 2,
    cancelled: 3,
  };

  const sortedOrders = useMemo(() => {
    const orders = [...(activeLink.orders || [])];
    
    return orders.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'status') {
        comparison = statusPriority[a.status] - statusPriority[b.status];
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [activeLink.orders, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-300">
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-2xl font-black">Received Orders & Requests</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">Manage and track your customer purchases</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-black text-slate-400 px-2 uppercase tracking-widest">Sort by:</span>
          <button 
            onClick={() => toggleSort('date')}
            className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${sortField === 'date' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            Date {sortField === 'date' && (sortDirection === 'desc' ? '↓' : '↑')}
          </button>
          <button 
            onClick={() => toggleSort('status')}
            className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${sortField === 'status' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            Status {sortField === 'status' && (sortDirection === 'desc' ? '↓' : '↑')}
          </button>
          <button 
            onClick={() => toggleSort('amount')}
            className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${sortField === 'amount' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            Price {sortField === 'amount' && (sortDirection === 'desc' ? '↓' : '↑')}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="p-6">Item/Service</th>
              <th className="p-6">Customer Details</th>
              <th className="p-6">Amount</th>
              <th className="p-6">Status</th>
              <th className="p-6">Tracking / Notes</th>
              <th className="p-6 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-20 text-center text-slate-400 font-bold italic">
                  No orders found yet.
                </td>
              </tr>
            ) : sortedOrders.map(o => (
              <tr key={o.id} className="hover:bg-slate-50/80 transition-all">
                <td className="p-6 font-black text-slate-800">{o.productName}</td>
                <td className="p-6">
                  <div className="font-bold text-slate-700">{o.customerEmail}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{o.customerPhone}</div>
                  <div className="text-[10px] text-indigo-400 mt-0.5 max-w-[150px] truncate">{o.customerAddress}</div>
                </td>
                <td className="p-6 font-black text-indigo-600">
                   {o.currency === Currency.IRR ? '﷼' : o.currency === Currency.CRYPTO ? '₮' : '$'} {o.amount.toLocaleString()}
                </td>
                <td className="p-6">
                  <select 
                    value={o.status} 
                    onChange={e => onUpdateOrder?.(activeLink.id, o.id, { status: e.target.value as any })}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-xl border-none outline-none cursor-pointer transition-colors ${
                      o.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                      o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      o.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="shipped">Processing / Shipped</option>
                    <option value="delivered">Completed / Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="p-6">
                   <input 
                    type="text" 
                    placeholder="TX / Tracking ID..." 
                    value={o.orderNote || ''} 
                    onChange={e => onUpdateOrder?.(activeLink.id, o.id, { orderNote: e.target.value })} 
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[10px] outline-none w-full font-mono focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" 
                   />
                </td>
                <td className="p-6 text-right">
                  <div className="text-[10px] font-mono text-slate-400">
                    {new Date(o.date).toLocaleDateString()}
                  </div>
                  <div className="text-[9px] font-mono text-slate-300 mt-1">
                    {new Date(o.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Showing {sortedOrders.length} orders
        </div>
        <div className="flex gap-2">
           <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
           </button>
           <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
           </button>
        </div>
      </div>
    </div>
  );
};

export default OrderManager;
