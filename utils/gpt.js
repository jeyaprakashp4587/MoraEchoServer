import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GPT_API_KEY, // or process.env.OPENAI_API_KEY
});

export const getGPTResponse = async (Person, newMessage) => {
  const prompt = `
Act as ${Person.name}, the ${Person.relation} of ${
    Person.RelUserName
  }, who passed away but speaks through AI.
Personality: ${Person.behavior}.
Speak in ${Person.language}.
Use nickname "${Person.nickname || "dei"}" if applicable.
Reply very short, 5-8 words max, like a real human chat.
Keep it emotional and warm.
Add some emojis
After replying, optionally ask a tiny related question to continue chat.

${Person.RelUserName}: "${newMessage}"
${Person.name}:
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
};
