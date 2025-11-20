import { GoogleGenAI, Type } from "@google/genai";
import { SkinToneAnalysis } from "../types";

const apiKey = process.env.API_KEY || ''; 
// Note: In a real app, we would handle the missing key more gracefully or use a proxy.
// For this specific task, we assume process.env.API_KEY is injected.

const ai = new GoogleGenAI({ apiKey });

export const analyzeSkinToneFromImage = async (base64Image: string): Promise<SkinToneAnalysis> => {
  try {
    // Clean base64 string if it has header
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const modelId = "gemini-2.5-flash"; // Using flash for speed on analysis
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: `Analyze the skin tone of the person in this image. 
            Determine if they have 'Cool', 'Warm', or 'Neutral' undertones.
            Provide a list of 3 hex codes to avoid and 3 hex codes that would look best on them.
            Be purely analytical based on color theory (vein color, skin pigment).`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tone: { 
              type: Type.STRING, 
              enum: ["Cool", "Warm", "Neutral"] 
            },
            reasoning: { type: Type.STRING },
            avoidColors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            bestColors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["tone", "reasoning", "avoidColors", "bestColors"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as SkinToneAnalysis;

  } catch (error) {
    console.error("Skin tone analysis failed:", error);
    // Fallback mock data if API fails (dev experience)
    return {
      tone: 'Neutral',
      reasoning: "Could not connect to analysis engine. Defaulting to Neutral.",
      avoidColors: ["#000000"],
      bestColors: ["#555555"]
    };
  }
};