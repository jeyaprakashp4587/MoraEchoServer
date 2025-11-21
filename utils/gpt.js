import OpenAI from "openai";
import { fillTemplate } from "./fillTemplate.js";
import DB1 from "../DB/DB1.js";
import dotenv from "dotenv";
import { getCache, setCache } from "../Redis/redis.js";
dotenv.config();
const openai = new OpenAI({ apiKey: process.env.GPT_API_KEY });

export const getGPTResponse = async (
  chatType = "Mora",
  person,
  newMessage,
  historyMessages = []
) => {
  try {
    // Fetch model data
    const cachedModelData = await getCache("modelData");
    let modelData = cachedModelData;
    // console.log(cachedModelData);

    if (!cachedModelData) {
      const doc = await DB1.collection("models").findOne(
        { "models.title": chatType },
        { projection: { "models.$": 1 } }
      );
      const modelData = doc?.models?.[0];
      // console.log(modelData);

      if (!modelData) throw new Error("AI Model not found");
      await setCache("modelData", modelData, 1000);
    }
    // Build system prompt
    const systemPrompt = fillTemplate(modelData.promptTemplate, {
      name: person.name,
      RelUserName: person.RelUserName,
      relation: person.relation,
      behavior: person.behavior,
      language: person.language,
      nickname: person.nickname,
    })
      .replace(/\s+/g, " ")
      .trim();

    const messages = [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: newMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
};
