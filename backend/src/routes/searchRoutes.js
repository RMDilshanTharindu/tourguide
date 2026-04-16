import express from "express";
import { queryVectorDb } from "../rag/queringVectors.js";
import { generateResponse } from "../rag/responseGenerator.js";
import console from "console";

const router = express.Router();

export default function (vectorDb) {

  router.post("/search/text", async (req, res) => {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      console.log("Searching:", query);

      const results = await queryVectorDb(query, vectorDb);
      console.log(results[0])
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