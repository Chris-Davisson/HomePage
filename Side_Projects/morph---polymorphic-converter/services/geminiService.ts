import { GoogleGenAI, Type } from "@google/genai";
import { AiRecommendation, ConversionTarget } from "../types";

export const getConversionRecommendation = async (
  filename: string,
  targets: ConversionTarget[]
): Promise<AiRecommendation | null> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found for Gemini");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const targetExts = targets.map(t => t.ext).join(", ");

    const prompt = `
      I have a file named "${filename}".
      The available conversion targets are: ${targetExts}.
      Based on the file name and common usage patterns, which target format is the most likely desired output?
      For example, if it's a 'resume.docx', the user likely wants 'pdf'. If it's a raw video 'recording.mkv', they likely want 'mp4'.
      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedExt: { type: Type.STRING },
            reason: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AiRecommendation;
    }
    return null;

  } catch (error) {
    console.error("Gemini recommendation failed", error);
    return null;
  }
};