import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const getGPTResponse = async (userText, userProfile) => {
  const prompt = `
You are speaking as ${userProfile.name}, who was very close to ${userProfile.userName}.
Respond in a loving and emotional way like a real human, in ${userProfile.language}.
User said: "${userText}"
`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    }
  );

  return response.data.choices[0].message.content.trim();
};
