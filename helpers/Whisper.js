import axios from "axios";
import dotenv from "dotenv";
import OpenAI, { toFile } from "openai";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.GPT_API_KEY,
// });

const speechToText = async (audioUrl) => {
  try {
    // --- open ai
    // // Download audio  buffer
    // const audioResponse = await axios.get(audioUrl, {
    //   responseType: "arraybuffer",
    // });

    // const audioBuffer = Buffer.from(audioResponse.data);

    // const audioFile = await toFile(audioBuffer, "audio.mp3");

    // // transcribe
    // const transcription = await openai.audio.transcriptions.create({
    //   file: audioFile,
    //   model: "gpt-4o-mini-transcribe",
    // });

    // return transcription.text;

    // elevenlabs
    const response = await fetch(
      "https://storage.googleapis.com/eleven-public-cdn/audio/marketing/nicole.mp3"
    );
    const audioBlob = new Blob([await response.arrayBuffer()], {
      type: "audio/mp3",
    });

    const elevenlab = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
    const transcription = await elevenlab.speechToText.convert({
      file: audioBlob,
      modelId: "scribe_v2",
      tagAudioEvents: true,
      languageCode: "eng",
      diarize: true,
    });
    console.log(transcription);
  } catch (err) {
    console.error("STT error:", err);
    return { msg: "Error in speechToText" };
  }
};

export default speechToText;
