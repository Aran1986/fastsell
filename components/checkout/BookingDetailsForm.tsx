
import React from 'react';

interface BookingDetailsFormProps {
  slot: string | null;
}

const BookingDetailsForm: React.FC<BookingDetailsFormProps> = ({ slot }) => {
  if (!slot) return null;
  return (
    <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start gap-4 animate-in slide-in-from-top-2 duration-300">
      <div className="text-2xl">📅</div>
      <div>
        <h4 className="font-black text-amber-900 text-sm mb-1">تایید زمان نوبت</h4>
        <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
          شما در حال رزرو نوبت برای ساعت <span className="bg-white px-2 py-0.5 rounded text-amber-600 mx-1">{slot}</span> هستید. لطفاً از حضور به موقع خود اطمینان حاصل کنید.
        </p>
      </div>
    </div>
  );
};

export default BookingDetailsForm;
