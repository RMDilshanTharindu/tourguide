import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";



// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const folderPath = "./uploads";

// simple in-memory vector DB
let vectorDb = [];

// embedding function
async function getEmbedding(text) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-2-preview",
    contents: [{ parts: [{ text }] }],
  });
  return response.embeddings[0].values;
}

// chunking function (clean separation)
function chunkText(content, chunkSize = 500, chunkOverlap = 50) {
  const chunks = [];
  let start = 0;

  while (start < content.length) {
    const end = Math.min(start + chunkSize, content.length);
    chunks.push(content.substring(start, end));
    start += chunkSize - chunkOverlap;
  }

  return chunks;
}

// ingestion pipeline
async function ingestion() {
  try {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);

      // prevent EISDIR error
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) continue;

      const content = fs.readFileSync(filePath, "utf-8");

      // chunking
      const chunks = chunkText(content);

      // embedding + storing
      const items = await Promise.all(
        chunks.map(async (text, index) => {
          const embedding = await getEmbedding(text);

          return {
            id: `${file}-${index}-${Date.now()}`, //use 'file'
            text,
            embedding,
            metadata: { filename: file }
          };
        })
      );

      console.log(items[0])
      vectorDb.push(...items);

      console.log(`File ingested: ${file}`);
      console.log("chunksProcessed:", chunks.length);
      console.log("totalVectors:", vectorDb.length);
      console.log("------------------------------------------------");
    }
  } catch (err) {
    console.error("Error during ingestion:", err);
  }
}

// run
ingestion();