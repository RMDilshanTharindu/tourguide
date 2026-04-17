import express from "express";
import { queryVectorDb } from "../rag/queringVectors.js";
import { chat } from "../rag/chat.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// temporary in-memory store (next step → MongoDB)
const chatSessions = {};

export default function createChatRoutes(vectorDb) {

  // protect routes
  router.use(authMiddleware);

  // ---------------- SET IMAGE CONTEXT ----------------
  router.post("/chat/set-image-context", (req, res) => {
    const userId = req.userId;
    const { imageContext } = req.body;

    if (!imageContext) {
      return res.status(400).json({
        error: "imageContext required"
      });
    }

    if (!chatSessions[userId]) {
      chatSessions[userId] = {
        history: [],
        imageContext: null
      };
    }

    chatSessions[userId].imageContext = imageContext;

    res.json({
      success: true,
      message: "Image context stored",
      imageContext
    });
  });

  // ---------------- CHAT ----------------
  router.post("/chat", async (req, res) => {
    try {
      const userId = req.userId;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          error: "message is required"
        });
      }

      // init session
      if (!chatSessions[userId]) {
        chatSessions[userId] = {
          history: [],
          imageContext: null
        };
      }

      const session = chatSessions[userId];

      // save user message
      session.history.push({ role: "user", text: message });

      // build query
      const query = session.imageContext
        ? `${message} ${session.imageContext}`
        : message;

      const contextChunks = await queryVectorDb(query, vectorDb);

      const response = await chat(
        message,
        contextChunks,
        session.history,
        session.imageContext
      );

      // save response
      session.history.push({ role: "assistant", text: response });

      res.json({
        success: true,
        response,
        imageContext: session.imageContext,
        history: session.history
      });

    } catch (err) {
      console.error("Chat error:", err);
      res.status(500).json({ error: "Chat failed" });
    }
  });

  // ---------------- HISTORY ----------------
  router.get("/chat/history", (req, res) => {
    const userId = req.userId;

    const session = chatSessions[userId];

    if (!session) {
      return res.json({
        success: true,
        history: [],
        imageContext: null
      });
    }

    res.json({
      success: true,
      history: session.history,
      imageContext: session.imageContext
    });
  });

  return router;
}