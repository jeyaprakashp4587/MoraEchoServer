// controllers/passedOneController.js
// const axios = require("axios");
// const User = require("../models/User");
import User from "../models/User.js";
// const Person = require("../models/Person");
import Person from "../models/Person.js";
import axios from "axios";
import FormData from "form-data";
export const createPerson = async (req, res) => {
  try {
    const { name, relation, behavior, language, imageUrl, voiceSampleUrl } =
      req.body.data;

    // host the voice and send to eleven labs

    // 1️⃣ Fetch the audio from Cloudinary
    // const audioResponse = await axios.get(voiceSampleUrl, {
    //   responseType: "stream",
    // });

    // // 2️⃣ Prepare FormData
    // const formData = new FormData();
    // formData.append("name", `${name}_${Date.now()}`);
    // formData.append("files", audioResponse.data, {
    //   filename: "voice.mp3",
    //   contentType: "audio/mpeg",
    // });

    // // 3️⃣ Send to ElevenLabs
    // const voiceClone = await axios.post(
    //   "https://api.elevenlabs.io/v1/voices/add",
    //   formData,
    //   {
    //     headers: {
    //       "xi-api-key": process.env.ELEVENLABS_API_KEY,
    //       ...formData.getHeaders(),
    //     },
    //   }
    // );

    // const voiceId = voiceClone.data.voice_id;
    // console.log("Voice id", voiceId);

    // 2️⃣ Save passed one details in DB
    const newPerson = await Person.create({
      name,
      relation,
      behavior,
      language,
      imageUrl,
      voiceSampleUrl,
      // voiceId,
    });

    // 3️⃣ Link to user
    await User.findByIdAndUpdate(
      req.userId,
      {
        $push: { persons: newPerson._id },
      },

      { new: true }
    );

    res.json({
      message: "Passed one created successfully",
      person: newPerson,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create passed one" });
  }
};
