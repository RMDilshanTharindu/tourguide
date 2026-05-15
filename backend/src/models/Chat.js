import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true
  },
  text: {
    type: String,
    required: true
  }
});

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      default: "New Chat"
    },

    messages: [messageSchema],

    imageContext: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);