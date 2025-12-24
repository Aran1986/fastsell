
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (productName: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `شما یک کپی‌رایتر حرفه‌ای فروشگاه‌های اینترنتی هستید. یک متن کوتاه، متقاعدکننده و جذاب برای محصولی به نام "${productName}" بنویسید. متن باید حداکثر ۲ جمله باشد و خریدار را ترغیب به خرید کند. فقط متن فارسی برگردانید.`,
      config: {
        temperature: 0.8,
        topP: 0.9,
      },
    });
    return response.text?.trim() || "محصولی با کیفیت عالی که قطعا عاشقش خواهید شد!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "یک انتخاب فوق‌العاده برای شما!";
  }
};

export const summarizeReviews = async (reviews: string[]): Promise<string> => {
  if (!reviews || reviews.length === 0) return "هنوز نظری ثبت نشده است.";
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `این نظرات مشتریان در مورد یک محصول است. لطفا آن‌ها را تحلیل کرده و در ۲ جمله کوتاه به زبان فارسی بگویید خریداران به طور کلی چه حسی دارند و نقاط قوت اصلی چیست: \n${reviews.join('\n')}`,
      config: { temperature: 0.5 }
    });
    return response.text?.trim() || "خریداران از کیفیت محصول رضایت دارند.";
  } catch (e) {
    return "تحلیل نظرات در حال حاضر مقدور نیست.";
  }
};
