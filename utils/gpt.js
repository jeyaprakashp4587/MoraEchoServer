import dotenv from "dotenv";
import OpenAI from "openai";
import { fillTemplate } from "./fillTemplate.js";
import DB1 from "../DB/DB1.js";
dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.GPT_API_KEY,
});

export const getGPTResponse = async (chatType = "Mora", person, newMessage) => {
  try {
    // Fetch model by name

    const modelData =
      typeof chatType === "string"
        ? await DB1.collection("models").findOne({ title: chatType })
        : chatType;
    if (!modelData) throw new Error("AI Model not found");

    // Fill the prompt
    const finalPrompt = fillTemplate(modelData.promptTemplate, {
      name: person.name,
      RelUserName: person.RelUserName,
      relation: person.relation,
      behavior: person.behavior,
      language: person.language,
      nickname: person.nickname,
      message: newMessage,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: finalPrompt }],
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
};
