
import React, { useMemo, useState } from 'react';
import { SalesLink, Order } from '../../types';

interface MiniCRMProps {
  activeLink: SalesLink;
}

interface CustomerProfile {
  email: string;
  phone: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string;
  orders: Order[];
}

const MiniCRM: React.FC<MiniCRMProps> = ({ activeLink }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  const customers = useMemo(() => {
    const orders = activeLink.orders || [];
    const customerMap: Record<string, CustomerProfile> = {};

    orders.forEach(order => {
      const key = order.customerEmail;
      if (!customerMap[key]) {
        customerMap[key] = {
          email: order.customerEmail,
          phone: order.customerPhone,
          totalSpent: 0,
          orderCount: 0,
          lastOrderDate: order.date,
          orders: []
        };
      }

      customerMap[key].totalSpent += order.totalPaid;
      customerMap[key].orderCount += 1;
      customerMap[key].orders.push(order);
      
      if (new Date(order.date) > new Date(customerMap[key].lastOrderDate)) {
        customerMap[key].lastOrderDate = order.date;
      }
    });

    return Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [activeLink.orders]);

  const filteredCustomers = customers.filter(c => 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const repeatCustomers = customers.filter(c => c.orderCount > 1).length;
    const totalRevenue = customers.reduce((acc, c) => acc + c.totalSpent, 0);
    const avgLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    return { totalCustomers, repeatCustomers, avgLTV };
  }, [customers]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="text-[10px] font-black text-slate-400 uppercase mb-2">کل مشتریان</div>
           <div className="text-4xl font-black text-slate-900">{stats.totalCustomers} <span className="text-xs text-slate-300">نفر</span></div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="text-[10px] font-black text-slate-400 uppercase mb-2">مشتریان وفادار</div>
           <div className="text-4xl font-black text-indigo-600">{stats.repeatCustomers} <span className="text-xs text-indigo-300">تکرار خرید</span></div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="text-[10px] font-black text-slate-400 uppercase mb-2">ارزش میانگین (LTV)</div>
           <div className="text-2xl font-black text-slate-900">{Math.round(stats.avgLTV).toLocaleString()} <span className="text-xs text-slate-300">تومان</span></div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
              <h3 className="text-2xl font-black">مدیریت مشتریان (Mini CRM) 👥</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">شناسایی خریداران برتر و تحلیل رفتار خرید</p>
           </div>
           <div className="relative w-full md:w-80">
              <input 
                type="text" 
                placeholder="جستجو با ایمیل یا موبایل..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase">
              <tr>
                <th className="p-6">مشتری</th>
                <th className="p-6">تعداد خرید</th>
                <th className="p-6">مجموع خرید (LTV)</th>
                <th className="p-6">آخرین فعالیت</th>
                <th className="p-6">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">مشتری یافت نشد.</td>
                </tr>
              ) : filteredCustomers.map(customer => (
                <tr key={customer.email} className="hover:bg-slate-50/50 transition-all group">
                  <td className="p-6">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                          {customer.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-sm">{customer.email}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{customer.phone}</div>
                        </div>
                     </div>
                  </td>
                  <td className="p-6">
                     <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600">
                        {customer.orderCount} سفارش
                     </div>
                  </td>
                  <td className="p-6">
                     <div className="font-black text-slate-900">{customer.totalSpent.toLocaleString()} <span className="text-[10px] text-slate-400">تومان</span></div>
                  </td>
                  <td className="p-6">
                     <div className="text-[10px] font-bold text-slate-500">
                        {new Date(customer.lastOrderDate).toLocaleDateString('fa-IR')}
                     </div>
                  </td>
                  <td className="p-6 text-left">
                     <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all"
                     >
                        مشاهده سوابق
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 relative">
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="absolute top-6 left-6 text-slate-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>

              <div className="mb-10 text-right">
                <h3 className="text-2xl font-black mb-2">سوابق خرید مشتری</h3>
                <p className="text-indigo-600 font-bold text-sm" dir="ltr">{selectedCustomer.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-2">کل خریدها</div>
                    <div className="text-2xl font-black text-slate-900">{selectedCustomer.orderCount}</div>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-2">ارزش کل مشتری</div>
                    <div className="text-2xl font-black text-indigo-600">{selectedCustomer.totalSpent.toLocaleString()} <span className="text-xs">تومان</span></div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="font-black text-slate-900 mb-4 border-b pb-4">لیست دقیق سفارشات</h4>
                 {selectedCustomer.orders.map(order => (
                    <div key={order.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
                       <div className="flex items-center gap-4">
                          <img src={order.productImage} className="w-12 h-12 rounded-xl object-cover" alt="" />
                          <div>
                            <div className="text-sm font-black text-slate-800">{order.productName}</div>
                            <div className="text-[10px] text-slate-400 font-bold mt-1">
                               {new Date(order.date).toLocaleDateString('fa-IR')} | کد: {order.id.slice(-6).toUpperCase()}
                            </div>
                          </div>
                       </div>
                       <div className="text-left">
                          <div className="text-sm font-black text-indigo-600">{order.totalPaid.toLocaleString()} ت</div>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full mt-1 inline-block ${order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                             {order.status === 'delivered' ? 'تحویل شده' : 'در جریان'}
                          </span>
                       </div>
                    </div>
                 ))}
              </div>

              <button 
                onClick={() => setSelectedCustomer(null)}
                className="w-full mt-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl"
              >
                بستن پروفایل مشتری
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default MiniCRM;
