import express from "express";
import mongoose from "mongoose";
import DB1 from "../DB/DB1.js";

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Persons",
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
export default DB1.model("Chats", chatSchema);
