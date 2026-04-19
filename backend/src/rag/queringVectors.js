import { GoogleGenAI } from "@google/genai";
import { getEmbedding } from "./embeddings.js";
import { getCollection } from "../config/chroma.js";

//Gemini init
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

//embedding for query
// async function getEmbedding(text) {
//   const response = await ai.models.embedContent({
//     model: "gemini-embedding-2-preview",
//     contents: [{ parts: [{ text }] }]
//   });

//   return response.embeddings[0].values;
// }

//cosine similarity
// function cosineSimilarity(a, b) {
//   const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
//   const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
//   const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));

//   return dot / (magA * magB);
// }

//query function
export async function queryVectorDb(query) {
  
  const collection = await getCollection();

  const queryEmbedding = await getEmbedding(query);

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: 3
  });

  return results.documents[0];

}