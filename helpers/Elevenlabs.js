import axios from "axios";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloneVoice = async (text, voiceId) => {
  try {
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

    const tempFilePath = `./temp/output_${Date.now()}.mp3`;
    fs.writeFileSync(tempFilePath, response.data);

    const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: "video",
      folder: "ME GeneratedPersonVoices",
    });

    fs.unlinkSync(tempFilePath);

    return uploadResult.secure_url;
  } catch (error) {
    return { msg: "error on generate" };
  }
};
