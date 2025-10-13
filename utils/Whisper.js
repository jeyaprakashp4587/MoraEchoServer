import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
// dotenv
dotenv.config();

const speechToText = async (audioBuffer) => {
  const formData = new FormData();
  formData.append("file", audioBuffer, "audio.mp3");
  formData.append("model", "gpt-4o-mini-transcribe");

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
};
export default speechToText;
