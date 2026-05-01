//THIS JUST FOR TESTING NEED TO REMOVE LATER
import express from "express";
import { queryVectorDb } from "../rag/queringVectors.js";
import { generateResponse } from "../rag/responseGenerator.js";
import console from "console";
import { chatRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

export default function () {

  router.post("/search/text",chatRateLimiter, async (req, res) => {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      console.log("Searching:", query);

      const results = await queryVectorDb(query);
      console.log("Fettched Results: (First 3) ")
      console.log("DOC 1 :\n" ,results[0]);
      console.log("DOC 2 :\n" ,results[1]);
      console.log("DOC 3 :\n" ,results[2]);
      console.log("Generating Final response using returned chunks.....")
      const finalResponse = await generateResponse(query, results);
      console.log("Answer generated...........")

      res.json({
        success: true,
        data: finalResponse
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
}