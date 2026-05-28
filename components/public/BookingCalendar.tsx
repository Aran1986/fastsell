
import React, { useState } from 'react';

interface BookingCalendarProps {
  availableSlots: string[];
  onSelect: (dateTime: string) => void;
  selectedDateTime: string | undefined;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ availableSlots, onSelect, selectedDateTime }) => {
  // شبیه‌سازی ۷ روز آینده
  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      label: date.toLocaleDateString('fa-IR', { weekday: 'long' }),
      dateStr: date.toLocaleDateString('fa-IR', { day: 'numeric', month: 'short' }),
      raw: date.toISOString().split('T')[0]
    };
  });

  const [selectedDay, setSelectedDay] = useState(days[0].raw);

  return (
    <div className="mt-6 space-y-6 animate-in fade-in duration-500 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
      <div className="space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">۱. انتخاب روز نوبت</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {days.map(day => (
            <button
              key={day.raw}
              onClick={() => setSelectedDay(day.raw)}
              className={`flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center transition-all border ${selectedDay === day.raw ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}`}
            >
              <span className="text-[9px] font-bold opacity-60 mb-1">{day.label}</span>
              <span className="text-sm font-black">{day.dateStr}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">۲. انتخاب ساعت آزاد</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {availableSlots.map(slot => {
            const currentFull = `${selectedDay} ${slot}`;
            return (
              <button
                key={slot}
                onClick={() => onSelect(currentFull)}
                className={`py-3 rounded-xl text-[11px] font-black border transition-all ${selectedDateTime === currentFull ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:bg-indigo-50'}`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
