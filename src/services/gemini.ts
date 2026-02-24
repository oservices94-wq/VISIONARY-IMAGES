import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export interface ImageGenerationOptions {
  prompt: string;
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
}

export const generateImage = async (options: ImageGenerationOptions): Promise<string> => {
  const ai = getAI();
  const model = "gemini-2.5-flash-image";

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          text: options.prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: options.aspectRatio || "1:1",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString = part.inlineData.data;
      return `data:image/png;base64,${base64EncodeString}`;
    }
  }

  throw new Error("No image data returned from the model");
};
