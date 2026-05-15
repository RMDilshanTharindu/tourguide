const express = require("express");
const router = express.Router();

const File = require("../models/File");
const { generateEmbedding } = require("../utils/embedding");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const { generateAnswer } = require("../utils/generateAnswer");

// Cosine similarity function
const cosineSimilarity = (vecA, vecB) => {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

// Search route
router.post("/", protect, admin, async (req, res) => {
  try {
    const { query } = req.body;

    // 1. Convert query to embedding
    const queryEmbedding = await generateEmbedding(query);

    // 2. Get files with embeddings
    const files = await File.find({
      embedding: { $exists: true, $ne: [] },
    });

    // 3. Calculate similarity
    const results = files.map((file) => {
      const score = cosineSimilarity(queryEmbedding, file.embedding);
      return { file, score };
    });

    // 4. Sort
    results.sort((a, b) => b.score - a.score);

    const topResults = results.slice(0, 3);

    // 5. Build context from descriptions
    const context = topResults
      .map((r) => r.file.description || r.file.filename)
      .join("\n");

    // 6. Generate final AI answer (RAG)
    let answer = "";
    try {
      answer = await generateAnswer(query, context);
    } catch (err) {
      console.log("AI ANSWER FAILED:", err.message);
      answer = "AI service unavailable right now.";
    }

    res.json({
      query,
      answer,
      results: topResults,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;