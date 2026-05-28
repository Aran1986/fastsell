
import React from 'react';

const ServiceAccessForm: React.FC = () => {
  return (
    <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-start gap-4 animate-in slide-in-from-top-2 duration-300">
      <div className="text-2xl">🎓</div>
      <div>
        <h4 className="font-black text-indigo-900 text-sm mb-1">دسترسی آنی به خدمات</h4>
        <p className="text-[10px] text-indigo-600 font-bold leading-relaxed">
          پس از پرداخت موفق، لینک ورود به دوره یا فایل‌های آموزشی به صورت خودکار به ایمیل شما ارسال خواهد شد.
        </p>
      </div>
    </div>
  );
};

export default ServiceAccessForm;
