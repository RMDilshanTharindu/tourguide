import { GoogleGenAI } from "@google/genai";
import { queryVectorDb } from "./queringVectors.js";

// Gemini init
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function chat(latestMessage, vectorDb, chatHistory = []) {

  try {
    // 1. Retrieve context
    console.log(" Retrieving context from knowledge base...");

    const contextChunks = await queryVectorDb(latestMessage, vectorDb);

    const context = contextChunks
      .map(c => c.text)
      .join("\n\n");

    console.log("Context ready");

    // 2. Generate response
    console.log("Generating response...");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
Context:
${context}

Chat History:
${JSON.stringify(chatHistory)}

User Question:
${latestMessage}

Answer clearly based on context. If not found, say you don't know.
      `
    });

    return response.text;

  } catch (err) {
    console.error("Chat error:", err);
  }
}