import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
// dotenv
dotenv.config();

const speechToText = async (audioUrl) => {
  try {
    // 1️⃣ Fetch audio from the URL as a buffer
    const audioResponse = await axios.get(audioUrl, {
      responseType: "arraybuffer", // important
    });
    const audioBuffer = Buffer.from(audioResponse.data, "binary");

    // 2️⃣ Create form data for OpenAI
    const formData = new FormData();
    formData.append("file", audioBuffer, "audio.mp3"); // You can keep mp3 as filename
    formData.append("model", "gpt-4o-mini-transcribe");

    // 3️⃣ Send to OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
      }
    );

    return response.data.text;
  } catch (error) {
    console.error("Error in speechToText:", error.message);
    throw error;
  }
};

export default speechToText;
