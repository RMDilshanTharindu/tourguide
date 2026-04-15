import { GoogleGenAI } from "@google/genai";

//Gemini init
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

//embedding for query
async function getEmbedding(text) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-2-preview",
    contents: [{ parts: [{ text }] }]
  });

  return response.embeddings[0].values;
}

//cosine similarity
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));

  return dot / (magA * magB);
}

//query function
export async function queryVectorDb(query, vectorDb = [], topK = 3) {
  const queryEmbedding = await getEmbedding(query);

  const scored = vectorDb.map(item => ({
    ...item,
    score: cosineSimilarity(queryEmbedding, item.embedding)
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}