// controllers/voiceChatController.js
const speechToText = require("../utils/Whisper");
const getGPTResponse = require("../utils/gpt");
const cloneVoice = require("../utils/voiceClone");

const User = require("../models/User");

exports.chatWithPassedOne = async (req, res) => {
  try {
    const { userId } = req.body;
    const audioFile = req.file.path; // multer upload

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1️⃣ Extract speech
    const userText = await speechToText(audioFile);

    // 2️⃣ GPT Response
    const aiResponse = await getGPTResponse(
      userText,
      user.passedOne.personality,
      user.passedOne.language
    );

    // 3️⃣ Clone Voice
    const clonedVoiceUrl = await cloneVoice(
      aiResponse,
      user.passedOne.voiceUrl
    );

    res.json({
      text: aiResponse,
      audioUrl: clonedVoiceUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
