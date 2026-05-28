
import { GoogleGenAI } from "@google/genai";
import { StoreMode } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (name: string, mode: StoreMode): Promise<string> => {
  const ai = getAI();
  let instruction = "";
  
  if (mode === StoreMode.PRODUCT) {
    instruction = `یک متن تبلیغاتی کوتاه (حداکثر ۲ جمله) برای فروش کالای "${name}" بنویسید که روی کیفیت و ارسال متمرکز باشد.`;
  } else if (mode === StoreMode.SERVICE) {
    instruction = `یک متن جذاب برای معرفی خدمات "${name}" بنویسید که روی تخصص و نتیجه نهایی تمرکز کند. (مثلاً برای کلاس آموزشی یا خدمات فنی)`;
  } else if (mode === StoreMode.BOOKING) {
    instruction = `یک متن ترغیب‌کننده برای رزرو نوبت "${name}" بنویسید که روی تجربه عالی و نظم در زمان‌بندی تاکید کند. (مثلاً برای آرایشگاه یا مشاوره)`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: instruction + " فقط متن فارسی برگردانید.",
      config: { temperature: 0.7 }
    });
    return response.text?.trim() || "تجربه‌ای متفاوت و حرفه‌ای با ما.";
  } catch (error) {
    return "بهترین کیفیت در ارائه خدمات و محصولات.";
  }
};

export const summarizeReviews = async (reviews: string[]): Promise<string> => {
  if (!reviews || reviews.length === 0) return "هنوز نظری ثبت نشده است.";
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `این نظرات مشتریان است. در ۲ جمله کوتاه به زبان فارسی تحلیل کنید خریداران به طور کلی چه حسی دارند: \n${reviews.join('\n')}`,
    });
    return response.text?.trim() || "رضایت مشتریان در سطح بالایی قرار دارد.";
  } catch (e) {
    return "تحلیل نظرات مقدور نیست.";
  }
};

export const checkReviewSpam = async (text: string): Promise<{ isSpam: boolean; reason?: string }> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `آیا این نظر اسپم یا بی‌ربط است؟ پاسخ فقط JSON: {"isSpam": boolean, "reason": "فارسی"}. متن: "${text}"`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{"isSpam": false}');
  } catch (e) {
    return { isSpam: false };
  }
};
