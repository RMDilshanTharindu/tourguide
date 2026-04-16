import express from "express";
import { queryVectorDb } from "../rag/queringVectors.js";
import { chat } from "../rag/chat.js";
import { generateResponse } from "../rag/responseGenerator.js";

const router = express.Router();

// in-memory session store
let chatSessions = {};

// GET CHAT HISTORY
router.get("/chat/history/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  const history = chatSessions[sessionId] || [];

  res.json({
    success: true,
    sessionId,
    history
  });
});


// CHAT API
export default function createChatRoutes(vectorDb) {

  router.post("/chat", async (req, res) => {
    try {
      const { sessionId, message, mode } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({
          error: "sessionId and message are required"
        });
      }

      // init session
      if (!chatSessions[sessionId]) {
        chatSessions[sessionId] = [];
      }

      const history = chatSessions[sessionId];

      // 1. save user message
      history.push({ role: "user", text: message });

      console.log("User:", message);

      // 2. retrieve context (RAG)
      const contextChunks = await queryVectorDb(message, vectorDb);

      // 3. build prompt using chat history + context
      const response = await chat(message, vectorDb, history, contextChunks);

      // 4. save assistant response
      history.push({ role: "assistant", text: response });

      res.json({
        success: true,
        sessionId,
        response,
        history
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Chat failed" });
    }
  });

  return router;
}