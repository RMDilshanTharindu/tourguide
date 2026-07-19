import { GoogleGenAI } from "@google/genai";
import { getEmbedding } from "./embeddings.js";
import { getCollection } from "../config/chroma.js";

//Gemini init
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


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