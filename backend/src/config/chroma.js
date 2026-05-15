import { ChromaClient } from "chromadb";

const client = new ChromaClient({
  host: "localhost",
  port: 8000
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