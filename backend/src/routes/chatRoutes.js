import express from "express";
import { queryVectorDb } from "../rag/queringVectors.js";
import { chat } from "../rag/chat.js";

const router = express.Router();

// in-memory session store
const chatSessions = {};

/*
Session structure:
chatSessions[sessionId] = {
  history: [],
  imageContext: null
}
*/

export default function createChatRoutes(vectorDb) {

  
  // SET / UPDATE IMAGE CONTEXT
    router.post("/chat/set-image-context", (req, res) => {
    const { sessionId, imageContext } = req.body;

    if (!sessionId || !imageContext) {
      return res.status(400).json({
        error: "sessionId and imageContext required"
      });
    }

    if (!chatSessions[sessionId]) {
      chatSessions[sessionId] = {
        history: [],
        imageContext: null
      };
    }

    chatSessions[sessionId].imageContext = imageContext;

    res.json({
      success: true,
      message: "Image context stored",
      imageContext
    });
  });

  
  // CHAT API
    router.post("/chat", async (req, res) => {
    try {
      const { sessionId, message } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({
          error: "sessionId and message are required"
        });
      }

      // init session
      if (!chatSessions[sessionId]) {
        chatSessions[sessionId] = {
          history: [],
          imageContext: null
        };
      }

      const session = chatSessions[sessionId];

      // save user message
      session.history.push({ role: "user", text: message });

      // build query (RAG + image context)
      const query = session.imageContext
        ? `${message} ${session.imageContext}`
        : message;

      // retrieve context
      const contextChunks = await queryVectorDb(query, vectorDb);

      // generate response
      const response = await chat(
        message,
        contextChunks,
        session.history,
        session.imageContext
      );

      // save assistant response
      session.history.push({ role: "assistant", text: response });

      res.json({
        success: true,
        sessionId,
        response,
        imageContext: session.imageContext,
        history: session.history
      });

    } catch (err) {
      console.error("Chat error:", err);
      res.status(500).json({ error: "Chat failed" });
    }
  });

  // GET CHAT HISTORY
  
  router.get("/chat/history/:sessionId", (req, res) => {
    const { sessionId } = req.params;

    const session = chatSessions[sessionId];

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