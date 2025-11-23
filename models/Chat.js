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
    ChatType: {
      type: String,
      default: "Mora",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    chat: [
      {
        sender: {
          type: String,
          required: true,
        },
        message: {
          type: String,
        },
        audioUrl: String,
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
