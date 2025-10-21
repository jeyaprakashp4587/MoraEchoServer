// models/PassedOne.js
const mongoose = require("mongoose");
const { DB1 } = require("../DB/DB1");

const person = new mongoose.Schema({
  name: String,
  relation: String, // ex: "mother", "friend", "lover"
  behavior: String, // like "kind, calm, humorous"
  language: String, // "tamil", "english"
  imageUrl: String, // from Cloudinary
  voiceSampleUrl: String, // user uploaded voice
  voiceId: String, // saved after cloning in ElevenLabs
  createdAt: { type: Date, default: Date.now },
});

module.exports = DB1.model("Person", person);
