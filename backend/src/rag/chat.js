import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function chat(
  latestMessage,
  contextChunks,
  chatHistory = [],
  imageContext = null
) {
  try {

    const context = contextChunks
      .map(c => c.text)
      .join("\n\n");

    const formattedHistory = chatHistory
      .map(m => `${m.role}: ${m.text}`)
      .join("\n");

    const imageBlock = imageContext
      ? `IMAGE CONTEXT: ${imageContext}`
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
You are a tourism AI assistant.

${imageBlock}

-------------------
CONTEXT:
${context}

-------------------
CHAT HISTORY:
${formattedHistory}

-------------------
USER MESSAGE:
${latestMessage}

RULES:
- If image context exists, prioritize it strongly
- Answer natural follow-up questions like location, history, etc.
- Use context when available
- If unknown, say you don't know
- Be concise and helpful
`
    });

    return response.text?.trim();

  } catch (err) {
    console.error("Chat error:", err);
  }
}