import express from "express";
import { queryVectorDb } from "../rag/queringVectors.js";
import { chat } from "../rag/chat.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Chat from "../models/Chat.js";

const router = express.Router();

export default function createChatRoutes(vectorDb) {

  // protect routes
  router.use(authMiddleware);

  // ---------------- CREATE CHAT ----------------
  router.post("/chat/create", async (req, res) => {
    try {
      const userId = req.userId;

      const newChat = new Chat({
        userId,
        title: "New Chat",
        messages: [],
        imageContext: null
      });

      await newChat.save();

      res.json({
        success: true,
        chatId: newChat._id
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create chat" });
    }
  });

  // ---------------- LIST CHATS ----------------
  router.get("/chat", async (req, res) => {
    try {
      const userId = req.userId;

      const chats = await Chat.find({ userId })
        .select("_id title createdAt updatedAt")
        .sort({ updatedAt: -1 });

      res.json({
        success: true,
        chats
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch chats" });
    }
  });

  // ---------------- GET CHAT HISTORY ----------------
  router.get("/chat/:chatId", async (req, res) => {
    try {
      const userId = req.userId;
      const { chatId } = req.params;

      const chatDoc = await Chat.findOne({ _id: chatId, userId });

      if (!chatDoc) {
        return res.status(404).json({ error: "Chat not found" });
      }

      res.json({
        success: true,
        history: chatDoc.messages,
        imageContext: chatDoc.imageContext
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch chat" });
    }
  });

  // ---------------- SEND MESSAGE ----------------
  router.post("/chat/:chatId", async (req, res) => {
    try {
      const userId = req.userId;
      const { chatId } = req.params;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "message required" });
      }

      const chatDoc = await Chat.findOne({ _id: chatId, userId });

      if (!chatDoc) {
        return res.status(404).json({ error: "Chat not found" });
      }

      // save user message
      chatDoc.messages.push({ role: "user", text: message });

      // build query
      const query = chatDoc.imageContext
        ? `${message} ${chatDoc.imageContext}`
        : message;

      const contextChunks = await queryVectorDb(query, vectorDb);

      const response = await chat(
        message,
        contextChunks,
        chatDoc.messages,
        chatDoc.imageContext
      );

      // save AI response
      chatDoc.messages.push({ role: "assistant", text: response });

      // auto-generate title if first message
      if (chatDoc.messages.length === 2) {
        chatDoc.title = message.slice(0, 30);
      }

      await chatDoc.save();

      res.json({
        success: true,
        response,
        history: chatDoc.messages,
        imageContext: chatDoc.imageContext
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Chat failed" });
    }
  });

  // ---------------- SET IMAGE CONTEXT ----------------
  router.post("/chat/:chatId/image-context", async (req, res) => {
    try {
      const userId = req.userId;
      const { chatId } = req.params;
      const { imageContext } = req.body;

      if (!imageContext) {
        return res.status(400).json({ error: "imageContext required" });
      }

      const chatDoc = await Chat.findOne({ _id: chatId, userId });

      if (!chatDoc) {
        return res.status(404).json({ error: "Chat not found" });
      }

      chatDoc.imageContext = imageContext;

      await chatDoc.save();

      res.json({
        success: true,
        imageContext
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to set image context" });
    }
  });

  return router;
}