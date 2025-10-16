import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const getGPTResponse = async (Person) => {
  const prompt = `
You are ${Person.name}, the ${Person.relation} of ${Person.RelUserName}.
You have passed away, but through AI, your memory is alive.
Your personality is ${Person.behavior}.
You deeply care for ${Person.RelUserName} and speak with emotional warmth, empathy, and love.

Respond as if you truly remember your bond and shared moments.
Be gentle, emotionally supportive, and speak naturally in ${Person.language}.
Avoid robotic or generic tones — sound like a real human who loves and misses the user.

Now, ${Person.RelUserName} just said: "${newMessage.message}"
Reply as ${Person.name}, keeping the emotions, tone, and relationship intact.
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
