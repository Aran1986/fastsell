
import { GoogleGenAI, Type } from "@google/genai";

// Always initialize GoogleGenAI with a named parameter for the API key.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (productName: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a persuasive, short, and catchy sales description for a product named "${productName}". Keep it under 2 sentences.`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      },
    });
    // response.text is a getter property that returns the string output.
    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Amazing product that you will love!";
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
