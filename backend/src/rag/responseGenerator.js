import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// helper: extract context text
function buildContext(chunks) {
  return chunks
    .map(c => c.text)
    .join("\n\n");
}

// helper: generate topic name (simple heuristic)
function extractTopic(query, chunks) {
  // fallback simple version (you can improve later)
  if (chunks?.length > 0) {
    return chunks[0].metadata?.filename?.replace(".txt", "") || "Unknown Topic";
  }
  return "General";
}

// MAIN FUNCTION
export async function generateResponse(query, chunks) {
  try {
    const context = buildContext(chunks);
    const topic = extractTopic(query, chunks);

    const prompt = `
You are an AI assistant for a RAG system.

Use ONLY the provided context to answer the question.

Return STRICT JSON in this format:
{
  "context-about": "<short topic name>",
  "response": "<final answer for user>"
}

Rules:
- Be concise
- If context is missing, say "I don't know from the documents"
- Do NOT add extra text outside JSON

Context:
${context}

User Question:
${query}
`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    const text = result.text;

    // try parsing JSON safely
    try {
      return JSON.parse(text);
    } catch (e) {
      return {
        "context-about": topic,
        response: text
      };
    }

  } catch (err) {
    console.error("Response Generator Error:", err);
    return {
      "context-about": "error",
      response: "Something went wrong while generating response."
    };
  }
}