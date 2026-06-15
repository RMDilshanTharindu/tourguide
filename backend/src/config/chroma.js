import { ChromaClient } from "chromadb";

// Use the environment variable if it exists, otherwise fall back to localhost
const chromaHost = process.env.CHROMA_HOST || "localhost";
const chromaPort = process.env.CHROMA_PORT || 8000;

const client = new ChromaClient({
  host: chromaHost,
  port: parseInt(chromaPort, 10)
});

let collection;

export async function getCollection() {
  if (!collection) {
    collection = await client.getOrCreateCollection({
      name: "tourguide1",
      embeddingFunction: null,
      metadata: {
        "hnsw:space": "cosine"
      }
    });
  }
  return collection;
}