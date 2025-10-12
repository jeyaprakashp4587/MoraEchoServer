import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

export const cloneVoice = async (text, voiceId) => {
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.9,
      },
    },
    {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    }
  );

  const filePath = `./temp/output_${Date.now()}.mp3`;
  fs.writeFileSync(filePath, response.data);

  // You can re-upload to Cloudinary and return the URL here
  // For now, just return local file path (for testing)
  return filePath;
};
