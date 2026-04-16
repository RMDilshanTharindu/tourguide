import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function chat(latestMessage, contextChunks, chatHistory = []) {

  try {

    console.log("Generating response...");

    const context = contextChunks.map(c => c.text).join("\n\n");

    const formattedHistory = chatHistory
      .map(m => `${m.role}: ${m.text}`)
      .join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
You are a helpful AI assistant for a tourism RAG system.

CONTEXT:
${context}

CHAT HISTORY:
${formattedHistory}

USER:
${latestMessage}

RULES:
- Use context if relevant
- If not found, say you don't know
- Be clear and concise
`
    });

    return response.text?.trim();

  } catch (err) {
    console.error("Chat error:", err);
  }
}