
import { GoogleGenAI, Type } from "@google/genai";

// Always initialize GoogleGenAI with a named parameter for the API key.
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

export const generateProductSuggestions = async (niche: string) => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `List 3 popular products people sell in the ${niche} niche. Return JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            suggestedPrice: { type: Type.NUMBER }
                        },
                        required: ["name", "suggestedPrice"]
                    }
                }
            }
        });
        const text = response.text;
        return text ? JSON.parse(text) : [];
    } catch (error) {
        console.error("Gemini Suggestions Error:", error);
        return [];
    }
}
