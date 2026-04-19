import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function getEmbedding(text) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-2-preview",
    contents: [{ parts: [{ text }] }]
  });

  return response.embedding?.values
      || response.embeddings?.[0]?.values
      || response.data?.[0]?.embedding
      || null;
}