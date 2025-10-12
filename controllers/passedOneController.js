// controllers/passedOneController.js
const axios = require("axios");
const PassedOne = require("../models/PassedOne");
const User = require("../models/User");

exports.createPassedOne = async (req, res) => {
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
    const newPassedOne = await PassedOne.create({
      name,
      relation,
      behavior,
      language,
      imageUrl,
      voiceSampleUrl,
      voiceId,
    });

    // 3️⃣ Link to user
    await User.findByIdAndUpdate(userId, { passedOne: newPassedOne._id });

    res.json({
      message: "Passed one created successfully",
      passedOne: newPassedOne,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create passed one" });
  }
};
