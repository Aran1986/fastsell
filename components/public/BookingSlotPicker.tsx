
import React from 'react';

interface BookingSlotPickerProps {
  slots: string[];
  selectedSlot: string | undefined;
  onSelect: (slot: string) => void;
}

const BookingSlotPicker: React.FC<BookingSlotPickerProps> = ({ slots, selectedSlot, onSelect }) => {
  if (!slots || slots.length === 0) return null;

  return (
    <div className="mt-6 space-y-3 animate-in fade-in duration-500">
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">انتخاب ساعت رزرو:</p>
       <div className="flex flex-wrap gap-2">
          {slots.map(slot => (
            <button 
              key={slot} 
              type="button"
              onClick={() => onSelect(slot)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${selectedSlot === slot ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-indigo-200'}`}
            >
              {slot}
            </button>
          ))}
       </div>
    </div>
  );
};

export default BookingSlotPicker;
