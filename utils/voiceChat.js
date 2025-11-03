import speechToText from "./Whisper.js";
import { getGPTResponse } from "./gpt.js";
import { cloneVoice } from "./voiceClone.js";

export const VoiceChatWithPerson = async (chatType, person, audioUrl) => {
  try {
    //  extract speen to text
    const userText = await speechToText(audioUrl);

    //  get gpt resonse
    const aiResponse = await getGPTResponse(chatType, person, userText);

    // clone voice
    const clonedVoiceUrl = await cloneVoice(aiResponse, person?.voiceId);
    return { audioUrl: clonedVoiceUrl };
  } catch (error) {
    console.error(error);
    return { msg: "error on generate voice" };
  }
};
