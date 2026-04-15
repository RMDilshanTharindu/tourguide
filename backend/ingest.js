import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

//Gemini init
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const folderPath = "./uploads";

//embedding function
async function getEmbedding(text) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-2-preview",
    contents: [{ parts: [{ text }] }]
  });

  return response.embeddings[0].values;
}

//chunking
function chunkText(content, chunkSize = 500, overlap = 50) {
  const chunks = [];
  let start = 0;

  while (start < content.length) {
    const end = Math.min(start + chunkSize, content.length);
    chunks.push(content.substring(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
}

//ingestion pipeline
export async function ingestion() {
  const vectorDb = []; // local DB (clean & safe)

  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const content = fs.readFileSync(filePath, "utf-8");

    const chunks = chunkText(content);

    const items = await Promise.all(
      chunks.map(async (text, index) => {
        const embedding = await getEmbedding(text);

        return {
          id: `${file}-${index}`,
          text,
          embedding,
          metadata: { filename: file }
        };
      })
    );

    vectorDb.push(...items);

    console.log(`Ingested: ${file} | chunks: ${chunks.length}`);
  }

  return vectorDb;
}