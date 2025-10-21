import speechToText from "./Whisper.js";
import { getGPTResponse } from "./gpt.js";
import { cloneVoice } from "./voiceClone.js";

export const VoiceChatWithPerson = async (person, audioUrl) => {
  try {
    // 1️⃣ Extract speech
    const userText = await speechToText(audioUrl);

    // 2️⃣ GPT Response
    const aiResponse = await getGPTResponse(person, userText);

    // 3️⃣ Clone Voice
    const clonedVoiceUrl = await cloneVoice(aiResponse, person?.voiceId);
    return { audioUrl: clonedVoiceUrl };
  } catch (error) {
    console.error(error);
    return { msg: "error on generate voice" };
  }
};
