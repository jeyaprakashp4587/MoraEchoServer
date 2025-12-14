import axios from "axios";
import dotenv from "dotenv";
import OpenAI, { toFile } from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const speechToText = async (audioUrl) => {
  try {
    // 1️⃣ Download audio as buffer
    const audioResponse = await axios.get(audioUrl, {
      responseType: "arraybuffer",
    });

    const audioBuffer = Buffer.from(audioResponse.data);

    // 2️⃣ Convert buffer → File (in memory)
    const audioFile = await toFile(audioBuffer, "audio.mp3");

    // 3️⃣ Transcribe
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "gpt-4o-mini-transcribe",
    });

    return transcription.text;
  } catch (err) {
    console.error("STT error:", err);
    return { msg: "Error in speechToText" };
  }
};

export default speechToText;
