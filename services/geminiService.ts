
import { GoogleGenAI, Type } from "@google/genai";
import { ProcessingResult } from "../types";

export const transcribeVideo = async (
  file: File,
  sourceLang: string,
  targetLang: string
): Promise<Omit<ProcessingResult, 'id' | 'fileName' | 'date' | 'sourceLang' | 'targetLang'>> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });

  const prompt = `
    You are a professional video transcriber.
    1. Transcribe the dialogue exactly. Source language: ${sourceLang}.
    2. Translate it into ${targetLang}.
    3. Format with [MM:SS] timestamps.
    4. Provide a 2-sentence SEO-friendly summary.
    Output only JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType: file.type } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          segments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.STRING },
                originalText: { type: Type.STRING },
                translatedText: { type: Type.STRING }
              },
              required: ["timestamp", "originalText", "translatedText"]
            }
          },
          summary: { type: Type.STRING }
        },
        required: ["segments"]
      }
    }
  });

  const result = JSON.parse(response.text || '{}');
  return result;
};
