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
  historyMessages = [],
  RemaindGoal
) => {
  try {
    let modelData = await getCache(`modelData:${chatType}`);
    if (!modelData) {
      const doc = await DB1.collection("models").findOne(
        { "models.title": chatType },
        { projection: { "models.$": 1 } }
      );

      modelData = doc?.models?.[0];
      if (!modelData) throw new Error("AI Model not found");

      await setCache(`modelData:${chatType}`, modelData, 1000);
    }
    let memoryPart = "";
    if (person.MemoryStory && person.MemoryStory.trim() !== "") {
      memoryPart = `Their story: ${person.MemoryStory}`;
    }

    const systemPrompt = fillTemplate(modelData?.promptTemplate, {
      name: person.name,
      RelUserName: person.RelUserName,
      relation: person.relation,
      behavior: person.behavior,
      language: person.language,
      nickname: person.nickname,
      MemoryStory: memoryPart,
    })
      .replace(/\s+/g, " ")
      .trim();

    const messages = [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: newMessage },
    ];

    if (RemaindGoal) {
      const goalRemainMsg = `This user forgot to complete their todo: ${RemaindGoal.todoName}. Please remind them.`;
      messages.push({ role: "system", content: goalRemainMsg });
    }

    const completion = await openai.chat.completions.create({
      model: modelData.modelName || "gpt-4o-mini",
      messages,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
};
