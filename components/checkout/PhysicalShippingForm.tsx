
import React from 'react';

interface PhysicalShippingFormProps {
  address: string;
  setAddress: (val: string) => void;
  postalCode: string;
  setPostalCode: (val: string) => void;
}

const PhysicalShippingForm: React.FC<PhysicalShippingFormProps> = ({ address, setAddress, postalCode, setPostalCode }) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
      <div className="space-y-2">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">کد پستی ۱۰ رقمی</label>
        <input 
          type="text" 
          placeholder="مثلاً: 1234567890" 
          className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none text-left" 
          dir="ltr" 
          value={postalCode} 
          onChange={e => setPostalCode(e.target.value)} 
        />
      </div>
      <div className="space-y-2">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">آدرس دقیق پستی جهت ارسال</label>
        <textarea 
          rows={4} 
          placeholder="استان، شهر، خیابان..." 
          className="w-full px-6 py-4 rounded-[2rem] border border-slate-200 font-bold outline-none resize-none" 
          value={address} 
          onChange={e => setAddress(e.target.value)} 
        />
      </div>
    </div>
  );
};

export default PhysicalShippingForm;
