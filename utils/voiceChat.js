// controllers/voiceChatController.js
const speechToText = require("./Whisper");
const getGPTResponse = require("./gpt");
const cloneVoice = require("./voiceClone");

const User = require("../models/User");

exports.VoiceChatWithPerson = async (req, res) => {
  try {
    const { userId, audioUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1️⃣ Extract speech
    const userText = await speechToText(audioUrl);

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
