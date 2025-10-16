// controllers/passedOneController.js
// const axios = require("axios");
// const User = require("../models/User");
import User from "../models/User.js";
// const Person = require("../models/Person");
import Person from "../models/Person.js";
import axios from "axios";
export const createPerson = async (req, res) => {
  try {
    const {
      userId,
      name,
      relation,
      behavior,
      language,
      imageUrl,
      voiceSampleUrl,
    } = req.body;

    // 1️⃣ Upload the voice sample to ElevenLabs for cloning
    const voiceClone = await axios.post(
      "https://api.elevenlabs.io/v1/voices/add",
      {
        name: `${name}_${Date.now()}`,
        files: [voiceSampleUrl],
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const voiceId = voiceClone.data.voice_id;

    // 2️⃣ Save passed one details in DB
    const newPerson = await Person.create({
      name,
      relation,
      behavior,
      language,
      imageUrl,
      voiceSampleUrl,
      voiceId,
    });

    // 3️⃣ Link to user
    await User.findByIdAndUpdate(userId, { person: newPerson?._id });

    res.json({
      message: "Passed one created successfully",
      person: newPerson,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create passed one" });
  }
};
