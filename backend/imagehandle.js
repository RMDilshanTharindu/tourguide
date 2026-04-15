import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function identifyImageSubject(base64Image,mimeType = "image/jpeg"){

    // 1. Identify image
    const identificationResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Image
            }
          },
          { text: 'Identify what is in this image. Give a short, concise name or description (e.g., "Sigiriya Rock Fortress").' }
        ]
      }
    });

    const identifiedSubject = identificationResponse.text?.trim() || 'Unknown subject';
    console.log('Identified subject:', identifiedSubject);

    return identifiedSubject;

}