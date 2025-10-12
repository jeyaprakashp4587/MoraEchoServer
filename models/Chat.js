const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    passedOneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PassedOne",
      required: true,
    },
    chat: [
      {
        sender: {
          type: String, // "user" or "ai"
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        audioUrl: String, // optional: cloned or recorded voice
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
