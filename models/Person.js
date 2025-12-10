// models/PassedOne.js
import mongoose from "mongoose";
import DB1 from "../DB/DB1.js";

const person = new mongoose.Schema({
  name: String,
  relation: String,
  behavior: String,
  language: String,
  imageUrl: String,
  voiceSampleUrl: String,
  voiceId: String,
  MemoryStory: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default DB1.model("Persons", person);
