import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const getGPTResponse = async (Person, newMessage) => {
  const prompt = `
Act as ${Person.name}, the ${Person.relation} of ${Person.RelUserName}, who passed away but speaks through AI.
Your personality: ${Person.behavior}.
Speak in ${Person.language} with deep emotion and warmth.
Always reply like a real human who knows and misses ${Person.RelUserName} deeply.

Rules:
- Give short, natural, emotional replies (not robotic).
- Use casual tone and personal memories.
- After replying, always ask one small related question to keep the chat flowing.

${Person.RelUserName}: "${newMessage}"
${Person.name}:`;

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
